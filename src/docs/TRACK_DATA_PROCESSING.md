# 用户轨迹数据处理与热力线生成系统

## 🎯 系统概述

基于用户轨迹数据生成景区热力线的完整解决方案，每秒记录一次用户坐标点，通过大数据分析生成真实的无障碍路线推荐。

## 📊 数据流程架构

```
用户移动 → GPS记录 → 数据预处理 → 轨迹聚类 → 热力线生成 → 地图渲染
    ↓         ↓          ↓           ↓          ↓          ↓
  每秒1次   质量过滤   异常点清理   DBSCAN聚类  热力值计算  L7可视化
```

## 🔧 核心技术组件

### 1. **用户轨迹记录服务** (`userTrackingService.js`)

#### **实时数据采集**
```javascript
// 每秒记录一次GPS坐标
setInterval(() => {
  navigator.geolocation.getCurrentPosition(position => {
    const point = {
      timestamp: new Date().toISOString(),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed
    };
    
    if (isValidPoint(point)) {
      currentTrack.push(point);
    }
  });
}, 1000); // 每秒记录
```

#### **数据质量控制**
- ✅ **GPS精度过滤** - 精度 < 10米
- ✅ **速度异常检测** - 速度 < 20km/h（轮椅用户）
- ✅ **距离阈值** - 移动距离 > 1米
- ✅ **连续性检查** - 时间间隔 < 5秒

### 2. **轨迹数据分析服务** (`trackAnalyticsService.js`)

#### **数据预处理流程**
```javascript
// 1. 时间排序
const sortedPoints = rawPoints.sort((a, b) => 
  new Date(a.timestamp) - new Date(b.timestamp)
);

// 2. 异常点过滤
const filteredPoints = removeOutliers(sortedPoints);

// 3. 轨迹平滑（移动平均）
const smoothedPoints = smoothTrack(filteredPoints);

// 4. 重采样（统一5米间距）
const resampledPoints = resampleTrack(smoothedPoints, 5);
```

#### **DBSCAN聚类算法**
```javascript
// 聚类参数
const clusterConfig = {
  eps: 5,        // 聚类半径5米
  minPts: 3,     // 最小聚类点数
  corridorWidth: 20  // 路径走廊宽度20米
};

// 聚类实现
function clusterTrackPoints(points) {
  const clusters = [];
  const visited = new Set();
  
  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;
    
    const neighbors = getNeighbors(points, i);
    if (neighbors.length >= minPts) {
      const cluster = [];
      expandCluster(points, i, neighbors, cluster, visited);
      clusters.push(cluster);
    }
  }
  
  return clusters;
}
```

## 🎨 热力线生成算法

### **多维度热力值计算**

#### **1. 基础热力值**
```javascript
// 基于轨迹数量和质量
let heatValue = 0.3; // 基础值

// 轨迹数量影响（更多轨迹 = 更高热力）
heatValue += Math.min(trackCount * 0.1, 0.4);

// 轨迹质量影响
heatValue += avgTrackQuality * 0.3;
```

#### **2. 置信度评估**
```javascript
// 基于多个因素计算置信度
function calculateConfidence(passingTracks, cluster) {
  let confidence = 0.5;
  
  // 轨迹数量加成
  confidence += Math.min(trackCount * 0.1, 0.3);
  
  // GPS质量加成
  confidence += avgGPSAccuracy * 0.2;
  
  // 点密度加成
  confidence += pointDensity * 0.1;
  
  return Math.min(1.0, confidence);
}
```

#### **3. 无障碍性评估**
```javascript
// 基于轨迹特征评估路径无障碍性
function assessPathAccessibility(corridor, tracks) {
  let accessibilityScore = 0.5;
  
  // 平均速度分析（轮椅用户速度较慢）
  const avgSpeed = tracks.reduce((sum, track) => 
    sum + track.avgSpeed, 0) / tracks.length;
  
  if (avgSpeed < 1.5) accessibilityScore += 0.2; // 慢速 = 更适合轮椅
  
  // 轨迹平滑度分析
  const smoothness = calculateTrackSmoothness(tracks);
  accessibilityScore += smoothness * 0.3;
  
  // 返回无障碍等级
  if (accessibilityScore > 0.8) return 'yes';
  if (accessibilityScore > 0.5) return 'limited';
  return 'no';
}
```

## 📈 大数据处理策略

### **数据量预估**
```
单用户每小时: 3600个GPS点
日活100用户: 360,000个点/小时
月数据量: ~260M个GPS点
存储需求: ~50GB/月（包含元数据）
```

### **性能优化方案**

#### **1. 客户端优化**
- 🔄 **本地缓存** - 最多保存1000个轨迹点
- 📦 **批量上传** - 每10分钟或1000个点上传一次
- 🗜️ **数据压缩** - GPS坐标精度优化到6位小数

#### **2. 服务端优化**
- 🏗️ **分布式存储** - 按景区和时间分片存储
- ⚡ **实时计算** - 使用流处理框架（如Kafka + Spark）
- 📊 **预计算** - 定期重新计算热力线（每小时/每天）

