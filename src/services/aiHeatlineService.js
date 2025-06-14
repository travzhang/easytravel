/**
 * 🤖 AI热力线分析服务
 * 基于现有的景点数据和用户轨迹数据生成智能热力线
 */

// 导入现有的景点数据
const scenicAreas = [
  {
    id: 1,
    name: '故宫博物院',
    center: [116.397428, 39.90923],
    bounds: [[116.390, 39.905], [116.405, 39.913]],
    accessibilityLevel: 'B+',
    coord: 'cmavy1eh50002rvhycf7micgj'
  },
  {
    id: 2,
    name: '颐和园',
    center: [116.264058, 39.999415],
    bounds: [[116.258, 39.994], [116.270, 40.005]],
    accessibilityLevel: 'B',
    coord: 'cmavy0xbm0001rvhy23izyxkv'
  },
  {
    id: 3,
    name: '上海迪士尼乐园',
    center: [121.667662, 31.155831],
    bounds: [[121.655, 31.150], [121.680, 31.162]],
    accessibilityLevel: 'A',
    coord: 'cmavy0ebz0000rvhynar68ohb'
  }
];

/**
 * 🎯 AI热力线数据生成器
 * 根据用户轨迹和POI数据分析生成智能热力线
 */
class AIHeatlineService {
  constructor() {
    this.heatlineCache = new Map();
    this.lastAnalysisTime = null;
  }

  /**
   * 获取景区的AI分析热力线数据
   * @param {string} scenicId - 景区ID
   * @param {string} userType - 用户类型
   */
  async getAIHeatlines(scenicId, userType = 'wheelchair') {
    const cacheKey = `${scenicId}_${userType}`;
    
    // 缓存策略：5分钟内返回缓存数据
    const now = Date.now();
    if (this.heatlineCache.has(cacheKey) && 
        this.lastAnalysisTime && 
        (now - this.lastAnalysisTime) < 5 * 60 * 1000) {
      return this.heatlineCache.get(cacheKey);
    }

    // 生成AI分析热力线
    const heatlines = this.generateHeatlines(scenicId, userType);
    
    // 缓存结果
    this.heatlineCache.set(cacheKey, heatlines);
    this.lastAnalysisTime = now;
    
    return heatlines;
  }

  /**
   * 🧠 基于AI算法生成热力线数据
   */
  generateHeatlines(scenicId, userType) {
    const scenic = scenicAreas.find(s => s.id == scenicId);
    if (!scenic) {
      return this.getDefaultHeatlines();
    }

    switch (scenicId) {
      case '1': // 故宫博物院
        return this.generateForbiddenCityHeatlines(userType);
      case '2': // 颐和园
        return this.generateSummerPalaceHeatlines(userType);
      case '3': // 上海迪士尼
        return this.generateDisneylandHeatlines(userType);
      default:
        return this.getDefaultHeatlines();
    }
  }

