import React, { useState } from 'react';
import { Typography, Card, CardBody } from '@material-tailwind/react';

const Routes = ({ scenicData }) => {
  const accessibleRoutes = scenicData?.accessibleRoutes || [];
  const [activeTab, setActiveTab] = useState(0);

  if (!accessibleRoutes.length) {
    return (
      <div className="p-4">
        <Typography variant="small" color="gray">
          暂无路线信息
        </Typography>
      </div>
    );
  }

  return (
    <div>
      {/* Airbnb风格的Tab导航 */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-full p-1">
          {accessibleRoutes.map((route, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200
                ${
                  activeTab === index
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {route.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab内容区域 */}
      <div>
        {accessibleRoutes.map((route, routeIndex) => (
          <div
            key={routeIndex}
            className={`${activeTab === routeIndex ? 'block' : 'hidden'}`}
          >
            <Card className="shadow-sm">
              <CardBody className="p-2">
                {/* 路线基本信息 */}
                <div className="mb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-gray-600">
                      {route.duration}
                    </span>
                    <span className="text-sm text-gray-600">
                      {route.distance || '2.5公里'}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      简单
                    </span>
                  </div>
                  <Typography variant="small" color="gray" className="mb-4">
                    {route.description}
                  </Typography>
                </div>

                {/* 路线步骤 */}
                <div className="space-y-4">
                  {route.steps?.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex gap-4">
                      {/* 步骤编号 */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {stepIndex + 1}
                        </div>
                        {/* 连接线 */}
                        {stepIndex < route.steps.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mx-auto mt-2"></div>
                        )}
                      </div>

                      {/* 步骤内容 */}
                      <div className="flex-1 pb-4">
                        <Typography
                          variant="small"
                          className="font-medium text-gray-800 mb-1"
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          variant="small"
                          color="gray"
                          className="mb-2 leading-relaxed"
                        >
                          {step.description}
                        </Typography>
                        {step.note && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mt-2">
                            <Typography
                              variant="small"
                              className="text-blue-700"
                            >
                              💡 {step.note}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Routes;
