import React, { useState } from 'react';
import {
  Form,
  Input,
  TextArea,
  Button,
  ImageUploader,
  Radio,
  Slider,
  Toast,
  Space,
  Dialog
} from 'antd-mobile';
import { CameraOutline, PictureOutline, ExclamationCircleOutline } from 'antd-mobile-icons';
import { submitFeedback } from '../services/feedbackService';
import './FeedbackForm.css';

/**
 * 反馈表单组件
 * @param {Object} props - 组件属性
 * @param {string} props.scenicAreaId - 景区ID
 * @param {string} props.userId - 用户ID
 * @param {string} props.initialLocation - 初始位置
 * @param {Object} props.initialCoordinates - 初始坐标 {lng, lat}
 * @param {Function} props.onSuccess - 提交成功回调
 * @param {Function} props.onCancel - 取消回调
 */
const FeedbackForm = ({
  scenicAreaId,
  userId = 'anonymous',
  initialLocation = '',
  initialCoordinates = null,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [severity, setSeverity] = useState(3);

  // 问题类型选项
  const problemTypes = [
    { value: 'facility', label: '设施问题' },
    { value: 'route', label: '路线问题' },
    { value: 'service', label: '服务问题' },
    { value: 'other', label: '其他问题' }
  ];

  // 处理图片上传
  const handleImageUpload = async (file) => {
    // 在实际应用中，这里应该调用上传API
    // 这里模拟上传过程
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

  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // 检查必填字段
      if (!values.location || !values.description || !values.type) {
        Toast.show({
          icon: 'fail',
          content: '请填写必填字段',
        });
        setSubmitting(false);
        return;
      }

      // 准备提交数据
      const feedbackData = {
        userId,
        scenicAreaId,
        location: values.location,
        description: values.description,
        type: values.type,
        severity,
        images: fileList.map(file => file.url),
        deviceInfo: navigator.userAgent,
        ...initialCoordinates
      };

      // 提交反馈
      await submitFeedback(feedbackData);

      Toast.show({
        icon: 'success',
        content: '反馈提交成功',
      });

      // 重置表单
      form.resetFields();
      setFileList([]);
      setSeverity(3);

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      Toast.show({
        icon: 'fail',
        content: '提交失败，请稍后重试',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    if (form.isFieldsTouched() || fileList.length > 0) {
      Dialog.confirm({
        content: '确定要放弃当前编辑的反馈吗？',
        confirmText: '放弃',
        cancelText: '继续编辑',
        onConfirm: () => {
          if (onCancel) {
            onCancel();
          }
        },
      });
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  };

  return (
    <div className="feedback-form-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        footer={
          <div className="form-buttons">
            <Space direction="vertical" block>
              <Button block type="submit" color="primary" loading={submitting} size="large">
                提交反馈
              </Button>
              <Button block onClick={handleCancel} size="large">
                取消
              </Button>
            </Space>
          </div>
        }
      >
        <Form.Header>
          <div className="form-header">
            <ExclamationCircleOutline className="header-icon" />
            <span>无障碍问题反馈</span>
          </div>
        </Form.Header>

        <Form.Item
          name="location"
          label="问题位置"
          initialValue={initialLocation}
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

        <Form.Item label="问题严重程度">
          <div className="severity-slider">
            <span className="severity-label">轻微</span>
            <Slider
              value={severity}
              min={1}
              max={5}
              step={1}
              onChange={setSeverity}
              icon={<></>}
            />
            <span className="severity-label">严重</span>
          </div>
          <div className="severity-value">
            {severity === 1 && '轻微问题，不影响使用'}
            {severity === 2 && '小问题，稍有不便'}
            {severity === 3 && '一般问题，有一定影响'}
            {severity === 4 && '严重问题，影响使用'}
            {severity === 5 && '非常严重，完全无法使用'}
          </div>
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
            <PictureOutline /> 最多上传3张照片，每张不超过10MB
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FeedbackForm;
