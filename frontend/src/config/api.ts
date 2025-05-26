import axios from 'axios';

// Determine the base URL based on environment
const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment
  ? 'http://localhost:5000/api' // Development environment
  : '/api';                      // Production environment (relative path)

// Create axios instance with common configuration
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

export default api;