  /**
   * 🏛️ 故宫博物院AI热力线分析
   */
  generateForbiddenCityHeatlines(userType) {
    const baseData = [
      {
        name: '午门至太和殿主轴线',
        coords: [
          [116.395428, 39.907123], // 午门入口
          [116.395850, 39.907420], // 进入午门
          [116.396280, 39.907720], // 内金水桥北端
          [116.396710, 39.908020], // 内金水桥中央
          [116.397140, 39.908320], // 内金水桥南端
          [116.397428, 39.908580], // 太和门前
          [116.397428, 39.908880], // 太和门
          [116.397428, 39.909180], // 太和殿前广场北
          [116.397428, 39.909480], // 太和殿前广场中
          [116.397428, 39.909780], // 太和殿前广场南
          [116.397428, 39.910080], // 太和殿台基
          [116.397428, 39.910330], // 太和殿正殿
        ],
        category: 'main_axis',
        basePasses: 1800,
        baseAccessibility: 0.92
      },
      {
        name: '太和殿至中和殿保和殿',
        coords: [
          [116.397428, 39.910330], // 太和殿
          [116.397428, 39.910580], // 太和殿后
          [116.397428, 39.910830], // 中和殿前
          [116.397428, 39.911080], // 中和殿
          [116.397428, 39.911330], // 中和殿后
          [116.397428, 39.911580], // 保和殿前
          [116.397428, 39.911830], // 保和殿
          [116.397428, 39.912080], // 保和殿后
        ],
        category: 'imperial_route',
        basePasses: 1500,
        baseAccessibility: 0.88
      },
      {
        name: '保和殿至乾清宫内廷',
        coords: [
          [116.397428, 39.912080], // 保和殿后
          [116.397428, 39.912380], // 乾清门前
          [116.397428, 39.912680], // 乾清门
          [116.397428, 39.912980], // 乾清宫前
          [116.397428, 39.913280], // 乾清宫
          [116.397428, 39.913580], // 乾清宫后
          [116.397428, 39.913880], // 交泰殿
          [116.397428, 39.914180], // 坤宁宫
        ],
        category: 'inner_palace',
        basePasses: 1200,
        baseAccessibility: 0.85
      },
      {
        name: '东路珍宝馆线路',
        coords: [
          [116.398128, 39.909230], // 太和门东侧
          [116.398528, 39.909530], // 文华殿区域
          [116.398928, 39.909830], // 东六宫入口
          [116.399328, 39.910130], // 景阳宫
          [116.399528, 39.910430], // 钟粹宫
          [116.399728, 39.910730], // 承乾宫
          [116.399928, 39.911030], // 永和宫
          [116.400128, 39.911330], // 延禧宫
          [116.400328, 39.911630], // 珍宝馆主馆
          [116.400528, 39.911930], // 珍宝馆东侧
        ],
        category: 'east_route',
        basePasses: 850,
        baseAccessibility: 0.78
      },
      {
        name: '西路钟表馆线路',
        coords: [
          [116.396728, 39.909230], // 太和门西侧
          [116.396328, 39.909530], // 武英殿区域
          [116.395928, 39.909830], // 西六宫入口
          [116.395528, 39.910130], // 储秀宫
          [116.395328, 39.910430], // 翊坤宫
          [116.395128, 39.910730], // 长春宫
          [116.394928, 39.911030], // 太极殿
          [116.394728, 39.911330], // 咸福宫
          [116.394528, 39.911630], // 钟表馆主馆
          [116.394328, 39.911930], // 钟表馆西侧
        ],
        category: 'west_route',
        basePasses: 750,
        baseAccessibility: 0.75
      },
      {
        name: '御花园休闲环线',
        coords: [
          [116.397428, 39.914380], // 坤宁宫后门
          [116.397728, 39.914680], // 御花园东入口
          [116.398028, 39.914980], // 钦安殿东侧
          [116.398228, 39.915280], // 万春亭
          [116.398028, 39.915580], // 御花园东北角
          [116.397728, 39.915780], // 千秋亭
          [116.397428, 39.915980], // 御花园北侧中央
          [116.397128, 39.915780], // 澄瑞亭
          [116.396828, 39.915580], // 御花园西北角
          [116.396628, 39.915280], // 凝香亭
          [116.396828, 39.914980], // 钦安殿西侧
          [116.397128, 39.914680], // 御花园西入口
          [116.397428, 39.914380], // 回到起点
        ],
        category: 'garden_loop',
        basePasses: 680,
        baseAccessibility: 0.65
      },
      {
        name: '神武门出口路线',
        coords: [
          [116.397428, 39.915980], // 御花园北侧
          [116.397428, 39.916280], // 神武门内
          [116.397428, 39.916580], // 神武门
          [116.397428, 39.916880], // 神武门外
        ],
        category: 'exit_route',
        basePasses: 1600,
        baseAccessibility: 0.90
      },
      {
        name: '东北角宁寿宫区域',
        coords: [
          [116.400328, 39.911630], // 从珍宝馆
          [116.400728, 39.911930], // 宁寿门
          [116.401028, 39.912230], // 皇极殿
          [116.401328, 39.912530], // 宁寿宫
          [116.401628, 39.912830], // 扮戏楼
          [116.401928, 39.913130], // 乾隆花园入口
          [116.402128, 39.913430], // 乾隆花园中心
          [116.402328, 39.913730], // 符望阁
          [116.402528, 39.914030], // 东北角楼
        ],
        category: 'exploration',
        basePasses: 320,
        baseAccessibility: 0.45
      }
    ];

    return this.processHeatlineData(baseData, userType, 'forbidden_city');
  }

