/**
 * Redux Slice para Sesiones
 * Maneja el estado global de sesiones de fisioterapia
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sesionService from '../../../services/sesionService';

// Estado inicial
const initialState = {
  sesiones: [],
  sesionActual: null,
  planillaDiaria: null,
  historialPaciente: null,
  pagosPendientes: [],
  loading: false,
  error: null,
  successMessage: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filtros: {
    fecha: null,
    pacienteId: null,
    estado: '',
    pagado: null,
  },
};

// ========== THUNKS ASÍNCRONOS ==========

/**
 * Obtener sesiones con filtros
 */
export const fetchSesiones = createAsyncThunk(
  'sesiones/fetchSesiones',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await sesionService.obtenerSesiones(filtros);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Obtener planilla diaria
 */
export const fetchPlanillaDiaria = createAsyncThunk(
  'sesiones/fetchPlanillaDiaria',
  async (fecha, { rejectWithValue }) => {
    try {
      const response = await sesionService.obtenerPlanillaDiaria(fecha);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Obtener historial de paciente
 */
export const fetchHistorialPaciente = createAsyncThunk(
  'sesiones/fetchHistorialPaciente',
  async ({ pacienteId, page, limit }, { rejectWithValue }) => {
    try {
      const response = await sesionService.obtenerHistorialPaciente(pacienteId, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Registrar nueva sesión
 */
export const createSesion = createAsyncThunk(
  'sesiones/createSesion',
  async (dataSesion, { rejectWithValue }) => {
    try {
      const response = await sesionService.registrarSesion(dataSesion);
      return response.data.sesion;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Actualizar sesión
 */
export const updateSesion = createAsyncThunk(
  'sesiones/updateSesion',
  async ({ id, datos }, { rejectWithValue }) => {
    try {
      const response = await sesionService.actualizarSesion(id, datos);
      return response.data.sesion;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Registrar pago
 */
export const registrarPago = createAsyncThunk(
  'sesiones/registrarPago',
  async ({ id, datosPago }, { rejectWithValue }) => {
    try {
      const response = await sesionService.registrarPago(id, datosPago);
      return response.data.sesion;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Cancelar sesión
 */
export const cancelarSesion = createAsyncThunk(
  'sesiones/cancelarSesion',
  async ({ id, motivo }, { rejectWithValue }) => {
    try {
      const response = await sesionService.cancelarSesion(id, motivo);
      return response.data.sesion;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Obtener pagos pendientes
 */
export const fetchPagosPendientes = createAsyncThunk(
  'sesiones/fetchPagosPendientes',
  async ({ limit, pacienteId }, { rejectWithValue }) => {
    try {
      const response = await sesionService.obtenerPagosPendientes(limit, pacienteId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ========== SLICE ==========

const sesionesSlice = createSlice({
  name: 'sesiones',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    // Limpiar mensajes de éxito
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    // Actualizar filtros
    setFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload };
    },
    // Limpiar sesión actual
    clearSesionActual: (state) => {
      state.sesionActual = null;
    },
    // Limpiar planilla diaria
    clearPlanillaDiaria: (state) => {
      state.planillaDiaria = null;
    },
  },
  extraReducers: (builder) => {
    // ========== FETCH SESIONES ==========
    builder
      .addCase(fetchSesiones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSesiones.fulfilled, (state, action) => {
        state.loading = false;
        state.sesiones = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchSesiones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar sesiones';
      });

    // ========== FETCH PLANILLA DIARIA ==========
    builder
      .addCase(fetchPlanillaDiaria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanillaDiaria.fulfilled, (state, action) => {
        state.loading = false;
        state.planillaDiaria = action.payload;
      })
      .addCase(fetchPlanillaDiaria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar planilla';
      });

    // ========== FETCH HISTORIAL PACIENTE ==========
    builder
      .addCase(fetchHistorialPaciente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistorialPaciente.fulfilled, (state, action) => {
        state.loading = false;
        state.historialPaciente = action.payload;
      })
      .addCase(fetchHistorialPaciente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar historial';
      });

    // ========== CREATE SESION ==========
    builder
      .addCase(createSesion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSesion.fulfilled, (state, action) => {
        state.loading = false;
        state.sesiones.unshift(action.payload);
        state.successMessage = 'Sesión registrada exitosamente';
      })
      .addCase(createSesion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al registrar sesión';
      });

    // ========== UPDATE SESION ==========
    builder
      .addCase(updateSesion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSesion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sesiones.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sesiones[index] = action.payload;
        }
        state.successMessage = 'Sesión actualizada exitosamente';
      })
      .addCase(updateSesion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al actualizar sesión';
      });

    // ========== REGISTRAR PAGO ==========
    builder
      .addCase(registrarPago.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registrarPago.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sesiones.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sesiones[index] = action.payload;
        }
        state.successMessage = 'Pago registrado exitosamente';
      })
      .addCase(registrarPago.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al registrar pago';
      });

    // ========== CANCELAR SESION ==========
    builder
      .addCase(cancelarSesion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelarSesion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sesiones.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sesiones[index] = action.payload;
        }
        state.successMessage = 'Sesión cancelada exitosamente';
      })
      .addCase(cancelarSesion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cancelar sesión';
      });

    // ========== FETCH PAGOS PENDIENTES ==========
    builder
      .addCase(fetchPagosPendientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPagosPendientes.fulfilled, (state, action) => {
        state.loading = false;
        state.pagosPendientes = action.payload;
      })
      .addCase(fetchPagosPendientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar pagos pendientes';
      });
  },
});

// Exportar acciones
export const { 
  clearError, 
  clearSuccessMessage, 
  setFiltros, 
  clearSesionActual,
  clearPlanillaDiaria 
} = sesionesSlice.actions;

// Selectores
export const selectSesiones = (state) => state.sesiones.sesiones;
export const selectSesionActual = (state) => state.sesiones.sesionActual;
export const selectPlanillaDiaria = (state) => state.sesiones.planillaDiaria;
export const selectHistorialPaciente = (state) => state.sesiones.historialPaciente;
export const selectPagosPendientes = (state) => state.sesiones.pagosPendientes;
export const selectSesionesLoading = (state) => state.sesiones.loading;
export const selectSesionesError = (state) => state.sesiones.error;
export const selectSesionesPagination = (state) => state.sesiones.pagination;

// Exportar reducer
export default sesionesSlice.reducer;


