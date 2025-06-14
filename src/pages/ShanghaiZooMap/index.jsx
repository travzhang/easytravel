import React, { useState, useEffect, useRef } from 'react';
import { NavBar, Toast, Button, Card, Tag, Space, Switch, Popup, Loading } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
// 暂时移除图标导入以避免兼容性问题
// import {
//   EnvironmentOutline,
//   EyeOutline
// } from 'antd-mobile-icons';
import overpassService from '../../services/overpassService';
import './index.css';

const ShanghaiZooMap = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [zooData, setZooData] = useState(null);
  const [showRoads, setShowRoads] = useState(true);
  const [showAccessibility, setShowAccessibility] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // 地图初始化
  useEffect(() => {
    initMap();
    loadZooData();
  }, []);

  // 初始化地图
  const initMap = () => {
    if (!window.AMap) {
      Toast.show({
        icon: 'fail',
        content: '地图API未加载，请检查网络连接',
      });
      return;
    }

    const map = new window.AMap.Map(mapRef.current, {
      zoom: 16,
      center: [121.359, 31.195], // 上海动物园中心坐标
      mapStyle: 'amap://styles/normal',
      features: ['bg', 'road', 'building', 'point']
    });

    mapInstanceRef.current = map;

    // 添加地图控件
    map.addControl(new window.AMap.Scale());
    map.addControl(new window.AMap.ToolBar());
  };

  // 加载动物园数据
  const loadZooData = async () => {
    try {
      setLoading(true);
      Toast.show({
        icon: 'loading',
        content: '正在加载动物园数据...',
        duration: 0,
      });

      const data = await overpassService.getShanghaiZooData();
      setZooData(data);
      
      Toast.clear();
      Toast.show({
        icon: 'success',
        content: `加载成功！获取到 ${data.roads.length} 条道路，${data.accessibilityPoints.length} 个设施点`,
      });

      // 渲染数据到地图
      renderDataOnMap(data);
      
    } catch (error) {
      console.error('加载数据失败:', error);
      Toast.clear();
      Toast.show({
        icon: 'fail',
        content: '加载数据失败，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  // 在地图上渲染数据
  const renderDataOnMap = (data) => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // 清除现有图层
    map.clearMap();

    // 渲染动物园边界
    if (data.boundary) {
      renderBoundary(data.boundary);
    }

    // 渲染道路
    if (showRoads && data.roads) {
      data.roads.forEach(road => renderRoad(road));
    }

    // 渲染无障碍设施点
    if (showAccessibility && data.accessibilityPoints) {
      data.accessibilityPoints.forEach(point => renderAccessibilityPoint(point));
    }

    // 渲染其他设施
    if (showFacilities && data.facilities) {
      data.facilities.forEach(facility => renderFacility(facility));
    }

    // 渲染建筑物
    if (showBuildings && data.buildings) {
      data.buildings.forEach(building => renderBuilding(building));
    }

    // 调整地图视野
    if (data.boundary && data.boundary.bounds) {
      const bounds = data.boundary.bounds;
      map.setBounds([
        [bounds.minlon, bounds.minlat],
        [bounds.maxlon, bounds.maxlat]
      ]);
    }
  };

  // 渲染边界
  const renderBoundary = (boundary) => {
    if (!boundary.geometry) return;

    const path = boundary.geometry.map(point => [point.lon, point.lat]);
    
    const polygon = new window.AMap.Polygon({
      path: path,
      strokeColor: '#FF6B6B',
      strokeWeight: 3,
      strokeOpacity: 0.8,
      fillColor: '#FF6B6B',
      fillOpacity: 0.1,
      strokeStyle: 'dashed'
    });

    polygon.setMap(mapInstanceRef.current);
    
    // 添加标签
    const center = polygon.getBounds().getCenter();
    const marker = new window.AMap.Marker({
      position: center,
      content: `<div class="boundary-label">${boundary.name}</div>`,
      offset: new window.AMap.Pixel(-50, -10)
    });
    marker.setMap(mapInstanceRef.current);
  };

  // 渲染道路
  const renderRoad = (road) => {
    if (!road.geometry || road.geometry.length < 2) return;

    const path = road.geometry.map(point => [point.lon, point.lat]);
    
    // 根据道路类型和无障碍等级设置样式
    let strokeColor = '#666666';
    let strokeWeight = 2;
    
    if (road.highway === 'footway' || road.highway === 'path') {
      strokeColor = '#4CAF50';
      strokeWeight = 3;
    } else if (road.highway === 'steps') {
      strokeColor = '#FF9800';
      strokeWeight = 2;
    }

    // 根据无障碍等级调整颜色
    switch (road.accessibility) {
      case 'A':
        strokeColor = '#4CAF50'; // 绿色 - 完全无障碍
        break;
      case 'B':
        strokeColor = '#2196F3'; // 蓝色 - 部分无障碍
        break;
      case 'C':
        strokeColor = '#FF5722'; // 红色 - 不适合
        break;
      default:
        strokeColor = '#9E9E9E'; // 灰色 - 未知
    }

    const polyline = new window.AMap.Polyline({
      path: path,
      strokeColor: strokeColor,
      strokeWeight: strokeWeight,
      strokeOpacity: 0.8,
      lineJoin: 'round',
      lineCap: 'round'
    });

    polyline.setMap(mapInstanceRef.current);

    // 添加点击事件
    polyline.on('click', () => {
      setSelectedFeature({
        type: 'road',
        data: road
      });
    });
  };

  // 渲染无障碍设施点
  const renderAccessibilityPoint = (point) => {
    const iconMap = {
      toilet: '🚻',
      parking: '🅿️',
      entrance: '🚪',
      elevator: '🛗',
      seating: '🪑',
      shelter: '🏠',
      information: 'ℹ️',
      medical: '🏥',
      restaurant: '🍽️',
      cafe: '☕',
      shop: '🛍️',
      emergency: '📞',
      other: '📍'
    };

    const icon = iconMap[point.category] || '📍';
    
    // 根据无障碍等级设置背景色
    let backgroundColor = '#9E9E9E';
    switch (point.accessibility) {
      case 'A': backgroundColor = '#4CAF50'; break;
      case 'B': backgroundColor = '#2196F3'; break;
      case 'C': backgroundColor = '#FF5722'; break;
    }

    const marker = new window.AMap.Marker({
      position: [point.lon, point.lat],
      content: `
        <div class="accessibility-marker" style="background-color: ${backgroundColor}">
          <span class="marker-icon">${icon}</span>
        </div>
      `,
      offset: new window.AMap.Pixel(-15, -15)
    });

    marker.setMap(mapInstanceRef.current);

    // 添加点击事件
    marker.on('click', () => {
      setSelectedFeature({
        type: 'point',
        data: point
      });
    });
  };

  // 渲染设施
  const renderFacility = (facility) => {
    // 简化处理，只渲染点状设施
    if (facility.geometry && facility.geometry.length === 1) {
      const point = facility.geometry[0];
      const marker = new window.AMap.Marker({
        position: [point.lon, point.lat],
        content: `<div class="facility-marker">🏢</div>`,
        offset: new window.AMap.Pixel(-10, -10)
      });
      marker.setMap(mapInstanceRef.current);
    }
  };

  // 渲染建筑物
  const renderBuilding = (building) => {
    if (!building.geometry || building.geometry.length < 3) return;

    const path = building.geometry.map(point => [point.lon, point.lat]);
    
    let fillColor = '#E0E0E0';
    if (building.accessibility === 'A') fillColor = '#C8E6C9';
    else if (building.accessibility === 'B') fillColor = '#BBDEFB';
    else if (building.accessibility === 'C') fillColor = '#FFCDD2';

    const polygon = new window.AMap.Polygon({
      path: path,
      strokeColor: '#757575',
      strokeWeight: 1,
      strokeOpacity: 0.8,
      fillColor: fillColor,
      fillOpacity: 0.6
    });

    polygon.setMap(mapInstanceRef.current);
  };

  // 重新渲染地图
  useEffect(() => {
    if (zooData) {
      renderDataOnMap(zooData);
    }
  }, [showRoads, showAccessibility, showFacilities, showBuildings]);

  // 导出数据
  const exportData = () => {
    if (!zooData) return;
    
    const dataStr = JSON.stringify(zooData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shanghai-zoo-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    Toast.show({
      icon: 'success',
      content: '数据导出成功',
    });
  };

  return (
    <div className="shanghai-zoo-map">
      <NavBar 
        onBack={() => navigate(-1)}
        right={
          <Space>
            <Button
              size="mini"
              onClick={() => setFilterVisible(true)}
            >
              图层
            </Button>
            <Button
              size="mini"
              onClick={loadZooData}
            >
              刷新
            </Button>
            <Button
              size="mini"
              onClick={exportData}
            >
              导出
            </Button>
          </Space>
        }
      >
        上海动物园地图
      </NavBar>

      {/* 地图容器 */}
      <div ref={mapRef} className="map-container" />

      {/* 加载状态 */}
      {loading && (
        <div className="loading-overlay">
          <Loading size="large" />
          <div className="loading-text">正在加载地图数据...</div>
        </div>
      )}

      {/* 数据统计 */}
      {zooData && (
        <Card className="data-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{zooData.roads.length}</div>
              <div className="stat-label">道路</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{zooData.accessibilityPoints.length}</div>
              <div className="stat-label">设施点</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{zooData.buildings.length}</div>
              <div className="stat-label">建筑物</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{zooData.facilities.length}</div>
              <div className="stat-label">其他设施</div>
            </div>
          </div>
        </Card>
      )}

      {/* 图层控制弹窗 */}
      <Popup
        visible={filterVisible}
        onMaskClick={() => setFilterVisible(false)}
        position="bottom"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="layer-controls">
          <h3>图层控制</h3>
          <div className="control-item">
            <span>道路</span>
            <Switch checked={showRoads} onChange={setShowRoads} />
          </div>
          <div className="control-item">
            <span>无障碍设施</span>
            <Switch checked={showAccessibility} onChange={setShowAccessibility} />
          </div>
          <div className="control-item">
            <span>其他设施</span>
            <Switch checked={showFacilities} onChange={setShowFacilities} />
          </div>
          <div className="control-item">
            <span>建筑物</span>
            <Switch checked={showBuildings} onChange={setShowBuildings} />
          </div>
        </div>
      </Popup>

      {/* 要素详情弹窗 */}
      <Popup
        visible={!!selectedFeature}
        onMaskClick={() => setSelectedFeature(null)}
        position="bottom"
        bodyStyle={{ padding: '16px' }}
      >
        {selectedFeature && (
          <div className="feature-details">
            <h3>
              {selectedFeature.type === 'road' ? '道路信息' : '设施信息'}
            </h3>
            <div className="detail-content">
              {selectedFeature.data.name && (
                <div className="detail-item">
                  <strong>名称:</strong> {selectedFeature.data.name}
                </div>
              )}
              <div className="detail-item">
                <strong>无障碍等级:</strong>
                <Tag color={
                  selectedFeature.data.accessibility === 'A' ? 'success' :
                  selectedFeature.data.accessibility === 'B' ? 'primary' :
                  selectedFeature.data.accessibility === 'C' ? 'danger' : 'default'
                }>
                  {selectedFeature.data.accessibility === 'A' ? '完全无障碍' :
                   selectedFeature.data.accessibility === 'B' ? '部分无障碍' :
                   selectedFeature.data.accessibility === 'C' ? '不适合' : '未知'}
                </Tag>
              </div>
              {selectedFeature.data.surface && (
                <div className="detail-item">
                  <strong>路面材质:</strong> {selectedFeature.data.surface}
                </div>
              )}
              {selectedFeature.data.width && (
                <div className="detail-item">
                  <strong>宽度:</strong> {selectedFeature.data.width}
                </div>
              )}
              {selectedFeature.data.category && (
                <div className="detail-item">
                  <strong>类别:</strong> {selectedFeature.data.category}
                </div>
              )}
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
};

export default ShanghaiZooMap;
