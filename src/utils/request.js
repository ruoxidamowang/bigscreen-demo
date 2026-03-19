import axios from "axios";

// 创建 axios 实例
const service = axios.create({
    // baseURL: "http://125.122.25.150:18899", //生产
    baseURL: "http://localhost:8888",
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
