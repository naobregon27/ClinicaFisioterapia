/**
 * Slice de Notificaciones
 * Maneja el estado de las notificaciones en la aplicación
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificacionesService from '../../../services/notificacionesService';

// =============== ASYNC THUNKS ===============

// Obtener notificaciones con filtros y paginación
export const fetchNotificaciones = createAsyncThunk(
  'notificaciones/fetchNotificaciones',
  async (params, { rejectWithValue }) => {
    try {
      const response = await notificacionesService.getNotificaciones(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Obtener notificaciones no leídas
export const fetchNotificacionesNoLeidas = createAsyncThunk(
  'notificaciones/fetchNoLeidas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificacionesService.getNoLeidas();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Marcar notificación como leída
export const marcarNotificacionLeida = createAsyncThunk(
  'notificaciones/marcarLeida',
  async (id, { rejectWithValue }) => {
    try {
      await notificacionesService.marcarComoLeida(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Marcar todas como leídas
export const marcarTodasLeidas = createAsyncThunk(
  'notificaciones/marcarTodasLeidas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificacionesService.marcarTodasComoLeidas();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Eliminar notificación
export const eliminarNotificacion = createAsyncThunk(
  'notificaciones/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await notificacionesService.eliminarNotificacion(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// =============== SLICE ===============

const initialState = {
  notificaciones: [],
  noLeidas: [],
  cantidadNoLeidas: 0,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  loading: false,
  error: null,
  filters: {
    leida: null,
    tipo: null,
    prioridad: null,
  },
};

const notificacionesSlice = createSlice({
  name: 'notificaciones',
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
    decrementNoLeidas: (state) => {
      if (state.cantidadNoLeidas > 0) {
        state.cantidadNoLeidas -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notificaciones
      .addCase(fetchNotificaciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.notificaciones = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotificaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar notificaciones';
      })

      // Fetch No Leídas
      .addCase(fetchNotificacionesNoLeidas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificacionesNoLeidas.fulfilled, (state, action) => {
        state.loading = false;
        state.noLeidas = action.payload.data.notificaciones;
        state.cantidadNoLeidas = action.payload.data.cantidadNoLeidas;
      })
      .addCase(fetchNotificacionesNoLeidas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar notificaciones';
      })

      // Marcar como leída
      .addCase(marcarNotificacionLeida.fulfilled, (state, action) => {
        const id = action.payload;
        // Actualizar en notificaciones
        const notif = state.notificaciones.find((n) => n._id === id);
        if (notif) {
          notif.leida = true;
        }
        // Actualizar en noLeidas
        state.noLeidas = state.noLeidas.filter((n) => n._id !== id);
        if (state.cantidadNoLeidas > 0) {
          state.cantidadNoLeidas -= 1;
        }
      })

      // Marcar todas como leídas
      .addCase(marcarTodasLeidas.fulfilled, (state) => {
        state.notificaciones.forEach((n) => {
          n.leida = true;
        });
        state.noLeidas = [];
        state.cantidadNoLeidas = 0;
      })

      // Eliminar notificación
      .addCase(eliminarNotificacion.fulfilled, (state, action) => {
        const id = action.payload;
        state.notificaciones = state.notificaciones.filter((n) => n._id !== id);
        state.noLeidas = state.noLeidas.filter((n) => n._id !== id);
        state.pagination.total -= 1;
      });
  },
});

// =============== ACTIONS ===============
export const { setFilters, clearFilters, clearError, decrementNoLeidas } = notificacionesSlice.actions;

// =============== SELECTORS ===============
export const selectNotificaciones = (state) => state.notificaciones.notificaciones;
export const selectNoLeidas = (state) => state.notificaciones.noLeidas;
export const selectCantidadNoLeidas = (state) => state.notificaciones.cantidadNoLeidas;
export const selectPagination = (state) => state.notificaciones.pagination;
export const selectLoading = (state) => state.notificaciones.loading;
export const selectError = (state) => state.notificaciones.error;
export const selectFilters = (state) => state.notificaciones.filters;

export default notificacionesSlice.reducer;
