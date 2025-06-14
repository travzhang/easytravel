/**
 * AI驱动的无障碍数据分析服务
 * 收集用户数据，进行AI分析，生成无障碍地图洞察
 */

class AIAnalyticsService {
  constructor() {
    this.dataCollectionEnabled = false;
    this.currentRoute = null;
    this.userProfile = null;
    this.dataBuffer = [];
  }

  /**
   * 初始化AI分析服务
   */
  async initialize(userProfile) {
    this.userProfile = userProfile;
    this.dataCollectionEnabled = true;
    console.log('AI Analytics Service initialized for user:', userProfile.disabilityType);
  }

  /**
   * 开始路线记录
   */
  startRouteRecording(routeInfo) {
    this.currentRoute = {
      id: this.generateRouteId(),
      startTime: new Date().toISOString(),
      origin: routeInfo.origin,
      destination: routeInfo.destination,
      plannedPath: routeInfo.plannedPath,
      actualPath: [],
      dataPoints: [],
      environmentData: {
        weather: routeInfo.weather,
        timeOfDay: this.getTimeOfDay(),
        crowdLevel: 'unknown'
      }
    };
  }

  /**
   * 收集位置数据点
   */
  collectDataPoint(location, metadata = {}) {
    if (!this.dataCollectionEnabled || !this.currentRoute) return;

    const dataPoint = {
      timestamp: new Date().toISOString(),
      location: {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy
      },
      userProfile: {
        disabilityType: this.userProfile.disabilityType,
        assistiveDevice: this.userProfile.assistiveDevice,
        mobilityLevel: this.userProfile.mobilityLevel
      },
      movementData: {
        speed: this.calculateSpeed(location),
        direction: location.heading,
        altitude: location.altitude
      },
      contextData: {
        ...metadata,
        batteryLevel: this.getBatteryLevel(),
        networkQuality: this.getNetworkQuality()
      }
    };

    this.currentRoute.dataPoints.push(dataPoint);
    this.currentRoute.actualPath.push([location.latitude, location.longitude]);

    // 缓存数据，批量上传
    this.dataBuffer.push(dataPoint);
    if (this.dataBuffer.length >= 10) {
      this.uploadDataBatch();
    }
  }

  /**
   * 分析用户行为模式
   */
  async analyzeUserBehavior(dataPoints) {
    const analysis = {
      movementPatterns: this.analyzeMovementPatterns(dataPoints),
      difficultyAreas: this.identifyDifficultyAreas(dataPoints),
      preferredRoutes: this.analyzeRoutePreferences(dataPoints),
      accessibilityIssues: this.detectAccessibilityIssues(dataPoints)
    };

    return analysis;
  }

  /**
   * 识别移动模式
   */
  analyzeMovementPatterns(dataPoints) {
    const speeds = dataPoints.map(p => p.movementData.speed);
    const pauses = this.detectPauses(dataPoints);
    const detours = this.detectDetours(dataPoints);

    return {
      averageSpeed: this.calculateAverage(speeds),
      speedVariation: this.calculateVariation(speeds),
      pauseFrequency: pauses.length / dataPoints.length,
      averagePauseDuration: this.calculateAverage(pauses.map(p => p.duration)),
      detourCount: detours.length,
      totalDetourDistance: detours.reduce((sum, d) => sum + d.distance, 0)
    };
  }

  /**
   * 识别困难区域
   */
  identifyDifficultyAreas(dataPoints) {
    const difficultyAreas = [];
    
    for (let i = 1; i < dataPoints.length; i++) {
      const prev = dataPoints[i - 1];
      const curr = dataPoints[i];
      
      // 检测速度大幅下降
      if (curr.movementData.speed < prev.movementData.speed * 0.5) {
        difficultyAreas.push({
          location: curr.location,
          type: 'speed_reduction',
          severity: this.calculateDifficultySeverity(prev, curr),
          timestamp: curr.timestamp
        });
      }

      // 检测长时间停留
      const timeDiff = new Date(curr.timestamp) - new Date(prev.timestamp);
      if (timeDiff > 30000) { // 30秒以上
        difficultyAreas.push({
          location: prev.location,
          type: 'prolonged_pause',
          duration: timeDiff,
          timestamp: prev.timestamp
        });
      }
    }

    return difficultyAreas;
  }

  /**
   * 检测无障碍问题
   */
  detectAccessibilityIssues(dataPoints) {
    const issues = [];
    
    // 基于AI模型预测（这里简化为规则）
    dataPoints.forEach(point => {
      // 检测可能的障碍物
      if (point.movementData.speed < 0.5 && point.userProfile.disabilityType === 'wheelchair') {
        issues.push({
          type: 'potential_obstacle',
          location: point.location,
          confidence: 0.7,
          description: '检测到可能的轮椅通行障碍'
        });
      }

      // 检测坡度问题
      if (point.movementData.altitude && this.calculateSlope(point) > 0.08) {
        issues.push({
          type: 'steep_slope',
          location: point.location,
          confidence: 0.8,
          slope: this.calculateSlope(point),
          description: '坡度过陡，可能影响轮椅通行'
        });
      }
    });

    return issues;
  }

