import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Typography,
  Progress,
  Chip,
  Alert,
  IconButton,
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
} from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  HeartIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const HealthManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('activity');
  const [activityData, setActivityData] = useState({
    steps: 8456,
    distance: 6.2,
    calories: 320,
    activeTime: 85,
    heartRateAvg: 78,
    fatigueLevel: 3,
  });

  const [medications, setMedications] = useState([
    {
      id: 1,
      name: '降压药',
      dosage: '5mg',
      frequency: '每日一次',
      time: '08:00',
      taken: false,
      nextDue: '2024-12-13 08:00',
    },
    {
      id: 2,
      name: '心脏病药物',
      dosage: '10mg',
      frequency: '每日两次',
      time: '08:00,20:00',
      taken: true,
      nextDue: '2024-12-13 20:00',
    },
  ]);

  const [vitals, setVitals] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 36.5,
    bloodSugar: null,
  });

  const scenicConditions = {
    weather: '晴朗',
    temperature: 24,
    crowdLevel: 3,
    accessibilityStatus: 'good',
    airQuality: 'excellent',
    uvIndex: 6,
  };

  const [healthRecords, setHealthRecords] = useState([
    {
      id: 1,
      date: '2024-12-12',
      type: '用药记录',
      content: '按时服用降压药',
      status: 'completed',
    },
    {
      id: 2,
      date: '2024-12-12',
      type: '疲劳监测',
      content: '中度疲劳，已休息30分钟',
      status: 'completed',
    },
  ]);

  const healthFeatures = [
    {
      id: 'activity',
      title: '运动追踪',
      icon: HeartIcon,
      color: 'pink',
      description: '基于运动数据的疲劳监测',
    },
    {
      id: 'medications',
      title: '用药提醒',
      icon: ClockIcon,
      color: 'green',
      description: '药物服用提醒管理',
    },
    {
      id: 'vitals',
      title: '生命体征',
      icon: UserIcon,
      color: 'blue',
      description: '记录血压心率等数据',
    },
    {
      id: 'scenic-conditions',
      title: '景区环境',
      icon: GlobeAltIcon,
      color: 'orange',
      description: '天气、人流、无障碍信息',
    },
  ];

  const fatigueLabels = {
    1: '精力充沛',
    2: '轻微疲劳',
    3: '中度疲劳',
    4: '明显疲劳',
    5: '严重疲劳',
  };

  const getFatigueColor = (level) => {
    if (level <= 2) return 'green';
    if (level === 3) return 'yellow';
    return 'red';
  };

  const markMedicationTaken = (medId) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === medId ? { ...med, taken: true } : med)),
    );
  };

  const renderActivityTracker = () => (
    <div className="space-y-6">
      {/* 疲劳等级卡片 */}
      <Card className="shadow-lg">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Typography
              variant="h5"
              color="blue-gray"
              className="font-semibold"
            >
              当前疲劳等级
            </Typography>
            <Chip
              value={fatigueLabels[activityData.fatigueLevel]}
              color={getFatigueColor(activityData.fatigueLevel)}
              className="rounded-full"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="small" color="gray">
                疲劳程度
              </Typography>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium"
              >
                {activityData.fatigueLevel}/5
              </Typography>
            </div>
            <Progress
              value={(activityData.fatigueLevel / 5) * 100}
              color={getFatigueColor(activityData.fatigueLevel)}
              className="h-2"
            />
          </div>

          {activityData.fatigueLevel >= 4 && (
            <Alert
              color="red"
              icon={<ExclamationTriangleIcon className="h-5 w-5" />}
              className="mb-4"
            >
              疲劳等级较高，建议找个地方休息一下
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* 运动数据卡片 */}
      <Card className="shadow-lg">
        <CardBody className="p-6">
          <Typography
            variant="h5"
            color="blue-gray"
            className="font-semibold mb-4"
          >
            今日运动数据
          </Typography>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <Typography variant="h4" color="pink" className="font-bold">
                {activityData.steps.toLocaleString()}
              </Typography>
              <Typography variant="small" color="gray">
                步数
              </Typography>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Typography variant="h4" color="blue" className="font-bold">
                {activityData.distance}
              </Typography>
              <Typography variant="small" color="gray">
                公里
              </Typography>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Typography variant="h4" color="green" className="font-bold">
                {activityData.calories}
              </Typography>
              <Typography variant="small" color="gray">
                卡路里
              </Typography>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Typography variant="h4" color="orange" className="font-bold">
                {activityData.heartRateAvg}
              </Typography>
              <Typography variant="small" color="gray">
                平均心率
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-4">
      {medications.map((med) => (
        <Card key={med.id} className="shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="font-semibold"
                >
                  {med.name}
                </Typography>
                <Typography variant="small" color="gray" className="mb-2">
                  {med.dosage} · {med.frequency}
                </Typography>
                <Typography variant="small" color="gray">
                  下次服药: {med.nextDue}
                </Typography>
              </div>

              <div className="flex items-center gap-2">
                {med.taken ? (
                  <Chip
                    value="已服用"
                    color="green"
                    icon={<CheckCircleIcon className="h-4 w-4" />}
                    className="rounded-full"
                  />
                ) : (
                  <Button
                    size="sm"
                    color="pink"
                    onClick={() => markMedicationTaken(med.id)}
                    className="rounded-full"
                  >
                    标记已服用
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  const renderVitals = () => (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardBody className="p-6">
          <Typography
            variant="h5"
            color="blue-gray"
            className="font-semibold mb-4"
          >
            生命体征监测
          </Typography>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <Typography variant="paragraph" color="blue-gray">
                心率
              </Typography>
              <Typography variant="h6" color="pink" className="font-semibold">
                {vitals.heartRate} bpm
              </Typography>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <Typography variant="paragraph" color="blue-gray">
                血压
              </Typography>
              <Typography variant="h6" color="blue" className="font-semibold">
                {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}{' '}
                mmHg
              </Typography>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <Typography variant="paragraph" color="blue-gray">
                体温
              </Typography>
              <Typography variant="h6" color="green" className="font-semibold">
                {vitals.temperature}°C
              </Typography>
            </div>
          </div>

          <Button
            color="pink"
            className="w-full mt-4 rounded-full"
            onClick={() => {}}
          >
            记录新数据
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  const renderScenicConditions = () => (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardBody className="p-6">
          <Typography
            variant="h5"
            color="blue-gray"
            className="font-semibold mb-4"
          >
            景区环境状况
          </Typography>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Typography variant="h6" color="blue" className="font-bold">
                {scenicConditions.weather}
              </Typography>
              <Typography variant="small" color="gray">
                天气
              </Typography>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Typography variant="h6" color="orange" className="font-bold">
                {scenicConditions.temperature}°C
              </Typography>
              <Typography variant="small" color="gray">
                温度
              </Typography>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Typography variant="h6" color="green" className="font-bold">
                优秀
              </Typography>
              <Typography variant="small" color="gray">
                空气质量
              </Typography>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <Typography variant="h6" color="yellow" className="font-bold">
                {scenicConditions.uvIndex}
              </Typography>
              <Typography variant="small" color="gray">
                紫外线指数
              </Typography>
            </div>
          </div>

          <Button
            color="pink"
            className="w-full rounded-full"
            onClick={() => {}}
          >
            检测环境状况
          </Button>
        </CardBody>
      </Card>

      <Card className="shadow-lg">
        <CardBody className="p-6">
          <Typography
            variant="h6"
            color="blue-gray"
            className="font-semibold mb-4"
          >
            无障碍出行建议
          </Typography>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">♿</span>
              <Typography variant="small" color="gray">
                选择无障碍路线，避开台阶较多的区域
              </Typography>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🌡️</span>
              <Typography variant="small" color="gray">
                注意防暑降温，及时补充水分
              </Typography>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">👥</span>
              <Typography variant="small" color="gray">
                避开人流高峰时段，选择相对安静的时间游览
              </Typography>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">☀️</span>
              <Typography variant="small" color="gray">
                做好防晒措施，佩戴遮阳帽和太阳镜
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const hasAlerts =
    activityData.fatigueLevel >= 4 || medications.some((m) => !m.taken);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <IconButton
              variant="text"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </IconButton>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              健康管理
            </Typography>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {hasAlerts && (
        <div className="p-4">
          <Alert
            color="red"
            icon={<ExclamationTriangleIcon className="h-5 w-5" />}
          >
            {activityData.fatigueLevel >= 4
              ? '疲劳等级较高，建议休息'
              : '有药物未按时服用'}
          </Alert>
        </div>
      )}

      {/* Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} className="w-full">
          <TabsHeader
            className="rounded-full bg-white shadow-sm p-1"
            indicatorProps={{
              className: 'bg-pink-500 shadow-md rounded-full',
            }}
          >
            {healthFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Tab
                  key={feature.id}
                  value={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`flex items-center gap-2 rounded-full transition-colors ${
                    activeTab === feature.id ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{feature.title}</span>
                </Tab>
              );
            })}
          </TabsHeader>

          <TabsBody className="mt-6">
            <TabPanel value="activity" className="p-0">
              {renderActivityTracker()}
            </TabPanel>
            <TabPanel value="medications" className="p-0">
              {renderMedications()}
            </TabPanel>
            <TabPanel value="vitals" className="p-0">
              {renderVitals()}
            </TabPanel>
            <TabPanel value="scenic-conditions" className="p-0">
              {renderScenicConditions()}
            </TabPanel>
          </TabsBody>
        </Tabs>
      </div>

      {/* Health Records */}
      <div className="p-4">
        <Card className="shadow-lg">
          <CardBody className="p-6">
            <Typography
              variant="h6"
              color="blue-gray"
              className="font-semibold mb-4"
            >
              近期记录
            </Typography>

            <div className="space-y-3">
              {healthRecords.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {record.type}
                    </Typography>
                    <Typography variant="small" color="gray">
                      {record.content}
                    </Typography>
                    <Typography
                      variant="small"
                      color="gray"
                      className="text-xs"
                    >
                      {record.date}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default HealthManager;
