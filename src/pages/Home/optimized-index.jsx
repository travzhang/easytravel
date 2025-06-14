import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Swiper,
  Image,
  Grid,
  NoticeBar,
  TabBar,
  Tag,
  Space,
  Popup,
  Radio,
  Form,
  Dialog
} from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
  EnvironmentOutline,
  SearchOutline,
  RightOutline,
  StarFill,
  SoundOutline,
  BellOutline
} from 'antd-mobile-icons';
import './optimized-index.css';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [accessibilitySettingsVisible, setAccessibilitySettingsVisible] = useState(false);
  const [disabilityType, setDisabilityType] = useState('wheelchair');
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [largeTextMode, setLargeTextMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // 检查是否首次使用
  useEffect(() => {
    const isFirstVisit = localStorage.getItem('isFirstVisit') !== 'false';
    if (isFirstVisit) {
      setShowOnboarding(true);
      localStorage.setItem('isFirstVisit', 'false');
    }
    
    // 加载用户设置
    const savedDisabilityType = localStorage.getItem('disabilityType');
    const savedHighContrastMode = localStorage.getItem('highContrastMode') === 'true';
    const savedLargeTextMode = localStorage.getItem('largeTextMode') === 'true';
    
    if (savedDisabilityType) setDisabilityType(savedDisabilityType);
    if (savedHighContrastMode) setHighContrastMode(savedHighContrastMode);
    if (savedLargeTextMode) setLargeTextMode(savedLargeTextMode);
  }, []);

  // 保存用户设置
  const saveAccessibilitySettings = (type, contrast, largeText) => {
    setDisabilityType(type);
    setHighContrastMode(contrast);
    setLargeTextMode(largeText);
    
    localStorage.setItem('disabilityType', type);
    localStorage.setItem('highContrastMode', contrast.toString());
    localStorage.setItem('largeTextMode', largeText.toString());
    
    setAccessibilitySettingsVisible(false);
  };

  // 轮播图数据
  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1394&q=80',
      title: '无障碍旅行，让世界触手可及'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1540567736792-f78f6242e4e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      title: '发现适合轮椅出行的景点路线'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      title: '共建无障碍旅游环境'
    }
  ];

  // 根据残疾类型获取主要功能
  const getPrimaryFeatures = () => {
    const commonFeatures = [
      {
        id: 1,
        title: '无障碍路线',
        icon: '🗺️',
        color: '#1890ff',
        onClick: () => navigate('/scenic/1'),
        ariaLabel: '浏览无障碍路线'
      },
      {
        id: 2,
        title: '紧急求助',
        icon: '🆘',
        color: '#ff4d4f',
        onClick: () => handleEmergencyHelp(),
        ariaLabel: '紧急求助'
      }
    ];
    
    // 根据残疾类型添加特定功能
    if (disabilityType === 'wheelchair') {
      return [
        ...commonFeatures,
        {
          id: 3,
          title: '轮椅设施',
          icon: '♿',
          color: '#52c41a',
          onClick: () => navigate('/facilities'),
          ariaLabel: '查找轮椅设施'
        }
      ];
    } else if (disabilityType === 'visual') {
      return [
        ...commonFeatures,
        {
          id: 3,
          title: '语音导航',
          icon: '🔊',
          color: '#722ed1',
          onClick: () => toggleVoiceNavigation(),
          ariaLabel: '开启语音导航'
        }
      ];
    } else {
      return commonFeatures;
    }
  };

  // 次要功能
  const secondaryFeatures = [
    {
      id: 1,
      title: '记录行程',
      icon: '📝',
      color: '#52c41a',
      onClick: () => navigate('/scenic/1/record'),
      ariaLabel: '记录我的行程'
    },
    {
      id: 2,
      title: '景点排行',
      icon: '🏆',
      color: '#fa8c16',
      onClick: () => navigate('/ranking'),
      ariaLabel: '查看景点排行'
    },
    {
      id: 3,
      title: '我的反馈',
      icon: '💬',
      color: '#722ed1',
      onClick: () => navigate('/feedback'),
      ariaLabel: '我的反馈'
    },
    {
      id: 4,
      title: '离线地图',
      icon: '📥',
      color: '#13c2c2',
      onClick: () => navigate('/offline-maps'),
      ariaLabel: '下载离线地图'
    }
  ];

  // 推荐景点数据 - 根据残疾类型筛选
  const getRecommendedScenics = () => {
    const allScenics = [
      {
        id: 1,
        name: '故宫博物院',
        image: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80',
        location: '北京市东城区',
        rating: 4.8,
        accessibilityLevel: 'B+',
        tags: ['文化遗产', '博物馆'],
        suitableFor: ['wheelchair', 'hearing']
      },
      {
        id: 2,
        name: '颐和园',
        image: 'https://images.unsplash.com/photo-1629652487043-fb2825838f8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80',
        location: '北京市海淀区',
        rating: 4.6,
        accessibilityLevel: 'B',
        tags: ['园林', '湖泊'],
        suitableFor: ['wheelchair', 'cognitive']
      },
      {
        id: 3,
        name: '上海迪士尼乐园',
        image: 'https://images.unsplash.com/photo-1610053617673-4e4eff3dd95e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80',
        location: '上海市浦东新区',
        rating: 4.9,
        accessibilityLevel: 'A',
        tags: ['主题乐园', '全程无障碍'],
        suitableFor: ['wheelchair', 'visual', 'hearing', 'cognitive']
      }
    ];
    
    // 如果没有选择残疾类型，返回所有景点
    if (!disabilityType) return allScenics;
    
    // 根据残疾类型筛选
    return allScenics.filter(scenic => 
      scenic.suitableFor.includes(disabilityType)
    );
  };

  // 紧急求助功能
  const handleEmergencyHelp = () => {
    Dialog.confirm({
      title: '紧急求助',
      content: '是否需要联系景区工作人员寻求帮助？',
      confirmText: '确认求助',
      cancelText: '取消',
      onConfirm: () => {
        // 模拟求助功能
        Dialog.alert({
          content: '已发送求助信息，工作人员将很快联系您',
          confirmText: '知道了'
        });
      }
    });
  };

  // 语音导航功能
  const toggleVoiceNavigation = () => {
    // 模拟语音导航功能
    const isActive = localStorage.getItem('voiceNavigation') === 'true';
    localStorage.setItem('voiceNavigation', (!isActive).toString());
    
    Dialog.alert({
      content: `语音导航已${!isActive ? '开启' : '关闭'}`,
      confirmText: '知道了'
    });
  };

  // 底部导航栏
  const tabs = [
    {
      key: 'home',
      title: '首页',
      icon: <AppOutline />,
      badge: null
    },
    {
      key: 'list',
      title: '景点列表',
      icon: <UnorderedListOutline />,
      badge: null
    },
    {
      key: 'user',
      title: '我的',
      icon: <UserOutline />,
      badge: null
    }
  ];

  return (
    <div className={`home-container ${highContrastMode ? 'high-contrast' : ''} ${largeTextMode ? 'large-text' : ''}`}>
      {/* 顶部搜索栏 */}
      <div className="search-bar">
        <div className="search-input" onClick={() => navigate('/search')} role="button" aria-label="搜索无障碍景点">
          <SearchOutline />
          <span>搜索无障碍景点</span>
        </div>
        <Button 
          className="accessibility-settings-btn" 
          onClick={() => setAccessibilitySettingsVisible(true)}
          aria-label="无障碍设置"
        >
          <SoundOutline />
        </Button>
      </div>

      {/* 轮播图 */}
      <Swiper autoplay loop className="home-swiper">
        {banners.map(banner => (
          <Swiper.Item key={banner.id}>
            <div className="banner-item" role="img" aria-label={banner.title}>
              <Image src={banner.image} fit="cover" alt={banner.title} />
              <div className="banner-title">{banner.title}</div>
            </div>
          </Swiper.Item>
        ))}
      </Swiper>

      {/* 主要功能区块 */}
      <div className="feature-section primary-features">
        <h2 className="feature-section-title">主要功能</h2>
        <Grid columns={3} gap={16}>
          {getPrimaryFeatures().map(feature => (
            <Grid.Item key={feature.id}>
              <div 
                className="feature-item" 
                style={{ backgroundColor: `${feature.color}15` }}
                onClick={feature.onClick}
                role="button"
                aria-label={feature.ariaLabel}
              >
                <div className="feature-icon" style={{ backgroundColor: feature.color }}>
                  {feature.icon}
                </div>
                <div className="feature-title">{feature.title}</div>
              </div>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* 通知栏 */}
      <NoticeBar
        content="欢迎使用景区无障碍动线攻略助手，共同打造无障碍旅游环境"
        color="info"
        className="home-notice"
        icon={<BellOutline />}
      />

      {/* 推荐景点 */}
      <div className="section-header">
        <div className="section-title">适合您的景点</div>
        <div className="section-more" onClick={() => navigate('/scenic-list')} role="button" aria-label="查看更多景点">
          查看更多 <RightOutline />
        </div>
      </div>

      <div className="scenic-list">
        {getRecommendedScenics().map(scenic => (
          <Card
            key={scenic.id}
            className="scenic-card"
            onClick={() => navigate(`/scenic/${scenic.id}`)}
            bodyClassName="scenic-card-body"
            role="button"
            aria-label={`查看${scenic.name}详情`}
          >
            <div className="scenic-card-content">
              <Image src={scenic.image} className="scenic-image" alt={scenic.name} />
              <div className={`accessibility-badge level-${scenic.accessibilityLevel.charAt(0).toLowerCase()}`}>
                {scenic.accessibilityLevel}
              </div>
              <div className="scenic-info">
                <div className="scenic-name">{scenic.name}</div>
                <div className="scenic-meta">
                  <div className="scenic-location">
                    <EnvironmentOutline /> {scenic.location}
                  </div>
                  <div className="scenic-rating">
                    <StarFill className="rating-icon" /> {scenic.rating}
                  </div>
                </div>
                <div className="scenic-tags">
                  {scenic.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 更多功能 */}
      <div className="section-header">
        <div className="section-title">更多功能</div>
      </div>

      <div className="feature-section secondary-features">
        <Grid columns={4} gap={8}>
          {secondaryFeatures.map(feature => (
            <Grid.Item key={feature.id}>
              <div 
                className="feature-item small" 
                style={{ backgroundColor: `${feature.color}15` }}
                onClick={feature.onClick}
                role="button"
                aria-label={feature.ariaLabel}
              >
                <div className="feature-icon small" style={{ backgroundColor: feature.color }}>
                  {feature.icon}
                </div>
                <div className="feature-title small">{feature.title}</div>
              </div>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* 底部导航栏 */}
      <TabBar activeKey={activeTab} onChange={setActiveTab} className="home-tab-bar">
        {tabs.map(item => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} badge={item.badge} />
        ))}
      </TabBar>

      {/* 无障碍设置弹窗 */}
      <Popup
        visible={accessibilitySettingsVisible}
        onMaskClick={() => setAccessibilitySettingsVisible(false)}
        bodyStyle={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', padding: '16px' }}
      >
        <div className="accessibility-settings">
          <h3>无障碍设置</h3>
          <Form layout="horizontal">
            <Form.Header>残疾类型</Form.Header>
            <Radio.Group
              value={disabilityType}
              onChange={val => setDisabilityType(val)}
            >
              <Space direction="vertical">
                <Radio value="wheelchair">轮椅使用者</Radio>
                <Radio value="visual">视力障碍</Radio>
                <Radio value="hearing">听力障碍</Radio>
                <Radio value="cognitive">认知障碍</Radio>
              </Space>
            </Radio.Group>
            
            <Form.Header>显示设置</Form.Header>
            <Form.Item label="高对比度模式">
              <Radio.Group
                value={highContrastMode}
                onChange={val => setHighContrastMode(val)}
              >
                <Space>
                  <Radio value={true}>开启</Radio>
                  <Radio value={false}>关闭</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item label="大字体模式">
              <Radio.Group
                value={largeTextMode}
                onChange={val => setLargeTextMode(val)}
              >
                <Space>
                  <Radio value={true}>开启</Radio>
                  <Radio value={false}>关闭</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Form>
          
          <div className="popup-buttons">
            <Button 
              block 
              color="primary" 
              size="large"
              onClick={() => saveAccessibilitySettings(disabilityType, highContrastMode, largeTextMode)}
            >
              保存设置
            </Button>
          </div>
        </div>
      </Popup>

      {/* 首次使用引导 */}
      <Dialog
        visible={showOnboarding}
        title="欢迎使用无障碍旅行助手"
        content={
          <div className="onboarding-content">
            <p>请选择您的残疾类型，我们将为您提供个性化的无障碍旅行体验。</p>
            <Radio.Group
              value={disabilityType}
              onChange={val => setDisabilityType(val)}
            >
              <Space direction="vertical">
                <Radio value="wheelchair">轮椅使用者</Radio>
                <Radio value="visual">视力障碍</Radio>
                <Radio value="hearing">听力障碍</Radio>
                <Radio value="cognitive">认知障碍</Radio>
              </Space>
            </Radio.Group>
          </div>
        }
        closeOnAction
        onClose={() => setShowOnboarding(false)}
        actions={[
          {
            key: 'confirm',
            text: '开始使用',
            bold: true,
            onClick: () => {
              localStorage.setItem('disabilityType', disabilityType);
              setShowOnboarding(false);
            }
          }
        ]}
      />
    </div>
  );
};

export default Home;
