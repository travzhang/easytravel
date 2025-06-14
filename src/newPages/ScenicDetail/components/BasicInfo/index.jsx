import React from 'react';
import { Card, CardBody, Typography, Chip } from '@material-tailwind/react';
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const BasicInfo = ({ scenicData }) => {
  const getAccessibilityColor = (level) => {
    switch (level) {
      case 'A':
        return 'green';
      case 'B+':
        return 'blue';
      case 'B':
        return 'amber';
      case 'C':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Card className="mx-4 mt-4 shadow-lg">
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Typography variant="h4" color="blue-gray" className="mb-2">
              {scenicData.name}
            </Typography>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPinIcon className="h-4 w-4" />
              <Typography variant="small">{scenicData.location}</Typography>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <ClockIcon className="h-4 w-4" />
              <Typography variant="small">{scenicData.openingHours}</Typography>
            </div>
          </div>
          <Chip
            value={`无障碍等级 ${scenicData.accessibilityLevel}`}
            color={getAccessibilityColor(scenicData.accessibilityLevel)}
            className="shrink-0"
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            <div>
              <Typography variant="small" color="gray" className="font-medium">
                门票价格
              </Typography>
              <Typography variant="small" className="font-bold text-green-600">
                {scenicData.ticketPrice}
              </Typography>
            </div>
          </div>
        </div>

        <Typography
          variant="paragraph"
          color="gray"
          className="leading-relaxed"
        >
          {scenicData.detailedDescription}
        </Typography>

        <div className="flex flex-wrap gap-2 mt-4">
          {scenicData.tags.map((tag, index) => (
            <Chip
              key={index}
              value={tag}
              variant="ghost"
              size="sm"
              className="text-blue-600 bg-blue-50"
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default BasicInfo;
