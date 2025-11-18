# 👥 DOCUMENTACIÓN TÉCNICA - MÓDULO DE PACIENTES

## 📑 Índice

1. [Descripción General](#descripción-general)
2. [Flujo de Gestión de Pacientes](#flujo-de-gestión-de-pacientes)
3. [Endpoints Detallados](#endpoints-detallados)
4. [Modelo de Datos](#modelo-de-datos)
5. [Implementación en Frontend](#implementación-en-frontend)
6. [Casos de Uso](#casos-de-uso)
7. [Validaciones y Reglas de Negocio](#validaciones-y-reglas-de-negocio)

---

## 📖 DESCRIPCIÓN GENERAL

El módulo de pacientes gestiona todo el ciclo de vida de los pacientes de la clínica de fisioterapia, desde su registro inicial hasta su alta médica.

### Características Principales

- ✅ Registro completo de datos personales y médicos
- ✅ Gestión de obras sociales y coberturas
- ✅ Historial médico y antecedentes
- ✅ Búsqueda y filtrado avanzado
- ✅ Estadísticas por paciente
- ✅ Control de pagos y valores de sesión
- ✅ Alta médica de pacientes
- ✅ Soft delete (eliminación lógica)

### Base URL

```
http://localhost:PUERTO/api/pacientes
```

### Autenticación Requerida

**Todos los endpoints requieren autenticación**

```
Authorization: Bearer {accessToken}
```

### Roles Permitidos

- **usuario**: Lectura y escritura completa
- **empleado**: Lectura y escritura completa
- **administrador**: Acceso total incluido eliminación

---

## 🔄 FLUJO DE GESTIÓN DE PACIENTES

### Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────┐
│            FLUJO DE CREACIÓN DE PACIENTE                │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend                    Base de Datos
   │                           │                            │
   ├─→ Usuario completa        │                            │
   │   formulario de           │                            │
   │   nuevo paciente          │                            │
   │                           │                            │
   ├─→ POST /pacientes        │                            │
   │   Header: Bearer token    │                            │
   │   Body: datos paciente    │                            │
   │                           │                            │
   │                           ├─→ Verificar autenticación │
   │                           │                            │
   │                           ├─→ Validar datos           │
   │                           │   - DNI único             │
   │                           │   - Campos obligatorios   │
   │                           │   - Formatos válidos      │
   │                           │                            │
   │                           ├─→ Calcular edad           │
   │                           │   (si hay fecha nac.)     │
   │                           │                            │
   │                           ├───────────────────────────→│
   │                           │   Guardar paciente         │
   │                           │   - creadoPor: userId      │
   │                           │   - estado: activo         │
   │                           │   - estadísticas: 0        │
   │                           │                            │
   │   ←── 201 Created ────────┤←──────────────────────────┤
   │   {paciente creado}       │                            │
   │                           │                            │
   ├─→ Redirigir a ficha      │                            │
   │   del paciente            │                            │
   │                           │                            │


┌─────────────────────────────────────────────────────────┐
│              FLUJO DE BÚSQUEDA DE PACIENTES             │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend
   │                           │
   ├─→ Usuario escribe en     │
   │   campo de búsqueda       │
   │   "María"                 │
   │                           │
   │   (Debounce 500ms)        │
   │                           │
   ├─→ GET /pacientes/buscar? │
   │   q=María&limit=10        │
   │                           │
   │                           ├─→ Buscar en:
   │                           │   - nombre
   │                           │   - apellido
   │                           │   - DNI
   │                           │   - email
   │                           │
   │                           ├─→ Regex case-insensitive
   │                           │
   │   ←── 200 OK ─────────────┤
   │   [lista pacientes]       │
   │                           │
   ├─→ Mostrar resultados     │
   │   en dropdown             │
   │                           │


┌─────────────────────────────────────────────────────────┐
│         FLUJO DE ACTUALIZACIÓN DE PACIENTE              │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend                    Base de Datos
   │                           │                            │
   ├─→ GET /pacientes/:id     │                            │
   │   (cargar datos)          │                            │
   │                           │                            │
   │   ←── 200 OK ─────────────┤                            │
   │   {datos paciente}        │                            │
   │                           │                            │
   ├─→ Usuario modifica       │                            │
   │   campos del formulario   │                            │
   │                           │                            │
   ├─→ PUT /pacientes/:id     │                            │
   │   Body: datos modificados │                            │
   │                           │                            │
   │                           ├─→ Verificar paciente      │
   │                           │   existe                   │
   │                           │                            │
   │                           ├─→ Validar datos           │
   │                           │                            │
   │                           ├─→ Verificar DNI único     │
   │                           │   (si cambió)             │
   │                           │                            │
   │                           ├───────────────────────────→│
   │                           │   Actualizar paciente      │
   │                           │   - modificadoPor: userId  │
   │                           │   - updatedAt: now()       │
   │                           │                            │
   │   ←── 200 OK ─────────────┤←──────────────────────────┤
   │   {paciente actualizado}  │                            │
   │                           │                            │
   ├─→ Mostrar confirmación   │                            │
   │                           │                            │


┌─────────────────────────────────────────────────────────┐
│              FLUJO DE ALTA MÉDICA                       │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend                    Base de Datos
   │                           │                            │
   ├─→ Usuario selecciona     │                            │
   │   "Dar de Alta"           │                            │
   │                           │                            │
   ├─→ Modal de confirmación  │                            │
   │   - Motivo de alta        │                            │
   │   - Observaciones         │                            │
   │                           │                            │
   ├─→ PUT /pacientes/:id/alta│                            │
   │   Body: {motivoAlta,      │                            │
   │          observaciones}   │                            │
   │                           │                            │
   │                           ├─→ Verificar paciente      │
   │                           │   activo                   │
   │                           │                            │
   │                           ├───────────────────────────→│
   │                           │   Actualizar:              │
   │                           │   - estado: "alta"         │
   │                           │   - fechaAltaMedica: now() │
   │                           │                            │
   │   ←── 200 OK ─────────────┤←──────────────────────────┤
   │   {paciente con alta}     │                            │
   │                           │                            │
   ├─→ Notificación éxito     │                            │
   │   "Alta médica registrada"│                            │
   │                           │                            │
```

---

## 📍 ENDPOINTS DETALLADOS

### 1️⃣ CREAR PACIENTE

**POST** `/api/pacientes`

#### Descripción
Crea un nuevo paciente en el sistema con toda su información personal y médica.

#### Headers
```json
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

#### Body (JSON)

**Campos Obligatorios:**
```json
{
  "nombre": "María",
  "apellido": "González",
  "dni": "35123456",
  "telefono": "3815551234"
}
```

**Body Completo (todos los campos):**
```json
{
  // Datos Personales (obligatorios)
  "nombre": "María",
  "apellido": "González",
  "dni": "35123456",
  "telefono": "3815551234",
  
  // Datos Personales (opcionales)
  "fechaNacimiento": "1990-05-15",
  "genero": "femenino",
  "telefonoAlternativo": "3815559876",
  "email": "maria.gonzalez@example.com",
  
  // Dirección
  "direccion": {
    "calle": "San Martín",
    "numero": "456",
    "barrio": "Centro",
    "ciudad": "San Miguel de Tucumán",
    "provincia": "Tucumán",
    "codigoPostal": "4000",
    "referencia": "Entre Maipú y Muñecas"
  },
  
  // Obra Social
  "obraSocial": {
    "nombre": "OSDE",
    "numeroAfiliado": "1234567890",
    "plan": "310",
    "vigenciaDesde": "2025-01-01",
    "vigenciaHasta": "2025-12-31"
  },
  
  // Información Médica
  "diagnostico": {
    "principal": "Lumbalgia crónica",
    "secundarios": ["Contractura muscular", "Escoliosis leve"],
    "observaciones": "Dolor persistente desde hace 6 meses"
  },
  
  // Médico Derivante
  "medicoDerivante": {
    "nombre": "Dr. Roberto Fernández",
    "matricula": "MP 12345",
    "telefono": "3815554321",
    "especialidad": "Traumatología"
  },
  
  // Antecedentes
  "antecedentes": {
    "patologicos": "Hipertensión arterial controlada",
    "quirurgicos": "Apendicectomía 2015",
    "alergias": "Ninguna conocida",
    "medicacion": "Losartán 50mg"
  },
  
  // Contacto de Emergencia
  "contactoEmergencia": {
    "nombre": "Pedro González",
    "relacion": "Esposo",
    "telefono": "3815552222"
  },
  
  // Información de Pagos
  "modalidadPago": "obra_social",
  "valorSesion": 8000,
  
  // Horarios Habituales (opcional)
  "horariosHabituales": [
    {
      "dia": "lunes",
      "horaEntrada": "09:00",
      "horaSalida": "10:00"
    },
    {
      "dia": "miércoles",
      "horaEntrada": "15:00",
      "horaSalida": "16:00"
    }
  ],
  
  // Observaciones Generales
  "observaciones": "Prefiere turno por la mañana. Trabaja en banco."
}
```

#### Validaciones

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| nombre | String | ✅ Sí | 2-50 caracteres |
| apellido | String | ✅ Sí | 2-50 caracteres |
| dni | String | ✅ Sí | 7-8 dígitos, único |
| telefono | String | ✅ Sí | Formato válido |
| fechaNacimiento | Date | ❌ No | Fecha válida |
| genero | String | ❌ No | masculino, femenino, otro, no_especifica |
| email | String | ❌ No | Formato email válido |
| valorSesion | Number | ❌ No | >= 0 |
| modalidadPago | String | ❌ No | efectivo, transferencia, tarjeta, obra_social, mixto |

#### Respuesta Exitosa (201 Created)
```json
{
  "success": true,
  "message": "Paciente creado exitosamente",
  "data": {
    "paciente": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "nombreCompleto": "González, María",
      "nombre": "María",
      "apellido": "González",
      "dni": "35123456",
      "fechaNacimiento": "1990-05-15T00:00:00.000Z",
      "edad": 35,
      "edadCalculada": 35,
      "genero": "femenino",
      "telefono": "3815551234",
      "telefonoAlternativo": "3815559876",
      "email": "maria.gonzalez@example.com",
      "direccion": {
        "calle": "San Martín",
        "numero": "456",
        "barrio": "Centro",
        "ciudad": "San Miguel de Tucumán",
        "provincia": "Tucumán",
        "codigoPostal": "4000"
      },
      "obraSocial": {
        "nombre": "OSDE",
        "numeroAfiliado": "1234567890",
        "plan": "310",
        "vigenciaDesde": "2025-01-01T00:00:00.000Z",
        "vigenciaHasta": "2025-12-31T00:00:00.000Z"
      },
      "diagnostico": {
        "principal": "Lumbalgia crónica",
        "secundarios": ["Contractura muscular", "Escoliosis leve"],
        "observaciones": "Dolor persistente desde hace 6 meses"
      },
      "estado": "activo",
      "modalidadPago": "obra_social",
      "valorSesion": 8000,
      "estadisticas": {
        "totalSesiones": 0,
        "totalAbonado": 0,
        "saldoPendiente": 0,
        "ultimaSesion": null
      },
      "fechaAlta": "2025-11-17T10:00:00.000Z",
      "createdAt": "2025-11-17T10:00:00.000Z",
      "updatedAt": "2025-11-17T10:00:00.000Z"
    }
  }
}
```

#### Errores Posibles

**422 Unprocessable Entity**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "dni",
      "message": "El DNI debe tener 7 u 8 dígitos numéricos"
    },
    {
      "field": "telefono",
      "message": "El teléfono es obligatorio"
    }
  ]
}
```

**409 Conflict - DNI duplicado**
```json
{
  "success": false,
  "message": "Ya existe un paciente con ese DNI"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

---

### 2️⃣ OBTENER TODOS LOS PACIENTES (CON PAGINACIÓN Y FILTROS)

**GET** `/api/pacientes`

#### Descripción
Obtiene una lista paginada de pacientes con opciones de filtrado y ordenamiento.

#### Query Parameters

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| page | Number | Página actual (default: 1) | `page=2` |
| limit | Number | Resultados por página (default: 10) | `limit=20` |
| sortBy | String | Campo para ordenar | `sortBy=apellido` |
| estado | String | Filtrar por estado | `estado=activo` |
| obraSocial | String | Filtrar por obra social | `obraSocial=OSDE` |
| busqueda | String | Búsqueda en nombre, apellido, DNI | `busqueda=maria` |

#### Ejemplos de URLs

```
# Obtener primera página con 10 pacientes
GET /api/pacientes

# Obtener página 2 con 20 pacientes
GET /api/pacientes?page=2&limit=20

# Filtrar solo pacientes activos
GET /api/pacientes?estado=activo

# Buscar por nombre
GET /api/pacientes?busqueda=maria

# Filtrar por obra social
GET /api/pacientes?obraSocial=OSDE

# Combinación de filtros
GET /api/pacientes?page=1&limit=10&estado=activo&obraSocial=OSDE&sortBy=apellido
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Pacientes obtenidos exitosamente",
  "data": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "nombreCompleto": "González, María",
      "nombre": "María",
      "apellido": "González",
      "dni": "35123456",
      "telefono": "3815551234",
      "email": "maria.gonzalez@example.com",
      "obraSocial": {
        "nombre": "OSDE",
        "numeroAfiliado": "1234567890"
      },
      "diagnostico": {
        "principal": "Lumbalgia crónica"
      },
      "estado": "activo",
      "valorSesion": 8000,
      "estadisticas": {
        "totalSesiones": 15,
        "totalAbonado": 120000,
        "saldoPendiente": 8000,
        "ultimaSesion": "2025-11-15T09:00:00.000Z"
      },
      "fechaAlta": "2025-10-01T08:00:00.000Z",
      "createdAt": "2025-10-01T08:00:00.000Z",
      "updatedAt": "2025-11-15T09:30:00.000Z"
    },
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "nombreCompleto": "Rodríguez, Carlos",
      "nombre": "Carlos",
      "apellido": "Rodríguez",
      "dni": "28456789",
      "telefono": "3815553333",
      "obraSocial": {
        "nombre": "Particular"
      },
      "estado": "activo",
      "estadisticas": {
        "totalSesiones": 8,
        "totalAbonado": 64000,
        "saldoPendiente": 0,
        "ultimaSesion": "2025-11-16T10:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 125,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3️⃣ BUSCAR PACIENTES (BÚSQUEDA RÁPIDA)

**GET** `/api/pacientes/buscar`

#### Descripción
Búsqueda rápida de pacientes por nombre, apellido o DNI. Ideal para autocompletado.

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| q | String | ✅ Sí | Término de búsqueda |
| limit | Number | ❌ No | Límite de resultados (default: 10) |

#### Ejemplos
```
GET /api/pacientes/buscar?q=maria
GET /api/pacientes/buscar?q=35123456
GET /api/pacientes/buscar?q=gonzalez&limit=5
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Búsqueda realizada exitosamente",
  "data": {
    "pacientes": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "nombreCompleto": "González, María",
        "dni": "35123456",
        "telefono": "3815551234",
        "obraSocial": {
          "nombre": "OSDE"
        },
        "estado": "activo"
      },
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j5",
        "nombreCompleto": "Martínez, María Laura",
        "dni": "40789456",
        "telefono": "3815554444",
        "obraSocial": {
          "nombre": "Swiss Medical"
        },
        "estado": "activo"
      }
    ]
  }
}
```

#### Errores Posibles

**400 Bad Request**
```json
{
  "success": false,
  "message": "Debe proporcionar un término de búsqueda"
}
```

---

### 4️⃣ OBTENER PACIENTE POR ID

**GET** `/api/pacientes/:id`

#### Descripción
Obtiene la ficha completa de un paciente específico con todos sus datos.

#### Parámetros de URL
- **:id** - ID del paciente (MongoDB ObjectId)

#### Ejemplo
```
GET /api/pacientes/65f1a2b3c4d5e6f7g8h9i0j2
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Paciente obtenido exitosamente",
  "data": {
    "paciente": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "nombreCompleto": "González, María",
      "nombre": "María",
      "apellido": "González",
      "dni": "35123456",
      "fechaNacimiento": "1990-05-15T00:00:00.000Z",
      "edad": 35,
      "edadCalculada": 35,
      "genero": "femenino",
      "telefono": "3815551234",
      "telefonoAlternativo": "3815559876",
      "email": "maria.gonzalez@example.com",
      "direccion": {
        "calle": "San Martín",
        "numero": "456",
        "barrio": "Centro",
        "ciudad": "San Miguel de Tucumán",
        "provincia": "Tucumán",
        "codigoPostal": "4000",
        "referencia": "Entre Maipú y Muñecas"
      },
      "obraSocial": {
        "nombre": "OSDE",
        "numeroAfiliado": "1234567890",
        "plan": "310",
        "vigenciaDesde": "2025-01-01T00:00:00.000Z",
        "vigenciaHasta": "2025-12-31T00:00:00.000Z"
      },
      "diagnostico": {
        "principal": "Lumbalgia crónica",
        "secundarios": ["Contractura muscular", "Escoliosis leve"],
        "observaciones": "Dolor persistente desde hace 6 meses"
      },
      "medicoDerivante": {
        "nombre": "Dr. Roberto Fernández",
        "matricula": "MP 12345",
        "telefono": "3815554321",
        "especialidad": "Traumatología"
      },
      "antecedentes": {
        "patologicos": "Hipertensión arterial controlada",
        "quirurgicos": "Apendicectomía 2015",
        "alergias": "Ninguna conocida",
        "medicacion": "Losartán 50mg"
      },
      "contactoEmergencia": {
        "nombre": "Pedro González",
        "relacion": "Esposo",
        "telefono": "3815552222"
      },
      "estado": "activo",
      "modalidadPago": "obra_social",
      "valorSesion": 8000,
      "horariosHabituales": [
        {
          "dia": "lunes",
          "horaEntrada": "09:00",
          "horaSalida": "10:00"
        }
      ],
      "estadisticas": {
        "totalSesiones": 15,
        "totalAbonado": 120000,
        "saldoPendiente": 8000,
        "ultimaSesion": "2025-11-15T09:00:00.000Z"
      },
      "observaciones": "Prefiere turno por la mañana",
      "documentos": [],
      "fotos": [],
      "creadoPor": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "fechaAlta": "2025-10-01T08:00:00.000Z",
      "fechaAltaMedica": null,
      "createdAt": "2025-10-01T08:00:00.000Z",
      "updatedAt": "2025-11-15T09:30:00.000Z"
    }
  }
}
```

#### Errores Posibles

**404 Not Found**
```json
{
  "success": false,
  "message": "Paciente no encontrado"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "message": "ID de paciente inválido"
}
```

---

### 5️⃣ ACTUALIZAR PACIENTE

**PUT** `/api/pacientes/:id`

#### Descripción
Actualiza los datos de un paciente existente. Solo envía los campos que quieras modificar.

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
  "telefono": "3815551111",
  "email": "nuevo.email@example.com",
  "obraSocial": {
    "nombre": "Swiss Medical",
    "numeroAfiliado": "9876543210",
    "plan": "SMG10",
    "vigenciaDesde": "2025-11-01",
    "vigenciaHasta": "2026-10-31"
  },
  "valorSesion": 9000,
  "observaciones": "Actualizó su obra social en noviembre 2025"
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Paciente actualizado exitosamente",
  "data": {
    "paciente": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "nombreCompleto": "González, María",
      "telefono": "3815551111",
      "email": "nuevo.email@example.com",
      "obraSocial": {
        "nombre": "Swiss Medical",
        "numeroAfiliado": "9876543210",
        "plan": "SMG10"
      },
      "valorSesion": 9000,
      "modificadoPor": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "nombre": "Juan Pérez"
      },
      "updatedAt": "2025-11-17T11:00:00.000Z"
    }
  }
}
```

