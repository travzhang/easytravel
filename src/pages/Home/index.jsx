import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Swiper,
  Image,
  Grid,
  NoticeBar,
  TabBar,
  Badge,
  List,
  Avatar,
  Space,
  Tag,
  NavBar,
  SearchBar
} from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
  EnvironmentOutline,
  RightOutline,
  StarFill,
  HeartOutline,
  MessageOutline,
  SoundOutline,
  SearchOutline
} from 'antd-mobile-icons';
import { recommendedScenics } from '../../mock/scenicData';
import './index.css';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  // 轮播图数据 - 无障碍相关新闻和景点信息
  const banners = [
    {
      id: 1,
      image: 'https://img0.baidu.com/it/u=1196205945,661377049&fm=253&app=120&f=GIF?w=640&h=360',
      title: '故宫博物院无障碍通道全面升级，新增10条无障碍路线'
    },
    {
      id: 2,
      image: 'https://img0.baidu.com/it/u=1553595427,1180227439&fm=253&fmt=auto&app=138&f=JPEG?w=750&h=500',
      title: '上海迪士尼成为全国首个A+级无障碍主题乐园'
    },
    {
      id: 3,
      image: 'https://siaa-1251451172.cos.ap-guangzhou.myqcloud.com/media/1/640x31322_00.png',
      title: '全国500+景区完成无障碍改造，覆盖31个省市'
    }
  ];

  // 核心功能区块
  const features = [
    {
      id: 1,
      title: '无障碍景点',
      icon: '🗺️',
      color: '#4A90E2',
      onClick: () => navigate('/scenic-list')
    },
    {
      id: 2,
      title: '设施查询',
      icon: '♿',
      color: '#F5A623',
      onClick: () => navigate('/facilities')
    },
    {
      id: 3,
      title: '沟通辅助',
      icon: '🗣️',
      color: '#9013FE',
      onClick: () => navigate('/communication-aid')
    },
    {
      id: 4,
      title: '健康管理',
      icon: '💊',
      color: '#4CAF50',
      onClick: () => navigate('/health-manager')
    }
  ];

  // 无障碍旅行小贴士
  const travelTips = [
    {
      id: 1,
      title: '出行前查询景点无障碍设施情况',
      icon: '🔍'
    },
    {
      id: 2,
      title: '提前规划无障碍路线，避开台阶多的区域',
      icon: '📋'
    },
    {
      id: 3,
      title: '携带必要的辅助设备和药品',
      icon: '💊'
    }
  ];

  // 底部导航栏
  const tabs = [
    {
      key: 'home',
      title: '首页',
      icon: <AppOutline />,
      path: '/'
    },
    {
      key: 'list',
      title: '景点列表',
      icon: <UnorderedListOutline />,
      path: '/scenic-list'
    },
    {
      key: 'user',
      title: '我的',
      icon: <UserOutline />,
      path: '/profile'
    }
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
    const tab = tabs.find(t => t.key === key);
    if (tab) {
      navigate(tab.path);
    }
  };

  return (
    <div className="home-container">
      {/* 轮播图 */}
      <div className="banner-section">
        <Swiper autoplay loop className="home-swiper">
          {banners.map(banner => (
            <Swiper.Item key={banner.id}>
              <div className="banner-item">
                <Image src={banner.image} alt={banner.title} />
                <div className="banner-overlay">
                  <h2 className="banner-title">{banner.title}</h2>
                </div>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      {/* 核心功能 */}
      <div className="features-section">
        <div className="features-grid-home">
          {features.map(feature => (
            <div 
              key={feature.id} 
              className="feature-item"
              onClick={feature.onClick}
            >
              <div 
                className="feature-icon" 
                style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <span className="feature-title">{feature.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 通知消息 */}
      <NoticeBar 
        content="欢迎使用景区无障碍导览系统，为您提供更贴心的无障碍出行服务" 
        color="primary"
        className="home-notice"
      />

      {/* 推荐景点 */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">无障碍景点推荐</h3>
          <div className="section-more" onClick={() => navigate('/scenic-list')}>
            查看更多 <RightOutline />
          </div>
        </div>
        <div className="scenic-list">
          {recommendedScenics.map(scenic => (
            <div 
              key={scenic.id} 
              className="scenic-card accessibility-focused"
              onClick={() => navigate(`/scenic/${scenic.id}`)}
            >
              <div className="scenic-image">
                <Image src={scenic.image} alt={scenic.name} />
                <div className={`accessibility-badge level-${scenic.accessibilityLevel.replace('+', 'plus')}`}>
                  ♿ {scenic.accessibilityLevel}
                </div>
              </div>
              <div className="scenic-content">
                <div className="scenic-header">
                  <h4 className="scenic-name">{scenic.name}</h4>
                </div>
                
                {/* 无障碍评分突出显示 */}
                <div className="accessibility-highlight">
                  <div className="accessibility-score">
                    <span className="score-label">无障碍等级</span>
                    <div className="score-value">
                      <StarFill style={{ color: '#52c41a' }} /> 
                      <span>{scenic.accessibilityLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="scenic-description">
                  <p>{scenic.shortDesc}</p>
                </div>
                
                <div className="scenic-tags">
                  {scenic.tags.slice(0, 3).map((tag, index) => (
                    <Tag key={index} size="small" color={tag.includes('无障碍') ? 'success' : 'default'}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快捷功能 */}
      <div className="section">
        <h3 className="section-title">快捷功能</h3>
        <Grid columns={3} gap={12}>
          <Grid.Item onClick={() => navigate('/zoo-map')}>
            <div className="quick-function">
              <EnvironmentOutline fontSize={24} color="#722ed1" />
              <span>动物园地图</span>
            </div>
          </Grid.Item>
          <Grid.Item onClick={() => navigate('/feedback')}>
            <div className="quick-function">
              <MessageOutline fontSize={24} color="#1890ff" />
              <span>问题反馈</span>
            </div>
          </Grid.Item>
          <Grid.Item onClick={() => navigate('/communication-aid')}>
            <div className="quick-function">
              <SoundOutline fontSize={24} color="#52c41a" />
              <span>语音助手</span>
            </div>
          </Grid.Item>
          <Grid.Item onClick={() => navigate('/health-manager')}>
            <div className="quick-function">
              <HeartOutline fontSize={24} color="#fa8c16" />
              <span>健康监测</span>
            </div>
          </Grid.Item>
        </Grid>
      </div>

      {/* 无障碍旅行小贴士 */}
      <div className="section">
        <h3 className="section-title">无障碍旅行小贴士</h3>
        <Card className="tips-card">
          {travelTips.map(tip => (
            <div key={tip.id} className="tip-item">
              <span className="tip-icon">{tip.icon}</span>
              <span className="tip-text">{tip.title}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* 底部导航栏 */}
      <TabBar
        activeKey={activeTab}
        onChange={handleTabChange}
        className="home-tabbar"
      >
        {tabs.map(tab => (
          <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
        ))}
      </TabBar>
    </div>
  );
};

export default Home;
