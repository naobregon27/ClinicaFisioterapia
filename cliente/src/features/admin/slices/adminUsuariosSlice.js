/**
 * Redux Slice - Gestión de Usuarios para Administrador
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../../services/adminService';

const getUserId = (usuario) => usuario?.id || usuario?._id || usuario?._id?.toString();

const defaultPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const initialState = {
  usuarios: [],
  usuarioDetalle: null,
  loading: false,
  error: null,
  successMessage: null,
  pagination: defaultPagination,
  filtros: {
    page: 1,
    limit: 10,
    busqueda: '',
    rol: '',
    estado: '',
    sort: '-createdAt',
  },
};

export const fetchAdminUsuarios = createAsyncThunk(
  'adminUsuarios/fetchUsuarios',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getUsuarios(params);
      return response;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al cargar usuarios');
    }
  }
);

export const fetchAdminUsuarioById = createAsyncThunk(
  'adminUsuarios/fetchUsuarioById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.getUsuarioById(id);
      return response.data?.usuario || response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al obtener usuario');
    }
  }
);

export const createAdminUsuario = createAsyncThunk(
  'adminUsuarios/createUsuario',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminService.createUsuario(data);
      return response.data?.usuario || response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al crear usuario');
    }
  }
);

export const updateAdminUsuario = createAsyncThunk(
  'adminUsuarios/updateUsuario',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateUsuario(id, data);
      return response.data?.usuario || response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al actualizar usuario');
    }
  }
);

export const changeAdminUsuarioEstado = createAsyncThunk(
  'adminUsuarios/changeEstado',
  async ({ id, estado }, { rejectWithValue }) => {
    try {
      const response = await adminService.changeUsuarioEstado(id, estado);
      return response.data?.usuario || response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al cambiar estado');
    }
  }
);

export const changeAdminUsuarioRol = createAsyncThunk(
  'adminUsuarios/changeRol',
  async ({ id, rol }, { rejectWithValue }) => {
    try {
      const response = await adminService.changeUsuarioRol(id, rol);
      return response.data?.usuario || response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al cambiar rol');
    }
  }
);

export const resetAdminUsuarioPassword = createAsyncThunk(
  'adminUsuarios/resetPassword',
  async ({ id, password }, { rejectWithValue }) => {
    try {
      const response = await adminService.changeUsuarioPassword(id, { password });
      return response.message || response.data?.message || 'Contraseña actualizada';
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al actualizar contraseña');
    }
  }
);

export const desbloquearAdminUsuario = createAsyncThunk(
  'adminUsuarios/desbloquear',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminService.desbloquearUsuario(id);
      return response.data?.usuario || response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Error al desbloquear usuario');
    }
  }
);

const adminUsuariosSlice = createSlice({
  name: 'adminUsuarios',
  initialState,
  reducers: {
    setAdminUsuariosFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload };
    },
    clearAdminUsuariosMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsuarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsuarios.fulfilled, (state, action) => {
        state.loading = false;
        state.usuarios = action.payload.data || [];
        state.pagination = action.payload.pagination || defaultPagination;
      })
      .addCase(fetchAdminUsuarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminUsuarioById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsuarioById.fulfilled, (state, action) => {
        state.loading = false;
        state.usuarioDetalle = action.payload;
      })
      .addCase(fetchAdminUsuarioById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAdminUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminUsuario.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Usuario creado correctamente';
        state.usuarios = [action.payload, ...state.usuarios];
      })
      .addCase(createAdminUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminUsuario.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminUsuario.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Usuario actualizado correctamente';
        const updatedId = getUserId(action.payload);
        state.usuarios = state.usuarios.map((user) => (getUserId(user) === updatedId ? action.payload : user));
        if (state.usuarioDetalle && getUserId(state.usuarioDetalle) === updatedId) {
          state.usuarioDetalle = action.payload;
        }
      })
      .addCase(updateAdminUsuario.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changeAdminUsuarioEstado.fulfilled, (state, action) => {
        state.successMessage = 'Estado actualizado correctamente';
        const updatedId = getUserId(action.payload);
        state.usuarios = state.usuarios.map((user) => (getUserId(user) === updatedId ? { ...user, ...action.payload } : user));
      })
      .addCase(changeAdminUsuarioEstado.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(changeAdminUsuarioRol.fulfilled, (state, action) => {
        state.successMessage = 'Rol actualizado correctamente';
        const updatedId = getUserId(action.payload);
        state.usuarios = state.usuarios.map((user) => (getUserId(user) === updatedId ? { ...user, ...action.payload } : user));
      })
      .addCase(changeAdminUsuarioRol.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(resetAdminUsuarioPassword.fulfilled, (state) => {
        state.successMessage = 'Contraseña restablecida';
      })
      .addCase(resetAdminUsuarioPassword.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(desbloquearAdminUsuario.fulfilled, (state, action) => {
        state.successMessage = 'Usuario desbloqueado';
        const updatedId = getUserId(action.payload);
        state.usuarios = state.usuarios.map((user) => (getUserId(user) === updatedId ? { ...user, ...action.payload } : user));
      })
      .addCase(desbloquearAdminUsuario.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setAdminUsuariosFiltros, clearAdminUsuariosMessages } = adminUsuariosSlice.actions;

export const selectAdminUsuariosState = (state) => state.adminUsuarios;

export default adminUsuariosSlice.reducer;


