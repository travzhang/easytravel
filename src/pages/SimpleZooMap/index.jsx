import React, { useState, useEffect } from 'react';
import { NavBar, Toast, Button, Card, Space, Loading } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import overpassService from '../../services/overpassService';
import './index.css';

const SimpleZooMap = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [zooData, setZooData] = useState(null);
  const [error, setError] = useState(null);

  // 加载动物园数据
  const loadZooData = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      
    } catch (err) {
      console.error('加载数据失败:', err);
      setError(err.message);
      Toast.clear();
      Toast.show({
        icon: 'fail',
        content: '加载数据失败，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  // 导出数据
  const exportData = () => {
    if (!zooData) {
      Toast.show({
        icon: 'fail',
        content: '请先加载数据',
      });
      return;
    }
    
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

  // 获取无障碍等级标签
  const getAccessibilityBadge = (level) => {
    const badges = {
      'A': { text: 'A级-完全无障碍', color: '#52c41a' },
      'B': { text: 'B级-部分无障碍', color: '#1890ff' },
      'C': { text: 'C级-不适合', color: '#ff4d4f' },
      'D': { text: 'D级-未知', color: '#999' }
    };
    
    const badge = badges[level] || badges['D'];
    return (
      <span 
        style={{ 
          backgroundColor: badge.color, 
          color: 'white', 
          padding: '2px 6px', 
          borderRadius: '3px', 
          fontSize: '12px' 
        }}
      >
        {badge.text}
      </span>
    );
  };

  // 获取设施图标
  const getFacilityIcon = (category) => {
    const icons = {
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
    return icons[category] || icons.other;
  };

  return (
    <div className="simple-zoo-map">
      <NavBar onBack={() => navigate(-1)}>
        上海动物园数据查看器
      </NavBar>

      <div className="content">
        {/* 控制按钮 */}
        <Card className="controls-card">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              block 
              color="primary" 
              onClick={loadZooData}
              loading={loading}
              size="large"
            >
              {loading ? '加载中...' : '加载动物园数据'}
            </Button>
            
            {zooData && (
              <Space style={{ width: '100%' }}>
                <Button onClick={exportData}>导出数据</Button>
                <Button onClick={() => window.open('http://localhost:8000/zoo-map-leaflet.html', '_blank')}>
                  查看地图
                </Button>
              </Space>
            )}
          </Space>
        </Card>

        {/* 错误信息 */}
        {error && (
          <Card className="error-card">
            <div style={{ color: '#ff4d4f' }}>
              <strong>错误：</strong>{error}
            </div>
          </Card>
        )}

        {/* 数据统计 */}
        {zooData && (
          <Card className="stats-card">
            <h3>数据统计</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{zooData.boundary ? 1 : 0}</div>
                <div className="stat-label">边界</div>
              </div>
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
            </div>
          </Card>
        )}

        {/* 设施列表 */}
        {zooData && zooData.accessibilityPoints.length > 0 && (
          <Card className="facilities-card">
            <h3>无障碍设施</h3>
            <div className="facilities-list">
              {zooData.accessibilityPoints.slice(0, 20).map((point, index) => (
                <div key={index} className="facility-item">
                  <div className="facility-header">
                    <span className="facility-icon">
                      {getFacilityIcon(point.category)}
                    </span>
                    <span className="facility-name">
                      {point.name || point.category}
                    </span>
                    {getAccessibilityBadge(point.accessibility)}
                  </div>
                  <div className="facility-details">
                    <div>类型: {point.category}</div>
                    <div>坐标: {point.lat.toFixed(6)}, {point.lon.toFixed(6)}</div>
                    {point.tags.opening_hours && (
                      <div>开放时间: {point.tags.opening_hours}</div>
                    )}
                  </div>
                </div>
              ))}
              {zooData.accessibilityPoints.length > 20 && (
                <div className="more-facilities">
                  还有 {zooData.accessibilityPoints.length - 20} 个设施...
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 道路信息 */}
        {zooData && zooData.roads.length > 0 && (
          <Card className="roads-card">
            <h3>道路信息</h3>
            <div className="roads-list">
              {zooData.roads.slice(0, 10).map((road, index) => (
                <div key={index} className="road-item">
                  <div className="road-header">
                    <span className="road-name">
                      {road.name || `${road.highway} 道路`}
                    </span>
                    {getAccessibilityBadge(road.accessibility)}
                  </div>
                  <div className="road-details">
                    <div>类型: {road.highway}</div>
                    {road.surface && <div>路面: {road.surface}</div>}
                    {road.width && <div>宽度: {road.width}</div>}
                    {road.wheelchair && <div>无障碍: {road.wheelchair}</div>}
                  </div>
                </div>
              ))}
              {zooData.roads.length > 10 && (
                <div className="more-roads">
                  还有 {zooData.roads.length - 10} 条道路...
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SimpleZooMap;
