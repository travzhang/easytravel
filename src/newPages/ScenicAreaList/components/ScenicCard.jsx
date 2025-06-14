import React from 'react';
import { Card, CardBody, Typography, Chip } from '@material-tailwind/react';
import {
  MapPinIcon,
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';

const ScenicCard = ({ scenic, isFavorite, onToggleFavorite, onCardClick, getAccessibilityColor }) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-white border-0 shadow-md overflow-hidden"
      onClick={() => onCardClick(scenic.id)}
    >
      <CardBody className="p-0">
        {/* 图片区域 */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={scenic.image}
            alt={scenic.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />

          {/* 渐变遮罩层 */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* 爱心图标 */}
          <div className="absolute top-3 right-3">
            <div
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all duration-200 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(scenic.id);
              }}
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-4 w-4 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors duration-200 cursor-pointer" />
              )}
            </div>
          </div>

          {/* 价格显示 */}
          <div className="absolute top-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
              <Typography variant="small" className="font-bold text-gray-800">
                {scenic.price === 0 ? '免费' : `¥${scenic.price}`}
              </Typography>
            </div>
          </div>

          {/* 距离显示 */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
              <Typography variant="small" className="text-gray-800 font-medium">
                {scenic.distance}
              </Typography>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-4 relative pb-16">
          {/* 标题区域 */}
          <div className="mb-3">
            <Typography
              variant="h6"
              color="blue-gray"
              className="text-stone-900 font-bold text-lg leading-tight mb-1 line-clamp-1"
            >
              {scenic.name}
            </Typography>

            {/* 位置信息 */}
            <div className="flex items-center text-gray-600 mb-2">
              <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <Typography variant="small" className="text-sm truncate">
                {scenic.location}
              </Typography>
            </div>

            <Typography
              variant="small"
              color="gray"
              className="text-sm text-gray-600 leading-relaxed"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {scenic.shortDesc || '暂无简介'}
            </Typography>
          </div>

          {/* 底部信息 */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            {/* 标签 */}
            <div className="flex gap-1 flex-wrap">
              {scenic.tags.slice(0, 2).map((tag, index) => (
                <Chip
                  key={index}
                  value={tag}
                  size="sm"
                  variant="ghost"
                  color="blue"
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-0"
                />
              ))}
              {scenic.tags.length > 2 && (
                <Typography variant="small" className="text-gray-500 text-xs self-center">
                  +{scenic.tags.length - 2}
                </Typography>
              )}
            </div>

            {/* 评分和无障碍等级 */}
            <div className="flex items-center gap-2">
              {/* 评分 */}
              <div className="flex items-center gap-1 text-amber-600">
                <StarSolidIcon className="h-4 w-4" />
                <Typography variant="small" className="font-semibold">
                  {scenic.rating}
                </Typography>
              </div>

              {/* 无障碍等级 */}
              <Chip
                value={`${scenic.accessibilityLevel}级`}
                size="sm"
                color={getAccessibilityColor(scenic.accessibilityLevel)}
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ScenicCard;