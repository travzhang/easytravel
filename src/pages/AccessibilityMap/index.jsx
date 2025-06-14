import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  NavBar,
  Card,
  Button,
  Switch,
  Tabs,
  Modal,
  Toast,
  Badge,
  Space,
  Selector,
  FloatingPanel,
  TextArea,
  Radio,
  ErrorBlock
} from 'antd-mobile';
import {
  EnvironmentOutline,
  EyeOutline,
  CheckCircleOutline,
  ExclamationCircleOutline,
  UserOutline,
  SetOutline,
  MoreOutline
} from 'antd-mobile-icons';
import ApiService from '../../services/api';
import AIHeatlineService from '../../services/aiHeatlineService';
import './index.css';

// 添加CSS样式
const styles = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .stat-card {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .stat-card:nth-child(1) { animation-delay: 0.1s; }
  .stat-card:nth-child(2) { animation-delay: 0.2s; }
  .stat-card:nth-child(3) { animation-delay: 0.3s; }
  .stat-card:nth-child(4) { animation-delay: 0.4s; }
  
  .modern-bottom-panel {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

const AccessibilityMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  
  // 状态管理 - 使用安全的默认值
  const [isTracking, setIsTracking] = useState(false);
  const [showHeatlines, setShowHeatlines] = useState(true);
  const [currentUserType, setCurrentUserType] = useState('wheelchair');
  const [trackingData, setTrackingData] = useState([]);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [activeTab, setActiveTab] = useState('legend');
  const [isLoading, setIsLoading] = useState(true);
  const [panelCollapsed, setPanelCollapsed] = useState(true);

  // 景点数据 - 根据ID动态获取
  const getScenecData = () => {
    const scenics = {
      '1': {
        name: '故宫博物院',
        center: [116.397428, 39.90923],
        bounds: [[116.390, 39.905], [116.405, 39.913]]
      },
      '2': {
        name: '颐和园',
        center: [116.264058, 39.999415],
        bounds: [[116.258, 39.994], [116.270, 40.005]]
      },
      '3': {
        name: '上海迪士尼乐园',
        center: [121.667662, 31.155831],
        bounds: [[121.655, 31.150], [121.680, 31.162]]
      }
    };
    return scenics[id] || {
      name: '未知景区',
      center: [116.397428, 39.90923],
      bounds: [[116.390, 39.905], [116.405, 39.913]]
    };
  };

  const scenicData = getScenecData();

  // 热力线数据和问题点数据现在从AI服务获取，带有默认值
  const [heatlineData, setHeatlineData] = useState([]);
  const [issuePoints, setIssuePoints] = useState([]);
  const [accessibilityFacilities, setAccessibilityFacilities] = useState([]);

  // 用户类型选项
  const userTypeOptions = [
    { label: '♿ 轮椅使用者', value: 'wheelchair' },
    { label: '👁️ 视障人士', value: 'visualImpaired' },
    { label: '👂 听障人士', value: 'hearingImpaired' },
    { label: '🧠 认知障碍', value: 'cognitive' }
  ];

  // 初始化地图
  useEffect(() => {
    if (window.AMap && mapRef.current) {
      // 基于新的完整坐标范围计算中心点
      // 经度范围：116.395937 - 116.39846 (约0.0025度)
      // 纬度范围：39.914109 - 39.916825 (约0.002716度)
      const newCenterLng = (116.395937 + 116.39846) / 2; // 116.3971985
      const newCenterLat = (39.914109 + 39.916825) / 2;  // 39.915467
      const newCenter = [newCenterLng, newCenterLat];
      
      const mapInstance = new window.AMap.Map(mapRef.current, {
        center: newCenter, // 使用新的精确中心
        zoom: 16, // 降低缩放级别以显示更大范围
        mapStyle: 'amap://styles/normal',
        features: ['bg', 'road', 'point', 'building'],
        // 确保地图可以交互
        dragEnable: true,
        zoomEnable: true,
        doubleClickZoom: true,
        keyboardEnable: true
      });

      // 添加调试信息
      console.log('🗺️ 地图初始化完成 - 完整路线区域:', {
        center: newCenter,
        centerFormatted: `${newCenterLng.toFixed(6)}, ${newCenterLat.toFixed(6)}`,
        zoom: 16,
        coordinateRange: {
          lng: '116.395937 - 116.39846 (span: 0.002523)',
          lat: '39.914109 - 39.916825 (span: 0.002716)'
        },
        coverage: '涵盖所有推荐、谨慎和阻塞路线'
      });

      // 等待地图完全加载
      mapInstance.on('complete', () => {
        console.log('🗺️ 地图加载完成，中心点已校正到完整路线区域中心');
        setMap(mapInstance);
      });

      // 添加地图点击事件
      mapInstance.on('click', handleMapClick);

      return () => {
        mapInstance.destroy();
      };
    }
  }, []);

  // 加载热力图数据
  const loadHeatmapData = async () => {
    try {
      setIsLoading(true);
      
      console.log('🤖 加载用户提供的完整路线数据...', { scenicId: id, userType: currentUserType });
      
      // 好走的路线数据
      const goodRoutes = [
        {
          id: 'good_route_1',
          name: '推荐路线1',
          coords: [[116.395946,39.91559], [116.39846,39.915681]],
          category: 'recommended',
          safetyScore: 0.95,
          accessibilityRating: 'excellent'
        },
        {
          id: 'good_route_2', 
          name: '推荐路线2',
          coords: [[116.395937,39.915819], [116.39846,39.915889]],
          category: 'recommended',
          safetyScore: 0.93,
          accessibilityRating: 'excellent'
        },
        {
          id: 'good_route_3',
          name: '推荐路线3', 
          coords: [[116.396392,39.915607], [116.396361,39.916261]],
          category: 'recommended',
          safetyScore: 0.91,
          accessibilityRating: 'good'
        },
        {
          id: 'good_route_4',
          name: '推荐路线4',
          coords: [[116.397892,39.915664], [116.397857,39.916318]],
          category: 'recommended', 
          safetyScore: 0.90,
          accessibilityRating: 'good'
        }
      ];

      // 不好走的路线数据
      const difficultRoutes = [
        {
          id: 'difficult_route_1',
          name: '谨慎路线1 - 路况较差',
          coords: [[116.397126,39.916298], [116.397105,39.916825]],
          category: 'caution',
          safetyScore: 0.65,
          accessibilityRating: 'poor'
        },
        {
          id: 'difficult_route_2',
          name: '谨慎路线2 - 路况较差', 
          coords: [[116.396995,39.916302], [116.396982,39.916818]],
          category: 'caution',
          safetyScore: 0.62,
          accessibilityRating: 'poor'
        },
        {
          id: 'difficult_route_3',
          name: '谨慎路线3 - 路况较差',
          coords: [[116.397245,39.916305], [116.397231,39.916825]],
          category: 'caution', 
          safetyScore: 0.68,
          accessibilityRating: 'poor'
        }
      ];

      // 阻塞的线路数据
      const blockedRoutes = [
        {
          id: 'blocked_route_1',
          name: '阻塞路线1 - 暂时关闭',
          coords: [[116.397225,39.914114], [116.397168,39.915019]],
          category: 'blocked',
          safetyScore: 0.30,
          accessibilityRating: 'blocked'
        },
        {
          id: 'blocked_route_2',
          name: '阻塞路线2 - 暂时关闭',
          coords: [[116.396013,39.914109], [116.395988,39.915]],
          category: 'blocked',
          safetyScore: 0.25,
          accessibilityRating: 'blocked'
        },
        {
          id: 'blocked_route_3', 
          name: '阻塞路线3 - 暂时关闭',
          coords: [[116.396409,39.915419], [116.395969,39.915395]],
          category: 'blocked',
          safetyScore: 0.20,
          accessibilityRating: 'blocked'
        }
      ];

      // 合并所有路线数据，并添加完整的元数据
      const allRoutes = [...goodRoutes, ...difficultRoutes, ...blockedRoutes].map((route, index) => ({
        ...route,
        heatLevel: route.category === 'recommended' ? 90 - index*2 : 
                  route.category === 'caution' ? 50 - index*2 : 20 - index*2,
        totalPasses: route.category === 'recommended' ? 2000 - index*100 : 
                    route.category === 'caution' ? 800 - index*50 : 100 - index*20,
        userCounts: route.category === 'recommended' ? 
          { wheelchair: 600 - index*50, visualImpaired: 400 - index*30, hearingImpaired: 400 - index*30, cognitive: 300 - index*20 } :
          route.category === 'caution' ?
          { wheelchair: 200 - index*20, visualImpaired: 150 - index*15, hearingImpaired: 150 - index*15, cognitive: 100 - index*10 } :
          { wheelchair: 50 - index*10, visualImpaired: 30 - index*5, hearingImpaired: 30 - index*5, cognitive: 20 - index*3 },
        avgSpeed: route.category === 'recommended' ? 1.5 - index*0.1 :
                 route.category === 'caution' ? 0.8 - index*0.05 : 0.3 - index*0.02,
        aiConfidence: route.category === 'recommended' ? 0.95 - index*0.01 :
                     route.category === 'caution' ? 0.75 - index*0.02 : 0.60 - index*0.03,
        surfaceQuality: route.category === 'recommended' ? 'smooth' :
                       route.category === 'caution' ? 'rough' : 'impassable',
        crowdLevel: route.category === 'recommended' ? 'moderate' :
                   route.category === 'caution' ? 'low' : 'closed',
        lastUpdated: new Date().toISOString()
      }));
      
      console.log('🗺️ 路线数据统计:', {
        goodRoutes: goodRoutes.length,
        difficultRoutes: difficultRoutes.length, 
        blockedRoutes: blockedRoutes.length,
        totalRoutes: allRoutes.length
      });
      
      setHeatlineData(allRoutes);
      
      // 添加困难点标记（第5个好走路线的重复点作为问题标记）
      setIssuePoints([{
        id: 'attention_point_1',
        position: [116.397148, 39.915637],
        type: 'surface',
        severity: 'medium',
        description: '此处需要特别注意，路面可能有小障碍',
        reportCount: 3,
        reportTime: Date.now() - 3600000, // 1小时前
        userType: 'wheelchair'
      }]);
      
      console.log(`🤖 数据加载完成：${allRoutes.length}条路线 (${goodRoutes.length}条推荐, ${difficultRoutes.length}条谨慎, ${blockedRoutes.length}条阻塞) + 1个注意点`);
      
    } catch (error) {
      console.error('加载热力图数据失败:', error);
      setHeatlineData([]);
      console.log('数据加载失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载反馈数据
  const loadFeedbackData = async () => {
    try {
      const response = await ApiService.getFeedback(id);
      if (response.success) {
        const feedbackList = response.data.feedback || [];
        const points = feedbackList.map(feedback => ({
          id: feedback.id,
          position: [feedback.position.lng, feedback.position.lat],
          type: feedback.type,
          severity: feedback.severity,
          description: feedback.description,
          reportCount: feedback.upvotes || 1,
          reportTime: new Date(feedback.reportTime).getTime(),
          userType: feedback.userType
        }));
        setIssuePoints(points);
      } else {
        setIssuePoints([]);
      }
    } catch (error) {
      console.error('加载反馈数据失败:', error);
      setIssuePoints([]);
    }
  };

  // 地图点击处理
  const handleMapClick = (e) => {
    const { lng, lat } = e.lnglat;
    setSelectedPoint([lng, lat]);
  };

  // 🎨 基于AI分析的智能热力线绘制系统 - 优化版
  const drawHeatlines = () => {
    console.log('🎨 开始绘制优化的热力线...', { 
      hasMap: !!map, 
      heatlineDataLength: heatlineData?.length,
      mapCenter: map ? map.getCenter() : null,
      mapZoom: map ? map.getZoom() : null
    });
    
    if (!map) {
      console.log('❌ 地图未初始化');
      return;
    }
    
    // 清除现有线条
    clearHeatlines();

    if (!heatlineData || !Array.isArray(heatlineData)) {
      console.log('❌ 热力线数据无效:', heatlineData);
      return;
    }

    console.log('📊 准备绘制', heatlineData.length, '条优化路线');

    heatlineData.forEach((segment, index) => {
      console.log(`🎯 绘制第${index + 1}条线:`, {
        name: segment.name,
        coords: segment.coords,
        safetyScore: segment.safetyScore,
        category: segment.category
      });
      
      // 验证坐标数据
      if (!segment.coords || !Array.isArray(segment.coords)) {
        console.log(`❌ 第${index + 1}条线坐标数据无效`);
        return;
      }
      
      // 过滤无效坐标
      const validCoords = segment.coords.filter(coord => {
        if (!Array.isArray(coord) || coord.length !== 2) return false;
        const [lng, lat] = coord;
        return !isNaN(lng) && !isNaN(lat) && 
               lng >= -180 && lng <= 180 && 
               lat >= -90 && lat <= 90;
      });
      
      if (validCoords.length < 2) {
        console.log(`❌ 第${index + 1}条线有效坐标点不足`);
        return;
      }
      
      console.log(`🎯 有效坐标点数: ${validCoords.length}`);
      
      // 为不同类型的路线设计专门的样式
      let lineStyle = {};
      
      if (segment.category === 'recommended') {
        // 推荐路线 - 绿色系渐变
        lineStyle = {
          strokeColor: segment.safetyScore >= 0.93 ? '#10b981' : '#22c55e', // 翠绿到亮绿
          strokeWeight: 8,
          strokeOpacity: 0.9,
          strokeStyle: 'solid',
          showDir: true, // 显示方向箭头
          cursor: 'pointer',
          zIndex: 300 + index
        };
      } else if (segment.category === 'caution') {
        // 谨慎路线 - 橙色系
        lineStyle = {
          strokeColor: '#f97316', // 橙色
          strokeWeight: 6,
          strokeOpacity: 0.85,
          strokeStyle: 'dashed', // 虚线表示谨慎
          lineJoin: 'round',
          cursor: 'pointer',
          zIndex: 250 + index
        };
      } else if (segment.category === 'blocked') {
        // 阻塞路线 - 红色系
        lineStyle = {
          strokeColor: '#ef4444', // 红色
          strokeWeight: 7,
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          lineCap: 'round',
          cursor: 'pointer',
          zIndex: 200 + index
        };
      } else {
        // 其他路线 - 默认样式
        lineStyle = {
          strokeColor: '#6b7280',
          strokeWeight: 5,
          strokeOpacity: 0.7,
          strokeStyle: 'solid',
          cursor: 'pointer',
          zIndex: 150 + index
        };
      }
      
      console.log(`🎨 ${segment.category}路线样式:`, lineStyle);
      
      try {
        // 创建主要线条
        const polyline = new window.AMap.Polyline({
          path: validCoords,
          ...lineStyle
        });

        // 为不同类型路线添加特殊效果
        if (segment.category === 'recommended') {
          // 推荐路线添加底层光晕效果
          const shadowLine = new window.AMap.Polyline({
            path: validCoords,
            strokeColor: '#ffffff',
            strokeWeight: lineStyle.strokeWeight + 4,
            strokeOpacity: 0.4,
            strokeStyle: 'solid',
            zIndex: lineStyle.zIndex - 10
          });
          map.add(shadowLine);
        } else if (segment.category === 'blocked') {
          // 阻塞路线添加警告条纹效果
          const warningLine = new window.AMap.Polyline({
            path: validCoords,
            strokeColor: '#fbbf24', // 黄色警告
            strokeWeight: lineStyle.strokeWeight + 2,
            strokeOpacity: 0.3,
            strokeStyle: 'dashed',
            zIndex: lineStyle.zIndex - 5
          });
          map.add(warningLine);
        }

        // 添加点击事件
        polyline.on('click', () => {
          console.log('点击了路线:', segment.name);
          const categoryText = segment.category === 'recommended' ? '✅ 推荐' :
                              segment.category === 'caution' ? '⚠️ 谨慎' : '🚫 阻塞';
          const message = `🛣️ ${segment.name}\n${categoryText} | ⭐ 安全评分：${(segment.safetyScore * 100).toFixed(1)}%\n👥 通行次数：${segment.totalPasses}\n🚶 平均速度：${segment.avgSpeed}m/s`;
          console.log(message);
          
          // 路线高亮效果 - 根据类型调整
          const highlightWeight = lineStyle.strokeWeight + (segment.category === 'blocked' ? 3 : 2);
          polyline.setOptions({
            strokeWeight: highlightWeight,
            strokeOpacity: 1.0
          });
          
          // 3秒后恢复
          setTimeout(() => {
            polyline.setOptions({
              strokeWeight: lineStyle.strokeWeight,
              strokeOpacity: lineStyle.strokeOpacity
            });
          }, 3000);
        });

        // 添加到地图
        map.add(polyline);
        console.log(`✅ 第${index + 1}条线绘制完成 (${segment.category} - ${segment.name})`);
        
        // 为推荐路线添加起点和终点标记
        if (segment.category === 'recommended' && validCoords.length >= 2) {
          // 起点标记 - 绿色圆点
          const _startMarker = new window.AMap.Marker({
            position: validCoords[0],
            icon: new window.AMap.Icon({
              size: new window.AMap.Size(28, 28),
              image: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="12" fill="#10b981" stroke="white" stroke-width="3"/>
                  <circle cx="14" cy="14" r="5" fill="white"/>
                  <text x="14" y="17" text-anchor="middle" fill="#10b981" font-size="8" font-weight="bold">S</text>
                </svg>
              `),
              imageSize: new window.AMap.Size(28, 28)
            }),
            title: `${segment.name} - 起点`,
            map: map,
            zIndex: 400
          });

          // 终点标记 - 绿色旗帜
          const _endMarker = new window.AMap.Marker({
            position: validCoords[validCoords.length - 1],
            icon: new window.AMap.Icon({
              size: new window.AMap.Size(28, 28),
              image: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="12" fill="#22c55e" stroke="white" stroke-width="3"/>
                  <circle cx="14" cy="14" r="5" fill="white"/>
                  <text x="14" y="17" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="bold">E</text>
                </svg>
              `),
              imageSize: new window.AMap.Size(28, 28)
            }),
            title: `${segment.name} - 终点`,
            map: map,
            zIndex: 400
          });
        } else if (segment.category === 'blocked' && validCoords.length >= 2) {
          // 阻塞路线添加警告标记
          validCoords.forEach((coord, coordIndex) => {
            const _warningMarker = new window.AMap.Marker({
              position: coord,
              icon: new window.AMap.Icon({
                size: new window.AMap.Size(24, 24),
                image: 'data:image/svg+xml;base64,' + btoa(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">⚠</text>
                  </svg>
                `),
                imageSize: new window.AMap.Size(24, 24)
              }),
              title: `${segment.name} - 阻塞点${coordIndex + 1}`,
              map: map,
              zIndex: 350
            });
          });
        }
        
      } catch (error) {
        console.error(`❌ 绘制第${index + 1}条线失败:`, error);
      }
    });
    
    console.log('🎨 优化热力线绘制完成，共', heatlineData.length, '条路径');
  };

  // 清除热力线
  const clearHeatlines = () => {
    if (map) {
      console.log('🧹 清除现有热力线');
      const overlays = map.getAllOverlays('polyline') || [];
      overlays.forEach(overlay => {
        map.remove(overlay);
      });
      console.log('🧹 清除完成，共清除', overlays.length, '条线');
    }
  };

  // 绘制问题点
  const drawIssuePoints = () => {
    if (!map) return;
    
    // 清除现有问题点
    const markers = map.getAllOverlays('marker') || [];
    markers.forEach(marker => {
      if (marker._issueData) {
        map.remove(marker);
      }
    });

    if (!issuePoints || !Array.isArray(issuePoints)) {
      return;
    }

    issuePoints.forEach(issue => {
      const color = issue.severity === 'high' ? '#ff4d4f' : 
                   issue.severity === 'medium' ? '#faad14' : '#52c41a';

      const marker = new window.AMap.Marker({
        position: issue.position,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(24, 24),
          image: `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}">
              <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="12">!</text>
            </svg>
          `)}`,
          imageSize: new window.AMap.Size(24, 24)
        }),
        cursor: 'pointer'
      });

      marker.on('click', () => {
        showIssueInfo(issue);
      });

      map.add(marker);
      marker._issueData = issue;
    });
  };

  // 绘制无障碍设施标记
  const drawAccessibilityFacilities = () => {
    if (!map) return;
    
    // 清除现有设施标记
    const markers = map.getAllOverlays('marker') || [];
    markers.forEach(marker => {
      if (marker._facilityData) {
        map.remove(marker);
      }
    });

    if (!accessibilityFacilities || !Array.isArray(accessibilityFacilities)) {
      return;
    }

    accessibilityFacilities.forEach(facility => {
      const iconColor = facility.verified ? '#1890ff' : '#faad14';
      const facilityIcon = getFacilityIcon(facility.type);

      const marker = new window.AMap.Marker({
        position: facility.position,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(28, 28),
          image: `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="${iconColor}">
              <circle cx="14" cy="14" r="12" stroke="white" stroke-width="2"/>
              <text x="14" y="18" text-anchor="middle" fill="white" font-size="10" font-family="Arial">${facilityIcon}</text>
            </svg>
          `)}`,
          imageSize: new window.AMap.Size(28, 28)
        }),
        cursor: 'pointer'
      });

      marker.on('click', () => {
        showFacilityInfo(facility);
      });

      map.add(marker);
      marker._facilityData = facility;
    });
  };

  // 获取设施图标
  const getFacilityIcon = (type) => {
    const icons = {
      toilet: 'WC',
      wheelchair_rental: 'WC',
      elevator: 'EL',
      guide_dog_area: 'DOG',
      parking: 'P',
      ramp: 'RA',
      audio_guide: 'AU'
    };
    return icons[type] || 'FA';
  };

  // 开始/停止轨迹追踪
  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  // 开始追踪
  const startTracking = () => {
    setIsTracking(true);
    Toast.show({ content: '🔄 开始记录您的无障碍轨迹...', duration: 2000 });
    
    // 模拟GPS追踪
    const trackingInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const point = {
            timestamp: Date.now(),
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || 0,
            userType: currentUserType
          };
          
          setTrackingData(prev => [...prev, point]);
        });
      }
    }, 3000);

    // 存储定时器ID
    window.trackingInterval = trackingInterval;
  };

  // 停止追踪
  const stopTracking = () => {
    setIsTracking(false);
    clearInterval(window.trackingInterval);
    
    if (trackingData && trackingData.length > 0) {
      uploadTrackingData();
      Toast.show({ content: '✅ 轨迹数据已上传，感谢您的贡献！', duration: 2000 });
    }
  };

  // 上传轨迹数据
  const uploadTrackingData = async () => {
    try {
      const trajectoryData = {
        scenicId: id,
        userId: 'anonymous_' + Date.now(), // 实际应用中应该是真实用户ID
        userType: currentUserType,
        points: trackingData,
        metadata: {
          weather: 'unknown',
          temperature: 20
        }
      };

      const response = await ApiService.uploadTrajectory(trajectoryData);
      if (response.success) {
        console.log('轨迹上传成功:', response.data);
        // 重新加载热力图数据
        loadHeatmapData();
      }
      
      // 清空本地数据
      setTrackingData([]);
    } catch (error) {
      console.error('上传失败:', error);
      Toast.show({ content: '上传失败，请检查网络连接', duration: 2000 });
    }
  };

  // 提交问题反馈
  const submitFeedback = async (feedbackData) => {
    try {
      const data = {
        scenicId: id,
        userId: 'anonymous_' + Date.now(),
        userType: currentUserType,
        position: {
          lat: selectedPoint[1],
          lng: selectedPoint[0]
        },
        type: feedbackData.type,
        severity: feedbackData.severity,
        description: feedbackData.description,
        images: []
      };

      const response = await ApiService.submitFeedback(data);
      if (response.success) {
        setFeedbackModalVisible(false);
        setSelectedPoint(null);
        
        // 重新加载反馈数据
        loadFeedbackData();
        
        Toast.show({ content: '✅ 问题反馈已提交！', duration: 2000 });
      }
    } catch (error) {
      console.error('提交失败:', error);
      Toast.show({ content: '提交失败，请重试', duration: 2000 });
    }
  };

  // 显示问题信息
  const showIssueInfo = (issue) => {
    if (!issue) return;
    
    // 内联时间计算
    const getTimeAgo = (timestamp) => {
      const diff = Date.now() - timestamp;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days > 0) return `${days}天前`;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours > 0) return `${hours}小时前`;
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}分钟前`;
    };
    
    Toast.show({
      content: `⚠️ 问题反馈
${issue.description || '暂无描述'}
📊 ${issue.reportCount || 1}人报告
🕒 ${getTimeAgo(issue.reportTime || Date.now())}`,
      duration: 3000
    });
  };

  // 显示设施信息
  const showFacilityInfo = (facility) => {
    if (!facility) return;
    
    Toast.show({
      content: `🏢 ${facility.name}
${facility.description}
${facility.verified ? '✅ 已验证' : '⚠️ 待验证'}`,
      duration: 3000
    });
  };

  // 加载热力图数据
  useEffect(() => {
    if (id) {
      loadHeatmapData();
      loadFeedbackData();
    }
  }, [id, currentUserType]);

  // 绘制热力线
  useEffect(() => {
    console.log('🔄 热力线绘制条件检查:', {
      hasMap: !!map,
      showHeatlines,
      heatlineDataLength: heatlineData?.length
    });
    
    if (map && showHeatlines && heatlineData?.length > 0) {
      // 添加小延迟确保地图完全就绪
      setTimeout(() => {
        console.log('🎨 开始绘制热力线...');
        drawHeatlines();
      }, 100);
    } else if (map && !showHeatlines) {
      console.log('🧹 清除热力线');
      clearHeatlines();
    }
  }, [map, showHeatlines, heatlineData]);

  // 绘制问题点
  useEffect(() => {
    if (map) {
      drawIssuePoints();
    }
  }, [map, issuePoints]);

  // 绘制无障碍设施
  useEffect(() => {
    if (map) {
      drawAccessibilityFacilities();
    }
  }, [map, accessibilityFacilities]);

  // 模拟无障碍设施数据
  useEffect(() => {
    const facilities = [
      {
        id: 1,
        name: '无障碍厕所',
        type: 'toilet',
        position: [scenicData.center[0] + 0.001, scenicData.center[1] - 0.001],
        description: '配备扶手和轮椅通道',
        verified: true
      },
      {
        id: 2,
        name: '轮椅租借点',
        type: 'wheelchair_rental',
        position: [scenicData.center[0] + 0.002, scenicData.center[1]],
        description: '免费轮椅租借服务',
        verified: true
      },
      {
        id: 3,
        name: '无障碍电梯',
        type: 'elevator',
        position: [scenicData.center[0] + 0.003, scenicData.center[1] + 0.001],
        description: '连接各楼层的无障碍电梯',
        verified: true
      }
    ];
    setAccessibilityFacilities(facilities);
  }, []);

  // 如果ID不存在，显示错误页面
  if (!id) {
    return (
      <div className="accessibility-map-container">
        <NavBar onBack={() => navigate(-1)}>
          无障碍地图
        </NavBar>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <ErrorBlock
            status="default"
            title="页面参数错误"
            description="请返回重新选择景区"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="accessibility-map-container">
      <NavBar onBack={() => navigate(-1)} className="map-navbar">
        {scenicData.name} - 无障碍地图
      </NavBar>

      {/* 地图容器 - 确保不被底部面板遮挡 */}
      <div className="map-wrapper" style={{ 
        position: 'relative', 
        height: 'calc(100vh - 45px)',
        // 确保地图可以接收交互事件
        pointerEvents: 'auto',
        zIndex: 1
      }}>
        <div ref={mapRef} className="amap-container" style={{ 
          width: '100%', 
          height: '100%',
          // 确保地图容器可以交互
          pointerEvents: 'auto'
        }} />

        {/* 浮动操作按钮组 - 快速功能访问 */}
        <div className="floating-actions" style={{
          position: 'absolute',
          bottom: '100px',
          right: '20px',
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'auto'
        }}>
          {/* 快速报告问题按钮 - 跳转到反馈页面 */}
          <Button
            shape="rounded"
            size="large"
            color="warning"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: 0
            }}
            onClick={() => {
              navigate('/feedback');
            }}
          >
            <ExclamationCircleOutline style={{ fontSize: '24px' }} />
          </Button>

          {/* 刷新热力线按钮 - 调试用 */}
          <Button
            shape="rounded"
            size="large"
            color="primary"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: 0
            }}
            onClick={() => {
              console.log('🔄 手动刷新热力线');
              loadHeatmapData();
            }}
          >
            <span style={{ fontSize: '24px' }}>🔄</span>
          </Button>

          {/* 更多操作按钮 */}
          <Button
            shape="rounded"
            size="large"
            color="default"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: 0
            }}
            onClick={() => {
              setPanelCollapsed(!panelCollapsed);
            }}
          >
            <MoreOutline style={{ fontSize: '24px' }} />
          </Button>
        </div>
      </div>

      {/* 底部现代化控制面板 - 调整z-index避免遮挡地图 */}
      <ErrorBoundary>
        <div className="modern-bottom-panel" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
          backdropFilter: 'blur(10px)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1), 0 -1px 3px rgba(0,0,0,0.05)',
          zIndex: 100, // 降低z-index，不要遮挡地图
          transform: panelCollapsed ? 'translateY(calc(100% - 72px))' : 'translateY(0)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: '75vh',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          // 确保面板不会阻止地图交互
          pointerEvents: panelCollapsed ? 'none' : 'auto'
        }}>
          {/* 优化的面板头部 - 始终可交互 */}
          <div 
            className="modern-panel-header" 
            style={{ 
              padding: '16px 20px',
              borderBottom: panelCollapsed ? 'none' : '1px solid rgba(0,0,0,0.08)',
              cursor: 'pointer',
              position: 'relative',
              pointerEvents: 'auto' // 确保头部始终可点击
            }}
            onClick={() => setPanelCollapsed(!panelCollapsed)}
          >
            {/* 拖拽指示器 */}
            <div style={{ 
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '36px', 
              height: '4px', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '2px',
              transition: 'all 0.3s ease'
            }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {/* 热力图开关 - 现代化设计 */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: showHeatlines ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.05)',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  <SetOutline color={showHeatlines ? '#22c55e' : '#94a3b8'} size={18} />
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: showHeatlines ? '#22c55e' : '#64748b'
                  }}>热力图</span>
                  <Switch
                    checked={showHeatlines}
                    onChange={setShowHeatlines}
                    style={{ 
                      '--checked-color': '#22c55e',
                      '--width': '44px',
                      '--height': '24px'
                    }}
                  />
                </div>
                
                {/* 轨迹记录按钮 - 现代化设计 */}
                <Button
                  color={isTracking ? 'danger' : 'primary'}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTracking();
                  }}
                  style={{ 
                    minWidth: '80px',
                    height: '36px',
                    borderRadius: '12px',
                    fontWeight: '500',
                    boxShadow: isTracking ? '0 2px 8px rgba(239, 68, 68, 0.2)' : '0 2px 8px rgba(59, 130, 246, 0.2)',
                    border: 'none'
                  }}
                >
                  {isTracking ? (
                    <>
                      <span>停止</span>
                      {trackingData.length > 0 && (
                        <Badge 
                          content={trackingData.length} 
                          style={{ 
                            marginLeft: '4px',
                            background: 'rgba(255,255,255,0.9)',
                            color: '#ef4444'
                          }} 
                        />
                      )}
                    </>
                  ) : '开始记录'}
                </Button>
              </div>
              
              {/* 展开状态指示 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#64748b',
                fontSize: '14px'
              }}>
                <span>{panelCollapsed ? '展开面板' : '收起面板'}</span>
                <div style={{ 
                  width: '20px', 
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: panelCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease'
                }}>
                  <span style={{ fontSize: '12px' }}>▲</span>
                </div>
              </div>
            </div>
          </div>

          {/* 面板内容 - 现代化标签页 */}
          {!panelCollapsed && (
            <div style={{ 
              maxHeight: 'calc(75vh - 88px)', 
              overflow: 'auto',
              background: 'rgba(255,255,255,0.5)'
            }}>
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                style={{
                  '--active-line-color': '#99baf0',
                  '--content-padding': '16px 20px'
                }}
              >
                <Tabs.Tab title="🎛️ 控制中心" key="controls">
                  <div style={{ padding: '20px' }}>
                    {/* 用户类型选择 - 卡片式设计 */}
                    <div style={{ 
                      background: 'white',
                      borderRadius: '16px',
                      padding: '20px',
                      marginBottom: '16px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <h4 style={{ 
                        margin: '0 0 12px 0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: '#1e293b',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        <UserOutline color="#3b82f6" /> 选择用户类型
                      </h4>
                      <Selector
                        options={userTypeOptions}
                        value={[currentUserType]}
                        onChange={(val) => setCurrentUserType(val[0])}
                        style={{ 
                          '--padding': '12px 16px',
                          '--border-radius': '12px',
                          '--border': '1px solid #e2e8f0',
                          '--checked-color': '#3b82f6'
                        }}
                      />
                    </div>

                    {/* 轨迹状态信息 - 优化设计 */}
                    {isTracking && (
                      <div style={{ 
                        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                        borderRadius: '16px',
                        padding: '16px',
                        border: '1px solid #bbf7d0',
                        marginBottom: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#22c55e',
                            animation: 'pulse 2s infinite'
                          }} />
                          <EnvironmentOutline color="#22c55e" size={20} />
                          <div>
                            <div style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>
                              正在记录轨迹
                            </div>
                            <div style={{ fontSize: '12px', color: '#15803d' }}>
                              已记录 {trackingData.length} 个GPS点位
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Tabs.Tab>

                <Tabs.Tab title="📊 数据统计" key="stats">
                  <div style={{ padding: '20px' }}>
                    <h4 style={{ 
                      margin: '0 0 16px 0',
                      color: '#1e293b',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>📊 区域通行数据</h4>
                    {isLoading ? (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '40px',
                        color: '#64748b'
                      }}>
                        <div style={{ fontSize: '16px' }}>加载数据中...</div>
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px'
                      }}>
                        <div className="stat-card" style={{
                          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                          borderRadius: '16px',
                          padding: '16px',
                          textAlign: 'center',
                          border: '1px solid #86efac'
                        }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a', marginBottom: '4px' }}>
                            {(heatlineData || []).filter(item => item?.category === 'recommended').length}
                          </div>
                          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '500' }}>推荐路线</div>
                        </div>
                        <div className="stat-card" style={{
                          background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
                          borderRadius: '16px',
                          padding: '16px',
                          textAlign: 'center',
                          border: '1px solid #fb923c'
                        }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ea580c', marginBottom: '4px' }}>
                            {(heatlineData || []).filter(item => item?.category === 'caution').length}
                          </div>
                          <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '500' }}>谨慎路线</div>
                        </div>
                        <div className="stat-card" style={{
                          background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                          borderRadius: '16px',
                          padding: '16px',
                          textAlign: 'center',
                          border: '1px solid #f87171'
                        }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>
                            {(heatlineData || []).filter(item => item?.category === 'blocked').length}
                          </div>
                          <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: '500' }}>阻塞路线</div>
                        </div>
                        <div className="stat-card" style={{
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          borderRadius: '16px',
                          padding: '16px',
                          textAlign: 'center',
                          border: '1px solid #fbbf24'
                        }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706', marginBottom: '4px' }}>
                            {(issuePoints || []).length}
                          </div>
                          <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '500' }}>注意点位</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Tabs.Tab>

                <Tabs.Tab title="🗺️ 图例指南" key="legend">
                  <div style={{ padding: '20px' }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <h4 style={{ 
                        margin: '0 0 16px 0',
                        color: '#1e293b',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>🗺️ 路线类型说明</h4>
                      <div className="legend-items" style={{ marginBottom: '24px' }}>
                        {[
                          { color: '#10b981', label: '✅ 推荐路线 - 无障碍通行，安全可靠', width: '8px', style: 'solid' },
                          { color: '#f97316', label: '⚠️ 谨慎路线 - 路况一般，需要小心', width: '6px', style: 'dashed' },
                          { color: '#ef4444', label: '🚫 阻塞路线 - 暂时关闭或无法通行', width: '7px', style: 'solid' },
                          { color: '#6b7280', label: '➡️ 其他路线 - 一般通道', width: '5px', style: 'solid' }
                        ].map((item, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '12px',
                            padding: '10px',
                            borderRadius: '8px',
                            background: 'rgba(0,0,0,0.02)',
                            border: '1px solid rgba(0,0,0,0.05)'
                          }}>
                            <div style={{ 
                              width: '32px', 
                              height: item.width, 
                              background: item.color, 
                              borderRadius: '2px',
                              marginRight: '12px',
                              border: item.style === 'dashed' ? `2px dashed ${item.color}` : 'none',
                              backgroundColor: item.style === 'dashed' ? 'transparent' : item.color
                            }}></div>
                            <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{item.label}</span>
                          </div>
                        ))}
                      </div>

                      <h4 style={{ 
                        margin: '0 0 16px 0',
                        color: '#1e293b',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>📊 通行热力说明</h4>
                      <div className="legend-items" style={{ marginBottom: '24px' }}>
                        {[
                          { color: '#22c55e', label: '高频通行 - 经常使用的安全路线', intensity: '90%+' },
                          { color: '#f97316', label: '中频通行 - 偶尔使用，需要注意', intensity: '50-89%' },
                          { color: '#ef4444', label: '低频通行 - 很少使用或有问题', intensity: '20-49%' },
                          { color: '#6b7280', label: '极少通行 - 建议避免', intensity: '<20%' }
                        ].map((item, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(0,0,0,0.02)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ 
                                width: '16px', 
                                height: '16px', 
                                borderRadius: '50%',
                                background: item.color, 
                                marginRight: '10px' 
                              }}></div>
                              <span style={{ fontSize: '13px', color: '#374151' }}>{item.label}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{item.intensity}</span>
                          </div>
                        ))}
                      </div>

                      <h4 style={{ 
                        margin: '0 0 16px 0',
                        color: '#1e293b',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>🏢 无障碍设施说明</h4>
                      <div className="legend-items" style={{ marginBottom: '24px' }}>
                        {[
                          { icon: 'WC', label: '无障碍厕所', color: '#1890ff' },
                          { icon: 'WC', label: '轮椅租借点', color: '#1890ff' },
                          { icon: 'EL', label: '无障碍电梯', color: '#1890ff' },
                          { icon: 'DOG', label: '导盲犬休息区', color: '#1890ff' },
                          { icon: 'P', label: '无障碍停车位', color: '#1890ff' }
                        ].map((item, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '8px',
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(0,0,0,0.02)'
                          }}>
                            <span style={{ 
                              display: 'inline-block',
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              background: item.color, 
                              color: 'white',
                              fontSize: '10px',
                              textAlign: 'center',
                              lineHeight: '24px',
                              marginRight: '12px',
                              fontWeight: '600'
                            }}>{item.icon}</span>
                            <span style={{ fontSize: '14px', color: '#374151' }}>{item.label}</span>
                          </div>
                        ))}
                        <div style={{ 
                          display: 'flex', 
                          gap: '16px',
                          marginTop: '12px',
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1890ff' }}></div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>已验证</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#faad14' }}></div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>待验证</span>
                          </div>
                        </div>
                      </div>

                      <h4 style={{ 
                        margin: '0 0 16px 0',
                        color: '#1e293b',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>⚠️ 问题标记说明</h4>
                      <div className="legend-items">
                        {[
                          { color: '#ef4444', label: '严重问题 - 无法通行', icon: '🚫' },
                          { color: '#f97316', label: '中等问题 - 通行困难', icon: '⚠️' },
                          { color: '#22c55e', label: '轻微问题 - 需要注意', icon: '⚡' }
                        ].map((item, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '8px',
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(0,0,0,0.02)'
                          }}>
                            <div style={{ 
                              width: '20px', 
                              height: '20px', 
                              borderRadius: '50%', 
                              background: item.color,
                              marginRight: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px'
                            }}>{item.icon}</div>
                            <span style={{ fontSize: '14px', color: '#374151' }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Tabs.Tab>
              </Tabs>
            </div>
          )}
        </div>
      </ErrorBoundary>

      {/* 问题反馈模态框 */}
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        onSubmit={submitFeedback}
        position={selectedPoint}
      />
    </div>
  );
};

// 问题反馈模态框组件
const FeedbackModal = ({ visible, onClose, onSubmit, position }) => {
  const [issueType, setIssueType] = useState('obstacle');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');

  const issueTypes = [
    { label: '🚧 通行障碍', value: 'obstacle' },
    { label: '🛤️ 路面问题', value: 'surface' },
    { label: '🚫 设施故障', value: 'facility' },
    { label: '📍 标识不清', value: 'signage' },
    { label: '🔄 其他问题', value: 'other' }
  ];

  const severityOptions = [
    { label: '🔴 严重', value: 'high' },
    { label: '🟡 中等', value: 'medium' },
    { label: '🟢 轻微', value: 'low' }
  ];

  const handleSubmit = () => {
    if (!description.trim()) {
      Toast.show({ content: '请填写问题描述', duration: 2000 });
      return;
    }

    onSubmit({
      type: issueType,
      severity,
      description: description.trim()
    });

    // 重置表单
    setIssueType('obstacle');
    setSeverity('medium');
    setDescription('');
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="📍 报告无障碍问题"
      closeOnMaskClick={false}
      style={{
        '--z-index': '2000' // 确保模态框在最顶层
      }}
    >
      <div className="feedback-form" style={{ padding: '16px' }}>
        <div className="form-section" style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>问题类型</h4>
          <Radio.Group value={issueType} onChange={setIssueType}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {issueTypes.map(type => (
                <Radio key={type.value} value={type.value} style={{ fontSize: '14px' }}>
                  {type.label}
                </Radio>
              ))}
            </div>
          </Radio.Group>
        </div>

        <div className="form-section" style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>严重程度</h4>
          <Selector
            options={severityOptions}
            value={[severity]}
            onChange={(val) => setSeverity(val[0])}
            style={{
              '--padding': '8px 12px',
              '--border-radius': '8px'
            }}
          />
        </div>

        <div className="form-section" style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>详细描述</h4>
          <TextArea
            placeholder="请详细描述遇到的无障碍问题，如：路面不平、台阶太高、缺少扶手等..."
            value={description}
            onChange={setDescription}
            rows={3}
            maxLength={200}
            showCount
            style={{
              '--font-size': '14px',
              '--color': '#333'
            }}
          />
        </div>

        {position && (
          <div className="position-info" style={{ 
            padding: '8px 12px',
            background: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <small style={{ color: '#666' }}>
              📍 报告位置: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </small>
          </div>
        )}

        <div className="form-actions" style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end' 
        }}>
          <Button 
            onClick={onClose}
            style={{ minWidth: '80px' }}
          >
            取消
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmit}
            style={{ minWidth: '80px' }}
          >
            提交反馈
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FloatingPanel error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '16px', background: '#f0f0f0', borderRadius: '8px' }}>
          <ErrorBlock
            status="default"
            title="信息面板暂时不可用"
            description="请刷新页面重试"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default AccessibilityMap;
