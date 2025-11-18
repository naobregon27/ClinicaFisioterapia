/**
 * Redux Slice para Autenticación
 * Maneja el estado global de autenticación y usuario
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../../services/authService';

// Estado inicial
const initialState = {
  user: authService.getCurrentUserFromStorage(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
  successMessage: null,
};

// ========== THUNKS ASÍNCRONOS ==========

/**
 * Registrar usuario
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Verificar email
 */
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(email, code);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Login
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      return response.data;
    } catch (error) {
      // El error ya viene formateado del interceptor
      // Solo extraer el mensaje para evitar objetos no serializables
      return rejectWithValue({
        message: error?.message || 'Error al iniciar sesión',
        type: error?.type || 'error',
      });
    }
  }
);

/**
 * Logout
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Obtener usuario actual
 */
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data.usuario;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Actualizar perfil
 */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response.data.usuario;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Cambiar contraseña
 */
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ========== SLICE ==========

const authSlice = createSlice({
  name: 'auth',
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
    // Actualizar usuario en estado (útil para actualizaciones locales)
    updateUserState: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ========== REGISTER ==========
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Usuario registrado. Verifica tu email.';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al registrar usuario';
      });

    // ========== VERIFY EMAIL ==========
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.usuario;
        state.successMessage = 'Email verificado exitosamente';
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al verificar email';
      });

    // ========== LOGIN ==========
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.usuario;
        state.successMessage = 'Inicio de sesión exitoso';
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || 'Credenciales inválidas';
      });

    // ========== LOGOUT ==========
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.successMessage = 'Sesión cerrada exitosamente';
      })
      .addCase(logout.rejected, (state) => {
        // Logout local aunque falle el servidor
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // ========== GET CURRENT USER ==========
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
      });

    // ========== UPDATE PROFILE ==========
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = 'Perfil actualizado exitosamente';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al actualizar perfil';
      });

    // ========== CHANGE PASSWORD ==========
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Contraseña actualizada exitosamente';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error al cambiar contraseña';
      });
  },
});

// Exportar acciones
export const { clearError, clearSuccessMessage, updateUserState } = authSlice.actions;

// Selectores
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// Exportar reducer
export default authSlice.reducer;


