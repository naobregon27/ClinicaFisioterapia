/**
 * Servicio de Pacientes
 * Maneja todas las operaciones CRUD de pacientes
 */

import api from './api/axiosConfig';

class PacienteService {
  /**
   * Crear nuevo paciente
   */
  async crearPaciente(dataPaciente) {
    try {
      const response = await api.post('/pacientes', dataPaciente);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los pacientes con filtros
   */
  async obtenerPacientes(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.sortBy) params.append('sortBy', filtros.sortBy);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.obraSocial) params.append('obraSocial', filtros.obraSocial);
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      
      const response = await api.get(`/pacientes?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Búsqueda rápida de pacientes (para autocompletado)
   */
  async buscarPacientes(termino, limit = 10) {
    try {
      const response = await api.get(`/pacientes/buscar?q=${termino}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener paciente por ID
   */
  async obtenerPacientePorId(id) {
    try {
      const response = await api.get(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar paciente
   */
  async actualizarPaciente(id, datosActualizados) {
    try {
      const response = await api.put(`/pacientes/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar paciente (soft delete)
   */
  async eliminarPaciente(id) {
    try {
      const response = await api.delete(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar estado del paciente (activar/inactivar)
   */
  async actualizarEstadoPaciente(id, datosEstado) {
    try {
      const response = await api.put(`/pacientes/${id}/estado`, datosEstado);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Dar alta médica a un paciente
   */
  async darAltaMedica(id, datosAlta) {
    try {
      const response = await api.put(`/pacientes/${id}/alta`, datosAlta);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de pacientes
   */
  async obtenerEstadisticas() {
    try {
      const response = await api.get('/pacientes/estadisticas/resumen');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new PacienteService();


