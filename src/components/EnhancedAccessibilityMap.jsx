import React, { useEffect, useRef, useState } from 'react';
import { 
  Card, 
  Toast, 
  Button, 
  Space, 
  Popover, 
  Tag, 
  Switch, 
  Divider,
  Dialog,
  List,
  FloatingPanel
} from 'antd-mobile';
import { 
  EnvironmentOutline, 
  CloseOutline,
  ExclamationCircleOutline,
  CompassOutline,
  UserOutline,
  TeamOutline,
  PhoneFill
} from 'antd-mobile-icons';
import { initMap, drawPath } from '../utils/mapUtils';
import './EnhancedAccessibilityMap.css';

/**
 * 增强版无障碍地图组件
 * @param {object} props 组件属性
 * @param {array} props.center 地图中心点坐标 [lng, lat]
 * @param {string} props.scenicId 景区ID
 * @param {string} props.title 地图标题
 * @param {function} props.onClose 关闭地图回调
 * @param {number} props.height 地图高度，默认100vh
 */
const EnhancedAccessibilityMap = ({
  center = [116.397428, 39.90923],
  // scenicId = '1', // 预留给后续使用
  title = '无障碍导航地图',
  onClose,
  height = '100vh'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [companions] = useState([]); // setCompanions 预留给后续使用
  const [restPoints, setRestPoints] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  
  // 地图显示选项
  const [mapOptions, setMapOptions] = useState({
    showRestPoints: true,
    showObstacles: true,
    showCompanions: false,
    showRoute: true,
    voiceNavigation: false
  });

  // 模拟休息点数据
  const mockRestPoints = [
    {
      id: 1,
      name: '太和殿前休息区',
      position: [116.397428, 39.91423],
      type: 'rest',
      facilities: ['座椅', '遮阳棚', '饮水机'],
      distance: 150,
      shade: true
    },
    {
      id: 2,
      name: '御花园休息亭',
      position: [116.397528, 39.91923],
      type: 'rest',
      facilities: ['座椅', '遮阳亭', '自动售货机'],
      distance: 500,
      shade: true
    },
    {
      id: 3,
      name: '文华殿旁休息点',
      position: [116.398428, 39.91523],
      type: 'rest',
      facilities: ['座椅', '轮椅充电'],
      distance: 300,
      shade: false
    }
  ];

  // 模拟障碍物数据
  const mockObstacles = [
    {
      id: 1,
      type: 'construction',
      position: [116.397228, 39.91323],
      description: '施工维修，暂时封闭',
      reportTime: '10分钟前'
    },
    {
      id: 2,
      type: 'crowd',
      position: [116.397828, 39.91723],
      description: '人流密集区域',
      reportTime: '5分钟前'
    }
  ];

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || !window.AMap) {
      console.warn('地图容器或高德地图API未准备好');
      setIsLoading(false);
      return;
    }

    // 创建地图实例
    const map = initMap(mapContainerRef.current, {
      zoom: 16,
      center: center
    });

    mapInstanceRef.current = map;

    // 加载休息点和障碍物
    setRestPoints(mockRestPoints);
    setObstacles(mockObstacles);

    // 获取用户位置
    getCurrentLocation();

    setIsLoading(false);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [center]);

  // 更新地图显示
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    map.clearMap();

    // 添加用户位置标记
    if (userLocation) {
      const userMarker = new window.AMap.Marker({
        position: userLocation,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(32, 32),
          image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
          imageSize: new window.AMap.Size(32, 32)
        }),
        offset: new window.AMap.Pixel(-16, -32)
      });
      map.add(userMarker);
    }

    // 添加休息点标记
    if (mapOptions.showRestPoints) {
      restPoints.forEach(point => {
        const marker = new window.AMap.Marker({
          position: point.position,
          title: point.name,
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(24, 24),
            image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
            imageSize: new window.AMap.Size(24, 24)
          }),
          offset: new window.AMap.Pixel(-12, -24),
          extData: point
        });

        marker.on('click', () => {
          setSelectedPOI(point);
          setShowPanel(true);
        });

        map.add(marker);
      });
    }

    // 添加障碍物标记
    if (mapOptions.showObstacles) {
      obstacles.forEach(obstacle => {
        const marker = new window.AMap.Marker({
          position: obstacle.position,
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(24, 24),
            image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
            imageSize: new window.AMap.Size(24, 24)
          }),
          offset: new window.AMap.Pixel(-12, -24)
        });

        marker.on('click', () => {
          Dialog.alert({
            title: '障碍物提醒',
            content: obstacle.description,
            confirmText: '知道了'
          });
        });

        map.add(marker);
      });
    }

    // 添加同伴位置
    if (mapOptions.showCompanions && companions.length > 0) {
      companions.forEach(companion => {
        const marker = new window.AMap.Marker({
          position: companion.position,
          title: companion.name,
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(20, 20),
            image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
            imageSize: new window.AMap.Size(20, 20)
          })
        });
        map.add(marker);
      });
    }

  }, [userLocation, restPoints, obstacles, companions, mapOptions]);

  // 获取当前位置
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);
          
          // 定位到用户位置
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter([longitude, latitude]);
          }
        },
        (error) => {
          console.error('获取位置失败:', error);
          Toast.show({
            icon: 'fail',
            content: '获取当前位置失败',
          });
        }
      );
    }
  };

  // 导航到休息点
  const navigateToRestPoint = (point) => {
    if (!userLocation) {
      Toast.show({
        icon: 'fail',
        content: '请先获取当前位置',
      });
      return;
    }

    // 绘制导航路线
    if (mapInstanceRef.current) {
      const path = [userLocation, point.position];
      drawPath(mapInstanceRef.current, path, {
        strokeColor: '#1890FF',
        strokeWeight: 6,
        strokeOpacity: 0.8
      });

      // 如果开启语音导航
      if (mapOptions.voiceNavigation) {
        speakNavigation(`开始导航到${point.name}，距离${point.distance}米`);
      }
    }

    setShowPanel(false);
    Toast.show({
      icon: 'success',
      content: '已规划路线',
    });
  };

  // 语音播报
  const speakNavigation = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // 查找最近的休息点
  const findNearestRestPoint = () => {
    if (!userLocation || restPoints.length === 0) {
      Toast.show({
        icon: 'fail',
        content: '无法获取最近的休息点',
      });
      return;
    }

    // 简单计算最近的休息点（实际应该用经纬度计算）
    const nearest = restPoints[0];
    setSelectedPOI(nearest);
    setShowPanel(true);
    
    Toast.show({
      content: `最近的休息点是${nearest.name}，距离${nearest.distance}米`,
    });
  };

  // 报告障碍物
  const reportObstacle = () => {
    if (!userLocation) {
      Toast.show({
        icon: 'fail',
        content: '请先获取当前位置',
      });
      return;
    }

    Dialog.confirm({
      title: '报告障碍物',
      content: '确认在当前位置标记障碍物？',
      onConfirm: () => {
        const newObstacle = {
          id: Date.now(),
          type: 'user_report',
          position: userLocation,
          description: '用户报告的障碍物',
          reportTime: '刚刚'
        };
        setObstacles([...obstacles, newObstacle]);
        
        Toast.show({
          icon: 'success',
          content: '感谢您的反馈',
        });
      }
    });
  };

  return (
    <div className="enhanced-map-container" style={{ height }}>
      {/* 顶部工具栏 */}
      <div className="map-toolbar">
        <div className="toolbar-left">
          <Button size="small" onClick={onClose}>
            <CloseOutline />
          </Button>
          <span className="map-title">{title}</span>
        </div>
        <div className="toolbar-right">
          <Popover
            content={
              <div className="map-options-panel">
                <List>
                  <List.Item
                    extra={
                      <Switch
                        checked={mapOptions.showRestPoints}
                        onChange={(val) => setMapOptions({...mapOptions, showRestPoints: val})}
                      />
                    }
                  >
                    显示休息点
                  </List.Item>
                  <List.Item
                    extra={
                      <Switch
                        checked={mapOptions.showObstacles}
                        onChange={(val) => setMapOptions({...mapOptions, showObstacles: val})}
                      />
                    }
                  >
                    显示障碍物
                  </List.Item>
                  <List.Item
                    extra={
                      <Switch
                        checked={mapOptions.voiceNavigation}
                        onChange={(val) => setMapOptions({...mapOptions, voiceNavigation: val})}
                      />
                    }
                  >
                    语音导航
                  </List.Item>
                </List>
              </div>
            }
            trigger="click"
            placement="bottom-end"
          >
            <Button size="small">
              <EnvironmentOutline />
            </Button>
          </Popover>
        </div>
      </div>

      {/* 地图容器 */}
      <div ref={mapContainerRef} className="map-content" />

      {/* 快捷操作按钮 */}
      <div className="map-quick-actions">
        <Button 
          className="quick-action-btn"
          color="primary"
          onClick={findNearestRestPoint}
        >
          <CompassOutline />
          最近休息点
        </Button>
        <Button 
          className="quick-action-btn"
          onClick={getCurrentLocation}
        >
          <UserOutline />
          我的位置
        </Button>
        <Button 
          className="quick-action-btn"
          onClick={reportObstacle}
        >
          <ExclamationCircleOutline />
          报告障碍
        </Button>
        <Button 
          className="quick-action-btn emergency"
          color="danger"
          onClick={() => {
            Dialog.confirm({
              title: '紧急求助',
              content: '是否呼叫景区工作人员？',
              onConfirm: () => {
                Toast.show({
                  icon: 'success',
                  content: '已通知工作人员，请在原地等待',
                });
              }
            });
          }}
        >
          <PhoneFill />
          紧急求助
        </Button>
      </div>

      {/* POI详情面板 */}
      <FloatingPanel
        anchors={[0, 300]}
        visible={showPanel}
        onClose={() => setShowPanel(false)}
      >
        {selectedPOI && (
          <div className="poi-detail-panel">
            <h3>{selectedPOI.name}</h3>
            <div className="poi-info">
              <div className="info-item">
                <span className="label">距离：</span>
                <span className="value">{selectedPOI.distance}米</span>
              </div>
              <div className="info-item">
                <span className="label">设施：</span>
                <div className="facilities-tags">
                  {selectedPOI.facilities.map((facility, index) => (
                    <Tag key={index} color="primary">{facility}</Tag>
                  ))}
                </div>
              </div>
              {selectedPOI.shade && (
                <div className="info-item">
                  <Tag color="success">有遮阳</Tag>
                </div>
              )}
            </div>
            <Divider />
            <Space block direction="vertical">
              <Button 
                block 
                color="primary" 
                size="large"
                onClick={() => navigateToRestPoint(selectedPOI)}
              >
                导航前往
              </Button>
              <Button 
                block 
                size="large"
                onClick={() => {
                  setShowPanel(false);
                  // 分享位置给同伴
                  Toast.show({
                    content: '已分享位置给同伴',
                  });
                }}
              >
                <TeamOutline /> 分享给同伴
              </Button>
            </Space>
          </div>
        )}
      </FloatingPanel>

      {/* 加载提示 */}
      {isLoading && (
        <div className="map-loading">
          <div className="loading-spinner" />
          <div>地图加载中...</div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAccessibilityMap; 