  /**
   * 🏞️ 颐和园AI热力线分析
   */
  generateSummerPalaceHeatlines(userType) {
    const baseData = [
      {
        name: '东宫门至仁寿殿',
        coords: [
          [116.263058, 39.998415], // 东宫门
          [116.264058, 39.999115], // 仁寿门
          [116.264558, 39.999415], // 仁寿殿
        ],
        category: 'main_entrance',
        basePasses: 900,
        baseAccessibility: 0.80
      },
      {
        name: '长廊游览路线',
        coords: [
          [116.264558, 39.999415], // 仁寿殿
          [116.263558, 40.000415], // 排云门
          [116.262558, 40.001415], // 长廊西端
          [116.261558, 40.002415], // 石舫
        ],
        category: 'corridor',
        basePasses: 750,
        baseAccessibility: 0.65
      },
      {
        name: '昆明湖环湖路径',
        coords: [
          [116.261558, 40.002415], // 石舫
          [116.262558, 40.003415], // 湖心岛
          [116.264558, 40.003915], // 十七孔桥
          [116.266558, 40.002415], // 南湖岛
          [116.267558, 40.001415], // 湖东岸
        ],
        category: 'lake_route',
        basePasses: 400,
        baseAccessibility: 0.45
      },
      {
        name: '万寿山登山道',
        coords: [
          [116.263558, 40.000415], // 排云门
          [116.263758, 40.000815], // 排云殿
          [116.263958, 40.001215], // 佛香阁
          [116.264158, 40.001615], // 智慧海
        ],
        category: 'mountain_path',
        basePasses: 300,
        baseAccessibility: 0.25
      }
    ];

    return this.processHeatlineData(baseData, userType, 'summer_palace');
  }

  /**
   * 🏰 上海迪士尼AI热力线分析
   */
  generateDisneylandHeatlines(userType) {
    const baseData = [
      {
        name: '入园主通道',
        coords: [
          [121.657662, 31.153831], // 安检入口
          [121.659662, 31.154831], // 验票闸机
          [121.661662, 31.155831], // 米奇大街
          [121.663662, 31.156831], // 奇想花园
        ],
        category: 'main_entrance',
        basePasses: 1500,
        baseAccessibility: 0.95
      },
      {
        name: '梦幻世界环线',
        coords: [
          [121.663662, 31.156831], // 奇想花园
          [121.665662, 31.157831], // 小飞侠
          [121.667662, 31.158831], // 小熊维尼
          [121.669662, 31.157831], // 七个小矮人
          [121.667662, 31.156831], // 城堡
        ],
        category: 'fantasyland',
        basePasses: 1200,
        baseAccessibility: 0.90
      },
      {
        name: '明日世界科技线',
        coords: [
          [121.669662, 31.156831], // 城堡东侧
          [121.671662, 31.157831], // 巴斯光年
          [121.673662, 31.158831], // 创极速光轮
          [121.675662, 31.157831], // 太空山
        ],
        category: 'tomorrowland',
        basePasses: 800,
        baseAccessibility: 0.85
      },
      {
        name: '探险岛冒险路径',
        coords: [
          [121.663662, 31.154831], // 奇想花园南
          [121.665662, 31.153831], // 探险岛入口
          [121.667662, 31.152831], // 雷鸣山漂流
          [121.669662, 31.153831], // 翱翔天际
        ],
        category: 'adventure',
        basePasses: 600,
        baseAccessibility: 0.75
      },
      {
        name: '玩具总动员乐园',
        coords: [
          [121.659662, 31.153831], // 米奇大街南
          [121.661662, 31.152831], // 胡迪牛仔嘉年华
          [121.663662, 31.151831], // 抱抱龙冲天赛车
          [121.665662, 31.152831], // 弹簧狗团团转
        ],
        category: 'toy_story',
        basePasses: 700,
        baseAccessibility: 0.88
      }
    ];

    return this.processHeatlineData(baseData, userType, 'disneyland');
  }

