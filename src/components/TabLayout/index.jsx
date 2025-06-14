import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  HomeIcon,
  MapIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MapIcon as MapIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

// TabBar组件
const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      id: 'home',
      label: '首页',
      path: '/home',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      id: 'list',
      label: '景点',
      path: '/list',
      icon: MapIcon,
      activeIcon: MapIconSolid,
    },
    {
      id: 'community',
      label: '社区',
      path: '/community',
      icon: UserGroupIcon,
      activeIcon: UserGroupIconSolid,
    },
    {
      id: 'profile',
      label: '我的',
      path: '/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ];

  const isActiveTab = (path) => {
    console.log('🚀 ~ isActiveTab ~ location.pathname:', location.pathname);
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      {/* 顶部分割线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = isActiveTab(tab.path);
          const IconComponent = isActive ? tab.activeIcon : tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={`
                flex flex-col items-center justify-center
                min-w-0 flex-1 py-2 px-1
                transition-all duration-200 ease-out
                rounded-lg mx-1
                ${
                  isActive
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
              `}
              aria-label={`导航到${tab.label}`}
              role="tab"
              aria-selected={isActive}
            >
              {/* 图标容器 */}
              <div
                className={`
                relative mb-1
                transition-transform duration-200
                ${isActive ? 'transform scale-110' : 'transform scale-100'}
              `}
              >
                <IconComponent
                  className={`
                    h-6 w-6
                    transition-colors duration-200
                    ${isActive ? 'text-pink-500' : 'text-gray-500'}
                  `}
                />

                {/* 活跃状态指示点 */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* 标签文字 */}
              <span
                className={`
                text-xs font-medium
                transition-all duration-200
                ${
                  isActive
                    ? 'text-pink-500 font-semibold transform scale-105'
                    : 'text-gray-500'
                }
              `}
              >
                {tab.label}
              </span>

              {/* 底部活跃指示条 */}
              <div
                className={`
                absolute bottom-0 left-1/2 transform -translate-x-1/2
                h-0.5 bg-pink-500 rounded-full
                transition-all duration-300 ease-out
                ${isActive ? 'w-8 opacity-100' : 'w-0 opacity-0'}
              `}
              ></div>
            </button>
          );
        })}
      </div>

      {/* 底部安全区域 */}
      <div className="h-safe-bottom"></div>
    </div>
  );
};

// TabBarLayout主组件
const TabBarLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 主要内容区域 */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* 底部TabBar */}
      <TabBar />
    </div>
  );
};

export default TabBarLayout;
export { TabBar };
