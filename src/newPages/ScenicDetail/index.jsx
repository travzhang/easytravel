import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { scenicDetails } from '../../mock/scenicData';
import { getUserFeedbackByScenicId } from '../../mock/userFeedbackData';
import { getAccessibleRoutesByScenicId } from '../../mock/accessibleRoutesData';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Typography } from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import ImageCarousel from './components/ImageCarousel';
import BasicInfo from './components/BasicInfo';
import LiveData from './components/LiveData';
import Highlights from './components/Highlights';
import Facilities from './components/Facilities';
import Routes from './components/Routes';
import Reviews from './components/Reviews';
import ActionBar from './components/ActionBar';

function ScenicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  // 获取景区数据
  const scenicData =
    scenicDetails.find((scenic) => scenic.id === id) || scenicDetails[0];

  // 获取路线数据
  const accessibleRoutes = getAccessibleRoutesByScenicId(id);

  // 获取用户反馈数据
  const userFeedbacks = getUserFeedbackByScenicId(id);

  // 整合所有数据
  const enhancedScenicData = {
    ...scenicData,
    // 添加路线数据
    accessibleRoutes,
    // 使用 scenicData 中的 accessibilityFacilities 数据生成 enhancedFacilities
    enhancedFacilities:
      (scenicData.accessibilityFacilities || [])
        .filter((facility) => facility.available)
        .map((facility) => ({
          icon: getAccessibilityIcon(facility.name),
          name: facility.name,
          desc: getAccessibilityDescription(facility.name),
        })) || [],
    // 添加用户反馈统计数据
    userFeedbackStats: {
      totalReviews: userFeedbacks.length,
      averageRating: userFeedbacks.length > 0 
        ? (userFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / userFeedbacks.length).toFixed(1)
        : 0,
      accessibilityRating: userFeedbacks.length > 0
        ? (userFeedbacks.reduce((sum, feedback) => sum + (feedback.accessibility?.overall || 0), 0) / userFeedbacks.length).toFixed(1)
        : 0,
    },
  };

  // 辅助函数：根据设施名称获取图标
  function getAccessibilityIcon(facilityName) {
    const iconMap = {
      无障碍入口: '🚪',
      轮椅租赁服务: '🦽',
      无障碍厕所: '🚻',
      盲道: '🦯',
      电梯: '🛗',
      轮椅坡道: '♿',
      手语导览: '🤟',
      盲文说明: '👁️',
      无障碍游乐设施: '🎠',
      服务犬区域: '🐕‍🦺',
      母婴室: '🍼',
    };
    return iconMap[facilityName] || '✅';
  }

  // 辅助函数：根据设施名称获取描述
  function getAccessibilityDescription(facilityName) {
    const descMap = {
      无障碍入口: '园区入口设有无障碍通道，方便轮椅通行',
      轮椅租赁服务: '免费提供轮椅租赁服务，需身份证押金',
      无障碍厕所: '园区内设有多个无障碍厕所，设施齐全',
      盲道: '主要通道设有盲道，引导视障人士安全通行',
      电梯: '多层建筑配备电梯，方便行动不便人士',
      轮椅坡道: '台阶处设有轮椅坡道，坡度符合无障碍标准',
      手语导览: '提供手语导览服务，支持听障人士',
      盲文说明: '重要区域设有盲文说明牌',
      无障碍游乐设施: '部分游乐设施适合残障人士使用',
      服务犬区域: '允许导盲犬等服务犬进入',
      母婴室: '提供母婴休息和护理设施',
    };
    return descMap[facilityName] || '提供相应的无障碍服务';
  }

  // 模拟图片数据 - 使用scenicData中的图片
  const images = [scenicData.image];

  // 实时数据状态
  const [liveData, setLiveData] = useState({
    visitorCount: Math.floor(Math.random() * 1000) + 500,
    waitTime: {
      entrance: Math.floor(Math.random() * 15) + 5,
      popular: Math.floor(Math.random() * 30) + 10,
      restaurant: Math.floor(Math.random() * 20) + 5,
    },
    crowdLevel: ['低', '中', '高'][Math.floor(Math.random() * 3)],
  });

  // 转换为页面所需的userReviews格式
  const userReviews = userFeedbacks.map((feedback) => ({
    id: feedback.id,
    user: {
      name: feedback.user.name,
      avatar: feedback.user.avatar,
      disability: feedback.user.disability,
      badge: feedback.user.badge,
    },
    rating: feedback.rating,
    date: feedback.date,
    helpful: feedback.helpful,
    content: feedback.content,
    images: feedback.images,
    tags: feedback.tags,
    accessibility: feedback.accessibility,
  }));

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => ({
        ...prev,
        visitorCount: Math.max(
          0,
          prev.visitorCount + Math.floor(Math.random() * 21) - 10,
        ),
        waitTime: {
          entrance: Math.max(0, Math.floor(Math.random() * 15)),
          popular: Math.max(0, Math.floor(Math.random() * 30)),
          restaurant: Math.max(0, Math.floor(Math.random() * 20)),
        },
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scenicData.name,
        text: scenicData.description,
        url: window.location.href,
      });
    }
  };

  const sections = [
    {
      title: '景区亮点',
      component: <Highlights scenicData={enhancedScenicData} />,
    },
    {
      title: '无障碍设施',
      component: <Facilities scenicData={enhancedScenicData} />,
    },
    {
      title: '推荐路线',
      component: <Routes scenicData={enhancedScenicData} />,
    },
    {
      title: '游客评价',
      component: <Reviews userReviews={userReviews} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3 flex-1">
            <Button
              variant="text"
              size="sm"
              onClick={handleBack}
              className="rounded-full hover:bg-gray-100 transition-colors p-2 min-w-0"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </Button>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              景区详情
            </Typography>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="text"
              size="sm"
              onClick={handleFavorite}
              className="rounded-full hover:bg-gray-100 transition-colors p-2 min-w-0"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </Button>
            <Button
              variant="text"
              size="sm"
              onClick={handleShare}
              className="rounded-full hover:bg-gray-100 transition-colors p-2 min-w-0"
            >
              <ShareIcon className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* 图片轮播 */}
      <ImageCarousel images={images} />

      {/* 基本信息 */}
      <BasicInfo scenicData={enhancedScenicData} />

      {/* 实时数据 */}
      <LiveData liveData={liveData} />

      {/* 内容区域 - 堆叠布局 */}
      <div className="m-4 space-y-4">
        {sections.map((section, index) => (
          <Card key={index} className="shadow-lg">
            <CardBody className="p-6">
              <Typography
                variant="h5"
                color="blue-gray"
                className="mb-4 font-semibold border-b border-gray-200 pb-3"
              >
                {section.title}
              </Typography>
              {section.component}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 底部操作栏 */}
      <ActionBar />
    </div>
  );
};

export default ScenicDetail;
