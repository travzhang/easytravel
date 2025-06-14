import axios from "axios";
// 导入各个公园的无障碍设施数据
import way494725605 from '../assets/494725605-上海迪士尼-way.json';
import way462007561 from '../assets/462007561-上海动物园-way.json';
import way39961770 from '../assets/39961770-复兴公园-way.json';
import way45220427 from '../assets/45220427-中山公园-way.json';
import way39176862 from '../assets/39176862-共青森林公园-way.json';
import way178411796 from '../assets/178411796-黄浦公园-way.json';
import way47005216 from '../assets/47005216-上海植物园-way.json';
import way40036584 from '../assets/40036584-豫园-way.json';
import way666304555 from '../assets/666304555-大宁郁金香公园-way.json';

// 构建公园ID到无障碍设施数据的映射
const wayMap = {
  "494725605": way494725605,
  "462007561": way462007561,
  "39961770": way39961770,
  "45220427": way45220427,
  "39176862": way39176862,
  "178411796": way178411796,
  "47005216": way47005216,
  "40036584": way40036584,
  "666304555": way666304555,
};
const OverpassInterpreterService = (bounds,wayid) => {

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


    // return axios.post('https://overpass-api.de/api/interpreter',data,{
    //     headers: {
    //         'Content-Type': 'text/plain',
    //     },
    // })
  return Promise.resolve({data:wayMap[wayid]})
}

export default OverpassInterpreterService;
