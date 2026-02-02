/**
 * Servicio de Evolución
 * Maneja los datos de evolución de pacientes
 */

import api from './api/axiosConfig';

const evolucionService = {
  /**
   * Obtener datos de evolución de un paciente
   * @param {string} pacienteId - ID del paciente
   * @param {Object} params - Parámetros opcionales
   * @param {string} params.fechaInicio - Filtrar desde fecha
   * @param {string} params.fechaFin - Filtrar hasta fecha
   */
  async getEvolucionPaciente(pacienteId, params = {}) {
    try {
      const response = await api.get(`/evolucion/paciente/${pacienteId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default evolucionService;
