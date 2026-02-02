/**
 * Servicio de Búsqueda Global
 * Maneja las búsquedas globales en el sistema
 */

import api from './api/axiosConfig';

const busquedaService = {
  /**
   * Realizar búsqueda global
   * @param {string} q - Término de búsqueda
   * @param {Object} options - Opciones adicionales
   * @param {number} options.limit - Límite de resultados por tipo
   * @param {string} options.tipos - Tipos a buscar separados por coma
   */
  async buscarGlobal(q, options = {}) {
    try {
      const params = {
        q,
        ...options,
      };
      const response = await api.get('/buscar', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default busquedaService;
