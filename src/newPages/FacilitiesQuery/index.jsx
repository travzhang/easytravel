import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const FacilitiesQuery = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 模拟设施数据
  const mockFacilities = [
    {
      id: 1,
      name: '午门无障碍厕所',
      type: 'toilet',
      location: '午门东侧',
      distance: '50m',
      status: 'available',
      waitTime: 0,
      features: ['轮椅可进入', '扶手', '紧急呼叫按钮'],
      lastUpdate: '2分钟前',
      rating: 4.8,
    },
    {
      id: 2,
      name: '太和殿电梯',
      type: 'elevator',
      location: '太和殿西侧',
      distance: '200m',
      status: 'occupied',
      waitTime: 5,
      features: ['语音播报', '盲文按钮', '轮椅空间'],
      lastUpdate: '1分钟前',
      rating: 4.6,
    },
    {
      id: 3,
      name: '御花园充电站',
      type: 'charging',
      location: '御花园入口',
      distance: '500m',
      status: 'available',
      waitTime: 0,
      features: ['电动轮椅充电', '手机充电', '休息座椅'],
      lastUpdate: '5分钟前',
      rating: 4.9,
    },
    {
      id: 4,
      name: '神武门无障碍厕所',
      type: 'toilet',
      location: '神武门西侧',
      distance: '800m',
      status: 'maintenance',
      waitTime: -1,
      features: ['轮椅可进入', '扶手', '紧急呼叫按钮'],
      lastUpdate: '30分钟前',
      rating: 4.5,
    },
    {
      id: 5,
      name: '文华殿轮椅租赁',
      type: 'wheelchair',
      location: '文华殿入口',
      distance: '300m',
      status: 'available',
      waitTime: 0,
      features: ['手动轮椅', '电动轮椅', '儿童轮椅'],
      availableCount: 5,
      lastUpdate: '10分钟前',
      rating: 4.7,
    },
  ];

  // 设施类型配置
  const facilityTypes = [
    { key: 'all', name: '全部', icon: '🏛️' },
    { key: 'wheelchair', name: '轮椅', icon: '♿' },
    { key: 'toilet', name: '厕所', icon: '🚻' },
    { key: 'elevator', name: '电梯', icon: '🛗' },
    { key: 'charging', name: '充电', icon: '🔌' },
  ];

  useEffect(() => {
    setFacilities(mockFacilities);
  }, []);

  // 获取设施类型配置
  const getFacilityConfig = (type) => {
    const configs = {
      toilet: {
        icon: '🚻',
        color: 'bg-blue-100 text-blue-600',
        name: '无障碍厕所',
      },
      wheelchair: {
        icon: '♿',
        color: 'bg-purple-100 text-purple-600',
        name: '轮椅租赁',
      },
      elevator: {
        icon: '🛗',
        color: 'bg-green-100 text-green-600',
        name: '电梯',
      },
      charging: {
        icon: '🔌',
        color: 'bg-orange-100 text-orange-600',
        name: '充电站',
      },
    };
    return (
      configs[type] || {
        icon: '📍',
        color: 'bg-gray-100 text-gray-600',
        name: '其他',
      }
    );
  };

  // 获取状态配置
  const getStatusConfig = (status) => {
    const configs = {
      available: {
        text: '可用',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircleIcon className="w-4 h-4" />,
      },
      occupied: {
        text: '使用中',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <ClockIcon className="w-4 h-4" />,
      },
      maintenance: {
        text: '维护中',
        color: 'bg-red-100 text-red-800',
        icon: <ExclamationTriangleIcon className="w-4 h-4" />,
      },
    };
    return configs[status] || configs.available;
  };

  // 过滤设施
  const getFilteredFacilities = () => {
    let filtered = facilities;

    if (activeTab !== 'all') {
      filtered = filtered.filter((f) => f.type === activeTab);
    }

    if (searchText) {
      filtered = filtered.filter(
        (f) => f.name.includes(searchText) || f.location.includes(searchText),
      );
    }

    return filtered;
  };

  // 导航到设施
  const handleNavigate = (facility) => {
    // 模拟导航功能
    alert(`正在导航到${facility.name}`);
  };

  // 报告问题
  const handleReportIssue = (facility) => {
    alert(`报告${facility.name}的问题`);
  };

  const filteredFacilities = getFilteredFacilities();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="ml-2 text-lg font-semibold text-gray-900">设施查询</h1>
        </div>

        {/* Airbnb 风格搜索栏 */}
        <div className="px-4 pb-4">
          <div
            className={`relative transition-all duration-200 ${
              isSearchFocused ? 'transform scale-105' : ''
            }`}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索设施名称或位置"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* 分类标签 - Airbnb 风格 */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="flex overflow-x-auto px-4 py-3 space-x-3 scrollbar-hide">
          {facilityTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setActiveTab(type.key)}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                activeTab === type.key
                  ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <span className="text-lg">{type.icon}</span>
              <span className="font-medium">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 设施列表 */}
      <div className="px-4 py-6 space-y-4">
        {filteredFacilities.length > 0 ? (
          filteredFacilities.map((facility) => {
            const typeConfig = getFacilityConfig(facility.type);
            const statusConfig = getStatusConfig(facility.status);

            return (
              <div
                key={facility.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* 设施头部信息 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig.color}`}
                      >
                        <span className="text-2xl">{typeConfig.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {facility.name}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span>
                            {facility.location} · {facility.distance}
                          </span>
                        </div>
                        {/* 评分 */}
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {facility.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 状态标签 */}
                    <div
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                    >
                      {statusConfig.icon}
                      <span>{statusConfig.text}</span>
                    </div>
                  </div>

                  {/* 等待时间 */}
                  {facility.status === 'occupied' && facility.waitTime > 0 && (
                    <div className="flex items-center space-x-2 mb-4 p-3 bg-yellow-50 rounded-xl">
                      <ClockIcon className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        预计等待 {facility.waitTime} 分钟
                      </span>
                    </div>
                  )}

                  {/* 可用数量 */}
                  {facility.type === 'wheelchair' &&
                    facility.availableCount !== undefined && (
                      <div className="mb-4 p-3 bg-green-50 rounded-xl">
                        <span className="text-sm text-green-800">
                          剩余可用：
                          <span className="font-semibold text-lg">
                            {facility.availableCount}
                          </span>{' '}
                          台
                        </span>
                      </div>
                    )}

                  {/* 设施特性 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {facility.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex space-x-3 mb-3">
                    <button
                      onClick={() => handleNavigate(facility)}
                      disabled={facility.status === 'maintenance'}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                        facility.status === 'maintenance'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-pink-500 text-white hover:bg-pink-600'
                      }`}
                    >
                      导航前往
                    </button>
                    <button
                      onClick={() => handleReportIssue(facility)}
                      className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      报告问题
                    </button>
                  </div>

                  {/* 更新时间 */}
                  <div className="text-xs text-gray-400 text-right">
                    最后更新：{facility.lastUpdate}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchText ? '没有找到相关设施' : '暂无设施信息'}
            </h3>
            <p className="text-gray-500">
              {searchText ? '尝试使用其他关键词搜索' : '请稍后再试'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilitiesQuery;
