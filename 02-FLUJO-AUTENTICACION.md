# 🔐 DOCUMENTACIÓN TÉCNICA - SISTEMA DE AUTENTICACIÓN

## 📑 Índice

1. [Descripción General](#descripción-general)
2. [Flujo Completo de Autenticación](#flujo-completo-de-autenticación)
3. [Endpoints Detallados](#endpoints-detallados)
4. [Manejo de Tokens](#manejo-de-tokens)
5. [Implementación en Frontend](#implementación-en-frontend)
6. [Casos de Uso Comunes](#casos-de-uso-comunes)
7. [Manejo de Errores](#manejo-de-errores)

---

## 📖 DESCRIPCIÓN GENERAL

El sistema de autenticación utiliza **JWT (JSON Web Tokens)** con un flujo de verificación por email mediante código de 6 dígitos.

### Características Principales

- ✅ Registro con verificación de email obligatoria
- ✅ Código de verificación de 6 dígitos (expira en 15 minutos)
- ✅ Sistema de doble token (Access + Refresh)
- ✅ Protección contra fuerza bruta (Rate Limiting)
- ✅ Roles y permisos multinivel
- ✅ Gestión de sesiones activas
- ✅ Actualización de perfil de usuario
- ✅ Cambio seguro de contraseña

### Base URL

```
http://localhost:PUERTO/api/auth
```

---

## 🔄 FLUJO COMPLETO DE AUTENTICACIÓN

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────┐
│                  FLUJO DE REGISTRO                      │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend                    Email Service
   │                           │                            │
   ├─→ POST /auth/register    │                            │
   │   {email, password...}    │                            │
   │                           │                            │
   │                           ├─→ Validar datos           │
   │                           │                            │
   │                           ├─→ Verificar email único   │
   │                           │                            │
   │                           ├─→ Crear usuario           │
   │                           │   estado: pendiente        │
   │                           │                            │
   │                           ├─→ Generar código 6 dígitos│
   │                           │                            │
   │                           ├───────────────────────────→│
   │                           │   Enviar email con código  │
   │                           │                            │
   │   ←── 201 Created ────────┤                            │
   │   {success, usuario}      │                            │
   │                           │                            │
   ├─→ Mostrar pantalla       │                            │
   │   "Verifica tu email"     │                            │
   │                           │                            │
   │   Usuario ingresa código  │                            │
   │                           │                            │
   ├─→ POST /auth/verify-email│                            │
   │   {email, code}           │                            │
   │                           │                            │
   │                           ├─→ Validar código          │
   │                           │                            │
   │                           ├─→ Verificar no expirado   │
   │                           │                            │
   │                           ├─→ Actualizar usuario      │
   │                           │   emailVerificado: true    │
   │                           │   estado: activo           │
   │                           │                            │
   │                           ├─→ Generar Access Token    │
   │                           │                            │
   │                           ├─→ Generar Refresh Token   │
   │                           │                            │
   │   ←── 200 OK ─────────────┤                            │
   │   {accessToken,           │                            │
   │    refreshToken, usuario} │                            │
   │                           │                            │
   ├─→ Guardar tokens         │                            │
   │                           │                            │
   ├─→ Redirigir a Dashboard  │                            │
   │                           │                            │


┌─────────────────────────────────────────────────────────┐
│                  FLUJO DE LOGIN                         │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend
   │                           │
   ├─→ POST /auth/login       │
   │   {email, password}       │
   │                           │
   │                           ├─→ Buscar usuario por email
   │                           │
   │                           ├─→ Verificar password
   │                           │
   │                           ├─→ Verificar email verificado
   │                           │
   │                           ├─→ Verificar no bloqueado
   │                           │
   │                           ├─→ Generar Access Token
   │                           │
   │                           ├─→ Generar Refresh Token
   │                           │
   │                           ├─→ Actualizar ultimoAcceso
   │                           │
   │                           ├─→ Guardar refresh token en DB
   │                           │
   │   ←── 200 OK ─────────────┤
   │   {accessToken,           │
   │    refreshToken, usuario} │
   │                           │
   ├─→ Guardar tokens         │
   │                           │
   ├─→ Redirigir a Dashboard  │
   │                           │


┌─────────────────────────────────────────────────────────┐
│            FLUJO DE PETICIÓN AUTENTICADA                │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend
   │                           │
   ├─→ GET /pacientes         │
   │   Header: Bearer {token}  │
   │                           │
   │                           ├─→ Verificar token existe
   │                           │
   │                           ├─→ Decodificar JWT
   │                           │
   │                           ├─→ Buscar usuario por ID
   │                           │
   │                           ├─→ Verificar usuario activo
   │                           │
   │                           ├─→ Verificar email verificado
   │                           │
   │                           ├─→ Agregar req.user
   │                           │
   │                           ├─→ Ejecutar lógica de negocio
   │                           │
   │   ←── 200 OK ─────────────┤
   │   {success, data}         │
   │                           │


┌─────────────────────────────────────────────────────────┐
│            FLUJO DE REFRESH TOKEN                       │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend
   │                           │
   ├─→ GET /pacientes         │
   │   (token expirado)        │
   │                           │
   │   ←── 401 Unauthorized ───┤
   │   "Token expirado"        │
   │                           │
   ├─→ POST /auth/refresh-token
   │   {refreshToken}          │
   │                           │
   │                           ├─→ Verificar refresh token
   │                           │
   │                           ├─→ Validar no expirado
   │                           │
   │                           ├─→ Buscar usuario
   │                           │
   │                           ├─→ Generar nuevo Access Token
   │                           │
   │                           ├─→ Generar nuevo Refresh Token
   │                           │
   │   ←── 200 OK ─────────────┤
   │   {accessToken,           │
   │    refreshToken}          │
   │                           │
   ├─→ Guardar nuevos tokens  │
   │                           │
   ├─→ Reintentar petición    │
   │   original                │
   │                           │
```

---

## 📍 ENDPOINTS DETALLADOS

### 1️⃣ REGISTRAR USUARIO

**POST** `/api/auth/register`

#### Descripción
Registra un nuevo usuario en el sistema y envía un código de verificación de 6 dígitos al email proporcionado.

#### Headers
```json
{
  "Content-Type": "application/json"
}
```

#### Body (JSON)
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@example.com",
  "password": "Password123!",
  "telefono": "+5493815551234"  // Opcional
}
```

#### Validaciones
- **nombre**: Obligatorio, 2-50 caracteres, solo letras y espacios
- **apellido**: Obligatorio, 2-50 caracteres, solo letras y espacios
- **email**: Obligatorio, formato válido, único en el sistema
- **password**: Obligatorio, mínimo 8 caracteres, debe incluir:
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Al menos un carácter especial (@$!%*?&)
- **telefono**: Opcional, formato de teléfono válido

#### Respuesta Exitosa (201 Created)
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Por favor verifica tu email",
  "data": {
    "usuario": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "telefono": "+5493815551234",
      "rol": "usuario",
      "estado": "pendiente_verificacion",
      "emailVerificado": false,
      "createdAt": "2025-11-17T10:00:00.000Z"
    }
  }
}
```

#### Errores Posibles

**422 Unprocessable Entity - Validación fallida**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "email",
      "message": "El email no es válido"
    },
    {
      "field": "password",
      "message": "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
    }
  ]
}
```

**409 Conflict - Email duplicado**
```json
{
  "success": false,
  "message": "El email ya está registrado"
}
```

**429 Too Many Requests - Rate limit excedido**
```json
{
  "success": false,
  "message": "Demasiados intentos de registro. Por favor intenta nuevamente en una hora."
}
```

#### Rate Limit
- **5 intentos** por hora por IP

---

### 2️⃣ VERIFICAR EMAIL

**POST** `/api/auth/verify-email`

#### Descripción
Verifica el email del usuario mediante el código de 6 dígitos enviado por correo.

#### Body (JSON)
```json
{
  "email": "juan.perez@example.com",
  "code": "123456"
}
```

#### Validaciones
- **email**: Obligatorio, formato válido
- **code**: Obligatorio, 6 dígitos numéricos

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Email verificado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "rol": "usuario",
      "estado": "activo",
      "emailVerificado": true,
      "ultimoAcceso": "2025-11-17T10:05:00.000Z"
    }
  }
}
```

#### Errores Posibles

**400 Bad Request - Código inválido o expirado**
```json
{
  "success": false,
  "message": "Código de verificación inválido o expirado"
}
```

**404 Not Found - Usuario no encontrado**
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

**409 Conflict - Email ya verificado**
```json
{
  "success": false,
  "message": "El email ya ha sido verificado"
}
```

---

### 3️⃣ REENVIAR CÓDIGO DE VERIFICACIÓN

**POST** `/api/auth/resend-verification`

#### Descripción
Genera y envía un nuevo código de verificación al email del usuario.

#### Body (JSON)
```json
{
  "email": "juan.perez@example.com"
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Código de verificación reenviado exitosamente"
}
```

#### Errores Posibles

**404 Not Found**
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

**409 Conflict**
```json
{
  "success": false,
  "message": "El email ya ha sido verificado"
}
```

#### Rate Limit
- **3 intentos** por hora por IP

---

### 4️⃣ INICIAR SESIÓN (LOGIN)

**POST** `/api/auth/login`

#### Descripción
Inicia sesión y retorna tokens de autenticación.

#### Body (JSON)
```json
{
  "email": "juan.perez@example.com",
  "password": "Password123!"
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "telefono": "+5493815551234",
      "rol": "usuario",
      "estado": "activo",
      "emailVerificado": true,
      "ultimoAcceso": "2025-11-17T10:30:00.000Z",
      "avatar": null,
      "createdAt": "2025-11-15T08:00:00.000Z",
      "updatedAt": "2025-11-17T10:30:00.000Z"
    }
  }
}
```

#### Errores Posibles

**401 Unauthorized - Credenciales inválidas**
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

**403 Forbidden - Email no verificado**
```json
{
  "success": false,
  "message": "Email no verificado. Por favor verifica tu correo electrónico"
}
```

**403 Forbidden - Cuenta bloqueada**
```json
{
  "success": false,
  "message": "Tu cuenta está bloqueada temporalmente. Intenta nuevamente más tarde."
}
```

**403 Forbidden - Cuenta inactiva/suspendida**
```json
{
  "success": false,
  "message": "Tu cuenta está inactiva o suspendida"
}
```

#### Rate Limit
- **10 intentos** por 15 minutos por IP

#### Notas Importantes
- El sistema también establece una cookie HTTP-Only con el token
- Después de 5 intentos fallidos, la cuenta se bloquea temporalmente
- `ultimoAcceso` se actualiza con cada login exitoso

---

### 5️⃣ CERRAR SESIÓN (LOGOUT)

**POST** `/api/auth/logout`

#### Descripción
Cierra la sesión del usuario actual y limpia el refresh token.

#### Headers
```json
{
  "Authorization": "Bearer {accessToken}"
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

#### Errores Posibles

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Se requiere un token de autenticación"
}
```

#### Implementación Frontend
```javascript
// Eliminar tokens del localStorage
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');

