/**
 * 上海景点数据服务
 * 用于获取上海各大公园和景点的数据
 */
class ShanghaiScenicService {
  constructor() {
    this.baseURL = 'https://overpass-api.de/api/interpreter';
    this.timeout = 60000;
  }

  /**
   * 上海主要景点列表
   */
  getShanghaiScenics() {
    return [
      {
        id: 'shanghai-zoo',
        name: '上海动物园',
        nameEn: 'Shanghai Zoo',
        location: '上海市长宁区虹桥路2381号',
        center: [31.1951, 121.3589],
        bbox: [31.1908, 121.3527, 31.1995, 121.3651],
        tags: ['动物园', '亲子', '科普教育'],
        openTime: '06:30-17:30',
        price: '40元',
        description: '上海最大的动物园，拥有400多种珍稀动物',
        accessibilityLevel: 'A',
        estimatedRating: 4.5,
        image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'century-park',
        name: '世纪公园',
        nameEn: 'Century Park',
        location: '上海市浦东新区锦绣路1001号',
        center: [31.2197, 121.5533],
        bbox: [31.2150, 121.5480, 31.2244, 121.5586],
        tags: ['城市公园', '湖泊', '休闲'],
        openTime: '06:00-18:00',
        price: '10元',
        description: '上海最大的富有自然特征的生态城市公园',
        accessibilityLevel: 'A',
        estimatedRating: 4.6,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'fuxing-park',
        name: '复兴公园',
        nameEn: 'Fuxing Park',
        location: '上海市黄浦区雁荡路105号',
        center: [31.2198, 121.4667],
        bbox: [31.2185, 121.4655, 31.2211, 121.4679],
        tags: ['历史公园', '法式园林', '文化'],
        openTime: '06:00-18:00',
        price: '免费',
        description: '上海唯一的法式风格公园，历史悠久',
        accessibilityLevel: 'B+',
        estimatedRating: 4.3,
        image: '/fuxing.png'
      },
      {
        id: 'zhongshan-park',
        name: '中山公园',
        nameEn: 'Zhongshan Park',
        location: '上海市长宁区长宁路780号',
        center: [31.2231, 121.4208],
        bbox: [31.2215, 121.4190, 31.2247, 121.4226],
        tags: ['城市公园', '纪念性', '休闲'],
        openTime: '05:00-18:00',
        price: '免费',
        description: '为纪念孙中山先生而建的公园，绿化优美',
        accessibilityLevel: 'A',
        estimatedRating: 4.4,
        image: '/zhongshan.webp'
      },
      {
        id: 'gongqing-forest-park',
        name: '共青森林公园',
        nameEn: 'Gongqing Forest Park',
        location: '上海市杨浦区军工路2000号',
        center: [31.3167, 121.5500],
        bbox: [31.3120, 121.5450, 31.3214, 121.5550],
        tags: ['森林公园', '自然生态', '户外运动'],
        openTime: '06:00-17:00',
        price: '15元',
        description: '上海市区内最大的森林公园，空气清新',
        accessibilityLevel: 'B+',
        estimatedRating: 4.5,
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'luxun-park',
        name: '鲁迅公园',
        nameEn: 'Lu Xun Park',
        location: '上海市虹口区四川北路2288号',
        center: [31.2667, 121.4833],
        bbox: [31.2655, 121.4820, 31.2679, 121.4846],
        tags: ['纪念公园', '文化', '历史'],
        openTime: '06:00-18:00',
        price: '免费',
        description: '为纪念文学家鲁迅先生而建的公园',
        accessibilityLevel: 'A',
        estimatedRating: 4.2,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'huangpu-park',
        name: '黄浦公园',
        nameEn: 'Huangpu Park',
        location: '上海市黄浦区中山东一路28号',
        center: [31.2444, 121.4944],
        bbox: [31.2438, 121.4938, 31.2450, 121.4950],
        tags: ['历史公园', '外滩', '观景'],
        openTime: '06:00-18:00',
        price: '免费',
        description: '上海最早的公园，位于外滩北端',
        accessibilityLevel: 'B',
        estimatedRating: 4.1,
        image: '/huangpu.jpeg'
      },
      {
        id: 'shanghai-botanical-garden',
        name: '上海植物园',
        nameEn: 'Shanghai Botanical Garden',
        location: '上海市徐汇区龙吴路1111号',
        center: [31.1500, 121.4400],
        bbox: [31.1470, 121.4370, 31.1530, 121.4430],
        tags: ['植物园', '科普', '自然'],
        openTime: '07:00-17:00',
        price: '15元',
        description: '集科研、科普和游览功能于一体的综合性植物园',
        accessibilityLevel: 'A',
        estimatedRating: 4.4,
        image: '/zhiwuyuan.webp'
      },
      {
        id: 'yu-garden',
        name: '豫园',
        nameEn: 'Yu Garden',
        location: '上海市黄浦区福佑路168号',
        center: [31.2267, 121.4917],
        bbox: [31.2260, 121.4910, 31.2274, 121.4924],
        tags: ['古典园林', '历史文化', '传统建筑'],
        openTime: '08:30-17:00',
        price: '40元',
        description: '明代私人花园，江南古典园林的代表',
        accessibilityLevel: 'B',
        estimatedRating: 4.3,
        image: '/yuyuan.jpg'
      },
      {
        id: 'jinshan-city-beach',
        name: '金山城市沙滩',
        nameEn: 'Jinshan City Beach',
        location: '上海市金山区沪杭公路7555号',
        center: [30.7167, 121.3333],
        bbox: [30.7140, 121.3300, 30.7194, 121.3366],
        tags: ['海滩', '度假', '水上运动'],
        openTime: '08:30-21:30',
        price: '免费',
        description: '上海唯一的滨海度假区，人工沙滩',
        accessibilityLevel: 'B+',
        estimatedRating: 4.2,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'
      }
    ];
  }

