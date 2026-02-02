/**
 * Servicio de Exportación
 * Maneja las exportaciones de datos a PDF y otros formatos
 */

import api from './api/axiosConfig';

const exportacionService = {
  /**
   * Obtener datos para exportar planilla diaria
   * @param {string} fecha - Fecha de la planilla (YYYY-MM-DD)
   */
  async getPlanillaDiaria(fecha) {
    try {
      const response = await api.get('/exportar/planilla-diaria', {
        params: { fecha },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener datos para exportar ficha de paciente
   * @param {string} pacienteId - ID del paciente
   */
  async getFichaPaciente(pacienteId) {
    try {
      const response = await api.get(`/exportar/ficha-paciente/${pacienteId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default exportacionService;
