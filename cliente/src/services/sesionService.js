/**
 * Servicio de Sesiones
 * Maneja todas las operaciones de sesiones de fisioterapia
 */

import api from './api/axiosConfig';

class SesionService {
  /**
   * Registrar nueva sesión
   */
  async registrarSesion(dataSesion) {
    try {
      const response = await api.post('/sesiones', dataSesion);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sesiones con filtros
   */
  async obtenerSesiones(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.sortBy) params.append('sortBy', filtros.sortBy);
      if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId);
      if (filtros.fecha) params.append('fecha', filtros.fecha);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.pagado !== undefined) params.append('pagado', filtros.pagado);
      
      const response = await api.get(`/sesiones?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sesiones programadas ordenadas por fecha
   * Utilizadas para marcar días con sesiones en calendarios
   */
  async obtenerSesionesProgramadasCalendario(limit = 500) {
    try {
      const response = await this.obtenerSesiones({
        estado: 'programada',
        sortBy: 'fecha',
        limit,
        page: 1,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener planilla diaria
   */
  async obtenerPlanillaDiaria(fecha = null) {
    try {
      const url = fecha 
        ? `/sesiones/planilla-diaria?fecha=${fecha}`
        : '/sesiones/planilla-diaria';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener historial de paciente
   */
  async obtenerHistorialPaciente(pacienteId, page = 1, limit = 20) {
    try {
      const response = await api.get(
        `/sesiones/paciente/${pacienteId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar sesión
   */
  async actualizarSesion(id, datosActualizados) {
    try {
      const response = await api.put(`/sesiones/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registrar pago de sesión
   */
  async registrarPago(id, datosPago) {
    try {
      const response = await api.put(`/sesiones/${id}/pago`, datosPago);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancelar sesión
   */
  async cancelarSesion(id, motivo) {
    try {
      const response = await api.put(`/sesiones/${id}/cancelar`, { motivo });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de sesiones
   */
  async obtenerEstadisticas(fechaInicio = null, fechaFin = null) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      const url = params.toString() 
        ? `/sesiones/estadisticas/resumen?${params.toString()}`
        : '/sesiones/estadisticas/resumen';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener pagos pendientes
   */
  async obtenerPagosPendientes(limit = 50, pacienteId = null) {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit);
      if (pacienteId) params.append('pacienteId', pacienteId);
      
      const response = await api.get(`/sesiones/pagos-pendientes?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sesión por ID
   */
  async obtenerSesionPorId(id) {
    try {
      const response = await api.get(`/sesiones/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new SesionService();


