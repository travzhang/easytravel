import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, CardBody, Chip } from '@material-tailwind/react';
import {
  HeartIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
} from '@heroicons/react/24/solid';

import PersonalInfoCard from './components/PersonalInfoCard';

const MyProfile = () => {
  const navigate = useNavigate();

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 个人信息卡片 */}
      <PersonalInfoCard />

      {/* 功能导航卡片 - Airbnb风格 */}
      <div className="px-4 py-4">
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardBody className="p-0">
            {/* 我的收藏 */}
            <div
              className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-b border-gray-100"
              onClick={() => handleNavigate('favorites')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <Typography
                    variant="h6"
                    color="blue-gray"
                    className="font-semibold"
                  >
                    我的收藏
                  </Typography>
                  <Typography variant="small" color="gray" className="mt-1">
                    查看收藏的景区和景点
                  </Typography>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Chip
                  value="12"
                  size="sm"
                  color="red"
                  className="rounded-full"
                />
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* 我的评价 */}
            <div
              className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-b border-gray-100"
              onClick={() => handleNavigate('reviews')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                  <StarSolidIcon className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <Typography
                    variant="h6"
                    color="blue-gray"
                    className="font-semibold"
                  >
                    我的评价
                  </Typography>
                  <Typography variant="small" color="gray" className="mt-1">
                    查看我发布的评价和评分
                  </Typography>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Chip
                  value="8"
                  size="sm"
                  color="amber"
                  className="rounded-full"
                />
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* 我的反馈 */}
            <div
              className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() => handleNavigate('feedback')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <Typography
                    variant="h6"
                    color="blue-gray"
                    className="font-semibold"
                  >
                    我的反馈
                  </Typography>
                  <Typography variant="small" color="gray" className="mt-1">
                    查看提交的问题反馈
                  </Typography>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Chip
                  value="3"
                  size="sm"
                  color="blue"
                  className="rounded-full"
                />
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
