import React from 'react';
import { Button } from '@material-tailwind/react';
import { MapIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';

const ActionBar = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
      <div className="flex gap-3">
        <Button
          size="lg"
          variant="outlined"
          className="flex-1 flex items-center justify-center gap-2 border-pink-500 text-pink-600 hover:bg-pink-50"
          onClick={() => {
            if (id==='462007561') {
              // 如果是上海动物园
              navigate(`/zoo-map/${id}`)
            } else {
              navigate(`/map/${id}`)
            }
          }}
        >
          <MapIcon className="h-5 w-5" />
          查看无障碍地图
        </Button>
      </div>
    </div>
  );
};

export default ActionBar;
