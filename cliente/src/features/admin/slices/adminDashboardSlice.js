/**
 * Redux Slice - Dashboard del Administrador
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../../services/adminService';

const initialState = {
  estadisticas: null,
  estadisticasLoading: false,
  estadisticasError: null,
  ultimasAcciones: [],
  accionesPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  accionesLoading: false,
  accionesError: null,
};

export const fetchAdminEstadisticas = createAsyncThunk(
  'adminDashboard/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getEstadisticas();
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al cargar estadísticas');
    }
  }
);

export const fetchAdminUltimasAcciones = createAsyncThunk(
  'adminDashboard/fetchUltimasAcciones',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAuditoria({
        page: params.page || 1,
        limit: params.limit || 10,
        sort: params.sort || '-createdAt',
      });
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al cargar auditoría');
    }
  }
);

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminEstadisticas.pending, (state) => {
        state.estadisticasLoading = true;
        state.estadisticasError = null;
      })
      .addCase(fetchAdminEstadisticas.fulfilled, (state, action) => {
        state.estadisticasLoading = false;
        state.estadisticas = action.payload;
      })
      .addCase(fetchAdminEstadisticas.rejected, (state, action) => {
        state.estadisticasLoading = false;
        state.estadisticasError = action.payload;
      })
      .addCase(fetchAdminUltimasAcciones.pending, (state) => {
        state.accionesLoading = true;
        state.accionesError = null;
      })
      .addCase(fetchAdminUltimasAcciones.fulfilled, (state, action) => {
        state.accionesLoading = false;
        state.ultimasAcciones = action.payload.data || [];
        state.accionesPagination = action.payload.pagination || state.accionesPagination;
      })
      .addCase(fetchAdminUltimasAcciones.rejected, (state, action) => {
        state.accionesLoading = false;
        state.accionesError = action.payload;
      });
  },
});

export const selectAdminEstadisticas = (state) => state.adminDashboard.estadisticas;
export const selectAdminEstadisticasLoading = (state) => state.adminDashboard.estadisticasLoading;
export const selectAdminUltimasAcciones = (state) => state.adminDashboard.ultimasAcciones;
export const selectAdminAccionesLoading = (state) => state.adminDashboard.accionesLoading;

export default adminDashboardSlice.reducer;



