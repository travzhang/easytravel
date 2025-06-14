import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  List,
  Card,
  Tag,
  SearchBar,
  Tabs,
  Button,
  Dialog,
  Toast,
  Badge,
  Space,
  Empty,
  PullToRefresh,
  InfiniteScroll
} from 'antd-mobile';
import {
  EnvironmentOutline,
  ClockCircleOutline,
  PhoneFill,
  CheckCircleOutline,
  ExclamationCircleOutline
} from 'antd-mobile-icons';
import './index.css';

const Facilities = () => {
  const navigate = useNavigate();
  // const { scenicId } = useParams(); // 预留给后续使用
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [facilities, setFacilities] = useState([]);
  // const [loading, setLoading] = useState(false); // 预留给后续使用
  const [hasMore, setHasMore] = useState(true);

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
      lastUpdate: '2分钟前'
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
      lastUpdate: '1分钟前'
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
      lastUpdate: '5分钟前'
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
      lastUpdate: '30分钟前'
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
      lastUpdate: '10分钟前'
    }
  ];

  // 初始化加载数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 加载初始数据
  const loadInitialData = async () => {
    // setLoading(true);
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    setFacilities(mockFacilities);
    // setLoading(false);
  };

  // 下拉刷新
  const handleRefresh = async () => {
    await loadInitialData();
    Toast.show({
      icon: 'success',
      content: '刷新成功',
    });
  };

  // 加载更多
  const loadMore = async () => {
    // 模拟加载更多
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasMore(false);
  };

  // 获取设施类型配置
  const getFacilityConfig = (type) => {
    const configs = {
      toilet: { icon: '🚻', color: '#1890ff', name: '无障碍厕所' },
      elevator: { icon: '🛗', color: '#52c41a', name: '电梯' },
      charging: { icon: '🔌', color: '#fa8c16', name: '充电站' },
      wheelchair: { icon: '♿', color: '#722ed1', name: '轮椅租赁' },
      ramp: { icon: '📐', color: '#13c2c2', name: '坡道' }
    };
    return configs[type] || { icon: '📍', color: '#666', name: '其他' };
  };

  // 获取状态配置
  const getStatusConfig = (status) => {
    const configs = {
      available: { text: '可用', color: 'success', icon: <CheckCircleOutline /> },
      occupied: { text: '使用中', color: 'warning', icon: <ClockCircleOutline /> },
      maintenance: { text: '维护中', color: 'danger', icon: <ExclamationCircleOutline /> }
    };
    return configs[status] || configs.available;
  };

  // 过滤设施
  const getFilteredFacilities = () => {
    let filtered = facilities;
    
    // 按类型过滤
    if (activeTab !== 'all') {
      filtered = filtered.filter(f => f.type === activeTab);
    }
    
    // 按搜索文本过滤
    if (searchText) {
      filtered = filtered.filter(f => 
        f.name.includes(searchText) || 
        f.location.includes(searchText)
      );
    }
    
    return filtered;
  };

  // 导航到设施
  const handleNavigate = (facility) => {
    Dialog.confirm({
      content: `是否导航到${facility.name}？`,
      onConfirm: () => {
        Toast.show({
          icon: 'loading',
          content: '正在规划路线...',
          duration: 1000,
        });
        // 实际应用中这里会调用地图导航
      },
    });
  };

  // 报告问题
  const handleReportIssue = (facility) => {
    navigate(`/feedback?facilityId=${facility.id}&facilityName=${facility.name}`);
  };

  const filteredFacilities = getFilteredFacilities();

  return (
    <div className="facilities-container">
      <NavBar onBack={() => navigate(-1)}>无障碍设施</NavBar>

      {/* 搜索栏 */}
      <div className="search-section">
        <SearchBar
          placeholder="搜索设施名称或位置"
          value={searchText}
          onChange={setSearchText}
          style={{ '--background': '#fff' }}
        />
      </div>

      {/* 分类标签 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="facility-tabs"
      >
        <Tabs.Tab title="全部" key="all" />
        <Tabs.Tab title="厕所" key="toilet" />
        <Tabs.Tab title="电梯" key="elevator" />
        <Tabs.Tab title="充电" key="charging" />
        <Tabs.Tab title="轮椅" key="wheelchair" />
      </Tabs>

      {/* 设施列表 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="facility-list">
          {filteredFacilities.length > 0 ? (
            <>
              {filteredFacilities.map(facility => {
                const typeConfig = getFacilityConfig(facility.type);
                const statusConfig = getStatusConfig(facility.status);
                
                return (
                  <Card key={facility.id} className="facility-card">
                    <div className="facility-header">
                      <div className="facility-icon" style={{ backgroundColor: `${typeConfig.color}20` }}>
                        <span className="icon-text">{typeConfig.icon}</span>
                      </div>
                      <div className="facility-info">
                        <div className="facility-name">{facility.name}</div>
                        <div className="facility-location">
                          <EnvironmentOutline className="location-icon" />
                          {facility.location} · {facility.distance}
                        </div>
                      </div>
                      <div className="facility-status">
                        <Tag color={statusConfig.color} icon={statusConfig.icon}>
                          {statusConfig.text}
                        </Tag>
                      </div>
                    </div>

                    {/* 等待时间 */}
                    {facility.status === 'occupied' && facility.waitTime > 0 && (
                      <div className="wait-info">
                        <ClockCircleOutline /> 预计等待 {facility.waitTime} 分钟
                      </div>
                    )}

                    {/* 可用数量 */}
                    {facility.type === 'wheelchair' && facility.availableCount !== undefined && (
                      <div className="available-info">
                        剩余可用：<span className="count">{facility.availableCount}</span> 台
                      </div>
                    )}

                    {/* 设施特性 */}
                    <div className="facility-features">
                      {facility.features.map((feature, index) => (
                        <Tag key={index} className="feature-tag">
                          {feature}
                        </Tag>
                      ))}
                    </div>

                    {/* 操作按钮 */}
                    <div className="facility-actions">
                      <Button
                        size="small"
                        color="primary"
                        disabled={facility.status === 'maintenance'}
                        onClick={() => handleNavigate(facility)}
                      >
                        导航前往
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleReportIssue(facility)}
                      >
                        报告问题
                      </Button>
                    </div>

                    {/* 更新时间 */}
                    <div className="update-time">
                      最后更新：{facility.lastUpdate}
                    </div>
                  </Card>
                );
              })}
              
              <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                {hasMore ? '加载中...' : '没有更多了'}
              </InfiniteScroll>
            </>
          ) : (
            <Empty
              style={{ padding: '64px 0' }}
              imageStyle={{ width: 128 }}
              description={searchText ? '没有找到相关设施' : '暂无设施信息'}
            />
          )}
        </div>
      </PullToRefresh>

      {/* 紧急求助浮动按钮 */}
      <div className="emergency-float-btn" onClick={() => {
        Dialog.confirm({
          content: '是否呼叫景区工作人员协助？',
          onConfirm: () => {
            Toast.show({
              icon: 'success',
              content: '已通知工作人员，请在原地等待',
            });
          },
        });
      }}>
        <PhoneFill className="emergency-icon" />
      </div>
    </div>
  );
};

export default Facilities; 