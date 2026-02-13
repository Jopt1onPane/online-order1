import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('merchantToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('merchantToken');
      localStorage.removeItem('merchantInfo');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// 菜品相关API
export const menuAPI = {
  getAll: (category) => api.get('/menu', { params: { category } }),
  getById: (id) => api.get(`/menu/${id}`),
  getByIds: (ids) => api.get('/menu/by-ids', { params: { ids: ids.join(',') } }),
  create: (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', data.price);
    formData.append('category', data.category);
    if (data.image) {
      formData.append('image', data.image);
    }
    return api.post('/menu', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.price) formData.append('price', data.price);
    if (data.category) formData.append('category', data.category);
    if (data.isAvailable !== undefined) formData.append('isAvailable', data.isAvailable);
    if (data.image) {
      formData.append('image', data.image);
    }
    return api.put(`/menu/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/menu/${id}`),
  getMyItems: () => api.get('/menu/merchant/my-items'),
};

// 订单相关API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (status) => api.get('/orders/merchant/my-orders', { params: { status } }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export default api;
