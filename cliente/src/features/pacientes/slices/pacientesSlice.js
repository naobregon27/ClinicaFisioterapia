/**
 * Redux Slice para Pacientes
 * Maneja el estado global de pacientes
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pacienteService from '../../../services/pacienteService';

// Estado inicial
const initialState = {
  pacientes: [],
  pacienteActual: null,
  estadisticas: null,
  loading: false,
  error: null,
  successMessage: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filtros: {
    busqueda: '',
    estado: '',
    obraSocial: '',
    sortBy: 'apellido',
  },
};

// ========== THUNKS ASÍNCRONOS ==========

/**
 * Obtener pacientes con filtros
 */
export const fetchPacientes = createAsyncThunk(
  'pacientes/fetchPacientes',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await pacienteService.obtenerPacientes(filtros);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Obtener paciente por ID
 */
export const fetchPacienteById = createAsyncThunk(
  'pacientes/fetchPacienteById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await pacienteService.obtenerPacientePorId(id);
      return response.data.paciente;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Crear paciente
 */
export const createPaciente = createAsyncThunk(
  'pacientes/createPaciente',
  async (dataPaciente, { rejectWithValue }) => {
    try {
      const response = await pacienteService.crearPaciente(dataPaciente);
      return response.data.paciente;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Actualizar paciente
 */
export const updatePaciente = createAsyncThunk(
  'pacientes/updatePaciente',
  async ({ id, datos }, { rejectWithValue }) => {
    try {
      const response = await pacienteService.actualizarPaciente(id, datos);
      return response.data.paciente;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Eliminar paciente
 */
export const deletePaciente = createAsyncThunk(
  'pacientes/deletePaciente',
  async (id, { rejectWithValue }) => {
    try {
      await pacienteService.eliminarPaciente(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Dar alta médica
 */
export const darAltaMedica = createAsyncThunk(
  'pacientes/darAltaMedica',
  async ({ id, datosAlta }, { rejectWithValue }) => {
    try {
      const response = await pacienteService.darAltaMedica(id, datosAlta);
      return response.data.paciente;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Cambiar estado del paciente (activar / inactivar)
 */
export const cambiarEstadoPaciente = createAsyncThunk(
  'pacientes/cambiarEstado',
  async ({ id, estado, motivo }, { rejectWithValue }) => {
    try {
      const response = await pacienteService.actualizarEstadoPaciente(id, { estado, motivo });
      return response.data?.paciente || response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Obtener estadísticas de pacientes
 */
export const fetchEstadisticas = createAsyncThunk(
  'pacientes/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pacienteService.obtenerEstadisticas();
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ========== SLICE ==========

const pacientesSlice = createSlice({
  name: 'pacientes',
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
    // Limpiar paciente actual
    clearPacienteActual: (state) => {
      state.pacienteActual = null;
    },
  },
  extraReducers: (builder) => {
    // ========== FETCH PACIENTES ==========
    builder
      .addCase(fetchPacientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPacientes.fulfilled, (state, action) => {
        state.loading = false;
        state.pacientes = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchPacientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar pacientes';
      });

    // ========== FETCH PACIENTE BY ID ==========
    builder
      .addCase(fetchPacienteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPacienteById.fulfilled, (state, action) => {
        state.loading = false;
        state.pacienteActual = action.payload;
      })
      .addCase(fetchPacienteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar paciente';
      });

    // ========== CREATE PACIENTE ==========
    builder
      .addCase(createPaciente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaciente.fulfilled, (state, action) => {
        state.loading = false;
        // Agregar el nuevo paciente al inicio de la lista
        state.pacientes.unshift(action.payload);
        // Actualizar el total de pacientes en la paginación
        if (state.pagination) {
          state.pagination.total = (state.pagination.total || 0) + 1;
        }
        state.successMessage = 'Paciente creado exitosamente';
      })
      .addCase(createPaciente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al crear paciente';
      });

    // ========== UPDATE PACIENTE ==========
    builder
      .addCase(updatePaciente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaciente.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pacientes.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pacientes[index] = action.payload;
        }
        if (state.pacienteActual?.id === action.payload.id) {
          state.pacienteActual = action.payload;
        }
        state.successMessage = 'Paciente actualizado exitosamente';
      })
      .addCase(updatePaciente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al actualizar paciente';
      });

    // ========== DELETE PACIENTE ==========
    builder
      .addCase(deletePaciente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaciente.fulfilled, (state, action) => {
        state.loading = false;
        state.pacientes = state.pacientes.filter(p => p.id !== action.payload);
        state.successMessage = 'Paciente eliminado exitosamente';
      })
      .addCase(deletePaciente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al eliminar paciente';
      });

    // ========== DAR ALTA MÉDICA ==========
    builder
      .addCase(darAltaMedica.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(darAltaMedica.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pacientes.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pacientes[index] = action.payload;
        }
        if (state.pacienteActual?.id === action.payload.id) {
          state.pacienteActual = action.payload;
        }
        state.successMessage = 'Alta médica registrada exitosamente';
      })
      .addCase(darAltaMedica.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al dar alta médica';
      });

    // ========== CAMBIAR ESTADO PACIENTE ==========
    builder
      .addCase(cambiarEstadoPaciente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cambiarEstadoPaciente.fulfilled, (state, action) => {
        state.loading = false;
        const pacienteActualizado = action.payload?.paciente || action.payload;
        if (pacienteActualizado) {
          const id = pacienteActualizado.id || pacienteActualizado._id;
          const index = state.pacientes.findIndex(p => (p.id || p._id) === id);
          if (index !== -1) {
            state.pacientes[index] = { ...state.pacientes[index], ...pacienteActualizado };
          }
          if (state.pacienteActual && (state.pacienteActual.id === id || state.pacienteActual._id === id)) {
            state.pacienteActual = { ...state.pacienteActual, ...pacienteActualizado };
          }
        }
        state.successMessage = 'Estado del paciente actualizado exitosamente';
      })
      .addCase(cambiarEstadoPaciente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al actualizar estado del paciente';
      });

    // ========== FETCH ESTADÍSTICAS ==========
    builder
      .addCase(fetchEstadisticas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.loading = false;
        state.estadisticas = action.payload;
      })
      .addCase(fetchEstadisticas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cargar estadísticas';
      });
  },
});

// Exportar acciones
export const { clearError, clearSuccessMessage, setFiltros, clearPacienteActual } = pacientesSlice.actions;

// Selectores
export const selectPacientes = (state) => state.pacientes.pacientes;
export const selectPacienteActual = (state) => state.pacientes.pacienteActual;
export const selectPacientesLoading = (state) => state.pacientes.loading;
export const selectPacientesError = (state) => state.pacientes.error;
export const selectPacientesPagination = (state) => state.pacientes.pagination;
export const selectPacientesFiltros = (state) => state.pacientes.filtros;
export const selectEstadisticas = (state) => state.pacientes.estadisticas;

// Exportar reducer
export default pacientesSlice.reducer;


