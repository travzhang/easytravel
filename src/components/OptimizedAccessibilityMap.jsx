import React, { useEffect, useRef, useState } from 'react';
import { Card, Toast, Button, Space, Popover, Tag, Switch, Divider } from 'antd-mobile';
import { 
  EnvironmentOutline, 
  CloseOutline, 
  AddOutline, 
  MinusOutline, 
  ReloadOutline,
  SoundOutline,
  ExclamationCircleOutline
} from 'antd-mobile-icons';
import { initMap, addMarker, drawPath, addAccessibilityFacilities } from '../utils/mapUtils';
import './OptimizedAccessibilityMap.css';

/**
 * 优化的无障碍地图组件
 * @param {object} props 组件属性
 * @param {array} props.center 地图中心点坐标 [lng, lat]
 * @param {array} props.markers 标记点数组 [{position: [lng, lat], title: '标题', ...}]
 * @param {array} props.path 路径坐标数组 [[lng1, lat1], [lng2, lat2], ...]
 * @param {array} props.facilities 无障碍设施数据
 * @param {array} props.obstacles 障碍物数据
 * @param {string} props.title 地图标题
 * @param {function} props.onClose 关闭地图回调
 * @param {number} props.height 地图高度，默认350px
 * @param {string} props.disabilityType 用户残疾类型
 * @param {boolean} props.highContrast 是否启用高对比度模式
 * @param {function} props.onReportIssue 报告问题回调
 */