  /**
   * 根据ID获取景点信息
   */
  getScenicById(id) {
    const scenics = this.getShanghaiScenics();
    return scenics.find(scenic => scenic.id === id);
  }

  /**
   * 获取景点的Overpass查询语句
   */
  getScenicOverpassQuery(scenic) {
    const [minLat, minLon, maxLat, maxLon] = scenic.bbox;

    return `[out:json][timeout:45];
(
  // 获取景区边界（所有可能的类型）
  way["leisure"="park"](${minLat},${minLon},${maxLat},${maxLon});
  way["tourism"="zoo"](${minLat},${minLon},${maxLat},${maxLon});
  way["leisure"="garden"](${minLat},${minLon},${maxLat},${maxLon});
  way["landuse"="recreation_ground"](${minLat},${minLon},${maxLat},${maxLon});
  relation["leisure"="park"](${minLat},${minLon},${maxLat},${maxLon});
  relation["tourism"="zoo"](${minLat},${minLon},${maxLat},${maxLon});

  // 获取所有类型的道路（确保不遗漏）
  way["highway"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="primary"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="secondary"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="tertiary"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="residential"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="unclassified"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="footway"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="path"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="pedestrian"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="cycleway"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="steps"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="service"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="track"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="bridleway"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"="living_street"](${minLat},${minLon},${maxLat},${maxLon});

  // 获取所有可能的路径类型
  way["route"="foot"](${minLat},${minLon},${maxLat},${maxLon});
  way["route"="hiking"](${minLat},${minLon},${maxLat},${maxLon});
  way["foot"="yes"](${minLat},${minLon},${maxLat},${maxLon});
  way["foot"="designated"](${minLat},${minLon},${maxLat},${maxLon});

  // 获取无障碍相关道路（所有可能的标记）
  way["wheelchair"](${minLat},${minLon},${maxLat},${maxLon});
  way["wheelchair"="yes"](${minLat},${minLon},${maxLat},${maxLon});
  way["wheelchair"="limited"](${minLat},${minLon},${maxLat},${maxLon});
  way["wheelchair"="no"](${minLat},${minLon},${maxLat},${maxLon});
  way["tactile_paving"="yes"](${minLat},${minLon},${maxLat},${maxLon});
  way["handrail"="yes"](${minLat},${minLon},${maxLat},${maxLon});
  way["ramp"="yes"](${minLat},${minLon},${maxLat},${maxLon});

  // 获取无障碍设施点（轮椅用户重点关注）
  node["amenity"="toilets"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="toilets"]["wheelchair"="yes"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="parking"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="parking"]["wheelchair"="yes"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="bench"](${minLat},${minLon},${maxLat},${maxLon});
  node["entrance"](${minLat},${minLon},${maxLat},${maxLon});
  node["entrance"]["wheelchair"="yes"](${minLat},${minLon},${maxLat},${maxLon});
  node["highway"="elevator"](${minLat},${minLon},${maxLat},${maxLon});
  node["tourism"="information"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="restaurant"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="cafe"](${minLat},${minLon},${maxLat},${maxLon});
  node["shop"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="first_aid"](${minLat},${minLon},${maxLat},${maxLon});
  node["emergency"="phone"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="drinking_water"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="shelter"](${minLat},${minLon},${maxLat},${maxLon});
  node["wheelchair"="yes"](${minLat},${minLon},${maxLat},${maxLon});

  // 获取建筑物和入口
  way["building"](${minLat},${minLon},${maxLat},${maxLon});
  node["building"="entrance"](${minLat},${minLon},${maxLat},${maxLon});

  // 获取水体和绿地
  way["natural"="water"](${minLat},${minLon},${maxLat},${maxLon});
  way["leisure"="playground"](${minLat},${minLon},${maxLat},${maxLon});
  way["landuse"="grass"](${minLat},${minLon},${maxLat},${maxLon});
  way["natural"="tree_row"](${minLat},${minLon},${maxLat},${maxLon});
);
out geom;`;
  }

