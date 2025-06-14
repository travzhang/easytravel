import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Input } from '@material-tailwind/react';

export default function SearchBar() {
  const [searchValue, setSearchValue] = useState('');
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="搜索景点、设施或服务"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="!border-gray-300 focus:!border-blue-500 rounded-full pl-12"
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
}
