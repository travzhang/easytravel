// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 无障碍相关API
  async uploadTrajectory(trajectoryData) {
    return this.request('/accessibility/trajectory', {
      method: 'POST',
      body: JSON.stringify(trajectoryData),
    });
  }

  async getHeatmapData(scenicId, userType = 'all', minConfidence = 0) {
    const params = new URLSearchParams({
      userType,
      minConfidence: minConfidence.toString(),
    });
    
    return this.request(`/accessibility/heatmap/${scenicId}?${params}`);
  }

  async submitFeedback(feedbackData) {
    return this.request('/accessibility/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async getFeedback(scenicId, filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value);
      }
    });

    return this.request(`/accessibility/feedback/${scenicId}?${params}`);
  }

  // 景点相关API
  async getScenicDetail(scenicId) {
    return this.request(`/scenic-area/${scenicId}`);
  }

  async getScenicList(filters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    return this.request(`/scenic-area?${params}`);
  }
}

export default new ApiService(); 