/**
 * Slice de Búsqueda Global
 * Maneja el estado de la búsqueda global en la aplicación
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import busquedaService from '../../../services/busquedaService';

// =============== ASYNC THUNKS ===============

// Realizar búsqueda global
export const buscarGlobal = createAsyncThunk(
  'busqueda/buscarGlobal',
  async ({ q, options = {} }, { rejectWithValue }) => {
    try {
      const response = await busquedaService.buscarGlobal(q, options);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// =============== SLICE ===============

const initialState = {
  resultados: {
    pacientes: [],
    sesiones: [],
    usuarios: [],
  },
  total: 0,
  termino: '',
  loading: false,
  error: null,
  searchOpen: false,
};

const busquedaSlice = createSlice({
  name: 'busqueda',
  initialState,
  reducers: {
    clearResultados: (state) => {
      state.resultados = initialState.resultados;
      state.total = 0;
      state.termino = '';
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    closeSearch: (state) => {
      state.searchOpen = false;
    },
    openSearch: (state) => {
      state.searchOpen = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(buscarGlobal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buscarGlobal.fulfilled, (state, action) => {
        state.loading = false;
        state.resultados = {
          pacientes: action.payload.data.pacientes || [],
          sesiones: action.payload.data.sesiones || [],
          usuarios: action.payload.data.usuarios || [],
        };
        state.total = action.payload.data.total;
        state.termino = action.payload.data.termino;
      })
      .addCase(buscarGlobal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al realizar búsqueda';
      });
  },
});

// =============== ACTIONS ===============
export const { clearResultados, clearError, toggleSearch, closeSearch, openSearch } = busquedaSlice.actions;

// =============== SELECTORS ===============
export const selectResultados = (state) => state.busqueda.resultados;
export const selectTotal = (state) => state.busqueda.total;
export const selectTermino = (state) => state.busqueda.termino;
export const selectBusquedaLoading = (state) => state.busqueda.loading;
export const selectBusquedaError = (state) => state.busqueda.error;
export const selectSearchOpen = (state) => state.busqueda.searchOpen;

export default busquedaSlice.reducer;
