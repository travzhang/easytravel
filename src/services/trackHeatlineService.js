/**
 * 轨迹热力线服务
 * 收集用户GPS轨迹数据，生成基于数据密度的热力线
 * 绿色线条表示无障碍用户经常走的安全路径
 * 灰色线条表示很少有人走的路径，可能存在障碍
 */

class TrackHeatlineService {
  constructor() {
    this.isRecording = false;
    this.currentTrack = null;
    this.trackBuffer = [];
    this.heatlineData = new Map(); // 存储路径段的热力数据
    this.pathSegments = new Map(); // 存储路径段
    this.watchId = null;
    this.lastPosition = null;
    this.minDistance = 5; // 最小记录距离（米）
    this.segmentLength = 20; // 路径段长度（米）
  }

  /**
   * 开始记录轨迹
   * @param {Object} userProfile 用户配置信息
   * @param {string} scenicSpotId 景点ID
   */
  async startTracking(userProfile, scenicSpotId) {
    if (this.isRecording) {
      console.warn('轨迹记录已在进行中');
      return;
    }

    this.isRecording = true;
    this.currentTrack = {
      id: this.generateTrackId(),
      userId: userProfile.userId,
      scenicSpotId,
      userProfile: {
        disabilityType: userProfile.disabilityType,
        assistiveDevice: userProfile.assistiveDevice,
        mobilityLevel: userProfile.mobilityLevel
      },
      startTime: new Date().toISOString(),
      points: [],
      segments: []
    };

    // 开始GPS定位监听
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handlePositionUpdate(position),
        (error) => this.handlePositionError(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );
    } else {
      throw new Error('设备不支持GPS定位');
    }

