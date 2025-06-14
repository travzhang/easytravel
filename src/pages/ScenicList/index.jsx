import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  SearchBar,
  Card,
  Tag,
  Image,
  Space,
  Selector,
  Badge,
  Grid,
  Button
} from 'antd-mobile';
import {
  EnvironmentOutline,
  StarFill,
  FilterOutline
} from 'antd-mobile-icons';
import shanghaiScenicService from '../../services/shanghaiScenicService';
import './index.css';

const ScenicList = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [allScenics, setAllScenics] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载上海景点数据
  useEffect(() => {
    const loadScenics = () => {
      try {
        const scenics = shanghaiScenicService.getShanghaiScenics();
        // 转换数据格式以适配现有UI
        const formattedScenics = scenics.map((scenic, index) => ({
          id: index + 1,
          scenicId: scenic.id, // 保存原始ID用于路由
          name: scenic.name,
          image: scenic.image,
          location: scenic.location,
          rating: scenic.estimatedRating,
          accessibilityRating: scenic.estimatedRating,
          accessibilityLevel: scenic.accessibilityLevel,
          tags: scenic.tags,
          reviews: Math.floor(Math.random() * 200) + 50, // 模拟评价数
          accessibilityReviews: Math.floor(Math.random() * 100) + 30, // 模拟无障碍评价数
          distance: `${(Math.random() * 20 + 1).toFixed(1)}km`, // 模拟距离
          openTime: scenic.openTime,
          price: scenic.price,
          facilities: ['无障碍通道', '轮椅租借', '无障碍厕所'], // 通用设施
          accessibilityFeatures: getAccessibilityFeatures(scenic.accessibilityLevel)
        }));
        setAllScenics(formattedScenics);
      } catch (error) {
        console.error('加载景点数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScenics();
  }, []);

  // 根据无障碍等级获取特色功能
  const getAccessibilityFeatures = (level) => {
    switch (level) {
      case 'A':
        return ['全程无障碍', '轮椅通道', '语音导览', '盲道完善'];
      case 'B+':
        return ['部分无障碍', '坡道入口', '无障碍厕所'];
      case 'B':
        return ['基础无障碍', '轮椅可达'];
      default:
        return ['待完善'];
    }
  };



  // 筛选选项（适配上海景点）
  const filterOptions = [
    { label: 'A级无障碍', value: 'A' },
    { label: 'B+级无障碍', value: 'B+' },
    { label: 'B级无障碍', value: 'B' },
    { label: '免费景点', value: 'free' },
    { label: '城市公园', value: 'park' },
    { label: '动物园', value: 'zoo' },
    { label: '植物园', value: 'garden' },
    { label: '历史文化', value: 'culture' },
    { label: '自然生态', value: 'nature' },
    { label: '亲子游', value: 'family' }
  ];

  // 过滤景点
  const getFilteredScenics = () => {
    let filtered = allScenics;

    // 搜索关键词过滤
    if (searchKeyword) {
      filtered = filtered.filter(scenic =>
        scenic.name.includes(searchKeyword) ||
        scenic.location.includes(searchKeyword) ||
        scenic.tags.some(tag => tag.includes(searchKeyword))
      );
    }

    // 筛选条件过滤
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(scenic => {
        return selectedFilters.some(filter => {
          switch (filter) {
            case 'A':
            case 'B+':
            case 'B':
              return scenic.accessibilityLevel === filter;
            case 'free':
              return scenic.price === '免费';
            case 'park':
              return scenic.tags.includes('城市公园') || scenic.tags.includes('公园');
            case 'zoo':
              return scenic.tags.includes('动物园');
            case 'garden':
              return scenic.tags.includes('植物园');
            case 'culture':
              return scenic.tags.includes('历史文化') || scenic.tags.includes('文化') || scenic.tags.includes('历史公园') || scenic.tags.includes('古典园林');
            case 'nature':
              return scenic.tags.includes('自然生态') || scenic.tags.includes('森林公园') || scenic.tags.includes('自然');
            case 'family':
              return scenic.tags.includes('亲子') || scenic.tags.includes('科普教育') || scenic.tags.includes('科普');
            default:
              return false;
          }
        });
      });
    }

    return filtered;
  };

  const filteredScenics = getFilteredScenics();

  return (
    <div className="scenic-list-container">
      <NavBar onBack={() => navigate(-1)}>上海景点列表</NavBar>

      {/* 加载状态 */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '14px',
          color: '#999'
        }}>
          正在加载上海景点数据...
        </div>
      )}

      {/* 搜索栏 */}
      <div className="search-section">
        <SearchBar
          placeholder="搜索景点名称或位置"
          value={searchKeyword}
          onChange={setSearchKeyword}
          showCancelButton
        />
      </div>

      {/* 筛选器 */}
      <div className="filter-section">
        <div className="filter-header">
          <FilterOutline /> 筛选条件
        </div>
        <Selector
          columns={3}
          multiple
          value={selectedFilters}
          onChange={setSelectedFilters}
          options={filterOptions}
        />
      </div>

      {/* 结果统计 */}
      <div className="result-stats">
        找到 {filteredScenics.length} 个景点
        {selectedFilters.length > 0 && (
          <Button
            size="mini"
            fill="none"
            onClick={() => setSelectedFilters([])}
          >
            清除筛选
          </Button>
        )}
      </div>

      {/* 景点列表 */}
      <div className="scenic-cards">
        {filteredScenics.map(scenic => (
          <Card
            key={scenic.id}
            className="scenic-card accessibility-focused"
            onClick={() => {
              // 如果是上海动物园，跳转到专门的地图页面
              if (scenic.scenicId === 'shanghai-zoo') {
                navigate('/zoo-map');
              } else {
                // 其他景点跳转到通用地图页面，传递景点ID
                navigate(`/scenic-map/${scenic.scenicId}`);
              }
            }}
          >
            <div className="scenic-card-content">
              <div className="scenic-image">
                <Image src={scenic.image} alt={scenic.name} />
                <div className={`accessibility-badge level-${scenic.accessibilityLevel.replace('+', 'plus')}`}>
                  ♿ {scenic.accessibilityLevel}
                </div>
              </div>
              
              <div className="scenic-content">
                <div className="scenic-header">
                  <h4 className="scenic-name">{scenic.name}</h4>
                  <span className="scenic-distance">{scenic.distance}</span>
                </div>
                
                <div className="accessibility-highlight">
                  <div className="accessibility-score">
                    <span className="score-label">无障碍评分</span>
                    <div className="score-value">
                      <StarFill style={{ color: '#52c41a' }} /> 
                      <span>{scenic.accessibilityRating}</span>
                    </div>
                    <div className="features-list">
                      {scenic.accessibilityFeatures.slice(0, 2).map((feature, index) => (
                        <span key={index} className="accessibility-feature-tag">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="accessibility-reviews">
                    {scenic.accessibilityReviews}人评价
                  </div>
                </div>

                <div className="scenic-location">
                  <EnvironmentOutline />
                  <span>{scenic.location}</span>
                </div>
                
                <div className="scenic-meta">
                  <div className="scenic-rating">
                    <StarFill /> {scenic.rating}
                  </div>
                  <div className="scenic-reviews">{scenic.reviews}条评价</div>
                  <div className="scenic-price">{scenic.price}</div>
                </div>
                
                <div className="scenic-info">
                  <span className="scenic-time">⏰ {scenic.openTime}</span>
                </div>
                
                <div className="scenic-tags">
                  {scenic.tags.slice(0, 2).map((tag, index) => (
                    <Tag key={index} size="small" color={tag.includes('无障碍') ? 'success' : 'default'}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredScenics.length === 0 && (
        <div className="no-results">
          <p>😔 没有找到符合条件的景点</p>
          <p>请尝试调整搜索关键词或筛选条件</p>
        </div>
      )}
    </div>
  );
};

export default ScenicList; 