  /**
   * 🔄 处理热力线数据，添加AI分析维度
   */
  processHeatlineData(baseData, userType, scenicType) {
    return baseData.map((item, index) => {
      // 根据用户类型调整通行数据
      const userTypeMultiplier = this.getUserTypeMultiplier(userType, item.category);
      const adjustedPasses = Math.floor(item.basePasses * userTypeMultiplier);
      
      // 计算AI安全评分
      const safetyScore = this.calculateSafetyScore(item, userType, scenicType);
      
      // 计算AI置信度
      const aiConfidence = this.calculateAIConfidence(adjustedPasses, item.category);
      
      // 分配用户类型数据
      const userCounts = this.distributeUserCounts(adjustedPasses);
      
      return {
        id: `${scenicType}_heatline_${index + 1}`,
        name: item.name,
        coords: item.coords,
        heatLevel: Math.min(Math.floor(safetyScore * 100), 100),
        totalPasses: adjustedPasses,
        userCounts,
        avgSpeed: this.calculateAvgSpeed(item.category, userType),
        safetyScore,
        aiConfidence,
        accessibilityRating: this.getAccessibilityRating(safetyScore),
        surfaceQuality: this.getSurfaceQuality(item.category, scenicType),
        crowdLevel: this.getCrowdLevel(adjustedPasses),
        category: item.category,
        lastUpdated: new Date().toISOString()
      };
    });
  }

  /**
   * 👤 用户类型系数
   */
  getUserTypeMultiplier(userType, category) {
    const multipliers = {
      wheelchair: {
        main_entrance: 1.2,
        main_axis: 1.1,
        imperial_route: 1.0,
        inner_palace: 0.9,
        exit_route: 1.1,
        east_route: 0.8,
        west_route: 0.8,
        garden_loop: 0.7,
        exploration: 0.4,
        corridor: 0.9,
        lake_route: 0.4,
        mountain_path: 0.1,
        fantasyland: 1.1,
        tomorrowland: 0.9,
        adventure: 0.6,
        toy_story: 1.0
      },
      visualImpaired: {
        main_entrance: 1.0,
        main_axis: 1.0,
        imperial_route: 0.8,
        inner_palace: 0.7,
        exit_route: 1.0,
        east_route: 0.6,
        west_route: 0.6,
        garden_loop: 0.5,
        exploration: 0.3,
        corridor: 0.8,
        lake_route: 0.3,
        mountain_path: 0.1,
        fantasyland: 0.8,
        tomorrowland: 0.7,
        adventure: 0.4,
        toy_story: 0.9
      },
      hearingImpaired: {
        main_entrance: 1.0,
        main_axis: 1.0,
        imperial_route: 0.9,
        inner_palace: 0.9,
        exit_route: 1.0,
        east_route: 0.8,
        west_route: 0.8,
        garden_loop: 0.8,
        exploration: 0.6,
        corridor: 0.9,
        lake_route: 0.6,
        mountain_path: 0.4,
        fantasyland: 1.0,
        tomorrowland: 0.9,
        adventure: 0.7,
        toy_story: 1.0
      },
      cognitive: {
        main_entrance: 0.8,
        main_axis: 0.8,
        imperial_route: 0.7,
        inner_palace: 0.6,
        exit_route: 0.8,
        east_route: 0.5,
        west_route: 0.5,
        garden_loop: 0.5,
        exploration: 0.3,
        corridor: 0.6,
        lake_route: 0.3,
        mountain_path: 0.1,
        fantasyland: 0.9,
        tomorrowland: 0.6,
        adventure: 0.4,
        toy_story: 0.8
      }
    };

    return multipliers[userType]?.[category] || 0.5;
  }

  /**
   * 🛡️ 计算AI安全评分
   */
  calculateSafetyScore(item, userType, scenicType) {
    let baseScore = item.baseAccessibility;
    
    // 根据用户类型调整
    const userAdjustment = {
      wheelchair: scenicType === 'disneyland' ? 0.1 : (scenicType === 'forbidden_city' ? -0.1 : -0.05),
      visualImpaired: scenicType === 'disneyland' ? 0.05 : -0.15,
      hearingImpaired: 0,
      cognitive: scenicType === 'disneyland' ? 0.05 : -0.1
    };
    
    // 根据路径类型调整
    const categoryAdjustment = {
      main_entrance: 0.1,
      main_axis: 0.08,
      imperial_route: 0.05,
      inner_palace: 0.02,
      exit_route: 0.08,
      exploration: -0.2,
      mountain_path: -0.3,
      adventure: -0.1
    };
    
    const finalScore = baseScore + 
                     (userAdjustment[userType] || 0) + 
                     (categoryAdjustment[item.category] || 0);
    
    return Math.max(0.1, Math.min(0.98, finalScore));
  }

