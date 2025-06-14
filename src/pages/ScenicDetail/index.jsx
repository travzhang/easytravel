import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavBar, Card, Space, Button, Tabs, Modal, Image, Rate, Avatar } from 'antd-mobile';
import { EnvironmentOutline, ClockCircleOutline, HeartOutline, UserCircleOutline, CalendarOutline, StarOutline } from 'antd-mobile-icons';
import AccessibilityMap from '../../components/AccessibilityMap';
import { scenicDetails } from '../../mock/scenicData';
import './index.css';

const ScenicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [mapModalVisible, setMapModalVisible] = useState(false);

  // 根据ID获取景点数据
  const scenicData = scenicDetails.find(scenic => scenic.id === parseInt(id)) || scenicDetails[0];

  // 为了保持现有界面丰富性，在基础数据上补充一些额外信息
  const enhancedScenicData = {
    ...scenicData,
    detailedDescription: scenicData.description,
    accessibilityScore: 4.2,
    ticketPrice: scenicData.id === 1 ? '60元/人，学生半价' : 
                  scenicData.id === 2 ? '30元/人，学生半价' : 
                  '399元/人，儿童优惠',
    visitorsToday: Math.floor(Math.random() * 20000) + 5000,
    highlights: scenicData.id === 1 ? [
      { icon: '🏛️', title: '世界文化遗产', desc: 'UNESCO认定的世界文化遗产' },
      { icon: '👑', title: '皇家宫殿', desc: '明清两代皇帝的宫殿' },
      { icon: '🎨', title: '珍贵文物', desc: '超过180万件珍贵文物' },
      { icon: '♿', title: '无障碍友好', desc: '完善的无障碍设施和服务' }
    ] : scenicData.id === 2 ? [
      { icon: '🏞️', title: '皇家园林', desc: '中国古典园林艺术杰作' },
      { icon: '🌊', title: '昆明湖', desc: '以杭州西湖为蓝本建造' },
      { icon: '🏗️', title: '万寿山', desc: '园林建筑与自然山水完美结合' },
      { icon: '♿', title: '部分无障碍', desc: '主要区域提供无障碍服务' }
    ] : [
      { icon: '🎢', title: '主题乐园', desc: '中国内地首座迪士尼乐园' },
      { icon: '🏰', title: '奇幻城堡', desc: '独特的奇幻童话城堡' },
      { icon: '🎭', title: '精彩表演', desc: '丰富多彩的演出和巡游' },
      { icon: '♿', title: '全程无障碍', desc: '国际标准的无障碍设施' }
    ],
    facilities: scenicData.facilities.map(facility => ({
      name: facility,
      icon: facility.includes('入口') ? '🚪' : 
            facility.includes('轮椅') ? '♿' : 
            facility.includes('厕所') ? '🚻' : 
            facility.includes('坡道') ? '🛤️' : 
            facility.includes('盲道') ? '👆' : 
            facility.includes('导览') ? '🎧' : 
            facility.includes('电梯') ? '🏗️' : '🔧',
      status: 'available',
      desc: `${facility}服务可用`
    }))
  };

  // 用户评价数据
  const userReviews = [
    {
      id: 1,
      user: {
        name: '王小明',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face',
        disability: '轮椅使用者',
        badge: '无障碍体验官'
      },
      rating: 5,
      date: '2024-05-20',
      helpful: 28,
      content: '故宫的无障碍设施做得非常好！轮椅租赁很方便，工作人员态度也很友善。整个游览过程很舒适，坡道设计合理，没有遇到任何障碍。特别是珍宝馆，展览内容丰富，无障碍设施完备。强烈推荐！',
      images: ['https://images.unsplash.com/photo-1559127452-e9ba11e8f684?w=200&h=150&fit=crop'],
      tags: ['轮椅友好', '服务优秀', '设施完善'],
      accessibility: {
        wheelchair: 5,
        visual: 4,
        hearing: 4,
        cognitive: 5
      }
    },
    {
      id: 2,
      user: {
        name: '李阿姨',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
        disability: '视力障碍',
        badge: '资深游客'
      },
      rating: 4,
      date: '2024-05-18',
      helpful: 15,
      content: '作为视障人士，我对故宫的语音导览系统印象深刻。盲文指示牌设置得很贴心，工作人员也会主动提供帮助。唯一的建议是希望能增加更多触摸体验区域，让我们能更好地"感受"文物的魅力。',
      tags: ['语音导览', '盲文友好', '服务贴心'],
      accessibility: {
        wheelchair: 4,
        visual: 5,
        hearing: 3,
        cognitive: 4
      }
    },
    {
      id: 3,
      user: {
        name: '张大爷',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
        disability: '行动不便',
        badge: '北京通'
      },
      rating: 4,
      date: '2024-05-15',
      helpful: 22,
      content: '故宫真的是越来越人性化了！我腿脚不便，但是有了轮椅和专门的路线，也能很好地参观。建议大家提前在网上预约，这样可以享受优先通道服务，避免排队等候。',
      tags: ['预约便利', '优先通道', '路线清晰'],
      accessibility: {
        wheelchair: 5,
        visual: 3,
        hearing: 4,
        cognitive: 4
      }
    },
    {
      id: 4,
      user: {
        name: '陈老师',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
        disability: '听力障碍',
        badge: '教育工作者'
      },
      rating: 4,
      date: '2024-05-12',
      helpful: 18,
      content: '故宫的手语导览服务让我很感动！虽然我听不到声音，但通过手语翻译和文字说明，我依然能深度了解每个展品的历史文化背景。希望更多景区能学习故宫的做法。',
      tags: ['手语服务', '文字说明', '文化深度'],
      accessibility: {
        wheelchair: 4,
        visual: 4,
        hearing: 5,
        cognitive: 4
      }
    }
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleShowAccessibilityMap = () => {
    navigate(`/accessibility-map/${id}`);
  };

  const renderAccessibilityRating = (ratings) => {
    const categories = [
      { key: 'wheelchair', label: '轮椅通行', icon: '♿' },
      { key: 'visual', label: '视障友好', icon: '👁️' },
      { key: 'hearing', label: '听障友好', icon: '👂' },
      { key: 'cognitive', label: '认知友好', icon: '🧠' }
    ];

    return (
      <div className="accessibility-ratings">
        {categories.map(cat => (
          <div key={cat.key} className="rating-item">
            <span className="rating-icon">{cat.icon}</span>
            <span className="rating-label">{cat.label}</span>
            <Rate readOnly value={ratings[cat.key]} count={5} />
            <span className="rating-score">{ratings[cat.key]}.0</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="scenic-detail-container">
      <NavBar onBack={handleBack} className="detail-navbar">景点详情</NavBar>

      {/* 景点封面图 */}
      <div className="scenic-cover">
        <Image src={enhancedScenicData.image} fit="cover" />
        <div className="scenic-title">
          <h1>{enhancedScenicData.name}</h1>
          <div className="title-badges">

            <div className="rating-badge">
              <HeartOutline className="badge-icon" />
              {enhancedScenicData.accessibilityScore}分
            </div>
          </div>
        </div>
      </div>

      {/* 基本信息卡片 */}
      <Card className="info-card">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className="info-item">
            <EnvironmentOutline className="info-icon" />
            <span>{enhancedScenicData.location}</span>

          </div>
          <div className="info-item">
            <ClockCircleOutline className="info-icon" />
            <span>开放时间: {enhancedScenicData.openingHours}</span>
          </div>
          <div className="info-item">
            <CalendarOutline className="info-icon" />
            <span>门票价格: {enhancedScenicData.ticketPrice}</span>
          </div>
          <div className="info-item">
            <UserCircleOutline className="info-icon" />
            <span>今日游客: {enhancedScenicData.visitorsToday.toLocaleString()}人</span>
          </div>
        </Space>
      </Card>

      {/* 景点亮点 */}
      <Card className="highlights-card">
        <h3>景点亮点</h3>
        <div className="highlights-grid">
          {enhancedScenicData.highlights.map((highlight, index) => (
            <div key={index} className="highlight-item">
              <span className="highlight-icon">{highlight.icon}</span>
              <div className="highlight-content">
                <div className="highlight-title">{highlight.title}</div>
                <div className="highlight-desc">{highlight.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 标签页 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="detail-tabs">
        <Tabs.Tab title="景点介绍" key="info">
          <div className="tab-content">
            <h3>景点简介</h3>
            <p>{enhancedScenicData.description}</p>

            <h3>详细介绍</h3>
            <div className="detailed-description">
              {enhancedScenicData.detailedDescription.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <h3>无障碍设施</h3>
            <div className="facility-grid">
              {enhancedScenicData.facilities.map((facility, index) => (
                <div key={index} className="facility-card">
                  <div className="facility-header">
                    <span className="facility-icon">{facility.icon}</span>
                    <span className="facility-name">{facility.name}</span>
                    <span className={`facility-status ${facility.status}`}>
                      {facility.status === 'available' ? '✓' : '📅'}
                    </span>
                  </div>
                  <div className="facility-desc">{facility.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Tabs.Tab>

        <Tabs.Tab title="无障碍路线" key="routes">
          <div className="tab-content">
            <h3>推荐无障碍路线</h3>

            {enhancedScenicData.routes.map((route) => (
              <Card key={route.id} className="route-card">
                <div className="route-header">
                  <div className="route-title">{route.name}</div>
                  <div className="route-info">
                    <span className="route-duration">{route.duration}</span>
                    <span className="route-distance">{route.distance}</span>
                    <span className={`route-difficulty ${route.difficulty === '简单' ? 'easy' : 'medium'}`}>
                      {route.difficulty}
                    </span>
                  </div>
                </div>
                <div className="route-description">{route.description}</div>
                <div className="route-waypoints">
                  {route.waypoints.map((waypoint, index) => (
                    <div key={index} className="waypoint-item">
                      <div className="waypoint-number">{index + 1}</div>
                      <div className="waypoint-content">
                        <div className="waypoint-name">{waypoint.name}</div>
                        <div className="waypoint-description">{waypoint.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Tabs.Tab>

        <Tabs.Tab title="用户评价" key="reviews">
          <div className="tab-content">
            <div className="reviews-header">
              <h3>用户评价</h3>
              <div className="reviews-summary">
                <div className="summary-score">
                  <span className="score-number">{enhancedScenicData.accessibilityScore}</span>
                  <Rate readOnly value={Math.round(enhancedScenicData.accessibilityScore)} />
                  <span className="score-text">({userReviews.length}条评价)</span>
                </div>
              </div>
            </div>

            <div className="reviews-list">
              {userReviews.map((review) => (
                <Card key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <Avatar src={review.user.avatar} />
                      <div className="reviewer-details">
                        <div className="reviewer-name">
                          {review.user.name}
                          <span className="reviewer-badge">{review.user.badge}</span>
                        </div>
                        <div className="reviewer-type">{review.user.disability}</div>
                      </div>
                    </div>
                    <div className="review-meta">
                      <Rate readOnly value={review.rating} />
                      <div className="review-date">{review.date}</div>
                    </div>
                  </div>

                  <div className="review-content">
                    <p>{review.content}</p>
                    
                    {review.images && (
                      <div className="review-images">
                        {review.images.map((img, index) => (
                          <Image key={index} src={img} width={100} height={75} fit="cover" />
                        ))}
                      </div>
                    )}

                    <div className="review-tags">
                      {review.tags.map((tag, index) => (
                        <span key={index} className="review-tag">{tag}</span>
                      ))}
                    </div>

                    {renderAccessibilityRating(review.accessibility)}

                    <div className="review-actions">
                      <Button size="mini" fill="none">
                        👍 有用 ({review.helpful})
                      </Button>
                      <Button size="mini" fill="none">
                        💬 回复
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="add-review">
              <Button block color="primary" fill="outline">
                ✍️ 写评价
              </Button>
            </div>
          </div>
        </Tabs.Tab>
      </Tabs>

      {/* 底部操作按钮 */}
      <div className="bottom-actions">
        <Button
          block
          color="primary"
          size="large"
          onClick={handleShowAccessibilityMap}
        >
          🗺️ 查看无障碍地图
        </Button>
      </div>

      {/* 地图模态框 */}
      <Modal
        visible={mapModalVisible}
        content={
          <div className="map-modal-content">
            {window.AMap ? (
              <AccessibilityMap
                center={[enhancedScenicData.coordinates.longitude, enhancedScenicData.coordinates.latitude]}
                markers={[
                  {
                    position: [enhancedScenicData.coordinates.longitude, enhancedScenicData.coordinates.latitude],
                    title: enhancedScenicData.name
                  }
                ]}
                facilities={[
                  {
                    position: [enhancedScenicData.coordinates.longitude + 0.001, enhancedScenicData.coordinates.latitude],
                    type: 'wheelchair',
                    name: '轮椅租赁点'
                  },
                  {
                    position: [enhancedScenicData.coordinates.longitude, enhancedScenicData.coordinates.latitude + 0.001],
                    type: 'toilet',
                    name: '无障碍厕所'
                  }
                ]}
                title={`${enhancedScenicData.name}无障碍地图`}
                height={350}
              />
            ) : (
              <div className="map-placeholder">
                <div className="map-info">
                  <h3>高德地图</h3>
                  <p>位置：{enhancedScenicData.location}</p>
                  <p>坐标：{enhancedScenicData.coordinates.longitude}, {enhancedScenicData.coordinates.latitude}</p>
                  <p className="map-note">注：高德地图API未加载，请检查网络连接</p>
                </div>
              </div>
            )}
          </div>
        }
        closeOnMaskClick
        onClose={() => setMapModalVisible(false)}
        actions={[
          {
            key: 'close',
            text: '关闭',
            onClick: () => setMapModalVisible(false)
          }
        ]}
      />
    </div>
  );
};

export default ScenicDetail;