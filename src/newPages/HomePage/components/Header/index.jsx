import { Typography, Avatar } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        {/* 左侧标题区域 */}
        <div className="flex-1">
          {/* 优化后的标题设计 */}
          <div className="flex items-center space-x-3 mb-3">
            {/* 品牌图标/装饰元素 */}
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-400 rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* 主标题 */}
            <div>
              <Typography
                variant="h1"
                className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent tracking-tight"
              >
                EasyTrip
              </Typography>
              {/* 品牌标识点 */}
              <div className="w-12 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full mt-1"></div>
            </div>
          </div>

          {/* 副标题 */}
          <Typography
            variant="paragraph"
            className="text-gray-600 text-sm font-medium ml-11 leading-relaxed"
          >
            为您提供贴心的无障碍出行服务
          </Typography>
        </div>

        {/* 右侧用户头像 */}
        <div className="flex-shrink-0 ml-4">
          <div
            onClick={handleProfileClick}
            className="cursor-pointer transition-transform duration-200 hover:scale-105"
          >
            <Avatar
              src="/cat.jpg"
              alt="avatar"
              size="md"
              className="ring-2 ring-pink-100 ring-offset-2 shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
