// 使用原生fetch替代axios
// import axios from 'axios';

/**
 * Overpass API 服务
 * 用于从OpenStreetMap获取地理数据
 */
class OverpassService {
  constructor() {
    this.baseURL = 'https://overpass-api.de/api/interpreter';
    this.timeout = 60000; // 60秒超时
  }

  /**
   * 执行Overpass查询
   * @param {string} query - Overpass QL查询语句
   * @returns {Promise<Object>} 查询结果
   */
  async executeQuery(query) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: query,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Overpass API 查询失败:', error);
      throw new Error(`查询失败: ${error.message}`);
    }
  }

  /**
   * 获取上海动物园的道路和无障碍设施数据
   * @returns {Promise<Object>} 处理后的数据
   */
  async getShanghaiZooData() {
    const query = `
[out:json][timeout:60];

// 上海动物园边界框
(
  31.1908985,121.3526725,31.1994282,121.3650556
);

(
  // 1. 获取动物园边界
  way["tourism"="zoo"]["name"~"上海动物园|Shanghai Zoo"];
  
  // 2. 获取所有道路类型
  way["highway"](area);
  
  // 3. 获取步行路径
  way["highway"="footway"](area);
  way["highway"="path"](area);
  way["highway"="pedestrian"](area);
  way["highway"="steps"](area);
  
  // 4. 获取无障碍相关道路
  way["wheelchair"](area);
  way["wheelchair:description"](area);
  
  // 5. 获取路面信息
  way["surface"](area);
  way["smoothness"](area);
  way["width"](area);
  
  // 6. 获取坡道和台阶
  way["ramp"](area);
  way["ramp:wheelchair"](area);
  way["handrail"](area);
  
  // 7. 获取无障碍设施点
  node["amenity"="toilets"]["wheelchair"](area);
  node["amenity"="parking"]["wheelchair"](area);
  node["amenity"="bench"]["wheelchair"](area);
  node["tourism"="information"]["wheelchair"](area);
  
  // 8. 获取电梯和升降设备
  node["highway"="elevator"](area);
  node["conveying"="yes"](area);
  
  // 9. 获取入口和出口
  node["entrance"](area);
  node["entrance"="main"](area);
  node["entrance"="wheelchair"](area);
  
  // 10. 获取建筑物入口
  node["door"](area);
  node["automatic_door"](area);
  
  // 11. 获取休息设施
  node["amenity"="bench"](area);
  node["amenity"="shelter"](area);
  
  // 12. 获取指示牌和信息点
  node["tourism"="information"](area);
  node["information"="board"](area);
  node["information"="map"](area);
  
  // 13. 获取医疗和紧急设施
  node["amenity"="first_aid"](area);
  node["emergency"="phone"](area);
  
  // 14. 获取餐饮设施
  node["amenity"="restaurant"]["wheelchair"](area);
  node["amenity"="cafe"]["wheelchair"](area);
  node["amenity"="fast_food"]["wheelchair"](area);
  
  // 15. 获取商店
  node["shop"]["wheelchair"](area);
  
  // 16. 获取停车场
  way["amenity"="parking"]["wheelchair"](area);
  
  // 17. 获取建筑物
  way["building"]["wheelchair"](area);
  
  // 18. 获取桥梁和隧道
  way["bridge"="yes"](area);
  way["tunnel"="yes"](area);
  
  // 19. 获取栏杆和护栏
  way["barrier"="fence"](area);
  way["barrier"="handrail"](area);
  
  // 20. 获取照明设施
  node["highway"="street_lamp"](area);
  
);

// 输出结果，包含几何信息
out geom;
    `;

    const rawData = await this.executeQuery(query);
    return this.processZooData(rawData);
  }

  /**
   * 处理动物园数据
   * @param {Object} rawData - 原始OSM数据
   * @returns {Object} 处理后的数据
   */
  processZooData(rawData) {
    const result = {
      boundary: null,
      roads: [],
      accessibilityPoints: [],
      facilities: [],
      buildings: [],
      metadata: {
        processedAt: new Date().toISOString(),
        totalElements: rawData.elements?.length || 0
      }
    };

    if (!rawData.elements) {
      return result;
    }

    rawData.elements.forEach(element => {
      const tags = element.tags || {};
      
      if (element.type === 'way') {
        // 动物园边界
        if (tags.tourism === 'zoo') {
          result.boundary = {
            id: element.id,
            name: tags.name || tags['name:zh'] || tags['name:en'],
            geometry: element.geometry,
            bounds: element.bounds,
            tags: tags
          };
        }
        // 道路
        else if (tags.highway) {
          result.roads.push(this.processRoad(element));
        }
        // 建筑物
        else if (tags.building) {
          result.buildings.push(this.processBuilding(element));
        }
        // 其他设施
        else if (tags.amenity || tags.barrier) {
          result.facilities.push(this.processFacility(element));
        }
      }
      else if (element.type === 'node') {
        // 设施点
        if (this.isAccessibilityPoint(tags) || tags.amenity || tags.tourism || tags.shop || tags.emergency) {
          result.accessibilityPoints.push(this.processPoint(element));
        }
      }
    });

    return result;
  }

  /**
   * 处理道路数据
   */
  processRoad(element) {
    const tags = element.tags || {};
    return {
      id: element.id,
      type: 'road',
      highway: tags.highway,
      geometry: element.geometry,
      accessibility: this.getAccessibilityLevel(tags.wheelchair),
      surface: tags.surface,
      smoothness: tags.smoothness,
      width: tags.width,
      wheelchair: tags.wheelchair,
      tactilePaving: tags.tactile_paving === 'yes',
      handrail: tags.handrail === 'yes',
      lighting: tags.lit === 'yes',
      name: tags.name,
      tags: tags
    };
  }

  /**
   * 处理建筑物数据
   */
  processBuilding(element) {
    const tags = element.tags || {};
    return {
      id: element.id,
      type: 'building',
      building: tags.building,
      geometry: element.geometry,
      accessibility: this.getAccessibilityLevel(tags.wheelchair),
      name: tags.name,
      tags: tags
    };
  }

  /**
   * 处理设施数据
   */
  processFacility(element) {
    const tags = element.tags || {};
    return {
      id: element.id,
      type: 'facility',
      geometry: element.geometry,
      category: tags.amenity || tags.barrier || 'other',
      accessibility: this.getAccessibilityLevel(tags.wheelchair),
      name: tags.name,
      tags: tags
    };
  }

  /**
   * 处理点数据
   */
  processPoint(element) {
    const tags = element.tags || {};
    return {
      id: element.id,
      type: 'point',
      lat: element.lat,
      lon: element.lon,
      category: this.getPointCategory(tags),
      accessibility: this.getAccessibilityLevel(tags.wheelchair),
      amenity: tags.amenity,
      name: tags.name,
      tags: tags
    };
  }

  /**
   * 获取无障碍等级
   */
  getAccessibilityLevel(wheelchair) {
    switch (wheelchair) {
      case 'yes': return 'A';
      case 'limited': return 'B';
      case 'no': return 'C';
      default: return 'D';
    }
  }

  /**
   * 判断是否为无障碍设施点
   */
  isAccessibilityPoint(tags) {
    return tags.wheelchair || 
           tags.entrance === 'wheelchair' || 
           tags.highway === 'elevator' || 
           tags.tactile_paving === 'yes';
  }

  /**
   * 获取设施点类别
   */
  getPointCategory(tags) {
    if (tags.amenity === 'toilets') return 'toilet';
    if (tags.amenity === 'parking') return 'parking';
    if (tags.entrance) return 'entrance';
    if (tags.highway === 'elevator') return 'elevator';
    if (tags.amenity === 'bench') return 'seating';
    if (tags.amenity === 'shelter') return 'shelter';
    if (tags.tourism === 'information') return 'information';
    if (tags.amenity === 'first_aid') return 'medical';
    if (tags.amenity === 'restaurant') return 'restaurant';
    if (tags.amenity === 'cafe') return 'cafe';
    if (tags.shop) return 'shop';
    if (tags.emergency === 'phone') return 'emergency';
    return 'other';
  }
}

export default new OverpassService();
