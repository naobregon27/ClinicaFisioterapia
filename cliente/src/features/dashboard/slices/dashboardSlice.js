/**
 * Slice de Dashboard
 * Maneja el estado de las métricas del dashboard
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../../services/dashboardService';

// =============== ASYNC THUNKS ===============

// Obtener métricas del dashboard
export const fetchDashboardMetricas = createAsyncThunk(
  'dashboard/fetchMetricas',
  async (fecha = null, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getMetricas(fecha);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// =============== SLICE ===============

const initialState = {
  metricas: {
    sesionesHoy: 0,
    pacientesActivosHoy: 0,
    ingresosHoy: 0,
    ingresosMes: 0,
    pacientesNuevosMes: 0,
    sesionesRealizadasMes: 0,
    sesionesCanceladasMes: 0,
    ingresosSemana: 0,
    pagosPendientes: 0,
    notificacionesNoLeidas: 0,
  },
  proximasSesiones: [],
  ingresosUltimos7Dias: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetricas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetricas.fulfilled, (state, action) => {
        state.loading = false;
        state.metricas = action.payload.data?.metricas || initialState.metricas;
        state.proximasSesiones = action.payload.data?.proximasSesiones || [];
        state.ingresosUltimos7Dias = action.payload.data?.ingresosUltimos7Dias || [];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardMetricas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar métricas del dashboard';
      });
  },
});

// =============== ACTIONS ===============
export const { clearError, clearDashboardData } = dashboardSlice.actions;

// =============== SELECTORS ===============
export const selectMetricas = (state) => state.dashboard.metricas;
export const selectProximasSesiones = (state) => state.dashboard.proximasSesiones;
export const selectIngresosUltimos7Dias = (state) => state.dashboard.ingresosUltimos7Dias;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectLastUpdated = (state) => state.dashboard.lastUpdated;

export default dashboardSlice.reducer;
