/**
 * 模拟热力线数据生成器
 * 为演示轨迹热力线功能提供示例数据
 */

import trackHeatlineService from './trackHeatlineService';

/**
 * 生成模拟的GPS轨迹数据
 */
export const generateMockTrackData = (scenicSpotId = 'forbidden_city') => {
  // 故宫的几条主要路径
  const forbiddenCityPaths = [
    // 中轴线路径（高频路径）
    [
      [116.397428, 39.90923], // 午门
      [116.397428, 39.91023], // 太和门
      [116.397428, 39.91123], // 太和殿
      [116.397428, 39.91223], // 中和殿
      [116.397428, 39.91323], // 保和殿
      [116.397428, 39.91423], // 乾清门
      [116.397428, 39.91523], // 乾清宫
      [116.397428, 39.91623], // 坤宁宫
      [116.397428, 39.91723], // 御花园
      [116.397428, 39.91823]  // 神武门
    ],
    // 东路路径（中频路径）
    [
      [116.398428, 39.90923], // 东华门
      [116.398428, 39.91023], // 文华殿
      [116.398428, 39.91123], // 东六宫
      [116.398428, 39.91223], // 景阳宫
      [116.398428, 39.91323], // 承乾宫
      [116.398428, 39.91423], // 钟粹宫
      [116.398428, 39.91523], // 景仁宫
      [116.398428, 39.91623]  // 延禧宫
    ],
    // 西路路径（中频路径）
    [
      [116.396428, 39.90923], // 西华门
      [116.396428, 39.91023], // 武英殿
      [116.396428, 39.91123], // 西六宫
      [116.396428, 39.91223], // 储秀宫
      [116.396428, 39.91323], // 翊坤宫
      [116.396428, 39.91423], // 永寿宫
      [116.396428, 39.91523], // 咸福宫
      [116.396428, 39.91623]  // 长春宫
    ],
    // 珍宝馆路径（低频路径）
    [
      [116.399428, 39.91523], // 珍宝馆入口
      [116.399428, 39.91623], // 珍宝馆展厅1
      [116.399428, 39.91723], // 珍宝馆展厅2
      [116.399428, 39.91823]  // 珍宝馆出口
    ],
    // 钟表馆路径（低频路径）
    [
      [116.395428, 39.91523], // 钟表馆入口
      [116.395428, 39.91623], // 钟表馆展厅
      [116.395428, 39.91723]  // 钟表馆出口
    ]
  ];

  // 不同用户类型
  const userTypes = [
    {
      disabilityType: 'wheelchair',
      assistiveDevice: 'manual_wheelchair',
      mobilityLevel: 'moderate'
    },
    {
      disabilityType: 'wheelchair',
      assistiveDevice: 'electric_wheelchair',
      mobilityLevel: 'good'
    },
    {
      disabilityType: 'visual_impairment',
      assistiveDevice: 'guide_dog',
      mobilityLevel: 'good'
    },
    {
      disabilityType: 'visual_impairment',
      assistiveDevice: 'white_cane',
      mobilityLevel: 'moderate'
    },
    {
      disabilityType: 'mobility_impairment',
      assistiveDevice: 'walking_stick',
      mobilityLevel: 'limited'
    }
  ];

  // 路径频率权重（模拟不同路径的使用频率）
  const pathWeights = [
    15, // 中轴线 - 最高频
    8,  // 东路 - 中频
    8,  // 西路 - 中频
    3,  // 珍宝馆 - 低频
    2   // 钟表馆 - 最低频
  ];

  const tracks = [];

  // 为每条路径生成多个轨迹
  forbiddenCityPaths.forEach((path, pathIndex) => {
    const weight = pathWeights[pathIndex];
    
    for (let i = 0; i < weight; i++) {
      const userProfile = userTypes[Math.floor(Math.random() * userTypes.length)];
      const track = generateSingleTrack(path, userProfile, scenicSpotId);
      tracks.push(track);
    }
  });

  return tracks;
};

