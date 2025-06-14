import React, { useState } from 'react';
import { NavBar, Form, Input, TextArea, Button, Toast, ImageUploader, Radio, Space, Modal } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { CameraOutline } from 'antd-mobile-icons';
import './index.css';

const Feedback = () => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 问题类型选项
  const problemTypes = [
    { value: 'facility', label: '设施问题' },
    { value: 'route', label: '路线问题' },
    { value: 'service', label: '服务问题' },
    { value: 'other', label: '其他问题' }
  ];

  // 处理表单提交
  const handleSubmit = (values) => {
    setSubmitting(true);
    
    // 模拟提交
    setTimeout(() => {
      console.log('提交的反馈:', values, fileList);
      
      // Toast.show({
      //   icon: 'success',
      //   content: '反馈提交成功',
      // });

      Toast.show({
        icon: 'fail',
        title: '提交失败',
        content: '检测到所在经纬度超出所点击的经纬度范围',
      });

      // 重置表单
      setFileList([]);
      setSubmitting(false);
    }, 1000);
  };

  // 处理图片上传
  const handleImageUpload = async (file) => {
    // 模拟上传过程
    Toast.show({
      icon: 'loading',
      content: '上传中...',
      duration: 1000,
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url: URL.createObjectURL(file),
        });
      }, 1000);
    });
  };

  return (
    <div className="feedback-page">
      <NavBar onBack={() => navigate(-1)}>无障碍反馈</NavBar>
      
      <div className="feedback-content">
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          footer={
            <Button block type="submit" color="primary" loading={submitting} size="large">
              提交反馈
            </Button>
          }
        >
          <Form.Header>请填写您遇到的无障碍问题</Form.Header>
          
          <Form.Item
            name="location"
            label="问题位置"
            rules={[{ required: true, message: '请描述问题发生的位置' }]}
          >
            <Input placeholder="请描述问题发生的具体位置" />
          </Form.Item>

          <Form.Item
            name="type"
            label="问题类型"
            rules={[{ required: true, message: '请选择问题类型' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                {problemTypes.map(type => (
                  <Radio key={type.value} value={type.value}>
                    {type.label}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="description"
            label="问题描述"
            rules={[{ required: true, message: '请描述遇到的问题' }]}
          >
            <TextArea
              placeholder="请详细描述您遇到的无障碍问题"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item label="上传照片">
            <ImageUploader
              value={fileList}
              onChange={setFileList}
              upload={handleImageUpload}
              multiple
              maxCount={3}
              showUpload={fileList.length < 3}
              preview
              deletable
              beforeUpload={(file) => {
                if (file.size > 10 * 1024 * 1024) {
                  Toast.show('图片大小不能超过10MB');
                  return null;
                }
                return file;
              }}
              children={
                <div className="upload-button">
                  <Space direction="vertical" align="center">
                    <CameraOutline fontSize={24} />
                    <span>上传照片</span>
                  </Space>
                </div>
              }
            />
            <div className="upload-tip">
              最多上传3张照片，每张不超过10MB
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Feedback;
