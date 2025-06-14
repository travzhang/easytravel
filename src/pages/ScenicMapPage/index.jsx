import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavBar, Button, Toast } from 'antd-mobile';
import { Scene } from '@antv/l7';
import { GaodeMap } from '@antv/l7-maps';
import { PolygonLayer, LineLayer, PointLayer } from '@antv/l7';
import shanghaiScenicService from '../../services/shanghaiScenicService';
import heatlineAnalyticsService from '../../services/heatlineAnalyticsService';
import dataAcquisitionService from '../../services/dataAcquisitionService';
import userTrackingService from '../../services/userTrackingService';
import trackAnalyticsService from '../../services/trackAnalyticsService';

const ScenicMapPage = () => {
  const { scenicId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const sceneRef = useRef(null);
  const currentLayersRef = useRef([]);

  const [scenic, setScenic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('wheelchair');
  const [showLegend, setShowLegend] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState(null);
  const [useTrackData, setUseTrackData] = useState(false);

  // 坐标转换函数（WGS84转GCJ02）
  const wgs84ToGcj02 = (lng, lat) => {
    const a = 6378245.0;
    const ee = 0.00669342162296594323;
    
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
    const mgLat = lat + dLat;
    const mgLng = lng + dLng;
    return [mgLng, mgLat];
  };

  const transformLat = (lng, lat) => {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  };

  const transformLng = (lng, lat) => {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  };

  // 初始化L7地图
  const initL7Map = async () => {
    if (!mapRef.current || !scenic) return;

    try {
      // 清理现有场景
      if (sceneRef.current) {
        sceneRef.current.destroy();
      }

      // 创建新场景
      const scene = new Scene({
        id: mapRef.current,
        map: new GaodeMap({
          center: scenic.center,
          zoom: 15,
          style: 'normal'
        })
      });

      scene.on('loaded', () => {
        console.log('L7地图加载完成');
        setMapReady(true);
        setLoading(false);
      });

      sceneRef.current = scene;
    } catch (err) {
      console.error('L7地图初始化失败:', err);
      setError(`地图初始化失败: ${err.message}`);
      setLoading(false);
    }
  };

  // 加载景点数据
  const loadScenicData = async () => {
    try {
      console.log('加载景点数据:', scenicId);
      const scenicInfo = shanghaiScenicService.getScenicById(scenicId);
      
      if (!scenicInfo) {
        throw new Error('景点不存在');
      }

      setScenic(scenicInfo);
      console.log('景点数据加载成功:', scenicInfo);
    } catch (err) {
      console.error('景点数据加载失败:', err);
      setError(`景点数据加载失败: ${err.message}`);
      setLoading(false);
    }
  };

  // 获取并渲染景点数据（使用增强数据获取）
  const loadAndRenderScenicData = async () => {
    if (!scenic || !sceneRef.current) return;

    setFacilitiesLoading(true);
    try {
      console.log('获取增强景点数据...');

      // 使用增强数据获取服务
      const enhancedData = await dataAcquisitionService.getEnhancedScenicData(scenic);

      console.log('增强数据获取成功:', {
        overpass: enhancedData.overpass ? '✓' : '✗',
        elevation: enhancedData.elevation ? '✓' : '✗',
        weather: enhancedData.weather ? '✓' : '✗',
        crowd: enhancedData.crowd ? '✓' : '✗'
      });

      // 渲染景点边界和设施
      renderScenicOnMap(enhancedData);

    } catch (err) {
      console.error('景点数据获取失败:', err);
      Toast.show({
        content: `数据获取失败: ${err.message}`,
        position: 'center'
      });
    } finally {
      setFacilitiesLoading(false);
    }
  };

  // 在地图上渲染景点
  const renderScenicOnMap = (enhancedData) => {
    if (!sceneRef.current) return;

    // 处理增强数据结构
    const overpassData = enhancedData.overpass;
    if (!overpassData) {
      console.warn('没有Overpass数据，使用备用渲染方案');
      renderDefaultBoundary();
      return;
    }

    console.log('开始渲染增强景点数据:', {
      boundaries: overpassData.boundaries?.length || 0,
      roads: overpassData.roads?.length || 0,
      facilities: overpassData.facilities?.length || 0,
      weather: enhancedData.weather?.current?.condition || '未知',
      crowd: enhancedData.crowd?.current?.level || '未知'
    });

    // 清理现有图层
    currentLayersRef.current.forEach(layer => {
      if (sceneRef.current && layer) {
        sceneRef.current.removeLayer(layer);
      }
    });
    currentLayersRef.current = [];

    // 查找景点边界
    const boundary = overpassData.boundaries?.[0]; // 使用分类后的边界数据

    if (boundary && boundary.geometry) {
      renderScenicBoundary(boundary);
    } else {
      // 如果没有找到边界，创建一个基于bbox的边界
      renderDefaultBoundary();
    }

    // 渲染道路和设施（传递增强数据）
    renderRoadsAndFacilities(enhancedData);
  };

  // 创建景区外围遮罩
  const createScenicMask = (scenicCoordinates) => {
    // 创建大范围遮罩（覆盖整个地图，中间挖空景区）
    const [minLat, minLon, maxLat, maxLon] = scenic.bbox;
    const padding = 0.02; // 扩大遮罩范围

    const mapBounds = [
      [minLon - padding, minLat - padding],   // 左下角
      [maxLon + padding, minLat - padding],   // 右下角
      [maxLon + padding, maxLat + padding],   // 右上角
      [minLon - padding, maxLat + padding],   // 左上角
      [minLon - padding, minLat - padding]    // 闭合
    ];

    // 转换地图边界坐标
    const mapBoundsConverted = mapBounds.map(coord => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(coord[0], coord[1]);
      return [gcjLng, gcjLat];
    });

    // 确保景区多边形闭合
    const scenicPolygonClosed = [...scenicCoordinates];
    if (scenicPolygonClosed[0][0] !== scenicPolygonClosed[scenicPolygonClosed.length - 1][0] ||
        scenicPolygonClosed[0][1] !== scenicPolygonClosed[scenicPolygonClosed.length - 1][1]) {
      scenicPolygonClosed.push(scenicPolygonClosed[0]);
    }

    // 创建带洞的多边形（外围是地图边界，洞是景区）
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { type: 'mask' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            mapBoundsConverted,                    // 外环：地图边界
            scenicPolygonClosed.reverse()          // 内环：景区边界（逆时针，形成洞）
          ]
        }
      }]
    };
  };

  // 渲染景点边界
  const renderScenicBoundary = (boundary) => {
    const coordinates = boundary.geometry.map(point => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(point.lon, point.lat);
      return [gcjLng, gcjLat];
    });

    // 确保多边形闭合
    if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
        coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
      coordinates.push(coordinates[0]);
    }

    const polygonData = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { name: scenic.name },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        }
      }]
    };

    // 创建景区外围灰色遮罩
    const maskPolygonData = createScenicMask(coordinates);
    const maskLayer = new PolygonLayer()
      .source(maskPolygonData)
      .shape('fill')
      .color('rgba(128, 128, 128, 0.6)') // 灰色遮罩，突出景区
      .style({
        opacity: 1
      });

    // 景区多边形
    const polygonLayer = new PolygonLayer()
      .source(polygonData)
      .shape('fill')
      .color('rgba(24, 144, 255, 0.1)')
      .style({
        opacity: 0.8
      });

    // 景区边界线
    const borderLayer = new PolygonLayer()
      .source(polygonData)
      .shape('line')
      .color('#1890ff')
      .size(3)
      .style({
        opacity: 0.8
      });

    // 按照正确顺序添加图层（遮罩在最底层）
    sceneRef.current.addLayer(maskLayer);      // 灰色遮罩在最底层
    sceneRef.current.addLayer(polygonLayer);   // 景区多边形
    sceneRef.current.addLayer(borderLayer);    // 景区边界

    currentLayersRef.current.push(maskLayer, polygonLayer, borderLayer);

    // 调整视野
    const bounds = [
      [Math.min(...coordinates.map(c => c[0])), Math.min(...coordinates.map(c => c[1]))],
      [Math.max(...coordinates.map(c => c[0])), Math.max(...coordinates.map(c => c[1]))]
    ];
    sceneRef.current.fitBounds(bounds, { padding: [50, 50, 50, 50] });

    console.log('景点边界和灰色遮罩渲染完成');
  };

  // 渲染默认边界（基于bbox）
  const renderDefaultBoundary = () => {
    const [minLat, minLon, maxLat, maxLon] = scenic.bbox;
    const coordinates = [
      wgs84ToGcj02(minLon, minLat),
      wgs84ToGcj02(maxLon, minLat),
      wgs84ToGcj02(maxLon, maxLat),
      wgs84ToGcj02(minLon, maxLat),
      wgs84ToGcj02(minLon, minLat)
    ];

    const polygonData = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { name: scenic.name },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        }
      }]
    };

    // 创建景区外围灰色遮罩
    const maskPolygonData = createScenicMask(coordinates);
    const maskLayer = new PolygonLayer()
      .source(maskPolygonData)
      .shape('fill')
      .color('rgba(128, 128, 128, 0.6)') // 灰色遮罩，突出景区
      .style({
        opacity: 1
      });

    const polygonLayer = new PolygonLayer()
      .source(polygonData)
      .shape('fill')
      .color('rgba(24, 144, 255, 0.1)')
      .style({ opacity: 0.8 });

    const borderLayer = new PolygonLayer()
      .source(polygonData)
      .shape('line')
      .color('#1890ff')
      .size(3)
      .style({ opacity: 0.8 });

    // 按照正确顺序添加图层（遮罩在最底层）
    sceneRef.current.addLayer(maskLayer);      // 灰色遮罩在最底层
    sceneRef.current.addLayer(polygonLayer);   // 景区多边形
    sceneRef.current.addLayer(borderLayer);    // 景区边界

    currentLayersRef.current.push(maskLayer, polygonLayer, borderLayer);

    const bounds = [
      [Math.min(...coordinates.map(c => c[0])), Math.min(...coordinates.map(c => c[1]))],
      [Math.max(...coordinates.map(c => c[0])), Math.max(...coordinates.map(c => c[1]))]
    ];
    sceneRef.current.fitBounds(bounds, { padding: [50, 50, 50, 50] });

    console.log('默认边界和灰色遮罩渲染完成');
  };

  // 检查点是否在景区内
  const isPointInScenic = (point, scenicGeometry) => {
    if (!scenicGeometry || scenicGeometry.length === 0) return false;

    const x = point.lon;
    const y = point.lat;
    let inside = false;

    for (let i = 0, j = scenicGeometry.length - 1; i < scenicGeometry.length; j = i++) {
      const xi = scenicGeometry[i].lon;
      const yi = scenicGeometry[i].lat;
      const xj = scenicGeometry[j].lon;
      const yj = scenicGeometry[j].lat;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  };

  // 检查道路是否在景区内
  const isRoadInScenic = (road, scenicGeometry) => {
    if (!road.geometry || !scenicGeometry) return false;
    return road.geometry.some(point => isPointInScenic(point, scenicGeometry));
  };

  // 轨迹数据处理功能
  const startUserTracking = async () => {
    try {
      setIsTracking(true);
      await userTrackingService.startTracking(scenicId, 'user_' + Date.now());

      // 定期更新状态
      const statusInterval = setInterval(() => {
        const status = userTrackingService.getTrackingStatus();
        setTrackingStatus(status);
      }, 2000);

      // 保存interval ID以便清理
      setTrackingStatus({ ...userTrackingService.getTrackingStatus(), statusInterval });

      Toast.show({
        content: '开始记录轨迹数据',
        position: 'center'
      });
    } catch (error) {
      console.error('启动轨迹记录失败:', error);
      setIsTracking(false);
      Toast.show({
        content: `启动轨迹记录失败: ${error.message}`,
        position: 'center'
      });
    }
  };

  const stopUserTracking = async () => {
    try {
      const trackData = await userTrackingService.stopTracking();
      setIsTracking(false);

      // 清理状态更新interval
      if (trackingStatus?.statusInterval) {
        clearInterval(trackingStatus.statusInterval);
      }
      setTrackingStatus(null);

      if (trackData) {
        Toast.show({
          content: `轨迹记录完成，共${trackData.totalPoints}个点`,
          position: 'center'
        });

        // 询问是否使用轨迹数据重新生成热力线
        if (window.confirm('是否使用刚记录的轨迹数据重新生成热力线？')) {
          setUseTrackData(true);
          setTimeout(() => {
            loadAndRenderScenicData();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('停止轨迹记录失败:', error);
      setIsTracking(false);
      Toast.show({
        content: `停止轨迹记录失败: ${error.message}`,
        position: 'center'
      });
    }
  };

  // 基于轨迹数据生成热力线
  const generateTrackBasedHeatLines = async (enhancedData) => {
    console.log('使用轨迹数据生成热力线...');

    try {
      // 获取本地轨迹数据
      const localTracks = userTrackingService.getLocalTracks();

      // 过滤当前景区的轨迹
      const scenicTracks = localTracks.filter(track => track.scenicId === scenicId);

      console.log('找到轨迹数据:', scenicTracks.length, '条');

      if (scenicTracks.length === 0) {
        console.log('没有轨迹数据，回退到科学算法');
        return generateScientificHeatLines(
          enhancedData.overpass?.roads || [],
          enhancedData.overpass?.facilities || [],
          enhancedData
        );
      }

      // 使用轨迹分析服务生成热力线
      const scenicBounds = {
        bbox: scenic.bbox,
        center: scenic.center
      };

      const trackHeatlines = await trackAnalyticsService.analyzeTracksToHeatlines(
        scenicTracks,
        scenicBounds
      );

      console.log('基于轨迹数据生成热力线完成:', {
        轨迹数: scenicTracks.length,
        热力线数: trackHeatlines.length,
        平均置信度: trackHeatlines.length > 0 ?
          (trackHeatlines.reduce((sum, h) => sum + h.confidence, 0) / trackHeatlines.length).toFixed(2) : 0
      });

      return trackHeatlines;
    } catch (error) {
      console.error('轨迹数据处理失败:', error);
      // 回退到科学算法
      return generateScientificHeatLines(
        enhancedData.overpass?.roads || [],
        enhancedData.overpass?.facilities || [],
        enhancedData
      );
    }
  };

  // 基于科学算法生成热力线
  const generateScientificHeatLines = (roads, facilities, enhancedData) => {
    console.log('使用科学算法计算热力线...');

    // 构建上下文信息
    const context = heatlineAnalyticsService.getRecommendedContext(userType);

    // 添加实时数据到上下文
    if (enhancedData.weather?.current) {
      context.weather = enhancedData.weather.current.condition;
    }

    if (enhancedData.crowd?.current) {
      context.crowdLevel = enhancedData.crowd.current.level;
    }

    console.log('热力计算上下文:', context);

    // 使用科学算法批量计算热力值
    const heatLines = heatlineAnalyticsService.calculateBatchHeat(roads, facilities, context);

    console.log('科学热力线生成完成:', {
      总数: heatLines.length,
      高热力: heatLines.filter(r => r.heat > 0.8).length,
      中热力: heatLines.filter(r => r.heat > 0.5 && r.heat <= 0.8).length,
      低热力: heatLines.filter(r => r.heat <= 0.5).length,
      平均热力: (heatLines.reduce((sum, r) => sum + r.heat, 0) / heatLines.length).toFixed(2)
    });

    return heatLines;
  };

  // 渲染道路和设施（包含热力线）
  const renderRoadsAndFacilities = async (enhancedData) => {
    const overpassData = enhancedData.overpass;
    if (!overpassData) return;

    console.log('开始渲染增强道路和热力线数据');

    // 1. 渲染基础道路
    const roads = overpassData.roads || [];
    const facilities = overpassData.facilities || [];

    console.log('道路数:', roads.length, '设施数:', facilities.length);

    if (roads.length > 0) {
      const roadFeatures = roads.map(road => {
        const coordinates = road.geometry.map(point => {
          const [gcjLng, gcjLat] = wgs84ToGcj02(point.lon, point.lat);
          return [gcjLng, gcjLat];
        });

        return {
          type: 'Feature',
          properties: {
            highway: road.tags.highway,
            wheelchair: road.tags.wheelchair || '未知'
          },
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        };
      });

      const roadData = {
        type: 'FeatureCollection',
        features: roadFeatures
      };

      // 基础道路图层（灰色底层）
      const baseRoadLayer = new LineLayer()
        .source(roadData)
        .shape('line')
        .color('#e8e8e8')
        .size(1)
        .style({ opacity: 0.6 });

      sceneRef.current.addLayer(baseRoadLayer);
      currentLayersRef.current.push(baseRoadLayer);
    }

    // 2. 生成和渲染热力线（优先使用轨迹数据）
    let heatLineData = [];

    if (useTrackData) {
      // 优先使用轨迹数据生成热力线
      console.log('使用轨迹数据生成热力线');
      heatLineData = await generateTrackBasedHeatLines(enhancedData);
    } else if (roads.length > 0) {
      // 回退到科学算法生成热力线
      console.log('使用科学算法生成热力线');
      heatLineData = generateScientificHeatLines(roads, facilities, enhancedData);
    } else {
      // 如果没有道路数据，不生成热力线
      console.log('没有道路数据，无法生成热力线');
      heatLineData = [];
    }

    console.log('生成的热力线数据:', heatLineData.length);

    if (heatLineData.length > 0) {
      // 转换热力线数据为GeoJSON
      const heatFeatures = heatLineData.map((route, index) => {
        const coordinates = route.coordinates.map(coord => {
          const [gcjLng, gcjLat] = wgs84ToGcj02(coord[0], coord[1]);
          return [gcjLng, gcjLat];
        });

        return {
          type: 'Feature',
          properties: {
            name: route.name,
            heat: route.heat,
            accessibility: route.accessibility,
            routeId: index
          },
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        };
      });

      const heatLineGeoData = {
        type: 'FeatureCollection',
        features: heatFeatures
      };

      // 热力线主图层（与动物园样式保持一致）
      const heatLineLayer = new LineLayer()
        .source(heatLineGeoData)
        .size('heat', heat => Math.max(5, heat * 12)) // 更粗的线条，5-12px
        .shape('line')
        .color('heat', [
          '#ff4d4f',  // 低热力 - 红色（不推荐轮椅）
          '#ff7875',
          '#ffa940',  // 中等热力 - 橙色
          '#fadb14',  //
          '#73d13d',  // 高热力 - 绿色（推荐）
          '#52c41a'   // 最高热力 - 深绿色（强烈推荐）
        ])
        .animate({
          interval: 1,        // 间隔
          duration: 2,        // 持续时间
          trailLength: 2      // 流线长度
        })
        .style({
          opacity: 1.0,
          lineTexture: false,
          borderWidth: 1.0,   // 更粗的边框，极强对比
          borderColor: '#ffffff'
        });

      sceneRef.current.addLayer(heatLineLayer);
      currentLayersRef.current.push(heatLineLayer);

      // 无障碍路线特殊高亮（与动物园样式保持一致）
      const accessibleRoutes = heatFeatures.filter(feature =>
        feature.properties.accessibility === 'yes'
      );

      if (accessibleRoutes.length > 0) {
        const accessibleData = {
          type: 'FeatureCollection',
          features: accessibleRoutes
        };

        const accessibleLayer = new LineLayer()
          .source(accessibleData)
          .shape('line')
          .size(6) // 更粗，最突出
          .color('rgb(16, 185, 129)') // 更鲜艳的绿色
          .animate({
            interval: 3,        // 最慢的动画，稳重感
            duration: 4,
            trailLength: 0.5    // 最短的流线，简洁
          })
          .style({
            opacity: 1.0,
            lineTexture: false,
            borderWidth: 2.0,   // 最粗的边框
            borderColor: '#ffffff'
          });

        sceneRef.current.addLayer(accessibleLayer);
        currentLayersRef.current.push(accessibleLayer);
        console.log('无障碍路线特殊高亮添加完成，路线数:', accessibleRoutes.length);
      }

      console.log('热力线图层添加完成');
    }

    // 3. 渲染设施点
    if (facilities.length > 0) {
      const facilityFeatures = facilities.map(facility => {
        const [gcjLng, gcjLat] = wgs84ToGcj02(facility.lon, facility.lat);

        return {
          type: 'Feature',
          properties: {
            name: facility.tags?.name || facility.tags?.amenity || facility.tags?.tourism || facility.tags?.shop || '设施',
            amenity: facility.tags?.amenity,
            wheelchair: facility.tags?.wheelchair || '未知'
          },
          geometry: {
            type: 'Point',
            coordinates: [gcjLng, gcjLat]
          }
        };
      });

      const facilityData = {
        type: 'FeatureCollection',
        features: facilityFeatures
      };

      const facilityLayer = new PointLayer()
        .source(facilityData)
        .shape('circle')
        .size(8)
        .color(feature => {
          const wheelchair = feature.wheelchair;
          if (wheelchair === 'yes') return '#52c41a';
          if (wheelchair === 'limited') return '#faad14';
          if (wheelchair === 'no') return '#ff4d4f';
          return '#1890ff';
        })
        .style({
          opacity: 0.8,
          stroke: '#ffffff',
          strokeWidth: 2
        });

      sceneRef.current.addLayer(facilityLayer);
      currentLayersRef.current.push(facilityLayer);
    }

    console.log('增强道路和设施渲染完成，道路数:', roads.length, '设施数:', facilities.length);
  };

  // 组件挂载时初始化
  useEffect(() => {
    loadScenicData();
  }, [scenicId]);

  // 当景点数据加载完成后初始化地图
  useEffect(() => {
    if (scenic) {
      initL7Map();
    }
  }, [scenic]);

  // 当地图准备好后加载数据
  useEffect(() => {
    if (mapReady && scenic) {
      setTimeout(() => {
        loadAndRenderScenicData();
      }, 1000);
    }
  }, [mapReady, scenic]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* CSS动画样式 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <NavBar onBack={() => navigate(-1)}>
        {scenic ? scenic.name : '景点地图'}
      </NavBar>

      {/* 错误信息 */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fff2f0',
          color: '#ff4d4f',
          borderBottom: '1px solid #ffccc7'
        }}>
          <strong>错误:</strong> {error}
        </div>
      )}

      {/* 地图容器 */}
      <div
        ref={mapRef}
        style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          backgroundColor: '#f0f0f0'
        }}
      />

      {/* 加载状态 */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1890ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }}></div>
          正在加载地图...
        </div>
      )}

      {/* 景点信息面板 */}
      {scenic && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          minWidth: '200px',
          zIndex: 1000
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {scenic.name}
          </div>

          {facilitiesLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              color: '#1890ff',
              marginBottom: '8px',
              padding: '4px 8px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #1890ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}></div>
              正在获取设施数据...
            </div>
          )}

          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            <div>地址: {scenic.location}</div>
            <div>开放时间: {scenic.openTime}</div>
            <div>门票: {scenic.price}</div>
            <div>无障碍等级: {scenic.accessibilityLevel}</div>
            <div>标签: {scenic.tags.join(', ')}</div>
          </div>

          {/* 轨迹记录控制 */}
          <div style={{
            borderTop: '1px solid #f0f0f0',
            paddingTop: '12px',
            marginTop: '12px'
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 'bold',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center'
            }}>
              📍 轨迹记录
            </div>

            {!isTracking ? (
              <Button
                size="small"
                color="primary"
                onClick={startUserTracking}
                style={{ width: '100%', marginBottom: '8px' }}
              >
                开始记录轨迹
              </Button>
            ) : (
              <div>
                <Button
                  size="small"
                  color="danger"
                  onClick={stopUserTracking}
                  style={{ width: '100%', marginBottom: '8px' }}
                >
                  停止记录
                </Button>
                {trackingStatus && (
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    <div>记录点数: {trackingStatus.currentPoints}</div>
                    <div>记录时长: {Math.round(trackingStatus.duration / 1000)}秒</div>
                  </div>
                )}
              </div>
            )}

            <div style={{
              fontSize: '11px',
              color: '#999',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>使用轨迹数据:</span>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={useTrackData}
                  onChange={(e) => {
                    setUseTrackData(e.target.checked);
                    if (mapReady && scenic) {
                      setTimeout(() => {
                        loadAndRenderScenicData();
                      }, 100);
                    }
                  }}
                  style={{ marginRight: '4px' }}
                />
                <span style={{ fontSize: '11px' }}>启用</span>
              </label>
            </div>
          </div>
        </div>
      )}



      {/* 可折叠的轮椅用户专用图例 */}
      {mapReady && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          {/* 图例标题栏（始终显示） */}
          <div
            style={{
              padding: '12px',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: showLegend ? '1px solid #f0f0f0' : 'none'
            }}
            onClick={() => setShowLegend(!showLegend)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '16px',
                height: '3px',
                background: 'linear-gradient(to right, #ff4d4f, #ffa940, #73d13d)',
                marginRight: '8px',
                borderRadius: '1px',
                boxShadow: '0 0 3px rgba(115, 209, 61, 0.3)'
              }}></div>
              <span>♿ 无障碍路线</span>
            </div>
            <span style={{
              fontSize: '12px',
              color: '#999',
              transform: showLegend ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}>
              ▼
            </span>
          </div>

          {/* 图例详细内容（可折叠） */}
          {showLegend && (
            <div style={{ padding: '0 12px 12px 12px' }}>
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
                🔴 不适合轮椅 → 🟡 谨慎通行 → 🟢 轮椅友好
              </div>

              <div style={{ fontSize: '11px', color: '#666' }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#52c41a' }}>●</span> 完全无障碍
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#faad14' }}>●</span> 部分无障碍
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#ff4d4f' }}>●</span> 有障碍物
                </div>
                <div>
                  <span style={{ color: '#1890ff' }}>●</span> 无障碍设施
                </div>
              </div>

              <div style={{
                fontSize: '10px',
                color: '#999',
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '4px' }}>♿</span>
                <span>轮椅用户专用路线推荐</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScenicMapPage;
