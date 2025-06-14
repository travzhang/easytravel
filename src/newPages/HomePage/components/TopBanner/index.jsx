import { Carousel, Typography } from '@material-tailwind/react';

// 轮播图数据 - Airbnb 风格的精美图片
const BANNERS_INFO = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    title: '发现无障碍旅行的美好',
    subtitle: '为每个人打造舒适的旅行体验',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
    title: '探索无限可能',
    subtitle: '每一次旅行都是新的开始',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    title: '贴心无障碍服务',
    subtitle: '让旅行变得如此轻松愉快',
  },
];

export default function TopBanner() {
  return (
    <Carousel
      className="rounded-2xl overflow-hidden shadow-lg h-60"
      autoplay={true}
      loop={true}
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
      {BANNERS_INFO.map((banner) => (
        <div key={banner.id} className="relative h-full">
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <Typography variant="h5" color="white" className="mb-1">
              {banner.title}
            </Typography>
            <Typography variant="small" color="white" className="opacity-90">
              {banner.subtitle}
            </Typography>
          </div>
        </div>
      ))}
    </Carousel>
  );
}
