import React from 'react';
import { Typography } from '@material-tailwind/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 mb-4">
        <MagnifyingGlassIcon className="h-16 w-16" />
      </div>
      <Typography variant="h6" className="text-gray-600 mb-2">
        未找到匹配的景区
      </Typography>
      <Typography variant="small" className="text-gray-500 text-center">
        尝试调整搜索条件或筛选选项
      </Typography>
    </div>
  );
};

export default EmptyState;