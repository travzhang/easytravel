import React from 'react';
import { Typography } from '@material-tailwind/react';

const Overview = ({ scenicData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3">
        {scenicData.highlights.map((highlight, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-2xl">{highlight.icon}</span>
            <div>
              <Typography
                variant="small"
                className="font-semibold text-gray-800"
              >
                {highlight.title}
              </Typography>
              <Typography variant="small" color="gray">
                {highlight.desc}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
