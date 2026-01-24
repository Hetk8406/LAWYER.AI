import axios from 'axios';

const instance = axios.create({
    baseURL: '/', // Vite proxy handles /api requests to localhost:5000
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach the token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor (optional, but good for global error handling)
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Optionally handle 401 (Unauthorized) here by logging out
        if (error.response && error.response.status === 401) {
            // dispatch logout action or redirect
            console.warn("Unauthorized access - redirecting to login");
            // window.location.href = '/'; // Be careful with this, might cause loops if not handled right
        }
        return Promise.reject(error);
    }
);

export default instance;
