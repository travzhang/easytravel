import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  IconButton,
  Card,
  CardBody,
  Chip,
  Rating,
} from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

const MyReviewsPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/profile');
  };

  const reviews = [
    {
      id: 1,
      scenicName: '上海迪士尼乐园',
      location: '上海市浦东新区',
      rating: 5,
      content:
        '无障碍设施非常完善，轮椅租赁服务很贴心，工作人员态度也很好。园区内的无障碍通道设计合理，让我们玩得很开心！',
      images: [],
      date: '2024-01-15',
      likes: 12,
      helpful: 8,
      status: 'published', // 已发布
      reviewNote: null
    },
    {
      id: 2,
      scenicName: '故宫博物院',
      location: '北京市东城区',
      rating: 4,
      content:
        '文化底蕴深厚，无障碍通道基本覆盖主要区域，但部分古建筑区域还是有些不便。建议提前了解路线规划。',
      images: [
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=100&h=100&fit=crop',
      ],
      date: '2024-01-10',
      likes: 8,
      helpful: 5,
      status: 'reviewing', // 审核中
      reviewNote: null
    },
    {
      id: 3,
      scenicName: '上海动物园',
      location: '上海市长宁区',
      rating: 5,
      content:
        '非常适合亲子游，动物种类丰富，无障碍设施完善，孩子们玩得很开心。园区地图上清楚标注了无障碍路线。',
      images: [],
      date: '2024-01-08',
      likes: 0,
      helpful: 0,
      status: 'rejected', // 未通过
      reviewNote: '评价内容需要更加详细，请补充具体的无障碍设施使用体验。'
    },
    {
      id: 4,
      scenicName: '外滩观光隧道',
      location: '上海市黄浦区',
      rating: 3,
      content:
        '隧道内的无障碍设施基本完善，但是人流量大的时候比较拥挤，轮椅通行有些困难。',
      images: [],
      date: '2024-01-05',
      likes: 0,
      helpful: 0,
      status: 'reviewing', // 审核中
      reviewNote: null
    }
  ];

  // 获取状态信息
  const getStatusInfo = (status) => {
    switch (status) {
      case 'published':
        return {
          label: '已发布',
          color: 'green',
          icon: <CheckCircleIcon className="h-4 w-4" />
        };
      case 'reviewing':
        return {
          label: '审核中',
          color: 'orange',
          icon: <ClockIcon className="h-4 w-4" />
        };
      case 'rejected':
        return {
          label: '未通过',
          color: 'red',
          icon: <XCircleIcon className="h-4 w-4" />
        };
      default:
        return {
          label: '未知',
          color: 'gray',
          icon: null
        };
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
              我的评价
            </Typography>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 py-6">
        <div className="space-y-6">
          {reviews.map((review) => {
            const statusInfo = getStatusInfo(review.status);
            
            return (
              <Card
                key={review.id}
                className="shadow-md border-0 rounded-xl overflow-hidden"
              >
                <CardBody className="p-6">
                  {/* 景区信息和状态 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Typography
                          variant="h6"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {review.scenicName}
                        </Typography>
                        <Chip
                          value={statusInfo.label}
                          size="sm"
                          color={statusInfo.color}
                          icon={statusInfo.icon}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
                        <Typography variant="small" color="gray">
                          {review.location}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* 评分和日期 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Rating
                        value={review.rating}
                        readonly
                        className="text-amber-500"
                      />
                      <Typography variant="small" color="gray" className="ml-2">
                        {review.rating} 分
                      </Typography>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-500 mr-1" />
                      <Typography variant="small" color="gray">
                        {review.date}
                      </Typography>
                    </div>
                  </div>

                  {/* 评价内容 */}
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="leading-relaxed mb-4"
                  >
                    {review.content}
                  </Typography>

                  {/* 评价图片 */}
                  {review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`评价图片${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* 审核备注 */}
                  {review.status === 'rejected' && review.reviewNote && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <XCircleIcon className="h-4 w-4 text-red-600 mr-2" />
                        <Typography variant="small" color="red" className="font-medium">
                          审核未通过原因
                        </Typography>
                      </div>
                      <Typography variant="small" color="red" className="leading-relaxed">
                        {review.reviewNote}
                      </Typography>
                    </div>
                  )}

                  {/* 互动数据 - 只有已发布的评价才显示 */}
                  {review.status === 'published' && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <Typography variant="small" color="gray">
                            👍 {review.likes} 赞
                          </Typography>
                        </div>
                        <div className="flex items-center">
                          <Typography variant="small" color="gray">
                            💡 {review.helpful} 人觉得有用
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 审核中状态提示 */}
                  {review.status === 'reviewing' && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mt-4 rounded-r-lg">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-orange-600 mr-2" />
                        <Typography variant="small" color="orange" className="font-medium">
                          您的评价正在审核中，审核通过后将公开显示
                        </Typography>
                      </div>
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

export default MyReviewsPage;
