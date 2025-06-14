import axios from "axios";
// 导入各个公园的基础数据
import base494725605 from '../assets/494725605-上海迪士尼-base.json';
import base462007561 from '../assets/462007561-上海动物园-base.json';
import base39961770 from '../assets/39961770-复兴公园-base.json';
import base45220427 from '../assets/45220427-中山公园-base.json';
import base39176862 from '../assets/39176862-共青森林公园-base.json';
import base178411796 from '../assets/178411796-黄浦公园-base.json';
import base47005216 from '../assets/47005216-上海植物园-base.json';
import base40036584 from '../assets/40036584-豫园-base.json';
import base666304555 from '../assets/666304555-大宁郁金香公园-base.json';

// 构建公园ID到基础数据的映射
const baseMap = {
  "494725605": base494725605,
  "462007561": base462007561,
  "39961770": base39961770,
  "45220427": base45220427,
  "39176862": base39176862,
  "178411796": base178411796,
  "47005216": base47005216,
  "40036584": base40036584,
  "666304555": base666304555,
};

const getGeomByWayIdService = (id) => {
    const data = `[out:json][timeout:25];
// 通过 way id 查询
way(${id});
out geom;
out center;
`
    // return axios.post('https://overpass-api.de/api/interpreter',data,{
    //     headers: {
    //         'Content-Type': 'text/plain',
    //     },
    // })
  return Promise.resolve({data:baseMap[id]})
}

export default getGeomByWayIdService;
