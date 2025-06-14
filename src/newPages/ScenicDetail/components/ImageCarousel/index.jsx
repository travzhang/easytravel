import React from 'react';
import { Carousel } from '@material-tailwind/react';

const ImageCarousel = ({ images }) => {
  return (
    <div className="relative h-64 rounded-bl-lg rounded-br-lg overflow-hidden">
      <Carousel
        className="rounded-none"
        navigation={({ setActiveIndex, activeIndex, length }) => (
          <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
            {new Array(length).fill('').map((_, i) => (
              <span
                key={i}
                className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                  activeIndex === i ? 'w-8 bg-white' : 'w-4 bg-white/50'
                }`}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        )}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`景区图片 ${index + 1}`}
            className="h-full w-full object-cover"
          />
        ))}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;
