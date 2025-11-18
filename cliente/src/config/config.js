/**
 * Configuración global de la aplicación
 */

export const config = {
  // URL del Backend deployado en Render
  apiUrl: import.meta.env.VITE_API_URL || 'https://clinicafisioterapia-back.onrender.com/api',
  
  // Timeout para peticiones HTTP (30 segundos)
  apiTimeout: 30000,
  
  // Nombre de la aplicación
  appName: 'Clínica Fisioterapia',
  
  // Configuración de tokens
  tokens: {
    accessTokenKey: 'accessToken',
    refreshTokenKey: 'refreshToken',
    userKey: 'user',
  },
  
  // Configuración de paginación
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
  
  // Roles del sistema
  roles: {
    USUARIO: 'usuario',
    EMPLEADO: 'empleado',
    ADMINISTRADOR: 'administrador',
  },
  
  // Estados de pacientes
  estadosPaciente: {
    ACTIVO: 'activo',
    INACTIVO: 'inactivo',
    ALTA: 'alta',
    DERIVADO: 'derivado',
    ABANDONO: 'abandono',
  },
  
  // Estados de sesiones
  estadosSesion: {
    PROGRAMADA: 'programada',
    REALIZADA: 'realizada',
    CANCELADA: 'cancelada',
    AUSENTE: 'ausente',
    REPROGRAMADA: 'reprogramada',
  },
  
  // Tipos de sesión
  tiposSesion: {
    PRESENCIAL: 'presencial',
    DOMICILIO: 'domicilio',
    VIRTUAL: 'virtual',
    EVALUACION: 'evaluacion',
    CONTROL: 'control',
  },
  
  // Métodos de pago
  metodosPago: {
    EFECTIVO: 'efectivo',
    TRANSFERENCIA: 'transferencia',
    TARJETA: 'tarjeta',
    OBRA_SOCIAL: 'obra_social',
    MIXTO: 'mixto',
    PENDIENTE: 'pendiente',
  },
};

export default config;


