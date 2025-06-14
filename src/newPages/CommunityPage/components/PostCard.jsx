import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Button,
} from '@material-tailwind/react';
import {
  HeartIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
} from '@heroicons/react/24/solid';

// 在PostCard组件中添加distance显示
const PostCard = ({ post, onLike, onBookmark }) => {
  const [showAllImages, setShowAllImages] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const displayImages = showAllImages ? post.images : post.images.slice(0, 2);

  return (
    <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
      <CardBody className="p-0">
        {/* 用户信息头部 */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center space-x-3">
            {/* 匿名头像 */}
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center ring-2 ring-gray-100">
              <UserIcon className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold"
                >
                  匿名用户
                </Typography>
                {post.user.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Typography variant="small" color="gray">
                  {post.timestamp}
                </Typography>
                {post.location && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-3 w-3 text-gray-400" />
                      <Typography variant="small" color="gray">
                        {post.location}
                      </Typography>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <IconButton variant="text" size="sm">
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </IconButton>
        </div>

        {/* 内容 */}
        <div className="px-4 pb-3">
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="leading-relaxed"
          >
            {post.content}
          </Typography>
        </div>

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Chip
                  key={index}
                  value={tag}
                  size="sm"
                  variant="ghost"
                  color="blue"
                  className="rounded-full text-xs"
                />
              ))}
            </div>
          </div>
        )}

        {/* 图片 */}
        {post.images && post.images.length > 0 && (
          <div className="px-4 pb-3">
            <div
              className={`grid gap-2 ${
                post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {displayImages.map((image, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden bg-gray-100"
                  style={{
                    aspectRatio: post.images.length === 1 ? '16/10' : '1/1',
                  }}
                >
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                </div>
              ))}
            </div>
            {post.images.length > 2 && !showAllImages && (
              <Button
                variant="text"
                size="sm"
                className="mt-2 text-blue-500"
                onClick={() => setShowAllImages(true)}
              >
                查看全部 {post.images.length} 张图片
              </Button>
            )}
          </div>
        )}

        {/* 互动按钮 */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                onClick={() => onLike(post.id)}
              >
                {post.isLiked ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-500" />
                )}
                <Typography
                  variant="small"
                  color={post.isLiked ? 'red' : 'gray'}
                  className="font-medium"
                >
                  {post.likes}
                </Typography>
              </button>

              <button
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                onClick={() => setShowComments(!showComments)}
              >
                <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />
                <Typography
                  variant="small"
                  color="gray"
                  className="font-medium"
                >
                  {post.comments}
                </Typography>
              </button>
            </div>

            <button
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
              onClick={() => onBookmark(post.id)}
            >
              {post.isBookmarked ? (
                <BookmarkSolidIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <BookmarkIcon className="h-5 w-5 text-gray-500" />
              )}
              <Typography
                variant="small"
                color={post.isBookmarked ? 'blue' : 'gray'}
                className="font-medium"
              >
                {post.bookmarks}
              </Typography>
            </button>
          </div>
        </div>

        {/* 评论区域 */}
        {showComments && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <Typography variant="small" color="gray" className="text-center">
              评论功能开发中...
            </Typography>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PostCard;
