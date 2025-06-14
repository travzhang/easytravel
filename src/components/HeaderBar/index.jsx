import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, IconButton } from '@material-tailwind/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const HeaderBar = ({
  title,
  backPath = '/profile',
  showBackButton = true,
  rightContent = null,
  className = '',
  onBack = null,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(backPath);
    }
  };

  return (
    <div className={`bg-white shadow-sm border-b border-gray-100 ${className}`}>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <IconButton
              variant="text"
              size="sm"
              onClick={handleBack}
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </IconButton>
          )}
          <Typography variant="h5" color="blue-gray" className="font-bold">
            {title}
          </Typography>
        </div>
        {rightContent && (
          <div className="flex items-center">{rightContent}</div>
        )}
      </div>
    </div>
  );
};

export default HeaderBar;