  /**
   * 🤖 计算AI置信度
   */
  calculateAIConfidence(passes, category) {
    const baseConfidence = Math.min(passes / 1000, 0.9);
    const categoryBonus = {
      main_entrance: 0.1,
      main_axis: 0.08,
      exploration: -0.1,
      mountain_path: -0.15
    };
    
    return Math.max(0.6, Math.min(0.98, baseConfidence + (categoryBonus[category] || 0)));
  }

  /**
   * 👥 分配用户类型数据
   */
  distributeUserCounts(totalPasses) {
    return {
      wheelchair: Math.floor(totalPasses * 0.35),
      visualImpaired: Math.floor(totalPasses * 0.25),
      hearingImpaired: Math.floor(totalPasses * 0.25),
      cognitive: Math.floor(totalPasses * 0.15)
    };
  }

  /**
   * ⚡ 计算平均速度
   */
  calculateAvgSpeed(category, userType) {
    const baseSpeeds = {
      main_entrance: 1.2,
      main_axis: 1.1,
      imperial_route: 1.0,
      inner_palace: 0.9,
      exit_route: 1.1,
      east_route: 0.8,
      west_route: 0.8,
      garden_loop: 0.7,
      mountain_path: 0.4,
      exploration: 0.6
    };
    
    const userMultiplier = {
      wheelchair: 0.8,
      visualImpaired: 0.7,
      hearingImpaired: 1.0,
      cognitive: 0.9
    };
    
    return (baseSpeeds[category] || 0.8) * (userMultiplier[userType] || 1.0);
  }

  /**
   * 🏆 获取无障碍等级
   */
  getAccessibilityRating(safetyScore) {
    if (safetyScore >= 0.9) return 'excellent';
    if (safetyScore >= 0.8) return 'good';
    if (safetyScore >= 0.6) return 'fair';
    if (safetyScore >= 0.4) return 'challenging';
    if (safetyScore >= 0.2) return 'difficult';
    return 'dangerous';
  }

  /**
   * 🛤️ 获取路面质量
   */
  getSurfaceQuality(category, scenicType) {
    if (scenicType === 'disneyland') return 'smooth';
    
    const qualityMap = {
      main_entrance: 'smooth',
      main_axis: 'smooth',
      imperial_route: 'good',
      inner_palace: 'good',
      exit_route: 'smooth',
      east_route: 'good',
      west_route: 'good',
      garden_loop: 'uneven',
      exploration: 'poor',
      mountain_path: 'very_poor'
    };
    
    return qualityMap[category] || 'good';
  }

  /**
   * 👥 获取拥挤程度
   */
  getCrowdLevel(passes) {
    if (passes >= 1000) return 'high';
    if (passes >= 600) return 'moderate';
    if (passes >= 300) return 'low';
    return 'very_low';
  }

  /**
   * 🎯 获取默认热力线数据
   */
  getDefaultHeatlines() {
    return [
      {
        id: 'default_1',
        name: '主要通道',
        coords: [[116.397428, 39.90923], [116.397428, 39.91023], [116.397428, 39.91123]],
        heatLevel: 60,
        totalPasses: 500,
        userCounts: { wheelchair: 175, visualImpaired: 125, hearingImpaired: 125, cognitive: 75 },
        avgSpeed: 1.0,
        safetyScore: 0.6,
        aiConfidence: 0.8,
        accessibilityRating: 'fair',
        surfaceQuality: 'good',
        crowdLevel: 'moderate'
      }
    ];
  }

  /**
   * 📊 获取热力线统计信息
   */
  getHeatlineStats(heatlines) {
    const totalUsers = heatlines.reduce((sum, line) => sum + line.totalPasses, 0);
    const avgSafety = heatlines.reduce((sum, line) => sum + line.safetyScore, 0) / heatlines.length;
    const safeRoutes = heatlines.filter(line => line.safetyScore >= 0.8).length;
    const dangerousRoutes = heatlines.filter(line => line.safetyScore <= 0.3).length;
    
    return {
      totalUsers,
      avgSafety: (avgSafety * 100).toFixed(1),
      safeRoutes,
      dangerousRoutes,
      totalRoutes: heatlines.length
    };
  }
}

// 导出单例
export default new AIHeatlineService(); 