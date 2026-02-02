/**
 * Servicio de Notificaciones
 * Maneja todas las operaciones relacionadas con notificaciones
 */

import api from './api/axiosConfig';

const notificacionesService = {
  /**
   * Obtener notificaciones del usuario con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Resultados por página
   * @param {boolean} params.leida - Filtrar por estado de lectura
   * @param {string} params.tipo - Filtrar por tipo
   * @param {string} params.prioridad - Filtrar por prioridad
   */
  async getNotificaciones(params = {}) {
    try {
      const response = await api.get('/notificaciones', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener notificaciones no leídas
   * @returns {Promise} Notificaciones no leídas y contador
   */
  async getNoLeidas() {
    try {
      const response = await api.get('/notificaciones/no-leidas');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Marcar una notificación como leída
   * @param {string} id - ID de la notificación
   */
  async marcarComoLeida(id) {
    try {
      const response = await api.put(`/notificaciones/${id}/leer`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas() {
    try {
      const response = await api.put('/notificaciones/leer-todas');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Eliminar una notificación
   * @param {string} id - ID de la notificación
   */
  async eliminarNotificacion(id) {
    try {
      const response = await api.delete(`/notificaciones/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default notificacionesService;
