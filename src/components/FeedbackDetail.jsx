import React from 'react';
import { Card, Tag, Space, Image, Button, Dialog } from 'antd-mobile';
import {
  EnvironmentOutline,
  ClockCircleOutline,
  ExclamationCircleOutline,
  CheckCircleOutline,
  CloseCircleOutline
} from 'antd-mobile-icons';
import { updateFeedbackStatus, deleteFeedback } from '../services/feedbackService';
import './FeedbackDetail.css';

/**
 * 反馈详情组件
 * @param {Object} props - 组件属性
 * @param {Object} props.feedback - 反馈数据
 * @param {boolean} props.isAdmin - 是否为管理员
 * @param {Function} props.onStatusChange - 状态变更回调
 * @param {Function} props.onDelete - 删除回调
 * @param {Function} props.onClose - 关闭回调
 */
const FeedbackDetail = ({
  feedback,
  isAdmin = false,
  onStatusChange,
  onDelete,
  onClose
}) => {
  if (!feedback) {
    return null;
  }

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 获取状态标签
  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="warning">待处理</Tag>;
      case 'processing':
        return <Tag color="primary">处理中</Tag>;
      case 'resolved':
        return <Tag color="success">已解决</Tag>;
      case 'rejected':
        return <Tag color="danger">已驳回</Tag>;
      default:
        return <Tag color="default">未知状态</Tag>;
    }
  };

  // 获取问题类型标签
  const getTypeTag = (type) => {
    switch (type) {
      case 'facility':
        return <Tag color="primary">设施问题</Tag>;
      case 'route':
        return <Tag color="success">路线问题</Tag>;
      case 'service':
        return <Tag color="warning">服务问题</Tag>;
      default:
        return <Tag color="default">其他问题</Tag>;
    }
  };

  // 获取严重程度标签
  const getSeverityTag = (severity) => {
    let color = 'default';
    let text = '未知';
    
    switch (severity) {
      case 1:
        color = '#52c41a';
        text = '轻微';
        break;
      case 2:
        color = '#1890ff';
        text = '较轻';
        break;
      case 3:
        color = '#faad14';
        text = '一般';
        break;
      case 4:
        color = '#fa8c16';
        text = '严重';
        break;
      case 5:
        color = '#f5222d';
        text = '非常严重';
        break;
      default:
        break;
    }

    return (
      <div className="severity-tag" style={{ backgroundColor: color }}>
        <span>严重程度: {text}</span>
      </div>
    );
  };

  // 处理状态变更
  const handleStatusChange = async (newStatus) => {
    try {
      await updateFeedbackStatus(feedback.id, { status: newStatus });
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      Dialog.alert({
        content: '更新状态失败，请稍后重试',
      });
    }
  };

  // 处理删除
  const handleDelete = async () => {
    const result = await Dialog.confirm({
      content: '确定要删除这条反馈吗？',
      confirmText: '删除',
      cancelText: '取消',
    });

    if (result) {
      try {
        await deleteFeedback(feedback.id);
        
        if (onDelete) {
          onDelete();
        }
      } catch (error) {
        console.error('删除反馈失败:', error);
        Dialog.alert({
          content: '删除失败，请稍后重试',
        });
      }
    }
  };

  return (
    <div className="feedback-detail-container">
      <Card className="feedback-detail-card">
        <div className="feedback-detail-header">
          <div className="feedback-detail-tags">
            {getTypeTag(feedback.type)}
            {getStatusTag(feedback.status)}
            {getSeverityTag(feedback.severity)}
          </div>
          <div className="feedback-detail-time">
            <ClockCircleOutline /> {formatDate(feedback.createdAt)}
          </div>
        </div>

        <div className="feedback-detail-location">
          <EnvironmentOutline /> {feedback.location}
        </div>

        <div className="feedback-detail-description">
          <h3>问题描述</h3>
          <p>{feedback.description}</p>
        </div>

        {feedback.images && feedback.images.length > 0 && (
          <div className="feedback-detail-images">
            <h3>问题照片</h3>
            <Space wrap>
              {feedback.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  width={100}
                  height={100}
                  fit="cover"
                  style={{ borderRadius: 8 }}
                />
              ))}
            </Space>
          </div>
        )}

        {feedback.adminComment && (
          <div className="feedback-detail-comment">
            <h3>处理备注</h3>
            <p>{feedback.adminComment}</p>
          </div>
        )}

        {/* 管理员操作按钮 */}
        {isAdmin && (
          <div className="feedback-detail-actions">
            <h3>管理操作</h3>
            <Space wrap>
              {feedback.status === 'pending' && (
                <Button
                  color="primary"
                  onClick={() => handleStatusChange('processing')}
                >
                  <Space>
                    <ExclamationCircleOutline />
                    <span>开始处理</span>
                  </Space>
                </Button>
              )}
              
              {(feedback.status === 'pending' || feedback.status === 'processing') && (
                <Button
                  color="success"
                  onClick={() => handleStatusChange('resolved')}
                >
                  <Space>
                    <CheckCircleOutline />
                    <span>标记已解决</span>
                  </Space>
                </Button>
              )}
              
              {(feedback.status === 'pending' || feedback.status === 'processing') && (
                <Button
                  color="danger"
                  onClick={() => handleStatusChange('rejected')}
                >
                  <Space>
                    <CloseCircleOutline />
                    <span>驳回</span>
                  </Space>
                </Button>
              )}
              
              <Button onClick={handleDelete}>删除</Button>
            </Space>
          </div>
        )}

        <div className="feedback-detail-footer">
          <Button block onClick={onClose}>
            关闭
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FeedbackDetail;
