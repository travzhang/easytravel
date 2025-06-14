/**
 * 轨迹数据分析服务
 * 负责轨迹数据聚类、热力线生成和路径分析
 */
class TrackAnalyticsService {
  constructor() {
    this.clusterConfig = {
      eps: 5,                    // DBSCAN聚类半径（米）
      minPts: 3,                 // 最小聚类点数
      heatmapResolution: 10,     // 热力图网格分辨率（米）
      corridorWidth: 20,         // 路径走廊宽度（米）
      minTrackLength: 50,        // 最小轨迹长度（米）
      confidenceThreshold: 0.7   // 置信度阈值
    };
  }

  /**
   * 分析多条用户轨迹，生成热力线
   * @param {Array} tracks - 用户轨迹数组
   * @param {Object} scenicBounds - 景区边界
   * @returns {Array} 热力线数据
   */
  async analyzeTracksToHeatlines(tracks, scenicBounds) {
    console.log('开始分析用户轨迹，轨迹数:', tracks.length);

    if (!tracks || tracks.length === 0) {
      console.log('没有轨迹数据');
      return [];
    }

    // 1. 预处理所有轨迹
    const processedTracks = tracks.map(track => this.preprocessTrack(track));

    // 2. 提取所有轨迹点
    const allPoints = this.extractAllPoints(processedTracks);
    console.log('提取轨迹点总数:', allPoints.length);

    // 3. 轨迹点聚类
    const clusters = this.clusterTrackPoints(allPoints);
    console.log('聚类结果:', clusters.length, '个聚类');

    // 4. 生成路径走廊
    const corridors = this.generatePathCorridors(clusters, processedTracks);
    console.log('生成路径走廊:', corridors.length, '条');

    // 5. 计算热力值
    const heatlines = this.calculateHeatValues(corridors, processedTracks);
    console.log('生成热力线:', heatlines.length, '条');

    // 6. 过滤和优化
    const optimizedHeatlines = this.optimizeHeatlines(heatlines, scenicBounds);
    console.log('优化后热力线:', optimizedHeatlines.length, '条');

    return optimizedHeatlines;
  }

  /**
   * 预处理单条轨迹
   */
  preprocessTrack(track) {
    if (!track.points || track.points.length < 2) {
      return null;
    }

    // 计算轨迹总长度
    let totalLength = 0;
    for (let i = 1; i < track.points.length; i++) {
      totalLength += this.calculateDistance(
        track.points[i-1].latitude, track.points[i-1].longitude,
        track.points[i].latitude, track.points[i].longitude
      );
    }

    // 过滤太短的轨迹
    if (totalLength < this.clusterConfig.minTrackLength) {
      return null;
    }

    return {
      ...track,
      totalLength: totalLength,
      avgSpeed: totalLength / (track.duration / 1000), // m/s
      quality: this.assessTrackQuality(track)
    };
  }

  /**
   * 评估轨迹质量
   */
  assessTrackQuality(track) {
    let qualityScore = 1.0;

    // 基于点密度
    const pointDensity = track.points.length / (track.duration / 1000);
    if (pointDensity < 0.5) qualityScore *= 0.8; // 点密度太低

    // 基于GPS精度
    const avgAccuracy = track.points.reduce((sum, p) => sum + (p.accuracy || 10), 0) / track.points.length;
    if (avgAccuracy > 15) qualityScore *= 0.7; // 精度太低

    // 基于轨迹连续性
    let gaps = 0;
    for (let i = 1; i < track.points.length; i++) {
      const timeDiff = new Date(track.points[i].timestamp) - new Date(track.points[i-1].timestamp);
      if (timeDiff > 5000) gaps++; // 超过5秒的间隔
    }
    if (gaps > track.points.length * 0.1) qualityScore *= 0.8; // 间隔太多

    return Math.max(0.1, qualityScore);
  }

