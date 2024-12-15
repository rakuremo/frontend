// src/api/axiosInstance.js
import axios from 'axios';

 //console.log("varx",process.env.API_BACKEND);

const axiosInstance = axios.create({
  baseURL: process.env.API_BACKEND,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm Bearer Token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); 
     //console.log('Token var:', token); // Thêm log ở đây
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;
