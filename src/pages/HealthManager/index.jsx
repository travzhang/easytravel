import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  Card,
  List,
  Button,
  Space,
  Tag,
  ProgressBar,
  Dialog,
  Form,
  Input,
  TextArea,
  DatePicker,
  Selector,
  Toast,
  Switch,
  Slider,
  Grid,
  Steps,
  Badge,
  NoticeBar
} from 'antd-mobile';
import {
  HeartOutline,
  ClockCircleOutline,
  ExclamationCircleOutline,
  CheckCircleOutline,
  UserOutline,
  BellOutline,
  FileOutline,
  ExclamationTriangleOutline,
  GlobalOutline
} from 'antd-mobile-icons';
import './index.css';

const HealthManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('activity');
  const [activityData, setActivityData] = useState({
    steps: 8456,
    distance: 6.2, // km
    calories: 320,
    activeTime: 85, // minutes
    heartRateAvg: 78,
    fatigueLevel: 3 // 基于运动数据计算
  });
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: '降压药',
      dosage: '5mg',
      frequency: '每日一次',
      time: '08:00',
      taken: false,
      nextDue: '2024-12-13 08:00'
    },
    {
      id: 2,
      name: '心脏病药物',
      dosage: '10mg',
      frequency: '每日两次',
      time: '08:00,20:00',
      taken: true,
      nextDue: '2024-12-13 20:00'
    }
  ]);
  const [vitals, setVitals] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 36.5,
    bloodSugar: null
  });
  const scenicConditions = {
    weather: '晴朗',
    temperature: 24,
    crowdLevel: 3, // 1-5级
    accessibilityStatus: 'good', // good, fair, poor
    airQuality: 'excellent',
    uvIndex: 6
  };
  const [healthRecords, setHealthRecords] = useState([
    {
      id: 1,
      date: '2024-12-12',
      type: '用药记录',
      content: '按时服用降压药',
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-12-12',
      type: '疲劳监测',
      content: '中度疲劳，已休息30分钟',
      status: 'completed'
    }
  ]);

  // 健康管理功能列表
  const healthFeatures = [
    {
      id: 'activity',
      title: '运动追踪',
      icon: <HeartOutline />,
      color: '#ff4d4f',
      description: '基于运动数据的疲劳监测'
    },
    {
      id: 'medications',
      title: '用药提醒',
      icon: <ClockCircleOutline />,
      color: '#52c41a',
      description: '药物服用提醒管理'
    },
    {
      id: 'vitals',
      title: '生命体征',
      icon: <UserOutline />,
      color: '#1890ff',
      description: '记录血压心率等数据'
    },
    {
      id: 'scenic-conditions',
      title: '景区环境',
      icon: <GlobalOutline />,
      color: '#fa8c16',
      description: '天气、人流、无障碍信息'
    }
  ];

  // 疲劳等级描述
  const fatigueLabels = {
    1: '精力充沛',
    2: '轻微疲劳',
    3: '中度疲劳',
    4: '明显疲劳',
    5: '严重疲劳'
  };

  // 监测用药提醒
  useEffect(() => {
    const checkMedicationReminders = () => {
      const now = new Date();
      medications.forEach(med => {
        const nextDue = new Date(med.nextDue);
        if (nextDue <= now && !med.taken) {
          Toast.show({
            icon: 'clock',
            content: `提醒：该服用${med.name}了`,
            duration: 3000,
          });
        }
      });
    };

    const interval = setInterval(checkMedicationReminders, 60000); // 每分钟检查一次
    return () => clearInterval(interval);
  }, [medications]);

  // 疲劳等级变化处理
  const handleFatigueChange = (level) => {
    setActivityData(prev => ({ ...prev, fatigueLevel: level }));
    
    // 记录疲劳数据
    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: '疲劳监测',
      content: `疲劳等级：${level} - ${fatigueLabels[level]}`,
      status: 'completed'
    };
    setHealthRecords(prev => [newRecord, ...prev]);

    // 疲劳等级提醒
    if (level >= 4) {
      Dialog.alert({
        title: '疲劳提醒',
        content: '您的疲劳等级较高，建议找个地方休息一下',
        confirmText: '知道了'
      });
    }
  };

  // 标记药物已服用
  const markMedicationTaken = (medId) => {
    setMedications(prev => prev.map(med => 
      med.id === medId 
        ? { ...med, taken: true, nextDue: calculateNextDue(med) }
        : med
    ));

    Toast.show({
      icon: 'success',
      content: '已记录服药',
    });
  };

  // 计算下次服药时间
  const calculateNextDue = (medication) => {
    const now = new Date();
    const times = medication.time.split(',');
    
    // 简化计算，实际应用中需要更复杂的逻辑
    if (times.length === 1) {
      // 每日一次
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      return `${nextDay.toISOString().split('T')[0]} ${times[0]}`;
    } else {
      // 每日多次
      return `${now.toISOString().split('T')[0]} ${times[1]}`;
    }
  };

  // 记录生命体征
  const recordVitals = (type, value) => {
    setVitals(prev => ({
      ...prev,
      [type]: value
    }));

    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: '生命体征',
      content: `${type}: ${JSON.stringify(value)}`,
      status: 'completed'
    };
    setHealthRecords(prev => [newRecord, ...prev]);

    Toast.show({
      icon: 'success',
      content: '数据已记录',
    });
  };

  // 景区环境检测
  const checkScenicConditions = () => {
    const warnings = [];
    
    if (scenicConditions.crowdLevel >= 4) {
      warnings.push('人流较多');
    }
    if (scenicConditions.uvIndex >= 8) {
      warnings.push('紫外线强烈');
    }
    if (scenicConditions.temperature >= 30) {
      warnings.push('气温较高');
    }
    
    if (warnings.length > 0) {
      Dialog.alert({
        title: '环境提醒',
        content: `当前景区：${warnings.join('、')}，请注意防护`,
        confirmText: '知道了'
      });
    } else {
      Toast.show({
        icon: 'success',
        content: '当前环境条件良好'
      });
    }
  };

  // 渲染疲劳追踪界面
  const renderFatigueTracker = () => (
    <div className="fatigue-tracker">
      <Card>
        <div className="tracker-header">
          <h3>当前疲劳等级</h3>
          <Tag color={activityData.fatigueLevel >= 4 ? 'danger' : activityData.fatigueLevel >= 3 ? 'warning' : 'success'}>
            {fatigueLabels[activityData.fatigueLevel]}
          </Tag>
        </div>
        
        <div className="fatigue-level">
          <div className="level-display">
            <ProgressBar percent={(activityData.fatigueLevel / 5) * 100} />
            <span className="level-text">{activityData.fatigueLevel}/5</span>
          </div>
          
          <div className="level-slider">
            <Slider
              value={activityData.fatigueLevel}
              onChange={handleFatigueChange}
              min={1}
              max={5}
              step={1}
              marks={{
                1: '很好',
                2: '良好',
                3: '一般',
                4: '疲劳',
                5: '很累'
              }}
            />
          </div>
        </div>

        <div className="fatigue-tips">
          <h4>建议</h4>
          {activityData.fatigueLevel <= 2 && (
            <p>🌟 精神状态良好，可以继续游览</p>
          )}
          {activityData.fatigueLevel === 3 && (
            <p>⚠️ 适度疲劳，建议找个休息点稍作休息</p>
          )}
          {activityData.fatigueLevel >= 4 && (
            <div>
              <p>🚨 疲劳等级较高，强烈建议：</p>
              <ul>
                <li>立即寻找休息区域</li>
                <li>补充水分和食物</li>
                <li>考虑结束当天的行程</li>
              </ul>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="quick-actions">
          <h4>快速记录</h4>
          <Grid columns={2} gap={8}>
            <Grid.Item>
              <Button 
                block 
                onClick={() => {
                  const newRecord = {
                    id: Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    type: '休息记录',
                    content: '休息了15分钟',
                    status: 'completed'
                  };
                  setHealthRecords(prev => [newRecord, ...prev]);
                  Toast.show({ content: '休息记录已添加' });
                }}
              >
                📱 记录休息
              </Button>
            </Grid.Item>
            <Grid.Item>
              <Button 
                block 
                onClick={() => navigate('/facilities')}
              >
                🚻 寻找休息点
              </Button>
            </Grid.Item>
          </Grid>
        </div>
      </Card>
    </div>
  );

  // 渲染用药提醒界面
  const renderMedications = () => (
    <div className="medications-manager">
      <Card>
        <h3>今日用药</h3>
        {medications.map(med => (
          <div key={med.id} className="medication-item">
            <div className="med-info">
              <div className="med-name">{med.name}</div>
              <div className="med-details">{med.dosage} - {med.frequency}</div>
              <div className="med-time">下次服用：{med.nextDue}</div>
            </div>
            <div className="med-status">
              {med.taken ? (
                <Tag color="success" icon={<CheckCircleOutline />}>已服用</Tag>
              ) : (
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => markMedicationTaken(med.id)}
                >
                  标记已服用
                </Button>
              )}
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <h4>用药统计</h4>
        <div className="medication-stats">
          <div className="stat-item">
            <span className="stat-label">今日已服用</span>
            <span className="stat-value">
              {medications.filter(m => m.taken).length}/{medications.length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">按时服药率</span>
            <span className="stat-value">85%</span>
          </div>
        </div>
      </Card>
    </div>
  );

  // 渲染生命体征界面
  const renderVitals = () => (
    <div className="vitals-tracker">
      <Card>
        <h3>当前生命体征</h3>
        <div className="vitals-grid">
          <div className="vital-item">
            <div className="vital-label">心率</div>
            <div className="vital-value">{vitals.heartRate} bpm</div>
            <Button size="mini" onClick={() => {
              const newRate = prompt('请输入心率值:', vitals.heartRate);
              if (newRate) recordVitals('heartRate', parseInt(newRate));
            }}>更新</Button>
          </div>
          
          <div className="vital-item">
            <div className="vital-label">血压</div>
            <div className="vital-value">
              {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
            </div>
            <Button size="mini" onClick={() => {
              const systolic = prompt('请输入收缩压:', vitals.bloodPressure.systolic);
              const diastolic = prompt('请输入舒张压:', vitals.bloodPressure.diastolic);
              if (systolic && diastolic) {
                recordVitals('bloodPressure', { 
                  systolic: parseInt(systolic), 
                  diastolic: parseInt(diastolic) 
                });
              }
            }}>更新</Button>
          </div>

          <div className="vital-item">
            <div className="vital-label">体温</div>
            <div className="vital-value">{vitals.temperature}°C</div>
            <Button size="mini" onClick={() => {
              const newTemp = prompt('请输入体温值:', vitals.temperature);
              if (newTemp) recordVitals('temperature', parseFloat(newTemp));
            }}>更新</Button>
          </div>
        </div>
      </Card>

      <Card>
        <h4>健康状态评估</h4>
        <div className="health-assessment">
          <div className="assessment-item">
            <span>心率状态：</span>
            <Tag color={vitals.heartRate >= 60 && vitals.heartRate <= 100 ? 'success' : 'warning'}>
              {vitals.heartRate >= 60 && vitals.heartRate <= 100 ? '正常' : '需注意'}
            </Tag>
          </div>
          <div className="assessment-item">
            <span>血压状态：</span>
            <Tag color={vitals.bloodPressure.systolic <= 140 && vitals.bloodPressure.diastolic <= 90 ? 'success' : 'warning'}>
              {vitals.bloodPressure.systolic <= 140 && vitals.bloodPressure.diastolic <= 90 ? '正常' : '偏高'}
            </Tag>
          </div>
        </div>
      </Card>
    </div>
  );

  // 渲染景区环境界面
  const renderScenicConditions = () => (
    <div className="scenic-conditions">
      <Card>
        <h3>当前景区环境</h3>
        <div className="conditions-grid">
          <div className="condition-item">
            <div className="condition-label">天气</div>
            <div className="condition-value">{scenicConditions.weather}</div>
          </div>
          
          <div className="condition-item">
            <div className="condition-label">温度</div>
            <div className="condition-value">{scenicConditions.temperature}°C</div>
          </div>

          <div className="condition-item">
            <div className="condition-label">人流密度</div>
            <div className="condition-value">
              <Tag color={scenicConditions.crowdLevel <= 2 ? 'success' : scenicConditions.crowdLevel <= 3 ? 'warning' : 'danger'}>
                {scenicConditions.crowdLevel <= 2 ? '稀少' : scenicConditions.crowdLevel <= 3 ? '适中' : '拥挤'}
              </Tag>
            </div>
          </div>

          <div className="condition-item">
            <div className="condition-label">无障碍状态</div>
            <div className="condition-value">
              <Tag color={scenicConditions.accessibilityStatus === 'good' ? 'success' : scenicConditions.accessibilityStatus === 'fair' ? 'warning' : 'danger'}>
                {scenicConditions.accessibilityStatus === 'good' ? '良好' : scenicConditions.accessibilityStatus === 'fair' ? '一般' : '较差'}
              </Tag>
            </div>
          </div>

          <div className="condition-item">
            <div className="condition-label">空气质量</div>
            <div className="condition-value">
              <Tag color="success">{scenicConditions.airQuality === 'excellent' ? '优秀' : '良好'}</Tag>
            </div>
          </div>

          <div className="condition-item">
            <div className="condition-label">紫外线指数</div>
            <div className="condition-value">
              <Tag color={scenicConditions.uvIndex <= 5 ? 'success' : scenicConditions.uvIndex <= 7 ? 'warning' : 'danger'}>
                {scenicConditions.uvIndex}
              </Tag>
            </div>
          </div>
        </div>

        <Button 
          block 
          color="primary" 
          onClick={checkScenicConditions}
          style={{ marginTop: 16 }}
        >
          检测环境状况
        </Button>
      </Card>

      <Card>
        <h4>无障碍出行建议</h4>
        <div className="accessibility-tips">
          <p>♿ 选择无障碍路线，避开台阶较多的区域</p>
          <p>🌡️ 注意防暑降温，及时补充水分</p>
          <p>👥 避开人流高峰时段，选择相对安静的时间游览</p>
          <p>☀️ 做好防晒措施，佩戴遮阳帽和太阳镜</p>
          <Button 
            size="small" 
            onClick={() => navigate('/enhanced-map')}
          >
            查看无障碍路线
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="health-manager-container">
      <NavBar onBack={() => navigate(-1)}>健康管理</NavBar>

      {/* 功能选择卡片 */}
      <div className="feature-tabs">
        <Grid columns={4} gap={8}>
          {healthFeatures.map(feature => (
            <Grid.Item key={feature.id}>
              <div 
                className={`feature-tab ${activeTab === feature.id ? 'active' : ''}`}
                onClick={() => setActiveTab(feature.id)}
                style={{ 
                  backgroundColor: activeTab === feature.id ? `${feature.color}20` : '#fff',
                  borderColor: activeTab === feature.id ? feature.color : '#e8e8e8'
                }}
              >
                <div 
                  className="tab-icon"
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </div>
                <div className="tab-title">{feature.title}</div>
              </div>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* 紧急提醒栏 */}
      {(activityData.fatigueLevel >= 4 || medications.some(m => !m.taken)) && (
        <NoticeBar
          color="alert"
          content={
            activityData.fatigueLevel >= 4 
              ? "疲劳等级较高，建议休息" 
              : "有药物未按时服用"
          }
          closeable
        />
      )}

      {/* 功能内容区域 */}
      <div className="feature-content">
        {activeTab === 'activity' && renderFatigueTracker()}
        {activeTab === 'medications' && renderMedications()}
        {activeTab === 'vitals' && renderVitals()}
        {activeTab === 'scenic-conditions' && renderScenicConditions()}
      </div>

      {/* 健康记录历史 */}
      <Card>
        <h4>近期记录</h4>
        <div className="health-history">
          {healthRecords.slice(0, 5).map(record => (
            <div key={record.id} className="history-item">
              <div className="history-content">
                <div className="history-type">{record.type}</div>
                <div className="history-detail">{record.content}</div>
                <div className="history-date">{record.date}</div>
              </div>
              <CheckCircleOutline className="history-status" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HealthManager; 