#### Errores Posibles

**404 Not Found**
```json
{
  "success": false,
  "message": "Paciente no encontrado"
}
```

**409 Conflict - DNI duplicado (si se intenta cambiar el DNI)**
```json
{
  "success": false,
  "message": "Ya existe un paciente con ese DNI"
}
```

**422 Unprocessable Entity**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "email",
      "message": "El email no es válido"
    }
  ]
}
```

---

### 6️⃣ ELIMINAR PACIENTE (SOFT DELETE)

**DELETE** `/api/pacientes/:id`

#### Descripción
Elimina lógicamente un paciente (soft delete). El registro permanece en la base de datos pero marcado como eliminado.

⚠️ **Solo permitido para rol ADMINISTRADOR**

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
  "message": "Paciente eliminado exitosamente"
}
```

#### Errores Posibles

**403 Forbidden - Sin permisos**
```json
{
  "success": false,
  "message": "El rol 'empleado' no tiene permisos para acceder a este recurso"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Paciente no encontrado"
}
```

---

### 7️⃣ DAR ALTA MÉDICA

**PUT** `/api/pacientes/:id/alta`

#### Descripción
Registra el alta médica de un paciente, indicando que ha completado su tratamiento.

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
  "motivoAlta": "Tratamiento completado satisfactoriamente",
  "observaciones": "El paciente ha recuperado completamente su movilidad. Se recomienda ejercicios de mantenimiento."
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Alta médica registrada exitosamente",
  "data": {
    "paciente": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "nombreCompleto": "González, María",
      "estado": "alta",
      "fechaAltaMedica": "2025-11-17T11:30:00.000Z",
      "observaciones": "Tratamiento completado satisfactoriamente. El paciente ha recuperado completamente su movilidad."
    }
  }
}
```

#### Errores Posibles

**404 Not Found**
```json
{
  "success": false,
  "message": "Paciente no encontrado"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "message": "El paciente ya tiene alta médica"
}
```

---

### 8️⃣ OBTENER ESTADÍSTICAS DE PACIENTES

**GET** `/api/pacientes/estadisticas/resumen`

#### Descripción
Obtiene estadísticas generales del módulo de pacientes.

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
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "estadisticas": {
      "totalPacientes": 125,
      "pacientesActivos": 98,
      "pacientesInactivos": 15,
      "pacientesAlta": 12,
      "pacientesDerivados": 0,
      "nuevosEsteMes": 8,
      "nuevosEsteAno": 45,
      "porObraSocial": [
        {
          "_id": "OSDE",
          "nombre": "OSDE",
          "cantidad": 45,
          "porcentaje": 36
        },
        {
          "_id": "Swiss Medical",
          "nombre": "Swiss Medical",
          "cantidad": 30,
          "porcentaje": 24
        },
        {
          "_id": "Particular",
          "nombre": "Particular",
          "cantidad": 25,
          "porcentaje": 20
        },
        {
          "_id": "OSECAC",
          "nombre": "OSECAC",
          "cantidad": 25,
          "porcentaje": 20
        }
      ],
      "porGenero": [
        { "genero": "femenino", "cantidad": 75 },
        { "genero": "masculino", "cantidad": 45 },
        { "genero": "otro", "cantidad": 5 }
      ],
      "porModalidadPago": [
        { "modalidad": "obra_social", "cantidad": 80 },
        { "modalidad": "efectivo", "cantidad": 30 },
        { "modalidad": "transferencia", "cantidad": 15 }
      ],
      "promedioSesionesPorPaciente": 18.5,
      "promedioEdad": 42,
      "totalRecaudado": 2250000,
      "saldosPendientes": 145000,
      "valorPromedioSesion": 8500
    }
  }
}
```

