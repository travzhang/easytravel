import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  IconButton,
  Card,
  CardBody,
  Chip,
} from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  HeartIcon,
  MapPinIcon,
  StarIcon,
} from '@heroicons/react/24/solid';

const MyFavoritesPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/profile');
  };

  const favorites = [
    {
      id: 1,
      name: '上海迪士尼乐园',
      location: '上海市浦东新区',
      image:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
      rating: 4.8,
      accessibilityLevel: 'A',
      tags: ['主题乐园', '全程无障碍'],
      savedDate: '2024-01-15',
    },
    {
      id: 2,
      name: '故宫博物院',
      location: '北京市东城区',
      image:
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=300&h=200&fit=crop',
      rating: 4.7,
      accessibilityLevel: 'B+',
      tags: ['文化遗产', '轮椅通道'],
      savedDate: '2024-01-10',
    },
    {
      id: 3,
      name: '上海动物园',
      location: '上海市长宁区',
      image:
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=300&h=200&fit=crop',
      rating: 4.5,
      accessibilityLevel: 'A',
      tags: ['动物园', '亲子'],
      savedDate: '2024-01-08',
    },
  ];

  const getAccessibilityColor = (level) => {
    switch (level) {
      case 'A':
        return 'green';
      case 'B+':
        return 'blue';
      case 'B':
        return 'orange';
      case 'C':
        return 'red';
      default:
        return 'gray';
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
              我的收藏
            </Typography>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 py-6">
        <div className="space-y-4">
          {favorites.map((item) => (
            <Card
              key={item.id}
              className="shadow-md border-0 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <CardBody className="p-0">
                <div className="flex">
                  {/* 图片 */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <IconButton
                        size="sm"
                        color="red"
                        className="rounded-full bg-white/90 text-red-500"
                      >
                        <HeartIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Typography
                        variant="h6"
                        color="blue-gray"
                        className="font-semibold"
                      >
                        {item.name}
                      </Typography>
                      <Chip
                        value={`${item.accessibilityLevel}级`}
                        size="sm"
                        color={getAccessibilityColor(item.accessibilityLevel)}
                        className="rounded-full"
                      />
                    </div>

                    <div className="flex items-center mb-2">
                      <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
                      <Typography variant="small" color="gray">
                        {item.location}
                      </Typography>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-amber-500 mr-1" />
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-medium"
                        >
                          {item.rating}
                        </Typography>
                      </div>

                      <Typography variant="small" color="gray">
                        收藏于 {item.savedDate}
                      </Typography>
                    </div>

                    <div className="flex gap-1 mt-2">
                      {item.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          value={tag}
                          size="sm"
                          variant="ghost"
                          color="blue"
                          className="text-xs"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyFavoritesPage;
