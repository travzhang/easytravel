import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardBody,
  Switch,
  Button,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Slider,
} from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  EyeIcon,
  ShieldCheckIcon,
  PhoneIcon,
  BellIcon,
  GlobeAltIcon,
  UserCircleIcon,
  SpeakerWaveIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    // 无障碍设置
    accessibility: {
      fontSize: 16,
      highContrast: false,
      voiceNavigation: true,
      screenReader: false,
      reduceMotion: false,
      colorBlindMode: 'none',
    },
    // 通知设置
    notifications: {
      pushNotifications: true,
      emergencyAlerts: true,
      routeUpdates: true,
      facilityUpdates: false,
    },
    // 隐私设置
    privacy: {
      locationSharing: true,
      dataCollection: false,
      analyticsOptOut: false,
      profileVisibility: 'public',
    },
    // 紧急联系人
    emergencyContacts: [
      { name: '李女士', phone: '139****9999', relationship: '配偶' },
    ],
  });

  const [openDialog, setOpenDialog] = useState(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  const handleBack = () => {
    navigate(-1);
  };

  const updateSetting = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const addEmergencyContact = () => {
    if (newContact.name && newContact.phone) {
      setSettings((prev) => ({
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, { ...newContact }],
      }));
      setNewContact({ name: '', phone: '', relationship: '' });
      setOpenDialog(null);
    }
  };

  const removeEmergencyContact = (index) => {
    setSettings((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
          <IconButton
            variant="text"
            size="sm"
            onClick={handleBack}
            className="rounded-full"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </IconButton>
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            设置
          </Typography>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* 无障碍设置 */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <EyeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="font-semibold"
                >
                  无障碍设置
                </Typography>
                <Typography variant="small" color="gray">
                  个性化无障碍体验
                </Typography>
              </div>
            </div>

            <div className="space-y-4">
              {/* 字体大小 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    字体大小
                  </Typography>
                  <Typography variant="small" color="gray">
                    {settings.accessibility.fontSize}px
                  </Typography>
                </div>
                <Slider
                  value={settings.accessibility.fontSize}
                  onChange={(e) => {
                    updateSetting('accessibility', 'fontSize', e.target.value);
                  }}
                  step={2}
                  color="blue"
                  size="lg"
                />

                {/* 预览文本 */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <Typography
                    variant="small"
                    color="gray"
                    className="text-xs mb-1"
                  >
                    预览效果
                  </Typography>
                  <Typography
                    color="blue-gray"
                    className="font-medium"
                    style={{ fontSize: `${settings.accessibility.fontSize}px` }}
                  >
                    这是字体大小预览文本
                  </Typography>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    高对比度模式
                  </Typography>
                  <Typography variant="small" color="gray">
                    提高文字和背景的对比度
                  </Typography>
                </div>
                <Switch
                  checked={settings.accessibility.highContrast}
                  onChange={(e) =>
                    updateSetting(
                      'accessibility',
                      'highContrast',
                      e.target.checked,
                    )
                  }
                  color="blue"
                />
              </div>

              {/* 语音导航 */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    语音导航
                  </Typography>
                  <Typography variant="small" color="gray">
                    启用语音提示和导航
                  </Typography>
                </div>
                <Switch
                  checked={settings.accessibility.voiceNavigation}
                  onChange={(e) =>
                    updateSetting(
                      'accessibility',
                      'voiceNavigation',
                      e.target.checked,
                    )
                  }
                  color="blue"
                />
              </div>

              {/* 屏幕阅读器 */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    屏幕阅读器支持
                  </Typography>
                  <Typography variant="small" color="gray">
                    优化屏幕阅读器体验
                  </Typography>
                </div>
                <Switch
                  checked={settings.accessibility.screenReader}
                  onChange={(e) =>
                    updateSetting(
                      'accessibility',
                      'screenReader',
                      e.target.checked,
                    )
                  }
                  color="blue"
                />
              </div>

              {/* 减少动画 */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    减少动画效果
                  </Typography>
                  <Typography variant="small" color="gray">
                    减少界面动画和过渡效果
                  </Typography>
                </div>
                <Switch
                  checked={settings.accessibility.reduceMotion}
                  onChange={(e) =>
                    updateSetting(
                      'accessibility',
                      'reduceMotion',
                      e.target.checked,
                    )
                  }
                  color="blue"
                />
              </div>

              {/* 色盲模式 */}
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-medium mb-2"
                >
                  色盲辅助模式
                </Typography>
                <Select
                  value={settings.accessibility.colorBlindMode}
                  onChange={(value) =>
                    updateSetting('accessibility', 'colorBlindMode', value)
                  }
                  className="w-full"
                >
                  <Option value="none">无</Option>
                  <Option value="protanopia">红色盲</Option>
                  <Option value="deuteranopia">绿色盲</Option>
                  <Option value="tritanopia">蓝色盲</Option>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 通知设置 */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <BellIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="font-semibold"
                >
                  通知设置
                </Typography>
                <Typography variant="small" color="gray">
                  管理推送通知和提醒
                </Typography>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    推送通知
                  </Typography>
                  <Typography variant="small" color="gray">
                    接收应用推送消息
                  </Typography>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) =>
                    updateSetting(
                      'notifications',
                      'pushNotifications',
                      e.target.checked,
                    )
                  }
                  color="green"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    紧急警报
                  </Typography>
                  <Typography variant="small" color="gray">
                    接收紧急情况通知
                  </Typography>
                </div>
                <Switch
                  checked={settings.notifications.emergencyAlerts}
                  onChange={(e) =>
                    updateSetting(
                      'notifications',
                      'emergencyAlerts',
                      e.target.checked,
                    )
                  }
                  color="green"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    路线更新
                  </Typography>
                  <Typography variant="small" color="gray">
                    路线变更和交通信息
                  </Typography>
                </div>
                <Switch
                  checked={settings.notifications.routeUpdates}
                  onChange={(e) =>
                    updateSetting(
                      'notifications',
                      'routeUpdates',
                      e.target.checked,
                    )
                  }
                  color="green"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    设施更新
                  </Typography>
                  <Typography variant="small" color="gray">
                    无障碍设施状态变更
                  </Typography>
                </div>
                <Switch
                  checked={settings.notifications.facilityUpdates}
                  onChange={(e) =>
                    updateSetting(
                      'notifications',
                      'facilityUpdates',
                      e.target.checked,
                    )
                  }
                  color="green"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 紧急联系人 */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <PhoneIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <Typography
                    variant="h6"
                    color="blue-gray"
                    className="font-semibold"
                  >
                    紧急联系人
                  </Typography>
                  <Typography variant="small" color="gray">
                    管理紧急联系人信息
                  </Typography>
                </div>
              </div>
              <Button
                size="sm"
                color="red"
                variant="outlined"
                onClick={() => setOpenDialog('emergency')}
                className="rounded-full"
              >
                添加
              </Button>
            </div>

            <div className="space-y-3">
              {settings.emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-medium"
                      >
                        {contact.name}
                      </Typography>
                      <Typography variant="small" color="gray">
                        {contact.phone} • {contact.relationship}
                      </Typography>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="red"
                    variant="text"
                    onClick={() => removeEmergencyContact(index)}
                  >
                    删除
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* 隐私设置 */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="font-semibold"
                >
                  隐私设置
                </Typography>
                <Typography variant="small" color="gray">
                  数据隐私和权限管理
                </Typography>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    位置共享
                  </Typography>
                  <Typography variant="small" color="gray">
                    允许应用访问位置信息
                  </Typography>
                </div>
                <Switch
                  checked={settings.privacy.locationSharing}
                  onChange={(e) =>
                    updateSetting(
                      'privacy',
                      'locationSharing',
                      e.target.checked,
                    )
                  }
                  color="purple"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    数据收集
                  </Typography>
                  <Typography variant="small" color="gray">
                    允许收集使用数据以改善服务
                  </Typography>
                </div>
                <Switch
                  checked={settings.privacy.dataCollection}
                  onChange={(e) =>
                    updateSetting('privacy', 'dataCollection', e.target.checked)
                  }
                  color="purple"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    分析数据退出
                  </Typography>
                  <Typography variant="small" color="gray">
                    退出数据分析和统计
                  </Typography>
                </div>
                <Switch
                  checked={settings.privacy.analyticsOptOut}
                  onChange={(e) =>
                    updateSetting(
                      'privacy',
                      'analyticsOptOut',
                      e.target.checked,
                    )
                  }
                  color="purple"
                />
              </div>

              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-medium mb-2"
                >
                  个人资料可见性
                </Typography>
                <Select
                  value={settings.privacy.profileVisibility}
                  onChange={(value) =>
                    updateSetting('privacy', 'profileVisibility', value)
                  }
                  className="w-full"
                >
                  <Option value="public">公开</Option>
                  <Option value="friends">仅好友</Option>
                  <Option value="private">私密</Option>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 应用信息 */}
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardBody className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="font-semibold"
                >
                  应用信息
                </Typography>
                <Typography variant="small" color="gray">
                  关于应用和法律信息
                </Typography>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="text"
                className="w-full justify-start p-3 text-left"
                onClick={() => console.log('关于我们')}
              >
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    关于我们
                  </Typography>
                  <Typography variant="small" color="gray">
                    了解我们的团队和使命
                  </Typography>
                </div>
              </Button>

              <Button
                variant="text"
                className="w-full justify-start p-3 text-left"
                onClick={() => console.log('用户协议')}
              >
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    用户协议
                  </Typography>
                  <Typography variant="small" color="gray">
                    查看服务条款和使用协议
                  </Typography>
                </div>
              </Button>

              <Button
                variant="text"
                className="w-full justify-start p-3 text-left"
                onClick={() => console.log('隐私政策')}
              >
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    隐私政策
                  </Typography>
                  <Typography variant="small" color="gray">
                    了解我们如何保护您的隐私
                  </Typography>
                </div>
              </Button>

              <div className="flex items-center justify-between p-3">
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-medium"
                  >
                    版本信息
                  </Typography>
                  <Typography variant="small" color="gray">
                    当前版本
                  </Typography>
                </div>
                <Typography variant="small" color="gray">
                  v1.0.0
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 添加紧急联系人对话框 */}
      <Dialog
        open={openDialog === 'emergency'}
        handler={() => setOpenDialog(null)}
        size="sm"
      >
        <DialogHeader className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <Typography variant="h5">添加紧急联系人</Typography>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <Input
            label="姓名"
            value={newContact.name}
            onChange={(e) =>
              setNewContact({ ...newContact, name: e.target.value })
            }
          />
          <Input
            label="电话号码"
            value={newContact.phone}
            onChange={(e) =>
              setNewContact({ ...newContact, phone: e.target.value })
            }
          />
          <Select
            label="关系"
            value={newContact.relationship}
            onChange={(value) =>
              setNewContact({ ...newContact, relationship: value })
            }
          >
            <Option value="配偶">配偶</Option>
            <Option value="子女">子女</Option>
            <Option value="父母">父母</Option>
            <Option value="兄弟姐妹">兄弟姐妹</Option>
            <Option value="朋友">朋友</Option>
            <Option value="其他">其他</Option>
          </Select>
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenDialog(null)}
          >
            取消
          </Button>
          <Button color="red" onClick={addEmergencyContact}>
            添加
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Settings;
