/**
 * Slice de Calendario
 * Maneja el estado del calendario de sesiones
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import calendarioService from '../../../services/calendarioService';

// =============== ASYNC THUNKS ===============

// Obtener sesiones para el calendario
export const fetchSesionesCalendario = createAsyncThunk(
  'calendario/fetchSesiones',
  async (params, { rejectWithValue }) => {
    try {
      const response = await calendarioService.getSesiones(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Obtener sesiones agrupadas
export const fetchSesionesAgrupadas = createAsyncThunk(
  'calendario/fetchSesionesAgrupadas',
  async (params, { rejectWithValue }) => {
    try {
      const response = await calendarioService.getSesionesAgrupadas(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// =============== SLICE ===============

const initialState = {
  sesiones: [],
  sesionesPorDia: [],
  total: 0,
  loading: false,
  error: null,
  filters: {
    profesionalId: null,
    pacienteId: null,
    estado: null,
  },
  currentView: 'month', // month, week, day
};

const calendarioSlice = createSlice({
  name: 'calendario',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sesiones
      .addCase(fetchSesionesCalendario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSesionesCalendario.fulfilled, (state, action) => {
        state.loading = false;
        state.sesiones = action.payload.data?.sesiones || [];
        state.total = action.payload.data?.total || 0;
      })
      .addCase(fetchSesionesCalendario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar sesiones del calendario';
      })

      // Fetch Sesiones Agrupadas
      .addCase(fetchSesionesAgrupadas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSesionesAgrupadas.fulfilled, (state, action) => {
        state.loading = false;
        state.sesionesPorDia = action.payload.data?.sesionesPorDia || [];
        state.total = action.payload.data?.total || 0;
      })
      .addCase(fetchSesionesAgrupadas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar sesiones agrupadas';
      });
  },
});

// =============== ACTIONS ===============
export const { setFilters, clearFilters, clearError, setCurrentView } = calendarioSlice.actions;

// =============== SELECTORS ===============
export const selectSesionesCalendario = (state) => state.calendario.sesiones;
export const selectSesionesPorDia = (state) => state.calendario.sesionesPorDia;
export const selectCalendarioTotal = (state) => state.calendario.total;
export const selectCalendarioLoading = (state) => state.calendario.loading;
export const selectCalendarioError = (state) => state.calendario.error;
export const selectCalendarioFilters = (state) => state.calendario.filters;
export const selectCurrentView = (state) => state.calendario.currentView;

export default calendarioSlice.reducer;
