import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    NavBar,
    Card,
    Button,
    Space,
    Grid,
    TextArea,
    Toast,
    Dialog,
    Slider
} from 'antd-mobile';
import {
    SoundOutline,
    PlayOutline,
    StopOutline,
    PhoneFill,
    CloseOutline,
    CheckCircleOutline
} from 'antd-mobile-icons';
import './index.css';

const CommunicationAid = () => {
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [speechText, setSpeechText] = useState('');
    const [textToSpeak, setTextToSpeak] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [voiceSettings, setVoiceSettings] = useState({
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0
    });
    const speechRecognitionRef = useRef(null);
    const synthUtteranceRef = useRef(null);

    // 紧急常用短语
    const emergencyPhrases = [
        '我需要帮助',
        '请问厕所在哪里？',
        '我听不见，请用手势或写字',
        '我看不见，请帮助我',
        '我是轮椅使用者，需要无障碍通道',
        '请联系我的家人',
        '我有医疗紧急情况',
        '谢谢您的帮助',
        '不客气',
        '对不起，我不明白'
    ];

    // 沟通功能列表（只保留3个核心功能）
    const communicationFeatures = [
        {
            id: 'speech-to-text',
            title: '语音转文字',
            icon: <SoundOutline />,
            color: '#1890ff',
            description: '说话转换为文字显示，帮助听障人士进行交流',
            benefits: ['实时语音识别', '多语言支持', '文本可复制分享'],
            usage: '适用于听障人士与他人对话，将对方的话语转换成可见文字'
        },
        {
            id: 'text-to-speech',
            title: '文字转语音',
            icon: <SoundOutline />,
            color: '#52c41a',
            description: '输入文字播放语音，协助言语障碍人士表达',
            benefits: ['可调语速音调', '清晰语音输出', '支持长文本'],
            usage: '适用于言语障碍人士，通过文字输入来"说话"表达想法'
        },
        {
            id: 'emergency-phrases',
            title: '紧急短语',
            icon: <PhoneFill />,
            color: '#ff4d4f',
            description: '常用紧急短语快速播放，紧急情况下快速求助',
            benefits: ['一键播放', '紧急情况专用', '覆盖常见需求'],
            usage: '紧急情况或日常交流中，快速表达基本需求和求助信息'
        }
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
                Toast.show({
                    icon: 'fail',
                    content: '语音识别出现错误',
                });
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

    // 开始/停止语音识别
    const toggleSpeechRecognition = () => {
        if (!speechRecognitionRef.current) {
            Toast.show({
                icon: 'fail',
                content: '您的浏览器不支持语音识别',
            });
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
            Toast.show({
                content: '请输入要播放的文字',
            });
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
                Toast.show({
                    icon: 'fail',
                    content: '语音播放失败',
                });
            };

            synthUtteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        } else {
            Toast.show({
                icon: 'fail',
                content: '您的浏览器不支持语音播放',
            });
        }
    };

    // 停止语音播放
    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    // 选择紧急短语
    const selectEmergencyPhrase = (phrase) => {
        speakText(phrase);
        Toast.show({
            content: `正在播放："${phrase}"`,
        });
    };

    // 渲染功能卡片
    const renderFeatureCard = (feature) => (
        <Card
            key={feature.id}
            className="feature-card enhanced"
            onClick={() => setActiveFeature(feature.id)}
            style={{ borderColor: activeFeature === feature.id ? feature.color : '#e8e8e8' }}
        >
            <div className="feature-content">
                <div
                    className="feature-icon"
                    style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                >
                    {feature.icon}
                </div>
                <div className="feature-info">
                    <div className="feature-title">{feature.title}</div>
                    <div className="feature-description">{feature.description}</div>
                    <div className="feature-usage">
                        <span className="usage-label">适用场景：</span>
                        <span className="usage-text">{feature.usage}</span>
                    </div>
                    <div className="feature-benefits">
                        {feature.benefits.map((benefit, index) => (
                            <span key={index} className="benefit-tag">{benefit}</span>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );

    // 渲染语音转文字界面
    const renderSpeechToText = () => (
        <div className="speech-to-text-panel">
            <Card className="speech-card">
                <div className="speech-controls">
                    <Button
                        color={isListening ? 'danger' : 'primary'}
                        size="large"
                        onClick={toggleSpeechRecognition}
                        icon={isListening ? <StopOutline /> : <SoundOutline />}
                    >
                        {isListening ? '停止识别' : '开始语音识别'}
                    </Button>
                    {isListening && (
                        <div className="listening-indicator">
                            <div className="pulse-dot" />
                            正在听取语音...
                        </div>
                    )}
                </div>

                <div className="speech-result">
                    <div className="result-label">识别结果：</div>
                    <TextArea
                        value={speechText}
                        onChange={setSpeechText}
                        placeholder={isListening ? '请开始说话...' : '点击按钮开始语音识别'}
                        rows={6}
                        className="speech-textarea"
                    />
                    <div className="result-actions">
                        <Button
                            size="small"
                            onClick={() => setSpeechText('')}
                        >
                            清空
                        </Button>
                        <Button
                            size="small"
                            color="primary"
                            onClick={() => {
                                if (speechText) {
                                    navigator.clipboard.writeText(speechText);
                                    Toast.show({
                                        icon: 'success',
                                        content: '已复制到剪贴板',
                                    });
                                }
                            }}
                        >
                            复制
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );

    // 渲染文字转语音界面
    const renderTextToSpeech = () => (
        <div className="text-to-speech-panel">
            <Card className="tts-card">
                <div className="tts-input">
                    <TextArea
                        value={textToSpeak}
                        onChange={setTextToSpeak}
                        placeholder="请输入要播放的文字"
                        rows={4}
                    />
                </div>

                <div className="tts-controls">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div className="voice-settings">
                            <div className="setting-item">
                                <span>语速：</span>
                                <Slider
                                    value={voiceSettings.speed}
                                    onChange={(val) => setVoiceSettings({ ...voiceSettings, speed: val })}
                                    min={0.5}
                                    max={2.0}
                                    step={0.1}
                                    style={{ flex: 1 }}
                                />
                                <span>{voiceSettings.speed.toFixed(1)}</span>
                            </div>
                            <div className="setting-item">
                                <span>音调：</span>
                                <Slider
                                    value={voiceSettings.pitch}
                                    onChange={(val) => setVoiceSettings({ ...voiceSettings, pitch: val })}
                                    min={0.5}
                                    max={2.0}
                                    step={0.1}
                                    style={{ flex: 1 }}
                                />
                                <span>{voiceSettings.pitch.toFixed(1)}</span>
                            </div>
                            <div className="setting-item">
                                <span>音量：</span>
                                <Slider
                                    value={voiceSettings.volume}
                                    onChange={(val) => setVoiceSettings({ ...voiceSettings, volume: val })}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    style={{ flex: 1 }}
                                />
                                <span>{Math.round(voiceSettings.volume * 100)}%</span>
                            </div>
                        </div>

                        <Space>
                            <Button
                                color="primary"
                                onClick={() => speakText()}
                                disabled={isPlaying || !textToSpeak.trim()}
                                icon={<PlayOutline />}
                            >
                                播放
                            </Button>
                            <Button
                                onClick={stopSpeaking}
                                disabled={!isPlaying}
                                icon={<StopOutline />}
                            >
                                停止
                            </Button>
                        </Space>
                    </Space>
                </div>
            </Card>
        </div>
    );

    // 渲染紧急短语界面
    const renderEmergencyPhrases = () => (
        <div className="emergency-phrases-panel">
            <Card className="phrases-card">
                <div className="phrases-title">常用紧急短语</div>
                <div className="phrases-grid">
                    {emergencyPhrases.map((phrase) => (
                        <Button
                            key={phrase}
                            className="phrase-button"
                            onClick={() => selectEmergencyPhrase(phrase)}
                            block
                        >
                            {phrase}
                        </Button>
                    ))}
                </div>
            </Card>
        </div>
    );

    return (
        <div className="communication-aid-container">
            <NavBar onBack={() => navigate(-1)}>沟通辅助</NavBar>

            {/* 功能选择区域 */}
            {!activeFeature && (
                <>
                    {/* 介绍区域 */}
                    <div className="intro-section">
                        <Card className="intro-card">
                            <div className="intro-content">
                                <h2 className="intro-title">无障碍沟通辅助系统</h2>
                                <p className="intro-description">
                                    为听障、言语障碍等残疾人士提供便捷的沟通工具，让交流变得更加轻松自然。
                                    支持语音识别、文字转语音、紧急短语等多种功能。
                                </p>

                            </div>
                        </Card>
                    </div>

                    <div className="features-section">
                        <div className="features-grid">
                            {communicationFeatures.map(renderFeatureCard)}
                        </div>
                    </div>
                </>
            )}

            {/* 功能详情区域 */}
            {activeFeature && (
                <div className="feature-detail">
                    <div className="detail-header">
                        <Button
                            size="small"
                            onClick={() => setActiveFeature(null)}
                            icon={<CloseOutline />}
                        >
                            返回
                        </Button>
                        <span className="detail-title">
                            {communicationFeatures.find(f => f.id === activeFeature)?.title}
                        </span>
                    </div>

                    <div className="detail-content">
                        {activeFeature === 'speech-to-text' && renderSpeechToText()}
                        {activeFeature === 'text-to-speech' && renderTextToSpeech()}
                        {activeFeature === 'emergency-phrases' && renderEmergencyPhrases()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunicationAid; 