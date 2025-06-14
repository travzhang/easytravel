// import { useNavigate } from 'react-router-dom';
import { Button, Typography } from '@material-tailwind/react';

import TopBanner from './components/TopBanner';
import ServiceArea from './components/ServiceArea';
import RecommendList from './components/RecommendList';
import Header from './components/Header';
// import SearchBar from './components/SearchBar';

const HomePage = () => {
  // const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部标题组件 */}
      <Header />

      {/* 轮播图区域 - Material Tailwind 风格 */}
      <div className="px-4 py-6 pb-3">
        <TopBanner />
      </div>

      {/* 菜单区域 - Material Tailwind 风格网格布局 */}
      <div className="px-4 py-6 pb-3">
        <Typography variant="h5" color="blue-gray" className="mb-4">
          服务功能
        </Typography>
        <div>
          <ServiceArea />
        </div>
      </div>

      {/* 热门景区推荐 - Material Tailwind 风格卡片 */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" color="blue-gray">
            热门景区推荐
          </Typography>
          {/* <Button
            variant="text"
            size="sm"
            className="text-blue-600 font-medium"
            onClick={() => navigate('/list')}
          >
            查看全部
          </Button> */}
        </div>

        <div>
          <RecommendList />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
