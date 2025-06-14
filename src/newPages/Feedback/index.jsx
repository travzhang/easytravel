import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Radio,
  IconButton,
  Dialog,
  DialogBody,
  Chip,
  List,
  ListItem,
  ListItemPrefix,
} from '@material-tailwind/react';
import {
  ArrowLeftIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon as ExclamationTriangleSolidIcon } from '@heroicons/react/24/solid';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    type: '',
    description: '',
  });

  // 问题类型选项
  const problemTypes = [
    {
      value: 'facility',
      label: '设施问题',
      icon: '🏗️',
      description: '无障碍设施损坏或缺失',
      color: 'orange',
    },
    {
      value: 'route',
      label: '路线问题',
      icon: '🛤️',
      description: '无障碍路线不清晰或阻塞',
      color: 'blue',
    },
    {
      value: 'service',
      label: '服务问题',
      icon: '👥',
      description: '服务人员或服务质量问题',
      color: 'green',
    },
    {
      value: 'other',
      label: '其他问题',
      icon: '❓',
      description: '其他无障碍相关问题',
      color: 'purple',
    },
  ];

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.location || !formData.type || !formData.description) {
      alert('请填写所有必填字段');
      return;
    }

    setSubmitting(true);

    // 模拟提交
    setTimeout(() => {
      console.log('提交的反馈:', formData, fileList);

      setShowSuccess(true);
      setSubmitting(false);

      // 3秒后自动关闭成功对话框并返回
      setTimeout(() => {
        setShowSuccess(false);
        navigate(-1);
      }, 3000);
    }, 1500);
  };

  // 处理图片上传
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB');
        return;
      }

      if (fileList.length >= 3) {
        alert('最多只能上传3张照片');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
        };
        setFileList((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 删除图片
  const removeImage = (id) => {
    setFileList((prev) => prev.filter((img) => img.id !== id));
  };

  // 更新表单数据
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <IconButton
              variant="text"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </IconButton>
            <Typography variant="h5" color="blue-gray" className="font-bold">
              用户反馈
            </Typography>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="px-4 py-6 space-y-6">
        {/* 页面介绍 */}
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-2">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
              </div>
              <Typography variant="h5" className="text-gray-900 font-bold">
                反馈无障碍问题
              </Typography>
              <Typography
                variant="small"
                className="text-gray-600 leading-relaxed max-w-sm mx-auto"
              >
                您的反馈对我们非常重要，帮助我们为所有游客创造更好的无障碍环境
              </Typography>
            </div>
          </CardBody>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 问题位置 */}
          <Card className="shadow-lg border-0">
            <CardBody className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Typography
                    variant="h6"
                    className="text-gray-900 font-semibold"
                  >
                    问题位置 *
                  </Typography>
                  <Typography variant="small" className="text-gray-600">
                    请描述问题发生的具体位置
                  </Typography>
                </div>
              </div>
              <Input
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                label="例如：东门入口处"
                className="w-full border-gray-300 focus:border-blue-500 focus:border-2"
              />
            </CardBody>
          </Card>

          {/* 问题类型 */}
          <Card className="shadow-lg border-0">
            <CardBody className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <Typography
                    variant="h6"
                    className="text-gray-900 font-semibold"
                  >
                    问题类型 *
                  </Typography>
                  <Typography variant="small" className="text-gray-600">
                    选择最符合的问题类型
                  </Typography>
                </div>
              </div>
              <List className="flex-col gap-3">
                {problemTypes.map((type) => {
                  const isSelected = formData.type === type.value;
                  const borderColorClass = {
                    orange: 'border-orange-400',
                    blue: 'border-blue-400',
                    green: 'border-green-400',
                    purple: 'border-purple-400',
                  }[type.color];

                  return (
                    <ListItem
                      key={type.value}
                      className={`rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? `${borderColorClass} bg-gray-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <label className="flex w-full cursor-pointer items-center">
                        <ListItemPrefix className="mr-3">
                          <Radio
                            name="type"
                            value={type.value}
                            checked={isSelected}
                            onChange={(e) =>
                              updateFormData('type', e.target.value)
                            }
                            color={
                              type.color === 'orange'
                                ? 'deep-orange'
                                : type.color
                            }
                          />
                        </ListItemPrefix>
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{type.icon}</span>
                          <div>
                            <Typography
                              variant="small"
                              className="font-semibold text-gray-900"
                            >
                              {type.label}
                            </Typography>
                            <Typography
                              variant="small"
                              className="text-gray-600"
                            >
                              {type.description}
                            </Typography>
                          </div>
                        </div>
                      </label>
                    </ListItem>
                  );
                })}
              </List>
            </CardBody>
          </Card>

          {/* 问题描述 */}
          <Card className="shadow-lg border-0">
            <CardBody className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <Typography
                    variant="h6"
                    className="text-gray-900 font-semibold"
                  >
                    问题描述 *
                  </Typography>
                  <Typography variant="small" className="text-gray-600">
                    详细描述您遇到的问题
                  </Typography>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData('description', e.target.value)
                  }
                  placeholder="请详细描述您遇到的无障碍问题，包括具体情况、影响程度等..."
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <Typography variant="small" className="text-gray-500">
                  详细的描述有助于我们更好地解决问题
                </Typography>
                <Typography variant="small" className="text-gray-500">
                  {formData.description.length}/500
                </Typography>
              </div>
            </CardBody>
          </Card>

          {/* 上传照片 */}
          <Card className="shadow-lg border-0">
            <CardBody className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <PhotoIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <Typography
                    variant="h6"
                    className="text-gray-900 font-semibold"
                  >
                    上传照片
                  </Typography>
                  <Typography variant="small" className="text-gray-600">
                    照片有助于我们更好地了解问题
                  </Typography>
                </div>
              </div>

              {/* 已上传的图片 */}
              {fileList.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {fileList.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="上传的图片"
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 上传按钮 */}
              {fileList.length < 3 && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200">
                    <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <Typography
                      variant="small"
                      className="text-gray-600 font-medium mb-1"
                    >
                      点击上传照片
                    </Typography>
                    <Typography variant="small" className="text-gray-500">
                      最多上传3张，每张不超过10MB
                    </Typography>
                  </div>
                </label>
              )}

              {fileList.length >= 3 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <Typography variant="small" className="text-amber-700">
                    已达到最大上传数量（3张）
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>

          {/* 提交按钮 */}
          <Card className="shadow-lg border-0">
            <CardBody className="p-6">
              <Button
                type="submit"
                disabled={
                  submitting ||
                  !formData.location ||
                  !formData.type ||
                  !formData.description
                }
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 text-base"
                size="lg"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>提交中...</span>
                  </div>
                ) : (
                  '提交反馈'
                )}
              </Button>
              <Typography
                variant="small"
                className="text-gray-500 text-center mt-3"
              >
                提交后我们会尽快处理您的反馈
              </Typography>
            </CardBody>
          </Card>
        </form>
      </div>

      {/* 成功提交对话框 */}
      <Dialog
        open={showSuccess}
        handler={() => setShowSuccess(false)}
        size="sm"
      >
        <DialogBody className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <Typography variant="h5" className="text-gray-900 font-bold mb-2">
            反馈提交成功！
          </Typography>
          <Typography variant="small" className="text-gray-600 mb-6">
            感谢您的反馈，我们会尽快处理并改善相关问题
          </Typography>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Typography variant="small" className="font-medium">
              3秒后自动返回
            </Typography>
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
};

export default FeedbackPage;
