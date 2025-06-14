import React, { useState, useEffect } from 'react';
import { Popup, Form, Radio, Switch, Slider, Button, Space, Divider } from 'antd-mobile';
import './AccessibilitySettings.css';

/**
 * 无障碍设置组件
 * @param {object} props 组件属性
 * @param {boolean} props.visible 是否显示
 * @param {function} props.onClose 关闭回调
 * @param {function} props.onSave 保存设置回调
 * @param {object} props.initialSettings 初始设置
 */
const AccessibilitySettings = ({
  visible = false,
  onClose,
  onSave,
  initialSettings = {}
}) => {
  // 默认设置
  const defaultSettings = {
    disabilityType: 'wheelchair',
    highContrastMode: false,
    largeTextMode: false,
    textSize: 100,
    reduceMotion: false,
    simplifiedUI: false,
    voiceGuidance: false,
    autoPlay: false,
    hapticFeedback: true
  };

  // 合并初始设置
  const mergedSettings = { ...defaultSettings, ...initialSettings };
  
  // 状态
  const [settings, setSettings] = useState(mergedSettings);
  
  // 当初始设置变化时更新状态
  useEffect(() => {
    if (visible) {
      setSettings({ ...defaultSettings, ...initialSettings });
    }
  }, [visible, initialSettings]);
  
  // 处理设置变更
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // 处理保存
  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    
    if (onClose) {
      onClose();
    }
  };
  
  // 重置为默认设置
  const handleReset = () => {
    setSettings(defaultSettings);
  };
  
  // 应用预设配置
  const applyPreset = (presetType) => {
    switch (presetType) {
      case 'wheelchair':
        setSettings(prev => ({
          ...prev,
          disabilityType: 'wheelchair',
          highContrastMode: false,
          largeTextMode: false,
          textSize: 100,
          reduceMotion: false,
          simplifiedUI: false,
          voiceGuidance: false
        }));
        break;
      case 'visual':
        setSettings(prev => ({
          ...prev,
          disabilityType: 'visual',
          highContrastMode: true,
          largeTextMode: true,
          textSize: 150,
          reduceMotion: true,
          simplifiedUI: true,
          voiceGuidance: true
        }));
        break;
      case 'hearing':
        setSettings(prev => ({
          ...prev,
          disabilityType: 'hearing',
          highContrastMode: false,
          largeTextMode: false,
          textSize: 100,
          reduceMotion: false,
          simplifiedUI: false,
          voiceGuidance: false,
          hapticFeedback: true
        }));
        break;
      case 'cognitive':
        setSettings(prev => ({
          ...prev,
          disabilityType: 'cognitive',
          highContrastMode: false,
          largeTextMode: true,
          textSize: 120,
          reduceMotion: true,
          simplifiedUI: true,
          voiceGuidance: true
        }));
        break;
      default:
        break;
    }
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      bodyStyle={{ 
        borderTopLeftRadius: '16px', 
        borderTopRightRadius: '16px', 
        maxHeight: '90vh',
        overflowY: 'auto'
      }}
    >
      <div className="accessibility-settings-container">
        <h2 className="settings-title">无障碍设置</h2>
        
        <div className="presets-section">
          <h3>快速设置</h3>
          <div className="presets-buttons">
            <Button 
              color={settings.disabilityType === 'wheelchair' ? 'primary' : 'default'}
              onClick={() => applyPreset('wheelchair')}
              size="small"
            >
              轮椅使用者
            </Button>
            <Button 
              color={settings.disabilityType === 'visual' ? 'primary' : 'default'}
              onClick={() => applyPreset('visual')}
              size="small"
            >
              视力障碍
            </Button>
            <Button 
              color={settings.disabilityType === 'hearing' ? 'primary' : 'default'}
              onClick={() => applyPreset('hearing')}
              size="small"
            >
              听力障碍
            </Button>
            <Button 
              color={settings.disabilityType === 'cognitive' ? 'primary' : 'default'}
              onClick={() => applyPreset('cognitive')}
              size="small"
            >
              认知障碍
            </Button>
          </div>
        </div>
        
        <Divider />
        
        <Form layout="horizontal">
          <Form.Header>基本设置</Form.Header>
          
          <Form.Item label="残疾类型">
            <Radio.Group
              value={settings.disabilityType}
              onChange={val => handleSettingChange('disabilityType', val)}
            >
              <Space direction="vertical">
                <Radio value="wheelchair">轮椅使用者</Radio>
                <Radio value="visual">视力障碍</Radio>
                <Radio value="hearing">听力障碍</Radio>
                <Radio value="cognitive">认知障碍</Radio>
                <Radio value="other">其他</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          
          <Form.Header>显示设置</Form.Header>
          
          <Form.Item label="高对比度模式" extra="增强文字与背景的对比度">
            <Switch
              checked={settings.highContrastMode}
              onChange={val => handleSettingChange('highContrastMode', val)}
            />
          </Form.Item>
          
          <Form.Item label="大字体模式" extra="使用更大的字体">
            <Switch
              checked={settings.largeTextMode}
              onChange={val => handleSettingChange('largeTextMode', val)}
            />
          </Form.Item>
          
          <Form.Item label="文字大小">
            <div className="text-size-slider">
              <span className="text-size-label small">A</span>
              <Slider
                value={settings.textSize}
                min={80}
                max={200}
                step={10}
                onChange={val => handleSettingChange('textSize', val)}
                icon={<></>}
              />
              <span className="text-size-label large">A</span>
            </div>
            <div className="text-size-value">{settings.textSize}%</div>
          </Form.Item>
          
          <Form.Item label="减少动画" extra="减少或禁用界面动画">
            <Switch
              checked={settings.reduceMotion}
              onChange={val => handleSettingChange('reduceMotion', val)}
            />
          </Form.Item>
          
          <Form.Item label="简化界面" extra="减少视觉元素，简化布局">
            <Switch
              checked={settings.simplifiedUI}
              onChange={val => handleSettingChange('simplifiedUI', val)}
            />
          </Form.Item>
          
          <Form.Header>辅助功能</Form.Header>
          
          <Form.Item label="语音导航" extra="启用语音播报功能">
            <Switch
              checked={settings.voiceGuidance}
              onChange={val => handleSettingChange('voiceGuidance', val)}
            />
          </Form.Item>
          
          <Form.Item label="自动播放媒体" extra="自动播放视频和音频">
            <Switch
              checked={settings.autoPlay}
              onChange={val => handleSettingChange('autoPlay', val)}
            />
          </Form.Item>
          
          <Form.Item label="触觉反馈" extra="操作时提供振动反馈">
            <Switch
              checked={settings.hapticFeedback}
              onChange={val => handleSettingChange('hapticFeedback', val)}
            />
          </Form.Item>
        </Form>
        
        <div className="settings-actions">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block color="primary" size="large" onClick={handleSave}>
              保存设置
            </Button>
            <Button block onClick={handleReset}>
              恢复默认设置
            </Button>
          </Space>
        </div>
      </div>
    </Popup>
  );
};

export default AccessibilitySettings;
