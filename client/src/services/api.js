import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 &&
            error.response?.data?.code === 'TOKEN_EXPIRED' &&
            !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const response = await api.post('/auth/refresh');
                const { accessToken } = response.data.data;

                // Save new token
                localStorage.setItem('accessToken', accessToken);

                // Retry the original request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
    getProfile: () => api.get('/user/profile'),
};

// Projects API
export const projectsAPI = {
    getAll: () => api.get('/projects'),
    getOne: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
};

// Certificates API
export const certificatesAPI = {
    getAll: () => api.get('/certificates'),
    getOne: (id) => api.get(`/certificates/${id}`),
    create: (data) => api.post('/certificates', data),
    update: (id, data) => api.put(`/certificates/${id}`, data),
    delete: (id) => api.delete(`/certificates/${id}`),
};

// Learning API
export const learningAPI = {
    getAll: (params) => api.get('/learning', { params }),
    getOne: (id) => api.get(`/learning/${id}`),
    create: (data) => api.post('/learning', data),
    update: (id, data) => api.put(`/learning/${id}`, data),
    updateStatus: (id, status) => api.patch(`/learning/${id}/status`, { status }),
    delete: (id) => api.delete(`/learning/${id}`),
};

// Contact API
export const contactAPI = {
    submit: (data) => api.post('/contact', data),
    getAll: (params) => api.get('/contact', { params }),
    markAsRead: (id) => api.patch(`/contact/${id}/read`),
    delete: (id) => api.delete(`/contact/${id}`),
};

// Learning Resources API
export const learningResourcesAPI = {
    getAll: () => api.get('/learning-resources'),
    getAllAdmin: () => api.get('/learning-resources/all'),
    create: (data) => api.post('/learning-resources', data),
    update: (id, data) => api.put(`/learning-resources/${id}`, data),
    delete: (id) => api.delete(`/learning-resources/${id}`),
};

// Upload API
export const uploadAPI = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default api;

