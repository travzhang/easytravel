/**
 * 数据获取服务
 * 整合多个数据源，获取更丰富的景区数据
 * 重点：基于用户轨迹数据生成热力线
 */
class DataAcquisitionService {
  constructor() {
    this.overpassURL = 'https://overpass-api.de/api/interpreter';
    this.timeout = 60000;

    // 轨迹数据处理配置
    this.trackingConfig = {
      recordInterval: 1000,        // 每秒记录一次
      clusterRadius: 5,           // 聚类半径（米）
      minPointsPerCluster: 3,     // 最小聚类点数
      heatmapResolution: 10,      // 热力图网格分辨率（米）
      smoothingFactor: 0.3,       // 轨迹平滑因子
      outlierThreshold: 50        // 异常点阈值（米）
    };
  }

  /**
   * 获取增强的景区数据
   * @param {Object} scenic - 景区信息
   * @returns {Promise<Object>} 增强的数据
   */
  async getEnhancedScenicData(scenic) {
    console.log('开始获取增强景区数据:', scenic.name);
    
    try {
      // 并行获取多种数据
      const [
        overpassData,
        elevationData,
        weatherData,
        crowdData
      ] = await Promise.allSettled([
        this.getOverpassData(scenic),
        this.getElevationData(scenic),
        this.getWeatherData(scenic),
        this.getCrowdData(scenic)
      ]);

      return {
        scenic: scenic,
        overpass: overpassData.status === 'fulfilled' ? overpassData.value : null,
        elevation: elevationData.status === 'fulfilled' ? elevationData.value : null,
        weather: weatherData.status === 'fulfilled' ? weatherData.value : null,
        crowd: crowdData.status === 'fulfilled' ? crowdData.value : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('获取增强数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取Overpass数据（增强版查询）
   */
  async getOverpassData(scenic) {
    const [minLat, minLon, maxLat, maxLon] = scenic.bbox;
    
    // 增强的Overpass查询，包含更多细节
    const query = `[out:json][timeout:30];
(
  // 景区边界
  way["leisure"="park"](${minLat},${minLon},${maxLat},${maxLon});
  way["tourism"="zoo"](${minLat},${minLon},${maxLat},${maxLon});
  way["leisure"="garden"](${minLat},${minLon},${maxLat},${maxLon});
  relation["leisure"="park"](${minLat},${minLon},${maxLat},${maxLon});
  
  // 详细道路信息（包含更多属性）
  way["highway"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"]["surface"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"]["width"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"]["incline"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"]["lit"](${minLat},${minLon},${maxLat},${maxLon});
  way["highway"]["smoothness"](${minLat},${minLon},${maxLat},${maxLon});
  
  // 无障碍相关
  way["wheelchair"](${minLat},${minLon},${maxLat},${maxLon});
  way["tactile_paving"="yes"](${minLat},${minLon},${maxLat},${maxLon});
  way["handrail"="yes"](${minLat},${minLon},${maxLat},${maxLon});
  node["wheelchair"](${minLat},${minLon},${maxLat},${maxLon});
  
  // 设施点（详细分类）
  node["amenity"="toilets"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="parking"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="bench"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="restaurant"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="cafe"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="drinking_water"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="shelter"](${minLat},${minLon},${maxLat},${maxLon});
  node["amenity"="first_aid"](${minLat},${minLon},${maxLat},${maxLon});
  node["tourism"="information"](${minLat},${minLon},${maxLat},${maxLon});
  node["entrance"](${minLat},${minLon},${maxLat},${maxLon});
  
  // 景观和兴趣点
  node["tourism"="attraction"](${minLat},${minLon},${maxLat},${maxLon});
  node["tourism"="viewpoint"](${minLat},${minLon},${maxLat},${maxLon});
  way["leisure"="playground"](${minLat},${minLon},${maxLat},${maxLon});
  way["natural"="water"](${minLat},${minLon},${maxLat},${maxLon});
  
  // 建筑物
  way["building"](${minLat},${minLon},${maxLat},${maxLon});
  
  // 植被和地形
  way["natural"="tree_row"](${minLat},${minLon},${maxLat},${maxLon});
  way["landuse"="grass"](${minLat},${minLon},${maxLat},${maxLon});
  way["leisure"="garden"](${minLat},${minLon},${maxLat},${maxLon});
);
out geom;`;

    const response = await fetch(this.overpassURL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query
    });

    if (!response.ok) {
      throw new Error(`Overpass API错误: ${response.status}`);
    }

    const data = await response.json();
    console.log('Overpass数据获取成功，元素数:', data.elements?.length || 0);
    
    return this.processOverpassData(data);
  }

  /**
   * 处理Overpass数据，分类整理
   */
  processOverpassData(data) {
    const processed = {
      boundaries: [],
      roads: [],
      facilities: [],
      attractions: [],
      buildings: [],
      vegetation: []
    };

    data.elements?.forEach(element => {
      const tags = element.tags || {};
      
      // 分类处理
      if (element.type === 'way') {
        if (tags.leisure === 'park' || tags.tourism === 'zoo' || tags.leisure === 'garden') {
          processed.boundaries.push(element);
        } else if (tags.highway) {
          processed.roads.push(element);
        } else if (tags.building) {
          processed.buildings.push(element);
        } else if (tags.natural || tags.landuse === 'grass' || tags.leisure === 'garden') {
          processed.vegetation.push(element);
        }
      } else if (element.type === 'node') {
        if (tags.amenity || tags.tourism === 'information' || tags.entrance) {
          processed.facilities.push(element);
        } else if (tags.tourism === 'attraction' || tags.tourism === 'viewpoint') {
          processed.attractions.push(element);
        }
      }
    });

    console.log('数据分类完成:', {
      boundaries: processed.boundaries.length,
      roads: processed.roads.length,
      facilities: processed.facilities.length,
      attractions: processed.attractions.length,
      buildings: processed.buildings.length,
      vegetation: processed.vegetation.length
    });

    return processed;
  }

  /**
   * 获取高程数据（暂不实现）
   * 实际应用中可以接入高程API如Google Elevation API
   */
  async getElevationData(scenic) {
    console.log('高程数据获取暂未实现，返回null');
    return null;
  }

  /**
   * 获取天气数据（暂不实现）
   * 实际应用中可以接入天气API如OpenWeatherMap
   */
  async getWeatherData(scenic) {
    console.log('天气数据获取暂未实现，返回null');
    return null;
  }

  /**
   * 获取人流密度数据（暂不实现）
   * 实际应用中可以接入人流统计API或使用历史数据
   */
  async getCrowdData(scenic) {
    console.log('人流密度数据获取暂未实现，返回null');
    return null;
  }



  /**
   * 获取实时数据更新
   * @param {Object} scenic - 景区信息
   * @returns {Promise<Object>} 实时数据
   */
  async getRealTimeUpdates(scenic) {
    try {
      const [weatherUpdate, crowdUpdate] = await Promise.allSettled([
        this.getWeatherData(scenic),
        this.getCrowdData(scenic)
      ]);

      return {
        weather: weatherUpdate.status === 'fulfilled' ? weatherUpdate.value : null,
        crowd: crowdUpdate.status === 'fulfilled' ? crowdUpdate.value : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('获取实时数据失败:', error);
      return null;
    }
  }
}

export default new DataAcquisitionService();
