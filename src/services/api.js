import axios from 'axios';

const API_BASE_URL = '/api';  // Updated to use Vite proxy

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error
      console.error('Server Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const generateStoryIdeas = async (data) => {
  const response = await api.post('/generate-story-ideas', data);
  return response.data;
};

export const developPlot = async (data) => {
  const response = await api.post('/develop-plot', data);
  return response.data;
};

export const createCharacter = async (data) => {
  const response = await api.post('/create-character', data);
  return response.data;
};

export const generateDialogue = async (data) => {
  const response = await api.post('/generate-dialogue', data);
  return response.data;
};

export const analyzeText = async (text) => {
  const response = await api.post('/analyze-text', { text });
  return response.data;
};