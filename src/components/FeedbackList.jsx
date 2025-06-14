import React from 'react';
import { List, Tag, Empty, InfiniteScroll, DotLoading, Image, Space } from 'antd-mobile';
import { EnvironmentOutline, ClockCircleOutline, ExclamationCircleOutline } from 'antd-mobile-icons';
import './FeedbackList.css';

/**
 * 反馈状态标签
 * @param {string} status - 反馈状态
 * @returns {JSX.Element} - 状态标签
 */
const StatusTag = ({ status }) => {
  let color = 'default';
  let text = '未知状态';

  switch (status) {
    case 'pending':
      color = 'warning';
      text = '待处理';
      break;
    case 'processing':
      color = 'primary';
      text = '处理中';
      break;
    case 'resolved':
      color = 'success';
      text = '已解决';
      break;
    case 'rejected':
      color = 'danger';
      text = '已驳回';
      break;
    default:
      break;
  }

  return <Tag color={color}>{text}</Tag>;
};

/**
 * 问题类型标签
 * @param {string} type - 问题类型
 * @returns {JSX.Element} - 类型标签
 */
const TypeTag = ({ type }) => {
  let color = 'default';
  let text = '其他问题';

  switch (type) {
    case 'facility':
      color = 'primary';
      text = '设施问题';
      break;
    case 'route':
      color = 'success';
      text = '路线问题';
      break;
    case 'service':
      color = 'warning';
      text = '服务问题';
      break;
    default:
      break;
  }

  return <Tag color={color}>{text}</Tag>;
};

/**
 * 严重程度标签
 * @param {number} severity - 严重程度 1-5
 * @returns {JSX.Element} - 严重程度标签
 */
const SeverityTag = ({ severity }) => {
  let color = 'default';
  
  switch (severity) {
    case 1:
      color = '#52c41a';
      break;
    case 2:
      color = '#1890ff';
      break;
    case 3:
      color = '#faad14';
      break;
    case 4:
      color = '#fa8c16';
      break;
    case 5:
      color = '#f5222d';
      break;
    default:
      break;
  }

  return (
    <div className="severity-tag" style={{ backgroundColor: color }}>
      <span>严重程度 {severity}</span>
    </div>
  );
};

/**
 * 反馈列表组件
 * @param {Object} props - 组件属性
 * @param {Array} props.feedbacks - 反馈列表数据
 * @param {boolean} props.hasMore - 是否有更多数据
 * @param {Function} props.loadMore - 加载更多数据的函数
 * @param {Function} props.onItemClick - 点击列表项的回调
 * @param {boolean} props.loading - 是否正在加载
 */
const FeedbackList = ({
  feedbacks = [],
  hasMore = false,
  loadMore,
  onItemClick,
  loading = false
}) => {
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 如果没有数据且不在加载中，显示空状态
  if (feedbacks.length === 0 && !loading) {
    return (
      <Empty
        className="feedback-empty"
        image={<ExclamationCircleOutline style={{ fontSize: 48 }} />}
        description="暂无反馈记录"
      />
    );
  }

  return (
    <div className="feedback-list-container">
      <List>
        {feedbacks.map((feedback) => (
          <List.Item
            key={feedback.id}
            onClick={() => onItemClick && onItemClick(feedback)}
            arrow
            clickable
          >
            <div className="feedback-item">
              <div className="feedback-header">
                <div className="feedback-tags">
                  <TypeTag type={feedback.type} />
                  <StatusTag status={feedback.status} />
                  <SeverityTag severity={feedback.severity} />
                </div>
                <div className="feedback-time">
                  <ClockCircleOutline /> {formatDate(feedback.createdAt)}
                </div>
              </div>
              
              <div className="feedback-location">
                <EnvironmentOutline /> {feedback.location}
              </div>
              
              <div className="feedback-description">
                {feedback.description}
              </div>
              
              {feedback.images && feedback.images.length > 0 && (
                <div className="feedback-images">
                  <Space wrap>
                    {feedback.images.slice(0, 3).map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        width={80}
                        height={80}
                        fit="cover"
                        style={{ borderRadius: 4 }}
                      />
                    ))}
                  </Space>
                </div>
              )}
            </div>
          </List.Item>
        ))}
      </List>
      
      {/* 无限滚动加载 */}
      {loadMore && (
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
          {(hasMore) => {
            return (
              <div className="infinite-scroll-content">
                {hasMore ? (
                  <>
                    <span>加载中</span>
                    <DotLoading />
                  </>
                ) : (
                  <span>没有更多了</span>
                )}
              </div>
            );
          }}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default FeedbackList;
