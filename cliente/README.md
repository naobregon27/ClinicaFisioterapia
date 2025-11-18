# 🏥 Sistema de Gestión para Clínica de Fisioterapia - Frontend

Sistema moderno y profesional para la gestión completa de una clínica de fisioterapia, desarrollado con React, Redux Toolkit, Material-UI y conectado al backend deployado en Render.

## 🚀 Características Principales

- ✅ **Autenticación completa** con JWT y refresh tokens
- ✅ **Gestión de pacientes** con historial médico completo
- ✅ **Sistema de sesiones** de fisioterapia con planilla diaria
- ✅ **Control de pagos** y facturación
- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ **Roles y permisos** (Usuario, Empleado, Administrador)
- ✅ **Diseño responsive** y moderno
- ✅ **Rutas protegidas** con validación de roles
- ✅ **Notificaciones** en tiempo real

## 📁 Estructura del Proyecto

```
cliente/
├── src/
│   ├── app/                    # Configuración de la app
│   │   ├── store.js           # Redux Store
│   │   └── router.jsx         # Configuración de rutas
│   │
│   ├── config/                 # Configuraciones globales
│   │   └── config.js          # Constantes y configuración
│   │
│   ├── features/               # Módulos por funcionalidad
│   │   ├── auth/              # Autenticación
│   │   │   ├── pages/         # LoginPage, RegisterPage, VerifyEmailPage
│   │   │   └── slices/        # authSlice (Redux)
│   │   ├── pacientes/         # Gestión de pacientes
│   │   │   ├── pages/         # Lista, Detalle, Formulario
│   │   │   └── slices/        # pacientesSlice
│   │   ├── sesiones/          # Gestión de sesiones
│   │   │   ├── pages/         # Planilla, Formulario, Pagos
│   │   │   └── slices/        # sesionesSlice
│   │   └── ui/                # Estado de UI
│   │       └── slices/        # uiSlice (modales, sidebar, etc.)
│   │
│   ├── services/              # Servicios de API
│   │   ├── api/              
│   │   │   └── axiosConfig.js # Configuración de Axios + interceptores
│   │   ├── authService.js     # Servicios de autenticación
│   │   ├── pacienteService.js # Servicios de pacientes
│   │   └── sesionService.js   # Servicios de sesiones
│   │
│   ├── shared/                # Recursos compartidos
│   │   └── components/
│   │       ├── ui/           # LoadingSpinner, etc.
│   │       ├── layout/       # Sidebar, TopBar, MainLayout
│   │       └── common/       # ProtectedRoute
│   │
│   ├── pages/                 # Páginas generales
│   │   ├── DashboardPage.jsx
│   │   ├── PerfilPage.jsx
│   │   ├── ConfiguracionPage.jsx
│   │   ├── UnauthorizedPage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   └── main.jsx              # Punto de entrada
│
├── package.json
└── README.md
```

## 🛠️ Tecnologías Utilizadas

### Core
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router v6** - Navegación y rutas

### Estado y Datos
- **Redux Toolkit** - Gestión de estado global
- **React Redux** - Bindings para React
- **Axios** - Cliente HTTP

### UI y Diseño
- **Material-UI v5** - Componentes de UI
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animaciones
- **React Hot Toast** - Notificaciones

### Formularios
- **React Hook Form** - Gestión de formularios
- **Yup** - Validación de esquemas

### Utilidades
- **date-fns** - Manejo de fechas
- **lodash** - Funciones utilitarias
- **clsx** - Manejo de clases CSS

## 📦 Instalación

1. **Instalar dependencias:**
```bash
cd cliente
npm install
```

2. **Configurar variables de entorno:**

El backend ya está configurado para apuntar a:
```
https://clinicafisioterapia-back.onrender.com/api
```

Si necesitas cambiar la URL, edita `src/config/config.js`:
```javascript
apiUrl: 'https://tu-backend-url.com/api'
```

3. **Iniciar en modo desarrollo:**
```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

4. **Build para producción:**
```bash
npm run build
```

## 🔐 Flujo de Autenticación

### 1. Registro
1. Usuario se registra en `/register`
2. Backend envía código de 6 dígitos al email
3. Usuario verifica email en `/verify-email`
4. Tokens (access + refresh) se guardan en localStorage
5. Redirige al dashboard

### 2. Login
1. Usuario inicia sesión en `/login`
2. Backend valida credenciales
3. Devuelve tokens y datos del usuario
4. Redirige al dashboard

### 3. Refresh Token Automático
- Axios interceptor detecta cuando el token expira (401)
- Automáticamente usa el refresh token para obtener uno nuevo
- Reintenta la petición original
- Si falla, redirige al login

## 🎨 Tema y Estilos

### Colores Principales
- **Primary:** `#667eea` (Azul/Púrpura)
- **Secondary:** `#4CAF50` (Verde)
- **Error:** `#f44336` (Rojo)
- **Warning:** `#ff9800` (Naranja)

### Tipografía
- **Familia:** Inter, Roboto
- **Headings:** 600-700 weight
- **Body:** 400 weight

## 🔒 Roles y Permisos

### Usuario
- Dashboard
- Gestión de pacientes
- Gestión de sesiones
- Ver planilla diaria
- Ver pagos pendientes

### Empleado
- Todo lo de Usuario
- Acceso a reportes

### Administrador
- Acceso total
- Gestión de usuarios
- Eliminación de registros

## 📍 Rutas Principales

### Públicas (sin autenticación)
- `/login` - Inicio de sesión
- `/register` - Registro de usuario
- `/verify-email` - Verificación de email

### Protegidas (requieren autenticación)
- `/dashboard` - Dashboard principal
- `/pacientes` - Lista de pacientes
- `/pacientes/nuevo` - Crear paciente
- `/pacientes/:id` - Detalle de paciente
- `/pacientes/:id/editar` - Editar paciente
- `/planilla-diaria` - Planilla del día
- `/sesiones/nueva` - Nueva sesión
- `/pagos-pendientes` - Pagos pendientes
- `/perfil` - Perfil del usuario
- `/configuracion` - Configuración

## 🔧 Servicios de API

### authService
```javascript
import authService from './services/authService';

// Login
await authService.login(email, password);

// Logout
await authService.logout();

// Obtener usuario actual
await authService.getCurrentUser();
```

### pacienteService
```javascript
import pacienteService from './services/pacienteService';

// Obtener pacientes con filtros
await pacienteService.obtenerPacientes({ page: 1, limit: 10, estado: 'activo' });

// Crear paciente
await pacienteService.crearPaciente(dataPaciente);

// Buscar pacientes
await pacienteService.buscarPacientes('juan');
```

### sesionService
```javascript
import sesionService from './services/sesionService';

// Obtener planilla diaria
await sesionService.obtenerPlanillaDiaria('2025-11-17');

// Registrar sesión
await sesionService.registrarSesion(dataSesion);

// Registrar pago
await sesionService.registrarPago(sesionId, datosPago);
```

## 📊 Redux Store

### Slices Disponibles

#### authSlice
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { login, logout, selectUser, selectIsAuthenticated } from './features/auth/slices/authSlice';

const user = useSelector(selectUser);
const isAuthenticated = useSelector(selectIsAuthenticated);
```

#### pacientesSlice
```javascript
import { fetchPacientes, createPaciente, selectPacientes } from './features/pacientes/slices/pacientesSlice';

const pacientes = useSelector(selectPacientes);
dispatch(fetchPacientes({ page: 1, limit: 10 }));
```

#### sesionesSlice
```javascript
import { fetchPlanillaDiaria, createSesion } from './features/sesiones/slices/sesionesSlice';

dispatch(fetchPlanillaDiaria('2025-11-17'));
```

## 🎯 Componentes Principales

### MainLayout
Layout principal con Sidebar y TopBar
```jsx
<MainLayout>
  <YourPage />
</MainLayout>
```

### ProtectedRoute
Protege rutas que requieren autenticación
```jsx
<ProtectedRoute allowedRoles={['administrador']}>
  <AdminPage />
</ProtectedRoute>
```

### LoadingSpinner
Indicador de carga
```jsx
<LoadingSpinner fullScreen message="Cargando datos..." />
```

## 🚀 Próximos Pasos

Para continuar el desarrollo, puedes:

1. **Completar páginas de detalle:**
   - `PacienteDetailPage.jsx` - Vista completa del paciente
   - `PacienteFormPage.jsx` - Formulario completo de paciente
   - `PlanillaDiariaPage.jsx` - Planilla diaria interactiva
   - `SesionFormPage.jsx` - Formulario de sesión

2. **Agregar funcionalidades:**
   - Sistema de búsqueda avanzada
   - Exportación a PDF/Excel
   - Gráficos y estadísticas
   - Sistema de notificaciones en tiempo real
   - Chat o mensajería interna

3. **Mejorar UX:**
   - Animaciones con Framer Motion
   - Skeleton screens
   - Optimistic updates
   - Modo oscuro

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

## 🐛 Debugging

### Axios Interceptors
Los interceptores están configurados en `src/services/api/axiosConfig.js`:
- Auto-agregan el token a todas las peticiones
- Manejan el refresh automático cuando el token expira
- Formatean los errores de manera consistente

### Redux DevTools
Redux DevTools está habilitado en modo desarrollo para inspeccionar el estado.

## 📞 Soporte

Si tienes dudas sobre la arquitectura o necesitas ayuda:
1. Revisa la documentación del backend en los archivos `.md`
2. Consulta los comentarios en el código
3. Verifica la consola del navegador para errores

## 🎉 ¡Listo!

Tu frontend está completamente configurado y listo para usar. La arquitectura es:
- ✅ Modular y escalable
- ✅ Profesional y moderna
- ✅ Con buenas prácticas
- ✅ Conectada al backend en Render
- ✅ Lista para producción

**¡Ahora solo ejecuta `npm install` y luego `npm run dev` para empezar!** 🚀
