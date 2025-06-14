import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  IconButton,
  Card,
  CardBody,
  Chip,
  Button,
} from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const MyFeedbackPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/profile');
  };

  const feedbacks = [
    {
      id: 1,
      title: '上海动物园无障碍洗手间位置标识不清',
      category: '设施问题',
      content: '在熊猫馆附近的无障碍洗手间标识不够明显，建议增加更清晰的指示牌。',
      status: 'resolved',
      date: '2024-01-15',
      response: '感谢您的反馈，我们已经在该区域增加了更明显的标识牌。',
      responseDate: '2024-01-18'
    },
    {
      id: 2,
      title: 'APP地图功能建议',
      category: '功能建议',
      content: '希望能在地图上显示实时的无障碍设施使用状态，比如无障碍电梯是否正常运行。',
      status: 'processing',
      date: '2024-01-12',
      response: null,
      responseDate: null
    },
    {
      id: 3,
      title: '语音导览音量问题',
      category: '技术问题',
      content: '语音导览在嘈杂环境下音量不够大，建议增加音量调节功能。',
      status: 'pending',
      date: '2024-01-10',
      response: null,
      responseDate: null
    }
  ];

  const getStatusInfo = (status) => {
    switch (status) {
      case 'resolved':
        return {
          label: '已解决',
          color: 'green',
          icon: <CheckCircleIcon className="h-4 w-4" />
        };
      case 'processing':
        return {
          label: '处理中',
          color: 'blue',
          icon: <ClockIcon className="h-4 w-4" />
        };
      case 'pending':
        return {
          label: '待处理',
          color: 'orange',
          icon: <ExclamationTriangleIcon className="h-4 w-4" />
        };
      default:
        return {
          label: '未知',
          color: 'gray',
          icon: <ChatBubbleLeftRightIcon className="h-4 w-4" />
        };
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case '设施问题': return 'red';
      case '功能建议': return 'blue';
      case '技术问题': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <IconButton
              variant="text"
              size="sm"
              onClick={handleBack}
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </IconButton>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              我的反馈
            </Typography>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6" color="blue-gray" className="font-semibold">
            反馈记录
          </Typography>
          <Button size="sm" color="blue" className="rounded-full">
            新建反馈
          </Button>
        </div>
        
        <div className="space-y-4">
          {feedbacks.map((feedback) => {
            const statusInfo = getStatusInfo(feedback.status);
            
            return (
              <Card key={feedback.id} className="shadow-md border-0 rounded-xl overflow-hidden">
                <CardBody className="p-6">
                  {/* 标题和状态 */}
                  <div className="flex items-start justify-between mb-3">
                    <Typography variant="h6" color="blue-gray" className="font-semibold flex-1 mr-4">
                      {feedback.title}
                    </Typography>
                    <Chip
                      value={statusInfo.label}
                      size="sm"
                      color={statusInfo.color}
                      icon={statusInfo.icon}
                      className="rounded-full"
                    />
                  </div>
                  
                  {/* 分类和日期 */}
                  <div className="flex items-center gap-4 mb-3">
                    <Chip
                      value={feedback.category}
                      size="sm"
                      color={getCategoryColor(feedback.category)}
                      variant="ghost"
                      className="rounded-full"
                    />
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-500 mr-1" />
                      <Typography variant="small" color="gray">
                        {feedback.date}
                      </Typography>
                    </div>
                  </div>
                  
                  {/* 反馈内容 */}
                  <Typography variant="small" color="blue-gray" className="leading-relaxed mb-4">
                    {feedback.content}
                  </Typography>
                  
                  {/* 回复内容 */}
                  {feedback.response && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center mb-2">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600 mr-2" />
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          官方回复
                        </Typography>
                        <Typography variant="small" color="gray" className="ml-auto">
                          {feedback.responseDate}
                        </Typography>
                      </div>
                      <Typography variant="small" color="blue-gray" className="leading-relaxed">
                        {feedback.response}
                      </Typography>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyFeedbackPage;
