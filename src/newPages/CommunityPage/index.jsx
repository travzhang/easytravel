import React, { useState, useEffect } from 'react';
import { Card, CardBody, IconButton } from '@material-tailwind/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import PostCard from './components/PostCard';
import CreatePostDialog from './components/CreatePostDialog';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('recommend'); // 新增：当前激活的tab
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: '张小明',
        avatar: '',
        verified: true,
      },
      content:
        '今天去了上海动物园，无障碍设施真的很完善！轮椅通道很宽敞，还有专门的无障碍洗手间。工作人员也很热心帮助。强烈推荐给有需要的朋友们！',
      images: [
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400',
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
      ],
      location: '上海动物园',
      timestamp: '2小时前',
      likes: 24,
      bookmarks: 8,
      comments: 12,
      isLiked: false,
      isBookmarked: false,
      tags: ['无障碍', '动物园', '推荐'],
    },
    {
      id: 2,
      user: {
        name: '李华',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: false,
      },
      content:
        '分享一个小技巧：去景区前可以先打电话咨询无障碍设施情况，这样能更好地规划行程。今天去外滩就是这样做的，体验很棒！',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      ],
      location: '外滩',
      timestamp: '4小时前',
      likes: 18,
      bookmarks: 15,
      comments: 6,
      isLiked: true,
      isBookmarked: false,
      tags: ['小贴士', '外滩'],
    },
    {
      id: 3,
      user: {
        name: '王美丽',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true,
      },
      content:
        '豫园的无障碍改造做得真不错！电梯、坡道都很方便，还有语音导览服务。和家人一起度过了愉快的一天。',
      images: [],
      location: '豫园',
      timestamp: '1天前',
      likes: 31,
      bookmarks: 12,
      comments: 9,
      isLiked: false,
      isBookmarked: true,
      tags: ['豫园', '无障碍', '家庭出游'],
    },
  ]);

  // 模拟附近的帖子数据
  const [nearbyPosts, setNearbyPosts] = useState([
    {
      id: 4,
      user: {
        name: '匿名用户',
        avatar: null,
        verified: false,
      },
      content: '距离你500米的朋友分享：这家咖啡店有无障碍入口，环境很棒！',
      images: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400'],
      location: '星巴克(人民广场店)',
      timestamp: '30分钟前',
      likes: 12,
      bookmarks: 3,
      comments: 5,
      isLiked: false,
      isBookmarked: false,
      tags: ['咖啡', '无障碍', '附近'],
      distance: '500m'
    },
    {
      id: 5,
      user: {
        name: '匿名用户',
        avatar: null,
        verified: true,
      },
      content: '刚从这里路过，发现新增了无障碍停车位，很方便！',
      images: [],
      location: '人民公园',
      timestamp: '1小时前',
      likes: 8,
      bookmarks: 2,
      comments: 3,
      isLiked: false,
      isBookmarked: false,
      tags: ['停车', '无障碍', '公园'],
      distance: '1.2km'
    }
  ]);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // 滚动监听效果
  useEffect(() => {
    let scrollTimer;

    const handleScroll = () => {
      setIsScrolling(true);

      // 清除之前的定时器
      clearTimeout(scrollTimer);

      // 设置新的定时器，滚动停止后恢复不透明
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  const handleLike = (postId) => {
    const updatePosts = (postsList) => 
      postsList.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      });
    
    setPosts(updatePosts);
    setNearbyPosts(updatePosts);
  };

  const handleBookmark = (postId) => {
    const updatePosts = (postsList) =>
      postsList.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isBookmarked: !post.isBookmarked,
            bookmarks: post.isBookmarked
              ? post.bookmarks - 1
              : post.bookmarks + 1,
          };
        }
        return post;
      });
    
    setPosts(updatePosts);
    setNearbyPosts(updatePosts);
  };

  const handleCreatePost = (newPost) => {
    const post = {
      id: Math.max(...posts.map(p => p.id), ...nearbyPosts.map(p => p.id)) + 1,
      user: {
        name: '匿名用户',
        avatar: null,
        verified: false,
      },
      ...newPost,
      timestamp: '刚刚',
      likes: 0,
      bookmarks: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false,
    };
    
    if (activeTab === 'recommend') {
      setPosts([post, ...posts]);
    } else {
      setNearbyPosts([post, ...nearbyPosts]);
    }
    setShowCreatePost(false);
  };

  // 获取当前显示的帖子列表
  const getCurrentPosts = () => {
    return activeTab === 'recommend' ? posts : nearbyPosts;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 头部Tab导航 - Airbnb风格 */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 pt-4 pb-2">
          <div className="flex space-x-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab('recommend')}
              className={`
                flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200
                ${
                  activeTab === 'recommend'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              推荐
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`
                flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200
                ${
                  activeTab === 'nearby'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              附近
            </button>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="space-y-4 p-4 pb-32">
        {getCurrentPosts().map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
            onBookmark={() => handleBookmark(post.id)}
            showDistance={activeTab === 'nearby'}
          />
        ))}
        
        {/* 空状态 */}
        {getCurrentPosts().length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              {activeTab === 'recommend' ? '暂无推荐内容' : '附近暂无动态'}
            </div>
            <div className="text-gray-500 text-sm">
              {activeTab === 'recommend' 
                ? '成为第一个分享的人吧！' 
                : '开启位置服务查看附近动态'
              }
            </div>
          </div>
        )}
      </div>

      {/* 悬浮发布按钮 - 固定在底部，与TabBar色系一致 */}
      <div className="fixed bottom-20 w-full z-50 flex items-center justify-center">
        <IconButton
          size="lg"
          className={`
            bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-xl 
            transition-all duration-300 w-14 h-14
            ${isScrolling ? 'opacity-50' : 'opacity-100'}
          `}
          onClick={() => setShowCreatePost(true)}
        >
          <PlusIcon className="h-6 w-6 text-white" />
        </IconButton>
      </div>

      {/* 创建帖子对话框 */}
      <CreatePostDialog
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default CommunityPage;
