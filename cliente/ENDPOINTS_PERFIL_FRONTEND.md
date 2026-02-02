# 👤 Endpoints de Perfil y Configuración Personal - Documentación Frontend

## 📋 Resumen

Este documento describe los **endpoints de perfil y configuración personal** del sistema Clínica Fisioterapia. Todos los endpoints requieren autenticación mediante JWT.

**Base URL:** `/api/auth`

**Autenticación:** Todos los endpoints requieren el header:
```
Authorization: Bearer {accessToken}
```

---

## 🔐 Autenticación

Todos los endpoints de perfil requieren que el usuario esté autenticado. El token JWT debe enviarse en el header `Authorization` con el formato:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si el token es inválido o ha expirado, recibirás un error `401 Unauthorized`.

---

## 📊 Estructura de Datos del Usuario

### Respuesta del Usuario (obtenerDatosPublicos)

```typescript
interface Usuario {
  id: string;                    // ID único del usuario
  nombre: string;                // Nombre del usuario
  apellido: string;              // Apellido del usuario
  email: string;                 // Email (único)
  telefono: string | null;       // Teléfono (opcional)
  direccion: {                   // Dirección (opcional)
    calle?: string;
    ciudad?: string;
    provincia?: string;
    codigoPostal?: string;
    pais?: string;
  } | null;
  rol: 'administrador' | 'empleado' | 'usuario';
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente_verificacion';
  estadoCuenta: 'activo' | 'inactivo';
  emailVerificado: boolean;
  ultimoAcceso: string | null;   // ISO 8601 date string
  avatar: string | null;         // URL del avatar
  createdAt: string;             // ISO 8601 date string
  updatedAt: string;             // ISO 8601 date string
}
```

### Estructura de Respuesta de la API

Todas las respuestas exitosas siguen este formato:

```typescript
interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}
```

Las respuestas de error siguen este formato:

```typescript
interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

---

## 🎯 Endpoints Disponibles

### 1. Obtener Perfil del Usuario Actual

Obtiene la información completa del usuario autenticado.

**Endpoint:** `GET /api/auth/me`

**Autenticación:** ✅ Requerida

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:** Ninguno

**Request Body:** Ninguno

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "telefono": "+5491123456789",
      "direccion": {
        "calle": "Av. Corrientes 1234",
        "ciudad": "Buenos Aires",
        "provincia": "CABA",
        "codigoPostal": "1043",
        "pais": "Argentina"
      },
      "rol": "empleado",
      "estado": "activo",
      "estadoCuenta": "activo",
      "emailVerificado": true,
      "ultimoAcceso": "2024-01-15T10:30:00.000Z",
      "avatar": null,
      "createdAt": "2024-01-01T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Errores Posibles:**

| Código | Descripción |
|--------|-------------|
| `401` | Token inválido o expirado |
| `401` | No autorizado - Token no proporcionado |

**Ejemplo de Uso (JavaScript/Fetch):**
```javascript
const obtenerPerfil = async (token) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('Perfil:', data.data.usuario);
      return data.data.usuario;
    } else {
      console.error('Error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error de red:', error);
    return null;
  }
};
```

**Ejemplo de Uso (Axios):**
```javascript
import axios from 'axios';

const obtenerPerfil = async (token) => {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.data.usuario;
  } catch (error) {
    console.error('Error:', error.response?.data?.message || error.message);
    throw error;
  }
};
```

**Ejemplo de Uso (React Hook):**
```javascript
import { useState, useEffect } from 'react';

const usePerfil = (token) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setPerfil(data.data.usuario);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPerfil();
    }
  }, [token]);

  return { perfil, loading, error };
};
```

---

### 2. Actualizar Perfil

Actualiza la información personal del usuario. Solo se actualizan los campos que se envían en el body.

**Endpoint:** `PUT /api/auth/update-profile`

**Autenticación:** ✅ Requerida

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```typescript
interface UpdateProfileRequest {
  nombre?: string;        // Opcional, máximo 50 caracteres
  apellido?: string;      // Opcional, máximo 50 caracteres
  telefono?: string;      // Opcional, formato válido de teléfono
  direccion?: {           // Opcional, objeto completo o parcial
    calle?: string;
    ciudad?: string;
    provincia?: string;
    codigoPostal?: string;
    pais?: string;
  };
}
```

**Validaciones:**
- `nombre`: Si se proporciona, debe ser válido (solo letras y espacios, máximo 50 caracteres)
- `apellido`: Si se proporciona, debe ser válido (solo letras y espacios, máximo 50 caracteres)
- `telefono`: Si se proporciona, debe tener formato válido (ej: `+5491123456789`)
- `direccion`: Objeto opcional, puede actualizarse parcialmente

**Ejemplo de Request:**
```json
{
  "nombre": "Juan Carlos",
  "telefono": "+5491123456789",
  "direccion": {
    "calle": "Av. Corrientes 1234",
    "ciudad": "Buenos Aires",
    "provincia": "CABA"
  }
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Carlos",
      "apellido": "Pérez",
      "email": "juan.perez@example.com",
      "telefono": "+5491123456789",
      "direccion": {
        "calle": "Av. Corrientes 1234",
        "ciudad": "Buenos Aires",
        "provincia": "CABA",
        "codigoPostal": null,
        "pais": "Argentina"
      },
      "rol": "empleado",
      "estado": "activo",
      "estadoCuenta": "activo",
      "emailVerificado": true,
      "ultimoAcceso": "2024-01-15T10:30:00.000Z",
      "avatar": null,
      "createdAt": "2024-01-01T08:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**Errores Posibles:**

| Código | Descripción |
|--------|-------------|
| `400` | Error de validación (campos inválidos) |
| `401` | Token inválido o expirado |
| `422` | Errores de validación específicos por campo |

**Ejemplo de Error de Validación (422):**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "nombre",
      "message": "El nombre solo puede contener letras y espacios"
    },
    {
      "field": "telefono",
      "message": "El número de teléfono no es válido"
    }
  ]
}
```

**Ejemplo de Uso (JavaScript/Fetch):**
```javascript
const actualizarPerfil = async (token, datosPerfil) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/update-profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosPerfil)
    });

    const data = await response.json();

    if (data.success) {
      console.log('Perfil actualizado:', data.data.usuario);
      return data.data.usuario;
    } else {
      console.error('Error:', data.message);
      if (data.errors) {
        data.errors.forEach(error => {
          console.error(`${error.field}: ${error.message}`);
        });
      }
      return null;
    }
  } catch (error) {
    console.error('Error de red:', error);
    return null;
  }
};

// Uso:
await actualizarPerfil(token, {
  nombre: 'Juan Carlos',
  telefono: '+5491123456789'
});
```

**Ejemplo de Uso (React con Formulario):**
```javascript
import { useState } from 'react';

const FormularioPerfil = ({ usuario, token, onUpdate }) => {
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    telefono: usuario?.telefono || '',
    direccion: {
      calle: usuario?.direccion?.calle || '',
      ciudad: usuario?.direccion?.ciudad || '',
      provincia: usuario?.direccion?.provincia || '',
      codigoPostal: usuario?.direccion?.codigoPostal || '',
      pais: usuario?.direccion?.pais || 'Argentina'
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('direccion.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        direccion: {
          ...prev.direccion,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onUpdate(data.data.usuario);
        alert('Perfil actualizado exitosamente');
      } else {
        if (data.errors) {
          const errorMap = {};
          data.errors.forEach(error => {
            errorMap[error.field] = error.message;
          });
          setErrors(errorMap);
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      alert('Error al actualizar el perfil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
        {errors.nombre && <span className="error">{errors.nombre}</span>}
      </div>

      <div>
        <label>Apellido:</label>
        <input
          type="text"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
        />
        {errors.apellido && <span className="error">{errors.apellido}</span>}
      </div>

      <div>
        <label>Teléfono:</label>
        <input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="+5491123456789"
        />
        {errors.telefono && <span className="error">{errors.telefono}</span>}
      </div>

      <div>
        <label>Calle:</label>
        <input
          type="text"
          name="direccion.calle"
          value={formData.direccion.calle}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Ciudad:</label>
        <input
          type="text"
          name="direccion.ciudad"
          value={formData.direccion.ciudad}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Provincia:</label>
        <input
          type="text"
          name="direccion.provincia"
          value={formData.direccion.provincia}
          onChange={handleChange}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  );
};
```

---

### 3. Cambiar Contraseña

Permite al usuario cambiar su contraseña actual por una nueva.

**Endpoint:** `PUT /api/auth/change-password`

**Autenticación:** ✅ Requerida

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;  // Requerido - Contraseña actual
  newPassword: string;      // Requerido - Nueva contraseña
}
```

**Validaciones de Contraseña:**
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial: `@$!%*?&`
- La nueva contraseña debe ser diferente a la actual

**Ejemplo de Request:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456@"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores Posibles:**

| Código | Descripción |
|--------|-------------|
| `400` | Error de validación |
| `401` | Contraseña actual incorrecta |
| `401` | Token inválido o expirado |
| `422` | Errores de validación específicos |

**Ejemplo de Error - Contraseña Actual Incorrecta (401):**
```json
{
  "success": false,
  "message": "La contraseña actual es incorrecta"
}
```

**Ejemplo de Error de Validación (422):**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "newPassword",
      "message": "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
    },
    {
      "field": "newPassword",
      "message": "La nueva contraseña debe ser diferente a la actual"
    }
  ]
}
```

**Ejemplo de Uso (JavaScript/Fetch):**
```javascript
const cambiarContraseña = async (token, currentPassword, newPassword) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Contraseña actualizada exitosamente');
      return true;
    } else {
      console.error('Error:', data.message);
      if (data.errors) {
        data.errors.forEach(error => {
          console.error(`${error.field}: ${error.message}`);
        });
      }
      return false;
    }
  } catch (error) {
    console.error('Error de red:', error);
    return false;
  }
};
```

**Ejemplo de Uso (React con Formulario):**
```javascript
import { useState } from 'react';

const FormularioCambioContraseña = ({ token }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else {
      // Validar formato de contraseña
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)';
      }
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        if (data.errors) {
          const errorMap = {};
          data.errors.forEach(error => {
            errorMap[error.field] = error.message;
          });
          setErrors(errorMap);
        } else {
          setErrors({ general: data.message });
        }
      }
    } catch (error) {
      setErrors({ general: 'Error al cambiar la contraseña' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {success && (
        <div className="success">
          Contraseña actualizada exitosamente
        </div>
      )}

      {errors.general && (
        <div className="error">{errors.general}</div>
      )}

      <div>
        <label>Contraseña Actual:</label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
        />
        {errors.currentPassword && (
          <span className="error">{errors.currentPassword}</span>
        )}
      </div>

      <div>
        <label>Nueva Contraseña:</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
        />
        {errors.newPassword && (
          <span className="error">{errors.newPassword}</span>
        )}
      </div>

      <div>
        <label>Confirmar Nueva Contraseña:</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
      </button>
    </form>
  );
};
```

---

## 🔄 Manejo de Tokens Expirados

Si recibes un error `401 Unauthorized`, es probable que tu token haya expirado. Debes:

1. **Intentar refrescar el token** usando el endpoint `/api/auth/refresh-token`
2. **Si el refresh falla**, redirigir al usuario al login

**Ejemplo de Manejo de Token Expirado:**
```javascript
const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('accessToken');
  
  const makeRequest = async (tokenToUse) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${tokenToUse}`,
        'Content-Type': 'application/json'
      }
    });

    // Si el token expiró, intentar refrescar
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const refreshResponse = await fetch('http://localhost:5000/api/auth/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
          });

          const refreshData = await refreshResponse.json();

          if (refreshData.success) {
            // Guardar nuevo token
            localStorage.setItem('accessToken', refreshData.data.accessToken);
            
            // Reintentar la petición original
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${refreshData.data.accessToken}`,
                'Content-Type': 'application/json'
              }
            });
          }
        } catch (error) {
          console.error('Error al refrescar token:', error);
        }
      }
      
      // Si no se pudo refrescar, redirigir al login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    return response;
  };

  return makeRequest(token);
};
```

---

## 📝 Notas Importantes

### Actualización Parcial de Perfil
- Solo se actualizan los campos que se envían en el request
- Los campos no enviados mantienen su valor actual
- Para actualizar `direccion`, puedes enviar solo los campos que quieres cambiar

### Validación de Teléfono
- Formato recomendado: `+5491123456789` (código de país + número)
- El formato debe ser válido según el estándar internacional

### Seguridad de Contraseñas
- La contraseña actual se valida antes de permitir el cambio
- La nueva contraseña debe cumplir con los requisitos de seguridad
- No se puede usar la misma contraseña actual como nueva contraseña

### Manejo de Errores
- Siempre verifica el campo `success` en la respuesta
- Los errores de validación incluyen un array `errors` con detalles por campo
- Los errores de autenticación (401) requieren refrescar el token o re-login

---

## 🚀 Ejemplo Completo de Integración

```javascript
// services/profileService.js
class ProfileService {
  constructor(baseURL, getToken) {
    this.baseURL = baseURL;
    this.getToken = getToken;
  }

  async getProfile() {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener el perfil');
    }

    const data = await response.json();
    return data.data.usuario;
  }

  async updateProfile(profileData) {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/api/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error al actualizar el perfil');
    }

    return data.data.usuario;
  }

  async changePassword(currentPassword, newPassword) {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error al cambiar la contraseña');
    }

    return true;
  }
}

// Uso:
const profileService = new ProfileService(
  'http://localhost:5000',
  () => localStorage.getItem('accessToken')
);

// Obtener perfil
const perfil = await profileService.getProfile();

// Actualizar perfil
await profileService.updateProfile({
  nombre: 'Juan Carlos',
  telefono: '+5491123456789'
});

// Cambiar contraseña
await profileService.changePassword('Password123!', 'NewPassword456@');
```

---

## ✅ Checklist de Implementación

- [ ] Configurar interceptor de Axios/Fetch para agregar token automáticamente
- [ ] Implementar manejo de tokens expirados con refresh token
- [ ] Crear componentes de formulario para actualizar perfil
- [ ] Crear componente de formulario para cambiar contraseña
- [ ] Implementar validación de formularios en el frontend
- [ ] Manejar y mostrar errores de validación del backend
- [ ] Actualizar estado global/context después de actualizar perfil
- [ ] Implementar feedback visual (loading, success, error)
- [ ] Agregar confirmación antes de cambiar contraseña
- [ ] Probar todos los casos de error posibles

---

**Última actualización:** Enero 2024
**Versión de la API:** 1.0.0