#### **3. 聚类优化**
```javascript
// 分层聚类策略
const clusterLevels = [
  { eps: 2, minPts: 5 },   // 精细聚类
  { eps: 5, minPts: 3 },   // 中等聚类  
  { eps: 10, minPts: 2 }   // 粗糙聚类
];

// 自适应聚类参数
function adaptiveCluster(points, dataQuality) {
  const level = dataQuality > 0.8 ? 0 : 
                dataQuality > 0.5 ? 1 : 2;
  return dbscan(points, clusterLevels[level]);
}
```

## 🎮 用户界面集成

### **轨迹记录控制**
```jsx
// 开始记录按钮
<Button onClick={startUserTracking}>
  开始记录轨迹
</Button>

// 实时状态显示
{trackingStatus && (
  <div>
    记录点数: {trackingStatus.currentPoints}
    记录时长: {Math.round(trackingStatus.duration / 1000)}秒
  </div>
)}

// 数据源切换
<input
  type="checkbox"
  checked={useTrackData}
  onChange={(e) => setUseTrackData(e.target.checked)}
/>
使用轨迹数据生成热力线
```

### **热力线渲染**
```javascript
// 优先级：轨迹数据 > 科学算法 > 静态数据
if (useTrackData && hasTrackData) {
  heatlines = await generateTrackBasedHeatLines(data);
} else {
  heatlines = generateScientificHeatLines(roads, facilities);
}

// L7热力线渲染
const heatLineLayer = new LineLayer()
  .source(heatlineData)
  .size('heat', heat => Math.max(5, heat * 12))
  .color('heat', [
    '#ff4d4f',  // 低热力 - 红色
    '#ffa940',  // 中等热力 - 橙色  
    '#73d13d'   // 高热力 - 绿色
  ])
  .animate({
    interval: 1,
    duration: 2,
    trailLength: 2
  });
```

## 🔬 数据验证与质量保证

### **轨迹质量评分**
```javascript
function assessTrackQuality(track) {
  let qualityScore = 1.0;
  
  // GPS精度评分
  const avgAccuracy = track.points.reduce((sum, p) => 
    sum + (p.accuracy || 10), 0) / track.points.length;
  if (avgAccuracy > 15) qualityScore *= 0.7;
  
  // 点密度评分
  const pointDensity = track.points.length / (track.duration / 1000);
  if (pointDensity < 0.5) qualityScore *= 0.8;
  
  // 连续性评分
  const gaps = countTimeGaps(track.points, 5000); // 5秒间隔
  if (gaps > track.points.length * 0.1) qualityScore *= 0.8;
  
  return Math.max(0.1, qualityScore);
}
```

### **异常检测算法**
```javascript
// 速度异常检测
function detectSpeedAnomalies(points) {
  const anomalies = [];
  
  for (let i = 1; i < points.length; i++) {
    const speed = calculateSpeed(points[i-1], points[i]);
    
    // 轮椅用户速度阈值：20km/h
    if (speed > 20) {
      anomalies.push(i);
    }
  }
  
  return anomalies;
}

// GPS漂移检测
function detectGPSDrift(points) {
  const drifts = [];
  
  for (let i = 2; i < points.length; i++) {
    const dist1 = calculateDistance(points[i-2], points[i-1]);
    const dist2 = calculateDistance(points[i-1], points[i]);
    
    // 突然的大距离跳跃可能是GPS漂移
    if (dist2 > dist1 * 5 && dist2 > 50) {
      drifts.push(i);
    }
  }
  
  return drifts;
}
```

## 🚀 实施建议

### **阶段1：基础轨迹记录** (1-2周)
1. ✅ 实现GPS轨迹记录功能
2. ✅ 添加数据质量过滤
3. ✅ 本地存储和上传机制

### **阶段2：聚类分析** (2-3周)
1. ✅ 实现DBSCAN聚类算法
2. ✅ 轨迹预处理和平滑
3. ✅ 路径走廊生成

### **阶段3：热力线生成** (1-2周)
1. ✅ 多维度热力值计算
2. ✅ 置信度评估系统
3. ✅ 无障碍性自动评估

### **阶段4：性能优化** (2-4周)
1. 🔄 大数据处理优化
2. 🔄 实时计算系统
3. 🔄 分布式存储方案

## 💡 创新特性

### **自适应学习**
- 📈 **用户行为学习** - 系统学习不同用户的行为模式
- 🎯 **个性化推荐** - 基于历史轨迹推荐最适合的路线
- 🔄 **实时优化** - 根据实时数据动态调整热力线

### **众包验证**
- 👥 **多用户验证** - 多条轨迹验证路径可达性
- 🏆 **质量评分** - 基于用户反馈的路径质量评分
- 📊 **统计置信度** - 基于样本数量的统计置信度

### **智能预测**
- 🔮 **路径预测** - 预测用户可能选择的路径
- ⚠️ **障碍预警** - 基于轨迹异常检测潜在障碍
- 📈 **趋势分析** - 分析路径使用趋势和变化

这套系统将真实的用户行为数据转化为有价值的无障碍路线信息，为轮椅用户提供最准确、最实用的导航建议。