---

## 📊 MODELO DE DATOS

### Estructura Completa del Paciente

```javascript
{
  // ID
  "_id": ObjectId,
  
  // Datos Personales
  "nombre": String (required, 2-50 chars),
  "apellido": String (required, 2-50 chars),
  "dni": String (required, unique, 7-8 dígitos),
  "fechaNacimiento": Date,
  "edad": Number (0-120),
  "genero": String (masculino|femenino|otro|no_especifica),
  
  // Contacto
  "telefono": String (required),
  "telefonoAlternativo": String,
  "email": String (formato email válido),
  
  // Dirección
  "direccion": {
    "calle": String,
    "numero": String,
    "barrio": String,
    "ciudad": String (default: "San Miguel de Tucumán"),
    "provincia": String (default: "Tucumán"),
    "codigoPostal": String,
    "referencia": String
  },
  
  // Obra Social
  "obraSocial": {
    "nombre": String (default: "Particular"),
    "numeroAfiliado": String,
    "plan": String,
    "vigenciaDesde": Date,
    "vigenciaHasta": Date
  },
  
  // Información Médica
  "diagnostico": {
    "principal": String,
    "secundarios": [String],
    "observaciones": String
  },
  
  // Médico Derivante
  "medicoDerivante": {
    "nombre": String,
    "matricula": String,
    "telefono": String,
    "especialidad": String
  },
  
  // Antecedentes
  "antecedentes": {
    "patologicos": String,
    "quirurgicos": String,
    "alergias": String,
    "medicacion": String
  },
  
  // Contacto de Emergencia
  "contactoEmergencia": {
    "nombre": String,
    "relacion": String,
    "telefono": String
  },
  
  // Estado del Paciente
  "estado": String (activo|inactivo|alta|derivado|abandono),
  
  // Información de Pagos
  "modalidadPago": String (efectivo|transferencia|tarjeta|obra_social|mixto),
  "valorSesion": Number (>= 0),
  
  // Horarios Habituales
  "horariosHabituales": [{
    "dia": String (lunes|martes|...),
    "horaEntrada": String (HH:MM),
    "horaSalida": String (HH:MM)
  }],
  
  // Observaciones
  "observaciones": String (max 1000 chars),
  
  // Documentación
  "documentos": [{
    "tipo": String (orden_medica|estudio|consentimiento|otro),
    "nombre": String,
    "url": String,
    "fecha": Date
  }],
  
  // Fotos
  "fotos": [{
    "descripcion": String,
    "url": String,
    "fecha": Date
  }],
  
  // Metadata del Sistema
  "creadoPor": ObjectId (ref: User, required),
  "modificadoPor": ObjectId (ref: User),
  "fechaAlta": Date (default: now),
  "fechaAltaMedica": Date,
  
  // Estadísticas Automáticas
  "estadisticas": {
    "totalSesiones": Number (default: 0),
    "totalAbonado": Number (default: 0),
    "saldoPendiente": Number (default: 0),
    "ultimaSesion": Date
  },
  
  // Timestamps Automáticos
  "createdAt": Date,
  "updatedAt": Date
}
```

