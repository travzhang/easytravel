import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  NavBar, 
  Tabs, 
  List, 
  Image, 
  Tag, 
  Space, 
  Rate, 
  ProgressBar,
  Card,
  Grid
} from 'antd-mobile';
import { 
  EnvironmentOutline, 
  StarFill, 
  RightOutline,
  GlobalOutline,
  TravelOutline
} from 'antd-mobile-icons';
import { rankingList } from '../../mock/rankingData';
import './index.css';

const RankingList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('domestic');

  const handleBack = () => {
    navigate(-1);
  };

  const handleScenicClick = (id) => {
    navigate(`/scenic/${id}`);
  };

  // 根据无障碍等级获取颜色
  const getAccessibilityColor = (level) => {
    switch (level) {
      case 'A+':
        return '#52c41a';
      case 'A':
        return '#52c41a';
      case 'B+':
        return '#1890ff';
      case 'B':
        return '#1890ff';
      case 'C':
        return '#faad14';
      default:
        return '#d9d9d9';
    }
  };

  // 根据无障碍等级获取百分比
  const getAccessibilityPercentage = (level) => {
    switch (level) {
      case 'A+':
        return 100;
      case 'A':
        return 90;
      case 'B+':
        return 80;
      case 'B':
        return 70;
      case 'C':
        return 60;
      default:
        return 50;
    }
  };

  // 渲染排名标记
  const renderRankBadge = (index) => {
    if (index < 3) {
      return (
        <div className={`rank-badge rank-${index + 1}`}>
          {index + 1}
        </div>
      );
    }
    return (
      <div className="rank-badge rank-normal">
        {index + 1}
      </div>
    );
  };

  return (
    <div className="ranking-list-container">
      <NavBar onBack={handleBack}>无障碍景点排行榜</NavBar>

      {/* 排行榜说明卡片 */}
      <Card className="ranking-info-card">
        <div className="ranking-info-header">
          <GlobalOutline fontSize={24} />
          <h3>全球无障碍景点评级</h3>
        </div>
        <p>
          本排行榜基于用户反馈、设施完善度和无障碍体验评分，
          为行动不便人士提供参考。
        </p>
        <div className="rating-legend">
          <div className="legend-item">
            <Tag color="success">A+/A级</Tag>
            <span>设施完善，全程无障碍</span>
          </div>
          <div className="legend-item">
            <Tag color="primary">B+/B级</Tag>
            <span>主要区域无障碍，个别区域可能需要帮助</span>
          </div>
          <div className="legend-item">
            <Tag color="warning">C级</Tag>
            <span>部分区域无障碍，需要一定帮助</span>
          </div>
        </div>
      </Card>

      {/* 标签页 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.Tab title="国内景点" key="domestic">
          <List>
            {rankingList.domestic.map((item, index) => (
              <List.Item
                key={item.id}
                prefix={renderRankBadge(index)}
                onClick={() => handleScenicClick(item.id)}
                arrow={<RightOutline />}
              >
                <div className="ranking-item">
                  <Image
                    src={item.image}
                    width={80}
                    height={60}
                    fit="cover"
                    className="ranking-image"
                  />
                  <div className="ranking-content">
                    <div className="ranking-name">{item.name}</div>
                    <div className="ranking-location">
                      <EnvironmentOutline /> {item.location}
                    </div>
                    <div className="ranking-stats">
                      <div className="rating">
                        <StarFill fontSize={14} color="#f8c51c" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                      <Tag color="primary" fill="outline">
                        {item.visitCount}人去过
                      </Tag>
                    </div>
                    <div className="accessibility-level">
                      <div className="level-label">
                        无障碍等级: 
                        <Tag 
                          color={getAccessibilityColor(item.accessibilityLevel)} 
                          style={{ marginLeft: 8 }}
                        >
                          {item.accessibilityLevel}
                        </Tag>
                      </div>
                      <ProgressBar
                        percent={getAccessibilityPercentage(item.accessibilityLevel)}
                        strokeColor={getAccessibilityColor(item.accessibilityLevel)}
                      />
                    </div>
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        </Tabs.Tab>
        
        <Tabs.Tab title="国际景点" key="international">
          <List>
            {rankingList.international.map((item, index) => (
              <List.Item
                key={item.id}
                prefix={renderRankBadge(index)}
                onClick={() => handleScenicClick(item.id)}
                arrow={<RightOutline />}
              >
                <div className="ranking-item">
                  <Image
                    src={item.image}
                    width={80}
                    height={60}
                    fit="cover"
                    className="ranking-image"
                  />
                  <div className="ranking-content">
                    <div className="ranking-name">{item.name}</div>
                    <div className="ranking-location">
                      <EnvironmentOutline /> {item.location}
                    </div>
                    <div className="ranking-stats">
                      <div className="rating">
                        <StarFill fontSize={14} color="#f8c51c" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                      <Tag color="primary" fill="outline">
                        {item.visitCount}人去过
                      </Tag>
                    </div>
                    <div className="accessibility-level">
                      <div className="level-label">
                        无障碍等级: 
                        <Tag 
                          color={getAccessibilityColor(item.accessibilityLevel)} 
                          style={{ marginLeft: 8 }}
                        >
                          {item.accessibilityLevel}
                        </Tag>
                      </div>
                      <ProgressBar
                        percent={getAccessibilityPercentage(item.accessibilityLevel)}
                        strokeColor={getAccessibilityColor(item.accessibilityLevel)}
                      />
                    </div>
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        </Tabs.Tab>
      </Tabs>

      {/* 无障碍景点分类 */}
      <div className="category-section">
        <h3 className="section-title">按无障碍设施分类</h3>
        <Grid columns={2} gap={12}>
          <Grid.Item>
            <Card className="category-card" onClick={() => navigate('/category/wheelchair')}>
              <div className="category-icon">♿</div>
              <div className="category-name">轮椅友好景点</div>
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card className="category-card" onClick={() => navigate('/category/visual')}>
              <div className="category-icon">👁️</div>
              <div className="category-name">视障友好景点</div>
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card className="category-card" onClick={() => navigate('/category/hearing')}>
              <div className="category-icon">👂</div>
              <div className="category-name">听障友好景点</div>
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card className="category-card" onClick={() => navigate('/category/elderly')}>
              <div className="category-icon">🧓</div>
              <div className="category-name">适合老年人景点</div>
            </Card>
          </Grid.Item>
        </Grid>
      </div>
    </div>
  );
};

export default RankingList;
