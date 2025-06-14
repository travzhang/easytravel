import React from 'react';
import {
  Card,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Rating,
  Button,
} from '@material-tailwind/react';
import { HandThumbUpIcon } from '@heroicons/react/24/outline';

const ReviewCard = ({ review }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100">
      <CardBody className="p-4">
        {/* 用户信息区域 */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            <Avatar
              src={review.user.avatar}
              alt={review.user.name}
              size="sm"
              className="ring-2 ring-gray-100"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Typography
                variant="small"
                className="font-semibold text-gray-900 text-sm truncate"
              >
                {review.user.name}
              </Typography>
              <Typography variant="small" className="text-gray-400 text-xs">
                {review.date}
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Rating
                value={Math.max(0, Math.min(5, Math.floor(review.rating || 0)))}
                readonly
                className="text-amber-400"
              />
            </div>
          </div>
        </div>

        {/* 评论内容 */}
        <Typography className="text-gray-700 mb-3 leading-relaxed text-sm line-clamp-3">
          {review.content}
        </Typography>

        {/* 图片展示 */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {review.images.slice(0, 3).map((image, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={image}
                  alt={`评价图片 ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                />
                {index === 2 && review.images.length > 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <Typography className="text-white font-semibold text-xs">
                      +{review.images.length - 3}
                    </Typography>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {review.tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={index}
              value={tag}
              size="sm"
              className="bg-green-50 text-green-700 border border-green-200 text-xs font-medium px-2 py-1 hover:bg-green-100 transition-colors"
            />
          ))}
          {review.tags.length > 3 && (
            <Chip
              value={`+${review.tags.length - 3}`}
              size="sm"
              className="bg-gray-50 text-gray-600 border border-gray-200 text-xs font-medium px-2 py-1"
            />
          )}
        </div>

        {/* 底部操作区 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button
            variant="text"
            size="sm"
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full px-3 py-1 transition-all duration-200 normal-case text-xs font-medium"
          >
            <HandThumbUpIcon className="h-3 w-3" />
            有用 ({review.helpful})
          </Button>

          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ReviewCard;
