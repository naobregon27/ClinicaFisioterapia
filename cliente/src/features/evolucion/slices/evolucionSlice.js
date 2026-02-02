/**
 * Slice de Evolución
 * Maneja el estado de los datos de evolución de pacientes
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import evolucionService from '../../../services/evolucionService';

// =============== ASYNC THUNKS ===============

// Obtener evolución de un paciente
export const fetchEvolucionPaciente = createAsyncThunk(
  'evolucion/fetchPaciente',
  async ({ pacienteId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await evolucionService.getEvolucionPaciente(pacienteId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// =============== SLICE ===============

const initialState = {
  paciente: null,
  sesiones: [],
  graficos: {
    dolor: [],
    movilidad: [],
    estadoGeneral: [],
  },
  estadisticas: null,
  loading: false,
  error: null,
  filters: {
    fechaInicio: null,
    fechaFin: null,
  },
};

const evolucionSlice = createSlice({
  name: 'evolucion',
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
    clearEvolucionData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvolucionPaciente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvolucionPaciente.fulfilled, (state, action) => {
        state.loading = false;
        state.paciente = action.payload.data?.paciente || null;
        state.sesiones = action.payload.data?.sesiones || [];
        state.graficos = action.payload.data?.graficos || initialState.graficos;
        state.estadisticas = action.payload.data?.estadisticas || null;
      })
      .addCase(fetchEvolucionPaciente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar datos de evolución';
      });
  },
});

// =============== ACTIONS ===============
export const { setFilters, clearFilters, clearError, clearEvolucionData } = evolucionSlice.actions;

// =============== SELECTORS ===============
export const selectEvolucionPaciente = (state) => state.evolucion.paciente;
export const selectEvolucionSesiones = (state) => state.evolucion.sesiones;
export const selectEvolucionGraficos = (state) => state.evolucion.graficos;
export const selectEvolucionEstadisticas = (state) => state.evolucion.estadisticas;
export const selectEvolucionLoading = (state) => state.evolucion.loading;
export const selectEvolucionError = (state) => state.evolucion.error;
export const selectEvolucionFilters = (state) => state.evolucion.filters;

export default evolucionSlice.reducer;
