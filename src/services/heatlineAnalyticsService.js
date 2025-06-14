/**
 * 基于大数据的热力线分析服务
 * 科学计算景区道路热力值，替代简单的静态映射
 */
class HeatlineAnalyticsService {
  constructor() {
    // 初始化数据权重配置
    this.initializeWeights();
  }

  /**
   * 初始化各种权重配置
   */
  initializeWeights() {
    // 1. 道路类型基础权重（基于实际通行能力和安全性）
    this.roadTypeWeights = {
      'pedestrian': { base: 0.9, capacity: 100, safety: 0.95 },  // 步行街
      'footway': { base: 0.8, capacity: 80, safety: 0.9 },       // 人行道
      'path': { base: 0.7, capacity: 60, safety: 0.8 },          // 小径
      'cycleway': { base: 0.6, capacity: 40, safety: 0.85 },     // 自行车道
      'service': { base: 0.5, capacity: 30, safety: 0.7 },       // 服务道路
      'track': { base: 0.4, capacity: 20, safety: 0.6 },         // 小路
      'steps': { base: 0.2, capacity: 10, safety: 0.5 },         // 台阶
      'primary': { base: 0.3, capacity: 200, safety: 0.4 },      // 主要道路（车多）
      'secondary': { base: 0.35, capacity: 150, safety: 0.45 },  // 次要道路
      'residential': { base: 0.4, capacity: 50, safety: 0.6 }    // 住宅道路
    };

    // 2. 无障碍等级权重（更细化的评分）
    this.accessibilityWeights = {
      'yes': { multiplier: 1.3, bonus: 0.3 },      // 完全无障碍
      'limited': { multiplier: 1.1, bonus: 0.1 },  // 部分无障碍
      'no': { multiplier: 0.7, bonus: -0.3 },      // 不无障碍
      '未知': { multiplier: 1.0, bonus: 0 }        // 未知
    };

    // 3. 时间段权重（模拟不同时段的人流量）
    this.timeWeights = {
      'morning': { '06-08': 0.3, '08-10': 0.7, '10-12': 0.9 },
      'afternoon': { '12-14': 0.8, '14-16': 1.0, '16-18': 0.9 },
      'evening': { '18-20': 0.6, '20-22': 0.3 }
    };

    // 4. 用户类型权重
    this.userTypeWeights = {
      'wheelchair': {
        'steps': 0.1,      // 台阶对轮椅用户极不友好
        'path': 0.6,       // 小径可能不平整
        'footway': 0.9,    // 人行道较好
        'pedestrian': 1.0  // 步行街最好
      },
      'elderly': {
        'steps': 0.3,      // 老人爬台阶困难
        'path': 0.7,       // 小径可能不平
        'footway': 0.9,
        'pedestrian': 1.0
      },
      'family': {
        'steps': 0.5,      // 带小孩爬台阶不便
        'path': 0.8,
        'footway': 0.9,
        'pedestrian': 1.0
      },
      'normal': {
        'steps': 0.8,      // 正常人群
        'path': 0.9,
        'footway': 0.9,
        'pedestrian': 1.0
      }
    };

    // 5. 天气影响权重
    this.weatherWeights = {
      'sunny': 1.0,       // 晴天
      'cloudy': 0.9,      // 多云
      'rainy': 0.6,       // 雨天（户外路径热力下降）
      'snowy': 0.4        // 雪天
    };

    // 6. 设施密度权重（附近设施越多，热力越高）
    this.facilityWeights = {
      'toilets': 0.2,        // 洗手间
      'restaurant': 0.15,    // 餐厅
      'bench': 0.1,          // 座椅
      'information': 0.1,    // 信息点
      'parking': 0.05,       // 停车场
      'first_aid': 0.15      // 急救点
    };
  }

  /**
   * 计算道路的综合热力值
   * @param {Object} road - 道路对象
   * @param {Array} nearbyFacilities - 附近设施
   * @param {Object} context - 上下文信息（时间、天气、用户类型等）
   * @returns {number} 热力值 (0-1)
   */
  calculateRoadHeat(road, nearbyFacilities = [], context = {}) {
    const tags = road.tags || {};
    const highway = tags.highway;
    const wheelchair = tags.wheelchair || '未知';

    // 1. 基础热力值
    const roadWeight = this.roadTypeWeights[highway] || { base: 0.5, capacity: 50, safety: 0.5 };
    let baseHeat = roadWeight.base;

    // 2. 无障碍调整
    const accessibilityWeight = this.accessibilityWeights[wheelchair];
    baseHeat = baseHeat * accessibilityWeight.multiplier + accessibilityWeight.bonus;

    // 3. 用户类型调整
    const userType = context.userType || 'normal';
    const userWeight = this.userTypeWeights[userType][highway] || 1.0;
    baseHeat *= userWeight;

    // 4. 时间段调整
    const currentHour = context.hour || new Date().getHours();
    const timeWeight = this.getTimeWeight(currentHour);
    baseHeat *= timeWeight;

    // 5. 天气调整
    const weather = context.weather || 'sunny';
    const weatherWeight = this.weatherWeights[weather];
    baseHeat *= weatherWeight;

    // 6. 设施密度调整
    const facilityBonus = this.calculateFacilityBonus(road, nearbyFacilities);
    baseHeat += facilityBonus;

    // 7. 道路长度调整（长路径可能更累）
    const roadLength = this.calculateRoadLength(road.geometry);
    const lengthPenalty = Math.min(roadLength / 1000, 0.2); // 最多减0.2
    baseHeat -= lengthPenalty;

    // 8. 坡度调整（如果有高程数据）
    const slopeData = tags.incline || '0%';
    const slopePenalty = this.calculateSlopePenalty(slopeData);
    baseHeat -= slopePenalty;

    // 确保热力值在合理范围内
    return Math.max(0.1, Math.min(1.0, baseHeat));
  }

