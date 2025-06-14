import { scenicDetails } from './scenicData';

// 生成景区列表数据的函数
const generateMockScenicData = () => {
  // 定义价格映射
  const priceMap = {
    494725605: 399, // 上海迪士尼
    462007561: 40, // 上海动物园
    39961770: 0, // 复兴公园
    45220427: 0, // 中山公园
    39176862: 15, // 共青森林公园
    178411796: 0, // 黄浦公园
    47005216: 15, // 上海植物园
    40036584: 40, // 豫园
    666304555: 0, // 大宁郁金香公园
  };

  // 定义评分和评论数映射
  const ratingMap = {
    494725605: { rating: 4.8, reviewCount: 5678 }, // 上海迪士尼
    462007561: { rating: 4.5, reviewCount: 1234 }, // 上海动物园
    39961770: { rating: 4.2, reviewCount: 567 }, // 复兴公园
    45220427: { rating: 4.3, reviewCount: 890 }, // 中山公园
    39176862: { rating: 4.1, reviewCount: 456 }, // 共青森林公园
    178411796: { rating: 4.0, reviewCount: 234 }, // 黄浦公园
    47005216: { rating: 4.4, reviewCount: 1567 }, // 上海植物园
    40036584: { rating: 4.3, reviewCount: 2345 }, // 豫园
    666304555: { rating: 4.2, reviewCount: 678 }, // 大宁郁金香公园
  };

  // 定义距离映射
  const distanceMap = {
    494725605: '15.2km', // 上海迪士尼
    462007561: '2.3km', // 上海动物园
    39961770: '5.8km', // 复兴公园
    45220427: '3.5km', // 中山公园
    39176862: '12.8km', // 共青森林公园
    178411796: '8.1km', // 黄浦公园
    47005216: '9.2km', // 上海植物园
    40036584: '7.5km', // 豫园
    666304555: '6.3km', // 大宁郁金香公园
  };

  // 定义分类映射
  const categoryMap = {
    494725605: '主题公园', // 上海迪士尼
    462007561: '主题公园', // 上海动物园
    39961770: '园林景观', // 复兴公园
    45220427: '园林景观', // 中山公园
    39176862: '自然公园', // 共青森林公园
    178411796: '历史公园', // 黄浦公园
    47005216: '植物园', // 上海植物园
    40036584: '园林景观', // 豫园
    666304555: '主题公园', // 大宁郁金香公园
  };

  return scenicDetails.map((scenic) => {
    const ratingData = ratingMap[scenic.id] || {
      rating: 4.0,
      reviewCount: 100,
    };

    return {
      id: scenic.id,
      name: scenic.name,
      location: scenic.location,
      image: scenic.image,
      price: priceMap[scenic.id] || 0,
      rating: ratingData.rating,
      reviewCount: ratingData.reviewCount,
      tags: scenic.tags,
      accessibilityLevel: scenic.accessibilityLevel,
      shortDesc:
        scenic.description.length > 100
          ? scenic.description.substring(0, 100) + '...'
          : scenic.description,
      distance: distanceMap[scenic.id] || '未知',
      category: categoryMap[scenic.id] || '其他',
    };
  });
};

// 导出生成的景区列表数据
export const mockScenicData = generateMockScenicData();
