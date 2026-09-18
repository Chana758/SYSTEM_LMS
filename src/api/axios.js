import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    // Tell the server that our application always wants to receive data back in JSON format.
    'Content-Type': 'application/json', 
    'Accept': 'application/json',
  },
  timeout: 10000,
});

export default apiClient;                                                                             