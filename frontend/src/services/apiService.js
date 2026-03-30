import axios from 'axios';
import { getCurrentToken } from './authService';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor: Añadir token a cada petición
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getCurrentToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor: Manejo de errores
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o no válido
      console.error('No autorizado. Por favor inicia sesión de nuevo.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;