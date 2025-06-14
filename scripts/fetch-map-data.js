import axios from "axios";
import fs from "fs";
const OverpassInterpreterService = (bounds) => {

  const  {
    minlat,
    minlon,
    maxlat,
    maxlon
  } = bounds

  const key = `${minlat},${minlon},${maxlat},${maxlon}`

  const data = `
[out:json][timeout:30];

(
  way["highway"](${key});
// 🚶 无障碍道路（含人行道、轮椅通行路径、带坡道道路）
way["highway"]["wheelchair"](${key});
way["highway"]["footway"="sidewalk"](${key});
way["ramp"="yes"](${key});
way["kerb"="flush"](${key});

// 🚻 基础无障碍设施
node["amenity"="toilets"]["wheelchair"="yes"](${key});
node["amenity"="parking"]["wheelchair"="yes"](${key});
node["amenity"="bench"](${key});
node["amenity"="restaurant"]["wheelchair"="yes"](${key});
node["amenity"="cafe"]["wheelchair"="yes"](${key});
node["shop"]["wheelchair"="yes"](${key});
node["amenity"="first_aid"](${key});
node["emergency"="phone"](${key});

// 🏢 出入口、电梯、信息服务等
node["entrance"]["wheelchair"="yes"](${key});
node["entrance"="main"]["wheelchair"="yes"](${key});
node["highway"="elevator"](${key});
node["tourism"="information"](${key});

// 🔄 辅助信息（坡道、路缘、轮椅标签）
node["kerb"="flush"](${key});
node["ramp"="yes"](${key});
node["wheelchair"="yes"](${key});

// 🏗 建筑物
way["building"](${key});
);

out geom;`
  return axios.post('https://overpass-api.de/api/interpreter',data,{
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}

const getGeomByWayIdService = (id) => {
  const data = `[out:json][timeout:25];
// 通过 way id 查询
way(${id});
out geom;
out center;
`
  return axios.post('https://overpass-api.de/api/interpreter',data,{
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}

// 建议逐个请求
const list = [
  { value:'494725605', label: '上海迪士尼' },
  { value:'462007561', label: '上海动物园' },
  { value: '39961770', label: '复兴公园' },
  { value: '45220427', label: '中山公园' },
  { value: '39176862', label: '共青森林公园' },
  { value: '178411796', label: '黄浦公园' },
  { value: '47005216', label: '上海植物园' },
  { value: '40036584', label: '豫园' },
  { value: '666304555', label: '大宁郁金香公园' }
]



for (let i = 0; i <list.length ; i++) {
  const item = list[i];
  await getGeomByWayIdService(item.value).then(r=>{
    console.log(`Fetching data for ${item.label} (${item.value})...`);
    fs.writeFileSync(`${item.value}-${item.label}-base.json`, JSON.stringify(r.data), null, 2);
    const bounds = r.data.elements[0].bounds;
    return OverpassInterpreterService(bounds).then(res=>{
      console.log(`Fetched data for ${item.label} (${item.value})`);
      fs.writeFileSync(`${item.value}-${item.label}-way.json`, JSON.stringify(res.data), null, 2);
    })
  })
}
