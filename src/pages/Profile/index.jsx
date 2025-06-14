import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  Card,
  List,
  Avatar,
  Button,
  Dialog,
  Form,
  Input,
  Switch,
  Badge,
  Grid,
  TabBar,
  Space,
  Tag
} from 'antd-mobile';
import {
  UserOutline,
  SetOutline,
  RightOutline,
  HeartOutline,
  MessageOutline,
  SoundOutline,
  StarOutline,
  ExclamationCircleOutline,
  EnvironmentOutline,
  PhoneFill,
  AppOutline,
  UnorderedListOutline
} from 'antd-mobile-icons';
import './index.css';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('user');
  const [profileVisible, setProfileVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '张先生',
    phone: '138****8888',
    disabilityType: '轮椅使用者',
    emergencyContact: '李女士',
    emergencyPhone: '139****9999'
  });

  // 个人统计数据
  const stats = [
    { label: '已评价景点', value: 12, color: '#1890ff' },
    { label: '帮助他人', value: 8, color: '#52c41a' },
    { label: '收藏景点', value: 25, color: '#fa8c16' },
    { label: '使用天数', value: 46, color: '#722ed1' }
  ];

  // 功能菜单
  const functionMenus = [
    {
      key: 'reviews',
      title: '我的评价',
      description: '查看我发布的评价',
      icon: <StarOutline />,
      color: '#f39c12',
      path: '/reviews'
    },
    {
      key: 'communication',
      title: '沟通辅助',
      description: '语音转文字、紧急短语',
      icon: <SoundOutline />,
      color: '#722ed1',
      path: '/communication-aid'
    },
    {
      key: 'health',
      title: '健康管理',
      description: '疲劳追踪、用药提醒',
      icon: <HeartOutline />,
      color: '#e74c3c',
      path: '/health-manager'
    },
    {
      key: 'feedback',
      title: '问题反馈',
      description: '报告问题、提出建议',
      icon: <MessageOutline />,
      color: '#3498db',
      path: '/feedback'
    }
  ];

  // 设置选项
  const settingOptions = [
    {
      key: 'accessibility',
      title: '无障碍设置',
      description: '个性化无障碍体验',
      icon: <SetOutline />,
      action: () => console.log('无障碍设置')
    },
    {
      key: 'emergency',
      title: '紧急联系人',
      description: '管理紧急联系人信息',
      icon: <PhoneFill />,
      action: () => console.log('紧急联系人设置')
    },
    {
      key: 'privacy',
      title: '隐私设置',
      description: '数据隐私和权限管理',
      icon: <ExclamationCircleOutline />,
      action: () => console.log('隐私设置')
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
    if (tab && tab.path !== '/profile') {
      navigate(tab.path);
    }
  };

  const handleProfileSubmit = (values) => {
    setUserInfo({ ...userInfo, ...values });
    setProfileVisible(false);
  };

  return (
    <div className="profile-container">
      <NavBar>个人中心</NavBar>

      {/* 用户信息卡片 */}
      <Card className="user-card">
        <div className="user-header">
          <Avatar size={64} className="user-avatar">
            {userInfo.name.charAt(0)}
          </Avatar>
          <div className="user-info">
            <div className="user-name">{userInfo.name}</div>
            <div className="user-type">
              <Tag color="primary" size="small">{userInfo.disabilityType}</Tag>
            </div>
            <div className="user-phone">{userInfo.phone}</div>
          </div>
          <Button
            size="small"
            color="primary"
            onClick={() => setProfileVisible(true)}
          >
            编辑
          </Button>
        </div>

        {/* 统计数据 */}
        <div className="user-stats">
          <Grid columns={4} gap={0}>
            {stats.map((stat, index) => (
              <Grid.Item key={index}>
                <div className="stat-item">
                  <div className="stat-value" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </Grid.Item>
            ))}
          </Grid>
        </div>
      </Card>

      {/* 功能菜单 */}
      <Card className="function-card">
        <div className="card-title">我的功能</div>
        <div className="function-grid">
          {functionMenus.map(item => (
            <div
              key={item.key}
              className="function-item"
              onClick={() => navigate(item.path)}
            >
              <div 
                className="function-icon"
                style={{ backgroundColor: `${item.color}20`, color: item.color }}
              >
                {item.icon}
              </div>
              <div className="function-content">
                <div className="function-title">{item.title}</div>
                <div className="function-description">{item.description}</div>
              </div>
              <RightOutline className="function-arrow" />
            </div>
          ))}
        </div>
      </Card>

      {/* 设置选项 */}
      <Card className="settings-card">
        <div className="card-title">设置</div>
        <List>
          {settingOptions.map(option => (
            <List.Item
              key={option.key}
              prefix={
                <div 
                  className="setting-icon"
                  style={{ backgroundColor: '#f5f5f5' }}
                >
                  {option.icon}
                </div>
              }
              onClick={option.action}
              arrow={<RightOutline />}
            >
              <div className="setting-content">
                <div className="setting-title">{option.title}</div>
                <div className="setting-description">{option.description}</div>
              </div>
            </List.Item>
          ))}
        </List>
      </Card>

      {/* 应用信息 */}
      <Card className="app-info-card">
        <List>
          <List.Item onClick={() => console.log('关于我们')}>
            关于我们
          </List.Item>
          <List.Item onClick={() => console.log('用户协议')}>
            用户协议
          </List.Item>
          <List.Item onClick={() => console.log('隐私政策')}>
            隐私政策
          </List.Item>
          <List.Item onClick={() => console.log('版本信息')}>
            版本信息
            <span style={{ color: '#999', marginLeft: 'auto' }}>v1.0.0</span>
          </List.Item>
        </List>
      </Card>

      {/* 编辑资料弹窗 */}
      <Dialog
        visible={profileVisible}
        title="编辑个人资料"
        content={
          <Form
            layout="vertical"
            onFinish={handleProfileSubmit}
            initialValues={userInfo}
            footer={
              <Space>
                <Button onClick={() => setProfileVisible(false)}>
                  取消
                </Button>
                <Button type="submit" color="primary">
                  保存
                </Button>
              </Space>
            }
          >
            <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
            
            <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
              <Input placeholder="请输入手机号" />
            </Form.Item>
            
            <Form.Item name="disabilityType" label="用户类型">
              <Input placeholder="请输入用户类型" />
            </Form.Item>
            
            <Form.Item name="emergencyContact" label="紧急联系人">
              <Input placeholder="请输入紧急联系人姓名" />
            </Form.Item>
            
            <Form.Item name="emergencyPhone" label="紧急联系电话">
              <Input placeholder="请输入紧急联系电话" />
            </Form.Item>
          </Form>
        }
        onClose={() => setProfileVisible(false)}
      />

      {/* 底部导航栏 */}
      <TabBar
        activeKey={activeTab}
        onChange={handleTabChange}
        className="profile-tabbar"
      >
        {tabs.map(tab => (
          <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
        ))}
      </TabBar>
    </div>
  );
};

export default Profile; 