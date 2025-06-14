import React from 'react';
import {
  Typography,
  Card,
  CardBody,
  Avatar,
  Button,
  IconButton,
  Chip,
} from '@material-tailwind/react';
import {
  PencilIcon,
  Cog6ToothIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const PersonalInfoCard = () => {
  const navigate = useNavigate();
  return (
    <div className="relative">
      {/* 背景渐变 - Airbnb风格 */}
      <div className="h-32 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500"></div>

      {/* 个人信息卡片 */}
      <div className="px-4 -mt-16 pb-4">
        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {/* 头像 */}
                <div className="relative">
                  <Avatar
                    src="/cat.jpg"
                    alt="用户头像"
                    size="xl"
                    className="border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                {/* 基本信息 */}
                <div className="flex-1">
                  <Typography
                    variant="h4"
                    color="blue-gray"
                    className="font-bold mb-1"
                  >
                    张小明
                  </Typography>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="small" color="gray">
                      上海市浦东新区
                    </Typography>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <Typography variant="small" color="gray">
                      加入于 2023年3月
                    </Typography>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-2">
                <IconButton variant="text" size="sm" className="rounded-full">
                  <PencilIcon className="h-5 w-5" />
                </IconButton>
                <IconButton
                  variant="text"
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate('/settings')}
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                </IconButton>
              </div>
            </div>

            {/* 个人简介 */}
            <Typography
              variant="small"
              color="gray"
              className="mb-4 leading-relaxed"
            >
              热爱旅行的无障碍出行倡导者，致力于为更多人提供便利的旅行体验。
            </Typography>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Chip
                value="无障碍出行"
                size="sm"
                color="blue"
                className="rounded-full"
              />
              <Chip
                value="旅行达人"
                size="sm"
                color="green"
                className="rounded-full"
              />
              <Chip
                value="摄影爱好者"
                size="sm"
                color="purple"
                className="rounded-full"
              />
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <Typography
                  variant="h5"
                  color="blue-gray"
                  className="font-bold"
                >
                  23
                </Typography>
                <Typography variant="small" color="gray">
                  已访问景区
                </Typography>
              </div>
              <div className="text-center">
                <Typography
                  variant="h5"
                  color="blue-gray"
                  className="font-bold"
                >
                  12
                </Typography>
                <Typography variant="small" color="gray">
                  收藏景区
                </Typography>
              </div>
              <div className="text-center">
                <Typography
                  variant="h5"
                  color="blue-gray"
                  className="font-bold"
                >
                  4.8
                </Typography>
                <Typography variant="small" color="gray">
                  平均评分
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PersonalInfoCard;
