import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  Card,
  List,
  Avatar,
  Tag,
  Rate,
  Button,
  Dialog,
  Form,
  Input,
  TextArea,
  Selector,
  Toast,
  InfiniteScroll,
  DotLoading,
  Empty,
  Tabs
} from 'antd-mobile';
import {
  StarFill,
  EditSOutline,
  EnvironmentOutline,
  UserOutline,
  ClockCircleOutline
} from 'antd-mobile-icons';
import './index.css';

const Reviews = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: '轮椅用户王先生',
      avatar: '',
      userType: 'wheelchair',
      scenic: '故宫博物院',
      rating: 4,
      content: '大部分区域轮椅可达，工作人员很热心帮助。太和殿有电梯，但排队时间较长。建议错峰游览。',
      images: [],
      facilities: ['轮椅通道', '无障碍厕所', '电梯'],
      helpful: 23,
      time: '2小时前',
      isHelpful: false
    },
    {
      id: 2,
      user: '视障朋友李女士',
      avatar: '',
      userType: 'visual',
      scenic: '颐和园',
      rating: 5,
      content: '导盲犬可以进入，有语音导览设备。工作人员专门为我介绍了触摸体验区域，非常贴心。',
      images: [],
      facilities: ['语音导览', '导盲犬友好', '触摸体验'],
      helpful: 18,
      time: '5小时前',
      isHelpful: true
    },
    {
      id: 3,
      user: '听障游客张同学',
      avatar: '',
      userType: 'hearing',
      scenic: '上海迪士尼乐园',
      rating: 5,
      content: '有手语翻译服务，所有项目都有文字说明。工作人员会用手势和文字与我们交流，体验很棒！',
      images: [],
      facilities: ['手语服务', '文字说明', '视觉提示'],
      helpful: 35,
      time: '1天前',
      isHelpful: false
    }
  ]);
  const [hasMore, setHasMore] = useState(true);

  // 残疾类型映射
  const userTypeMap = {
    wheelchair: { text: '轮椅用户', color: '#1890ff' },
    visual: { text: '视障人士', color: '#52c41a' },
    hearing: { text: '听障人士', color: '#fa8c16' },
    cognitive: { text: '认知障碍', color: '#722ed1' },
    elderly: { text: '老年人', color: '#13c2c2' }
  };

  // 过滤评价
  const getFilteredReviews = () => {
    if (activeTab === 'all') return reviews;
    return reviews.filter(review => review.userType === activeTab);
  };

  // 点赞评价
  const handleHelpful = (reviewId) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              helpful: review.isHelpful ? review.helpful - 1 : review.helpful + 1,
              isHelpful: !review.isHelpful 
            }
          : review
      )
    );
  };

  // 提交评价
  const handleSubmitReview = (values) => {
    const newReview = {
      id: Date.now(),
      user: '匿名用户',
      avatar: '',
      userType: values.userType,
      scenic: values.scenic,
      rating: values.rating,
      content: values.content,
      facilities: values.facilities || [],
      helpful: 0,
      time: '刚刚',
      isHelpful: false
    };

    setReviews([newReview, ...reviews]);
    setReviewFormVisible(false);
    Toast.show({
      icon: 'success',
      content: '评价提交成功',
    });
  };

  // 加载更多评价
  const loadMore = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasMore(false);
  };

  const filteredReviews = getFilteredReviews();

  return (
    <div className="reviews-container">
      <NavBar 
        onBack={() => navigate(-1)}
        right={
          <Button 
            size="small" 
            color="primary"
            onClick={() => setReviewFormVisible(true)}
          >
            <EditSOutline /> 写评价
          </Button>
        }
      >
        用户评价
      </NavBar>

      {/* 标签页筛选 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.Tab title="全部" key="all" />
        <Tabs.Tab title="轮椅用户" key="wheelchair" />
        <Tabs.Tab title="视障人士" key="visual" />
        <Tabs.Tab title="听障人士" key="hearing" />
        <Tabs.Tab title="认知障碍" key="cognitive" />
        <Tabs.Tab title="老年人" key="elderly" />
      </Tabs>

      {/* 评价列表 */}
      {filteredReviews.length > 0 ? (
        <div className="reviews-list">
          {filteredReviews.map(review => (
            <Card key={review.id} className="review-card">
              <div className="review-header">
                <div className="user-info">
                  <Avatar size={40}>
                    {review.user.charAt(0)}
                  </Avatar>
                  <div className="user-details">
                    <div className="user-name">{review.user}</div>
                    <Tag 
                      color={userTypeMap[review.userType]?.color}
                      size="small"
                    >
                      {userTypeMap[review.userType]?.text}
                    </Tag>
                  </div>
                </div>
                <div className="review-meta">
                  <Rate 
                    value={review.rating} 
                    readOnly 
                    size={16}
                    character={<StarFill />}
                  />
                  <div className="review-time">
                    <ClockCircleOutline fontSize={12} />
                    {review.time}
                  </div>
                </div>
              </div>

              <div className="review-scenic">
                <EnvironmentOutline />
                <span>{review.scenic}</span>
              </div>

              <div className="review-content">
                {review.content}
              </div>

              {review.facilities.length > 0 && (
                <div className="review-facilities">
                  <div className="facilities-label">体验设施：</div>
                  <div className="facilities-tags">
                    {review.facilities.map((facility, index) => (
                      <Tag key={index} color="primary" size="small">
                        {facility}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              <div className="review-actions">
                <Button 
                  size="small"
                  color={review.isHelpful ? 'primary' : 'default'}
                  onClick={() => handleHelpful(review.id)}
                >
                  👍 有用 ({review.helpful})
                </Button>
              </div>
            </Card>
          ))}

          <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
            {hasMore ? (
              <>
                <span>加载中</span>
                <DotLoading />
              </>
            ) : (
              <span>没有更多了</span>
            )}
          </InfiniteScroll>
        </div>
      ) : (
        <Empty description="暂无评价" />
      )}

      {/* 写评价弹窗 */}
      <Dialog
        visible={reviewFormVisible}
        title="写评价"
        content={
          <Form
            layout="vertical"
            onFinish={handleSubmitReview}
            footer={
              <>
                <Button onClick={() => setReviewFormVisible(false)}>
                  取消
                </Button>
                <Button type="submit" color="primary">
                  提交评价
                </Button>
              </>
            }
          >
            <Form.Item name="scenic" label="景点名称" rules={[{ required: true }]}>
              <Input placeholder="请输入景点名称" />
            </Form.Item>

            <Form.Item name="userType" label="用户类型" rules={[{ required: true }]}>
              <Selector
                options={[
                  { label: '轮椅用户', value: 'wheelchair' },
                  { label: '视障人士', value: 'visual' },
                  { label: '听障人士', value: 'hearing' },
                  { label: '认知障碍', value: 'cognitive' },
                  { label: '老年人', value: 'elderly' }
                ]}
              />
            </Form.Item>

            <Form.Item name="rating" label="总体评分" rules={[{ required: true }]}>
              <Rate />
            </Form.Item>

            <Form.Item name="content" label="评价内容" rules={[{ required: true }]}>
              <TextArea 
                placeholder="请详细描述您的无障碍体验"
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item name="facilities" label="体验设施">
              <Selector
                multiple
                options={[
                  { label: '轮椅通道', value: '轮椅通道' },
                  { label: '无障碍厕所', value: '无障碍厕所' },
                  { label: '电梯', value: '电梯' },
                  { label: '语音导览', value: '语音导览' },
                  { label: '手语服务', value: '手语服务' },
                  { label: '盲道', value: '盲道' },
                  { label: '扶手', value: '扶手' },
                  { label: '休息座椅', value: '休息座椅' }
                ]}
              />
            </Form.Item>
          </Form>
        }
        onClose={() => setReviewFormVisible(false)}
      />
    </div>
  );
};

export default Reviews; 