  /**
   * 获取景点数据
   */
  async getScenicData(scenicId) {
    const scenic = this.getScenicById(scenicId);
    if (!scenic) {
      throw new Error(`景点 ${scenicId} 不存在`);
    }

    const query = this.getScenicOverpassQuery(scenic);
    
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: query
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        scenic: scenic,
        overpassData: data
      };
    } catch (error) {
      console.error(`获取景点 ${scenicId} 数据失败:`, error);
      throw new Error(`获取景点数据失败: ${error.message}`);
    }
  }

  /**
   * 搜索景点
   */
  searchScenics(keyword) {
    const scenics = this.getShanghaiScenics();
    if (!keyword) return scenics;

    return scenics.filter(scenic => 
      scenic.name.includes(keyword) ||
      scenic.nameEn.toLowerCase().includes(keyword.toLowerCase()) ||
      scenic.location.includes(keyword) ||
      scenic.tags.some(tag => tag.includes(keyword))
    );
  }

  /**
   * 按标签筛选景点
   */
  filterScenicsByTags(tags) {
    const scenics = this.getShanghaiScenics();
    if (!tags || tags.length === 0) return scenics;

    return scenics.filter(scenic =>
      tags.some(tag => scenic.tags.includes(tag))
    );
  }

  /**
   * 按无障碍等级筛选景点
   */
  filterScenicsByAccessibility(levels) {
    const scenics = this.getShanghaiScenics();
    if (!levels || levels.length === 0) return scenics;

    return scenics.filter(scenic =>
      levels.includes(scenic.accessibilityLevel)
    );
  }

  /**
   * 按价格筛选景点
   */
  filterScenicsByPrice(priceType) {
    const scenics = this.getShanghaiScenics();
    
    switch (priceType) {
      case 'free':
        return scenics.filter(scenic => scenic.price === '免费');
      case 'paid':
        return scenics.filter(scenic => scenic.price !== '免费');
      default:
        return scenics;
    }
  }
}

export default new ShanghaiScenicService();