  /**
   * 提取所有轨迹点
   */
  extractAllPoints(tracks) {
    const allPoints = [];
    
    tracks.forEach((track, trackIndex) => {
      if (!track) return;
      
      track.points.forEach((point, pointIndex) => {
        allPoints.push({
          ...point,
          trackIndex: trackIndex,
          pointIndex: pointIndex,
          trackQuality: track.quality,
          weight: track.quality // 使用轨迹质量作为权重
        });
      });
    });

    return allPoints;
  }

  /**
   * DBSCAN聚类算法
   */
  clusterTrackPoints(points) {
    const clusters = [];
    const visited = new Set();
    const clustered = new Set();

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;
      
      visited.add(i);
      const neighbors = this.getNeighbors(points, i);
      
      if (neighbors.length < this.clusterConfig.minPts) {
        // 噪声点
        continue;
      }

      // 创建新聚类
      const cluster = [];
      this.expandCluster(points, i, neighbors, cluster, visited, clustered);
      
      if (cluster.length >= this.clusterConfig.minPts) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * 获取邻居点
   */
  getNeighbors(points, pointIndex) {
    const neighbors = [];
    const currentPoint = points[pointIndex];

    for (let i = 0; i < points.length; i++) {
      if (i === pointIndex) continue;
      
      const distance = this.calculateDistance(
        currentPoint.latitude, currentPoint.longitude,
        points[i].latitude, points[i].longitude
      );

      if (distance <= this.clusterConfig.eps) {
        neighbors.push(i);
      }
    }

    return neighbors;
  }

  /**
   * 扩展聚类
   */
  expandCluster(points, pointIndex, neighbors, cluster, visited, clustered) {
    cluster.push(points[pointIndex]);
    clustered.add(pointIndex);

    for (let i = 0; i < neighbors.length; i++) {
      const neighborIndex = neighbors[i];
      
      if (!visited.has(neighborIndex)) {
        visited.add(neighborIndex);
        const neighborNeighbors = this.getNeighbors(points, neighborIndex);
        
        if (neighborNeighbors.length >= this.clusterConfig.minPts) {
          neighbors.push(...neighborNeighbors);
        }
      }

      if (!clustered.has(neighborIndex)) {
        cluster.push(points[neighborIndex]);
        clustered.add(neighborIndex);
      }
    }
  }

  /**
   * 生成路径走廊
   */
  generatePathCorridors(clusters, tracks) {
    const corridors = [];

    // 为每个聚类生成路径走廊
    clusters.forEach((cluster, clusterIndex) => {
      if (cluster.length < this.clusterConfig.minPts) return;

      // 计算聚类中心
      const center = this.calculateClusterCenter(cluster);
      
      // 找到通过该聚类的轨迹段
      const passingTracks = this.findPassingTracks(cluster, tracks);
      
      if (passingTracks.length < 2) return; // 至少需要2条轨迹

      // 生成走廊路径
      const corridor = this.generateCorridorPath(center, passingTracks, cluster);
      
      if (corridor) {
        corridors.push({
          id: `corridor_${clusterIndex}`,
          center: center,
          path: corridor.path,
          width: corridor.width,
          trackCount: passingTracks.length,
          confidence: this.calculateCorridorConfidence(passingTracks, cluster)
        });
      }
    });

    return corridors;
  }

  /**
   * 计算聚类中心
   */
  calculateClusterCenter(cluster) {
    const totalWeight = cluster.reduce((sum, point) => sum + point.weight, 0);
    
    const weightedLat = cluster.reduce((sum, point) => 
      sum + point.latitude * point.weight, 0) / totalWeight;
    const weightedLon = cluster.reduce((sum, point) => 
      sum + point.longitude * point.weight, 0) / totalWeight;

    return {
      latitude: weightedLat,
      longitude: weightedLon,
      weight: totalWeight,
      pointCount: cluster.length
    };
  }

  /**
   * 找到通过聚类的轨迹
   */
  findPassingTracks(cluster, tracks) {
    const trackIndices = new Set(cluster.map(point => point.trackIndex));
    return Array.from(trackIndices).map(index => tracks[index]).filter(track => track);
  }

  /**
   * 生成走廊路径
   */
  generateCorridorPath(center, passingTracks, cluster) {
    // 简化版：使用聚类中心作为路径点
    // 实际应用中可以使用更复杂的路径拟合算法
    
    const pathPoints = [];
    
    // 按时间顺序排列聚类中的点
    const sortedPoints = cluster.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // 每隔一定距离取一个点作为路径点
    let lastAddedPoint = null;
    const minDistance = 5; // 5米

    for (const point of sortedPoints) {
      if (!lastAddedPoint || 
          this.calculateDistance(
            lastAddedPoint.latitude, lastAddedPoint.longitude,
            point.latitude, point.longitude
          ) >= minDistance) {
        
        pathPoints.push({
          latitude: point.latitude,
          longitude: point.longitude,
          weight: point.weight
        });
        lastAddedPoint = point;
      }
    }

    if (pathPoints.length < 2) return null;

    return {
      path: pathPoints,
      width: this.clusterConfig.corridorWidth
    };
  }

  /**
   * 计算走廊置信度
   */
  calculateCorridorConfidence(passingTracks, cluster) {
    // 基于轨迹数量和质量计算置信度
    const trackCount = passingTracks.length;
    const avgQuality = passingTracks.reduce((sum, track) => sum + track.quality, 0) / trackCount;
    const pointDensity = cluster.length / trackCount;

    let confidence = 0.5; // 基础置信度

    // 轨迹数量加成
    confidence += Math.min(trackCount * 0.1, 0.3);

    // 质量加成
    confidence += avgQuality * 0.2;

    // 点密度加成
    confidence += Math.min(pointDensity * 0.01, 0.1);

    return Math.min(1.0, confidence);
  }

  /**
   * 计算热力值
   */
  calculateHeatValues(corridors, tracks) {
    return corridors.map(corridor => {
      // 基于通过该走廊的轨迹数量和质量计算热力值
      let heatValue = 0.3; // 基础热力值

      // 轨迹数量影响
      heatValue += Math.min(corridor.trackCount * 0.1, 0.4);

      // 置信度影响
      heatValue += corridor.confidence * 0.3;

      // 确保热力值在合理范围内
      heatValue = Math.max(0.1, Math.min(1.0, heatValue));

      return {
        ...corridor,
        heat: heatValue,
        coordinates: corridor.path.map(point => [point.longitude, point.latitude]),
        accessibility: this.assessPathAccessibility(corridor, tracks)
      };
    });
  }

  /**
   * 评估路径无障碍性
   */
  assessPathAccessibility(corridor, tracks) {
    // 基于通过该路径的轨迹特征评估无障碍性
    const passingTracks = tracks.filter((track, index) => 
      corridor.trackCount > 0 // 简化判断
    );

    let accessibilityScore = 0.5;

    // 基于平均速度判断（轮椅用户速度相对较慢）
    const avgSpeed = passingTracks.reduce((sum, track) => sum + track.avgSpeed, 0) / passingTracks.length;
    if (avgSpeed < 1.5) accessibilityScore += 0.2; // 慢速通行，可能更适合轮椅

    // 基于轨迹平滑度判断
    // 这里可以添加更复杂的分析逻辑

    if (accessibilityScore > 0.8) return 'yes';
    if (accessibilityScore > 0.5) return 'limited';
    return 'no';
  }

  /**
   * 优化热力线
   */
  optimizeHeatlines(heatlines, scenicBounds) {
    // 过滤低置信度的热力线
    let filtered = heatlines.filter(line => 
      line.confidence >= this.clusterConfig.confidenceThreshold
    );

    // 合并相近的热力线
    filtered = this.mergeNearbyHeatlines(filtered);

    // 按热力值排序
    filtered.sort((a, b) => b.heat - a.heat);

    return filtered;
  }

  /**
   * 合并相近的热力线
   */
  mergeNearbyHeatlines(heatlines) {
    // 简化版合并逻辑
    // 实际应用中可以使用更复杂的路径相似度算法
    return heatlines; // 暂时不合并
  }

  /**
   * 计算两点间距离（米）
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default new TrackAnalyticsService();
