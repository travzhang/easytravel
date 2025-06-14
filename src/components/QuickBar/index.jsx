import React, { useState, useEffect } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Typography,
  IconButton,
  Dialog,
  DialogBody,
} from '@material-tailwind/react';
import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  XMarkIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

const QUICK_ACTIONS = [
  {
    id: 1,
    title: '用户反馈',
    icon: ChatBubbleLeftRightIcon,
    description: '我要反馈',
    routePath: '/feedback/add',
    color: 'blue',
    bgColor: 'bg-blue-50',
    type: 'navigate',
  },
  {
    id: 2,
    title: '沟通辅助',
    icon: ChatBubbleLeftRightIcon,
    description: '语音交流助手',
    routePath: '/communication-aid',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    type: 'navigate',
  },
  {
    id: 3,
    title: '健康管理',
    icon: HeartIcon,
    description: '健康状态监测',
    routePath: '/health-manager',
    color: 'green',
    bgColor: 'bg-green-50',
    type: 'navigate',
  },
  {
    id: 4,
    title: '紧急求助',
    icon: ExclamationTriangleIcon,
    description: '一键紧急联系',
    color: 'red',
    bgColor: 'bg-red-50',
    type: 'emergency',
  },
];

export default function QuickBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showAttentionAnimation, setShowAttentionAnimation] = useState(false);
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);

  const navigate = useNavigate();
  const href = useHref();
  console.log('🚀 ~ QuickBar ~ href:', href);
  // 挂载和强调动画效果
  useEffect(() => {
    // 组件挂载时从右侧滑入
    const mountTimer = setTimeout(() => {
      setIsMounted(true);
      // 滑入完成后开始强调动画
      setTimeout(() => {
        setShowAttentionAnimation(true);
        // 强调动画持续2秒后结束
        setTimeout(() => {
          setShowAttentionAnimation(false);
        }, 2000);
      }, 500);
    }, 100);

    return () => {
      clearTimeout(mountTimer);
    };
  }, []);

  // 处理紧急求助
  const handleEmergencyCall = () => {
    setShowComingSoonDialog(true);
    setIsOpen(false);
  };

  const handleActionClick = (action) => {
    if (action.type === 'emergency') {
      handleEmergencyCall();
    } else {
      if (!href.includes(action.routePath)) {
        // 避免路由不断叠加
        navigate(action.routePath);
      }
      setIsOpen(false);
    }
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 贴边悬浮按钮 */}
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 transition-transform duration-500 ease-out ${
          isMounted ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div
          className={`relative group transition-all duration-300 ease-in-out hover:opacity-100 ${isOpen ? 'opacity-100' : 'opacity-60'} ${
            showAttentionAnimation ? 'animate-pulse scale-110' : ''
          }`}
        >
          <IconButton
            size="lg"
            className={`rounded-l-2xl rounded-r-none shadow-lg border-r-0 transition-all duration-200 ease-out transform-gpu ${
              isOpen
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={handleClick}
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6 text-white transition-transform duration-200" />
            ) : (
              <div className="relative">
                {/* 主图标 */}
                <Squares2X2Icon className="h-6 w-6 text-white transition-transform duration-200" />
                {/* 强调动画期间的脉动提示点 */}
                {showAttentionAnimation && (
                  <>
                    <div className="absolute -top-1 -left-1 w-4 h-4 bg-orange-400 rounded-full animate-ping opacity-75" />
                    <div className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-orange-300 rounded-full animate-ping animation-delay-150 opacity-60" />
                  </>
                )}
                {/* 静态提示点 */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-orange-400 rounded-full" />
              </div>
            )}
          </IconButton>
        </div>
      </div>

      {/* 快捷操作面板 - 紧贴按钮的小型弹出框 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-gray-100/70 backdrop-blur-[2px] z-40 transition-opacity duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* 操作面板 - 紧贴按钮位置 */}
          <div className="fixed right-16 top-1/2 -translate-y-1/2 z-50 w-48">
            <Card className="shadow-xl border-0 animate-in slide-in-from-right-2 duration-200 bg-white/95 backdrop-blur-sm">
              <CardBody className="p-3">
                {/* 简化头部 */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Squares2X2Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-semibold flex-1"
                  >
                    快捷服务
                  </Typography>
                </div>

                {/* 紧凑的服务列表 */}
                <div className="space-y-1">
                  {QUICK_ACTIONS.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant="text"
                        size="sm"
                        className="w-full p-2.5 justify-start hover:bg-gray-50 rounded-lg transition-all duration-150"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: 'slideInFromRight 200ms ease-out forwards',
                        }}
                        onClick={() => handleActionClick(action)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={`p-2 rounded-lg ${action.bgColor} flex-shrink-0 transition-transform duration-150 hover:scale-105`}
                          >
                            <IconComponent
                              className={`h-4 w-4 text-${action.color}-600`}
                            />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-medium text-sm leading-tight"
                            >
                              {action.title}
                            </Typography>
                            <Typography
                              variant="small"
                              color="gray"
                              className="text-xs leading-tight truncate"
                            >
                              {action.description}
                            </Typography>
                          </div>
                          <div className="text-gray-300 flex-shrink-0">
                            {action.type === 'emergency' ? (
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* 简化底部提示 */}
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <Typography
                    variant="small"
                    color="gray"
                    className="text-center text-xs flex items-center justify-center gap-1"
                  >
                    <HeartIcon className="h-3 w-3 text-red-400" />
                    贴心服务
                  </Typography>
                </div>
              </CardBody>
            </Card>

            {/* 连接线指示器 */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-gray-200 to-transparent" />
          </div>
        </>
      )}

      {/* Airbnb风格的"正在开发中"提示弹窗 */}
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>

            {/* 标题 */}
            <Typography variant="h4" className="text-gray-900 font-bold mb-3">
              功能开发中
            </Typography>

            {/* 描述 */}
            <Typography className="text-gray-600 mb-2 leading-relaxed">
              <span className="font-medium text-gray-900">紧急求助</span>{' '}
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

      {/* 添加自定义动画样式 */}
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </>
  );
}
