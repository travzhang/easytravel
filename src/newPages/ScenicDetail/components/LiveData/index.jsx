import React from 'react';
import { Card, CardBody, Typography, Progress } from '@material-tailwind/react';
import { UserGroupIcon, SunIcon, ClockIcon } from '@heroicons/react/24/outline';

const LiveData = ({ liveData }) => {
  // 安全地获取数据，提供默认值
  const currentVisitors = liveData?.visitorCount || 0;
  const maxCapacity = liveData?.capacity || 1;
  const weather = liveData?.weather || {};
  const waitTime = liveData?.waitTime || {};

  const getVisitorDensity = () => {
    const percentage = (currentVisitors / maxCapacity) * 100;
    if (percentage < 30) return { text: '人流较少', color: 'green' };
    if (percentage < 70) return { text: '人流适中', color: 'amber' };
    return { text: '人流较多', color: 'red' };
  };

  const visitorDensity = getVisitorDensity();
  const visitorPercentage = (currentVisitors / maxCapacity) * 100;

  return (
    <Card className="mx-4 mt-4 shadow-lg">
      <CardBody className="p-6">
        <Typography variant="h6" color="blue-gray" className="mb-4">
          实时信息
        </Typography>

        <div className="grid grid-cols-3 gap-4">
          {/* 游客人数 */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <UserGroupIcon className="h-6 w-6 text-pink-500" />
            </div>
            <Typography variant="small" color="gray" className="mb-1">
              当前人数
            </Typography>
            <Typography variant="h6" color="blue-gray">
              {currentVisitors.toLocaleString()}
            </Typography>
            <div className="mt-2">
              <Progress
                value={visitorPercentage}
                color={visitorDensity.color}
                className="h-2"
              />
              <Typography
                variant="small"
                color={visitorDensity.color}
                className="mt-1"
              >
                {visitorDensity.text}
              </Typography>
            </div>
          </div>

          {/* 天气信息 */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <SunIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <Typography variant="small" color="gray" className="mb-1">
              天气
            </Typography>
            <Typography variant="h6" color="blue-gray">
              {weather.condition || '晴朗'}
            </Typography>
            <Typography variant="small" color="gray" className="mt-1">
              {weather.temperature ? `${weather.temperature}°C` : '24°C'}
            </Typography>
          </div>

          {/* 等待时间 */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <Typography variant="small" color="gray" className="mb-1">
              预计等待
            </Typography>
            <Typography variant="h6" color="blue-gray">
              {waitTime.entrance || 0}分钟
            </Typography>
            <Typography variant="small" color="green" className="mt-1">
              {(waitTime.entrance || 0) < 10 ? '较短' : '较长'}
            </Typography>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default LiveData;