    console.log('开始记录轨迹:', this.currentTrack.id);
  }

  /**
   * 停止记录轨迹
   */
  async stopTracking() {
    if (!this.isRecording) {
      console.warn('没有正在进行的轨迹记录');
      return null;
    }

    this.isRecording = false;
    
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.currentTrack) {
      this.currentTrack.endTime = new Date().toISOString();
      this.currentTrack.duration = new Date(this.currentTrack.endTime) - new Date(this.currentTrack.startTime);
      
      // 处理轨迹数据
      await this.processTrackData(this.currentTrack);
      
      // 上传轨迹数据
      await this.uploadTrackData(this.currentTrack);
      
      const completedTrack = { ...this.currentTrack };
      this.currentTrack = null;
      
      console.log('轨迹记录完成:', completedTrack.id);
      return completedTrack;
    }

    return null;
  }

  /**
   * 处理GPS位置更新
   */
  handlePositionUpdate(position) {
    if (!this.isRecording || !this.currentTrack) return;

    const newPoint = {
      timestamp: new Date().toISOString(),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed || 0,
      heading: position.coords.heading || 0
    };

    // 检查距离阈值
    if (this.lastPosition) {
      const distance = this.calculateDistance(
        this.lastPosition.latitude,
        this.lastPosition.longitude,
        newPoint.latitude,
        newPoint.longitude
      );

      if (distance < this.minDistance) {
        return; // 距离太近，不记录
      }
    }

    // 添加到轨迹点
    this.currentTrack.points.push(newPoint);
    this.lastPosition = newPoint;

    // 生成路径段
    if (this.currentTrack.points.length >= 2) {
      this.generatePathSegment();
    }

    console.log('记录GPS点:', newPoint);
  }

  /**
   * 处理GPS定位错误
   */
  handlePositionError(error) {
    console.error('GPS定位错误:', error);
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error('用户拒绝了定位请求');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('位置信息不可用');
        break;
      case error.TIMEOUT:
        console.error('定位请求超时');
        break;
    }
  }

  /**
   * 生成路径段
   */
  generatePathSegment() {
    const points = this.currentTrack.points;
    if (points.length < 2) return;

    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];

    const segment = {
      id: this.generateSegmentId(),
      scenicSpotId: this.currentTrack.scenicSpotId,
      startPoint: secondLastPoint,
      endPoint: lastPoint,
      distance: this.calculateDistance(
        secondLastPoint.latitude,
        secondLastPoint.longitude,
        lastPoint.latitude,
        lastPoint.longitude
      ),
      userProfile: this.currentTrack.userProfile,
      timestamp: lastPoint.timestamp
    };

    this.currentTrack.segments.push(segment);
    
    // 更新热力数据
    this.updateHeatlineData(segment);
  }

  /**
   * 更新热力线数据
   */
  updateHeatlineData(segment) {
    // 将路径段转换为网格坐标
    const gridKey = this.getGridKey(segment.startPoint, segment.endPoint);
    
    if (!this.heatlineData.has(gridKey)) {
      this.heatlineData.set(gridKey, {
        count: 0,
        userTypes: new Set(),
        segments: [],
        avgSpeed: 0,
        totalDistance: 0
      });
    }

    const heatData = this.heatlineData.get(gridKey);
    heatData.count++;
    heatData.userTypes.add(segment.userProfile.disabilityType);
    heatData.segments.push(segment);
    heatData.totalDistance += segment.distance;
    heatData.avgSpeed = heatData.totalDistance / heatData.segments.length;

    this.heatlineData.set(gridKey, heatData);
  }

  /**
   * 获取网格键值（用于路径段聚合）
   */
  getGridKey(startPoint, endPoint) {
    // 将GPS坐标转换为网格坐标
    const gridSize = 0.0001; // 约10米的网格
    const startGrid = {
      lat: Math.floor(startPoint.latitude / gridSize) * gridSize,
      lng: Math.floor(startPoint.longitude / gridSize) * gridSize
    };
    const endGrid = {
      lat: Math.floor(endPoint.latitude / gridSize) * gridSize,
      lng: Math.floor(endPoint.longitude / gridSize) * gridSize
    };

    return `${startGrid.lat},${startGrid.lng}-${endGrid.lat},${endGrid.lng}`;
  }

  /**
   * 生成热力线数据用于地图显示
   */
  generateHeatlineForMap(scenicSpotId) {
    const heatlines = [];
    
    this.heatlineData.forEach((heatData, gridKey) => {
      if (heatData.count === 0) return;

      // 过滤特定景点的数据（如果需要）
      if (scenicSpotId && heatData.segments.length > 0) {
        const hasMatchingSpot = heatData.segments.some(segment => 
          segment.scenicSpotId === scenicSpotId
        );
        if (!hasMatchingSpot) return;
      }

      // 解析网格键值获取坐标
      const [start, end] = gridKey.split('-');
      const [startLat, startLng] = start.split(',').map(Number);
      const [endLat, endLng] = end.split(',').map(Number);

      // 计算热力强度（0-1）
      const intensity = Math.min(heatData.count / 10, 1); // 10次以上为最高强度
      
      // 根据强度确定颜色
      const color = this.getHeatlineColor(intensity);
      const weight = Math.max(2, intensity * 8); // 线条粗细

      heatlines.push({
        path: [
          [startLng, startLat],
          [endLng, endLat]
        ],
        intensity,
        count: heatData.count,
        color,
        weight,
        userTypes: Array.from(heatData.userTypes),
        avgSpeed: heatData.avgSpeed,
        opacity: Math.max(0.3, intensity)
      });
    });

    return heatlines.sort((a, b) => b.intensity - a.intensity); // 按强度排序
  }

  /**
   * 根据热力强度获取颜色
   */
  getHeatlineColor(intensity) {
    if (intensity >= 0.7) {
      return '#00C851'; // 深绿色 - 非常安全
    } else if (intensity >= 0.5) {
      return '#2BBBAD'; // 青绿色 - 比较安全
    } else if (intensity >= 0.3) {
      return '#FF8800'; // 橙色 - 一般
    } else if (intensity >= 0.1) {
      return '#FF4444'; // 红色 - 较少人走
    } else {
      return '#9E9E9E'; // 灰色 - 很少人走，可能有问题
    }
  }

  /**
   * 在地图上绘制热力线
   */
  drawHeatlines(map, scenicSpotId) {
    if (!map || !window.AMap) {
      console.error('地图实例或高德地图API不可用');
      return;
    }

    // 清除现有热力线
    this.clearHeatlines(map);

    // 获取热力线数据
    const heatlines = this.generateHeatlineForMap(scenicSpotId);

    // 绘制热力线
    heatlines.forEach(heatline => {
      const polyline = new window.AMap.Polyline({
        path: heatline.path,
        strokeColor: heatline.color,
        strokeWeight: heatline.weight,
        strokeOpacity: heatline.opacity,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 100 + Math.floor(heatline.intensity * 100)
      });

      // 添加点击事件显示详细信息
      polyline.on('click', () => {
        this.showHeatlineInfo(map, heatline);
      });

      map.add(polyline);
      
      // 标记为热力线，便于后续清除
      polyline._isHeatline = true;
    });

    console.log(`绘制了 ${heatlines.length} 条热力线`);
    return heatlines;
  }

  /**
   * 清除地图上的热力线
   */
  clearHeatlines(map) {
    if (!map) return;

    const overlays = map.getAllOverlays('polyline');
    overlays.forEach(overlay => {
      if (overlay._isHeatline) {
        map.remove(overlay);
      }
    });
  }

  /**
   * 显示热力线详细信息
   */
  showHeatlineInfo(map, heatline) {
    const content = `
      <div class="heatline-info">
        <h4>路径信息</h4>
        <p><strong>通行次数:</strong> ${heatline.count} 次</p>
        <p><strong>安全等级:</strong> ${this.getSafetyLevel(heatline.intensity)}</p>
        <p><strong>用户类型:</strong> ${heatline.userTypes.join(', ')}</p>
        <p><strong>平均速度:</strong> ${heatline.avgSpeed.toFixed(1)} m/s</p>
        <div class="safety-indicator" style="background-color: ${heatline.color}; width: 100%; height: 10px; border-radius: 5px;"></div>
      </div>
    `;

    const infoWindow = new window.AMap.InfoWindow({
      content,
      offset: new window.AMap.Pixel(0, -10)
    });

    const centerPoint = [
      (heatline.path[0][0] + heatline.path[1][0]) / 2,
      (heatline.path[0][1] + heatline.path[1][1]) / 2
    ];

    infoWindow.open(map, centerPoint);
  }

  /**
   * 获取安全等级描述
   */
  getSafetyLevel(intensity) {
    if (intensity >= 0.7) return '非常安全';
    if (intensity >= 0.5) return '比较安全';
    if (intensity >= 0.3) return '一般';
    if (intensity >= 0.1) return '需要注意';
    return '可能有障碍';
  }

  /**
   * 处理轨迹数据
   */
  async processTrackData(track) {
    // 计算轨迹统计信息
    track.stats = {
      totalDistance: this.calculateTotalDistance(track.points),
      totalTime: track.duration,
      avgSpeed: this.calculateAverageSpeed(track.points),
      maxSpeed: this.calculateMaxSpeed(track.points),
      pauseCount: this.countPauses(track.points),
      segmentCount: track.segments.length
    };

    // 分析轨迹质量
    track.quality = this.analyzeTrackQuality(track);
  }

  /**
   * 上传轨迹数据到服务器
   */
  async uploadTrackData(track) {
    try {
      const response = await fetch('/api/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          track,
          heatlineData: Array.from(this.heatlineData.entries())
        })
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('轨迹数据上传成功:', result);
      return result;
    } catch (error) {
      console.error('轨迹数据上传失败:', error);
      // 保存到本地存储作为备份
      this.saveToLocalStorage(track);
      throw error;
    }
  }

  /**
   * 从服务器加载热力线数据
   */
  async loadHeatlineData(scenicSpotId) {
    try {
      const response = await fetch(`/api/heatlines/${scenicSpotId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`加载失败: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 重建热力数据Map
      this.heatlineData.clear();
      data.heatlineData.forEach(([key, value]) => {
        this.heatlineData.set(key, {
          ...value,
          userTypes: new Set(value.userTypes)
        });
      });

      console.log(`加载了 ${this.heatlineData.size} 个热力数据段`);
      return data;
    } catch (error) {
      console.error('热力线数据加载失败:', error);
      // 尝试从本地存储加载
      this.loadFromLocalStorage(scenicSpotId);
      throw error;
    }
  }

  /**
   * 保存到本地存储
   */
  saveToLocalStorage(track) {
    try {
      const key = `track_${track.scenicSpotId}_${track.id}`;
      localStorage.setItem(key, JSON.stringify(track));
      
      // 保存热力数据
      const heatlineKey = `heatline_${track.scenicSpotId}`;
      const existingData = JSON.parse(localStorage.getItem(heatlineKey) || '[]');
      existingData.push(...Array.from(this.heatlineData.entries()));
      localStorage.setItem(heatlineKey, JSON.stringify(existingData));
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  }

  /**
   * 从本地存储加载
   */
  loadFromLocalStorage(scenicSpotId) {
    try {
      const heatlineKey = `heatline_${scenicSpotId}`;
      const data = JSON.parse(localStorage.getItem(heatlineKey) || '[]');
      
      this.heatlineData.clear();
      data.forEach(([key, value]) => {
        this.heatlineData.set(key, {
          ...value,
          userTypes: new Set(value.userTypes)
        });
      });
      
      console.log(`从本地存储加载了 ${this.heatlineData.size} 个热力数据段`);
    } catch (error) {
      console.error('从本地存储加载失败:', error);
    }
  }

  // 工具方法
  calculateDistance(lat1, lng1, lat2, lng2) {
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
  }

  calculateTotalDistance(points) {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += this.calculateDistance(
        points[i - 1].latitude,
        points[i - 1].longitude,
        points[i].latitude,
        points[i].longitude
      );
    }
    return total;
  }

  calculateAverageSpeed(points) {
    if (points.length < 2) return 0;
    const speeds = points.filter(p => p.speed > 0).map(p => p.speed);
    return speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
  }

  calculateMaxSpeed(points) {
    return Math.max(...points.map(p => p.speed || 0));
  }

  countPauses(points) {
    let pauseCount = 0;
    for (let i = 1; i < points.length; i++) {
      const timeDiff = new Date(points[i].timestamp) - new Date(points[i - 1].timestamp);
      if (timeDiff > 30000) { // 30秒以上算作停顿
        pauseCount++;
      }
    }
    return pauseCount;
  }

  analyzeTrackQuality(track) {
    const points = track.points;
    if (points.length < 10) return 'poor';

    const avgAccuracy = points.reduce((sum, p) => sum + p.accuracy, 0) / points.length;
    const timeGaps = [];
    
    for (let i = 1; i < points.length; i++) {
      const gap = new Date(points[i].timestamp) - new Date(points[i - 1].timestamp);
      timeGaps.push(gap);
    }

    const avgTimeGap = timeGaps.reduce((a, b) => a + b, 0) / timeGaps.length;

    if (avgAccuracy < 10 && avgTimeGap < 5000) return 'excellent';
    if (avgAccuracy < 20 && avgTimeGap < 10000) return 'good';
    if (avgAccuracy < 50 && avgTimeGap < 30000) return 'fair';
    return 'poor';
  }

  generateTrackId() {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSegmentId() {
    return `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }
}

// 创建单例实例
const trackHeatlineService = new TrackHeatlineService();

export default trackHeatlineService; 