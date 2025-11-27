/**
 * Redux Slice - Auditoría del sistema
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../../services/adminService';

const initialState = {
  acciones: [],
  estadisticas: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filtros: {
    page: 1,
    limit: 20,
    usuario: '',
    accion: '',
    recurso: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  },
};

export const fetchAuditoriaAcciones = createAsyncThunk(
  'adminAuditoria/fetchAcciones',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAuditoria(params);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al cargar auditoría');
    }
  }
);

export const fetchAuditoriaEstadisticas = createAsyncThunk(
  'adminAuditoria/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAuditoriaEstadisticas();
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al cargar estadísticas de auditoría');
    }
  }
);

const adminAuditoriaSlice = createSlice({
  name: 'adminAuditoria',
  initialState,
  reducers: {
    setAuditoriaFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload };
    },
    clearAuditoriaError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditoriaAcciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditoriaAcciones.fulfilled, (state, action) => {
        state.loading = false;
        state.acciones = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchAuditoriaAcciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAuditoriaEstadisticas.fulfilled, (state, action) => {
        state.estadisticas = action.payload;
      })
      .addCase(fetchAuditoriaEstadisticas.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setAuditoriaFiltros, clearAuditoriaError } = adminAuditoriaSlice.actions;
export const selectAdminAuditoriaState = (state) => state.adminAuditoria;

export default adminAuditoriaSlice.reducer;


