import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardBody,
  Button,
  IconButton,
  Textarea,
  Slider,
  Dialog,
  DialogBody,
  Chip,
} from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  SpeakerWaveIcon as SpeakerWaveSolidIcon,
  MicrophoneIcon as MicrophoneSolidIcon,
} from '@heroicons/react/24/solid';

const CommunicationAidPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0
  });
  const speechRecognitionRef = useRef(null);
  const synthUtteranceRef = useRef(null);

  // 紧急常用短语
  const emergencyPhrases = [
    { text: '我需要帮助', category: 'emergency', icon: '🆘' },
    { text: '请问厕所在哪里？', category: 'basic', icon: '🚻' },
    { text: '我听不见，请用手势或写字', category: 'accessibility', icon: '👂' },
    { text: '我看不见，请帮助我', category: 'accessibility', icon: '👁️' },
    { text: '我是轮椅使用者，需要无障碍通道', category: 'accessibility', icon: '♿' },
    { text: '请联系我的家人', category: 'emergency', icon: '📞' },
    { text: '我有医疗紧急情况', category: 'emergency', icon: '🏥' },
    { text: '谢谢您的帮助', category: 'polite', icon: '🙏' },
    { text: '不客气', category: 'polite', icon: '😊' },
    { text: '对不起，我不明白', category: 'basic', icon: '❓' },
  ];

  // 功能卡片配置
  const features = [
    {
      id: 'speech-to-text',
      title: '语音转文字',
      subtitle: '实时语音识别',
      description: '将语音实时转换为文字，帮助听障人士理解对话内容',
      icon: MicrophoneIcon,
      solidIcon: MicrophoneSolidIcon,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      id: 'text-to-speech',
      title: '文字转语音',
      subtitle: '智能语音播放',
      description: '将文字转换为清晰的语音播放，协助言语障碍人士表达',
      icon: SpeakerWaveIcon,
      solidIcon: SpeakerWaveSolidIcon,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      id: 'emergency-phrases',
      title: '紧急短语',
      subtitle: '快速沟通',
      description: '预设常用短语，紧急情况下一键播放，快速表达需求',
      icon: ExclamationTriangleIcon,
      solidIcon: ExclamationTriangleIcon,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
    },
  ];

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'zh-CN';

      speechRecognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setSpeechText(prev => prev + finalTranscript);
        }
      };

      speechRecognitionRef.current.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);
      };

      speechRecognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (synthUtteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 语音识别控制
  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      alert('您的浏览器不支持语音识别');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      speechRecognitionRef.current.start();
      setIsListening(true);
    }
  };

  // 文字转语音
  const speakText = (text = textToSpeak) => {
    if (!text.trim()) {
      alert('请输入要播放的文字');
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        alert('语音播放失败');
      };

      synthUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('您的浏览器不支持语音播放');
    }
  };

  // 停止语音播放
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // 复制文本
  const copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    });
  };

  // 渲染功能选择页面
  const renderFeatureSelection = () => (
    <div className="space-y-6">
      {/* 头部介绍 */}
      <div className="text-center px-4 py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
        </div>
        <Typography variant="h3" className="text-gray-900 font-bold mb-2">
          无障碍沟通助手
        </Typography>
        <Typography variant="lead" className="text-gray-600 max-w-md mx-auto">
          为听障、言语障碍等人士提供便捷的沟通工具，让交流变得更加轻松自然
        </Typography>
      </div>

      {/* 功能卡片 */}
      <div className="px-4 space-y-4">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card
              key={feature.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg"
              onClick={() => setActiveFeature(feature.id)}
            >
              <CardBody className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${feature.bgGradient} rounded-xl flex items-center justify-center`}>
                    <IconComponent className={`h-7 w-7 text-${feature.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography variant="h6" className="text-gray-900 font-semibold mb-1">
                      {feature.title}
                    </Typography>
                    <Typography variant="small" className={`text-${feature.color}-600 font-medium mb-2`}>
                      {feature.subtitle}
                    </Typography>
                    <Typography variant="small" className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </Typography>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <Typography variant="small" className="text-blue-900 font-medium mb-1">
                使用提示
              </Typography>
              <Typography variant="small" className="text-blue-700 leading-relaxed">
                请确保您的设备已授权麦克风和扬声器权限，以获得最佳使用体验
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染语音转文字功能
  const renderSpeechToText = () => (
    <div className="space-y-6">
      {/* 控制区域 */}
      <Card className="shadow-lg border-0">
        <CardBody className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <button
                onClick={toggleSpeechRecognition}
                className={`relative w-24 h-24 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  isListening
                    ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-200'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200'
                }`}
              >
                {isListening ? (
                  <StopIcon className="h-10 w-10 text-white mx-auto" />
                ) : (
                  <MicrophoneIcon className="h-10 w-10 text-white mx-auto" />
                )}
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                )}
              </button>
            </div>
            <div>
              <Typography variant="h6" className="text-gray-900 font-semibold">
                {isListening ? '正在听取语音...' : '点击开始语音识别'}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                {isListening ? '请清晰地说话，系统正在实时识别' : '支持中文语音识别，识别结果将显示在下方'}
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 识别结果 */}
      <Card className="shadow-lg border-0">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6" className="text-gray-900 font-semibold">
              识别结果
            </Typography>
            <div className="flex space-x-2">
              <IconButton
                variant="text"
                size="sm"
                onClick={() => copyText(speechText)}
                disabled={!speechText}
                className="text-gray-600 hover:text-blue-600"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </IconButton>
              <Button
                variant="text"
                size="sm"
                onClick={() => setSpeechText('')}
                disabled={!speechText}
                className="text-gray-600 hover:text-red-600"
              >
                清空
              </Button>
            </div>
          </div>
          <Textarea
            value={speechText}
            onChange={(e) => setSpeechText(e.target.value)}
            placeholder={isListening ? '请开始说话...' : '点击上方按钮开始语音识别'}
            className="min-h-[120px] resize-none"
            labelProps={{
              className: "hidden",
            }}
          />
        </CardBody>
      </Card>
    </div>
  );

  // 渲染文字转语音功能
  const renderTextToSpeech = () => (
    <div className="space-y-6">
      {/* 文本输入 */}
      <Card className="shadow-lg border-0">
        <CardBody className="p-6">
          <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
            输入要播放的文字
          </Typography>
          <Textarea
            value={textToSpeak}
            onChange={(e) => setTextToSpeak(e.target.value)}
            placeholder="请输入要转换为语音的文字内容..."
            className="min-h-[120px] resize-none"
            labelProps={{
              className: "hidden",
            }}
          />
        </CardBody>
      </Card>

      {/* 控制按钮 */}
      <Card className="shadow-lg border-0">
        <CardBody className="p-6">
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={() => speakText()}
              disabled={isPlaying || !textToSpeak.trim()}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center space-x-2"
              size="lg"
            >
              <PlayIcon className="h-5 w-5" />
              <span>播放</span>
            </Button>
            <Button
              onClick={stopSpeaking}
              disabled={!isPlaying}
              variant="outlined"
              className="border-red-300 text-red-600 hover:bg-red-50 flex items-center space-x-2"
              size="lg"
            >
              <StopIcon className="h-5 w-5" />
              <span>停止</span>
            </Button>
            <IconButton
              onClick={() => setShowSettings(true)}
              variant="text"
              className="text-gray-600 hover:text-blue-600"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </IconButton>
          </div>
          {isPlaying && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <Typography variant="small" className="font-medium">
                  正在播放语音...
                </Typography>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 语音设置对话框 */}
      <Dialog open={showSettings} handler={() => setShowSettings(false)} size="sm">
        <DialogBody className="p-6">
          <Typography variant="h6" className="text-gray-900 font-semibold mb-6">
            语音设置
          </Typography>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="small" className="text-gray-700 font-medium">
                  语速
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  {voiceSettings.speed.toFixed(1)}x
                </Typography>
              </div>
              <Slider
                value={voiceSettings.speed}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, speed: parseFloat(e.target.value) })}
                min={0.5}
                max={2.0}
                step={0.1}
                className="text-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="small" className="text-gray-700 font-medium">
                  音调
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  {voiceSettings.pitch.toFixed(1)}
                </Typography>
              </div>
              <Slider
                value={voiceSettings.pitch}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })}
                min={0.5}
                max={2.0}
                step={0.1}
                className="text-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="small" className="text-gray-700 font-medium">
                  音量
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  {Math.round(voiceSettings.volume * 100)}%
                </Typography>
              </div>
              <Slider
                value={voiceSettings.volume}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, volume: parseFloat(e.target.value) })}
                min={0}
                max={1}
                step={0.1}
                className="text-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setShowSettings(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-600"
            >
              确定
            </Button>
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );

  // 渲染紧急短语功能
  const renderEmergencyPhrases = () => {
    const categories = {
      emergency: { name: '紧急求助', color: 'red' },
      accessibility: { name: '无障碍需求', color: 'blue' },
      basic: { name: '基本需求', color: 'green' },
      polite: { name: '礼貌用语', color: 'purple' },
    };

    return (
      <div className="space-y-6">
        {Object.entries(categories).map(([category, config]) => {
          const categoryPhrases = emergencyPhrases.filter(phrase => phrase.category === category);
          
          return (
            <Card key={category} className="shadow-lg border-0">
              <CardBody className="p-6">
                <Typography variant="h6" className={`text-${config.color}-600 font-semibold mb-4`}>
                  {config.name}
                </Typography>
                <div className="grid grid-cols-1 gap-3">
                  {categoryPhrases.map((phrase, index) => (
                    <button
                      key={index}
                      onClick={() => speakText(phrase.text)}
                      className={`w-full p-4 text-left rounded-xl border-2 border-${config.color}-100 bg-${config.color}-50 hover:bg-${config.color}-100 hover:border-${config.color}-200 transition-all duration-200 group`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{phrase.icon}</span>
                        <Typography variant="small" className={`text-${config.color}-800 font-medium group-hover:text-${config.color}-900`}>
                          {phrase.text}
                        </Typography>
                      </div>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    );
  };

  const currentFeature = features.find(f => f.id === activeFeature);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <IconButton
              variant="text"
              size="sm"
              onClick={() => activeFeature ? setActiveFeature(null) : navigate(-1)}
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </IconButton>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              {activeFeature ? currentFeature?.title : '沟通辅助'}
            </Typography>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="pb-6">
        {!activeFeature && renderFeatureSelection()}
        {activeFeature === 'speech-to-text' && (
          <div className="p-4">
            {renderSpeechToText()}
          </div>
        )}
        {activeFeature === 'text-to-speech' && (
          <div className="p-4">
            {renderTextToSpeech()}
          </div>
        )}
        {activeFeature === 'emergency-phrases' && (
          <div className="p-4">
            {renderEmergencyPhrases()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationAidPage;