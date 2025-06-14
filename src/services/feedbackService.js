import axios from 'axios';

const API_URL = '/api';

/**
 * 提交反馈
 * @param {Object} feedbackData - 反馈数据
 * @returns {Promise} - 返回提交结果
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await axios.post(`${API_URL}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    console.error('提交反馈失败:', error);
    throw error;
  }
};

/**
 * 获取用户反馈列表
 * @param {string} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise} - 返回用户反馈列表
 */
export const getUserFeedbacks = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/feedback/user/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('获取用户反馈列表失败:', error);
    throw error;
  }
};

/**
 * 获取景区反馈列表
 * @param {string} scenicAreaId - 景区ID
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise} - 返回景区反馈列表
 */
export const getScenicFeedbacks = async (scenicAreaId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/feedback/scenic/${scenicAreaId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('获取景区反馈列表失败:', error);
    throw error;
  }
};

/**
 * 获取反馈详情
 * @param {string} feedbackId - 反馈ID
 * @returns {Promise} - 返回反馈详情
 */
export const getFeedbackDetail = async (feedbackId) => {
  try {
    const response = await axios.get(`${API_URL}/feedback/${feedbackId}`);
    return response.data;
  } catch (error) {
    console.error('获取反馈详情失败:', error);
    throw error;
  }
};

/**
 * 更新反馈状态
 * @param {string} feedbackId - 反馈ID
 * @param {Object} updateData - 更新数据
 * @returns {Promise} - 返回更新结果
 */
export const updateFeedbackStatus = async (feedbackId, updateData) => {
  try {
    const response = await axios.patch(`${API_URL}/feedback/${feedbackId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('更新反馈状态失败:', error);
    throw error;
  }
};

/**
 * 删除反馈
 * @param {string} feedbackId - 反馈ID
 * @returns {Promise} - 返回删除结果
 */
export const deleteFeedback = async (feedbackId) => {
  try {
    const response = await axios.delete(`${API_URL}/feedback/${feedbackId}`);
    return response.data;
  } catch (error) {
    console.error('删除反馈失败:', error);
    throw error;
  }
};
