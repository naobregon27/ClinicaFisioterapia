/**
 * Servicio de Calendario
 * Maneja las operaciones del calendario de sesiones
 */

import api from './api/axiosConfig';

const calendarioService = {
  /**
   * Obtener sesiones por rango de fechas
   * @param {Object} params - Parámetros de consulta
   * @param {string} params.fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} params.fechaFin - Fecha de fin (YYYY-MM-DD)
   * @param {string} params.profesionalId - ID del profesional (opcional)
   * @param {string} params.pacienteId - ID del paciente (opcional)
   * @param {string} params.estado - Estado de sesión (opcional)
   */
  async getSesiones(params) {
    try {
      const response = await api.get('/calendario/sesiones', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener sesiones agrupadas por día
   * @param {Object} params - Parámetros de consulta (igual que getSesiones)
   */
  async getSesionesAgrupadas(params) {
    try {
      const response = await api.get('/calendario/sesiones-agrupadas', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default calendarioService;
