// 景区详情数据
// routes 和 accessibleRoutes 数据已迁移到 accessibleRoutesData.js

export const scenicDetails = [
  {
    id: '494725605',
    name: '上海迪士尼',
    shortDesc: '中国内地首个迪士尼度假区，七大主题园区带来魔法体验',
    image:
      'https://startuplatte.com/wp-content/uploads/2016/05/maxresdefault-2-1.jpg',
    location: '上海市浦东新区川沙新镇上海迪士尼度假区',
    openingHours: '9:00-20:00 (具体时间请查看官网)',
    accessibilityLevel: 'A',
    tags: ['主题乐园', '全程无障碍', '轮椅租赁', '无障碍设施完善', '亲子游乐'],
    description:
      '上海迪士尼度假区是中国内地首个迪士尼度假区，拥有上海迪士尼乐园、迪士尼小镇、星愿公园以及两座迪士尼主题酒店。乐园拥有七大主题园区和众多精彩游乐项目，提供完善的无障碍设施服务。',
    detailedDescription:
      '上海迪士尼度假区是中国内地首个迪士尼度假区，占地390公顷，拥有上海迪士尼乐园、迪士尼小镇、星愿公园以及两座迪士尼主题酒店。乐园拥有七大主题园区：米奇大街、奇想花园、探险岛、宝藏湾、明日世界、梦幻世界和玩具总动员，提供众多精彩游乐项目和娱乐体验。园区提供完善的无障碍设施服务，确保所有游客都能享受迪士尼的魔法体验。',
    accessibilityScore: 4.8,
    ticketPrice: '399-719元/人，儿童、老人优惠',
    visitorsToday: Math.floor(Math.random() * 15000) + 5000,
    maxCapacity: 25000,
    highlights: [
      {
        icon: '🏰',
        title: '奇幻童话城堡',
        desc: '全球最高、最大、最互动的迪士尼城堡',
      },
      {
        icon: '🎢',
        title: '创极速光轮',
        desc: '全球首发的TRON主题过山车',
      },
      {
        icon: '♿',
        title: '全程无障碍',
        desc: 'A级无障碍设施，轮椅租赁服务完善',
      },
    ],
    coordinates: {
      longitude: 121.666,
      latitude: 31.1434,
    },
    facilities: [
      '无障碍入口',
      '轮椅租赁服务',
      '无障碍厕所',
      '盲道',
      '电梯',
      '轮椅坡道',
      '手语导览',
      '盲文说明',
      '无障碍游乐设施',
      '服务犬区域',
    ],
    accessibilityFacilities: [
      { name: '轮椅租赁服务', available: true },
      { name: '无障碍厕所', available: true },
      { name: '盲道', available: true },
      { name: '电梯', available: true },
      { name: '手语导览', available: true },
      { name: '盲文说明', available: true },
      { name: '服务犬区域', available: true },
    ],
  },
  // {
  //   id: '462007561',
  //   name: '上海动物园',
  //   shortDesc: '上海最大动物园，400多种珍稀动物的科普教育基地',
  //   image:
  //     'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=400&q=80',
  //   location: '上海市长宁区虹桥路2381号',
  //   openingHours: '06:30-17:30 (全年开放)',
  //   accessibilityLevel: 'A',
  //   tags: ['动物园', '亲子', '科普教育', '全程无障碍', '轮椅租赁'],
  //   description:
  //     '上海动物园位于上海市长宁区虹桥路，是上海最大的动物园，占地面积74.3万平方米。园内饲养展出各种珍稀动物400多种，6000多只（头），其中有世界闻名的大熊猫、金丝猴、华南虎、扬子鳄等中国特产珍稀野生动物。',
  //   detailedDescription:
  //     '上海动物园位于上海市长宁区虹桥路，是上海最大的动物园，占地面积74.3万平方米。园内饲养展出各种珍稀动物400多种，6000多只（头），其中有世界闻名的大熊猫、金丝猴、华南虎、扬子鳄等中国特产珍稀野生动物。动物园分为小动物园、食草动物区、食肉动物区、灵长动物区、鸟类区等多个展区，为游客提供丰富的动物观赏体验和科普教育机会。',
  //   accessibilityScore: 4.5,
  //   ticketPrice: '40元/人，学生半价',
  //   visitorsToday: Math.floor(Math.random() * 8000) + 2000,
  //   maxCapacity: 15000,
  //   highlights: [
  //     {
  //       icon: '🐼',
  //       title: '珍稀动物',
  //       desc: '拥有400多种珍稀动物，包括大熊猫、金丝猴等',
  //     },
  //     {
  //       icon: '👨‍👩‍👧‍👦',
  //       title: '亲子乐园',
  //       desc: '适合全家游玩的科普教育基地',
  //     },
  //     {
  //       icon: '♿',
  //       title: '无障碍友好',
  //       desc: 'A级无障碍设施，轮椅通行无障碍',
  //     },
  //   ],
  //   coordinates: {
  //     longitude: 121.3589,
  //     latitude: 31.1951,
  //   },
  //   facilities: [
  //     '无障碍入口',
  //     '轮椅租赁服务',
  //     '无障碍厕所',
  //     '轮椅坡道',
  //     '盲道',
  //     '电梯',
  //     '母婴室',
  //   ],
  //   accessibilityFacilities: [
  //     { name: '轮椅租赁服务', available: true },
  //     { name: '无障碍厕所', available: true },
  //     { name: '盲道', available: true },
  //     { name: '电梯', available: true },
  //     { name: '手语导览', available: true },
  //     { name: '盲文说明', available: true },
  //     { name: '服务犬区域', available: true },
  //   ],
  // },
  {
    id: '39961770',
    name: '复兴公园',
    shortDesc: '上海保存最完整的法式园林，百年历史的城市绿洲',
    image:
      '/fuxing.png',
    location: '上海市黄浦区雁荡路105号',
    openingHours: '05:00-18:00 (全年开放)',
    accessibilityLevel: 'B+',
    tags: ['城市公园', '休闲散步', '绿化景观', '部分无障碍', '法式园林'],
    description:
      '复兴公园是上海市中心的一座法式风格公园，建于1909年，是上海保存最完整的法式园林。公园内绿树成荫，花草繁茂，有玫瑰园、牡丹园等特色景观，是市民休闲娱乐的好去处。',
    coordinates: {
      longitude: 121.4737,
      latitude: 31.2204,
    },
    highlights: [
      {
        icon: '🌹',
        title: '法式园林',
        desc: '上海保存最完整的法式风格园林',
      },
      {
        icon: '🌸',
        title: '玫瑰花园',
        desc: '春夏季节玫瑰花盛开，香气怡人',
      },
      {
        icon: '🏛️',
        title: '历史建筑',
        desc: '建于1909年，承载百年历史文化',
      },
    ],
    facilities: ['无障碍入口', '无障碍厕所', '轮椅坡道', '休息座椅'],
    accessibilityFacilities: [
      { name: '轮椅租赁服务', available: false },
      { name: '无障碍厕所', available: true },
      { name: '盲道', available: false },
      { name: '电梯', available: false },
      { name: '手语导览', available: false },
      { name: '盲文说明', available: false },
      { name: '服务犬区域', available: true },
    ],
  },
  {
    id: '45220427',
    name: '中山公园',
    shortDesc: '上海著名樱花观赏地，春季开花满园的综合性公园',
    image:
      '/zhongshan.webp',
    location: '上海市长宁区长宁路780号',
    openingHours: '05:00-18:00 (全年开放)',
    accessibilityLevel: 'B+',
    tags: ['城市公园', '樱花', '休闲娱乐', '部分无障碍', '春季赏花'],
    description:
      '中山公园是上海市区内的一座综合性公园，以樱花闻名，每年春季樱花盛开时吸引众多游客。公园内有湖泊、亭台楼阁、儿童游乐区等设施，是市民休闲娱乐的重要场所。',
    coordinates: {
      longitude: 121.4187,
      latitude: 31.2234,
    },
    highlights: [
      {
        icon: '🌸',
        title: '樱花胜地',
        desc: '上海著名的樱花观赏地，春季花开满园',
      },
      {
        icon: '🏞️',
        title: '湖心美景',
        desc: '湖心岛风景如画，倒影迷人',
      },
      {
        icon: '👨‍👩‍👧‍👦',
        title: '亲子天地',
        desc: '儿童游乐区设施齐全，适合家庭游玩',
      },
    ],
    facilities: [
      '无障碍入口',
      '无障碍厕所',
      '轮椅坡道',
      '休息座椅',
      '儿童游乐区',
    ],
    accessibilityFacilities: [
      { name: '轮椅租赁服务', available: false },
      { name: '无障碍厕所', available: true },
      { name: '盲道', available: true },
      { name: '电梯', available: false },
      { name: '手语导览', available: false },
      { name: '盲文说明', available: false },
      { name: '服务犬区域', available: true },
    ],
  },
  {
    id: '39176862',
    name: '共青森林公园',
    shortDesc: '上海最大的森林公园，天然氧吧和生态休闲胜地',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80',
    location: '上海市杨浦区军工路2000号',
    openingHours: '06:00-17:00 (全年开放)',
    accessibilityLevel: 'B+',
    tags: ['森林公园', '生态旅游', '休闲健身', '部分无障碍', '天然氧吧'],
    description:
      '共青森林公园是上海市区内最大的森林公园，占地1965亩，森林覆盖率达90%以上。公园内有湖泊、草坪、森林等多种生态景观，是市民休闲健身、亲近自然的理想场所。',
    detailedDescription:
      '共青森林公园位于上海市杨浦区，是上海市区内最大的森林公园，占地1965亩，森林覆盖率达90%以上。公园分为南北两园，南园以植物造景为主，北园以游乐休闲为主。园内有湖泊、草坪、森林、花园等多种生态景观，空气清新，是市民休闲健身、亲近自然的理想场所。',
    accessibilityScore: 4.2,
    ticketPrice: '15元/人，学生半价',
    visitorsToday: Math.floor(Math.random() * 5000) + 1000,
    maxCapacity: 10000,
    highlights: [
      {
        icon: '🌲',
        title: '森林氧吧',
        desc: '森林覆盖率90%以上，天然氧吧',
      },
      {
        icon: '🏃‍♂️',
        title: '健身步道',
        desc: '多条健身步道，适合晨练和休闲运动',
      },
      {
        icon: '🦆',
        title: '湖心美景',
        desc: '湖泊清澈，野鸭嬉戏，生态环境优美',
      },
    ],
    coordinates: {
      longitude: 121.5234,
      latitude: 31.2876,
    },
    facilities: [
      '无障碍入口',
      '无障碍厕所',
      '轮椅坡道',
      '休息座椅',
      '健身器材',
    ],
    accessibilityFacilities: [
      { name: '轮椅租赁服务', available: false },
      { name: '无障碍厕所', available: true },
      { name: '盲道', available: true },
      { name: '电梯', available: false },
      { name: '手语导览', available: false },
      { name: '盲文说明', available: false },
      { name: '服务犬区域', available: true },
    ],
  },
  {
    id: '178411796',
    name: '黄浦公园',
    shortDesc: '上海最早的公园，外滩历史文化的重要组成部分',
    image:
      '/huangpu.jpeg',
    location: '上海市黄浦区中山东一路28号',
    openingHours: '06:00-18:00 (全年开放)',
    accessibilityLevel: 'B',
    tags: ['历史公园', '外滩景观', '文化遗产', '基础无障碍', '城市地标'],
    description:
      '黄浦公园是上海最早的公园，建于1868年，位于外滩北端，是外滩历史文化的重要组成部分。公园内有人民英雄纪念塔、外滩历史纪念馆等历史文化设施。',
    detailedDescription:
      '黄浦公园位于上海市黄浦区外滩北端，是上海最早的公园，建于1868年。公园占地面积不大，但历史意义重大，是外滩历史文化的重要组成部分。园内有人民英雄纪念塔、外滩历史纪念馆等历史文化设施，可以俯瞰黄浦江和浦东陆家嘴的美景。',
    accessibilityScore: 3.8,
    ticketPrice: '免费',
    visitorsToday: Math.floor(Math.random() * 3000) + 500,
    maxCapacity: 5000,
    highlights: [
      {
        icon: '🏛️',
        title: '历史地标',
        desc: '上海最早的公园，承载150多年历史',
      },
      {
        icon: '🌊',
        title: '江景观赏',
        desc: '可俯瞰黄浦江和浦东陆家嘴美景',
      },
      {
        icon: '📚',
        title: '文化教育',
        desc: '外滩历史纪念馆，了解上海历史文化',
      },
    ],
    coordinates: {
      longitude: 121.4944,
      latitude: 31.2459,
    },
    facilities: [
      '无障碍入口',
      '无障碍厕所',
      '休息座椅',
      '观景台',
    ],
    accessibilityFacilities: [
      { name: '轮椅租赁服务', available: false },
      { name: '无障碍厕所', available: true },
      { name: '盲道', available: false },
      { name: '电梯', available: false },
      { name: '手语导览', available: false },
      { name: '盲文说明', available: false },
      { name: '服务犬区域', available: false },
    ],
  },
  {
    id: '47005216',
    name: '上海植物园',
    shortDesc: '华东地区最大的植物园，植物科普教育和生态旅游基地',
    image:
      '/zhiwuyuan.webp',
    location: '上海市徐汇区龙吴路1111号',
    openingHours: '07:00-17:00 (全年开放)',
    accessibilityLevel: 'A-',
    tags: ['植物园', '科普教育', '生态旅游', '较好无障碍', '亲子游学'],
    description:
      '上海植物园是华东地区最大的植物园，占地81.86公顷，收集和展示植物3000多种。园内有17个专类园，是集科学研究、科普教育、游览观赏于一体的综合性植物园。',
    detailedDescription:
      '上海植物园位于上海市徐汇区，是华东地区最大的植物园，占地81.86公顷，收集和展示植物3000多种。园内设有17个专类园，包括蔷薇园、牡丹园、桂花园、竹园等，还有温室群、盆景园等特色景观。植物园集科学研究、科普教育、游览观赏于一体，是了解植物知识、亲近自然的理想场所。',
    accessibilityScore: 4.3,
    ticketPrice: '15元/人，学生半价',
    visitorsToday: Math.floor(Math.random() * 6000) + 1500,
    maxCapacity: 12000,
    highlights: [
      {
        icon: '🌺',
        title: '专类花园',
        desc: '17个专类园，四季花开不断',
      },
      {
        icon: '🏠',
        title: '温室群',
        desc: '热带植物温室，珍稀植物展示',
      },
      {
        icon: '📖',
        title: '科普教育',
        desc: '植物科普基地，适合亲子游学',
      },
    ],
    coordinates: {
      longitude: 121.4372,
      latitude: 31.1508,
    },
    facilities: [
      '无障碍入口',
      '轮椅租赁服务',
      '无障碍厕所',
      '轮椅坡道',
      '盲道',
      '休息座椅',
    ],
    accessibilityFacilities: [
      { name: '轮椅租赁服务', available: true },
      { name: '无障碍厕所', available: true },
      { name: '盲道', available: true },
      { name: '电梯', available: false },
      { name: '手语导览', available: false },
      { name: '盲文说明', available: true },
      { name: '服务犬区域', available: true },
    ],
  },
  {
    id: '40036584',
    name: '豫园',
    shortDesc: '明代古典园林，江南园林艺术的杰出代表',
    image:
      '/yuyuan.jpg',
    location: '上海市黄浦区福佑路168号',
    openingHours: '08:30-17:00 (全年开放)',
    accessibilityLevel: 'C+',
    tags: ['古典园林', '历史文化', '传统建筑', '有限无障碍', '文化遗产'],
    description:
      '豫园是明代的私人花园，始建于1559年，是江南古典园林的杰出代表。园内有40余处古建筑，以精美的雕刻、典雅的布局著称，是了解中国传统园林艺术的重要场所。',
    detailedDescription:
      '豫园位于上海市黄浦区，是明代的私人花园，始建于1559年，距今已有400多年历史。豫园占地约2万平方米，园内有40余处古建筑，包括三穗堂、仰山堂、玉华堂、积玉水廊等，以精美的雕刻、典雅的布局、巧妙的设计著称，是江南古典园林的杰出代表，也是了解中国传统园林艺术的重要场所。',
    accessibilityScore: 3.2,
    ticketPrice: '30元/人，学生半价',
    visitorsToday: Math.floor(Math.random() * 8000) + 2000,
    maxCapacity: 15000,
    highlights: [
      {
        icon: '🏯',
        title: '古典建筑',
        desc: '40余处明清古建筑，雕梁画栋',
      },
      {
        icon: '🎨',
        title: '园林艺术',
        desc: '江南园林艺术的杰出代表',
      },
      {
        icon: '📿',
        title: '文化底蕴',
        desc: '400多年历史，深厚文化内涵',
      },
    ],
    coordinates: {
      longitude: 121.4925,
      latitude: 31.2270,
    },
    facilities: [
      '无障碍入口',
      '无障碍厕所',
      '休息座椅',
    ],
    accessibilityFacilities: [
      { name: '轮椅租赁服务', available: false },
      { name: '无障碍厕所', available: true },
      { name: '盲道', available: false },
      { name: '电梯', available: false },
      { name: '手语导览', available: false },
      { name: '盲文说明', available: false },
      { name: '服务犬区域', available: false },
    ],
  },
  {
    id: '666304555',
    name: '大宁郁金香公园',
    shortDesc: '上海最大的郁金香主题公园，春季花海绚烂多彩',
    image:
      '/yujinxiang.jpeg',
    location: '上海市静安区广中西路288号',
    openingHours: '06:00-18:00 (全年开放)',
    accessibilityLevel: 'B+',
    tags: ['主题公园', '郁金香', '春季赏花', '部分无障碍', '摄影胜地'],
    description:
      '大宁郁金香公园是上海最大的郁金香主题公园，每年春季有数十万株郁金香盛开，形成绚烂多彩的花海景观。公园还有湖泊、草坪、儿童游乐区等设施。',
    detailedDescription:
      '大宁郁金香公园位于上海市静安区，是上海最大的郁金香主题公园，占地面积约68公顷。每年春季3-5月，园内有数十万株、100多个品种的郁金香盛开，形成绚烂多彩的花海景观，是上海春季赏花的热门目的地。除了郁金香，公园还有湖泊、草坪、儿童游乐区、健身步道等设施，是市民休闲娱乐的好去处。',
    accessibilityScore: 4.1,
    ticketPrice: '20元/人，郁金香花期30元/人',
    visitorsToday: Math.floor(Math.random() * 7000) + 1500,
    maxCapacity: 12000,
    highlights: [
      {
        icon: '🌷',
        title: '郁金香花海',
        desc: '春季数十万株郁金香盛开，绚烂多彩',
      },
      {
        icon: '📸',
        title: '摄影天堂',
        desc: '花海景观绝美，是摄影爱好者的天堂',
      },
      {
        icon: '🏞️',
        title: '生态休闲',
        desc: '湖泊草坪相映，环境优美宜人',
      },
    ],
    coordinates: {
      longitude: 121.4456,
      latitude: 31.2789,
    },
    facilities: [
      '无障碍入口',
      '无障碍厕所',
      '轮椅坡道',
      '休息座椅',
      '儿童游乐区',
    ],
    accessibilityFacilities: [
      { name: '轮椅租赁服务', available: false },
      { name: '无障碍厕所', available: true },
      { name: '盲道', available: true },
      { name: '电梯', available: false },
      { name: '手语导览', available: false },
      { name: '盲文说明', available: false },
      { name: '服务犬区域', available: true },
    ],
  },
];

