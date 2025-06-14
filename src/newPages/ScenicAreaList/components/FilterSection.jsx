import React from 'react';
import {
  Button,
  Chip,
  Typography,
  Select,
  Option,
} from '@material-tailwind/react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const FilterSection = ({
  showFilters,
  onToggleFilters,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedAccessibility,
  onAccessibilityChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <>
      {/* 筛选按钮和快速筛选 */}
      <div className="flex items-center justify-between">
        <Button
          variant={showFilters ? 'filled' : 'outlined'}
          size="sm"
          className={`flex items-center space-x-1 mr-2 ${showFilters ? 'bg-pink-500' : 'border-gray-300 text-gray-700'}`}
          onClick={onToggleFilters}
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span>筛选</span>
        </Button>

        <div className="flex-1 overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Chip
                key={category}
                value={category}
                variant={selectedCategory === category ? 'filled' : 'outlined'}
                color={selectedCategory === category ? 'pink' : 'gray'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() =>
                  onCategoryChange(
                    selectedCategory === category ? '' : category,
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* 展开的筛选选项 */}
      {showFilters && (
        <div className="pt-4">
          <div className="px-4 pb-4 rounded-lg bg-gray-50 shadow-md hover:shadow-lg">
            <div className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-medium text-gray-700"
                  >
                    无障碍等级
                  </Typography>
                  <Select
                    value={selectedAccessibility}
                    onChange={onAccessibilityChange}
                    className="!border-gray-300"
                  >
                    <Option value="">全部等级</Option>
                    <Option value="A">A级 - 完全无障碍</Option>
                    <Option value="B+">B+级 - 良好</Option>
                    <Option value="B">B级 - 一般</Option>
                    <Option value="C">C级 - 有限制</Option>
                  </Select>
                </div>

                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-medium text-gray-700"
                  >
                    排序方式
                  </Typography>
                  <Select
                    value={sortBy}
                    onChange={onSortChange}
                    className="!border-gray-300"
                  >
                    <Option value="distance">距离最近</Option>
                    <Option value="rating">评分最高</Option>
                    <Option value="price-low">价格从低到高</Option>
                    <Option value="price-high">价格从高到低</Option>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSection;
