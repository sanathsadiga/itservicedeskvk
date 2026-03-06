import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const incidentAPI = {
  create: (data) => api.post('/incidents/create', data),
  list: (filters) => api.get('/incidents/list', { params: filters }),
  getDetails: (id) => api.get(`/incidents/${id}`),
  assign: (id, data) => api.put(`/incidents/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/incidents/${id}/status`, data),
  close: (id, data) => api.put(`/incidents/${id}/close`, data),
  addComment: (id, data) => api.post(`/incidents/${id}/comment`, data),
};

export const userAPI = {
  list: () => api.get('/users/list'),
  getDetails: (id) => api.get(`/users/${id}`),
  updateRole: (id, data) => api.put(`/users/${id}/role`, data),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
};

export const typesAPI = {
  list: () => api.get('/types'),
  create: (data) => api.post('/types/create', data),
};

export const locationsAPI = {
  list: () => api.get('/locations'),
  create: (data) => api.post('/locations/create', data),
};

export default api;
