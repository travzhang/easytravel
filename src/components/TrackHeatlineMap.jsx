import React, { useEffect, useRef, useState } from 'react';
import { Card, Toast, Button, Space, Switch, Badge, Dialog } from 'antd-mobile';
import { 
  EnvironmentOutline, 
  CloseOutline, 
  PlayOutline, 
//   PauseOutline,
  EyeOutline,
  LocationOutline
} from 'antd-mobile-icons';
import { initMap, addMarker } from '../utils/mapUtils';
import trackHeatlineService from '../services/trackHeatlineService';
import './TrackHeatlineMap.css';

/**
 * 轨迹热力线地图组件
 * 显示基于用户轨迹数据的热力线，绿色表示安全路径，灰色表示可能有障碍的路径
 */
const TrackHeatlineMap = ({
  center = [116.397428, 39.90923],
  scenicSpotId = 'forbidden_city',
  userProfile = {
    userId: 'user_001',
    disabilityType: 'wheelchair',
    assistiveDevice: 'manual_wheelchair',
    mobilityLevel: 'moderate'
  },
  title = '无障碍轨迹热力图',
  onClose,
  height = 400,
  showControls = true
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapId = useRef(`track-heatline-map-${Date.now()}`);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showHeatlines, setShowHeatlines] = useState(true);
  const [trackingStats, setTrackingStats] = useState({
    duration: 0,
    distance: 0,
    points: 0
  });
  const [heatlineStats, setHeatlineStats] = useState({
    totalLines: 0,
    safeLines: 0,
    warningLines: 0
  });
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  // 初始化地图
  useEffect(() => {
    if (!window.AMap) {
      setError('高德地图API未加载，请在index.html中引入高德地图JS API');
      return;
    }

    initMap(mapId.current, {
      zoom: 16,
      center,
      mapStyle: 'amap://styles/normal'
    }).then(mapInstance => {
      mapInstanceRef.current = mapInstance;
      setIsMapLoaded(true);

      // 添加中心点标记
      addMarker(mapInstance, center, {
        title: '景点中心',
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(32, 32),
          image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
          imageSize: new window.AMap.Size(32, 32)
        })
      });

      // 加载现有热力线数据
      loadHeatlineData();

    }).catch(err => {
      console.error('地图初始化失败', err);
      setError('地图初始化失败，请稍后再试');
    });

    // 组件卸载时清理
    return () => {
      if (isTracking) {
        handleStopTracking();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [center, scenicSpotId]);

  // 加载热力线数据
  const loadHeatlineData = async () => {
    try {
      await trackHeatlineService.loadHeatlineData(scenicSpotId);
      if (showHeatlines && mapInstanceRef.current) {
        const heatlines = trackHeatlineService.drawHeatlines(mapInstanceRef.current, scenicSpotId);
        updateHeatlineStats(heatlines);
      }
    } catch (error) {
      console.warn('加载热力线数据失败，将使用本地数据:', error.message);
      // 尝试绘制本地数据
      if (showHeatlines && mapInstanceRef.current) {
        const heatlines = trackHeatlineService.drawHeatlines(mapInstanceRef.current, scenicSpotId);
        updateHeatlineStats(heatlines);
      }
    }
  };

  // 更新热力线统计
  const updateHeatlineStats = (heatlines) => {
    const stats = {
      totalLines: heatlines.length,
      safeLines: heatlines.filter(h => h.intensity >= 0.5).length,
      warningLines: heatlines.filter(h => h.intensity < 0.3).length
    };
    setHeatlineStats(stats);
  };

  // 开始轨迹记录
  const handleStartTracking = async () => {
    try {
      await trackHeatlineService.startTracking(userProfile, scenicSpotId);
      setIsTracking(true);
      
      // 开始统计更新
      const statsInterval = setInterval(() => {
        if (trackHeatlineService.currentTrack) {
          const track = trackHeatlineService.currentTrack;
          const duration = Date.now() - new Date(track.startTime).getTime();
          setTrackingStats({
            duration: Math.floor(duration / 1000),
            distance: trackHeatlineService.calculateTotalDistance(track.points),
            points: track.points.length
          });
        }
      }, 1000);

      // 保存interval ID以便清理
      trackHeatlineService._statsInterval = statsInterval;

      Toast.show({
        icon: 'success',
        content: '开始记录轨迹'
      });
    } catch (error) {
      console.error('开始轨迹记录失败:', error);
      Toast.show({
        icon: 'fail',
        content: `记录失败: ${error.message}`
      });
    }
  };

  // 停止轨迹记录
  const handleStopTracking = async () => {
    try {
      const completedTrack = await trackHeatlineService.stopTracking();
      setIsTracking(false);
      
      // 清理统计更新
      if (trackHeatlineService._statsInterval) {
        clearInterval(trackHeatlineService._statsInterval);
        trackHeatlineService._statsInterval = null;
      }

      if (completedTrack) {
        // 重新绘制热力线
        if (showHeatlines && mapInstanceRef.current) {
          const heatlines = trackHeatlineService.drawHeatlines(mapInstanceRef.current, scenicSpotId);
          updateHeatlineStats(heatlines);
        }

        Toast.show({
          icon: 'success',
          content: `轨迹记录完成，共记录${completedTrack.points.length}个点`
        });
      }
    } catch (error) {
      console.error('停止轨迹记录失败:', error);
      Toast.show({
        icon: 'fail',
        content: `停止记录失败: ${error.message}`
      });
    }
  };

  // 切换热力线显示
  const handleToggleHeatlines = (checked) => {
    setShowHeatlines(checked);
    
    if (!mapInstanceRef.current) return;

    if (checked) {
      const heatlines = trackHeatlineService.drawHeatlines(mapInstanceRef.current, scenicSpotId);
      updateHeatlineStats(heatlines);
    } else {
      trackHeatlineService.clearHeatlines(mapInstanceRef.current);
      setHeatlineStats({ totalLines: 0, safeLines: 0, warningLines: 0 });
    }
  };

  // 定位到当前位置
  const handleLocate = () => {
    if (!mapInstanceRef.current) return;

    Toast.show({
      icon: 'loading',
      content: '定位中...',
      duration: 0
    });

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
            content: '定位成功'
          });
        } else {
          Toast.show({
            icon: 'fail',
            content: '定位失败'
          });
        }
      });
    });
  };

  // 格式化时间
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 格式化距离
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  return (
    <Card className="track-heatline-map-card">
      {/* 地图头部 */}
      <div className="map-header">
        <div className="map-title">
          <EnvironmentOutline /> {title}
        </div>
        <div className="map-header-actions">
          <Button
            size="mini"
            fill="none"
            onClick={() => setShowStatsDialog(true)}
          >
            <EyeOutline />
          </Button>
          {onClose && (
            <Button
              size="mini"
              fill="none"
              onClick={onClose}
            >
              <CloseOutline />
            </Button>
          )}
        </div>
      </div>

      {/* 热力线图例 */}
      <div className="heatline-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#00C851' }}></div>
          <span>非常安全</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#2BBBAD' }}></div>
          <span>比较安全</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FF8800' }}></div>
          <span>一般</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FF4444' }}></div>
          <span>需注意</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#9E9E9E' }}></div>
          <span>可能有障碍</span>
        </div>
      </div>

      {error ? (
        <div className="map-error">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* 地图容器 */}
          <div
            id={mapId.current}
            ref={mapContainerRef}
            className="map-container"
            style={{ height: `${height}px` }}
          />

          {/* 控制面板 */}
          {isMapLoaded && showControls && (
            <div className="map-controls">
              <div className="control-row">
                <Space>
                  <Button
                    size="small"
                    color={isTracking ? 'danger' : 'primary'}
                    onClick={isTracking ? handleStopTracking : handleStartTracking}
                  >
                    {/* {isTracking ? <PauseOutline /> : <PlayOutline />} */}
                    {isTracking ? '停止记录' : '开始记录'}
                  </Button>
                  
                  <Button size="small" onClick={handleLocate}>
                    <LocationOutline /> 定位
                  </Button>
                </Space>
              </div>

              <div className="control-row">
                <div className="switch-control">
                  <span>显示热力线</span>
                  <Switch
                    checked={showHeatlines}
                    onChange={handleToggleHeatlines}
                  />
                </div>
              </div>

              {/* 实时统计 */}
              {isTracking && (
                <div className="tracking-stats">
                  <Badge content={trackingStats.points}>
                    <span>记录点数</span>
                  </Badge>
                  <span>时长: {formatDuration(trackingStats.duration)}</span>
                  <span>距离: {formatDistance(trackingStats.distance)}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 统计信息对话框 */}
      <Dialog
        visible={showStatsDialog}
        title="热力线统计"
        content={
          <div className="heatline-stats">
            <div className="stat-item">
              <span className="stat-label">总路径数:</span>
              <span className="stat-value">{heatlineStats.totalLines}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">安全路径:</span>
              <span className="stat-value safe">{heatlineStats.safeLines}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">需注意路径:</span>
              <span className="stat-value warning">{heatlineStats.warningLines}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">安全率:</span>
              <span className="stat-value">
                {heatlineStats.totalLines > 0 
                  ? `${((heatlineStats.safeLines / heatlineStats.totalLines) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>
        }
        closeOnMaskClick
        onClose={() => setShowStatsDialog(false)}
        actions={[
          {
            key: 'close',
            text: '关闭',
            onClick: () => setShowStatsDialog(false)
          }
        ]}
      />
    </Card>
  );
};

export default TrackHeatlineMap; 