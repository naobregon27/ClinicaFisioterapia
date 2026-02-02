/**
 * Slice de Exportación
 * Maneja el estado de las exportaciones de datos
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import exportacionService from '../../../services/exportacionService';

// =============== ASYNC THUNKS ===============

// Obtener datos para exportar planilla diaria
export const fetchPlanillaDiaria = createAsyncThunk(
  'exportacion/fetchPlanillaDiaria',
  async (fecha, { rejectWithValue }) => {
    try {
      const response = await exportacionService.getPlanillaDiaria(fecha);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Obtener datos para exportar ficha de paciente
export const fetchFichaPaciente = createAsyncThunk(
  'exportacion/fetchFichaPaciente',
  async (pacienteId, { rejectWithValue }) => {
    try {
      const response = await exportacionService.getFichaPaciente(pacienteId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// =============== SLICE ===============

const initialState = {
  planillaDiaria: null,
  fichaPaciente: null,
  loading: false,
  error: null,
};

const exportacionSlice = createSlice({
  name: 'exportacion',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExportacionData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Planilla Diaria
      .addCase(fetchPlanillaDiaria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanillaDiaria.fulfilled, (state, action) => {
        state.loading = false;
        state.planillaDiaria = action.payload.data;
      })
      .addCase(fetchPlanillaDiaria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al obtener datos de planilla diaria';
      })

      // Fetch Ficha Paciente
      .addCase(fetchFichaPaciente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFichaPaciente.fulfilled, (state, action) => {
        state.loading = false;
        state.fichaPaciente = action.payload.data;
      })
      .addCase(fetchFichaPaciente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al obtener datos de ficha de paciente';
      });
  },
});

// =============== ACTIONS ===============
export const { clearError, clearExportacionData } = exportacionSlice.actions;

// =============== SELECTORS ===============
export const selectPlanillaDiaria = (state) => state.exportacion.planillaDiaria;
export const selectFichaPaciente = (state) => state.exportacion.fichaPaciente;
export const selectExportacionLoading = (state) => state.exportacion.loading;
export const selectExportacionError = (state) => state.exportacion.error;

export default exportacionSlice.reducer;
