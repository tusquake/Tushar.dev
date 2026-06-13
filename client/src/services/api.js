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

        // Handle concurrent session logout
        if (error.response?.status === 401 && error.response?.data?.code === 'SESSION_EXPIRED') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            if (!window.location.pathname.startsWith('/p/')) {
                window.location.href = '/login?error=session_expired';
            }
            return Promise.reject(error);
        }

        // Handle subscription required
        if (error.response?.status === 402) {
            window.dispatchEvent(new CustomEvent('subscription-required', { detail: error.response.data }));
            return Promise.reject(error);
        }

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
                // Refresh failed, clear tokens and redirect to login if not viewing public profile
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                if (!window.location.pathname.startsWith('/p/')) {
                    window.location.href = '/login';
                }
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
    getPublicProfile: (userId) => api.get(`/auth/profile/public/${userId}`),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    getMe: () => api.get('/auth/me'),
    subscribe: (tier) => api.post('/auth/subscribe', { tier }),
    updateProfile: (data) => api.put('/auth/profile', data),
    getLeaderboard: () => api.get('/auth/leaderboard'),
};

// Projects API
export const projectsAPI = {
    getAll: () => api.get('/projects'),
    getOne: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    getUserProjects: (userId) => api.get(`/projects/user/${userId}`),
    importGithub: (githubLink) => api.post('/projects/import-github', { githubLink }),
    deleteUserProject: (id) => api.delete(`/projects/user/${id}`),
    createUserProject: (data) => api.post('/projects/user', data),
    updateUserProject: (id, data) => api.put(`/projects/user/${id}`, data),
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
    getActivityHistory: () => api.get('/learning/activity'),
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

// DSA Progress API
export const dsaProgressAPI = {
    getProgress: () => api.get('/learning/dsa/progress'),
    updateProgress: (completedQuestions) => api.post('/learning/dsa/progress', { completedQuestions }),
    getLeetcodeSubmissions: (username) => api.post('/learning/dsa/leetcode-submissions', { username }),
};

// Resume API
export const resumeAPI = {
    get: () => api.get('/resume'),
    save: (resumeData) => api.post('/resume', { resumeData }),
};

// Interview API
export const interviewAPI = {
    getAll: () => api.get('/interviews'),
    create: (data) => api.post('/interviews', data),
    clear: () => api.delete('/interviews'),
};

// Reviews API
export const reviewsAPI = {
    getAll: () => api.get('/reviews'),
    create: (data) => api.post('/reviews', data),
};

// Tasks API
export const tasksAPI = {
    getAll: (date) => api.get('/tasks', { params: { date } }),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
};

// Payment API
export const paymentAPI = {
    createOrder: (tier) => api.post('/payment/order', { tier }),
    verifyPayment: (paymentData) => api.post('/payment/verify', paymentData),
};

// Integrations API
export const integrationsAPI = {
    getGithub: (username) => api.get(`/integrations/github/${username}`),
    getLeetcode: (username) => api.get(`/integrations/leetcode/${username}`),
};

export default api;

