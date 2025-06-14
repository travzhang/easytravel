import React from 'react';
import { Chip, Typography, Button } from '@material-tailwind/react';

const FilterTags = ({
  searchQuery,
  selectedCategory,
  selectedAccessibility,
  sortBy,
  onClearSearch,
  onClearCategory,
  onClearAccessibility,
  onClearSort,
  onClearAll
}) => {
  const hasActiveFilters = searchQuery || selectedCategory || selectedAccessibility || sortBy !== 'distance';

  if (!hasActiveFilters) return null;

  return (
    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center gap-2 flex-wrap">
        <Typography variant="small" className="text-gray-600 font-medium">
          当前筛选:
        </Typography>

        {/* 搜索关键词标签 */}
        {searchQuery && (
          <Chip
            value={`搜索: ${searchQuery}`}
            size="sm"
            variant="filled"
            color="blue"
            className="cursor-pointer"
            onClose={onClearSearch}
            dismissible
          />
        )}

        {/* 分类标签 */}
        {selectedCategory && (
          <Chip
            value={`分类: ${selectedCategory}`}
            size="sm"
            variant="filled"
            color="pink"
            className="cursor-pointer"
            onClose={onClearCategory}
            dismissible
          />
        )}

        {/* 无障碍等级标签 */}
        {selectedAccessibility && (
          <Chip
            value={`无障碍: ${selectedAccessibility}级`}
            size="sm"
            variant="filled"
            color="green"
            className="cursor-pointer"
            onClose={onClearAccessibility}
            dismissible
          />
        )}

        {/* 排序方式标签 */}
        {sortBy !== 'distance' && (
          <Chip
            value={`排序: ${
              {
                rating: '评分最高',
                'price-low': '价格从低到高',
                'price-high': '价格从高到低',
              }[sortBy]
            }`}
            size="sm"
            variant="filled"
            color="orange"
            className="cursor-pointer"
            onClose={onClearSort}
            dismissible
          />
        )}

        {/* 清除所有筛选 */}
        <Button
          size="sm"
          variant="text"
          color="gray"
          className="text-xs px-2 py-1 h-auto min-h-0"
          onClick={onClearAll}
        >
          清除全部
        </Button>
      </div>
    </div>
  );
};

export default FilterTags;