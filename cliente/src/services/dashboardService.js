/**
 * Servicio de Dashboard
 * Maneja las métricas y datos del dashboard
 */

import api from './api/axiosConfig';

const dashboardService = {
  /**
   * Obtener métricas del dashboard
   * @param {string} fecha - Fecha para calcular métricas (YYYY-MM-DD)
   */
  async getMetricas(fecha = null) {
    try {
      const params = fecha ? { fecha } : {};
      const response = await api.get('/dashboard/metricas', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default dashboardService;
