import React, { useState } from 'react';

const TestZooData = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // 直接在组件内部处理API调用
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('开始加载数据...');

      const query = `
[out:json][timeout:60];

(
  31.1908985,121.3526725,31.1994282,121.3650556
);

(
  way["tourism"="zoo"]["name"~"上海动物园|Shanghai Zoo"];
  way["highway"](area);
  way["wheelchair"](area);
  way["surface"](area);
  way["building"](area);
  node["amenity"="toilets"](area);
  node["amenity"="parking"](area);
  node["amenity"="bench"](area);
  node["entrance"](area);
  node["highway"="elevator"](area);
  node["tourism"="information"](area);
  node["amenity"="restaurant"](area);
  node["amenity"="cafe"](area);
  node["shop"](area);
  node["amenity"="first_aid"](area);
  node["emergency"="phone"](area);
);

out geom;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: query,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      const processedData = processData(rawData);
      
      setData(processedData);
      console.log('加载成功！', processedData);

    } catch (err) {
      console.error('加载失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 处理数据
  const processData = (rawData) => {
    const result = {
      boundary: null,
      roads: [],
      facilities: [],
      buildings: [],
      rawElements: rawData.elements || []
    };

    if (!rawData.elements) {
      return result;
    }

    rawData.elements.forEach(element => {
      const tags = element.tags || {};

      if (element.type === 'way') {
        if (tags.tourism === 'zoo') {
          result.boundary = element;
        } else if (tags.highway) {
          result.roads.push({
            ...element,
            accessibility: getAccessibilityLevel(tags.wheelchair),
            category: tags.highway
          });
        } else if (tags.building) {
          result.buildings.push({
            ...element,
            accessibility: getAccessibilityLevel(tags.wheelchair)
          });
        }
      } else if (element.type === 'node') {
        if (tags.amenity || tags.tourism || tags.shop || tags.entrance || tags.highway === 'elevator' || tags.emergency) {
          result.facilities.push({
            ...element,
            accessibility: getAccessibilityLevel(tags.wheelchair),
            category: getFacilityCategory(tags)
          });
        }
      }
    });

    return result;
  };

  // 获取无障碍等级
  const getAccessibilityLevel = (wheelchair) => {
    switch (wheelchair) {
      case 'yes': return 'A';
      case 'limited': return 'B';
      case 'no': return 'C';
      default: return 'D';
    }
  };

  // 获取设施类别
  const getFacilityCategory = (tags) => {
    if (tags.amenity === 'toilets') return 'toilet';
    if (tags.amenity === 'parking') return 'parking';
    if (tags.amenity === 'bench') return 'seating';
    if (tags.amenity === 'restaurant') return 'restaurant';
    if (tags.amenity === 'cafe') return 'cafe';
    if (tags.amenity === 'first_aid') return 'medical';
    if (tags.tourism === 'information') return 'information';
    if (tags.entrance) return 'entrance';
    if (tags.highway === 'elevator') return 'elevator';
    if (tags.shop) return 'shop';
    if (tags.emergency === 'phone') return 'emergency';
    return 'other';
  };

  // 获取设施图标
  const getFacilityIcon = (category) => {
    const icons = {
      toilet: '🚻',
      parking: '🅿️',
      seating: '🪑',
      restaurant: '🍽️',
      cafe: '☕',
      medical: '🏥',
      information: 'ℹ️',
      entrance: '🚪',
      elevator: '🛗',
      shop: '🛍️',
      emergency: '📞',
      other: '📍'
    };
    return icons[category] || icons.other;
  };

  // 获取无障碍标签
  const getAccessibilityBadge = (level) => {
    const styles = {
      'A': { backgroundColor: '#52c41a', text: 'A级' },
      'B': { backgroundColor: '#1890ff', text: 'B级' },
      'C': { backgroundColor: '#ff4d4f', text: 'C级' },
      'D': { backgroundColor: '#999', text: 'D级' }
    };
    
    const style = styles[level] || styles['D'];
    return (
      <span 
        style={{ 
          ...style,
          color: 'white', 
          padding: '2px 6px', 
          borderRadius: '3px', 
          fontSize: '12px' 
        }}
      >
        {style.text}
      </span>
    );
  };

  // 导出数据
  const exportData = () => {
    if (!data) return;
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shanghai-zoo-data.json';
    link.click();
    URL.revokeObjectURL(url);

    console.log('数据导出成功');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>上海动物园数据测试</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '12px'
          }}
        >
          {loading ? '加载中...' : '测试加载数据'}
        </button>

        {data && (
          <>
            <button
              onClick={exportData}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#52c41a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              导出数据
            </button>
            <button
              onClick={() => window.open('http://localhost:8000/zoo-map-leaflet.html', '_blank')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#722ed1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              查看地图
            </button>
          </>
        )}

      </div>

      {/* 错误信息 */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '6px',
          color: '#ff4d4f'
        }}>
          <strong>错误：</strong>{error}
        </div>
      )}

      {/* 数据统计 */}
      {data && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '8px'
        }}>
          <h3>数据统计</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {data.boundary ? 1 : 0}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>边界</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {data.roads.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>道路</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {data.facilities.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>设施</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {data.buildings.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>建筑</div>
            </div>
          </div>
        </div>
      )}

      {/* 设施列表 */}
      {data && data.facilities.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '8px'
        }}>
          <h3>设施列表</h3>
            <div style={{ marginTop: '16px' }}>
              {data.facilities.slice(0, 15).map((facility, index) => (
                <div key={index} style={{ 
                  padding: '12px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '8px', 
                  marginBottom: '8px',
                  borderLeft: '4px solid #1890ff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>
                      {getFacilityIcon(facility.category)}
                    </span>
                    <span style={{ fontWeight: 'bold', flex: 1 }}>
                      {facility.tags?.name || facility.category}
                    </span>
                    {getAccessibilityBadge(facility.accessibility)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                    <div>类型: {facility.category}</div>
                    <div>坐标: {facility.lat?.toFixed(6)}, {facility.lon?.toFixed(6)}</div>
                    {facility.tags?.opening_hours && (
                      <div>开放时间: {facility.tags.opening_hours}</div>
                    )}
                  </div>
                </div>
              ))}
              {data.facilities.length > 15 && (
                <div style={{ textAlign: 'center', padding: '12px', color: '#999', fontStyle: 'italic' }}>
                  还有 {data.facilities.length - 15} 个设施...
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
};

export default TestZooData;