### Virtuals (Campos Calculados)

```javascript
// nombreCompleto
"Apellido, Nombre"

// edadCalculada
// Calculada automáticamente desde fechaNacimiento
```

---

## 💻 IMPLEMENTACIÓN EN FRONTEND

### 1. Servicio de Pacientes (pacienteService.js)

```javascript
import api from './axiosConfig'; // Axios configurado con interceptores

class PacienteService {
  // Crear paciente
  async crearPaciente(dataPaciente) {
    try {
      const response = await api.post('/pacientes', dataPaciente);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Obtener todos los pacientes con filtros
  async obtenerPacientes(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.sortBy) params.append('sortBy', filtros.sortBy);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.obraSocial) params.append('obraSocial', filtros.obraSocial);
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      
      const response = await api.get(`/pacientes?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Búsqueda rápida
  async buscarPacientes(termino, limit = 10) {
    try {
      const response = await api.get(`/pacientes/buscar?q=${termino}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Obtener paciente por ID
  async obtenerPacientePorId(id) {
    try {
      const response = await api.get(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Actualizar paciente
  async actualizarPaciente(id, datosActualizados) {
    try {
      const response = await api.put(`/pacientes/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Eliminar paciente
  async eliminarPaciente(id) {
    try {
      const response = await api.delete(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Dar alta médica
  async darAltaMedica(id, datosAlta) {
    try {
      const response = await api.put(`/pacientes/${id}/alta`, datosAlta);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas() {
    try {
      const response = await api.get('/pacientes/estadisticas/resumen');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}

export default new PacienteService();
```

---

### 2. Hook de React para Pacientes

```javascript
// usePacientes.js
import { useState, useEffect } from 'react';
import PacienteService from '../services/pacienteService';

export const usePacientes = (filtrosIniciales = {}) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 10,
    ...filtrosIniciales
  });

  useEffect(() => {
    fetchPacientes();
  }, [filtros]);

  const fetchPacientes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await PacienteService.obtenerPacientes(filtros);
      setPacientes(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(prev => ({
      ...prev,
      ...nuevosFiltros,
      page: 1 // Reset página al cambiar filtros
    }));
  };

  const cambiarPagina = (nuevaPagina) => {
    setFiltros(prev => ({ ...prev, page: nuevaPagina }));
  };

  const refrescar = () => {
    fetchPacientes();
  };

  return {
    pacientes,
    loading,
    error,
    pagination,
    filtros,
    actualizarFiltros,
    cambiarPagina,
    refrescar
  };
};

// usePaciente.js (singular - para un paciente específico)
export const usePaciente = (id) => {
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPaciente();
    }
  }, [id]);

  const fetchPaciente = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await PacienteService.obtenerPacientePorId(id);
      setPaciente(response.data.paciente);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizar = async (datos) => {
    try {
      const response = await PacienteService.actualizarPaciente(id, datos);
      setPaciente(response.data.paciente);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const refrescar = () => {
    fetchPaciente();
  };

  return {
    paciente,
    loading,
    error,
    actualizar,
    refrescar
  };
};
```

---

### 3. Componente de Lista de Pacientes

```javascript
// PacientesList.jsx
import React, { useState } from 'react';
import { usePacientes } from '../hooks/usePacientes';
import { useNavigate } from 'react-router-dom';

const PacientesList = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  
  const {
    pacientes,
    loading,
    error,
    pagination,
    actualizarFiltros,
    cambiarPagina
  } = usePacientes();

  const handleBuscar = (e) => {
    const termino = e.target.value;
    setBusqueda(termino);
    
    // Debounce
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      actualizarFiltros({ busqueda: termino });
    }, 500);
  };

  const handleFiltroEstado = (estado) => {
    setEstadoFiltro(estado);
    actualizarFiltros({ estado });
  };

  if (loading) return <div>Cargando pacientes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="pacientes-container">
      <div className="header">
        <h1>Pacientes</h1>
        <button onClick={() => navigate('/pacientes/nuevo')}>
          Nuevo Paciente
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={busqueda}
          onChange={handleBuscar}
        />
        
        <select 
          value={estadoFiltro} 
          onChange={(e) => handleFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="alta">Con Alta</option>
        </select>
      </div>

      {/* Tabla */}
      <table className="pacientes-table">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Obra Social</th>
            <th>Estado</th>
            <th>Total Sesiones</th>
            <th>Saldo Pendiente</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((paciente) => (
            <tr key={paciente.id}>
              <td>{paciente.nombreCompleto}</td>
              <td>{paciente.dni}</td>
              <td>{paciente.telefono}</td>
              <td>{paciente.obraSocial?.nombre}</td>
              <td>
                <span className={`badge ${paciente.estado}`}>
                  {paciente.estado}
                </span>
              </td>
              <td>{paciente.estadisticas.totalSesiones}</td>
              <td>${paciente.estadisticas.saldoPendiente}</td>
              <td>
                <button onClick={() => navigate(`/pacientes/${paciente.id}`)}>
                  Ver
                </button>
                <button onClick={() => navigate(`/pacientes/${paciente.id}/editar`)}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {pagination && (
        <div className="pagination">
          <button 
            disabled={!pagination.hasPrevPage}
            onClick={() => cambiarPagina(pagination.page - 1)}
          >
            Anterior
          </button>
          
          <span>
            Página {pagination.page} de {pagination.totalPages}
          </span>
          
          <button 
            disabled={!pagination.hasNextPage}
            onClick={() => cambiarPagina(pagination.page + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default PacientesList;
```

---

### 4. Componente de Formulario de Paciente

```javascript
// PacienteForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PacienteService from '../services/pacienteService';

const PacienteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Si existe, es edición
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    fechaNacimiento: '',
    genero: 'no_especifica',
    obraSocial: {
      nombre: 'Particular',
      numeroAfiliado: '',
      plan: ''
    },
    diagnostico: {
      principal: '',
      secundarios: [],
      observaciones: ''
    },
    valorSesion: 0,
    modalidadPago: 'efectivo',
    observaciones: ''
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      cargarPaciente();
    }
  }, [id]);

  const cargarPaciente = async () => {
    try {
      const response = await PacienteService.obtenerPacientePorId(id);
      setFormData(response.data.paciente);
    } catch (error) {
      alert('Error al cargar paciente');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Manejo de campos anidados
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      if (isEdit) {
        await PacienteService.actualizarPaciente(id, formData);
        alert('Paciente actualizado exitosamente');
      } else {
        const response = await PacienteService.crearPaciente(formData);
        alert('Paciente creado exitosamente');
        navigate(`/pacientes/${response.data.paciente.id}`);
      }
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="paciente-form">
      <h2>{isEdit ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((err, idx) => (
            <div key={idx} className="error">
              {err.field}: {err.message}
            </div>
          ))}
        </div>
      )}

      {/* Datos Personales */}
      <section>
        <h3>Datos Personales</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Apellido *</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>DNI *</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              pattern="[0-9]{7,8}"
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Género</label>
          <select name="genero" value={formData.genero} onChange={handleChange}>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
            <option value="no_especifica">No especifica</option>
          </select>
        </div>
      </section>

      {/* Obra Social */}
      <section>
        <h3>Obra Social</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Obra Social</label>
            <input
              type="text"
              name="obraSocial.nombre"
              value={formData.obraSocial.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Número de Afiliado</label>
            <input
              type="text"
              name="obraSocial.numeroAfiliado"
              value={formData.obraSocial.numeroAfiliado}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Plan</label>
          <input
            type="text"
            name="obraSocial.plan"
            value={formData.obraSocial.plan}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Diagnóstico */}
      <section>
        <h3>Diagnóstico</h3>
        
        <div className="form-group">
          <label>Diagnóstico Principal</label>
          <input
            type="text"
            name="diagnostico.principal"
            value={formData.diagnostico.principal}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Observaciones</label>
          <textarea
            name="diagnostico.observaciones"
            value={formData.diagnostico.observaciones}
            onChange={handleChange}
            rows="4"
          />
        </div>
      </section>

      {/* Información de Pago */}
      <section>
        <h3>Información de Pago</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Valor de Sesión</label>
            <input
              type="number"
              name="valorSesion"
              value={formData.valorSesion}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Modalidad de Pago</label>
            <select 
              name="modalidadPago" 
              value={formData.modalidadPago} 
              onChange={handleChange}
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="obra_social">Obra Social</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>
        </div>
      </section>

      {/* Observaciones */}
      <section>
        <div className="form-group">
          <label>Observaciones Generales</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows="4"
            maxLength="1000"
          />
        </div>
      </section>

      {/* Botones */}
      <div className="form-actions">
        <button type="button" onClick={() => navigate(-1)}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Paciente')}
        </button>
      </div>
    </form>
  );
};

export default PacienteForm;
```

---

## 🔍 VALIDACIONES Y REGLAS DE NEGOCIO

### Validaciones en Frontend

```javascript
// validaciones.js
export const validarPaciente = (datos) => {
  const errores = [];

  // DNI
  if (!/^\d{7,8}$/.test(datos.dni)) {
    errores.push({
      field: 'dni',
      message: 'El DNI debe tener 7 u 8 dígitos numéricos'
    });
  }

  // Email (si se proporciona)
  if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.push({
      field: 'email',
      message: 'El email no es válido'
    });
  }

  // Teléfono
  if (!datos.telefono || datos.telefono.trim() === '') {
    errores.push({
      field: 'telefono',
      message: 'El teléfono es obligatorio'
    });
  }

  // Nombre y apellido
  if (!datos.nombre || datos.nombre.length < 2) {
    errores.push({
      field: 'nombre',
      message: 'El nombre debe tener al menos 2 caracteres'
    });
  }

  if (!datos.apellido || datos.apellido.length < 2) {
    errores.push({
      field: 'apellido',
      message: 'El apellido debe tener al menos 2 caracteres'
    });
  }

  return errores;
};
```

### Reglas de Negocio

1. **DNI Único**: El DNI debe ser único en el sistema. No pueden existir dos pacientes con el mismo DNI.

2. **Estados de Paciente**:
   - `activo`: Paciente en tratamiento actual
   - `inactivo`: Paciente que no asiste temporalmente
   - `alta`: Paciente que completó tratamiento
   - `derivado`: Paciente derivado a otro profesional
   - `abandono`: Paciente que abandonó el tratamiento

3. **Estadísticas Automáticas**: 
   - Se actualizan automáticamente cuando se registran sesiones
   - No deben modificarse manualmente

4. **Edad**: 
   - Se calcula automáticamente desde `fechaNacimiento`
   - Si no hay `fechaNacimiento`, se puede ingresar edad manualmente

5. **Eliminación**: 
   - Solo admins pueden eliminar
   - Es soft delete (no se borra de la BD)

---

## 📋 CHECKLIST DE INTEGRACIÓN

- [ ] Implementar servicio de pacientes
- [ ] Crear hooks personalizados
- [ ] Implementar lista de pacientes con paginación
- [ ] Implementar búsqueda con debounce
- [ ] Crear formulario de nuevo paciente
- [ ] Crear formulario de edición
- [ ] Implementar vista de detalle
- [ ] Implementar filtros por estado y obra social
- [ ] Implementar funcionalidad de alta médica
- [ ] Mostrar estadísticas del paciente
- [ ] Validaciones de formulario
- [ ] Manejo de errores
- [ ] Estados de carga
- [ ] Confirmaciones de acciones
- [ ] Testing de todos los flujos

---

**Última actualización:** Noviembre 2025  
**Versión del documento:** 1.0.0

