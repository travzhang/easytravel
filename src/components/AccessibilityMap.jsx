import React, { useEffect, useRef, useState } from 'react';
import { Card, Toast, Button, Space } from 'antd-mobile';
import { EnvironmentOutline, CloseOutline } from 'antd-mobile-icons';
import { initMap, addMarker, drawPath, addAccessibilityFacilities } from '../utils/mapUtils';
import './AccessibilityMap.css';

/**
 * 无障碍地图组件
 * @param {object} props 组件属性
 * @param {array} props.center 地图中心点坐标 [lng, lat]
 * @param {array} props.markers 标记点数组 [{position: [lng, lat], title: '标题', ...}]
 * @param {array} props.path 路径坐标数组 [[lng1, lat1], [lng2, lat2], ...]
 * @param {array} props.facilities 无障碍设施数据
 * @param {string} props.title 地图标题
 * @param {function} props.onClose 关闭地图回调
 * @param {number} props.height 地图高度，默认300px
 */
const AccessibilityMap = ({
  center = [116.397428, 39.90923],
  markers = [],
  path = [],
  facilities = [],
  title = '无障碍地图',
  onClose,
  height = 300
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  // 生成唯一ID
  const mapId = useRef(`map-container-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    // 检查高德地图API是否已加载
    if (!window.AMap) {
      setError('高德地图API未加载，请在index.html中引入高德地图JS API');
      return;
    }

    // 初始化地图
    initMap(mapId.current, {
      zoom: 15,
      center
    }).then(mapInstance => {
      mapInstanceRef.current = mapInstance;
      setIsMapLoaded(true);

      // 添加标记点
      if (markers.length > 0) {
        markers.forEach(marker => {
          addMarker(mapInstance, marker.position, {
            title: marker.title
          });
        });
      } else {
        // 如果没有提供标记点，则添加中心点标记
        addMarker(mapInstance, center, {
          title: '当前位置'
        });
      }

      // 绘制路线
      if (path.length > 0) {
        drawPath(mapInstance, path);
      }

      // 添加无障碍设施
      if (facilities.length > 0) {
        addAccessibilityFacilities(mapInstance, facilities);
      }
    }).catch(err => {
      console.error('地图初始化失败', err);
      setError('地图初始化失败，请稍后再试');
    });

    // 组件卸载时销毁地图
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [center, markers, path, facilities]);

  // 处理地图缩放
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const zoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(zoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const zoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(zoom - 1);
    }
  };

  // 处理定位到当前位置
  const handleLocate = () => {
    if (!mapInstanceRef.current) return;

    Toast.show({
      icon: 'loading',
      content: '定位中...',
      duration: 0
    });

    // 使用高德地图定位插件
    window.AMap.plugin('AMap.Geolocation', () => {
      const geolocation = new window.AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        zoomToAccuracy: true
      });

      geolocation.getCurrentPosition((status, result) => {
        Toast.clear();

        if (status === 'complete') {
          const position = [result.position.lng, result.position.lat];
          mapInstanceRef.current.setCenter(position);

          // 添加当前位置标记
          addMarker(mapInstanceRef.current, position, {
            title: '我的位置',
            icon: new window.AMap.Icon({
              size: new window.AMap.Size(24, 24),
              image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
              imageSize: new window.AMap.Size(24, 24)
            })
          });

          Toast.show({
            icon: 'success',
            content: '定位成功',
          });
        } else {
          Toast.show({
            icon: 'fail',
            content: '定位失败',
          });
        }
      });
    });
  };

  return (
    <Card className="accessibility-map-card">
      <div className="map-header">
        <div className="map-title">
          <EnvironmentOutline /> {title}
        </div>
        {onClose && (
          <Button
            className="map-close-btn"
            fill="none"
            size="mini"
            onClick={onClose}
          >
            <CloseOutline />
          </Button>
        )}
      </div>

      {error ? (
        <div className="map-error">
          <p>{error}</p>
          <p className="map-error-tip">
            请确保在index.html中引入高德地图JS API：
            <br />
            {'<script src="https://webapi.amap.com/maps?v=2.0&key=您申请的key值"></script>'}
          </p>
        </div>
      ) : (
        <>
          <div
            id={mapId.current}
            ref={mapContainerRef}
            className="map-container"
            style={{ height: `${height}px` }}
          />

          {isMapLoaded && (
            <div className="map-controls">
              <Space>
                <Button size="mini" onClick={handleZoomIn}>放大</Button>
                <Button size="mini" onClick={handleZoomOut}>缩小</Button>
                <Button size="mini" color="primary" onClick={handleLocate}>
                  定位
                </Button>
              </Space>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default AccessibilityMap;