// Redirigir al login
navigate('/login');
```

---

### 6️⃣ REFRESCAR TOKEN

**POST** `/api/auth/refresh-token`

#### Descripción
Genera nuevos tokens cuando el access token expira.

#### Body (JSON)
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Token refrescado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Errores Posibles

**401 Unauthorized - Refresh token inválido o expirado**
```json
{
  "success": false,
  "message": "Refresh token inválido o expirado"
}
```

---

### 7️⃣ OBTENER USUARIO ACTUAL

**GET** `/api/auth/me`

#### Descripción
Obtiene la información completa del usuario autenticado actual.

#### Headers
```json
{
  "Authorization": "Bearer {accessToken}"
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "usuario": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "telefono": "+5493815551234",
      "direccion": {
        "calle": "Av. Principal",
        "ciudad": "San Miguel de Tucumán",
        "provincia": "Tucumán",
        "codigoPostal": "4000",
        "pais": "Argentina"
      },
      "rol": "usuario",
      "estado": "activo",
      "emailVerificado": true,
      "ultimoAcceso": "2025-11-17T10:30:00.000Z",
      "avatar": null,
      "createdAt": "2025-11-15T08:00:00.000Z",
      "updatedAt": "2025-11-17T10:30:00.000Z"
    }
  }
}
```

#### Errores Posibles

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

---

### 8️⃣ ACTUALIZAR PERFIL

**PUT** `/api/auth/update-profile`

#### Descripción
Actualiza la información del perfil del usuario autenticado.

#### Headers
```json
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

