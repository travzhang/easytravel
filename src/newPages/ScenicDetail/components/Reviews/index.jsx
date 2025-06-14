import React from 'react';
import ReviewCard from './ReviewCard';

const Reviews = ({ userReviews }) => {
  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {userReviews.map((review) => (
          <div className="flex-shrink-0 w-80 p-1">
            <ReviewCard review={review} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