  /**
   * 获取时间权重
   */
  getTimeWeight(hour) {
    if (hour >= 6 && hour < 12) {
      // 上午时段
      if (hour < 8) return 0.3;
      if (hour < 10) return 0.7;
      return 0.9;
    } else if (hour >= 12 && hour < 18) {
      // 下午时段
      if (hour < 14) return 0.8;
      if (hour < 16) return 1.0; // 下午高峰
      return 0.9;
    } else if (hour >= 18 && hour < 22) {
      // 傍晚时段
      return 0.6;
    } else {
      // 夜间时段
      return 0.2;
    }
  }

  /**
   * 计算设施密度加成
   */
  calculateFacilityBonus(road, nearbyFacilities) {
    let bonus = 0;
    const roadCenter = this.getRoadCenter(road.geometry);

    nearbyFacilities.forEach(facility => {
      const distance = this.calculateDistance(roadCenter, {
        lat: facility.lat,
        lon: facility.lon
      });

      // 100米内的设施有加成，距离越近加成越大
      if (distance <= 100) {
        const facilityType = facility.tags?.amenity || facility.tags?.tourism || 'unknown';
        const baseBonus = this.facilityWeights[facilityType] || 0.05;
        const distanceMultiplier = (100 - distance) / 100; // 距离衰减
        bonus += baseBonus * distanceMultiplier;
      }
    });

    return Math.min(bonus, 0.3); // 最多加0.3
  }

  /**
   * 计算道路长度（米）
   */
  calculateRoadLength(geometry) {
    if (!geometry || geometry.length < 2) return 0;

    let totalLength = 0;
    for (let i = 1; i < geometry.length; i++) {
      const dist = this.calculateDistance(geometry[i-1], geometry[i]);
      totalLength += dist;
    }
    return totalLength;
  }

  /**
   * 计算坡度惩罚
   */
  calculateSlopePenalty(inclineStr) {
    if (!inclineStr || inclineStr === '0%') return 0;

    // 解析坡度字符串，如 "5%", "10°"
    const match = inclineStr.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;

    const slope = parseFloat(match[1]);
    
    if (inclineStr.includes('%')) {
      // 百分比坡度
      if (slope > 8) return 0.3;      // 8%以上坡度，大幅降低热力
      if (slope > 5) return 0.2;      // 5-8%坡度
      if (slope > 3) return 0.1;      // 3-5%坡度
      return 0;
    } else if (inclineStr.includes('°')) {
      // 角度坡度
      if (slope > 5) return 0.3;      // 5度以上
      if (slope > 3) return 0.2;      // 3-5度
      if (slope > 2) return 0.1;      // 2-3度
      return 0;
    }

    return 0;
  }

  /**
   * 获取道路中心点
   */
  getRoadCenter(geometry) {
    if (!geometry || geometry.length === 0) return { lat: 0, lon: 0 };
    
    const midIndex = Math.floor(geometry.length / 2);
    return geometry[midIndex];
  }

  /**
   * 计算两点间距离（米）
   */
  calculateDistance(point1, point2) {
    const R = 6371000; // 地球半径（米）
    const lat1Rad = point1.lat * Math.PI / 180;
    const lat2Rad = point2.lat * Math.PI / 180;
    const deltaLatRad = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLonRad = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(deltaLatRad/2) * Math.sin(deltaLatRad/2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLonRad/2) * Math.sin(deltaLonRad/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * 批量计算道路热力值
   * @param {Array} roads - 道路数组
   * @param {Array} facilities - 设施数组
   * @param {Object} context - 上下文信息
   * @returns {Array} 带热力值的道路数组
   */
  calculateBatchHeat(roads, facilities = [], context = {}) {
    console.log('开始科学计算热力值，道路数:', roads.length, '设施数:', facilities.length);
    
    return roads.map((road, index) => {
      const heat = this.calculateRoadHeat(road, facilities, context);
      
      return {
        name: `${road.tags?.highway || 'unknown'}路线${index + 1}`,
        coordinates: road.geometry.map(point => [point.lon, point.lat]),
        heat: heat,
        accessibility: road.tags?.wheelchair || '未知',
        roadType: road.tags?.highway,
        // 添加详细的计算信息用于调试
        heatDetails: {
          baseType: road.tags?.highway,
          accessibility: road.tags?.wheelchair,
          userType: context.userType,
          weather: context.weather,
          timeWeight: this.getTimeWeight(context.hour || new Date().getHours())
        }
      };
    });
  }

  /**
   * 获取推荐的用户上下文
   * @param {string} userType - 用户类型
   * @returns {Object} 上下文配置
   */
  getRecommendedContext(userType = 'normal') {
    const currentHour = new Date().getHours();
    
    return {
      userType: userType,
      hour: currentHour,
      weather: 'sunny', // 可以接入天气API
      season: this.getCurrentSeason(),
      preferences: {
        avoidSteps: userType === 'wheelchair' || userType === 'elderly',
        preferShade: currentHour >= 11 && currentHour <= 15, // 中午时段偏好阴凉
        needFrequentRest: userType === 'elderly' || userType === 'family'
      }
    };
  }

  /**
   * 获取当前季节
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
}

export default new HeatlineAnalyticsService();
