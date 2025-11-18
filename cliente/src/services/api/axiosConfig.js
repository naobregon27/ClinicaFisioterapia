/**
 * Configuración de Axios con interceptores
 * Maneja automáticamente:
 * - Agregado de tokens a requests
 * - Refresh de tokens cuando expiran
 * - Manejo global de errores
 */

import axios from 'axios';
import config from '../../config/config';

// Crear instancia de axios
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log de la URL configurada (solo en desarrollo, una vez)
if (import.meta.env.DEV && !window._apiUrlLogged) {
  console.log('🌐 API Base URL:', config.apiUrl);
  window._apiUrlLogged = true;
}

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
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

// Interceptor de REQUEST - Agregar token automáticamente
api.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      requestConfig.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de RESPONSE - Manejar errores y refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si no hay respuesta (error de red)
    if (!error.response) {
      // Determinar el tipo de error de red
      let errorMessage = 'Error de conexión con el servidor.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el servidor esté activo y que no haya problemas de CORS.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'El servidor tardó demasiado en responder. Intenta nuevamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Crear un error formateado que se pueda manejar correctamente
      // NO incluir originalError porque no es serializable para Redux
      const networkError = {
        success: false,
        message: errorMessage,
        type: 'network',
        code: error.code,
      };
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Si es 401 y no hemos reintentado aún
    if (status === 401 && !originalRequest._retry) {
      
      // Si el error es por token expirado
      if (data?.message?.includes('expirado') || data?.message?.includes('expired')) {
        
        if (isRefreshing) {
          // Si ya está refrescando, agregar a la cola
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No hay refresh token, redirigir a login
          isRefreshing = false;
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(data);
        }

        try {
          // Intentar refrescar el token
          const response = await axios.post(
            `${config.apiUrl}/auth/refresh-token`,
            { refreshToken }
          );
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Guardar nuevos tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Actualizar header de la petición original
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          
          // Procesar cola de peticiones pendientes
          processQueue(null, accessToken);
          isRefreshing = false;
          
          // Reintentar petición original
          return api(originalRequest);
          
        } catch (refreshError) {
          // Si falla el refresh, logout
          processQueue(refreshError, null);
          isRefreshing = false;
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Error 401 pero no por token expirado
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    // Formatear error para devolverlo de manera consistente
    const errorData = {
      success: false,
      message: data?.message || 'Ha ocurrido un error',
      errors: data?.errors || [],
      status,
    };

    return Promise.reject(errorData);
  }
);

export default api;

