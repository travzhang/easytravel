/**
 * 高德地图工具函数
 * 
 * 使用说明：
 * 1. 需要在index.html中引入高德地图JS API
 * 2. 需要申请高德地图开发者Key
 * 
 * 示例：
 * <script type="text/javascript" src="https://webapi.amap.com/maps?v=2.0&key=您申请的key值"></script>
 */

// 高德地图Key（需要替换为实际申请的Key）
export const AMAP_KEY = '575c39e9399bb4d468773983fb489d2a';

/**
 * 初始化地图
 * @param {string} containerId 地图容器ID
 * @param {object} options 地图配置选项
 * @returns {Promise} 返回地图实例的Promise
 */
export const initMap = (containerId, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!window.AMap) {
      reject(new Error('高德地图API未加载'));
      return;
    }

    const defaultOptions = {
      zoom: 15,
      center: [116.397428, 39.90923], // 默认中心点（北京天安门）
      viewMode: '3D',
      pitch: 0
    };

    const map = new window.AMap.Map(containerId, { ...defaultOptions, ...options });
    
    map.on('complete', () => {
      resolve(map);
    });

    map.on('error', (error) => {
      reject(error);
    });
  });
};

/**
 * 添加标记点
 * @param {object} map 地图实例
 * @param {array} position 位置坐标 [lng, lat]
 * @param {object} options 标记点配置选项
 * @returns {object} 标记点实例
 */
export const addMarker = (map, position, options = {}) => {
  const marker = new window.AMap.Marker({
    position,
    ...options
  });
  
  map.add(marker);
  return marker;
};

/**
 * 添加多个标记点
 * @param {object} map 地图实例
 * @param {array} positions 位置坐标数组 [[lng1, lat1], [lng2, lat2], ...]
 * @param {object} options 标记点配置选项
 * @returns {array} 标记点实例数组
 */
export const addMarkers = (map, positions, options = {}) => {
  const markers = positions.map(position => {
    return new window.AMap.Marker({
      position,
      ...options
    });
  });
  
  map.add(markers);
  return markers;
};

/**
 * 绘制路线
 * @param {object} map 地图实例
 * @param {array} path 路径坐标数组 [[lng1, lat1], [lng2, lat2], ...]
 * @param {object} options 路线配置选项
 * @returns {object} 折线实例
 */
export const drawPath = (map, path, options = {}) => {
  const defaultOptions = {
    strokeColor: '#1890FF',
    strokeWeight: 6,
    strokeOpacity: 0.8
  };
  
  const polyline = new window.AMap.Polyline({
    path,
    ...defaultOptions,
    ...options
  });
  
  map.add(polyline);
  return polyline;
};

/**
 * 规划步行路线
 * @param {object} map 地图实例
 * @param {array} start 起点坐标 [lng, lat]
 * @param {array} end 终点坐标 [lng, lat]
 * @param {function} callback 回调函数，参数为路线规划结果
 */
export const planWalkingRoute = (map, start, end, callback) => {
  if (!window.AMap) {
    console.error('高德地图API未加载');
    return;
  }
  
  // 加载步行导航插件
  window.AMap.plugin('AMap.Walking', () => {
    const walking = new window.AMap.Walking({
      map,
      panel: false
    });
    
    walking.search(start, end, (status, result) => {
      if (status === 'complete') {
        if (callback) callback(result);
      } else {
        console.error('步行路线规划失败', result);
      }
    });
  });
};

/**
 * 定位当前位置
 * @param {object} map 地图实例
 * @param {function} callback 回调函数，参数为定位结果
 */
export const getCurrentLocation = (map, callback) => {
  if (!window.AMap) {
    console.error('高德地图API未加载');
    return;
  }
  
  // 加载定位插件
  window.AMap.plugin('AMap.Geolocation', () => {
    const geolocation = new window.AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      buttonPosition: 'RB',
      buttonOffset: new window.AMap.Pixel(10, 20),
      zoomToAccuracy: true
    });
    
    map.addControl(geolocation);
    
    geolocation.getCurrentPosition((status, result) => {
      if (status === 'complete') {
        if (callback) callback(result);
      } else {
        console.error('定位失败', result);
      }
    });
  });
};

/**
 * 创建信息窗体
 * @param {object} map 地图实例
 * @param {array} position 位置坐标 [lng, lat]
 * @param {string} content 信息窗体内容
 * @param {object} options 信息窗体配置选项
 * @returns {object} 信息窗体实例
 */
export const createInfoWindow = (map, position, content, options = {}) => {
  const infoWindow = new window.AMap.InfoWindow({
    content,
    position,
    offset: new window.AMap.Pixel(0, -30),
    ...options
  });
  
  infoWindow.open(map, position);
  return infoWindow;
};

/**
 * 添加无障碍设施图标
 * @param {object} map 地图实例
 * @param {array} facilities 无障碍设施数据
 * @returns {array} 标记点实例数组
 */
export const addAccessibilityFacilities = (map, facilities) => {
  // 无障碍设施图标
  const icons = {
    wheelchair: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
    toilet: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
    elevator: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
    ramp: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png'
  };
  
  const markers = facilities.map(facility => {
    const icon = icons[facility.type] || icons.wheelchair;
    
    return new window.AMap.Marker({
      position: facility.position,
      title: facility.name,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(24, 24),
        image: icon,
        imageSize: new window.AMap.Size(24, 24)
      }),
      offset: new window.AMap.Pixel(-12, -12)
    });
  });
  
  map.add(markers);
  return markers;
};

/**
 * 在React组件中使用高德地图的示例
 * 
 * import React, { useEffect, useRef } from 'react';
 * import { initMap, addMarker, drawPath } from '../utils/mapUtils';
 * 
 * const MapComponent = () => {
 *   const mapContainerRef = useRef(null);
 *   const mapInstanceRef = useRef(null);
 * 
 *   useEffect(() => {
 *     // 初始化地图
 *     initMap('map-container', {
 *       zoom: 14,
 *       center: [116.397428, 39.90923]
 *     }).then(mapInstance => {
 *       mapInstanceRef.current = mapInstance;
 *       
 *       // 添加标记点
 *       addMarker(mapInstance, [116.397428, 39.90923], {
 *         title: '起点'
 *       });
 *       
 *       // 绘制路线
 *       const path = [
 *         [116.397428, 39.90923],
 *         [116.398428, 39.91023],
 *         [116.399428, 39.91123]
 *       ];
 *       drawPath(mapInstance, path);
 *     }).catch(error => {
 *       console.error('地图初始化失败', error);
 *     });
 *     
 *     // 组件卸载时销毁地图
 *     return () => {
 *       if (mapInstanceRef.current) {
 *         mapInstanceRef.current.destroy();
 *       }
 *     };
 *   }, []);
 *   
 *   return (
 *     <div id="map-container" ref={mapContainerRef} style={{ width: '100%', height: '400px' }}></div>
 *   );
 * };
 * 
 * export default MapComponent;
 */
