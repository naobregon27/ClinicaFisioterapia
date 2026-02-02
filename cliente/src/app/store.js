/**
 * Redux Store
 * Configuración del store principal con todos los reducers
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slices/authSlice';
import pacientesReducer from '../features/pacientes/slices/pacientesSlice';
import sesionesReducer from '../features/sesiones/slices/sesionesSlice';
import uiReducer from '../features/ui/slices/uiSlice';
import adminDashboardReducer from '../features/admin/slices/adminDashboardSlice';
import adminUsuariosReducer from '../features/admin/slices/adminUsuariosSlice';
import adminPagosReducer from '../features/admin/slices/adminPagosSlice';
import adminAuditoriaReducer from '../features/admin/slices/adminAuditoriaSlice';
// Nuevas funcionalidades
import notificacionesReducer from '../features/notificaciones/slices/notificacionesSlice';
import dashboardReducer from '../features/dashboard/slices/dashboardSlice';
import busquedaReducer from '../features/busqueda/slices/busquedaSlice';
import calendarioReducer from '../features/calendario/slices/calendarioSlice';
import evolucionReducer from '../features/evolucion/slices/evolucionSlice';
import exportacionReducer from '../features/exportacion/slices/exportacionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pacientes: pacientesReducer,
    sesiones: sesionesReducer,
    ui: uiReducer,
    adminDashboard: adminDashboardReducer,
    adminUsuarios: adminUsuariosReducer,
    adminPagos: adminPagosReducer,
    adminAuditoria: adminAuditoriaReducer,
    // Nuevas funcionalidades
    notificaciones: notificacionesReducer,
    dashboard: dashboardReducer,
    busqueda: busquedaReducer,
    calendario: calendarioReducer,
    evolucion: evolucionReducer,
    exportacion: exportacionReducer,
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


