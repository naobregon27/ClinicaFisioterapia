/**
 * Redux Store
 * Configuración del store principal con todos los reducers
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slices/authSlice';
import pacientesReducer from '../features/pacientes/slices/pacientesSlice';
import sesionesReducer from '../features/sesiones/slices/sesionesSlice';
import uiReducer from '../features/ui/slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pacientes: pacientesReducer,
    sesiones: sesionesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas rutas en el serializableCheck
        ignoredActions: ['ui/openModal'],
        ignoredPaths: ['ui.modalData'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export default store;


