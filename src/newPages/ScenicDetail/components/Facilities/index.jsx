import React from 'react';
import { Typography } from '@material-tailwind/react';

const Facilities = ({ scenicData }) => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {scenicData.enhancedFacilities.map((facility, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 border border-transparent hover:border-gray-200"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm">
              <span className="text-lg">{facility.icon}</span>
            </div>
            <div className="text-center">
              <Typography
                variant="small"
                className="font-medium text-gray-800 text-xs leading-tight"
              >
                {facility.name}
              </Typography>
              <Typography
                variant="small"
                color="gray"
                className="text-xs mt-1 leading-tight"
              >
                {facility.desc}
              </Typography>
            </div>
            <div
              className="w-2 h-2 bg-green-500 rounded-full"
              title="可用"
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Facilities;
