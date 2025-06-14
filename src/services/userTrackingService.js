/**
 * 用户轨迹数据处理服务
 * 负责收集、处理和分析用户轨迹数据，生成基于真实使用情况的热力线
 */
class UserTrackingService {
  constructor() {
    this.isTracking = false;
    this.trackingInterval = null;
    this.currentTrack = [];
    this.trackingConfig = {
      recordInterval: 1000,        // 每秒记录一次
      minAccuracy: 10,            // 最小GPS精度要求（米）
      maxSpeed: 20,               // 最大合理速度（km/h，轮椅用户）
      minDistance: 1,             // 最小移动距离（米）
      bufferSize: 1000            // 本地缓存轨迹点数量
    };
  }

  /**
   * 开始轨迹记录
   * @param {string} scenicId - 景区ID
   * @param {string} userId - 用户ID
   */
  async startTracking(scenicId, userId) {
    if (this.isTracking) {
      console.log('轨迹记录已在进行中');
      return;
    }

    try {
      // 请求位置权限
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        throw new Error('位置权限被拒绝');
      }

      this.isTracking = true;
      this.currentTrack = [];
      this.scenicId = scenicId;
      this.userId = userId;
      this.sessionId = this.generateSessionId();

      console.log('开始轨迹记录:', { scenicId, userId, sessionId: this.sessionId });

      // 开始定时记录位置
      this.trackingInterval = setInterval(() => {
        this.recordCurrentPosition();
      }, this.trackingConfig.recordInterval);

      // 记录开始时间
      this.trackStartTime = new Date();

    } catch (error) {
      console.error('启动轨迹记录失败:', error);
      throw error;
    }
  }

  /**
   * 停止轨迹记录
   */
  async stopTracking() {
    if (!this.isTracking) {
      console.log('轨迹记录未在进行');
      return null;
    }

    this.isTracking = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    const trackData = {
      sessionId: this.sessionId,
      scenicId: this.scenicId,
      userId: this.userId,
      startTime: this.trackStartTime,
      endTime: new Date(),
      points: [...this.currentTrack],
      totalPoints: this.currentTrack.length,
      duration: new Date() - this.trackStartTime
    };

    console.log('轨迹记录完成:', {
      点数: trackData.totalPoints,
      时长: Math.round(trackData.duration / 1000) + '秒'
    });

    // 上传轨迹数据
    await this.uploadTrackData(trackData);

    return trackData;
  }

  /**
   * 记录当前位置
   */
  recordCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          timestamp: new Date().toISOString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading
        };

        // 数据质量检查
        if (this.isValidPoint(point)) {
          this.currentTrack.push(point);
          
          // 本地缓存管理
          if (this.currentTrack.length > this.trackingConfig.bufferSize) {
            this.currentTrack = this.currentTrack.slice(-this.trackingConfig.bufferSize);
          }

          console.log('记录轨迹点:', point);
        } else {
          console.log('跳过无效轨迹点:', point);
        }
      },
      (error) => {
        console.error('获取位置失败:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000
      }
    );
  }

  /**
   * 验证轨迹点有效性
   */
  isValidPoint(point) {
    // 精度检查
    if (point.accuracy > this.trackingConfig.minAccuracy) {
      return false;
    }

    // 速度检查（排除异常快速移动）
    if (point.speed && point.speed > this.trackingConfig.maxSpeed / 3.6) {
      return false;
    }

    // 距离检查（排除GPS漂移）
    if (this.currentTrack.length > 0) {
      const lastPoint = this.currentTrack[this.currentTrack.length - 1];
      const distance = this.calculateDistance(
        lastPoint.latitude, lastPoint.longitude,
        point.latitude, point.longitude
      );

      if (distance < this.trackingConfig.minDistance) {
        return false;
      }
    }

    return true;
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

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 上传轨迹数据到服务器
   */
  async uploadTrackData(trackData) {
    try {
      // 这里应该调用后端API上传数据
      console.log('上传轨迹数据:', trackData);
      
      // 模拟API调用
      const response = await fetch('/api/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackData)
      });

      if (response.ok) {
        console.log('轨迹数据上传成功');
      } else {
        console.error('轨迹数据上传失败:', response.status);
      }
    } catch (error) {
      console.error('上传轨迹数据时出错:', error);
      // 保存到本地存储作为备份
      this.saveToLocalStorage(trackData);
    }
  }

  /**
   * 保存到本地存储
   */
  saveToLocalStorage(trackData) {
    try {
      const tracks = JSON.parse(localStorage.getItem('userTracks') || '[]');
      tracks.push(trackData);
      
      // 只保留最近的10条轨迹
      if (tracks.length > 10) {
        tracks.splice(0, tracks.length - 10);
      }
      
      localStorage.setItem('userTracks', JSON.stringify(tracks));
      console.log('轨迹数据已保存到本地存储');
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  }

  /**
   * 获取本地存储的轨迹数据
   */
  getLocalTracks() {
    try {
      return JSON.parse(localStorage.getItem('userTracks') || '[]');
    } catch (error) {
      console.error('读取本地轨迹数据失败:', error);
      return [];
    }
  }

  /**
   * 清除本地轨迹数据
   */
  clearLocalTracks() {
    localStorage.removeItem('userTracks');
    console.log('本地轨迹数据已清除');
  }

  /**
   * 获取当前轨迹状态
   */
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      currentPoints: this.currentTrack.length,
      sessionId: this.sessionId,
      startTime: this.trackStartTime,
      duration: this.isTracking ? new Date() - this.trackStartTime : 0
    };
  }

  /**
   * 轨迹数据预处理
   * @param {Array} rawPoints - 原始轨迹点
   * @returns {Array} 处理后的轨迹点
   */
  preprocessTrackData(rawPoints) {
    console.log('开始预处理轨迹数据，原始点数:', rawPoints.length);

    // 1. 时间排序
    const sortedPoints = rawPoints.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // 2. 去除异常点
    const filteredPoints = this.removeOutliers(sortedPoints);

    // 3. 轨迹平滑
    const smoothedPoints = this.smoothTrack(filteredPoints);

    // 4. 重采样（统一间距）
    const resampledPoints = this.resampleTrack(smoothedPoints);

    console.log('轨迹数据预处理完成:', {
      原始点数: rawPoints.length,
      过滤后: filteredPoints.length,
      平滑后: smoothedPoints.length,
      重采样后: resampledPoints.length
    });

    return resampledPoints;
  }

  /**
   * 去除异常点
   */
  removeOutliers(points) {
    if (points.length < 3) return points;

    const filtered = [points[0]]; // 保留第一个点

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      // 计算速度
      const speed1 = this.calculateSpeed(prev, curr);
      const speed2 = this.calculateSpeed(curr, next);

      // 如果速度异常，跳过该点
      if (speed1 > 20 || speed2 > 20) { // 20 km/h 阈值
        console.log('跳过异常点:', curr, '速度:', speed1, speed2);
        continue;
      }

      filtered.push(curr);
    }

    if (points.length > 0) {
      filtered.push(points[points.length - 1]); // 保留最后一个点
    }

    return filtered;
  }

  /**
   * 计算两点间速度（km/h）
   */
  calculateSpeed(point1, point2) {
    const distance = this.calculateDistance(
      point1.latitude, point1.longitude,
      point2.latitude, point2.longitude
    );
    const timeDiff = (new Date(point2.timestamp) - new Date(point1.timestamp)) / 1000; // 秒
    return (distance / timeDiff) * 3.6; // 转换为 km/h
  }

  /**
   * 轨迹平滑（移动平均）
   */
  smoothTrack(points) {
    if (points.length < 3) return points;

    const smoothed = [points[0]]; // 保留第一个点
    const windowSize = 3;

    for (let i = 1; i < points.length - 1; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(points.length, i + Math.floor(windowSize / 2) + 1);
      const window = points.slice(start, end);

      const avgLat = window.reduce((sum, p) => sum + p.latitude, 0) / window.length;
      const avgLon = window.reduce((sum, p) => sum + p.longitude, 0) / window.length;

      smoothed.push({
        ...points[i],
        latitude: avgLat,
        longitude: avgLon
      });
    }

    if (points.length > 0) {
      smoothed.push(points[points.length - 1]); // 保留最后一个点
    }

    return smoothed;
  }

  /**
   * 重采样轨迹（统一间距）
   */
  resampleTrack(points, targetInterval = 5) { // 5米间距
    if (points.length < 2) return points;

    const resampled = [points[0]];
    let currentDistance = 0;

    for (let i = 1; i < points.length; i++) {
      const distance = this.calculateDistance(
        points[i-1].latitude, points[i-1].longitude,
        points[i].latitude, points[i].longitude
      );

      currentDistance += distance;

      if (currentDistance >= targetInterval) {
        resampled.push(points[i]);
        currentDistance = 0;
      }
    }

    return resampled;
  }
}

export default new UserTrackingService();
