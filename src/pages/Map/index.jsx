import React, { useState, useEffect, useRef, useMemo,  } from 'react';
import { NavBar, Button, Popup } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { Scene, PolygonLayer, LineLayer, PointLayer, Marker } from '@antv/l7';
import { GaodeMap, Mapbox } from '@antv/l7-maps';
import { useParams } from 'react-router-dom';


const ScenicMap = () => {
  const { id } = useParams() || {};
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const sceneRef = useRef(null);
  const mapInstanceRef = useRef(null); // 用于原生高德地图
  const currentLayersRef = useRef([]); // 存储当前地图图层
  const [loading, setLoading] = useState(false);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [zooData, setZooData] = useState(null);
  const [error, setError] = useState(null);
  const [mapType, setMapType] = useState('l7-normal'); // 'l7-normal' 或 'amap'
  const [mapReady, setMapReady] = useState(false);
  const [drawerSwitch, setDrawerSwitch] = useState(false);
  const [feedbackPoint, setFeedbackPoint] = useState()

  const {feedbackImgs, accessibilityIconMapping} = useMemo(()=>{
    return {
      feedbackImgs:[
        "/feedback1.png",
        "/feedback2.png",
        "/feedback3.png",
        "/feedback4.png",
        "/feedback5.png",
        "/feedback6.png",
        "/feedback7.png",
      ],
      accessibilityIconMapping: {
        0: "/userfeedback.png",
        1: "/elevator.png",
        2: "/wc.png",
      }
    }
  }, [])

  // 坐标转换函数：WGS84 转 GCJ02 (用于高德地图)
  const wgs84ToGcj02 = (lng, lat) => {
    const a = 6378245.0;
    const ee = 0.00669342162296594323;

    const dlat = transformLat(lng - 105.0, lat - 35.0);
    const dlng = transformLng(lng - 105.0, lat - 35.0);

    const radlat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic);

    const dlat2 = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * Math.PI);
    const dlng2 = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * Math.PI);

    const mglat = lat + dlat2;
    const mglng = lng + dlng2;

    return [mglng, mglat];
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


  // 获取用户反馈点
  const getFeedbackPoints = async() => {
    const response = await fetch('https://easytravel.fat.ctripqa.com/searchPoints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scenicAreaId: Number(id) })
    });

    console.log('response',response);
    const data = await response.json();
    console.log('获取点信息获取成功:', data);
    return data?.points
  }
  // 将用户反馈点打点到地图上
  const addFeedbackMarker = (item, scene, points) => {
    const createCustomIcon = () => {
      const icon = document.createElement('div');
      icon.style.width = '18px';
      icon.style.height = '18px';
      icon.style.backgroundImage =`url(${accessibilityIconMapping[item?.type || 0]})`;
      icon.style.backgroundSize = 'cover';
      icon.style.cursor = 'pointer'; // 确保图标可点击
      return icon;
    }

    const markerElement = createCustomIcon();
    
    const marker = new Marker({
      element: markerElement,
    }).setLnglat([item?.longitude, item?.latitude]);

    scene.addMarker(marker);

    // 监听Marker的点击事件
    markerElement.addEventListener('click', (event) => {
      console.log('markerElement event', event);
      const currentTime = new Date();
      const lngLat = marker.getLnglat();
      console.log('点击时间:', currentTime);
      console.log('经纬度:', lngLat);
      setDrawerSwitch(true)
    });
    const clickHandler = (event) => { 
      const lngLat = marker.getLnglat();
      const filterPoint = points.filter((item, id) => {
        return item?.latitude == lngLat?.lat
      })
      setFeedbackPoint(filterPoint?.length && filterPoint[0] || [])
      setDrawerSwitch(true)
    }
    const isMobile = () => {
      return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    markerElement.addEventListener(isMobile() ? 'touchstart' : 'click', clickHandler);
  }

  // 清除当前地图图层
  const clearMapLayers = () => {
    if (sceneRef.current && currentLayersRef.current.length > 0) {
      console.log('清理图层，当前图层数:', currentLayersRef.current.length);
      currentLayersRef.current.forEach((layer, index) => {
        try {
          if (layer) {
            // 尝试销毁图层
            if (typeof layer.destroy === 'function') {
              layer.destroy();
            }
            // 从场景中移除图层
            if (sceneRef.current.hasLayer && sceneRef.current.hasLayer(layer)) {
              sceneRef.current.removeLayer(layer);
            }
            console.log(`已清理图层 ${index}`);
          }
        } catch (e) {
          console.warn(`清理图层 ${index} 失败:`, e);
        }
      });
    }
    currentLayersRef.current = [];
    console.log('图层清理完成');
  };

  // 初始化AntV L7地图
  const initL7Map = async (type) => {
    if (!mapRef.current) {
      console.error('地图容器不存在');
      return;
    }

    // 清空容器
    if (sceneRef.current) {
      sceneRef.current.destroy();
      sceneRef.current = null;
    }
    mapRef.current.innerHTML = '';
    clearMapLayers();

    try {
      // 使用普通地图样式
      const mapStyle = 'normal';

      // 创建Scene，参考AntV L7标准写法
      const scene = new Scene({
        id: mapRef.current,
        map: new GaodeMap({
          center: [121.359, 31.195],
          zoom: 15,
          style: mapStyle,
          pitchEnable: false,
          rotation: 0,
        }),
      });

      // 等待场景准备就绪
      scene.on('loaded', async() => {
        console.log('AntV L7地图初始化完成:', mapType);
        setMapReady(true);

        // 如果有数据，立即渲染
        if (zooData) {
          renderWithL7(zooData.elements[0]);
        }



      });

      scene.on('click', (e) => {
        const { lnglat } = e || {};
        const longitude = lnglat?.lng;
        const latitude = lnglat?.lat;
        console.log(`Longitude22: ${longitude}, Latitude: ${latitude}`);
        // 您可以在这里处理经纬度数据，例如显示在UI上或发送到服务器
      });
      const points = await getFeedbackPoints()

        if(points?.length){
          points?.forEach(item => {
            addFeedbackMarker(item, scene, points)
          })
        }

      sceneRef.current = scene;

    } catch (err) {
      console.error('L7地图初始化失败:', err);
      setError(`地图初始化失败: ${err.message}`);
    }
  };

  // 初始化高德地图
  const initAmapMap = () => {
    if (!window.AMap || !mapRef.current) {
      console.error('高德地图API未加载或容器不存在');
      return;
    }

    // 清空容器和图层
    if (mapInstanceRef.current && mapInstanceRef.current.destroy) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
    }
    mapRef.current.innerHTML = '';
    clearMapLayers();

    const map = new window.AMap.Map(mapRef.current, {
      zoom: 15,
      center: [121.359, 31.195],
      mapStyle: 'amap://styles/normal'
    });

    // 添加控件
    try {
      map.addControl(new window.AMap.Scale());
      map.addControl(new window.AMap.ToolBar());
    } catch (e) {
      console.warn('添加地图控件失败:', e);
    }

    mapInstanceRef.current = map;
    setMapReady(true);
    console.log('高德地图初始化完成');
  };

  // 内嵌的动物园数据（备选方案）
  const fallbackZooData = {
    "version": 0.6,
    "generator": "Overpass API 0.7.62.5 1bd436f1",
    "osm3s": {
      "timestamp_osm_base": "2025-06-02T04:25:45Z",
      "copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL."
    },
    "elements": [
      {
        "type": "way",
        "id": 462007561,
        "bounds": {
          "minlat": 31.1908985,
          "minlon": 121.3526725,
          "maxlat": 31.1994282,
          "maxlon": 121.3650556
        },
        "geometry": [
          { "lat": 31.1918835, "lon": 121.3605346 },
          { "lat": 31.1919490, "lon": 121.3606754 },
          { "lat": 31.1921679, "lon": 121.3613998 },
          { "lat": 31.1921746, "lon": 121.3615677 },
          { "lat": 31.1922111, "lon": 121.3617445 },
          { "lat": 31.1923294, "lon": 121.3626918 },
          { "lat": 31.1923212, "lon": 121.3627427 },
          { "lat": 31.1923142, "lon": 121.3635609 },
          { "lat": 31.1922569, "lon": 121.3643730 },
          { "lat": 31.1922665, "lon": 121.3650556 },
          { "lat": 31.1931968, "lon": 121.3649571 },
          { "lat": 31.1933613, "lon": 121.3649133 },
          { "lat": 31.1932748, "lon": 121.3645701 },
          { "lat": 31.1937698, "lon": 121.3643274 },
          { "lat": 31.1939378, "lon": 121.3642348 },
          { "lat": 31.1940574, "lon": 121.3640105 },
          { "lat": 31.1940794, "lon": 121.3638818 },
          { "lat": 31.1941193, "lon": 121.3637652 },
          { "lat": 31.1941636, "lon": 121.3636819 },
          { "lat": 31.1946991, "lon": 121.3636149 },
          { "lat": 31.1950671, "lon": 121.3633343 },
          { "lat": 31.1951653, "lon": 121.3626198 },
          { "lat": 31.1955368, "lon": 121.3624205 },
          { "lat": 31.1958956, "lon": 121.3633587 },
          { "lat": 31.1973917, "lon": 121.3623451 },
          { "lat": 31.1971710, "lon": 121.3598609 },
          { "lat": 31.1992834, "lon": 121.3595116 },
          { "lat": 31.1994282, "lon": 121.3575898 },
          { "lat": 31.1993173, "lon": 121.3572133 },
          { "lat": 31.1990971, "lon": 121.3569190 },
          { "lat": 31.1990005, "lon": 121.3552718 },
          { "lat": 31.1988327, "lon": 121.3537994 },
          { "lat": 31.1979135, "lon": 121.3537854 },
          { "lat": 31.1973881, "lon": 121.3539120 },
          { "lat": 31.1971343, "lon": 121.3540257 },
          { "lat": 31.1969710, "lon": 121.3540128 },
          { "lat": 31.1969079, "lon": 121.3538261 },
          { "lat": 31.1968485, "lon": 121.3534934 },
          { "lat": 31.1968184, "lon": 121.3526725 },
          { "lat": 31.1923009, "lon": 121.3531002 },
          { "lat": 31.1927692, "lon": 121.3567257 },
          { "lat": 31.1927103, "lon": 121.3568513 },
          { "lat": 31.1926110, "lon": 121.3569909 },
          { "lat": 31.1923232, "lon": 121.3570895 },
          { "lat": 31.1922489, "lon": 121.3571401 },
          { "lat": 31.1921749, "lon": 121.3572363 },
          { "lat": 31.1922259, "lon": 121.3578411 },
          { "lat": 31.1923097, "lon": 121.3580810 },
          { "lat": 31.1923516, "lon": 121.3582204 },
          { "lat": 31.1923431, "lon": 121.3583221 },
          { "lat": 31.1921702, "lon": 121.3584430 },
          { "lat": 31.1915075, "lon": 121.3585576 },
          { "lat": 31.1912652, "lon": 121.3586185 },
          { "lat": 31.1912031, "lon": 121.3586744 },
          { "lat": 31.1910943, "lon": 121.3587724 },
          { "lat": 31.1908985, "lon": 121.3590834 },
          { "lat": 31.1914014, "lon": 121.3597297 },
          { "lat": 31.1917447, "lon": 121.3602478 },
          { "lat": 31.1918835, "lon": 121.3605346 }
        ],
        "tags": {
          "addr:city": "上海",
          "addr:housenumber": "2381",
          "addr:street": "虹桥路",
          "name": "上海动物园",
          "name:en": "Shanghai Zoo",
          "name:zh": "上海动物园",
          "opening_hours": "06:30-17:30",
          "phone": "+86 21 6268 7775",
          "source": "wikipedia",
          "tourism": "zoo",
          "tourism:level:CN": "AAAA",
          "website": "https://www.shanghaizoo.cn/",
          "wikidata": "Q3182046",
          "wikimedia_commons": "Category:Shanghai Zoo",
          "wikipedia": "en:Shanghai Zoo"
        }
      }
    ]
  };

  // 加载动物园数据
  const loadZooData = async () => {
    setLoading(true);
    setError(null);

    // 清除现有图层
    clearMapLayers();

    try {
      console.log('开始加载zoo.json数据...');

      // 尝试从API加载数据
      const possiblePaths = [
        '/api/mapData/zoo.json',
        'http://localhost:8000/api/mapData/zoo.json'
      ];

      let data = null;
      let apiSuccess = false;

      for (const path of possiblePaths) {
        try {
          console.log(`尝试路径: ${path}`);
          const response = await fetch(path);
          if (response.ok) {
            const responseText = await response.text();
            // 检查是否是有效的JSON
            if (responseText.trim().startsWith('{')) {
              data = JSON.parse(responseText);
              console.log(`成功从API加载数据: ${path}`);
              apiSuccess = true;
              break;
            } else {
              console.log(`路径 ${path} 返回HTML，跳过`);
            }
          }
        } catch (e) {
          console.log(`路径 ${path} 加载失败:`, e.message);
        }
      }

      // 如果API加载失败，使用内嵌数据
      if (!apiSuccess) {
        // console.log('API加载失败，使用内嵌数据');
        data = fallbackZooData;
        // setError('使用离线数据（API暂不可用）');
      }

      console.log('数据加载成功:', data);
      setZooData(data);

      // 如果地图已准备好，渲染数据
      if (mapReady && sceneRef.current) {
        renderZooOnMap(data);
        // 自动获取道路和设施数据
        setTimeout(() => {
          loadRoadsAndFacilities();
        }, 1000);
      }

    } catch (err) {
      // console.error('加载数据失败:', err);
      // // 最后的备选方案：使用内嵌数据
      // console.log('使用内嵌数据作为最后备选');
      // setZooData(fallbackZooData);
      // setError('使用离线数据');
    } finally {
      setLoading(false);
    }
  };





  // 获取道路和无障碍设施
  const loadRoadsAndFacilities = async () => {
    console.log('=== 开始获取道路和无障碍设施数据 ===');
    console.log('当前地图类型:', mapType);
    console.log('sceneRef.current存在:', !!sceneRef.current);
    console.log('zooData存在:', !!zooData);

    setFacilitiesLoading(true);
    try {
      console.log('获取道路和无障碍设施数据...');

      const bbox = '31.1908,121.3526,31.1995,121.3651';

      const query = `[out:json][timeout:30];
(
  // 道路
  way["highway"](${bbox});
  way["highway"]["wheelchair"](${bbox});

  // 无障碍设施
  node["amenity"="toilets"](${bbox});
  node["amenity"="parking"  ](${bbox});
  node["amenity"="bench"](${bbox});
  node["entrance"](${bbox});
  node["highway"="elevator"](${bbox});
  node["tourism"="information"](${bbox});
  node["amenity"="restaurant"](${bbox});
  node["amenity"="cafe"](${bbox});
  node["shop"](${bbox});
  node["amenity"="first_aid"](${bbox});
  node["emergency"="phone"](${bbox});

  // 建筑物
  way["building"](${bbox});
);
out geom;`;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: query
      });

      if (!response.ok) {
        throw new Error(`道路设施查询错误: ${response.status}`);
      }

      const data = await response.json();
      console.log('道路和设施数据获取成功:', data);

      // 渲染道路和设施
      if (mapType.startsWith('l7-')) {
        renderRoadsAndFacilitiesWithL7(data);
      } else {
        renderRoadsAndFacilities(data);
      }

      // 渲染Overpass获取的设施数据
      console.log('渲染Overpass设施数据完成');

    } catch (err) {
      console.error('道路设施查询失败:', err);
      setError(`道路设施查询失败: ${err.message}`);
    } finally {
      setFacilitiesLoading(false);
    }
  };

  // 渲染道路和设施
  const renderRoadsAndFacilities = (data) => {
    if (!mapInstanceRef.current || !data.elements) return;

    data.elements.forEach(element => {
      if (element.type === 'way' && element.tags?.highway) {
        renderRoad(element);
      } else if (element.type === 'node' && (element.tags?.amenity || element.tags?.tourism || element.tags?.shop)) {
        renderFacility(element);
      } else if (element.type === 'way' && element.tags?.building) {
        renderBuilding(element);
      }
    });
  };

  // 渲染道路
  const renderRoad = (road) => {
    if (!road.geometry || road.geometry.length < 2) return;

    const tags = road.tags || {};
    let color = '#666666';
    let weight = 2;

    // 根据无障碍等级设置颜色
    if (tags.wheelchair === 'yes') {
      color = '#52c41a';
      weight = 3;
    } else if (tags.wheelchair === 'limited') {
      color = '#faad14';
      weight = 3;
    } else if (tags.wheelchair === 'no') {
      color = '#ff4d4f';
      weight = 3;
    }

    if (mapType === 'leaflet') {
      const latlngs = road.geometry.map(point => [point.lat, point.lon]);
      const polyline = window.L.polyline(latlngs, {
        color: color,
        weight: weight,
        opacity: 0.8
      }).addTo(mapInstanceRef.current);

      polyline.on('click', function() {
        window.L.popup()
          .setLatLng(polyline.getBounds().getCenter())
          .setContent(`
            <div style="padding: 8px;">
              <h4>道路信息</h4>
              <p><strong>类型:</strong> ${tags.highway}</p>
              <p><strong>无障碍:</strong> ${tags.wheelchair || '未知'}</p>
              <p><strong>路面:</strong> ${tags.surface || '未知'}</p>
            </div>
          `)
          .openOn(mapInstanceRef.current);
      });

      currentLayersRef.current.push(polyline);
    } else if (mapType === 'amap') {
      const path = road.geometry.map(point => {
        const [gcjLng, gcjLat] = wgs84ToGcj02(point.lon, point.lat);
        return [gcjLng, gcjLat];
      });

      const polyline = new window.AMap.Polyline({
        path: path,
        strokeColor: color,
        strokeWeight: weight,
        strokeOpacity: 0.8
      });

      polyline.setMap(mapInstanceRef.current);
      currentLayersRef.current.push(polyline);
    }
  };

  // 渲染设施
  const renderFacility = (facility) => {
    const tags = facility.tags || {};
    const iconMap = {
      toilets: '🚻',
      parking: '🅿️',
      bench: '🪑',
      restaurant: '🍽️',
      cafe: '☕',
      information: 'ℹ️',
      first_aid: '🏥',
      phone: '📞'
    };

    let icon = iconMap[tags.amenity] || iconMap[tags.tourism] || '📍';
    let backgroundColor = '#1890ff';

    if (tags.wheelchair === 'yes') backgroundColor = '#52c41a';
    else if (tags.wheelchair === 'limited') backgroundColor = '#faad14';
    else if (tags.wheelchair === 'no') backgroundColor = '#ff4d4f';

    if (mapType === 'leaflet') {
      const marker = window.L.marker([facility.lat, facility.lon], {
        icon: window.L.divIcon({
          className: 'facility-marker',
          html: `<div style="background-color: ${backgroundColor}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${icon}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(mapInstanceRef.current);

      marker.on('click', function() {
        window.L.popup()
          .setLatLng([facility.lat, facility.lon])
          .setContent(`
            <div style="padding: 8px;">
              <h4>${tags.name || tags.amenity || tags.tourism}</h4>
              <p><strong>类型:</strong> ${tags.amenity || tags.tourism}</p>
              <p><strong>无障碍:</strong> ${tags.wheelchair || '未知'}</p>
            </div>
          `)
          .openOn(mapInstanceRef.current);
      });

      currentLayersRef.current.push(marker);
    } else if (mapType === 'amap') {
      const [gcjLng, gcjLat] = wgs84ToGcj02(facility.lon, facility.lat);

      const marker = new window.AMap.Marker({
        position: [gcjLng, gcjLat],
        content: `<div style="background-color: ${backgroundColor}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${icon}</div>`
      });

      marker.setMap(mapInstanceRef.current);
      currentLayersRef.current.push(marker);
    }
  };

  // 渲染建筑物
  const renderBuilding = (building) => {
    if (!building.geometry || building.geometry.length < 3) return;

    const tags = building.tags || {};
    let fillColor = '#e6f7ff';

    if (tags.wheelchair === 'yes') fillColor = '#f6ffed';
    else if (tags.wheelchair === 'limited') fillColor = '#fffbe6';
    else if (tags.wheelchair === 'no') fillColor = '#fff2f0';

    if (mapType === 'leaflet') {
      const latlngs = building.geometry.map(point => [point.lat, point.lon]);
      const polygon = window.L.polygon(latlngs, {
        color: '#d9d9d9',
        weight: 1,
        fillColor: fillColor,
        fillOpacity: 0.6
      }).addTo(mapInstanceRef.current);

      currentLayersRef.current.push(polygon);
    } else if (mapType === 'amap') {
      const path = building.geometry.map(point => {
        const [gcjLng, gcjLat] = wgs84ToGcj02(point.lon, point.lat);
        return [gcjLng, gcjLat];
      });

      const polygon = new window.AMap.Polygon({
        path: path,
        strokeColor: '#d9d9d9',
        strokeWeight: 1,
        fillColor: fillColor,
        fillOpacity: 0.6
      });

      polygon.setMap(mapInstanceRef.current);
      currentLayersRef.current.push(polygon);
    }
  };

  // 在地图上渲染动物园数据
  const renderZooOnMap = (data) => {
    if (!sceneRef.current || !data.elements || data.elements.length === 0) {
      console.warn('地图未初始化或没有数据');
      return;
    }

    const zooElement = data.elements[0];
    if (!zooElement.geometry) {
      console.warn('没有找到几何数据');
      return;
    }

    console.log('渲染动物园边界，坐标点数量:', zooElement.geometry.length);

    if (mapType.startsWith('l7-')) {
      renderWithL7(zooElement);
    } else if (mapType === 'amap') {
      renderWithAmap(zooElement);
    }
  };

  // 使用AntV L7渲染，参考标准写法
  const renderWithL7 = (zooElement) => {
    if (!sceneRef.current) return;

    // 准备边界数据，转换为GeoJSON格式
    // 如果是高德地图底图，需要转换坐标系
    const coordinates = zooElement.geometry.map(point => {
      if (mapType === 'l7-normal') {
        // 高德地图需要转换为GCJ02坐标系
        const [gcjLng, gcjLat] = wgs84ToGcj02(point.lon, point.lat);
        return [gcjLng, gcjLat];
      } else {
        // 其他地图使用原始WGS84坐标
        return [point.lon, point.lat];
      }
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
        properties: {
          name: zooElement.tags?.name || '上海动物园',
          address: `${zooElement.tags?.['addr:street'] || '虹桥路'} ${zooElement.tags?.['addr:housenumber'] || '2381号'}`,
          phone: zooElement.tags?.phone || '+86 21 6268 7775',
          hours: zooElement.tags?.opening_hours || '06:30-17:30'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        }
      }]
    };

    // 创建多边形填充图层
    const polygonLayer = new PolygonLayer()
      .source(polygonData)
      .shape('fill')
      .color('#1890ff')
      .style({
        opacity: 0.2,
        opacityLinear: {
          enable: true,
          dir: 'out'
        }
      });

    // 创建边界线图层
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

    // 创建中心点标签
    const centerLng = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
    const centerLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;

    const labelData = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {
          name: zooElement.tags?.name || '上海动物园'
        },
        geometry: {
          type: 'Point',
          coordinates: [centerLng, centerLat]
        }
      }]
    };

    const labelLayer = new PointLayer()
      .source(labelData)
      .shape('name', 'text')
      .size(18)
      .color('#ffffff')
      .style({
        textAnchor: 'center',
        textOffset: [0, 0],
        spacing: 2,
        padding: [10, 6],
        stroke: '#1890ff',
        strokeWidth: 2,
        fontFamily: 'PingFang SC, Microsoft YaHei, Arial, sans-serif',
        fontWeight: 'bold'
      });

    // 创建景区外围灰色遮罩
    const maskPolygonData = createZooMask(coordinates);
    const maskLayer = new PolygonLayer()
      .source(maskPolygonData)
      .shape('fill')
      .color('rgba(128, 128, 128, 0.6)') // 灰色遮罩，突出景区
      .style({
        opacity: 1
      });

    // 按照AntV L7标准方式添加图层（遮罩在最底层）
    sceneRef.current.addLayer(maskLayer);      // 灰色遮罩在最底层
    sceneRef.current.addLayer(polygonLayer);   // 景区多边形
    sceneRef.current.addLayer(borderLayer);    // 景区边界
    sceneRef.current.addLayer(labelLayer);     // 景区标签

    // 保存图层引用用于清理
    currentLayersRef.current.push(maskLayer, polygonLayer, borderLayer, labelLayer);

    // 自动调整视野到动物园边界
    const bounds = [
      [Math.min(...coordinates.map(c => c[0])), Math.min(...coordinates.map(c => c[1]))],
      [Math.max(...coordinates.map(c => c[0])), Math.max(...coordinates.map(c => c[1]))]
    ];

    sceneRef.current.fitBounds(bounds, { padding: 40 });

    console.log('AntV L7渲染完成，边界点数:', coordinates.length, '坐标系:', mapType === 'l7-normal' ? 'GCJ02' : 'WGS84');
  };

  // 判断点是否在景区范围内
  const isPointInZoo = (point, zooGeometry) => {
    // 简单的点在多边形内判断（射线法）
    const x = point.lon;
    const y = point.lat;
    let inside = false;

    for (let i = 0, j = zooGeometry.length - 1; i < zooGeometry.length; j = i++) {
      const xi = zooGeometry[i].lon;
      const yi = zooGeometry[i].lat;
      const xj = zooGeometry[j].lon;
      const yj = zooGeometry[j].lat;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  // 判断道路是否在景区范围内
  const isRoadInZoo = (road, zooGeometry) => {
    if (!road.geometry || road.geometry.length === 0) return false;

    // 检查道路的所有点，如果有任何一个点在景区内，就认为这条道路相关
    return road.geometry.some(point => isPointInZoo(point, zooGeometry));
  };

  // 基于真实道路数据生成热力线（只包含景区内的道路）
  const generateHeatLineFromRealRoads = (roads, zooGeometry) => {
    const heatLines = [];

    // 首先过滤出景区范围内的道路
    const roadsInZoo = roads.filter(road => isRoadInZoo(road, zooGeometry));

    // 定义不同道路类型的基础热力值
    const roadTypeHeatMap = {
      'primary': 0.9,        // 主要道路 - 高热力
      'secondary': 0.8,      // 次要道路 - 较高热力
      'tertiary': 0.7,       // 三级道路 - 中等热力
      'residential': 0.6,    // 住宅道路 - 中等热力
      'footway': 0.8,        // 人行道 - 较高热力（游客多）
      'path': 0.7,           // 小径 - 中等热力
      'cycleway': 0.5,       // 自行车道 - 较低热力
      'service': 0.4,        // 服务道路 - 较低热力
      'track': 0.3,          // 小道 - 低热力
      'steps': 0.6,          // 台阶 - 中等热力
      'pedestrian': 0.9      // 步行街 - 高热力
    };

    // 无障碍等级对热力的影响
    const accessibilityHeatBonus = {
      'yes': 0.2,      // 完全无障碍 +20%
      'limited': 0.1,  // 部分无障碍 +10%
      'no': -0.1,      // 不无障碍 -10%
      '未知': 0        // 未知 无影响
    };

    roadsInZoo.forEach((road, index) => {
      const tags = road.tags || {};
      const highway = tags.highway;
      const wheelchair = tags.wheelchair || '未知';

      // 计算基础热力值
      let baseHeat = roadTypeHeatMap[highway] || 0.5;

      // 根据无障碍等级调整热力
      const accessibilityBonus = accessibilityHeatBonus[wheelchair] || 0;
      let finalHeat = baseHeat + accessibilityBonus;

      // 添加一些随机性模拟真实游客流量变化
      finalHeat += (Math.random() - 0.5) * 0.2;

      // 确保热力值在0-1范围内
      finalHeat = Math.max(0.1, Math.min(1.0, finalHeat));

      // 根据道路名称或特殊标签增加热力
      if (tags.name) {
        if (tags.name.includes('主') || tags.name.includes('入口') || tags.name.includes('大道')) {
          finalHeat = Math.min(1.0, finalHeat + 0.2);
        }
        if (tags.name.includes('熊猫') || tags.name.includes('动物') || tags.name.includes('展览')) {
          finalHeat = Math.min(1.0, finalHeat + 0.3);
        }
      }

      // 根据道路长度调整热力（较长的道路可能热力更高）
      const roadLength = road.geometry.length;
      if (roadLength > 10) {
        finalHeat = Math.min(1.0, finalHeat + 0.1);
      }

      heatLines.push({
        id: `road_${index}`,
        name: tags.name || `${highway}道路`,
        coordinates: road.geometry.map(point => [point.lon, point.lat]),
        heat: finalHeat,
        accessibility: wheelchair,
        highway: highway,
        surface: tags.surface || '未知',
        width: tags.width || '未知',
        originalRoad: road
      });
    });

    // 按热力值排序，热力高的在上层渲染
    heatLines.sort((a, b) => a.heat - b.heat);

    console.log('基于真实道路生成热力线:', heatLines.length, '条');
    console.log('热力分布:', {
      高热力: heatLines.filter(r => r.heat > 0.8).length,
      中热力: heatLines.filter(r => r.heat > 0.5 && r.heat <= 0.8).length,
      低热力: heatLines.filter(r => r.heat <= 0.5).length
    });

    return heatLines;
  };

     // 使用AntV L7渲染热力线和设施
   const renderRoadsAndFacilitiesWithL7 = (data) => {
     if (!sceneRef.current || !data.elements || !zooData || !zooData.elements || !zooData.elements[0]) {
       console.warn('缺少必要数据，无法渲染热力线');
       return;
     }

     console.log('开始渲染热力线，道路数据:', data.elements.length);

     // 1. 渲染真实道路数据
     const roads = data.elements.filter(element =>
       element.type === 'way' && element.tags?.highway && element.geometry && element.geometry.length >= 2
     );

     console.log('过滤后的道路数:', roads.length);

     // 转换道路数据为pathData格式，用于热力图
     const pathData = [];
     const userPoints = []; // 模拟用户轨迹点数据

     roads.forEach(road => {
       for (let i = 0; i < road.geometry.length - 1; i++) {
         const start = road.geometry[i];
         const end = road.geometry[i + 1];
         
         // 转换坐标
         const [startLng, startLat] = mapType === 'l7-normal' 
           ? wgs84ToGcj02(start.lon, start.lat)
           : [start.lon, start.lat];
         const [endLng, endLat] = mapType === 'l7-normal'
           ? wgs84ToGcj02(end.lon, end.lat)
           : [end.lon, end.lat];

         pathData.push({
           lng: startLng,
           lat: startLat,
           lng1: endLng,
           lat1: endLat
         });

         // 生成模拟用户轨迹点（基于道路类型）
         const tags = road.tags || {};
         const highway = tags.highway;
         let pointCount = 1;

         if (['footway', 'pedestrian', 'path'].includes(highway)) {
           pointCount = Math.floor(Math.random() * 8) + 3; // 3-10个点
         } else if (['primary', 'secondary'].includes(highway)) {
           pointCount = Math.floor(Math.random() * 5) + 2; // 2-6个点
         } else if (['service', 'residential'].includes(highway)) {
           pointCount = Math.floor(Math.random() * 3) + 1; // 1-3个点
         }

         // 在线段上生成随机用户点
         for (let j = 0; j < pointCount; j++) {
           const t = Math.random(); // 0-1之间的随机值
           const userLng = startLng + t * (endLng - startLng) + (Math.random() - 0.5) * 0.0002;
           const userLat = startLat + t * (endLat - startLat) + (Math.random() - 0.5) * 0.0002;
           
           userPoints.push({
             lng: userLng,
             lat: userLat
           });
         }
       }
     });

     console.log('生成的路径数据:', pathData.length);
     console.log('生成的用户轨迹点:', userPoints.length);

     // 2. 生成轨迹热力图 (替代原有的热力线渲染)
     if (pathData.length > 0 && userPoints.length > 0) {
       const heatmapResult = generateTrajectoryHeatmap(userPoints, pathData, sceneRef.current);
       console.log('热力图生成结果:', heatmapResult);
       
       // 如果热力图生成成功，就不再渲染原有的热力线
       if (heatmapResult && heatmapResult.linesWithPoints.length > 0) {
         console.log('热力图渲染完成，跳过原有热力线渲染');
         return;
       }
     }

    // 渲染基础道路网络
    if (roads.length > 0) {
      const roadFeatures = roads.map(road => {
        const tags = road.tags || {};

        // 转换坐标
        const coordinates = road.geometry.map(point => {
          if (mapType === 'l7-normal') {
            const [gcjLng, gcjLat] = wgs84ToGcj02(point.lon, point.lat);
            return [gcjLng, gcjLat];
          } else {
            return [point.lon, point.lat];
          }
        });

        return {
          type: 'Feature',
          properties: {
            highway: tags.highway,
            wheelchair: tags.wheelchair || '未知',
            surface: tags.surface || '未知',
            roadType: 'base'
          },
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        };
      });

      const baseRoadData = {
        type: 'FeatureCollection',
        features: roadFeatures
      };

      // 基础道路图层（灰色底层）
      const baseRoadLayer = new LineLayer()
        .source(baseRoadData)
        .shape('line')
        .color('#e8e8e8')
        .size(1)
        .style({
          opacity: 0.6
        });

      sceneRef.current.addLayer(baseRoadLayer);
      currentLayersRef.current.push(baseRoadLayer);
    }

    // 2. 基于真实道路数据生成热力线（只包含景区内的道路）
    const zooGeometry = zooData.elements[0].geometry;
    let heatLineData = generateHeatLineFromRealRoads(roads, zooGeometry);

    console.log('生成的热力线数据:', heatLineData.length);

    // 如果没有生成热力线数据，使用模拟数据
    if (heatLineData.length === 0) {
      console.warn('没有生成热力线数据，使用模拟热力线数据');
      heatLineData = [
        {
          name: '主要通道',
          coordinates: [
            [121.359, 31.195],
            [121.360, 31.194],
            [121.361, 31.193]
          ],
          heat: 0.8,
          accessibility: 'yes'
        },
        {
          name: '次要通道',
          coordinates: [
            [121.358, 31.196],
            [121.359, 31.195],
            [121.360, 31.194]
          ],
          heat: 0.6,
          accessibility: 'limited'
        },
        {
          name: '步行道',
          coordinates: [
            [121.357, 31.197],
            [121.358, 31.196],
            [121.359, 31.195]
          ],
          heat: 0.4,
          accessibility: 'no'
        }
      ];
      console.log('使用模拟热力线数据:', heatLineData.length, '条');
    }

    // 转换热力线数据为GeoJSON
    const heatFeatures = heatLineData.map((route, index) => {
      // 转换坐标
      const coordinates = route.coordinates.map(coord => {
        if (mapType === 'l7-normal') {
          const [gcjLng, gcjLat] = wgs84ToGcj02(coord[0], coord[1]);
          return [gcjLng, gcjLat];
        } else {
          return coord;
        }
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

    console.log('转换后的GeoJSON热力线数据:', heatLineGeoData.features.length);

    // 注意：遮罩图层已在景区边界渲染时添加，这里不再重复添加

    // 2. 基础道路层（更突出）
    const baseRoadLayer = new LineLayer()
      .source(heatLineGeoData)
      .shape('line')
      .size(1.5)
      .color('#666')
      .style({
        opacity: 0.4
      });

    // 3. 热力线主图层（极度突出，简化动画）
    const heatLineLayer = new LineLayer()
      .source(heatLineGeoData)
      .size('heat', heat => Math.max(5, heat * 12)) // 更粗的线条，5-12px
      .shape('line')
      .color('heat', [
        '#ff4d4f',  // 低热力 - 红色（不推荐）
        '#ff7875',  //
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
        opacity: 1.0,       // 完全不透明，最突出
        lineTexture: false,
        borderWidth: 1.0,   // 更粗的边框，极强对比
        borderColor: '#ffffff'
      });

    console.log('创建热力线图层，准备添加到场景');

    // 4. 无障碍路线特殊高亮（最突出）
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
          opacity: 0.95,     // 最高透明度
          borderWidth: 0.8,  // 最粗的边框
          borderColor: '#fff'
        });

      sceneRef.current.addLayer(accessibleLayer);
      currentLayersRef.current.push(accessibleLayer);
    }

    // 按顺序添加图层（从底到顶）
    console.log('添加基础道路图层...');
    sceneRef.current.addLayer(baseRoadLayer);   // 基础道路

    console.log('添加热力线图层...');
    sceneRef.current.addLayer(heatLineLayer);   // 热力线在顶层

    currentLayersRef.current.push(baseRoadLayer, heatLineLayer);

    console.log('所有图层添加完成，当前图层数:', currentLayersRef.current.length);

    // 渲染设施点
    const facilities = data.elements.filter(element =>
      element.type === 'node' && (element.tags?.amenity || element.tags?.tourism || element.tags?.shop)
    );

    if (facilities.length > 0) {
      const facilityData = {
        type: 'FeatureCollection',
        features: facilities.map(facility => {
          const tags = facility.tags || {};

          // 转换坐标
          const coordinates = mapType === 'l7-normal'
            ? wgs84ToGcj02(facility.lon, facility.lat)
            : [facility.lon, facility.lat];

          return {
            type: 'Feature',
            properties: {
              name: tags.name || tags.amenity || tags.tourism || tags.shop,
              amenity: tags.amenity,
              tourism: tags.tourism,
              shop: tags.shop,
              wheelchair: tags.wheelchair || '未知',
              icon: getFacilityIcon(tags)
            },
            geometry: {
              type: 'Point',
              coordinates: coordinates
            }
          };
        })
      };

      const facilityLayer = new PointLayer()
        .source(facilityData)
        .shape('circle')
        .size(8)
        .color(facility => {
          const wheelchair = facility.wheelchair;
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

      console.log('AntV L7渲染设施完成，道路数:', roads.length, '设施数:', facilities.length);
    }
  };

  // 创建景区外围遮罩
  const createZooMask = (zooCoordinates) => {
    // 创建大范围遮罩（覆盖整个地图，中间挖空景区）
    const mapBounds = [
      [121.3, 31.15],   // 左下角
      [121.4, 31.15],   // 右下角
      [121.4, 31.25],   // 右上角
      [121.3, 31.25],   // 左上角
      [121.3, 31.15]    // 闭合
    ];

    // 转换地图边界坐标
    const mapBoundsConverted = mapBounds.map(coord => {
      if (mapType === 'l7-normal') {
        const [gcjLng, gcjLat] = wgs84ToGcj02(coord[0], coord[1]);
        return [gcjLng, gcjLat];
      } else {
        return coord;
      }
    });

    // 确保景区多边形闭合
    const zooPolygonClosed = [...zooCoordinates];
    if (zooPolygonClosed[0][0] !== zooPolygonClosed[zooPolygonClosed.length - 1][0] ||
        zooPolygonClosed[0][1] !== zooPolygonClosed[zooPolygonClosed.length - 1][1]) {
      zooPolygonClosed.push(zooPolygonClosed[0]);
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
            mapBoundsConverted,      // 外环：地图边界
            zooPolygonClosed.reverse() // 内环：景区边界（逆时针，形成洞）
          ]
        }
      }]
    };
  };

  // 获取设施图标
  const getFacilityIcon = (tags) => {
    const iconMap = {
      toilets: '🚻',
      parking: '🅿️',
      bench: '🪑',
      restaurant: '🍽️',
      cafe: '☕',
      information: 'ℹ️',
      first_aid: '🏥',
      phone: '📞'
    };
    return iconMap[tags.amenity] || iconMap[tags.tourism] || '📍';
  };



  // 使用Leaflet渲染（WGS84坐标系，与OpenStreetMap匹配）
  const renderWithLeaflet = (zooElement) => {
    // Leaflet使用WGS84坐标系，与overpass数据直接匹配
    const latlngs = zooElement.geometry.map(point => [point.lat, point.lon]);

    const polygon = window.L.polygon(latlngs, {
      color: '#FF6B6B',
      weight: 3,
      opacity: 0.8,
      fillColor: '#FF6B6B',
      fillOpacity: 0.2,
      dashArray: '5, 5'
    }).addTo(mapInstanceRef.current);

    // 将图层添加到跟踪数组
    currentLayersRef.current.push(polygon);

    // 添加点击事件
    polygon.on('click', function() {
      const popup = window.L.popup()
        .setLatLng(polygon.getBounds().getCenter())
        .setContent(`
          <div style="padding: 8px;">
            <h4>${zooElement.tags?.name || '上海动物园'}</h4>
            <p><strong>地址:</strong> ${zooElement.tags?.['addr:street'] || '虹桥路'} ${zooElement.tags?.['addr:housenumber'] || '2381号'}</p>
            <p><strong>开放时间:</strong> ${zooElement.tags?.opening_hours || '06:30-17:30'}</p>
            <p><strong>电话:</strong> ${zooElement.tags?.phone || '+86 21 6268 7775'}</p>
            <p><strong>坐标系:</strong> WGS84 (与OSM匹配)</p>
          </div>
        `)
        .openOn(mapInstanceRef.current);
    });

    // 添加标签
    const center = polygon.getBounds().getCenter();
    const marker = window.L.marker(center, {
      icon: window.L.divIcon({
        className: 'zoo-label',
        html: `<div style="background-color: #FF6B6B; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">${zooElement.tags?.name || '上海动物园'}</div>`,
        iconSize: [100, 20],
        iconAnchor: [50, 10]
      })
    }).addTo(mapInstanceRef.current);

    // 将标签也添加到跟踪数组
    currentLayersRef.current.push(marker);

    // 自动调整视野
    mapInstanceRef.current.fitBounds(polygon.getBounds(), { padding: [20, 20] });

    console.log('Leaflet渲染完成，边界点数:', latlngs.length, '(WGS84坐标系)');
  };

  // 使用高德地图渲染（转换为GCJ02坐标系）
  const renderWithAmap = (zooElement) => {
    // 将WGS84坐标转换为GCJ02坐标（高德地图坐标系）
    const path = zooElement.geometry.map(point => {
      const [gcjLng, gcjLat] = wgs84ToGcj02(point.lon, point.lat);
      return [gcjLng, gcjLat];
    });

    const polygon = new window.AMap.Polygon({
      path: path,
      strokeColor: '#1890ff',
      strokeWeight: 4,
      strokeOpacity: 0.9,
      fillColor: '#1890ff',
      fillOpacity: 0.15,
      strokeStyle: 'solid',
      zIndex: 10
    });

    polygon.setMap(mapInstanceRef.current);

    // 将图层添加到跟踪数组
    currentLayersRef.current.push(polygon);

    // 添加点击事件
    polygon.on('click', function() {
      const infoWindow = new window.AMap.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h4>${zooElement.tags?.name || '上海动物园'}</h4>
            <p><strong>地址:</strong> ${zooElement.tags?.['addr:street'] || '虹桥路'} ${zooElement.tags?.['addr:housenumber'] || '2381号'}</p>
            <p><strong>开放时间:</strong> ${zooElement.tags?.opening_hours || '06:30-17:30'}</p>
            <p><strong>电话:</strong> ${zooElement.tags?.phone || '+86 21 6268 7775'}</p>
            <p><strong>坐标系:</strong> GCJ02 (高德坐标系)</p>
          </div>
        `
      });
      infoWindow.open(mapInstanceRef.current, polygon.getBounds().getCenter());
    });

    // 添加标签
    const center = polygon.getBounds().getCenter();
    const marker = new window.AMap.Marker({
      position: center,
      content: `<div style="background-color: #FF6B6B; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap;">${zooElement.tags?.name || '上海动物园'}</div>`,
      offset: new window.AMap.Pixel(-50, -10)
    });
    marker.setMap(mapInstanceRef.current);

    // 将标签也添加到跟踪数组
    currentLayersRef.current.push(marker);

    // 自动调整视野
    mapInstanceRef.current.setFitView([polygon], false, [20, 20, 20, 20]);

    console.log('高德地图渲染完成，边界点数:', path.length, '(已转换为GCJ02坐标系)');
  };

  // 切换地图类型
  const switchMapType = async (type) => {
    if (type === mapType) return;

    setMapType(type);
    setMapReady(false);
    setLoading(true);

    try {
      if (type.startsWith('l7-')) {
        await initL7Map(type);
      } else if (type === 'amap') {
        await initAmapMap();
      }

      // 如果有数据，重新渲染
      if (zooData) {
        setTimeout(() => renderZooOnMap(zooData), 500);
      }

    } catch (err) {
      console.error('切换地图失败:', err);
      setError(`切换到${type}地图失败: ${err.message}`);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  // 组件挂载时初始化
  useEffect(() => {
    const initMap = async () => {
      try {
        await initL7Map(mapType);
        loadZooData();
      } catch (err) {
        console.error('初始化失败:', err);
        setError(`初始化失败: ${err.message}`);
      }
    };
    initMap()

  }, []);

  // 当地图准备好且有数据时，渲染数据
  useEffect(() => {
    if (mapReady && zooData && sceneRef.current) {
      renderZooOnMap(zooData);
      // 自动获取道路和设施数据
      setTimeout(() => {
        loadRoadsAndFacilities();
      }, 1000);
    }
  }, [mapReady, zooData]);

  // 计算点到线段的最短距离
  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const A = lineStart[0] - lineEnd[0];
    const B = lineStart[1] - lineEnd[1];
    const C = lineEnd[0] - point[0];
    const D = lineEnd[1] - point[1];
    
    const dot = A * C + B * D;
    const lenSq = A * A + B * B;
    
    if (lenSq === 0) {
      // 线段退化为点
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
    
    const dx = point[0] - xx;
    const dy = point[1] - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 将用户轨迹点聚类到地图轨迹线
  const clusterPointsToLines = (userPoints, pathData) => {
    const lineSegments = pathData.map((path, index) => ({
      id: index,
      start: [path.lng, path.lat],
      end: [path.lng1, path.lat1],
      points: [],
      heatValue: 0
    }));

    // 为每个用户点找到最近的线段
    userPoints.forEach(point => {
      let minDistance = Infinity;
      let closestLineIndex = -1;
      
      lineSegments.forEach((line, index) => {
        const distance = pointToLineDistance([point.lng, point.lat], line.start, line.end);
        if (distance < minDistance) {
          minDistance = distance;
          closestLineIndex = index;
        }
      });
      
      // 只有距离在合理范围内的点才会被归类（避免噪音）
      if (minDistance < 0.0005 && closestLineIndex !== -1) { // 约50米
        lineSegments[closestLineIndex].points.push(point);
        lineSegments[closestLineIndex].heatValue++;
      }
    });

    return lineSegments;
  };

  // 根据热力值生成颜色
  const getHeatColor = (heatValue, maxHeat) => {
    if (maxHeat === 0) return '#52c41a'; // 绿色
    
    const intensity = Math.min(heatValue / maxHeat, 1);
    
    if (intensity <= 0.2) {
      // 绿色到浅绿
      return `rgba(82, 196, 26, ${0.7 + intensity * 0.3})`;
    } else if (intensity <= 0.4) {
      // 浅绿到黄绿
      return `rgba(135, 208, 104, ${0.8 + intensity * 0.2})`;
    } else if (intensity <= 0.6) {
      // 黄绿到黄色
      return `rgba(250, 173, 20, ${0.8 + intensity * 0.2})`;
    } else if (intensity <= 0.8) {
      // 黄色到橙色
      return `rgba(255, 120, 117, ${0.8 + intensity * 0.2})`;
    } else {
      // 橙色到红色
      return `rgba(255, 77, 79, ${0.9 + intensity * 0.1})`;
    }
  };

  // 渲染热力轨迹线
  const renderHeatTrajectoryLines = (scene, clusteredLines) => {
    // 计算最大热力值用于归一化
    const maxHeat = Math.max(...clusteredLines.map(line => line.heatValue));
    console.log('最大热力值:', maxHeat);
    
    // 过滤掉没有用户点的线段，并按热力值分组
    const heatLines = clusteredLines
      .filter(line => line.heatValue > 0)
      .map(line => ({
        ...line,
        normalizedHeat: line.heatValue / maxHeat,
        color: getHeatColor(line.heatValue, maxHeat)
      }));

    console.log('热力线数据:', heatLines);

    // 按热力值排序，低热力的先渲染（在底层）
    heatLines.sort((a, b) => a.heatValue - b.heatValue);

    // 创建不同热力等级的图层
    const heatLevels = [
      { min: 0, max: 0.2, color: '#52c41a', size: 3, name: '低热力' },
      { min: 0.2, max: 0.4, color: '#87d068', size: 4, name: '中低热力' },
      { min: 0.4, max: 0.6, color: '#faad14', size: 5, name: '中等热力' },
      { min: 0.6, max: 0.8, color: '#ff7875', size: 6, name: '中高热力' },
      { min: 0.8, max: 1.0, color: '#ff4d4f', size: 8, name: '高热力' }
    ];

    heatLevels.forEach((level, levelIndex) => {
      const levelLines = heatLines.filter(line => 
        line.normalizedHeat >= level.min && line.normalizedHeat < level.max
      );

      if (levelLines.length > 0) {
        const lineData = {
          type: 'FeatureCollection',
          features: levelLines.map((line, index) => ({
            type: 'Feature',
            properties: {
              heatValue: line.heatValue,
              normalizedHeat: line.normalizedHeat,
              pointCount: line.points.length,
              level: level.name
            },
            geometry: {
              type: 'LineString',
              coordinates: [line.start, line.end]
            }
          }))
        };

        const heatLayer = new LineLayer({ name: `heatTrajectory_${levelIndex}` })
          .source(lineData)
          .shape('line')
          .size(level.size)
          .color(level.color)
          .animate({
            interval: 1,
            duration: 2,
            trailLength: 2
          })
          .style({
            opacity: 0.8,
            lineTexture: false,
            borderWidth: 1,
            borderColor: '#ffffff'
          });

        scene.addLayer(heatLayer);
        currentLayersRef.current.push(heatLayer);

        console.log(`${level.name}线段数量:`, levelLines.length);
      }
    });

    // 添加点击事件显示热力信息
    scene.on('click', (ev) => {
      const features = scene.queryRenderedFeatures(ev.pixel, {
        layers: heatLevels.map((_, i) => `heatTrajectory_${i}`)
      });
      
      if (features.length > 0) {
        const feature = features[0];
        const props = feature.properties;
        console.log('点击的热力线信息:', {
          热力值: props.heatValue,
          归一化热力: (props.normalizedHeat * 100).toFixed(1) + '%',
          用户点数量: props.pointCount,
          热力等级: props.level
        });
      }
    });
  };

  // 生成轨迹热力图的主函数
  const generateTrajectoryHeatmap = (userPoints, pathData, scene) => {
    console.log('开始生成轨迹热力图');
    console.log('用户轨迹点数量:', userPoints.length);
    console.log('地图轨迹线数量:', pathData.length);

    // 1. 将用户点聚类到地图轨迹线
    const clusteredLines = clusterPointsToLines(userPoints, pathData);
    
    // 统计聚类结果
    const linesWithPoints = clusteredLines.filter(line => line.heatValue > 0);
    const totalClustered = linesWithPoints.reduce((sum, line) => sum + line.heatValue, 0);
    
    console.log('聚类结果统计:', {
      有用户点的线段: linesWithPoints.length,
      总线段数: clusteredLines.length,
      聚类成功的用户点: totalClustered,
      聚类成功率: ((totalClustered / userPoints.length) * 100).toFixed(1) + '%'
    });

    // 2. 渲染热力轨迹线
    if (linesWithPoints.length > 0) {
      renderHeatTrajectoryLines(scene, clusteredLines);
    } else {
      console.warn('没有找到可以聚类的轨迹线');
    }

    return {
      clusteredLines,
      linesWithPoints,
      totalClustered
    };
  };

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
        上海动物园地图
      </NavBar>

      {/* 控制面板 */}
      {/* <div style={{ padding: '12px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            size="small"
            color={mapType === 'l7-normal' ? 'primary' : 'default'}
            onClick={() => switchMapType('l7-normal')}
          >
            L7地图
          </Button>
          <Button
            size="small"
            color={mapType === 'amap' ? 'primary' : 'default'}
            onClick={() => switchMapType('amap')}
          >
            原生高德
          </Button>

        </div>
      </div> */}

      {/* 错误信息 */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fff2f0',
          color: '#ff4d4f',
          borderBottom: '1px solid #ffccc7'
        }}>
          <strong>错误:</strong> {error}
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#999' }}>
            请检查网络连接或稍后重试
          </div>
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
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '8px' }}>
            {mapType === 'leaflet' ? '正在加载开源地图...' : '正在加载高德地图...'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            请稍候
          </div>
        </div>
      )}

      {/* 数据信息面板 */}
      {zooData && mapReady && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '12px',
          // background: 'white',
          // padding: '12px',
          // borderRadius: '8px',
          // boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          // zIndex: 1000,
          // maxWidth: '250px'
        }}>
          {/* <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {zooData.elements?.[0]?.tags?.name || '上海动物园'}
          </div> */}

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
              正在获取热力线和设施...
            </div>
          )}

          {/* <div style={{ fontSize: '12px', color: '#666' }}>
            <div>地址: {zooData.elements?.[0]?.tags?.['addr:street'] || '虹桥路'} {zooData.elements?.[0]?.tags?.['addr:housenumber'] || '2381号'}</div>
            <div>开放时间: {zooData.elements?.[0]?.tags?.opening_hours || '06:30-17:30'}</div>
            <div>电话: {zooData.elements?.[0]?.tags?.phone || '+86 21 6268 7775'}</div>
            <div>边界点数: {zooData.elements?.[0]?.geometry?.length || 0}</div>
            <div>当前地图: {
              mapType === 'l7-normal' ? 'L7地图' :
              mapType === 'amap' ? '原生高德' : '未知'
            }</div>
          </div> */}
        </div>
      )}

             {/* 轨迹热力图图例 */}
       <div className="trajectory-heatmap-legend">
         <div className="heatmap-legend-title">轨迹热力图</div>
         
         <div className="heat-gradient-bar"></div>
         
         <div className="heat-labels">
           <span>低热力</span>
           <span>中等</span>
           <span>高热力</span>
         </div>
         
         <div className="heat-stats">
           <div className="stat-item">
             <span>🟢 低热力线段</span>
             <span className="stat-value">1-2人</span>
           </div>
           <div className="stat-item">
             <span>🟡 中等热力线段</span>
             <span className="stat-value">3-5人</span>
           </div>
           <div className="stat-item">
             <span>🔴 高热力线段</span>
             <span className="stat-value">6+人</span>
           </div>
         </div>
       </div>

       {/* 原有图例 */}
       <div style={{
         position: 'absolute',
         bottom: '20px',
         left: '12px',
         background: 'white',
         padding: '12px',
         borderRadius: '8px',
         boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
         zIndex: 1000,
         maxWidth: '200px',
         display: 'none' // 暂时隐藏原有图例
       }}>
         <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>图例</div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '16px',
            height: '3px',
            backgroundColor: '#1890ff',
            marginRight: '8px',
            borderRadius: '2px'
          }}></div>
          <span>动物园边界</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '16px',
            height: '3px',
            background: 'linear-gradient(to right, #ff4d4f, #ffa940, #73d13d)',
            marginRight: '8px',
            borderRadius: '1px',
            boxShadow: '0 0 3px rgba(115, 209, 61, 0.3)'
          }}></div>
          <span>热力线路</span>
        </div>

        <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px', marginLeft: '24px' }}>
          🔴 难走 → 🟡 一般 → 🟢 好走
        </div>

        {/* <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#52c41a',
            marginRight: '8px',
            borderRadius: '50%',
            border: '2px solid #ffffff'
          }}></div>
          <span>完全无障碍</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#faad14',
            marginRight: '8px',
            borderRadius: '50%',
            border: '2px solid #ffffff'
          }}></div>
          <span>部分无障碍</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#ff4d4f',
            marginRight: '8px',
            borderRadius: '50%',
            border: '2px solid #ffffff'
          }}></div>
          <span>不可无障碍</span>
        </div> */}

        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '16px',
            height: '2px',
            backgroundColor: '#52c41a',
            marginRight: '8px',
            borderRadius: '1px',
            borderStyle: 'dashed'
          }}></div>
          <span>无障碍路线</span>
        </div>

        {/* <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '16px',
            height: '2px',
            backgroundColor: '#e8e8e8',
            marginRight: '8px',
            borderRadius: '1px'
          }}></div>
          <span>基础道路</span>
        </div> */}

        {/* <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#1890ff',
            marginRight: '8px',
            borderRadius: '50%',
            fontSize: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>🚻</div>
          <span>设施标记</span>
        </div> */}
      </div>

      {/* 无数据提示 */}
      {!zooData && !loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          <div style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>
            欢迎使用动物园地图
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            点击"重新加载"按钮获取动物园数据
          </div>
          <Button
            color="primary"
            onClick={loadZooData}
            size="small"
          >
            加载数据
          </Button>
        </div>
      )}
      <Popup
        title="用户反馈详情"
        onMaskClick={() => setDrawerSwitch(false)}
        visible={drawerSwitch}
        bodyStyle={{
          height: '45vh',
          overflowY: 'auto',
          padding: '20px 16px 16px 16px',
          // transition: 'all 0.3s ease-in-out',
          borderRadius: '16px 16px 0 0',
          background: '#f9f9f9'
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 'bold', fontSize: 16, color: '#1677ff', marginBottom: 8 }}>
            AI 总结
          </div>
          <div style={{ fontSize: 14, color: '#333', whiteSpace: 'pre-line', marginBottom: 8 }}>
            {feedbackPoint?.aiDescription
              ? feedbackPoint.aiDescription.split('\n').map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))
              : '暂无AI总结'}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#333' }}>用户真实反馈</div>
          {feedbackPoint?.comments && feedbackPoint.comments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {feedbackPoint.comments.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fff',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 14,
                    color: '#444',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/personas/svg?seed=user${idx + 1}`}
                    alt="avatar"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      marginRight: 6,
                      background: '#f0f0f0',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontWeight: 500, color: '#1677ff', marginRight: 8 }}>
                    用户{idx + 1}
                  </span>
                  <span style={{ flex: 1 }}>{item}</span>
                  <img
                    src={feedbackImgs[Math.floor(Math.random() * feedbackImgs.length)]}
                    alt="无障碍景点"
                    style={{
                      width: 80,
                      height: 54,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #eee',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#aaa', fontSize: 13 }}>暂无评论</div>
          )}
        </div>
      </Popup>
      {/* <Popup
        title="用户反馈列表"
        onMaskClick={()=>{setDrawerSwitch(false)}}
        visible={drawerSwitch}
        bodyStyle={{
          height: '40vh',
          overflowY: 'auto', // 添加滚动条
          padding: '16px', // 调整内边距
          transition: 'all 0.3s ease-in-out', // 添加动画效果
        }}
      >
        <div>
          <div>AI 总结评论</div>
          <div>{feedbackPoint?.aiDescription}</div>
        </div>
        <div>
          <div>用户真实反馈</div>
           {feedbackPoint?.comments?.map(item=>{
             return(
              <div>{item}</div>
             )
           })}
        </div>
      </Popup> */}

    </div>
  );
};

export default ScenicMap;
