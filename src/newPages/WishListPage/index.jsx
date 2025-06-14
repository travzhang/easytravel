import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  IconButton,
  Typography,
  Dialog,
  DialogBody,
  Button,
  Input,
  Textarea,
  Chip,
} from '@material-tailwind/react';
import {
  PlusIcon,
  HeartIcon,
  MapPinIcon,
  SparklesIcon,
  XMarkIcon,
  PhotoIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// 简化的图片组件
const SimpleImage = React.memo(({ src, alt, className, fallbackSrc }) => {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setImageError(true);
    }
  };

  if (imageError) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center`}
      >
        <PhotoIcon className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  );
});

SimpleImage.displayName = 'SimpleImage';

const WishListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateWish, setShowCreateWish] = useState(false);
  const [wishes, setWishes] = useState([
    {
      id: 1,
      content: '希望能去看一次北极光，感受大自然的神奇魅力',
      location: '冰岛',
      category: '自然景观',
      likes: 128,
      isLiked: false,
      timestamp: '2小时前',
      tags: ['北极光', '冰岛', '自然'],
      image:
        'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
      anonymous: true,
    },
    {
      id: 2,
      content: '想和家人一起去迪士尼乐园，重温童年的快乐时光',
      location: '上海迪士尼',
      category: '主题乐园',
      likes: 89,
      isLiked: true,
      timestamp: '5小时前',
      tags: ['迪士尼', '家庭', '童年'],
      image:
        'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400',
      anonymous: true,
    },
    {
      id: 3,
      content: '梦想能在樱花盛开的季节去京都，漫步在哲学之道',
      location: '京都',
      category: '文化古迹',
      likes: 156,
      isLiked: false,
      timestamp: '1天前',
      tags: ['樱花', '京都', '日本'],
      image:
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
      anonymous: true,
    },
    {
      id: 4,
      content: '希望能去马尔代夫的水上屋住一晚，看最美的海景',
      location: '马尔代夫',
      category: '海岛度假',
      likes: 203,
      isLiked: false,
      timestamp: '2天前',
      tags: ['马尔代夫', '水上屋', '海景'],
      image:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      anonymous: true,
    },
  ]);

  const [newWish, setNewWish] = useState({
    content: '',
    location: '',
    category: '',
    tags: [],
    image: '',
  });

  const categories = [
    '自然景观',
    '文化古迹',
    '主题乐园',
    '海岛度假',
    '城市探索',
    '美食之旅',
  ];

  const handleLike = useCallback((wishId) => {
    setWishes((prevWishes) =>
      prevWishes.map((wish) => {
        if (wish.id === wishId) {
          return {
            ...wish,
            isLiked: !wish.isLiked,
            likes: wish.isLiked ? wish.likes - 1 : wish.likes + 1,
          };
        }
        return wish;
      }),
    );
  }, []);

  const handleCreateWish = useCallback(() => {
    if (!newWish.content.trim()) return;

    const wish = {
      id: Math.max(...wishes.map((w) => w.id)) + 1,
      ...newWish,
      likes: 0,
      isLiked: false,
      timestamp: '刚刚',
      anonymous: true,
      tags: newWish.tags.length > 0 ? newWish.tags : [newWish.category],
    };

    setWishes((prevWishes) => [wish, ...prevWishes]);
    setNewWish({
      content: '',
      location: '',
      category: '',
      tags: [],
      image: '',
    });
    setShowCreateWish(false);
  }, [newWish, wishes]);

  const filteredWishes = useMemo(() => {
    switch (activeTab) {
      case 'popular':
        return [...wishes].sort((a, b) => b.likes - a.likes);
      case 'recent':
        return wishes;
      default:
        return wishes;
    }
  }, [activeTab, wishes]);

  // 优化的 WishCard 组件
  const WishCard = React.memo(
    ({ wish }) => {
      return (
        <Card className="mb-4 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden will-change-transform">
          <CardBody className="p-0">
            {wish.image && (
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <SimpleImage
                  src={wish.image}
                  alt="愿望图片"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  fallbackSrc="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
                />
                <div className="absolute top-3 right-3">
                  <Chip
                    value={wish.category}
                    className="bg-white/90 text-gray-800 text-xs font-medium backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            <div className="p-4">
              <Typography className="text-gray-800 mb-3 leading-relaxed">
                {wish.content}
              </Typography>

              {wish.location && (
                <div className="flex items-center mb-3 text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <Typography variant="small">{wish.location}</Typography>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {wish.tags.map((tag, index) => (
                  <Chip
                    key={`${wish.id}-${tag}-${index}`}
                    value={tag}
                    className="bg-pink-50 text-pink-600 text-xs"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(wish.id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-pink-500 transition-colors duration-200"
                  >
                    {wish.isLiked ? (
                      <HeartSolidIcon className="h-5 w-5 text-pink-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span className="text-sm font-medium">{wish.likes}</span>
                  </button>
                </div>
                <Typography variant="small" className="text-gray-500">
                  {wish.timestamp}
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
      );
    },
    (prevProps, nextProps) => {
      // 自定义比较函数，只有关键属性变化时才重新渲染
      return (
        prevProps.wish.id === nextProps.wish.id &&
        prevProps.wish.likes === nextProps.wish.likes &&
        prevProps.wish.isLiked === nextProps.wish.isLiked &&
        prevProps.wish.image === nextProps.wish.image
      );
    },
  );

  WishCard.displayName = 'WishCard';

  return (
    <div className="bg-gray-50 h-screen overflow-auto">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <IconButton
              variant="text"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </IconButton>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              许愿清单
            </Typography>
          </div>
        </div>
      </div>

      {/* 原有的头部内容移到这里，去掉原来的标题部分 */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-md hover:shadow-lg">
        <div className="p-4">
          <div className="flex space-x-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`
                flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200
                ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              全部愿望
            </button>
            <button
              onClick={() => setActiveTab('travel')}
              className={`
                flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200
                ${
                  activeTab === 'travel'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              旅行愿望
            </button>
            <button
              onClick={() => setActiveTab('accessibility')}
              className={`
                flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200
                ${
                  activeTab === 'accessibility'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              无障碍体验
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4 pb-0">
        {filteredWishes.map((wish) => (
          <WishCard key={wish.id} wish={wish} />
        ))}

        {filteredWishes.length === 0 && (
          <div className="text-center py-12">
            <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <Typography className="text-gray-400 text-lg mb-2">
              还没有愿望
            </Typography>
            <Typography className="text-gray-500 text-sm">
              成为第一个许愿的人吧！
            </Typography>
          </div>
        )}
      </div>

      {/* 悬浮许愿按钮 */}
      <div className="fixed bottom-4 w-full z-50 flex items-center justify-center">
        <IconButton
          size="lg"
          className={`
            bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700
            shadow-lg hover:shadow-xl transition-all duration-300 w-14 h-14
          `}
          onClick={() => setShowCreateWish(true)}
        >
          <PlusIcon className="h-6 w-6 text-white" />
        </IconButton>
      </div>

      {/* 创建愿望对话框 */}
      <Dialog
        open={showCreateWish}
        handler={() => setShowCreateWish(false)}
        size="md"
        className="bg-white rounded-3xl shadow-2xl"
      >
        <DialogBody className="p-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Typography variant="h5" className="text-gray-900 font-bold">
                许下你的愿望
              </Typography>
              <button
                onClick={() => setShowCreateWish(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <Textarea
                label="描述你的愿望"
                value={newWish.content}
                onChange={(e) =>
                  setNewWish({ ...newWish, content: e.target.value })
                }
                className="min-h-[100px]"
                placeholder="分享你想去的地方或想做的事情..."
              />

              <Input
                label="目的地（可选）"
                value={newWish.location}
                onChange={(e) =>
                  setNewWish({ ...newWish, location: e.target.value })
                }
                placeholder="例如：巴黎、东京、马尔代夫"
              />

              <div>
                <Typography variant="small" className="text-gray-700 mb-2">
                  选择分类
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      value={category}
                      onClick={() => setNewWish({ ...newWish, category })}
                      className={`cursor-pointer transition-all duration-200 ${
                        newWish.category === category
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Input
                label="图片链接（可选）"
                value={newWish.image}
                onChange={(e) =>
                  setNewWish({ ...newWish, image: e.target.value })
                }
                placeholder="添加一张美丽的图片"
              />
            </div>

            <div className="flex space-x-3 mt-8">
              <Button
                variant="outlined"
                onClick={() => setShowCreateWish(false)}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                取消
              </Button>
              <Button
                onClick={handleCreateWish}
                disabled={!newWish.content.trim()}
                className="
                  flex-1 bg-gradient-to-r from-pink-500 to-pink-600 
                  hover:from-pink-600 hover:to-pink-700
                  text-white font-medium
                  transition-all duration-200 ease-out
                  hover:shadow-lg hover:-translate-y-0.5
                  active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                发布愿望
              </Button>
            </div>

            <Typography
              variant="small"
              className="text-gray-500 text-center mt-4"
            >
              💫 所有愿望都是匿名发布的，让我们一起分享美好的梦想
            </Typography>
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
};

export default WishListPage;
