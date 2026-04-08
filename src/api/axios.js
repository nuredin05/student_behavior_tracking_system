import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Uses Vite proxy → http://localhost:5000/api (avoids CORS on file uploads)
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
