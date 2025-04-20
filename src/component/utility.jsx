import axios from "axios";

const API_BASE_URL = "https://paystar.com.ng/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach Authorization token to every request
axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access_token"); // Retrieve from storage
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