#### Body (JSON) - Solo campos a actualizar
```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez García",
  "telefono": "+5493815559999",
  "direccion": {
    "calle": "Av. Aconquija",
    "numero": "1234",
    "ciudad": "Yerba Buena",
    "provincia": "Tucumán",
    "codigoPostal": "4107",
    "pais": "Argentina"
  }
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "usuario": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "nombre": "Juan Carlos",
      "apellido": "Pérez García",
      "email": "juan.perez@example.com",
      "telefono": "+5493815559999",
      "direccion": {
        "calle": "Av. Aconquija",
        "numero": "1234",
        "ciudad": "Yerba Buena",
        "provincia": "Tucumán",
        "codigoPostal": "4107",
        "pais": "Argentina"
      },
      "rol": "usuario",
      "estado": "activo",
      "emailVerificado": true,
      "updatedAt": "2025-11-17T11:00:00.000Z"
    }
  }
}
```

#### Errores Posibles

**422 Unprocessable Entity - Validación fallida**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "telefono",
      "message": "El número de teléfono no es válido"
    }
  ]
}
```

#### Nota
- No se puede cambiar el email ni el rol desde este endpoint
- El password se cambia con endpoint específico

---

### 9️⃣ CAMBIAR CONTRASEÑA

**PUT** `/api/auth/change-password`

#### Descripción
Cambia la contraseña del usuario autenticado.

#### Headers
```json
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

#### Body (JSON)
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

#### Validaciones
- **currentPassword**: Debe coincidir con la contraseña actual
- **newPassword**: Debe cumplir requisitos de seguridad (8 caracteres, mayúscula, minúscula, número, carácter especial)
- **newPassword**: Debe ser diferente a la contraseña actual

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

#### Errores Posibles

**401 Unauthorized - Contraseña actual incorrecta**
```json
{
  "success": false,
  "message": "La contraseña actual es incorrecta"
}
```

**422 Unprocessable Entity - Validación fallida**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "newPassword",
      "message": "La nueva contraseña debe ser diferente a la actual"
    }
  ]
}
```

---

## 🎫 MANEJO DE TOKENS

### Estructura del Access Token

```javascript
// Payload del JWT
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "rol": "usuario",
  "email": "juan.perez@example.com",
  "iat": 1700000000,
  "exp": 1700604800
}
```

### Estructura del Refresh Token

```javascript
// Payload del JWT
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "type": "refresh",
  "iat": 1700000000,
  "exp": 1702592000
}
```

### Duración de Tokens

- **Access Token**: 7 días (configurable en .env)
- **Refresh Token**: 30 días (configurable en .env)
- **Código de Verificación**: 15 minutos

### Dónde Guardar los Tokens en Frontend

#### Opción 1: LocalStorage (Recomendado para desarrollo)
```javascript
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);
```

**Pros:** Simple, persiste entre tabs  
**Contras:** Vulnerable a XSS

#### Opción 2: SessionStorage
```javascript
sessionStorage.setItem('accessToken', response.data.accessToken);
sessionStorage.setItem('refreshToken', response.data.refreshToken);
```

**Pros:** Se elimina al cerrar tab  
**Contras:** No persiste entre tabs

#### Opción 3: Cookies (Recomendado para producción)
```javascript
// El backend ya envía la cookie automáticamente
// Frontend solo necesita configurar withCredentials: true
axios.defaults.withCredentials = true;
```

**Pros:** Seguro contra XSS, HTTP-Only  
**Contras:** Vulnerable a CSRF (se mitiga con SameSite)

---

## 💻 IMPLEMENTACIÓN EN FRONTEND

### 1. Servicio de Autenticación (authService.js)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

class AuthService {
  // Registrar usuario
  async register(userData) {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Verificar email
  async verifyEmail(email, code) {
    try {
      const response = await api.post('/verify-email', { email, code });
      
      // Guardar tokens
      if (response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
      }
      
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Reenviar código
  async resendVerification(email) {
    try {
      const response = await api.post('/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Login
  async login(email, password) {
    try {
      const response = await api.post('/login', { email, password });
      
      // Guardar tokens y usuario
      if (response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
      }
      
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Logout
  async logout() {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        await api.post('/logout', {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      // Limpiar localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
    } catch (error) {
      // Limpiar localStorage incluso si falla la petición
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      throw error.response?.data || error;
    }
  }

  // Refrescar token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/refresh-token', { refreshToken });
      
      // Actualizar tokens
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      
      return response.data.data.accessToken;
    } catch (error) {
      // Si falla el refresh, logout
      this.logout();
      throw error.response.data;
    }
  }

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await api.get('/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Actualizar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
      
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Actualizar perfil
  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await api.put('/update-profile', profileData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Actualizar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
      
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Cambiar contraseña
  async changePassword(currentPassword, newPassword) {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await api.put('/change-password', 
        { currentPassword, newPassword },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Obtener usuario del localStorage
  getCurrentUserFromStorage() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  // Obtener access token
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }
}

export default new AuthService();
```

---

### 2. Interceptor de Axios para Auto-refresh

```javascript
// axiosConfig.js
import axios from 'axios';
import AuthService from './authService';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de requests - Agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de responses - Manejar token expirado
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos reintentado aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Verificar si es por token expirado
      if (error.response.data.message?.includes('expirado')) {
        originalRequest._retry = true;

        try {
          // Intentar refrescar el token
          const newAccessToken = await AuthService.refreshToken();
          
          // Actualizar el header con el nuevo token
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Reintentar la petición original
          return api(originalRequest);
          
        } catch (refreshError) {
          // Si falla el refresh, redirigir al login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

### 3. Hook de React para Autenticación

```javascript
// useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import AuthService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay usuario en localStorage al cargar
    const storedUser = AuthService.getCurrentUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const response = await AuthService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await AuthService.verifyEmail(email, code);
      setUser(response.data.usuario);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await AuthService.login(email, password);
      setUser(response.data.usuario);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Logout local incluso si falla la petición
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await AuthService.updateProfile(profileData);
      setUser(response.data.usuario);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await AuthService.getCurrentUser();
      setUser(response.data.usuario);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    verifyEmail,
    login,
    logout,
    updateProfile,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
```

---

### 4. Protected Route Component

```javascript
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar roles si se especificaron
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## 📱 CASOS DE USO COMUNES

### Caso 1: Flujo Completo de Registro y Login

```javascript
// Componente de Registro
const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1); // 1: formulario, 2: verificación
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      await register(formData);
      setStep(2); // Ir a paso de verificación
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors([{ message: error.message }]);
      }
    }
  };

  if (step === 2) {
    return <VerifyEmail email={formData.email} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((err, idx) => (
            <div key={idx}>{err.message}</div>
          ))}
        </div>
      )}
    </form>
  );
};

// Componente de Verificación
const VerifyEmail = ({ email }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await verifyEmail(email, code);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await AuthService.resendVerification(email);
      alert('Código reenviado exitosamente');
    } catch (error) {
      setError(error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <p>Ingresa el código de 6 dígitos enviado a {email}</p>
      <input
        type="text"
        maxLength="6"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
      />
      <button type="submit">Verificar</button>
      <button type="button" onClick={handleResend} disabled={resending}>
        Reenviar código
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

---

### Caso 2: Componente de Login

```javascript
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

---

### Caso 3: Actualizar Perfil

```javascript
const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || ''
  });
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setErrors([]);

    try {
      await updateProfile(formData);
      setSuccess(true);
    } catch (error) {
      setErrors(error.errors || [{ message: error.message }]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      {success && <div className="success">Perfil actualizado</div>}
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((err, idx) => (
            <div key={idx}>{err.message}</div>
          ))}
        </div>
      )}
    </form>
  );
};
```

---

### Caso 4: Cambiar Contraseña

```javascript
const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validación local
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await AuthService.changePassword(currentPassword, newPassword);
      setSuccess(true);
      // Limpiar formulario
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Contraseña actual"
        required
      />
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Nueva contraseña"
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirmar nueva contraseña"
        required
      />
      <button type="submit">Cambiar Contraseña</button>
      {success && <div className="success">Contraseña cambiada exitosamente</div>}
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

---

## ⚠️ MANEJO DE ERRORES

### Tipos de Errores y Cómo Manejarlos

```javascript
const handleApiError = (error) => {
  // Error de red
  if (!error.response) {
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      type: 'network'
    };
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return {
        message: data.message || 'Solicitud incorrecta',
        type: 'bad_request'
      };

    case 401:
      // Token inválido o expirado
      if (data.message.includes('expirado')) {
        // El interceptor ya maneja esto
        return null;
      }
      return {
        message: 'No autorizado. Por favor inicia sesión.',
        type: 'unauthorized'
      };

    case 403:
      return {
        message: data.message || 'No tienes permisos para realizar esta acción',
        type: 'forbidden'
      };

    case 404:
      return {
        message: data.message || 'Recurso no encontrado',
        type: 'not_found'
      };

    case 409:
      return {
        message: data.message || 'Ya existe un registro con esos datos',
        type: 'conflict'
      };

    case 422:
      // Errores de validación
      return {
        message: 'Errores de validación',
        errors: data.errors,
        type: 'validation'
      };

    case 429:
      return {
        message: data.message || 'Demasiados intentos. Intenta más tarde.',
        type: 'rate_limit'
      };

    case 500:
      return {
        message: 'Error del servidor. Por favor intenta más tarde.',
        type: 'server_error'
      };

    default:
      return {
        message: data.message || 'Ha ocurrido un error',
        type: 'unknown'
      };
  }
};
```

---

## 🔍 TESTING DE ENDPOINTS

### Secuencia de Prueba en Postman

1. **Registrar usuario**
   ```
   POST /api/auth/register
   ```

2. **Copiar código del email** (o consola del servidor en desarrollo)

3. **Verificar email**
   ```
   POST /api/auth/verify-email
   ```

4. **Copiar accessToken de la respuesta**

5. **Probar endpoint protegido**
   ```
   GET /api/auth/me
   Header: Authorization: Bearer {accessToken}
   ```

6. **Probar refresh token**
   ```
   POST /api/auth/refresh-token
   Body: { "refreshToken": "..." }
   ```

7. **Actualizar perfil**
   ```
   PUT /api/auth/update-profile
   ```

8. **Cambiar contraseña**
   ```
   PUT /api/auth/change-password
   ```

9. **Cerrar sesión**
   ```
   POST /api/auth/logout
   ```

---

## 📋 CHECKLIST DE INTEGRACIÓN

- [ ] Configurar base URL de la API
- [ ] Implementar servicio de autenticación
- [ ] Configurar interceptores de Axios
- [ ] Crear contexto/hook de autenticación
- [ ] Implementar componente de registro
- [ ] Implementar componente de verificación de email
- [ ] Implementar componente de login
- [ ] Implementar Protected Routes
- [ ] Implementar manejo de errores global
- [ ] Implementar auto-refresh de tokens
- [ ] Implementar logout
- [ ] Implementar actualización de perfil
- [ ] Implementar cambio de contraseña
- [ ] Testing de todos los flujos
- [ ] Manejo de estados de carga
- [ ] Mensajes de error user-friendly

---

**Última actualización:** Noviembre 2025  
**Versión del documento:** 1.0.0

