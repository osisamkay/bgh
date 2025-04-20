// services/adminApi.js
import axios from 'axios';

// Create an axios instance with default config
const adminApi = axios.create({
    baseURL: '/api/admin',
    timeout: 15000,
});

// Request interceptor for adding auth token
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
adminApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized errors
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Dashboard data
export const fetchDashboardData = () => {
    return adminApi.get('/dashboard');
};

// User operations
export const fetchUsers = (params) => {
    return adminApi.get('/users', { params });
};

export const updateUser = (userId, data) => {
    return adminApi.put(`/users/${userId}`, data);
};

export const deleteUser = (userId) => {
    return adminApi.delete(`/users/${userId}`);
};

// Booking operations
export const fetchBookings = (params) => {
    return adminApi.get('/bookings', { params });
};

export const updateBooking = (bookingId, data) => {
    return adminApi.put(`/bookings/${bookingId}`, data);
};

export const deleteBooking = (bookingId) => {
    return adminApi.delete(`/bookings/${bookingId}`);
};

// Reports
export const generateReport = (data) => {
    return adminApi.post('/reports', data);
};

// Settings
export const getSettings = () => {
    return adminApi.get('/settings');
};

export const updateSettings = (data) => {
    return adminApi.put('/settings', data);
};

// Discount codes
export const fetchDiscountCodes = () => {
    return adminApi.get('/discount-codes');
};

export const createDiscountCode = (data) => {
    return adminApi.post('/discount-codes', data);
};

export const updateDiscountCode = (codeId, data) => {
    return adminApi.put(`/discount-codes/${codeId}`, data);
};

export const deleteDiscountCode = (codeId) => {
    return adminApi.delete(`/discount-codes/${codeId}`);
};

export default adminApi;