import { useNavigate } from 'react-router-dom';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';
import { Card, CardBody, Chip, Typography } from '@material-tailwind/react';
import {
  UserGroupIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';

import { recommendedScenics } from '../../../../mock/scenicData';

export default function RecommendList() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* 横向滚动容器 */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
          {recommendedScenics.map((scenic) => (
            <Card
              key={scenic.id}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] w-72 flex-shrink-0 bg-white border-0 shadow-md overflow-hidden"
              onClick={() => navigate(`/scenic/${scenic.id}`)}
            >
              <CardBody className="p-0">
                {/* 图片区域 */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={scenic.image}
                    alt={scenic.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />

                  {/* 渐变遮罩层 - 仅在底部 */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  {/* 爱心图标 - 右上角 */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all duration-200 shadow-sm">
                      <HeartIcon className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors duration-200 cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="p-4 mb-4">
                  {/* 标题区域 */}
                  <div className="mb-3">
                    <p
                      variant="h6"
                      color="blue-gray"
                      className="text-stone-900 font-bold text-lg leading-tight mb-1 line-clamp-1"
                    >
                      {scenic.name}
                    </p>
                    <p
                      variant="small"
                      color="gray"
                      className="text-sm text-gray-600 line-clamp-3 leading-relaxed"
                    >
                      {scenic.shortDesc || '暂无简介'}
                    </p>
                  </div>

                  {/* 无障碍特色标签 */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {scenic.tags.slice(0, 2).map((tag, index) => (
                        <Chip
                          key={index}
                          value={tag}
                          size="sm"
                          variant="ghost"
                          color="blue"
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-0"
                        />
                      ))}
                    </div>
                  </div>

                  {/* 无障碍评级详细信息 */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-semibold text-gray-800">
                          无障碍评级
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-lg font-bold ${
                            scenic.accessibilityLevel.startsWith('A')
                              ? 'text-emerald-600'
                              : scenic.accessibilityLevel.startsWith('B')
                                ? 'text-blue-600'
                                : 'text-orange-600'
                          }`}
                        >
                          {scenic.accessibilityLevel}
                        </span>
                        <span className="text-xs text-gray-500">级</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <StarSolidIcon className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {scenic.accessibilityScore} 分
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <UserGroupIcon className="h-3.5 w-3.5" />
                        <span>{scenic.visitorsToday}人今日访问</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