  /**
   * 生成AI洞察报告
   */
  async generateInsights(routeData) {
    const analysis = await this.analyzeUserBehavior(routeData.dataPoints);
    
    return {
      routeId: routeData.id,
      userProfile: this.userProfile,
      overallRating: this.calculateOverallRating(analysis),
      insights: {
        accessibility: this.generateAccessibilityInsights(analysis),
        navigation: this.generateNavigationInsights(analysis),
        recommendations: this.generateRecommendations(analysis)
      },
      dataQuality: this.assessDataQuality(routeData),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 生成无障碍洞察
   */
  generateAccessibilityInsights(analysis) {
    const insights = [];

    if (analysis.difficultyAreas.length > 0) {
      insights.push({
        type: 'difficulty_areas',
        count: analysis.difficultyAreas.length,
        message: `发现 ${analysis.difficultyAreas.length} 个潜在困难区域`,
        areas: analysis.difficultyAreas
      });
    }

    if (analysis.movementPatterns.averageSpeed < 0.8) {
      insights.push({
        type: 'slow_movement',
        speed: analysis.movementPatterns.averageSpeed,
        message: '整体移动速度较慢，可能存在无障碍问题'
      });
    }

    return insights;
  }

  /**
   * 上传数据到AI分析后端
   */
  async uploadDataBatch() {
    if (this.dataBuffer.length === 0) return;

    try {
      const response = await fetch('/api/ai/collect-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          dataPoints: this.dataBuffer,
          routeId: this.currentRoute?.id,
          userProfile: this.userProfile
        })
      });

      if (response.ok) {
        console.log(`Uploaded ${this.dataBuffer.length} data points`);
        this.dataBuffer = [];
      }
    } catch (error) {
      console.error('Failed to upload data:', error);
    }
  }

  /**
   * 获取AI生成的路线推荐
   */
  async getAIRouteRecommendations(origin, destination, userPreferences) {
    try {
      const response = await fetch('/api/ai/route-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          origin,
          destination,
          userProfile: this.userProfile,
          preferences: userPreferences,
          historicalData: true
        })
      });

      const recommendations = await response.json();
      return this.processRouteRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
      return null;
    }
  }

  /**
   * 处理AI路线推荐
   */
  processRouteRecommendations(recommendations) {
    return recommendations.routes.map(route => ({
      ...route,
      aiConfidence: route.confidence,
      accessibilityScore: route.accessibilityScore,
      estimatedDifficulty: route.difficulty,
      basedOnUsers: route.userDataCount,
      lastUpdated: route.lastUpdated
    }));
  }

  // 辅助方法
  generateRouteId() {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateSpeed(location) {
    // 基于位置变化计算速度
    return location.speed || 0;
  }

  calculateSlope(point) {
    // 计算坡度（简化）
    return 0.05; // 示例值
  }

  calculateDifficultySeverity(prev, curr) {
    const speedReduction = (prev.movementData.speed - curr.movementData.speed) / prev.movementData.speed;
    return Math.min(speedReduction * 2, 1); // 归一化到0-1
  }

  detectPauses(dataPoints) {
    // 检测停留点
    return [];
  }

  detectDetours(dataPoints) {
    // 检测绕行
    return [];
  }

  calculateAverage(arr) {
    return arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0;
  }

  calculateVariation(arr) {
    const avg = this.calculateAverage(arr);
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  calculateOverallRating(analysis) {
    // 基于分析结果计算总体评分
    let rating = 5.0;
    
    if (analysis.difficultyAreas.length > 5) rating -= 1.0;
    if (analysis.movementPatterns.averageSpeed < 0.5) rating -= 0.5;
    if (analysis.accessibilityIssues.length > 3) rating -= 1.0;
    
    return Math.max(rating, 1.0);
  }

  generateNavigationInsights(analysis) {
    return [];
  }

  generateRecommendations(analysis) {
    return [];
  }

  assessDataQuality(routeData) {
    return {
      completeness: 0.95,
      accuracy: 0.90,
      consistency: 0.88
    };
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  getBatteryLevel() {
    // 获取设备电池电量
    return navigator.getBattery ? 0.8 : 1.0;
  }

  getNetworkQuality() {
    // 获取网络质量
    return navigator.connection ? navigator.connection.effectiveType : '4g';
  }

  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }
}

export default new AIAnalyticsService(); 