/**
 * 生成单个轨迹数据
 */
const generateSingleTrack = (path, userProfile, scenicSpotId) => {
  const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // 过去7天内随机时间
  const points = [];
  const segments = [];

  path.forEach((coord, index) => {
    // 添加一些随机偏移，模拟真实GPS数据
    const lat = coord[1] + (Math.random() - 0.5) * 0.0001;
    const lng = coord[0] + (Math.random() - 0.5) * 0.0001;
    
    const point = {
      timestamp: new Date(startTime.getTime() + index * 60000).toISOString(), // 每分钟一个点
      latitude: lat,
      longitude: lng,
      accuracy: Math.random() * 10 + 5, // 5-15米精度
      speed: Math.random() * 2 + 0.5, // 0.5-2.5 m/s
      heading: Math.random() * 360
    };

    points.push(point);

    // 生成路径段
    if (index > 0) {
      const prevPoint = points[index - 1];
      const segment = {
        id: `segment_${Date.now()}_${index}`,
        scenicSpotId,
        startPoint: {
          latitude: prevPoint.latitude,
          longitude: prevPoint.longitude,
          timestamp: prevPoint.timestamp
        },
        endPoint: {
          latitude: point.latitude,
          longitude: point.longitude,
          timestamp: point.timestamp
        },
        distance: calculateDistance(
          prevPoint.latitude,
          prevPoint.longitude,
          point.latitude,
          point.longitude
        ),
        userProfile,
        timestamp: point.timestamp
      };

      segments.push(segment);
    }
  });

  return {
    id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: `user_${Math.random().toString(36).substr(2, 9)}`,
    scenicSpotId,
    userProfile,
    startTime: startTime.toISOString(),
    endTime: new Date(startTime.getTime() + points.length * 60000).toISOString(),
    points,
    segments,
    stats: {
      totalDistance: segments.reduce((sum, seg) => sum + seg.distance, 0),
      totalTime: points.length * 60000,
      avgSpeed: points.reduce((sum, p) => sum + p.speed, 0) / points.length,
      maxSpeed: Math.max(...points.map(p => p.speed)),
      pauseCount: Math.floor(Math.random() * 3),
      segmentCount: segments.length
    },
    quality: 'good'
  };
};

/**
 * 计算两点间距离
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // 地球半径（米）
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * 加载模拟数据到热力线服务
 */
export const loadMockDataToService = (scenicSpotId = 'forbidden_city') => {
  const tracks = generateMockTrackData(scenicSpotId);
  
  console.log(`生成了 ${tracks.length} 条模拟轨迹数据`);

  // 将轨迹数据加载到热力线服务
  tracks.forEach(track => {
    track.segments.forEach(segment => {
      trackHeatlineService.updateHeatlineData(segment);
    });
  });

  console.log(`热力线数据已加载，共 ${trackHeatlineService.heatlineData.size} 个数据段`);
  
  return tracks;
};

/**
 * 清除所有热力线数据
 */
export const clearMockData = () => {
  trackHeatlineService.heatlineData.clear();
  console.log('热力线数据已清除');
};

/**
 * 获取热力线统计信息
 */
export const getHeatlineStats = (scenicSpotId) => {
  const heatlines = trackHeatlineService.generateHeatlineForMap(scenicSpotId);
  
  return {
    totalLines: heatlines.length,
    safeLines: heatlines.filter(h => h.intensity >= 0.5).length,
    warningLines: heatlines.filter(h => h.intensity < 0.3).length,
    avgIntensity: heatlines.reduce((sum, h) => sum + h.intensity, 0) / heatlines.length || 0,
    maxIntensity: Math.max(...heatlines.map(h => h.intensity), 0),
    userTypes: [...new Set(heatlines.flatMap(h => h.userTypes))]
  };
}; 