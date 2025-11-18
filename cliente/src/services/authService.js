/**
 * Servicio de Autenticación
 * Maneja todas las operaciones relacionadas con autenticación
 */

import api from './api/axiosConfig';

class AuthService {
  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar email con código de 6 dígitos
   */
  async verifyEmail(email, code) {
    try {
      const response = await api.post('/auth/verify-email', { email, code });
      
      if (response.data.success && response.data.data.accessToken) {
        this.saveAuthData(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reenviar código de verificación
   */
  async resendVerification(email) {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Iniciar sesión
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.data.accessToken) {
        this.saveAuthData(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      // El error ya viene formateado del interceptor
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      const token = this.getAccessToken();
      
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      // Continuar con el logout local aunque falle el servidor
      console.error('Error al hacer logout:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Refrescar token
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      if (response.data.success && response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      
      return response.data.data.accessToken;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success && response.data.data.usuario) {
        localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar perfil
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/update-profile', profileData);
      
      if (response.data.success && response.data.data.usuario) {
        localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ============ MÉTODOS AUXILIARES ============

  /**
   * Guardar datos de autenticación en localStorage
   */
  saveAuthData(data) {
    const { accessToken, refreshToken, usuario } = data;
    
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (usuario) localStorage.setItem('user', JSON.stringify(usuario));
  }

  /**
   * Limpiar datos de autenticación
   */
  clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Obtener usuario del localStorage
   */
  getCurrentUserFromStorage() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Obtener access token
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role) {
    const user = this.getCurrentUserFromStorage();
    return user?.rol === role;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin() {
    return this.hasRole('administrador');
  }

  /**
   * Verificar si el usuario es empleado o superior
   */
  isEmpleadoOrHigher() {
    const user = this.getCurrentUserFromStorage();
    return user?.rol === 'empleado' || user?.rol === 'administrador';
  }
}

export default new AuthService();


