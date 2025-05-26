import axios from 'axios';

// Use relative path for API calls (works in both dev and production)
const baseURL = '/api';

// Create axios instance with common configuration
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

export default api;