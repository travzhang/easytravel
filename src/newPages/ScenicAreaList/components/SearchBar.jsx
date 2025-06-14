import React from 'react';
import { Input } from '@material-tailwind/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative mb-4">
      <Input
        type="text"
        placeholder="搜索景区、位置或标签..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="!border-gray-300 focus:!border-pink-500 rounded-full pl-12"
        labelProps={{
          className: 'hidden',
        }}
        containerProps={{
          className: 'min-w-0',
        }}
      />
      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
};

export default SearchBar;
