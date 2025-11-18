/**
 * Configuración de Rutas
 * Define todas las rutas de la aplicación
 */

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../shared/components/layout/MainLayout';
import ProtectedRoute from '../shared/components/common/ProtectedRoute';
import LoadingSpinner from '../shared/components/ui/LoadingSpinner';
import config from '../config/config';

// Lazy loading de páginas
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('../features/auth/pages/VerifyEmailPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const PacientesListPage = lazy(() => import('../features/pacientes/pages/PacientesListPage'));
const PacienteDetailPage = lazy(() => import('../features/pacientes/pages/PacienteDetailPage'));
const PacienteFormPage = lazy(() => import('../features/pacientes/pages/PacienteFormPage'));
const PlanillaDiariaPage = lazy(() => import('../features/sesiones/pages/PlanillaDiariaPage'));
const SesionesPage = lazy(() => import('../features/sesiones/pages/SesionesPage'));
const SesionFormPage = lazy(() => import('../features/sesiones/pages/SesionFormPage'));
const PagosPendientesPage = lazy(() => import('../features/sesiones/pages/PagosPendientesPage'));
const PerfilPage = lazy(() => import('../pages/PerfilPage'));
const ConfiguracionPage = lazy(() => import('../pages/ConfiguracionPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Wrapper para aplicar Suspense
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner fullScreen message="Cargando..." />}>
    {children}
  </Suspense>
);

// Configuración del router
export const router = createBrowserRouter(
  [
    // Redirigir raíz a login
    {
      path: '/',
      element: <Navigate to="/login" replace />,
    },

  // ========== RUTAS PÚBLICAS (SIN AUTENTICACIÓN) ==========
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <SuspenseWrapper>
        <RegisterPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <SuspenseWrapper>
        <VerifyEmailPage />
      </SuspenseWrapper>
    ),
  },

  // ========== RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN) ==========
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },

  // === PACIENTES ===
  {
    path: '/pacientes',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <PacientesListPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/pacientes/nuevo',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <PacienteFormPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/pacientes/:id',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <PacienteDetailPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/pacientes/:id/editar',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <PacienteFormPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },

  // === SESIONES ===
  {
    path: '/sesiones',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <SesionesPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/planilla-diaria',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <PlanillaDiariaPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/sesiones/nueva',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <SesionFormPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/pagos-pendientes',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <PagosPendientesPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },

  // === PERFIL Y CONFIGURACIÓN ===
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <PerfilPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/configuracion',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SuspenseWrapper>
            <ConfiguracionPage />
          </SuspenseWrapper>
        </MainLayout>
      </ProtectedRoute>
    ),
  },

  // ========== PÁGINAS DE ERROR ==========
  {
    path: '/unauthorized',
    element: (
      <SuspenseWrapper>
        <UnauthorizedPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

export default router;


