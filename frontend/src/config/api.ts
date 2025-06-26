// API Configuration
// This file ensures we're using the correct API URL

export const API_URL = import.meta.env.VITE_API_URL || 'https://mexican-real-estate-ai.onrender.com/api';

console.log('API URL:', API_URL); // This will help debug in browser console

export default API_URL;