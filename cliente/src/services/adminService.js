/**
 * Servicio de Administración
 * Consume los endpoints del módulo de administrador
 */

import api from './api/axiosConfig';

class AdminService {
  /* ======== ESTADÍSTICAS ======== */
  async getEstadisticas() {
    try {
      const response = await api.get('/admin/estadisticas');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /* ======== USUARIOS ======== */
  async getUsuarios(params = {}) {
    try {
      const response = await api.get('/admin/usuarios', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getColaboradores(params = {}) {
    try {
      const response = await api.get('/admin/usuarios/colaboradores', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUsuarioById(id) {
    try {
      const response = await api.get(`/admin/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createUsuario(data) {
    try {
      const response = await api.post('/admin/usuarios', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUsuario(id, data) {
    try {
      const response = await api.put(`/admin/usuarios/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUsuario(id) {
    try {
      const response = await api.delete(`/admin/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changeUsuarioPassword(id, data) {
    try {
      const response = await api.put(`/admin/usuarios/${id}/password`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changeUsuarioRol(id, nuevoRol) {
    try {
      const response = await api.put(`/admin/usuarios/${id}/rol`, { nuevoRol });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changeUsuarioEstado(id, nuevoEstado) {
    try {
      const response = await api.put(`/admin/usuarios/${id}/estado`, { nuevoEstado });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async desbloquearUsuario(id) {
    try {
      const response = await api.put(`/admin/usuarios/${id}/desbloquear`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /* ======== AUDITORÍA ======== */
  async getAuditoria(params = {}) {
    try {
      const response = await api.get('/admin/auditoria', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAuditoriaPorUsuario(id, params = {}) {
    try {
      const response = await api.get(`/admin/auditoria/usuario/${id}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAuditoriaEstadisticas(params = {}) {
    try {
      const response = await api.get('/admin/auditoria/estadisticas', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /* ======== PAGOS DEL PERSONAL ======== */
  async getPagosPersonal(params = {}) {
    try {
      const response = await api.get('/admin/pagos-personal', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPagoPersonalById(id) {
    try {
      const response = await api.get(`/admin/pagos-personal/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPlanillaMes(params = {}) {
    try {
      const response = await api.get('/admin/pagos-personal/planilla', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPagosPlanillaRegistros(params = {}) {
    try {
      const response = await api.get('/admin/pagos-personal/planilla', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createOrUpdatePagoPersonal(data) {
    try {
      const response = await api.post('/admin/pagos-personal', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createMultiplePagos(data) {
    try {
      const response = await api.post('/admin/pagos-personal/multiples', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePagoPersonal(id, data) {
    try {
      const response = await api.put(`/admin/pagos-personal/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deletePagoPersonal(id) {
    try {
      const response = await api.delete(`/admin/pagos-personal/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPagosEstadisticas(params = {}) {
    try {
      const response = await api.get('/admin/pagos-personal/estadisticas', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AdminService();


