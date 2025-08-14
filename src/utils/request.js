import axios from "axios";

// 创建 axios 实例
const service = axios.create({
    baseURL: "http://localhost:3000", // 基础 URL
    timeout: 5000 // 请求超时
});

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 你可以在这里添加 token
        // config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
        return config;
    },
    error => Promise.reject(error)
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        return response.data; // 直接返回 data
    },
    error => {
        console.error("请求出错：", error.message);
        return Promise.reject(error);
    }
);

export default service;
