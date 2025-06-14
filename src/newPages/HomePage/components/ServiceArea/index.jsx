import React, { useState } from 'react';
import {
  Typography,
  Dialog,
  DialogBody,
  Button,
} from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  MapIcon,
  BuildingOffice2Icon, // 推荐用于设施查询
  SparklesIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

// 菜单区域数据 - 使用更合适的无障碍设施图标
const MENU_ITEMS = [
  {
    id: 1,
    title: '路线规划',
    // todo: 更合适的icon & 跳转
    icon: MapIcon,
    description: '智能路线推荐',
    routePath: '/list',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    title: '设施查询',
    icon: BuildingOffice2Icon, // 更换为更合适的图标
    description: '无障碍设施信息',
    routePath: '/facilities',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 3,
    title: '智能导览',
    icon: LightBulbIcon,
    description: '智能导览助手',
    routePath: '',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 4,
    title: '许愿清单',
    icon: SparklesIcon,
    description: '许下想去的景点愿望',
    routePath: '/wish-list',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export default function ServiceArea() {
  const navigate = useNavigate();
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    if (!item.routePath || item.routePath.trim() === '') {
      setSelectedItem(item);
      setShowComingSoonDialog(true);
    } else {
      requestAnimationFrame(() => {
        navigate(item.routePath);
      });
    }
  };

  const handleKeyDown = (e, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-2 mx-auto px-2">
        {MENU_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="
                flex-1
                cursor-pointer 
                transition-all duration-200 ease-out
                hover:scale-105 hover:-translate-y-1
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                bg-white
                shadow-md hover:shadow-lg
                rounded-xl
                p-3
                flex flex-col items-center text-center
                min-h-[80px] justify-center
                group
                min-w-[70px]
              "
              onClick={() => handleItemClick(item)}
              tabIndex={0}
              role="button"
              aria-label={`${item.title} - ${item.description}`}
              onKeyDown={(e) => handleKeyDown(e, item)}
            >
              {/* 图标容器 */}
              <div
                className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-all duration-200`}
              >
                <IconComponent className={`w-5 h-5 ${item.color}`} />
              </div>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-semibold text-xs leading-tight group-hover:text-pink-600 transition-colors duration-200"
              >
                {item.title}
              </Typography>
            </div>
          );
        })}
      </div>

      {/* Airbnb风格的暂未开放提示弹窗 */}
      <Dialog
        open={showComingSoonDialog}
        handler={() => setShowComingSoonDialog(false)}
        size="sm"
        className="bg-white rounded-3xl shadow-2xl"
      >
        <DialogBody className="p-0">
          <div className="relative p-8 text-center">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowComingSoonDialog(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="关闭"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>

            {/* 图标 */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
            </div>

            {/* 标题 */}
            <Typography variant="h4" className="text-gray-900 font-bold mb-3">
              功能开发中
            </Typography>

            {/* 描述 */}
            <Typography className="text-gray-600 mb-2 leading-relaxed">
              <span className="font-medium text-gray-900">
                {selectedItem?.title}
              </span>{' '}
              功能正在紧张开发中
            </Typography>
            <Typography className="text-gray-500 text-sm mb-8">
              我们正在努力为您带来更好的体验，敬请期待！
            </Typography>

            {/* 按钮 */}
            <Button
              onClick={() => setShowComingSoonDialog(false)}
              className="
                w-full bg-gradient-to-r from-pink-500 to-pink-600 
                hover:from-pink-600 hover:to-pink-700
                text-white font-medium py-3 px-6 rounded-xl
                transition-all duration-200 ease-out
                hover:shadow-lg hover:-translate-y-0.5
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
              "
            >
              我知道了
            </Button>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}
