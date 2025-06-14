import React, { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Textarea,
  Input,
  Typography,
  IconButton,
  Chip,
} from '@material-tailwind/react';
import {
  PhotoIcon,
  XMarkIcon,
  MapPinIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';

const CreatePostDialog = ({ open, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [images, setImages] = useState([]);

  const handleSubmit = () => {
    if (!content.trim()) return;

    onSubmit({
      content: content.trim(),
      location: location.trim(),
      tags,
      images,
    });

    // 重置表单
    setContent('');
    setLocation('');
    setTags([]);
    setNewTag('');
    setImages([]);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // 这里应该上传到服务器，现在只是模拟
    const imageUrls = files.map(
      (file, index) =>
        `https://images.unsplash.com/photo-${Date.now() + index}?w=400`,
    );
    setImages([...images, ...imageUrls]);
  };

  return (
    <Dialog open={open} handler={onClose} size="lg" className="rounded-2xl">
      <DialogHeader className="flex items-center justify-between">
        <Typography variant="h5" color="blue-gray">
          发布新帖子
        </Typography>
        <IconButton variant="text" size="sm" onClick={onClose}>
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="space-y-4">
        {/* 内容输入 */}
        <div>
          <Typography
            variant="small"
            color="blue-gray"
            className="mb-2 font-medium"
          >
            分享你的想法
          </Typography>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的出行体验、小贴士或者想法..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* 位置输入 */}
        <div>
          <Typography
            variant="small"
            color="blue-gray"
            className="mb-2 font-medium"
          >
            位置 (可选)
          </Typography>
          <div className="relative">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="添加位置信息"
              icon={<MapPinIcon className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* 标签输入 */}
        <div>
          <Typography
            variant="small"
            color="blue-gray"
            className="mb-2 font-medium"
          >
            标签 (可选)
          </Typography>
          <div className="flex items-center space-x-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="添加标签"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              icon={<HashtagIcon className="h-5 w-5" />}
            />
            <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
              添加
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  value={tag}
                  onClose={() => handleRemoveTag(tag)}
                  size="sm"
                  color="blue"
                  className="rounded-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* 图片上传 */}
        <div>
          <Typography
            variant="small"
            color="blue-gray"
            className="mb-2 font-medium"
          >
            图片 (可选)
          </Typography>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <Typography variant="small" color="gray">
                点击上传图片
              </Typography>
            </label>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <IconButton
                    size="sm"
                    color="red"
                    className="absolute -top-2 -right-2"
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== index))
                    }
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogBody>

      <DialogFooter className="space-x-2">
        <Button variant="text" color="pink" onClick={onClose}>
          取消
        </Button>
        <Button color="pink" onClick={handleSubmit} disabled={!content.trim()}>
          发布
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreatePostDialog;
