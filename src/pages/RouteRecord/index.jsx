import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  NavBar,
  Button,
  Card,
  Steps,
  Dialog,
  Form,
  TextArea,
  ImageUploader,
  Toast,
  Popover,
  Space,
  Tag
} from 'antd-mobile';
import {
  PlayOutline,
  // PauseOutline,
  CheckOutline,
  EnvironmentOutline,
  ClockCircleOutline,
  CameraOutline,
  ExclamationCircleOutline,
  // FireOutline
} from 'antd-mobile-icons';
import AccessibilityMap from '../../components/AccessibilityMap';
import TrackHeatlineMap from '../../components/TrackHeatlineMap';
import { scenicDetails } from '../../mock/scenicData';
import './index.css';

const { Step } = Steps;

const RouteRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [routePoints, setRoutePoints] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [mapVisible, setMapVisible] = useState(false);
  const [heatlineMapVisible, setHeatlineMapVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeSelectionVisible, setRouteSelectionVisible] = useState(false);

  const [logs, setLogs] = useState([]);

  // 用户配置信息
  const userProfile = {
    userId: `user_${Date.now()}`,
    disabilityType: 'wheelchair',
    assistiveDevice: 'manual_wheelchair',
    mobilityLevel: 'moderate'
  };

  // 根据ID获取景点数据
  const scenicData = scenicDetails.find(scenic => scenic.id === parseInt(id)) || scenicDetails[0];

  // 景点ID（基于路由参数或默认值）
  const scenicSpotId = id || 'forbidden_city';

  useEffect(() => {
    // 如果没有选择路线，显示路线选择对话框
    if (!selectedRoute) {
      setRouteSelectionVisible(true);
    }

    // 清理函数
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, []);

  const log = function (val) {
    setLogs([
      ...logs,
      val
    ])
  }
  // 模拟获取当前位置
  useEffect(() => {
    if (isRecording && selectedRoute) {

      if (!navigator.geolocation) {
        log('❌ 浏览器不支持定位');
        return;
      }

      log('📡 开始定位上报');

      // 模拟位置更新

      function intervalFunction() {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const timestamp = new Date().toISOString();

            const SCENIC_ID = 'cmavy0xbm0001rvhy23izyxkv'; // 替换成你的景区ID，虹桥体育公园
            const USER_ID = 'mock-user-id';     // 可从登录信息获取

            const data = {
              scenicAreaId: SCENIC_ID,
              userId: USER_ID,
              "location": {
                "type": "Point",
                "coordinates": [
                  longitude,
                  latitude
                ],
              },
              accuracy,
              timestamp,
            };

            fetch('/api/user-track', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
              .then((res) => {
                if (!res.ok) throw new Error(`状态码 ${res.status}`);
                return res.text();
              })
              .then(() => {
                log(`✅ 上报成功：(${latitude}, ${longitude})`);
                
                // 更新当前位置显示
                const locationName = `位置点 ${routePoints.length + 1}`;
                setCurrentLocation(locationName);
                
                // 添加路线点记录
                const newPoint = {
                  id: Date.now(),
                  location: locationName,
                  description: `GPS坐标: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                  timestamp: new Date().toLocaleTimeString(),
                  coordinates: { lat: latitude, lng: longitude }
                };
                
                setRoutePoints(prev => [...prev, newPoint]);
              })
              .catch((err) => {
                log(`❌ 上报失败: ${err.message}`);
              });
          },
          (err) => {
            log('⚠️ 获取定位失败: ' + err.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000,
          }
        );


        // 以下暂时注释

        // // 从选定路线的路点中随机选择一个
        // const randomIndex = Math.floor(Math.random() * selectedRoute.waypoints.length);
        // const waypoint = selectedRoute.waypoints[randomIndex];
        // setCurrentLocation(waypoint.name);
        //
        // // 添加路线点
        // const newPoint = {
        //   id: Date.now(),
        //   location: waypoint.name,
        //   description: waypoint.description,
        //   timestamp: new Date().toLocaleTimeString(),
        //   coordinates: { lat: Math.random() * 0.01 + 39.9, lng: Math.random() * 0.01 + 116.3 }
        // };
        //
        // setRoutePoints(prev => [...prev, newPoint]);
      }

      intervalFunction()
      const locationInterval = setInterval(intervalFunction, 10000); // 每10秒更新一次位置

      return () => clearInterval(locationInterval);
    }
  }, [isRecording, selectedRoute]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    setRouteSelectionVisible(false);
    Toast.show({
      content: `已选择路线：${route.name}`,
      position: 'bottom',
    });
  };

  const handleStartRecording = () => {
    if (!selectedRoute) {
      setRouteSelectionVisible(true);
      return;
    }

    setIsRecording(true);

    // 开始计时
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    setRecordingInterval(interval);

    Toast.show({
      content: '开始记录路线',
      position: 'bottom',
    });
  };

  const handlePauseRecording = () => {
    setIsRecording(false);

    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }

    Toast.show({
      content: '暂停记录',
      position: 'bottom',
    });
  };

  const handleStopRecording = async () => {
    const result = await Dialog.confirm({
      content: '确定要结束记录吗？',
      confirmText: '结束记录',
      cancelText: '继续记录',
    });

    if (result) {
      setIsRecording(false);

      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }

      Toast.show({
        content: '记录已完成',
        position: 'bottom',
      });

      // 模拟数据上传
      Toast.show({
        icon: 'success',
        content: '路线数据已保存',
      });
    }
  };

  const handleOpenFeedback = () => {
    setFeedbackVisible(true);
  };

  const handleSubmitFeedback = (values) => {
    console.log('提交的反馈:', values);

    Toast.show({
      icon: 'success',
      content: '感谢您的反馈！',
    });

    setFeedbackVisible(false);
  };

  const handleShowMap = () => {
    setMapVisible(true);
  };

  const handleBack = () => {
    if (isRecording) {
      Dialog.confirm({
        content: '正在记录中，确定要退出吗？',
        confirmText: '退出',
        cancelText: '继续记录',
        onConfirm: () => {
          if (recordingInterval) {
            clearInterval(recordingInterval);
          }
          navigate(-1);
        },
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="route-record-container">
      <NavBar onBack={handleBack} className="record-navbar">
        {scenicData.name} - 路线记录
      </NavBar>

      {/* 选定路线信息 */}
      {selectedRoute && (
        <Card className="selected-route-card">
          <div className="selected-route-header">
            <div className="selected-route-name">{selectedRoute.name}</div>
            <Button
              size="mini"
              color="primary"
              fill="none"
              onClick={() => setRouteSelectionVisible(true)}
            >
              更换
            </Button>
          </div>
          <div className="selected-route-info">
            <Tag color="primary">{selectedRoute.duration}</Tag>
            <Tag color="primary">{selectedRoute.distance}</Tag>
            <Tag color={selectedRoute.difficulty === '简单' ? 'success' : 'warning'}>
              {selectedRoute.difficulty}
            </Tag>
          </div>
        </Card>
      )}

      {/* 记录状态卡片 */}
      <Card className="status-card">
        <div className="recording-status">
          <div className="status-indicator">
            {isRecording && <div className="recording-dot"></div>}
            <span className={isRecording ? 'recording' : ''}>
              {isRecording ? '记录中' : '未开始记录'}
            </span>
          </div>
          <div className="recording-time">{formatTime(recordingTime)}</div>
        </div>

        {currentLocation && (
          <div className="current-location">
            <EnvironmentOutline className="location-icon" />
            <span>当前位置: {currentLocation}</span>
            <Space>
              <Button
                size="mini"
                color="primary"
                fill="none"
                onClick={handleShowMap}
                className="map-button"
              >
                查看地图
              </Button>
              <Button
                size="mini"
                color="warning"
                fill="none"
                onClick={() => setHeatlineMapVisible(true)}
                className="heatline-button"
              >
                {/* <FireOutline /> */}
                 热力线
              </Button>
            </Space>
          </div>
        )}

        <div className="record-actions">
          {!isRecording ? (
            <Button
              color="primary"
              onClick={handleStartRecording}
              icon={<PlayOutline />}
            >
              开始记录
            </Button>
          ) : (
            <>
              <Button
                color="default"
                onClick={handlePauseRecording}
                // icon={<PauseOutline />}
              >
                暂停
              </Button>
              <Button
                color="danger"
                onClick={handleStopRecording}
                icon={<CheckOutline />}
              >
                结束记录
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card className="status-card" style={{display:logs.length>0?'block':'none'}}>
        {logs}
      </Card>

      {/* 路线点记录 */}
      {routePoints.length > 0 && (
        <div className="route-points-section">
          <div className="section-header">
            <h3>路线记录</h3>
            <Button
              size="mini"
              color="primary"
              fill="none"
              onClick={handleShowMap}
            >
              地图查看
            </Button>
          </div>
          <Steps direction="vertical">
            {routePoints.map((point, index) => (
              <Step
                key={point.id}
                title={point.location}
                description={
                  <div className="step-description">
                    <div className="step-time">
                      <ClockCircleOutline /> {point.timestamp}
                    </div>
                    <div className="step-detail">{point.description}</div>
                    {index === routePoints.length - 1 && isRecording && (
                      <Popover
                        content={
                          <div className="feedback-popover">
                            <Button
                              color="primary"
                              size="mini"
                              onClick={handleOpenFeedback}
                            >
                              反馈无障碍问题
                            </Button>
                          </div>
                        }
                        trigger="click"
                        placement="bottom-start"
                      >
                        <Button
                          size="mini"
                          color="warning"
                          icon={<ExclamationCircleOutline />}
                        >
                          遇到问题
                        </Button>
                      </Popover>
                    )}
                  </div>
                }
                status={index === routePoints.length - 1 ? 'process' : 'finish'}
              />
            ))}
          </Steps>
        </div>
      )}

      {/* 问题反馈对话框 */}
      <Dialog
        visible={feedbackVisible}
        title="无障碍问题反馈"
        content={
          <Form layout="vertical" onFinish={handleSubmitFeedback}>
            <Form.Item
              name="location"
              label="问题位置"
              initialValue={currentLocation}
            >
              <TextArea placeholder="请描述问题发生的具体位置" rows={2} />
            </Form.Item>
            <Form.Item
              name="description"
              label="问题描述"
              rules={[{ required: true, message: '请描述遇到的无障碍问题' }]}
            >
              <TextArea placeholder="请详细描述您遇到的无障碍问题" rows={4} />
            </Form.Item>
            <Form.Item name="images" label="上传照片">
              <ImageUploader
                value={fileList}
                onChange={setFileList}
                upload={file => {
                  // 模拟上传
                  return new Promise(resolve => {
                    setTimeout(() => {
                      resolve({
                        url: URL.createObjectURL(file),
                      });
                    }, 1000);
                  });
                }}
                multiple
                maxCount={3}
              />
            </Form.Item>
          </Form>
        }
        closeOnAction
        onClose={() => setFeedbackVisible(false)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
          },
          {
            key: 'submit',
            text: '提交反馈',
            bold: true,
            danger: false,
            onClick: () => {
              const formElement = document.querySelector('form');
              if (formElement) {
                formElement.dispatchEvent(new Event('submit', { cancelable: true }));
              }
            },
          },
        ]}
      />

      {/* 路线选择对话框 */}
      <Dialog
        visible={routeSelectionVisible}
        title="选择无障碍路线"
        content={
          <div className="route-selection">
            {scenicData.routes.map(route => (
              <Card
                key={route.id}
                className="route-selection-card"
                onClick={() => handleSelectRoute(route)}
              >
                <div className="route-selection-title">{route.name}</div>
                <div className="route-selection-info">
                  <Tag color="primary">{route.duration}</Tag>
                  <Tag color="primary">{route.distance}</Tag>
                  <Tag color={route.difficulty === '简单' ? 'success' : 'warning'}>
                    {route.difficulty}
                  </Tag>
                </div>
              </Card>
            ))}
          </div>
        }
        closeOnAction={false}
        closeOnMaskClick={false}
        actions={[
          {
            key: 'back',
            text: '返回',
            onClick: () => {
              navigate(-1);
            }
          }
        ]}
      />

      {/* 地图模态框 */}
      <Dialog
        visible={mapVisible}
        title="路线地图"
        content={
          <div className="map-modal-content">
            {window.AMap ? (
              <AccessibilityMap
                center={[116.397428, 39.90923]} // 故宫坐标
                markers={routePoints.map(point => ({
                  position: [point.coordinates.lng, point.coordinates.lat],
                  title: point.location
                }))}
                path={routePoints.map(point => [point.coordinates.lng, point.coordinates.lat])}
                facilities={[
                  {
                    position: [116.398428, 39.90923],
                    type: 'wheelchair',
                    name: '轮椅租赁点'
                  },
                  {
                    position: [116.397428, 39.91023],
                    type: 'toilet',
                    name: '无障碍厕所'
                  }
                ]}
                title={`${scenicData.name}路线记录`}
                height={350}
              />
            ) : (
              <div className="map-placeholder">
                <div className="map-info">
                  <h3>高德地图</h3>
                  <p>景点：{scenicData.name}</p>
                  <p>当前位置：{currentLocation || '未开始记录'}</p>
                  <p>已记录点数：{routePoints.length}</p>
                  <p className="map-note">注：高德地图API未加载，请检查网络连接</p>
                </div>
              </div>
            )}
          </div>
        }
        closeOnMaskClick
        onClose={() => setMapVisible(false)}
        actions={[
          {
            key: 'close',
            text: '关闭',
            onClick: () => setMapVisible(false)
          }
        ]}
      />

      {/* 轨迹热力线地图对话框 */}
      <Dialog
        visible={heatlineMapVisible}
        title="无障碍轨迹热力图"
        content={
          <div className="heatline-map-modal-content">
            {window.AMap ? (
              <TrackHeatlineMap
                center={[116.397428, 39.90923]} // 故宫坐标
                scenicSpotId={scenicSpotId}
                userProfile={userProfile}
                title={`${scenicData.name} - 轨迹热力图`}
                height={400}
                showControls={true}
              />
            ) : (
              <div className="map-placeholder">
                <div className="map-info">
                  <h3>轨迹热力图</h3>
                  <p>景点：{scenicData.name}</p>
                  <p>功能：显示用户轨迹热力线</p>
                  <p>绿色线条：安全路径（多人走过）</p>
                  <p>灰色线条：可能有障碍（很少人走）</p>
                  <p className="map-note">注：高德地图API未加载，请检查网络连接</p>
                </div>
              </div>
            )}
          </div>
        }
        closeOnMaskClick
        onClose={() => setHeatlineMapVisible(false)}
        actions={[
          {
            key: 'close',
            text: '关闭',
            onClick: () => setHeatlineMapVisible(false)
          }
        ]}
      />

      {/* 底部提示 */}
      {!routePoints.length && !isRecording && selectedRoute && (
        <div className="bottom-tips">
          <p>点击"开始记录"按钮，记录您的游览路线</p>
          <p>遇到无障碍问题时，可以点击"遇到问题"按钮进行反馈</p>
        </div>
      )}
    </div>
  );
};

export default RouteRecord;
