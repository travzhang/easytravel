import React, { useState, useEffect, useMemo } from 'react';
import { NavBar, Button, Popup } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { Scene, PolygonLayer, LineLayer, PointLayer, Marker } from '@antv/l7';
import { GaodeMap, Mapbox } from '@antv/l7-maps';
import { useParams } from 'react-router-dom';
import {wgs84ToGcj02} from "../../heplers/transform.ts";
import OverpassInterpreterService from "../../services/overpassInterpreterService";
import getGeomByWayIdService from "../../services/getGeomByWayIdService";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';

const scenicList = [
  { value:'494725605', label: '上海迪士尼',zoom: 14.5 },
  { value:'462007561', label: '上海动物园', zoom: 16 },
  { value: '39961770', label: '复兴公园', zoom: 16 },
  { value: '45220427', label: '中山公园', zoom: 15 },
  { value: '39176862', label: '共青森林公园',zoom: 14 },
  { value: '178411796', label: '黄浦公园',zoom: 17 },
  { value: '47005216', label: '上海植物园',zoom: 14.5 },
  { value: '40036584', label: '豫园',zoom: 17.5 },
  { value: '666304555', label: '大宁郁金香公园', zoom: 14.5 },
]

function MapPage() {
  const params = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  
  // 反馈系统状态
  const [drawerSwitch, setDrawerSwitch] = useState(false);
  const [feedbackPoint, setFeedbackPoint] = useState();
  const [showLegend, setShowLegend] = useState(false);

  const {accessibilityIconMapping} = useMemo(()=>{
    return {
      accessibilityIconMapping: {
        0: "/userfeedback.png",
        1: "/elevator.png", 
        2: "/wc.png",
        3: "/parking.png",
        4: "/ramp.png", 
        5: "/rest.png"
      }
    }
  }, [])

  // 将用户反馈点打点到地图上
  const addFeedbackMarker = (item, scene, points) => {
    console.log('开始创建反馈点标记:', item);
    
    const createCustomIcon = () => {
      const icon = document.createElement('div');
      icon.style.width = '24px';  // 增大尺寸，更容易看到
      icon.style.height = '24px';
      icon.style.cursor = 'pointer';
      icon.style.border = '2px solid #fff';  // 添加白色边框
      icon.style.borderRadius = '50%';  // 圆形
      icon.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';  // 添加阴影
      icon.style.backgroundColor = '#1890ff';  // 蓝色背景作为默认
      icon.style.display = 'flex';
      icon.style.alignItems = 'center';
      icon.style.justifyContent = 'center';
      icon.style.fontSize = '14px';
      icon.style.color = 'white';
      
      // 设置图标内容，优先使用emoji，然后尝试背景图片
      const typeMapping = {
        0: '💬',  // 用户反馈
        1: '🛗',  // 电梯
        2: '🚻',  // 厕所
        3: '🅿️',  // 停车位
        4: '♿',  // 坡道
        5: '🪑'   // 休息区
      };
      
      icon.innerHTML = typeMapping[item?.type || 0] || '📍';
      
      // 尝试设置背景图片（如果有的话）
      const bgImage = accessibilityIconMapping[item?.type || 0];
      if (bgImage) {
        const img = new Image();
        img.onload = () => {
          icon.style.backgroundImage = `url(${bgImage})`;
          icon.style.backgroundSize = 'cover';
          icon.style.backgroundPosition = 'center';
          icon.style.backgroundRepeat = 'no-repeat';
          icon.innerHTML = ''; // 清空emoji，显示背景图片
        };
        img.onerror = () => {
          console.warn('图标加载失败，使用emoji:', bgImage);
          // 保持emoji显示
        };
        img.src = bgImage;
      }
      
      console.log('创建的图标元素:', icon);
      console.log('图标类型:', item?.type, '对应emoji:', typeMapping[item?.type || 0]);
      
      return icon;
    }

    const markerElement = createCustomIcon();
    
    console.log('创建标记在坐标:', [item?.longitude, item?.latitude]);
    
    const marker = new Marker({
      element: markerElement,
    }).setLnglat([item?.longitude, item?.latitude]);

    scene.addMarker(marker);
    console.log('标记已添加到地图');

         const clickHandler = () => { 
      console.log('反馈点被点击');
      const lngLat = marker.getLnglat();
      const filterPoint = points.filter((point) => {
        return point?.latitude == lngLat?.lat
      })
      console.log('找到对应的反馈点:', filterPoint);
      setFeedbackPoint(filterPoint?.length && filterPoint[0] || {})
      setDrawerSwitch(true)
    }
    
    const isMobile = () => {
      return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    markerElement.addEventListener(isMobile() ? 'touchstart' : 'click', clickHandler);
    console.log('反馈点标记创建完成');
  }

  // 生成mock反馈点数据
  const generateMockFeedbackPoints = (pathData) => {
    if (!pathData || pathData.length === 0) {
      console.warn('没有道路数据，无法生成mock反馈点');
      return [];
    }

    console.log('开始生成mock反馈点，可用道路数据:', pathData.length);

    // 设施类型配置
    const facilityTypes = [
      {
        type: 1,
        name: '无障碍电梯',
        emoji: '🛗',
        aiDescription: '无障碍电梯设施评估\n\n该设施基本满足无障碍通行需求，电梯按钮高度适中，内部空间较为宽敞。',
        comments: ['电梯按钮高度合适', '空间宽敞，轮椅可正常使用', '运行平稳']
      },
      {
        type: 2,
        name: '无障碍厕所',
        emoji: '🚻',
        aiDescription: '无障碍厕所设施评估\n\n厕所内设有无障碍隔间，扶手安装到位，但门宽略显不足。',
        comments: ['有无障碍隔间', '扶手位置合理', '门宽稍显不足']
      },
      {
        type: 3,
        name: '无障碍停车位',
        emoji: '🅿️',
        aiDescription: '无障碍停车位评估\n\n停车位标识清晰，位置便利，但数量有限。',
        comments: ['位置便利', '标识清晰', '数量较少']
      },
      {
        type: 4,
        name: '无障碍坡道',
        emoji: '♿',
        aiDescription: '无障碍坡道设施评估\n\n坡道坡度符合标准，两侧设有扶手，路面防滑处理良好。',
        comments: ['坡度合适', '有扶手', '路面防滑']
      },
      {
        type: 5,
        name: '无障碍休息区',
        emoji: '🪑',
        aiDescription: '无障碍休息区评估\n\n休息区有轮椅专用空间，座椅高度适中，遮阳设施完善。',
        comments: ['有轮椅空间', '座椅高度合适', '遮阳良好']
      }
    ];

    // 反馈类型配置
    const feedbackTypes = [
      {
        type: 0,
        name: '台阶障碍',
        emoji: '💬',
        aiDescription: '台阶通行障碍反馈\n\n存在台阶未设无障碍通道，轮椅使用者无法正常通行，建议增设坡道。',
        comments: ['台阶过高，轮椅无法通过', '缺少无障碍通道', '建议增设坡道']
      },
      {
        type: 0,
        name: '路面不平',
        emoji: '💬',
        aiDescription: '路面通行障碍反馈\n\n路面存在凹凸不平，影响轮椅和行动不便人士通行。',
        comments: ['路面有坑洼', '轮椅通行困难', '需要路面修整']
      },
      {
        type: 0,
        name: '标识不清',
        emoji: '💬',
        aiDescription: '无障碍标识问题反馈\n\n无障碍标识模糊或缺失，导致难以找到无障碍设施。',
        comments: ['标识不清楚', '难以找到设施', '建议更新标识']
      },
      {
        type: 0,
        name: '通道被占',
        emoji: '💬',
        aiDescription: '无障碍通道占用反馈\n\n无障碍通道被临时占用，影响正常通行。',
        comments: ['通道被占用', '无法正常通行', '需要管理']
      },
      {
        type: 0,
        name: '扶手缺失',
        emoji: '💬',
        aiDescription: '扶手设施缺失反馈\n\n关键位置缺少扶手，行动不便人士通行存在安全隐患。',
        comments: ['缺少扶手', '通行不安全', '建议安装扶手']
      }
    ];

    const mockPoints = [];
    
    // 生成5个设施点
    for (let i = 0; i < 5; i++) {
      const randomPath = pathData[Math.floor(Math.random() * pathData.length)];
      const facility = facilityTypes[i];
      
      // 在线段上随机选择一个点
      const t = Math.random(); // 0-1之间的随机值
      const lng = randomPath.lng + (randomPath.lng1 - randomPath.lng) * t;
      const lat = randomPath.lat + (randomPath.lat1 - randomPath.lat) * t;
      
      mockPoints.push({
        pointId: i + 1,
        type: facility.type,
        latitude: lat,
        longitude: lng,
        aiDescription: facility.aiDescription,
        comments: facility.comments,
        commentList: facility.comments.map(comment => ({
          description: comment,
          imageUrl: ""
        })),
        name: facility.name,
        emoji: facility.emoji
      });
    }
    
    // 生成5个反馈点
    for (let i = 0; i < 5; i++) {
      const randomPath = pathData[Math.floor(Math.random() * pathData.length)];
      const feedback = feedbackTypes[i];
      
      // 在线段上随机选择一个点
      const t = Math.random();
      const lng = randomPath.lng + (randomPath.lng1 - randomPath.lng) * t;
      const lat = randomPath.lat + (randomPath.lat1 - randomPath.lat) * t;
      
      mockPoints.push({
        pointId: i + 6,
        type: feedback.type,
        latitude: lat,
        longitude: lng,
        aiDescription: feedback.aiDescription,
        comments: feedback.comments,
        commentList: feedback.comments.map(comment => ({
          description: comment,
          imageUrl: ""
        })),
        name: feedback.name,
        emoji: feedback.emoji
      });
    }
    
    console.log('生成了', mockPoints.length, '个mock反馈点');
    return mockPoints;
  };

  useEffect(() => {
    setLoading(true);
    if (document.getElementById('map')) {
      document.getElementById('map').innerHTML = '';
    }
    getGeomByWayIdService(params.id).then(r=>{
      const bounds = r.data.elements[0].bounds;
      const geometry = r.data.elements[0].geometry;
      const center = r.data.elements[1].center;
      const [
        centerLon,
        centerLat
      ] = wgs84ToGcj02(center.lon, center.lat);
      OverpassInterpreterService(bounds,params.id).then(res=>{
        setLoading(false)
        const data = res.data
        const scene = new Scene({
          id: 'map',
          map: new GaodeMap({
            center: [centerLon,centerLat],
            zoom: scenicList.find(item => item.value === params.id)?.zoom || 16,
            pitchEnable: false,
            rotation: 0,
          }),
        });

        // 处理路径数据
        const pathData = [];
        // 用户轨迹点数据
        const userPoints = [];
        // 多边形GeoJSON
        const polygonCoords = geometry.map((point) => wgs84ToGcj02(point.lon, point.lat));
        const polygonGeoJSON = polygon([polygonCoords]);

        data.elements.forEach((element) => {
          if (element.type === 'way' && element.geometry) {
            // 判断无障碍友好类型
            const tags = element.tags || {};
            let userPointCount = 1;
            const highwayType = tags.highway || '';
            if ([
              'pedestrian',
              'living_street',
              'footway'
            ].includes(highwayType)) {
              userPointCount = 6;
            } else if ([
              'secondary',
              'service',
              'tunnel',
              'bridge'
            ].includes(highwayType)) {
              userPointCount = Math.random() < 0.5 ? 0 : 1; // 50%概率生成1个，否则0个
            } else {
              userPointCount = 2;
            }
            for (let i = 0; i < element.geometry.length - 1; i++) {
              // 转换坐标
              const [lng, lat] = wgs84ToGcj02(element.geometry[i].lon, element.geometry[i].lat);
              const [lng1, lat1] = wgs84ToGcj02(element.geometry[i + 1].lon, element.geometry[i + 1].lat);
              // 判断起点是否在多边形内
              if (
                booleanPointInPolygon(point([lng, lat]), polygonGeoJSON) &&
                booleanPointInPolygon(point([lng1, lat1]), polygonGeoJSON)
              ) {
                pathData.push({
                  lng,
                  lat,
                  lng1,
                  lat1
                });
                // 在每个路径点附近生成若干随机用户点
                for (let j = 0; j < userPointCount; j++) {
                  const offsetLng = (Math.random() - 0.5) * 0.0003; // 经度偏移
                  const offsetLat = (Math.random() - 0.5) * 0.0003; // 纬度偏移
                  userPoints.push({
                    lng: lng + offsetLng,
                    lat: lat + offsetLat
                  });
                }
              }
            }
          }
        });
        console.log(`生成的用户轨迹点: `,userPoints);

        scene.on('loaded', async () => {

          // 加载用户反馈点
          console.log('开始加载用户反馈点...');
          // 屏蔽API调用，直接使用mock数据
          // let points = await getFeedbackPoints();
          // console.log('反馈点API返回结果:', points);
          
          // 直接使用mock数据
          console.log('使用mock反馈点数据...');
          const points = generateMockFeedbackPoints(pathData);
          
          if(points?.length){
            console.log(`找到 ${points.length} 个反馈点，开始添加到地图`);
            points?.forEach((item, index) => {
              console.log(`添加反馈点 ${index + 1}:`, item);
              if (item?.longitude && item?.latitude) {
                addFeedbackMarker(item, scene, points);
                console.log(`反馈点 ${index + 1} 添加成功`);
              } else {
                console.warn(`反馈点 ${index + 1} 缺少坐标信息:`, item);
              }
            })
            console.log('所有反馈点添加完成');
          } else {
            console.log('没有找到反馈点数据');
          }

          // 原本的蓝色底线 - 暂时隐藏
          // const layer = new LineLayer({})
          //   .source(pathData, {
          //     parser: {
          //       type: 'json',
          //       x: 'lng',
          //       y: 'lat',
          //       x1: 'lng1',
          //       y1: 'lat1'
          //     }
          //   })
          //   .size(3)
          //   .shape('line')
          //   .color('#1677ff')
          //   .style({
          //     opacity: 0.8,
          //     lineType: 'solid',
          //   });
          // scene.addLayer(layer);



          // DBSCAN聚类算法实现
          function dbscan(points, eps, minPts) {
            const clusters = [];
            const visited = new Set();
            const clustered = new Set();
            
            function distance(p1, p2) {
              const dx = p1.lng - p2.lng;
              const dy = p1.lat - p2.lat;
              return Math.sqrt(dx * dx + dy * dy);
            }
            
            function regionQuery(point, points, eps) {
              const neighbors = [];
              for (let i = 0; i < points.length; i++) {
                if (distance(point, points[i]) <= eps) {
                  neighbors.push(i);
                }
              }
              return neighbors;
            }
            
            for (let i = 0; i < points.length; i++) {
              if (visited.has(i)) continue;
              
              visited.add(i);
              const neighbors = regionQuery(points[i], points, eps);
              
              if (neighbors.length < minPts) {
                continue; // 标记为噪音
              }
              
              // 创建新聚类
              const cluster = [];
              clusters.push(cluster);
              
              // 扩展聚类
              const seeds = [...neighbors];
              clustered.add(i);
              cluster.push(points[i]);
              
              for (let j = 0; j < seeds.length; j++) {
                const currentPoint = seeds[j];
                
                if (!visited.has(currentPoint)) {
                  visited.add(currentPoint);
                  const currentNeighbors = regionQuery(points[currentPoint], points, eps);
                  
                  if (currentNeighbors.length >= minPts) {
                    seeds.push(...currentNeighbors);
                  }
                }
                
                if (!clustered.has(currentPoint)) {
                  clustered.add(currentPoint);
                  cluster.push(points[currentPoint]);
                }
              }
            }
            
            return clusters;
          }

          // 将用户轨迹点聚类到路径线段
          function clusterPointsToLines(userPoints, pathData) {
            const lineSegments = pathData.map((path, index) => ({
              id: index,
              start: [path.lng, path.lat],
              end: [path.lng1, path.lat1],
              points: [],
              heatValue: 0
            }));

            // 计算点到线段的距离
            function pointToLineDistance(point, lineStart, lineEnd) {
              const A = lineStart[0] - lineEnd[0];
              const B = lineStart[1] - lineEnd[1];
              const C = lineEnd[0] - point.lng;
              const D = lineEnd[1] - point.lat;
              
              const dot = A * C + B * D;
              const lenSq = A * A + B * B;
              
              if (lenSq === 0) {
                return Math.sqrt(C * C + D * D);
              }
              
              let param = dot / lenSq;
              let xx, yy;
              
              if (param < 0) {
                xx = lineStart[0];
                yy = lineStart[1];
              } else if (param > 1) {
                xx = lineEnd[0];
                yy = lineEnd[1];
              } else {
                xx = lineStart[0] + param * A;
                yy = lineStart[1] + param * B;
              }
              
              const dx = point.lng - xx;
              const dy = point.lat - yy;
              return Math.sqrt(dx * dx + dy * dy);
            }

            // 为每个用户点找到最近的线段
            userPoints.forEach(point => {
              let minDistance = Infinity;
              let closestLineIndex = -1;
              
              lineSegments.forEach((line, index) => {
                const distance = pointToLineDistance(point, line.start, line.end);
                if (distance < minDistance) {
                  minDistance = distance;
                  closestLineIndex = index;
                }
              });
              
              // 距离阈值：约20米
              if (minDistance < 0.0002 && closestLineIndex !== -1) {
                lineSegments[closestLineIndex].points.push(point);
                lineSegments[closestLineIndex].heatValue++;
              }
            });

            return lineSegments;
          }

          // 使用DBSCAN对用户轨迹点进行聚类
          console.log('开始DBSCAN聚类分析...');
          const eps = 0.0001; // 约10米的聚类半径
          const minPts = 3; // 最少3个点形成一个聚类
          const clusters = dbscan(userPoints, eps, minPts);
          
          console.log(`DBSCAN聚类结果: ${clusters.length}个聚类`);
          clusters.forEach((cluster, index) => {
            console.log(`聚类${index + 1}: ${cluster.length}个点`);
          });

          // 将聚类结果映射到路径线段
          const clusteredLines = clusterPointsToLines(userPoints, pathData);
          const linesWithHeat = clusteredLines.filter(line => line.heatValue > 0);
          
          console.log(`有热力值的线段: ${linesWithHeat.length}条`);
          
          // 计算最大热力值用于归一化
          const maxHeat = Math.max(...linesWithHeat.map(line => line.heatValue));
          console.log(`最大热力值: ${maxHeat}`);



          // 先渲染景区边界和遮罩 - 借鉴zoo-map样式
          if (geometry && Array.isArray(geometry)) {
            console.log('开始渲染景区边界和遮罩...');
            
            // 转换边界坐标
            const coordinates = geometry.map(point => wgs84ToGcj02(point.lon, point.lat));
            
            // 确保多边形闭合
            if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
                coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
              coordinates.push(coordinates[0]);
            }

            // 创建景区外围遮罩函数
            const createScenicMask = (scenicCoordinates) => {
              // 根据边界计算扩展范围
              const lngs = scenicCoordinates.map(coord => coord[0]);
              const lats = scenicCoordinates.map(coord => coord[1]);
              const minLng = Math.min(...lngs);
              const maxLng = Math.max(...lngs);
              const minLat = Math.min(...lats);
              const maxLat = Math.max(...lats);
              const padding = 0.02; // 扩大遮罩范围

              const mapBounds = [
                [minLng - padding, minLat - padding],   // 左下角
                [maxLng + padding, minLat - padding],   // 右下角
                [maxLng + padding, maxLat + padding],   // 右上角
                [minLng - padding, maxLat + padding],   // 左上角
                [minLng - padding, minLat - padding]    // 闭合
              ];

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
                      mapBounds,                         // 外环：地图边界
                      scenicPolygonClosed.reverse()      // 内环：景区边界（逆时针，形成洞）
                    ]
                  }
                }]
              };
            };

            const polygonData = {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                properties: { name: '景区' },
                geometry: {
                  type: 'Polygon',
                  coordinates: [coordinates]
                }
              }]
            };

            // 1. 景区外围灰色遮罩（最底层）
            const maskPolygonData = createScenicMask(coordinates);
            const maskLayer = new PolygonLayer()
              .source(maskPolygonData)
              .shape('fill')
              .color('rgba(128, 128, 128, 0.6)') // 灰色遮罩，暗化外围
              .style({
                opacity: 1
              });

            // 2. 景区多边形填充
            const polygonLayer = new PolygonLayer()
              .source(polygonData)
              .shape('fill')
              .color('#1890ff')
              .style({
                opacity: 0.1,
                opacityLinear: {
                  enable: true,
                  dir: 'out'
                }
              });

            // 3. 景区边界线
            const borderLayer = new LineLayer()
              .source(polygonData)
              .shape('line')
              .color('#1890ff')
              .size(3)
              .style({
                opacity: 0.8,
                lineType: 'dash',
                dashArray: [8, 4]
              });

            // 按顺序添加图层（遮罩在最底层）
            scene.addLayer(maskLayer);      // 灰色遮罩在最底层
            scene.addLayer(polygonLayer);   // 景区多边形
            scene.addLayer(borderLayer);    // 景区边界

            console.log('景区边界和遮罩渲染完成');
          }

          // 绘制热力轨迹线 - 参考ZooMapPage的正确API实现
          if (linesWithHeat.length > 0) {
            // 转换热力线数据为GeoJSON格式（参考ZooMapPage）
            const heatFeatures = linesWithHeat.map((line, index) => ({
              type: 'Feature',
              properties: {
                name: `热力线段${index + 1}`,
                heat: line.heatValue / maxHeat, // 归一化热力值
                heatValue: line.heatValue,
                pointCount: line.points.length
              },
              geometry: {
                type: 'LineString',
                coordinates: [line.start, line.end]
              }
            }));

            const heatLineGeoData = {
              type: 'FeatureCollection',
              features: heatFeatures
            };

            console.log('转换后的GeoJSON热力线数据:', heatLineGeoData.features.length);

            // 1. 基础道路层（参考ZooMapPage）
            const baseRoadLayer = new LineLayer()
              .source(heatLineGeoData)
              .shape('line')
              .size(1.5)
              .color('#666')
              .style({
                opacity: 0.4
              });

            // 2. 热力线主图层（参考ZooMapPage的API，但用不同颜色）
            const heatLineLayer = new LineLayer()
              .source(heatLineGeoData)
              .size('heat', heat => Math.max(7, heat * 5)) // 线宽3-10px，参考ZooMapPage
              .shape('line')
              .color('heat', [
                '#00d084',  // 低热力 - 绿色
                '#13c2c2',  // 中低热力 - 青色
                '#faad14',  // 中等热力 - 黄色
                '#ff7a45',  // 中高热力 - 橙色
                '#f5222d'   // 高热力 - 红色
              ])
              .animate({
                interval: 2,        // 间隔
                duration: 3,        // 持续时间
                trailLength: 1.5    // 流线长度
              })
              .style({
                opacity: 1,       // 透明度
                lineTexture: false,
                borderWidth: 0.5,   // 边框宽度
                borderColor: '#ffffff'
              });

            console.log('创建热力线图层，准备添加到场景');

            // 按顺序添加图层（参考ZooMapPage）
            console.log('添加基础道路图层...');
            scene.addLayer(baseRoadLayer);   // 基础道路

            console.log('添加热力线图层...');
            scene.addLayer(heatLineLayer);   // 热力线在顶层

                         console.log(`热力轨迹渲染完成: ${linesWithHeat.length}条线段`);
          }

          // 聚类中心点 - 暂时隐藏
          const showClusterCenters = false; // 设为true可显示聚类中心点
          if (clusters.length > 0 && showClusterCenters) {
            const clusterCenters = clusters.map((cluster, index) => {
              const centerLng = cluster.reduce((sum, point) => sum + point.lng, 0) / cluster.length;
              const centerLat = cluster.reduce((sum, point) => sum + point.lat, 0) / cluster.length;
              
              return {
                lng: centerLng,
                lat: centerLat,
                clusterSize: cluster.length,
                clusterId: index
              };
            });

            const clusterLayer = new PointLayer({ name: 'clusterCenters' })
              .source(clusterCenters, {
                parser: {
                  type: 'json',
                  x: 'lng',
                  y: 'lat'
                }
              })
              .shape('circle')
              .size('clusterSize', size => Math.min(size * 2 + 6, 20))
              .color('#1890ff')
              .style({
                opacity: 0.7,
                stroke: '#fff',
                strokeWidth: 2
              });

            scene.addLayer(clusterLayer);
          }

          // 原有的用户轨迹点图层（可选显示，用于对比）
          const showOriginalPoints = false; // 设为true可显示原始点
          if (showOriginalPoints) {
            const pointLayer = new PointLayer({ name: 'userPoints' })
              .source(userPoints, {
                parser: {
                  type: 'json',
                  x: 'lng',
                  y: 'lat'
                }
              })
              .shape('circle')
              .size(3)
              .color('#ff4d4f')
              .style({
                opacity: 0.3,
                stroke: '#fff',
                strokeWidth: 1
              });
            scene.addLayer(pointLayer);
          }

        });
      })

    })

  }, [params.wayid]);

  return (
    <div>
      <NavBar onBack={() => navigate(-1)}>
        {loading ? '加载中...' : scenicList.find(item => item.value === params.id)?.label || '无障碍地图'}
      </NavBar>
      <div style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position:'relative'
      }} id="map" />
      
      {/* 反馈详情弹窗 */}
      <Popup
        visible={drawerSwitch}
        onMaskClick={() => setDrawerSwitch(false)}
        onClose={() => setDrawerSwitch(false)}
        position='bottom'
        bodyStyle={{ height: '70vh', borderRadius: '20px 20px 0 0' }}
      >
        <div style={{ 
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              fontSize: '24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {feedbackPoint?.emoji || '📍'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {feedbackPoint?.name || '反馈详情'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                {feedbackPoint?.type === 0 ? '用户反馈问题' : '无障碍设施'}
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '0 20px 20px', maxHeight: 'calc(70vh - 120px)', overflowY: 'auto' }}>
          {feedbackPoint?.aiDescription && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#1890ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  🤖
                </div>
                <h4 style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  AI 智能分析
                </h4>
              </div>
              <div style={{ 
                backgroundColor: '#f8f9ff', 
                padding: '16px', 
                borderRadius: '12px',
                border: '1px solid #e6f0ff',
                whiteSpace: 'pre-line',
                lineHeight: '1.6',
                color: '#333',
                fontSize: '14px'
              }}>
                {feedbackPoint.aiDescription}
              </div>
            </div>
          )}
          
          {feedbackPoint?.comments && feedbackPoint.comments.length > 0 && (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#52c41a',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  💬
                </div>
                <h4 style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: '600' }}>
                  用户真实反馈 ({feedbackPoint.comments.length})
                </h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {feedbackPoint.comments.map((comment, index) => {
                  // 生成mock用户数据
                  const userNames = ['小王', '李用户', '张三', '王小明', '刘女士', '陈先生', '周同学', '赵阿姨'];
                  const avatarSeeds = ['happy', 'sad', 'smile', 'cat', 'dog', 'bear', 'fish', 'bird'];
                  const userName = userNames[index % userNames.length];
                  const avatarSeed = avatarSeeds[index % avatarSeeds.length];
                  const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                  
                  return (
                    <div key={index} style={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #f0f0f0',
                      padding: '16px', 
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px' 
                      }}>
                        <img
                          src={avatarUrl}
                          alt={userName}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#f5f5f5',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <span style={{ 
                              fontWeight: '600', 
                              color: '#1890ff',
                              fontSize: '14px'
                            }}>
                              {userName}
                            </span>
                            <span style={{ 
                              fontSize: '12px', 
                              color: '#999',
                              backgroundColor: '#f5f5f5',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {Math.floor(Math.random() * 30) + 1}天前
                            </span>
                          </div>
                          <p style={{ 
                            margin: 0, 
                            color: '#333',
                            fontSize: '14px',
                            lineHeight: '1.5'
                          }}>
                            {comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Popup>

      {/* 图例 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <Button
          color='primary'
          size='small'
          onClick={() => setShowLegend(!showLegend)}
          style={{
            marginBottom: showLegend ? '10px' : '0',
            borderRadius: '20px',
            padding: '8px 16px'
          }}
        >
          {showLegend ? '隐藏图例' : '显示图例'}
        </Button>
        
        {showLegend && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            minWidth: '200px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#333' }}>
              反馈点图例
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>💬</span>
                <span style={{ fontSize: '12px', color: '#666' }}>用户反馈</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🛗</span>
                <span style={{ fontSize: '12px', color: '#666' }}>无障碍电梯</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🚻</span>
                <span style={{ fontSize: '12px', color: '#666' }}>无障碍厕所</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🅿️</span>
                <span style={{ fontSize: '12px', color: '#666' }}>无障碍停车位</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>♿</span>
                <span style={{ fontSize: '12px', color: '#666' }}>无障碍坡道</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🪑</span>
                <span style={{ fontSize: '12px', color: '#666' }}>无障碍休息区</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapPage
