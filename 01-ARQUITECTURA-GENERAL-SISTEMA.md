# 📘 DOCUMENTACIÓN TÉCNICA - ARQUITECTURA GENERAL DEL SISTEMA

## 🎯 Información General del Proyecto

**Nombre:** Sistema de Gestión para Clínica de Fisioterapia  
**Tecnología Backend:** Node.js + Express + MongoDB  
**Arquitectura:** API REST con arquitectura por capas  
**Versión:** 1.0.0  
**Ambiente de Desarrollo:** http://localhost:PUERTO/api

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Estructura de Capas

```
┌─────────────────────────────────────────────┐
│           FRONTEND (React/Vue)              │
│         (Tu aplicación cliente)             │
└────────────────┬────────────────────────────┘
                 │ HTTP/HTTPS Requests
                 ↓
┌─────────────────────────────────────────────┐
│         CAPA DE RUTAS (Routes)              │
│  - authRoutes.js                            │
│  - pacienteRoutes.js                        │
│  - sesionRoutes.js                          │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│       CAPA DE MIDDLEWARES                   │
│  - authMiddleware (protect, authorize)      │
│  - validationMiddleware                     │
│  - errorHandler                             │
│  - Rate Limiting                            │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│       CAPA DE CONTROLADORES                 │
│  - authController                           │
│  - pacienteController                       │
│  - sesionController                         │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│       CAPA DE SERVICIOS (Lógica)            │
│  - authService                              │
│  - pacienteService                          │
│  - sesionService                            │
│  - emailService                             │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│       CAPA DE MODELOS (Mongoose)            │
│  - User (Usuarios del sistema)              │
│  - Paciente (Pacientes de la clínica)       │
│  - Sesion (Sesiones de fisioterapia)        │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│           BASE DE DATOS MongoDB             │
│  Collections: users, pacientes, sesiones    │
└─────────────────────────────────────────────┘
```

---

## 🔐 SISTEMA DE AUTENTICACIÓN

### Mecanismo de Seguridad

El sistema utiliza **JWT (JSON Web Tokens)** con dos tipos de tokens:

1. **Access Token** (Corta duración - 7 días default)
   - Se envía en cada petición protegida
   - Se incluye en el header: `Authorization: Bearer {token}`
   - También se almacena en cookies HTTP-Only (opcional)

2. **Refresh Token** (Larga duración - 30 días default)
   - Se usa para renovar el Access Token cuando expira
   - Más seguro, se almacena en la base de datos

### Estados de Usuario

- `pendiente_verificacion`: Usuario registrado, email no verificado
- `activo`: Usuario verificado y activo en el sistema
- `inactivo`: Usuario desactivado temporalmente
- `suspendido`: Usuario suspendido por el administrador

### Roles del Sistema

- **usuario**: Usuario base del sistema (fisioterapeutas)
- **empleado**: Empleados con acceso a funcionalidades operativas
- **administrador**: Acceso completo al sistema

---

## 📋 ESTRUCTURA DE MÓDULOS

### 1. Módulo de Autenticación (`/api/auth`)

**Responsabilidades:**
- Registro de nuevos usuarios
- Verificación de email con código de 6 dígitos
- Inicio y cierre de sesión
- Gestión de tokens (refresh)
- Actualización de perfil y contraseña

**Flujo de Seguridad:**
```
Usuario → Registro → Email con código → Verificación → Login → Access Token
```

---

### 2. Módulo de Pacientes (`/api/pacientes`)

**Responsabilidades:**
- CRUD completo de pacientes
- Búsqueda y filtrado avanzado
- Gestión de datos médicos (diagnósticos, antecedentes)
- Control de obras sociales
- Seguimiento de estadísticas por paciente
- Alta médica de pacientes

**Entidades Relacionadas:**
- **Datos Personales**: nombre, DNI, contacto, dirección
- **Datos Médicos**: diagnóstico, médico derivante, antecedentes
- **Información de Pago**: obra social, valor de sesión, modalidad
- **Estadísticas**: total sesiones, montos abonados, saldos

---

### 3. Módulo de Sesiones (`/api/sesiones`)

**Responsabilidades:**
- Registro de sesiones de fisioterapia
- Planilla diaria de movimientos
- Historial completo de sesiones por paciente
- Control de pagos y cobros
- Estadísticas de rendimiento
- Seguimiento de evolución del paciente

**Tipos de Sesión:**
- `presencial`: Sesión en consultorio
- `domicilio`: Sesión en domicilio del paciente
- `virtual`: Sesión por videollamada
- `evaluacion`: Primera evaluación
- `control`: Sesión de control

**Estados de Sesión:**
- `programada`: Sesión agendada
- `realizada`: Sesión completada
- `cancelada`: Sesión cancelada
- `ausente`: Paciente no asistió
- `reprogramada`: Sesión reprogramada

---

## 🔄 FLUJO GENERAL DE PETICIONES

### 1. Petición Sin Autenticación (Pública)

```
Cliente Frontend
    │
    ├─→ POST /api/auth/register
    │   Body: { nombre, apellido, email, password }
    │
    ├─→ Validación en Middleware
    │
    ├─→ Controller procesa
    │
    ├─→ Service ejecuta lógica
    │
    ├─→ Model guarda en DB
    │
    └─→ Response: { success: true, data: {...} }
```

### 2. Petición Autenticada (Protegida)

```
Cliente Frontend
    │
    ├─→ GET /api/pacientes
    │   Headers: { Authorization: "Bearer {accessToken}" }
    │
    ├─→ Middleware authMiddleware.protect
    │   ├─ Verifica token JWT
    │   ├─ Valida usuario existe
    │   ├─ Verifica email verificado
    │   └─ Agrega req.user
    │
    ├─→ Middleware authorize (si aplica)
    │   └─ Verifica rol del usuario
    │
    ├─→ Controller procesa
    │
    ├─→ Service ejecuta lógica
    │
    ├─→ Model consulta DB
    │
    └─→ Response: { success: true, data: [...] }
```

### 3. Petición con Error

```
Cliente Frontend
    │
    ├─→ POST /api/pacientes
    │   Headers: { Authorization: "Bearer {invalid_token}" }
    │
    ├─→ Middleware authMiddleware.protect
    │   └─ Token inválido → Error
    │
    ├─→ Error Handler Middleware
    │   └─ Formatea error
    │
    └─→ Response: { 
          success: false, 
          message: "Token inválido o expirado" 
        }
```

---

## 📦 FORMATO ESTÁNDAR DE RESPUESTAS

### Respuesta Exitosa (200, 201)

```json
{
  "success": true,
  "message": "Descripción de la operación exitosa",
  "data": {
    // Datos relevantes de la respuesta
  }
}
```

### Respuesta con Paginación (200)

```json
{
  "success": true,
  "message": "Datos obtenidos exitosamente",
  "data": [
    // Array de elementos
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Respuesta de Error (4xx, 5xx)

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "email",
      "message": "El email no es válido"
    }
  ]
}
```

---

## 🛡️ CÓDIGOS DE ESTADO HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa (GET, PUT, DELETE) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 400 | Bad Request | Solicitud mal formada |
| 401 | Unauthorized | No autenticado (sin token o token inválido) |
| 403 | Forbidden | Autenticado pero sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (email/DNI duplicado) |
| 422 | Unprocessable Entity | Error de validación |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

---

## 🔒 SISTEMA DE RATE LIMITING

Para prevenir abuso de la API, se implementan límites de peticiones:

| Endpoint | Límite | Ventana de Tiempo |
|----------|--------|-------------------|
| `/auth/register` | 5 intentos | 1 hora |
| `/auth/login` | 10 intentos | 15 minutos |
| `/auth/verify-email` | 3 intentos | 1 hora |
| `/auth/resend-verification` | 3 intentos | 1 hora |

**Respuesta cuando se excede el límite:**
```json
{
  "success": false,
  "message": "Demasiados intentos. Por favor intenta nuevamente más tarde."
}
```

---

## 🗄️ MODELOS DE DATOS

### User (Usuario del Sistema)

```javascript
{
  _id: ObjectId,
  nombre: String,
  apellido: String,
  email: String (unique),
  password: String (hasheado),
  telefono: String,
  direccion: Object,
  rol: "usuario" | "empleado" | "administrador",
  estado: "activo" | "inactivo" | "suspendido" | "pendiente_verificacion",
  emailVerificado: Boolean,
  ultimoAcceso: Date,
  metadata: {
    intentosFallidos: Number,
    bloqueadoHasta: Date,
    ipRegistro: String,
    ultimaIp: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Paciente

```javascript
{
  _id: ObjectId,
  nombre: String,
  apellido: String,
  dni: String (unique),
  fechaNacimiento: Date,
  edad: Number,
  genero: String,
  telefono: String,
  email: String,
  direccion: Object,
  obraSocial: {
    nombre: String,
    numeroAfiliado: String,
    plan: String,
    vigenciaDesde: Date,
    vigenciaHasta: Date
  },
  diagnostico: {
    principal: String,
    secundarios: [String],
    observaciones: String
  },
  medicoDerivante: Object,
  antecedentes: Object,
  contactoEmergencia: Object,
  estado: "activo" | "inactivo" | "alta" | "derivado" | "abandono",
  modalidadPago: String,
  valorSesion: Number,
  estadisticas: {
    totalSesiones: Number,
    totalAbonado: Number,
    saldoPendiente: Number,
    ultimaSesion: Date
  },
  creadoPor: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Sesion

```javascript
{
  _id: ObjectId,
  paciente: ObjectId (ref: Paciente),
  fecha: Date,
  tipoSesion: String,
  horaEntrada: String,
  horaSalida: String,
  duracion: Number (minutos),
  numeroOrden: Number,
  tratamiento: {
    descripcion: String,
    tecnicas: [String],
    areas: [String],
    intensidad: String
  },
  evolucion: {
    estadoGeneral: String,
    dolor: Number (0-10),
    movilidad: String,
    observaciones: String
  },
  pago: {
    monto: Number,
    metodoPago: String,
    pagado: Boolean,
    fechaPago: Date,
    comprobante: Object
  },
  estado: String,
  profesional: ObjectId (ref: User),
  observaciones: String,
  indicaciones: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 VARIABLES DE ENTORNO REQUERIDAS

El backend requiere estas variables de entorno (archivo `.env`):

```env
# Server
PORT=5000
NODE_ENV=development

# Base de datos
MONGO_URI=mongodb://localhost:27017/clinica_fisioterapia

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
JWT_REFRESH_SECRET=tu_clave_refresh_super_segura
JWT_REFRESH_EXPIRE=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM=Clínica Fisioterapia <no-reply@clinica.com>
EMAIL_VERIFICATION_EXPIRE_MINUTES=15

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 📝 VALIDACIONES IMPORTANTES

### Validaciones de Usuario
- **Email**: Formato válido de email
- **Password**: Mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial
- **Nombre/Apellido**: Solo letras y espacios, 2-50 caracteres

### Validaciones de Paciente
- **DNI**: 7 u 8 dígitos numéricos, único en el sistema
- **Teléfono**: Obligatorio
- **Nombre/Apellido**: Obligatorios

### Validaciones de Sesión
- **Paciente**: Debe existir y estar activo
- **Hora**: Formato HH:MM (24 horas)
- **Monto**: Debe ser mayor o igual a 0

---

## 🚀 MEJORES PRÁCTICAS PARA EL FRONTEND

### 1. Manejo de Tokens

```javascript
// Guardar tokens después del login
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);

// Incluir token en todas las peticiones protegidas
const config = {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
};
```

### 2. Interceptor para Refresh Token

```javascript
// Cuando el access token expira (401)
if (error.response.status === 401 && error.response.data.message.includes('expirado')) {
  // Intentar refrescar el token
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await axios.post('/api/auth/refresh-token', { refreshToken });
  
  // Guardar nuevo token y reintentar petición original
  localStorage.setItem('accessToken', response.data.accessToken);
  // Reintentar petición original
}
```

### 3. Manejo de Errores

```javascript
try {
  const response = await api.post('/api/pacientes', data);
  // Manejar éxito
} catch (error) {
  if (error.response) {
    // El servidor respondió con un código de error
    console.error('Error:', error.response.data.message);
    
    if (error.response.status === 422) {
      // Errores de validación
      error.response.data.errors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
      });
    }
  }
}
```

### 4. Paginación

```javascript
const [page, setPage] = useState(1);
const [limit] = useState(10);

const fetchPacientes = async () => {
  const response = await api.get(`/api/pacientes?page=${page}&limit=${limit}`);
  setPacientes(response.data.data);
  setPagination(response.data.pagination);
};

// Navegación
const goToNextPage = () => {
  if (pagination.hasNextPage) {
    setPage(page + 1);
  }
};
```

### 5. Búsqueda y Filtros

```javascript
// Búsqueda con debounce
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (searchTerm) {
      fetchPacientes({ busqueda: searchTerm });
    }
  }, 500);

  return () => clearTimeout(delayDebounceFn);
}, [searchTerm]);
```

---

## 🐛 DEBUGGING Y LOGS

El sistema mantiene logs en consola con información relevante:

```
[INFO] Usuario registrado: juan.perez@example.com
[INFO] Login exitoso: juan.perez@example.com
[ERROR] Error al crear paciente: DNI duplicado
[WARN] Intento de acceso sin permisos: usuario → DELETE /api/pacientes/:id
```

---

## 📊 ESTADÍSTICAS Y MÉTRICAS

El sistema calcula automáticamente:

### Pacientes
- Total de pacientes por estado
- Distribución por obra social
- Promedio de sesiones por paciente
- Total recaudado y saldos pendientes

### Sesiones
- Sesiones por día/mes
- Recaudación diaria/mensual
- Duración promedio de sesiones
- Distribución por tipo de sesión
- Métodos de pago más utilizados

---

## 🔄 HOOKS Y MIDDLEWARES DE MONGOOSE

### Pre-save Hooks
- **User**: Hashea la contraseña antes de guardar
- **Paciente**: Calcula edad desde fecha de nacimiento
- **Sesion**: Calcula duración de la sesión automáticamente

### Post-save Hooks
- **Sesion**: Actualiza estadísticas del paciente después de guardar una sesión

---

## 📞 SOPORTE Y CONTACTO

Para dudas sobre la integración del backend:

1. Revisar esta documentación
2. Consultar los documentos específicos de cada módulo
3. Verificar los ejemplos de peticiones en Postman
4. Contactar al equipo de backend

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [ ] Configurar base URL de la API
- [ ] Implementar sistema de autenticación con tokens
- [ ] Configurar interceptores para refresh token
- [ ] Implementar manejo global de errores
- [ ] Configurar rate limiting en frontend
- [ ] Implementar sistema de paginación
- [ ] Configurar búsqueda con debounce
- [ ] Validaciones de formularios (matching backend)
- [ ] Manejo de estados de carga y errores
- [ ] Testing de todos los endpoints

---

**Última actualización:** Noviembre 2025  
**Versión del documento:** 1.0.0

