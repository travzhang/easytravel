import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@material-tailwind/react';

// 导入拆分的组件
import SearchBar from './components/SearchBar';
import FilterSection from './components/FilterSection';
import FilterTags from './components/FilterTags';
import ScenicCard from './components/ScenicCard';
import EmptyState from './components/EmptyState';
import { mockScenicData } from '../../mock/scenicDataList';

const ScenicAreaList = () => {
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccessibility, setSelectedAccessibility] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [favorites, setFavorites] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = [...new Set(mockScenicData.map((item) => item.category))];
    return cats;
  }, []);

  // 筛选和排序逻辑
  const filteredAndSortedData = useMemo(() => {
    let filtered = mockScenicData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;
      const matchesAccessibility =
        !selectedAccessibility ||
        item.accessibilityLevel === selectedAccessibility;

      return matchesSearch && matchesCategory && matchesAccessibility;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
        default:
          return parseFloat(a.distance) - parseFloat(b.distance);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedAccessibility, sortBy]);

  // 切换收藏状态
  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  // 获取无障碍等级颜色
  const getAccessibilityColor = (level) => {
    switch (level) {
      case 'A':
        return 'green';
      case 'B+':
        return 'blue';
      case 'B':
        return 'orange';
      case 'C':
        return 'red';
      default:
        return 'gray';
    }
  };

  // 点击外部区域收起筛选菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // 清除筛选条件的处理函数
  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedAccessibility('');
    setSortBy('distance');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部搜索和筛选区域 - 固定在顶部 */}
      <div
        ref={filterRef}
        className="bg-white shadow-md sticky top-0 z-10 rounded-br-lg rounded-bl-lg"
      >
        <div className="px-4 py-4">
          {/* 搜索框 */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* 筛选区域 */}
          <FilterSection
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedAccessibility={selectedAccessibility}
            onAccessibilityChange={setSelectedAccessibility}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* 当前筛选条件标签 */}
        <FilterTags
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          selectedAccessibility={selectedAccessibility}
          sortBy={sortBy}
          onClearSearch={() => setSearchQuery('')}
          onClearCategory={() => setSelectedCategory('')}
          onClearAccessibility={() => setSelectedAccessibility('')}
          onClearSort={() => setSortBy('distance')}
          onClearAll={handleClearAll}
        />
      </div>

      {/* 结果统计 */}
      <div
        className={`px-4 py-3 bg-white border-b transition-all duration-300 ${
          showFilters ? 'blur-sm opacity-60' : ''
        }`}
      >
        <Typography variant="small" className="text-gray-600">
          找到 {filteredAndSortedData.length} 个景区
        </Typography>
      </div>

      {/* 景区列表 */}
      <div
        className={`px-4 py-4 transition-all duration-300 ${
          showFilters ? 'blur-sm opacity-60 pointer-events-none' : ''
        }`}
      >
        {filteredAndSortedData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedData.map((scenic) => (
              <ScenicCard
                key={scenic.id}
                scenic={scenic}
                isFavorite={favorites.has(scenic.id)}
                onToggleFavorite={toggleFavorite}
                onCardClick={(id) => navigate(`/scenic/${id}`)}
                getAccessibilityColor={getAccessibilityColor}
              />
            ))}
          </div>
        ) : (
          <div
            className={`transition-all duration-300 ${
              showFilters ? 'blur-sm opacity-60' : ''
            }`}
          >
            <EmptyState />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenicAreaList;
