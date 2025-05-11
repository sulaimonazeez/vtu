// src/requestUtility.jsx
import axios from 'axios';

// Base URL for your Django API
const API_BASE_URL = 'https://paystar.com.ng/api'; // **Adjust this to your Django backend URL**

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Important: Allows sending and receiving cookies (including HttpOnly cookies)
  withCredentials: true,
});

// Flag to prevent multiple refresh token requests simultaneously
let isRefreshing = false;
// Array to store pending requests that need to be retried after token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Request Interceptor ---
// Adds the access token to the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // If you are using Django's CSRF protection for non-GET requests, get the token from the cookie
    // and add it to the headers. Django sets a 'csrftoken' cookie.
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
    if (csrfToken && config.method !== 'get') { // Don't send for GET requests
        config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor (for retry mechanism) ---
// Catches 401 errors, attempts to refresh token, and retries the original request
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 Unauthorized error and not a retry attempt already
    // We also check if the request was to the refresh token endpoint itself,
    // to prevent an infinite loop if refresh fails.
    if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/token/refresh/') {
      originalRequest._retry = true; // Mark as a retry attempt

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Call the refresh token endpoint
          // The browser automatically sends the 'refresh_token' HttpOnly cookie.
          // No need to send refresh token in the request body from client-side.
          const response = await axios.post('https://paystar.com.ng/api/token/refresh/');
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken); // Update access token

          isRefreshing = false;
          processQueue(null, newAccessToken); // Resolve all pending requests with the new token

          // Update authorization header of the original request with the new access token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request with the new access token
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          isRefreshing = false;
          processQueue(refreshError, null); // Reject all pending requests

          // If refresh token fails (e.g., invalid or expired), log the user out
          localStorage.removeItem('access_token');
          // Redirect to login page or show an error message
          // You might want to use React Router's history.push('/login') here
          window.location.href = '/login'; // Example redirection
          return Promise.reject(refreshError); // Propagate the refresh error
        }
      } else {
        // If a refresh token request is already in progress,
        // queue the original request to be retried once the token is refreshed.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }
    }

    // For any other error or if it's already a retry, just reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;