// 推荐景区数据 - 直接指定顺序
export const recommendedScenics = [
  // 指定的四个景点
  scenicDetails.find(s => s.id === '666304555'), // 大宁郁金香公园
  scenicDetails.find(s => s.id === '47005216'),  // 上海植物园  
  scenicDetails.find(s => s.id === '40036584'),  // 豫园
  scenicDetails.find(s => s.id === '39961770'),  // 复兴公园
  // 其他景点按无障碍等级排序
  ...scenicDetails
    .filter(s => !['666304555', '47005216', '40036584', '39961770'].includes(s.id))
    .sort((a, b) => {
      const accessibilityLevelOrder = {
        'A+': 1, 'A': 2, 'A-': 3, 'B+': 4, 'B': 5, 'B-': 6, 'C+': 7, 'C': 8, 'C-': 9,
      };
      const levelA = accessibilityLevelOrder[a.accessibilityLevel] || 10;
      const levelB = accessibilityLevelOrder[b.accessibilityLevel] || 10;
      return levelA - levelB;
    })
].filter(Boolean); // 过滤掉可能的undefined值

// 根据ID获取景区详情
export const getScenicDetailById = (id) => {
  return scenicDetails.find((scenic) => scenic.id === id);
};

// 获取所有景区详情
export const getAllScenicDetails = () => {
  return scenicDetails;
};

// 根据无障碍等级筛选景区
export const getScenicsByAccessibilityLevel = (level) => {
  return scenicDetails.filter((scenic) => scenic.accessibilityLevel === level);
};

// 根据标签筛选景区
export const getScenicsByTag = (tag) => {
  return scenicDetails.filter((scenic) => scenic.tags.includes(tag));
};