const OptimizedAccessibilityMap = ({
  center = [116.397428, 39.90923],
  markers = [],
  path = [],
  facilities = [],
  obstacles = [],
  title = '无障碍地图',
  onClose,
  height = 350,
  disabilityType = 'wheelchair',
  highContrast = false,
  onReportIssue
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showObstacles, setShowObstacles] = useState(true);
  const [showElevation, setShowElevation] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  const [mapMode, setMapMode] = useState('standard'); // standard, satellite, simple

  // 生成唯一ID
  const mapId = useRef(`map-container-${Math.random().toString(36).substring(2, 9)}`);

  // 语音播报函数
  const speak = (text) => {
    if (voiceGuidance && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // 检查高德地图API是否已加载
    if (!window.AMap) {
      setError('高德地图API未加载，请在index.html中引入高德地图JS API');
      return;
    }

    // 初始化地图
    initMap(mapId.current, {
      zoom: 15,
      center,
      mapStyle: highContrast ? 'amap://styles/dark' : 'amap://styles/normal'
    }).then(mapInstance => {
      mapInstanceRef.current = mapInstance;
      setIsMapLoaded(true);

      // 添加标记点
      if (markers.length > 0) {
        markers.forEach(marker => {
          addMarker(mapInstance, marker.position, {
            title: marker.title,
            icon: getMarkerIcon(marker.type || 'default')
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
        drawPath(mapInstance, path, {
          strokeColor: getPathColor(),
          strokeWeight: 8,
          strokeOpacity: 0.8,
          lineJoin: 'round',
          lineCap: 'round'
        });
        
        // 语音播报路线信息
        if (voiceGuidance) {
          speak(`已加载路线，全长约${calculatePathDistance(path)}米，预计需要${estimateTime(path)}分钟。`);
        }
      }

      // 添加无障碍设施
      if (facilities.length > 0 && showFacilities) {
        addAccessibilityFacilities(mapInstance, facilities, {
          disabilityType
        });
      }
      
      // 添加障碍物
      if (obstacles.length > 0 && showObstacles) {
        addObstacles(mapInstance, obstacles);
      }
      
      // 设置地图模式
      setMapMode(mapMode);
      
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
  }, [center, markers, path, facilities, obstacles, highContrast, showFacilities, showObstacles, disabilityType]);

  // 根据残疾类型获取路径颜色
  const getPathColor = () => {
    switch (disabilityType) {
      case 'wheelchair':
        return highContrast ? '#00FFFF' : '#1890FF';
      case 'visual':
        return highContrast ? '#FFFF00' : '#FAAD14';
      case 'hearing':
        return highContrast ? '#FF00FF' : '#722ED1';
      default:
        return highContrast ? '#00FF00' : '#52C41A';
    }
  };
  
  // 根据标记类型获取图标
  const getMarkerIcon = (type) => {
    if (!window.AMap) return null;
    
    const iconMap = {
      default: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
      start: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-start.png',
      end: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-end.png',
      waypoint: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png'
    };
    
    return new window.AMap.Icon({
      size: new window.AMap.Size(32, 32),
      image: iconMap[type] || iconMap.default,
      imageSize: new window.AMap.Size(32, 32)
    });
  };
  
  // 添加障碍物
  const addObstacles = (mapInstance, obstacles) => {
    if (!window.AMap) return;
    
    obstacles.forEach(obstacle => {
      const marker = new window.AMap.Marker({
        position: obstacle.position,
        title: obstacle.name,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(32, 32),
          image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-warning.png',
          imageSize: new window.AMap.Size(32, 32)
        })
      });
      
      marker.setMap(mapInstance);
      
      // 添加信息窗体
      const infoWindow = new window.AMap.InfoWindow({
        content: `
          <div class="obstacle-info">
            <h4>${obstacle.name}</h4>
            <p>${obstacle.description || '临时障碍物'}</p>
            <p>报告时间: ${obstacle.reportTime || '未知'}</p>
          </div>
        `,
        offset: new window.AMap.Pixel(0, -32)
      });
      
      marker.on('click', () => {
        infoWindow.open(mapInstance, marker.getPosition());
        
        // 语音播报障碍物信息
        if (voiceGuidance) {
          speak(`警告，前方有${obstacle.name}，${obstacle.description || '请注意避让'}`);
        }
      });
    });
  };
  
  // 计算路径距离（米）
  const calculatePathDistance = (path) => {
    if (!window.AMap || path.length < 2) return 0;
    
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      distance += window.AMap.GeometryUtil.distance(path[i], path[i + 1]);
    }
    
    return Math.round(distance);
  };
  
  // 估算时间（分钟）
  const estimateTime = (path) => {
    const distance = calculatePathDistance(path);
    
    // 根据残疾类型估算速度（米/分钟）
    const speedMap = {
      wheelchair: 50, // 轮椅速度约50米/分钟
      visual: 30,     // 视障人士速度约30米/分钟
      hearing: 60,    // 听障人士速度约60米/分钟
      cognitive: 40   // 认知障碍人士速度约40米/分钟
    };
    
    const speed = speedMap[disabilityType] || 50;
    return Math.round(distance / speed);
  };

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
              size: new window.AMap.Size(32, 32),
              image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
              imageSize: new window.AMap.Size(32, 32)
            })
          });

          Toast.show({
            icon: 'success',
            content: '定位成功',
          });
          
          // 语音播报
          if (voiceGuidance) {
            speak('定位成功，已将地图中心设置为您的当前位置');
          }
        } else {
          Toast.show({
            icon: 'fail',
            content: '定位失败',
          });
          
          if (voiceGuidance) {
            speak('定位失败，请检查您的位置权限设置');
          }
        }
      });
    });
  };
  
  // 切换地图模式
  const handleChangeMapMode = (mode) => {
    if (!mapInstanceRef.current) return;
    
    setMapMode(mode);
    
    switch (mode) {
      case 'satellite':
        mapInstanceRef.current.setMapStyle('amap://styles/satellite');
        break;
      case 'simple':
        // 简化模式，减少视觉干扰
        mapInstanceRef.current.setMapStyle({
          backgroundColor: highContrast ? '#000000' : '#f7f7f7',
          strokeColor: highContrast ? '#ffffff' : '#222222',
          strokeWidth: 2,
          fillColor: highContrast ? '#333333' : '#eeeeee',
          labelColor: highContrast ? '#ffffff' : '#222222',
          labelSize: 14
        });
        break;
      default:
        mapInstanceRef.current.setMapStyle(highContrast ? 'amap://styles/dark' : 'amap://styles/normal');
    }
  };
  
  // 报告问题
  const handleReportIssue = () => {
    if (onReportIssue && mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      onReportIssue({
        position: [center.lng, center.lat],
        zoom: mapInstanceRef.current.getZoom()
      });
    }
  };

  return (
    <Card className={`optimized-accessibility-map-card ${highContrast ? 'high-contrast' : ''}`}>
      <div className="map-header">
        <div className="map-title" role="heading" aria-level="2">
          <EnvironmentOutline /> {title}
        </div>
        {onClose && (
          <Button
            className="map-close-btn"
            fill="none"
            size="mini"
            onClick={onClose}
            aria-label="关闭地图"
          >
            <CloseOutline />
          </Button>
        )}
      </div>

      {error ? (
        <div className="map-error" role="alert">
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
            role="application"
            aria-label="无障碍地图"
          />

          {isMapLoaded && (
            <>
              <div className="map-info-panel">
                {path.length > 0 && (
                  <div className="map-route-info">
                    <div className="info-item">
                      <span className="info-label">距离:</span>
                      <span className="info-value">{calculatePathDistance(path)}米</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">预计时间:</span>
                      <span className="info-value">{estimateTime(path)}分钟</span>
                    </div>
                  </div>
                )}
              </div>
              
              <Divider />
              
              <div className="map-controls">
                <div className="control-group">
                  <Button size="mini" onClick={handleZoomIn} aria-label="放大地图">
                    <AddOutline />
                  </Button>
                  <Button size="mini" onClick={handleZoomOut} aria-label="缩小地图">
                    <MinusOutline />
                  </Button>
                  <Button size="mini" color="primary" onClick={handleLocate} aria-label="定位到当前位置">
                    <ReloadOutline />
                  </Button>
                </div>
                
                <div className="control-group">
                  <Popover
                    content={
                      <div className="map-options-popover">
                        <div className="option-item">
                          <span>显示无障碍设施</span>
                          <Switch
                            checked={showFacilities}
                            onChange={setShowFacilities}
                          />
                        </div>
                        <div className="option-item">
                          <span>显示障碍物</span>
                          <Switch
                            checked={showObstacles}
                            onChange={setShowObstacles}
                          />
                        </div>
                        <div className="option-item">
                          <span>显示高度信息</span>
                          <Switch
                            checked={showElevation}
                            onChange={setShowElevation}
                          />
                        </div>
                        <div className="option-item">
                          <span>语音导航</span>
                          <Switch
                            checked={voiceGuidance}
                            onChange={setVoiceGuidance}
                          />
                        </div>
                        <div className="map-mode-selector">
                          <div className="mode-title">地图模式</div>
                          <Space wrap>
                            <Tag
                              color={mapMode === 'standard' ? 'primary' : 'default'}
                              onClick={() => handleChangeMapMode('standard')}
                            >
                              标准
                            </Tag>
                            <Tag
                              color={mapMode === 'satellite' ? 'primary' : 'default'}
                              onClick={() => handleChangeMapMode('satellite')}
                            >
                              卫星
                            </Tag>
                            <Tag
                              color={mapMode === 'simple' ? 'primary' : 'default'}
                              onClick={() => handleChangeMapMode('simple')}
                            >
                              简化
                            </Tag>
                          </Space>
                        </div>
                      </div>
                    }
                    trigger="click"
                    placement="top"
                  >
                    <Button size="mini">设置</Button>
                  </Popover>
                  
                  <Button 
                    size="mini" 
                    color={voiceGuidance ? 'primary' : 'default'}
                    onClick={() => setVoiceGuidance(!voiceGuidance)}
                    aria-label={voiceGuidance ? '关闭语音导航' : '开启语音导航'}
                  >
                    <SoundOutline />
                  </Button>
                  
                  <Button 
                    size="mini" 
                    color="warning"
                    onClick={handleReportIssue}
                    aria-label="报告问题"
                  >
                    <ExclamationCircleOutline />
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default OptimizedAccessibilityMap;
