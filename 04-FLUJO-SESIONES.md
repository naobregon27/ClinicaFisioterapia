# 📅 DOCUMENTACIÓN TÉCNICA - MÓDULO DE SESIONES

## 📑 Índice

1. [Descripción General](#descripción-general)
2. [Flujo de Gestión de Sesiones](#flujo-de-gestión-de-sesiones)
3. [Endpoints Detallados](#endpoints-detallados)
4. [Modelo de Datos](#modelo-de-datos)
5. [Implementación en Frontend](#implementación-en-frontend)
6. [Casos de Uso Especiales](#casos-de-uso-especiales)
7. [Planilla Diaria](#planilla-diaria)
8. [Gestión de Pagos](#gestión-de-pagos)

---

## 📖 DESCRIPCIÓN GENERAL

El módulo de sesiones gestiona todo el registro y seguimiento de las sesiones de fisioterapia, incluyendo tratamientos, evolución del paciente, pagos y estadísticas.

### Características Principales

- ✅ Registro completo de sesiones de fisioterapia
- ✅ Seguimiento de tratamiento y evolución
- ✅ Planilla diaria de movimientos
- ✅ Historial completo por paciente
- ✅ Control de pagos y cobros
- ✅ Estadísticas detalladas
- ✅ Gestión de sesiones (cancelar, reprogramar)
- ✅ Actualización automática de estadísticas del paciente

### Base URL

```
http://localhost:PUERTO/api/sesiones
```

### Autenticación Requerida

**Todos los endpoints requieren autenticación**

```
Authorization: Bearer {accessToken}
```

### Roles Permitidos

- **usuario**: Lectura y escritura completa
- **empleado**: Lectura y escritura completa
- **administrador**: Acceso total

---

## 🔄 FLUJO DE GESTIÓN DE SESIONES

### Diagrama de Flujo - Registro de Sesión

```
┌─────────────────────────────────────────────────────────┐
│            FLUJO DE REGISTRO DE SESIÓN                  │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend                    Base de Datos
   │                           │                            │
   ├─→ Seleccionar paciente   │                            │
   │   (desde buscador)        │                            │
   │                           │                            │
   ├─→ Completar formulario   │                            │
   │   de sesión:              │                            │
   │   - Fecha/hora            │                            │
   │   - Tratamiento           │                            │
   │   - Evolución             │                            │
   │   - Pago                  │                            │
   │                           │                            │
   ├─→ POST /sesiones         │                            │
   │   Body: datos sesión      │                            │
   │                           │                            │
   │                           ├─→ Verificar autenticación │
   │                           │                            │
   │                           ├─→ Validar paciente existe │
   │                           │                            │
   │                           ├─→ Validar datos           │
   │                           │   - Formato de hora       │
   │                           │   - Monto >= 0            │
   │                           │                            │
   │                           ├─→ Calcular duración       │
   │                           │   (horaSalida - horaEntrada)
   │                           │                            │
   │                           ├───────────────────────────→│
   │                           │   Guardar sesión           │
   │                           │   - profesional: userId    │
   │                           │   - estado: realizada      │
   │                           │                            │
   │                           │←──────────────────────────┤
   │                           │   Trigger post-save        │
   │                           │                            │
   │                           ├───────────────────────────→│
   │                           │   Actualizar estadísticas  │
   │                           │   del paciente:            │
   │                           │   - totalSesiones ++       │
   │                           │   - totalAbonado +monto    │
   │                           │   - saldoPendiente         │
   │                           │   - ultimaSesion           │
   │                           │                            │
   │   ←── 201 Created ────────┤←──────────────────────────┤
   │   {sesion creada}         │                            │
   │                           │                            │
   ├─→ Mostrar confirmación   │                            │
   │   "Sesión registrada"     │                            │
   │                           │                            │
   ├─→ Redirigir a detalle    │                            │
   │   o planilla diaria       │                            │
   │                           │                            │


┌─────────────────────────────────────────────────────────┐
│              FLUJO DE PLANILLA DIARIA                   │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend
   │                           │
   ├─→ Seleccionar fecha      │
   │   (por defecto: hoy)      │
   │                           │
   ├─→ GET /sesiones/         │
   │   planilla-diaria?        │
   │   fecha=2025-11-17        │
   │                           │
   │                           ├─→ Buscar todas las sesiones
   │                           │   de esa fecha
   │                           │
   │                           ├─→ Calcular resumen:
   │                           │   - Total sesiones
   │                           │   - Total recaudado
   │                           │   - Total pendiente
   │                           │   - Duración total
   │                           │
   │                           ├─→ Ordenar por numeroOrden
   │                           │
   │   ←── 200 OK ─────────────┤
   │   {planilla + resumen}    │
   │                           │
   ├─→ Mostrar tabla          │
   │   ordenada con:           │
   │   - N° Orden              │
   │   - Paciente              │
   │   - Hora entrada/salida   │
   │   - Monto y estado pago   │
   │   - Observaciones         │
   │                           │
   ├─→ Mostrar resumen del    │
   │   día en header           │
   │                           │


┌─────────────────────────────────────────────────────────┐
│            FLUJO DE REGISTRO DE PAGO                    │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend                    Base de Datos
   │                           │                            │
   ├─→ Usuario selecciona     │                            │
   │   sesión pendiente        │                            │
   │   de pago                 │                            │
   │                           │                            │
   ├─→ Modal de pago:         │                            │
   │   - Monto                 │                            │
   │   - Método de pago        │                            │
   │   - Comprobante (opcional)│                            │
   │                           │                            │
   ├─→ PUT /sesiones/:id/pago │                            │
   │   Body: {                 │                            │
   │     monto, metodoPago,    │                            │
   │     pagado: true          │                            │
   │   }                       │                            │
   │                           │                            │
   │                           ├─→ Verificar sesión existe │
   │                           │                            │
   │                           ├───────────────────────────→│
   │                           │   Actualizar sesión:       │
   │                           │   - pago.pagado: true      │
   │                           │   - pago.fechaPago: now()  │
   │                           │   - pago.metodoPago        │
   │                           │                            │
   │                           │   Trigger post-save:       │
   │                           │   Actualizar estadísticas  │
   │                           │   del paciente             │
   │                           │                            │
   │   ←── 200 OK ─────────────┤←──────────────────────────┤
   │   {sesion actualizada}    │                            │
   │                           │                            │
   ├─→ Actualizar interfaz    │                            │
   │   Mostrar "Pagado"        │                            │
   │                           │                            │


┌─────────────────────────────────────────────────────────┐
│           FLUJO DE HISTORIAL DE PACIENTE                │
└─────────────────────────────────────────────────────────┘

Frontend                    Backend
   │                           │
   ├─→ Ver ficha paciente     │
   │                           │
   ├─→ Click en "Historial"   │
   │                           │
   ├─→ GET /sesiones/paciente/│
   │   :pacienteId?page=1      │
   │                           │
   │                           ├─→ Buscar todas las sesiones
   │                           │   del paciente
   │                           │
   │                           ├─→ Calcular resumen:
   │                           │   - Total sesiones
   │                           │   - Primera/última sesión
   │                           │   - Total abonado
   │                           │   - Saldo pendiente
   │                           │
   │                           ├─→ Ordenar por fecha DESC
   │                           │
   │   ←── 200 OK ─────────────┤
   │   {historial + resumen}   │
   │                           │
   ├─→ Mostrar timeline       │
   │   con evolución:          │
   │   - Fecha cada sesión     │
   │   - Tratamiento aplicado  │
   │   - Evolución (dolor, etc)│
   │   - Observaciones         │
   │                           │
   ├─→ Gráfico de evolución   │
   │   del dolor (0-10)        │
   │                           │
```

---

## 📍 ENDPOINTS DETALLADOS

### 1️⃣ REGISTRAR NUEVA SESIÓN

**POST** `/api/sesiones`

#### Descripción
Registra una nueva sesión de fisioterapia para un paciente.

#### Headers
```json
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json"
}
```

#### Body (JSON)

**Campos Mínimos:**
```json
{
  "paciente": "65f1a2b3c4d5e6f7g8h9i0j2",
  "fecha": "2025-11-17",
  "pago": {
    "monto": 8000
  }
}
```

**Body Completo:**
```json
{
  // Datos Básicos (obligatorios)
  "paciente": "65f1a2b3c4d5e6f7g8h9i0j2",
  "fecha": "2025-11-17",
  
  // Tipo de Sesión
  "tipoSesion": "presencial",
  
  // Horarios
  "horaEntrada": "09:00",
  "horaSalida": "09:50",
  "numeroOrden": 1,
  
  // Tratamiento
  "tratamiento": {
    "descripcion": "Sesión de kinesiología para lumbalgia",
    "tecnicas": [
      "Masoterapia",
      "Termoterapia",
      "Ejercicios de elongación"
    ],
    "areas": [
      "Zona lumbar",
      "Músculos paravertebrales"
    ],
    "intensidad": "moderada"
  },
  
  // Evolución del Paciente
  "evolucion": {
    "estadoGeneral": "mejorado",
    "dolor": 4,
    "movilidad": "parcial",
    "observaciones": "El paciente reporta menor dolor que la sesión anterior"
  },
  
  // Información de Pago (obligatorio)
  "pago": {
    "monto": 8000,
    "metodoPago": "efectivo",
    "pagado": true,
    "comprobante": {
      "numero": "0001-00001234",
      "tipo": "recibo"
    }
  },
  
  // Estado de la Sesión
  "estado": "realizada",
  
  // Observaciones e Indicaciones
  "observaciones": "Buena respuesta al tratamiento. Paciente colaborador.",
  "indicaciones": "Continuar con ejercicios en casa. Aplicar calor local 2 veces al día. Próxima sesión en 3 días.",
  
  // Próxima Sesión Sugerida (opcional)
  "proximaSesion": {
    "fecha": "2025-11-20",
    "observaciones": "Evaluar evolución del dolor"
  }
}
```

#### Validaciones

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| paciente | ObjectId | ✅ Sí | Debe existir en BD |
| fecha | Date | ✅ Sí | Fecha válida |
| horaEntrada | String | ❌ No | Formato HH:MM (24h) |
| horaSalida | String | ❌ No | Formato HH:MM (24h) |
| tipoSesion | String | ❌ No | presencial, domicilio, virtual, evaluacion, control |
| estado | String | ❌ No | programada, realizada, cancelada, ausente, reprogramada |
| pago.monto | Number | ✅ Sí | >= 0 |
| pago.metodoPago | String | ❌ No | efectivo, transferencia, tarjeta, obra_social, pendiente |
| evolucion.dolor | Number | ❌ No | 0-10 |

#### Respuesta Exitosa (201 Created)
```json
{
  "success": true,
  "message": "Sesión registrada exitosamente",
  "data": {
    "sesion": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "paciente": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "nombreCompleto": "González, María",
        "dni": "35123456",
        "obraSocial": {
          "nombre": "OSDE"
        }
      },
      "fecha": "2025-11-17T00:00:00.000Z",
      "tipoSesion": "presencial",
      "horaEntrada": "09:00",
      "horaSalida": "09:50",
      "duracion": 50,
      "numeroOrden": 1,
      "tratamiento": {
        "descripcion": "Sesión de kinesiología para lumbalgia",
        "tecnicas": ["Masoterapia", "Termoterapia", "Ejercicios de elongación"],
        "areas": ["Zona lumbar", "Músculos paravertebrales"],
        "intensidad": "moderada"
      },
      "evolucion": {
        "estadoGeneral": "mejorado",
        "dolor": 4,
        "movilidad": "parcial",
        "observaciones": "El paciente reporta menor dolor que la sesión anterior"
      },
      "pago": {
        "monto": 8000,
        "metodoPago": "efectivo",
        "pagado": true,
        "fechaPago": "2025-11-17T10:00:00.000Z",
        "comprobante": {
          "numero": "0001-00001234",
          "tipo": "recibo"
        }
      },
      "estado": "realizada",
      "profesional": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "observaciones": "Buena respuesta al tratamiento",
      "indicaciones": "Continuar con ejercicios en casa. Próxima sesión en 3 días",
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
      "field": "paciente",
      "message": "El paciente es obligatorio"
    },
    {
      "field": "horaEntrada",
      "message": "El formato de hora debe ser HH:MM"
    }
  ]
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Paciente no encontrado"
}
```

#### Notas Importantes
- El campo `profesional` se asigna automáticamente al usuario autenticado
- La `duracion` se calcula automáticamente si se proporcionan horaEntrada y horaSalida
- Si `pago.pagado` es true, se establece automáticamente `pago.fechaPago`
- Las estadísticas del paciente se actualizan automáticamente después de guardar

---

### 2️⃣ OBTENER SESIONES (CON FILTROS)

**GET** `/api/sesiones`

#### Descripción
Obtiene una lista paginada de sesiones con múltiples opciones de filtrado.

#### Query Parameters

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| page | Number | Página actual (default: 1) | `page=2` |
| limit | Number | Resultados por página (default: 50) | `limit=20` |
| sortBy | String | Campo para ordenar | `sortBy=fecha` |
| pacienteId | String | Filtrar por ID de paciente | `pacienteId=65f1...` |
| fecha | String | Filtrar por fecha específica | `fecha=2025-11-17` |
| estado | String | Filtrar por estado | `estado=realizada` |
| pagado | Boolean | Filtrar por pagado | `pagado=false` |

#### Ejemplos de URLs

```
# Todas las sesiones paginadas
GET /api/sesiones?page=1&limit=50

# Sesiones de un paciente específico
GET /api/sesiones?pacienteId=65f1a2b3c4d5e6f7g8h9i0j2

# Sesiones de una fecha específica
GET /api/sesiones?fecha=2025-11-17

# Sesiones pendientes de pago
GET /api/sesiones?pagado=false

# Sesiones realizadas de un paciente
GET /api/sesiones?pacienteId=65f1a2b3c4d5e6f7g8h9i0j2&estado=realizada

# Combinación de filtros
GET /api/sesiones?fecha=2025-11-17&estado=realizada&pagado=true
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Sesiones obtenidas exitosamente",
  "data": [
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "paciente": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "nombreCompleto": "González, María",
        "dni": "35123456"
      },
      "fecha": "2025-11-17T00:00:00.000Z",
      "horaEntrada": "09:00",
      "horaSalida": "09:50",
      "duracion": 50,
      "numeroOrden": 1,
      "tipoSesion": "presencial",
      "pago": {
        "monto": 8000,
        "metodoPago": "efectivo",
        "pagado": true,
        "fechaPago": "2025-11-17T10:00:00.000Z"
      },
      "estado": "realizada",
      "profesional": {
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "createdAt": "2025-11-17T10:00:00.000Z"
    },
    {
      "id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "paciente": {
        "id": "65f1a2b3c4d5e6f7g8h9i0j5",
        "nombreCompleto": "Rodríguez, Carlos",
        "dni": "28456789"
      },
      "fecha": "2025-11-17T00:00:00.000Z",
      "horaEntrada": "10:00",
      "horaSalida": "10:45",
      "duracion": 45,
      "numeroOrden": 2,
      "pago": {
        "monto": 8000,
        "metodoPago": "pendiente",
        "pagado": false
      },
      "estado": "realizada"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3️⃣ OBTENER PLANILLA DIARIA

**GET** `/api/sesiones/planilla-diaria`

#### Descripción
Obtiene la planilla completa de sesiones de un día específico con resumen de movimientos.

#### Query Parameters

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| fecha | String | Fecha en formato YYYY-MM-DD (default: hoy) | `fecha=2025-11-17` |

#### Ejemplo
```
GET /api/sesiones/planilla-diaria
GET /api/sesiones/planilla-diaria?fecha=2025-11-17
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Planilla diaria obtenida exitosamente",
  "data": {
    "fecha": "2025-11-17T00:00:00.000Z",
    "resumen": {
      "totalSesiones": 12,
      "sesionesRealizadas": 10,
      "sesionesCanceladas": 1,
      "sesionesProgramadas": 1,
      "totalRecaudado": 96000,
      "totalPendiente": 16000,
      "duracionTotal": 600,
      "promedioSesion": 50
    },
    "sesiones": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "numeroOrden": 1,
        "paciente": {
          "nombreCompleto": "González, María",
          "dni": "35123456",
          "telefono": "3815551234",
          "obraSocial": {
            "nombre": "OSDE"
          }
        },
        "horaEntrada": "09:00",
        "horaSalida": "09:50",
        "duracion": 50,
        "pago": {
          "monto": 8000,
          "pagado": true,
          "metodoPago": "efectivo"
        },
        "estado": "realizada",
        "observaciones": "Buena respuesta al tratamiento"
      },
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j4",
        "numeroOrden": 2,
        "paciente": {
          "nombreCompleto": "Rodríguez, Carlos",
          "dni": "28456789",
          "telefono": "3815553333",
          "obraSocial": {
            "nombre": "Particular"
          }
        },
        "horaEntrada": "10:00",
        "horaSalida": "10:45",
        "duracion": 45,
        "pago": {
          "monto": 8000,
          "pagado": false,
          "metodoPago": "pendiente"
        },
        "estado": "realizada",
        "observaciones": null
      },
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j5",
        "numeroOrden": 3,
        "paciente": {
          "nombreCompleto": "Martínez, Laura",
          "dni": "40789456",
          "telefono": "3815554444",
          "obraSocial": {
            "nombre": "Swiss Medical"
          }
        },
        "horaEntrada": "11:00",
        "horaSalida": null,
        "duracion": 0,
        "pago": {
          "monto": 8000,
          "pagado": false,
          "metodoPago": "pendiente"
        },
        "estado": "programada",
        "observaciones": "Primera sesión - evaluación"
      }
    ],
    "profesional": {
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  }
}
```

---

### 4️⃣ OBTENER HISTORIAL DE PACIENTE

**GET** `/api/sesiones/paciente/:pacienteId`

#### Descripción
Obtiene el historial completo de sesiones de un paciente con resumen estadístico.

#### Parámetros de URL
- **:pacienteId** - ID del paciente (MongoDB ObjectId)

#### Query Parameters

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| page | Number | Página actual (default: 1) | `page=2` |
| limit | Number | Resultados por página (default: 20) | `limit=10` |

#### Ejemplo
```
GET /api/sesiones/paciente/65f1a2b3c4d5e6f7g8h9i0j2
GET /api/sesiones/paciente/65f1a2b3c4d5e6f7g8h9i0j2?page=1&limit=20
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Historial obtenido exitosamente",
  "data": {
    "paciente": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "nombreCompleto": "González, María",
      "dni": "35123456",
      "diagnostico": {
        "principal": "Lumbalgia crónica"
      },
      "obraSocial": {
        "nombre": "OSDE"
      }
    },
    "resumen": {
      "totalSesiones": 15,
      "sesionesRealizadas": 14,
      "sesionesCanceladas": 1,
      "sesionesAusentes": 0,
      "totalAbonado": 112000,
      "saldoPendiente": 8000,
      "primeraSesion": "2025-10-01T09:00:00.000Z",
      "ultimaSesion": "2025-11-17T09:00:00.000Z",
      "evolucionDolor": [
        { "fecha": "2025-10-01", "dolor": 8 },
        { "fecha": "2025-10-05", "dolor": 7 },
        { "fecha": "2025-10-10", "dolor": 6 },
        { "fecha": "2025-10-15", "dolor": 5 },
        { "fecha": "2025-11-17", "dolor": 4 }
      ]
    },
    "sesiones": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "fecha": "2025-11-17T00:00:00.000Z",
        "horaEntrada": "09:00",
        "horaSalida": "09:50",
        "duracion": 50,
        "tipoSesion": "presencial",
        "tratamiento": {
          "descripcion": "Sesión de kinesiología para lumbalgia",
          "tecnicas": ["Masoterapia", "Termoterapia"],
          "areas": ["Zona lumbar"]
        },
        "evolucion": {
          "estadoGeneral": "mejorado",
          "dolor": 4,
          "movilidad": "parcial",
          "observaciones": "Menor dolor que sesión anterior"
        },
        "pago": {
          "monto": 8000,
          "pagado": true,
          "metodoPago": "efectivo"
        },
        "estado": "realizada",
        "profesional": {
          "nombreCompleto": "Pérez, Juan"
        },
        "observaciones": "Buena respuesta",
        "indicaciones": "Continuar ejercicios en casa"
      },
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j6",
        "fecha": "2025-11-15T00:00:00.000Z",
        "horaEntrada": "09:00",
        "horaSalida": "09:45",
        "duracion": 45,
        "evolucion": {
          "estadoGeneral": "mejorado",
          "dolor": 5
        },
        "pago": {
          "monto": 8000,
          "pagado": true
        },
        "estado": "realizada"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

### 5️⃣ ACTUALIZAR SESIÓN

**PUT** `/api/sesiones/:id`

#### Descripción
Actualiza los datos de una sesión existente. Solo envía los campos que quieras modificar.

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
  "horaEntrada": "09:15",
  "horaSalida": "10:00",
  "tratamiento": {
    "descripcion": "Actualización: Sesión enfocada en zona lumbar baja",
    "tecnicas": ["Masoterapia profunda", "Termoterapia", "Ejercicios isométricos"]
  },
  "evolucion": {
    "estadoGeneral": "mejorado",
    "dolor": 3,
    "movilidad": "completa",
    "observaciones": "Excelente evolución, dolor casi nulo"
  },
  "observaciones": "Actualización: Paciente evolucionó muy bien durante la sesión",
  "indicaciones": "Reducir frecuencia a 1 sesión por semana. Continuar ejercicios de mantenimiento."
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Sesión actualizada exitosamente",
  "data": {
    "sesion": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "horaEntrada": "09:15",
      "horaSalida": "10:00",
      "duracion": 45,
      "tratamiento": {
        "descripcion": "Actualización: Sesión enfocada en zona lumbar baja",
        "tecnicas": ["Masoterapia profunda", "Termoterapia", "Ejercicios isométricos"]
      },
      "evolucion": {
        "estadoGeneral": "mejorado",
        "dolor": 3,
        "movilidad": "completa",
        "observaciones": "Excelente evolución, dolor casi nulo"
      },
      "observaciones": "Actualización: Paciente evolucionó muy bien durante la sesión",
      "indicaciones": "Reducir frecuencia a 1 sesión por semana",
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
  "message": "Sesión no encontrada"
}
```

**422 Unprocessable Entity**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "horaEntrada",
      "message": "El formato de hora debe ser HH:MM"
    }
  ]
}
```

---

### 6️⃣ REGISTRAR PAGO DE SESIÓN

**PUT** `/api/sesiones/:id/pago`

#### Descripción
Registra o actualiza el pago de una sesión.

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
  "monto": 8000,
  "metodoPago": "transferencia",
  "pagado": true,
  "comprobante": {
    "numero": "0001-00012345",
    "tipo": "recibo",
    "url": "https://example.com/comprobantes/12345.pdf"
  }
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Pago registrado exitosamente",
  "data": {
    "sesion": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "paciente": {
        "nombreCompleto": "González, María"
      },
      "fecha": "2025-11-17T00:00:00.000Z",
      "pago": {
        "monto": 8000,
        "metodoPago": "transferencia",
        "pagado": true,
        "fechaPago": "2025-11-17T11:30:00.000Z",
        "comprobante": {
          "numero": "0001-00012345",
          "tipo": "recibo",
          "url": "https://example.com/comprobantes/12345.pdf"
        }
      },
      "updatedAt": "2025-11-17T11:30:00.000Z"
    }
  }
}
```

#### Notas Importantes
- Las estadísticas del paciente se actualizan automáticamente
- Si `pagado` es `true`, se establece automáticamente `fechaPago` a la fecha actual

---

### 7️⃣ CANCELAR SESIÓN

**PUT** `/api/sesiones/:id/cancelar`

#### Descripción
Cancela una sesión programada o realizada, registrando el motivo.

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
  "motivo": "Paciente canceló por motivos personales. Reprogramada para el 20/11"
}
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Sesión cancelada exitosamente",
  "data": {
    "sesion": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "paciente": {
        "nombreCompleto": "González, María"
      },
      "fecha": "2025-11-18T00:00:00.000Z",
      "estado": "cancelada",
      "motivoCancelacion": "Paciente canceló por motivos personales. Reprogramada para el 20/11",
      "updatedAt": "2025-11-17T11:45:00.000Z"
    }
  }
}
```

#### Errores Posibles

**400 Bad Request**
```json
{
  "success": false,
  "message": "Debe proporcionar un motivo de cancelación"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Sesión no encontrada"
}
```

---

### 8️⃣ OBTENER ESTADÍSTICAS DE SESIONES

**GET** `/api/sesiones/estadisticas/resumen`

#### Descripción
Obtiene estadísticas generales del módulo de sesiones con posibilidad de filtrar por rango de fechas.

#### Query Parameters

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| fechaInicio | String | Fecha inicial (YYYY-MM-DD) | `fechaInicio=2025-11-01` |
| fechaFin | String | Fecha final (YYYY-MM-DD) | `fechaFin=2025-11-30` |

#### Ejemplos
```
GET /api/sesiones/estadisticas/resumen
GET /api/sesiones/estadisticas/resumen?fechaInicio=2025-11-01&fechaFin=2025-11-30
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "estadisticas": {
      "periodo": {
        "fechaInicio": "2025-11-01T00:00:00.000Z",
        "fechaFin": "2025-11-30T00:00:00.000Z"
      },
      "sesiones": {
        "totalSesiones": 245,
        "sesionesRealizadas": 220,
        "sesionesCanceladas": 15,
        "sesionesAusentes": 5,
        "sesionesProgramadas": 10,
        "promedioSesionesPorDia": 12.25,
        "duracionPromedio": 48
      },
      "financiero": {
        "totalRecaudado": 1760000,
        "totalPendiente": 120000,
        "totalEsperado": 1880000,
        "porcentajeCobrado": 93.6,
        "recaudacionPromedioDiaria": 88000
      },
      "porTipoSesion": [
        { "tipo": "presencial", "cantidad": 200, "porcentaje": 81.6 },
        { "tipo": "domicilio", "cantidad": 35, "porcentaje": 14.3 },
        { "tipo": "evaluacion", "cantidad": 10, "porcentaje": 4.1 }
      ],
      "porMetodoPago": [
        { 
          "metodo": "efectivo", 
          "cantidad": 120, 
          "monto": 960000,
          "porcentaje": 54.5
        },
        { 
          "metodo": "transferencia", 
          "cantidad": 60, 
          "monto": 480000,
          "porcentaje": 27.3
        },
        { 
          "metodo": "obra_social", 
          "cantidad": 40, 
          "monto": 320000,
          "porcentaje": 18.2
        }
      ],
      "evolucionDiaria": [
        { 
          "fecha": "2025-11-01", 
          "sesiones": 10, 
          "recaudado": 80000,
          "pagadas": 8,
          "pendientes": 2
        },
        { 
          "fecha": "2025-11-02", 
          "sesiones": 12, 
          "recaudado": 96000,
          "pagadas": 11,
          "pendientes": 1
        }
      ],
      "topProfesionales": [
        {
          "profesional": {
            "id": "65f1a2b3c4d5e6f7g8h9i0j1",
            "nombreCompleto": "Pérez, Juan"
          },
          "totalSesiones": 180,
          "totalRecaudado": 1440000
        }
      ]
    }
  }
}
```

---

### 9️⃣ OBTENER PAGOS PENDIENTES

**GET** `/api/sesiones/pagos-pendientes`

#### Descripción
Obtiene todas las sesiones con pagos pendientes, agrupadas por paciente.

#### Query Parameters

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| limit | Number | Límite de resultados (default: 50) | `limit=100` |
| pacienteId | String | Filtrar por paciente específico | `pacienteId=65f1...` |

#### Ejemplos
```
GET /api/sesiones/pagos-pendientes
GET /api/sesiones/pagos-pendientes?limit=100
GET /api/sesiones/pagos-pendientes?pacienteId=65f1a2b3c4d5e6f7g8h9i0j2
```

#### Respuesta Exitosa (200 OK)
```json
{
  "success": true,
  "message": "Pagos pendientes obtenidos exitosamente",
  "data": {
    "resumen": {
      "totalPendiente": 145000,
      "cantidadSesiones": 18,
      "pacientesConDeuda": 12,
      "promedioDeudaPorPaciente": 12083
    },
    "sesiones": [
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j5",
        "paciente": {
          "id": "65f1a2b3c4d5e6f7g8h9i0j2",
          "nombreCompleto": "González, María",
          "dni": "35123456",
          "telefono": "3815551234",
          "email": "maria.gonzalez@example.com"
        },
        "fecha": "2025-11-15T00:00:00.000Z",
        "horaEntrada": "09:00",
        "pago": {
          "monto": 8000,
          "metodoPago": "pendiente",
          "pagado": false
        },
        "estado": "realizada",
        "diasPendiente": 2
      },
      {
        "id": "65f1a2b3c4d5e6f7g8h9i0j6",
        "paciente": {
          "id": "65f1a2b3c4d5e6f7g8h9i0j2",
          "nombreCompleto": "González, María",
          "dni": "35123456",
          "telefono": "3815551234"
        },
        "fecha": "2025-11-17T00:00:00.000Z",
        "pago": {
          "monto": 8000,
          "metodoPago": "pendiente",
          "pagado": false
        },
        "estado": "realizada",
        "diasPendiente": 0
      }
    ],
    "porPaciente": [
      {
        "paciente": {
          "id": "65f1a2b3c4d5e6f7g8h9i0j2",
          "nombreCompleto": "González, María",
          "dni": "35123456",
          "telefono": "3815551234",
          "email": "maria.gonzalez@example.com"
        },
        "sesionesAdeudadas": 2,
        "totalAdeudado": 16000,
        "ultimaSesionPendiente": "2025-11-17T00:00:00.000Z",
        "diasDesdeUltimaSesion": 0
      },
      {
        "paciente": {
          "id": "65f1a2b3c4d5e6f7g8h9i0j5",
          "nombreCompleto": "Rodríguez, Carlos",
          "dni": "28456789",
          "telefono": "3815553333"
        },
        "sesionesAdeudadas": 1,
        "totalAdeudado": 8000,
        "ultimaSesionPendiente": "2025-11-16T00:00:00.000Z",
        "diasDesdeUltimaSesion": 1
      }
    ]
  }
}
```

---

## 📊 MODELO DE DATOS

### Estructura Completa de la Sesión

```javascript
{
  // ID
  "_id": ObjectId,
  
  // Paciente Asociado
  "paciente": ObjectId (ref: Paciente, required),
  
  // Fecha y Horarios
  "fecha": Date (required, default: now),
  "horaEntrada": String (HH:MM),
  "horaSalida": String (HH:MM),
  "duracion": Number (minutos, auto-calculado),
  "numeroOrden": Number (orden del día),
  
  // Tipo de Sesión
  "tipoSesion": String (presencial|domicilio|virtual|evaluacion|control),
  
  // Tratamiento Realizado
  "tratamiento": {
    "descripcion": String,
    "tecnicas": [String],
    "areas": [String],
    "intensidad": String (leve|moderada|intensa)
  },
  
  // Evolución del Paciente
  "evolucion": {
    "estadoGeneral": String (mejorado|estable|empeorado),
    "dolor": Number (0-10),
    "movilidad": String (limitada|parcial|completa),
    "observaciones": String
  },
  
  // Información de Pago
  "pago": {
    "monto": Number (required, >= 0),
    "metodoPago": String (efectivo|transferencia|tarjeta|obra_social|pendiente),
    "pagado": Boolean (default: false),
    "fechaPago": Date,
    "comprobante": {
      "numero": String,
      "tipo": String (factura|recibo|otro),
      "url": String
    }
  },
  
  // Estado de la Sesión
  "estado": String (programada|realizada|cancelada|ausente|reprogramada),
  "motivoCancelacion": String (max 500 chars),
  
  // Observaciones
  "observaciones": String (max 1000 chars),
  "indicaciones": String (max 500 chars),
  
  // Próxima Sesión Sugerida
  "proximaSesion": {
    "fecha": Date,
    "observaciones": String
  },
  
  // Profesional que Atendió
  "profesional": ObjectId (ref: User, required),
  
  // Firma Digital (opcional)
  "firma": {
    "paciente": String,
    "profesional": String
  },
  
  // Archivos Adjuntos
  "adjuntos": [{
    "tipo": String (foto|documento|estudio|otro),
    "descripcion": String,
    "url": String,
    "fecha": Date
  }],
  
  // Recordatorio
  "recordatorioEnviado": Boolean (default: false),
  
  // Metadata del Sistema
  "modificadoPor": ObjectId (ref: User),
  
  // Timestamps Automáticos
  "createdAt": Date,
  "updatedAt": Date
}
```

### Cálculos Automáticos

1. **Duración**: Se calcula automáticamente al guardar si existen `horaEntrada` y `horaSalida`
2. **Fecha de Pago**: Se establece automáticamente cuando `pago.pagado` es `true`
3. **Estadísticas del Paciente**: Se actualizan automáticamente después de guardar la sesión (post-save hook)

---

## 💻 IMPLEMENTACIÓN EN FRONTEND

### 1. Servicio de Sesiones (sesionService.js)

```javascript
import api from './axiosConfig';

class SesionService {
  // Registrar sesión
  async registrarSesion(dataSesion) {
    try {
      const response = await api.post('/sesiones', dataSesion);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Obtener sesiones con filtros
  async obtenerSesiones(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.sortBy) params.append('sortBy', filtros.sortBy);
      if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId);
      if (filtros.fecha) params.append('fecha', filtros.fecha);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.pagado !== undefined) params.append('pagado', filtros.pagado);
      
      const response = await api.get(`/sesiones?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Obtener planilla diaria
  async obtenerPlanillaDiaria(fecha = null) {
    try {
      const url = fecha 
        ? `/sesiones/planilla-diaria?fecha=${fecha}`
        : '/sesiones/planilla-diaria';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Obtener historial de paciente
  async obtenerHistorialPaciente(pacienteId, page = 1, limit = 20) {
    try {
      const response = await api.get(
        `/sesiones/paciente/${pacienteId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Actualizar sesión
  async actualizarSesion(id, datosActualizados) {
    try {
      const response = await api.put(`/sesiones/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Registrar pago
  async registrarPago(id, datosPago) {
    try {
      const response = await api.put(`/sesiones/${id}/pago`, datosPago);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Cancelar sesión
  async cancelarSesion(id, motivo) {
    try {
      const response = await api.put(`/sesiones/${id}/cancelar`, { motivo });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas(fechaInicio = null, fechaFin = null) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      const url = params.toString() 
        ? `/sesiones/estadisticas/resumen?${params.toString()}`
        : '/sesiones/estadisticas/resumen';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Obtener pagos pendientes
  async obtenerPagosPendientes(limit = 50, pacienteId = null) {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit);
      if (pacienteId) params.append('pacienteId', pacienteId);
      
      const response = await api.get(`/sesiones/pagos-pendientes?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}

export default new SesionService();
```

---

### 2. Hook de React para Planilla Diaria

```javascript
// usePlanillaDiaria.js
import { useState, useEffect } from 'react';
import SesionService from '../services/sesionService';
import { format } from 'date-fns'; // o moment.js

export const usePlanillaDiaria = (fechaInicial = new Date()) => {
  const [fecha, setFecha] = useState(fechaInicial);
  const [planilla, setPlanilla] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlanilla();
  }, [fecha]);

  const fetchPlanilla = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      const response = await SesionService.obtenerPlanillaDiaria(fechaStr);
      setPlanilla(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarFecha = (nuevaFecha) => {
    setFecha(nuevaFecha);
  };

  const refrescar = () => {
    fetchPlanilla();
  };

  return {
    fecha,
    planilla,
    loading,
    error,
    cambiarFecha,
    refrescar
  };
};
```

---

### 3. Componente de Planilla Diaria

```javascript
// PlanillaDiaria.jsx
import React from 'react';
import { usePlanillaDiaria } from '../hooks/usePlanillaDiaria';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const PlanillaDiaria = () => {
  const { fecha, planilla, loading, error, cambiarFecha, refrescar } = usePlanillaDiaria();

  if (loading) return <div>Cargando planilla...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!planilla) return null;

  const { resumen, sesiones } = planilla;

  return (
    <div className="planilla-diaria">
      {/* Header con navegación de fechas */}
      <div className="header">
        <div className="date-navigator">
          <button onClick={() => cambiarFecha(subDays(fecha, 1))}>
            ← Día Anterior
          </button>
          
          <h2>
            {format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </h2>
          
          <button onClick={() => cambiarFecha(addDays(fecha, 1))}>
            Día Siguiente →
          </button>
        </div>
        
        <button onClick={refrescar}>Actualizar</button>
      </div>

      {/* Resumen del día */}
      <div className="resumen">
        <div className="card">
          <h4>Total Sesiones</h4>
          <p className="number">{resumen.totalSesiones}</p>
        </div>
        
        <div className="card">
          <h4>Realizadas</h4>
          <p className="number success">{resumen.sesionesRealizadas}</p>
        </div>
        
        <div className="card">
          <h4>Programadas</h4>
          <p className="number warning">{resumen.sesionesProgramadas}</p>
        </div>
        
        <div className="card">
          <h4>Canceladas</h4>
          <p className="number danger">{resumen.sesionesCanceladas}</p>
        </div>
        
        <div className="card highlight">
          <h4>Total Recaudado</h4>
          <p className="number">${resumen.totalRecaudado.toLocaleString()}</p>
        </div>
        
        <div className="card">
          <h4>Pendiente</h4>
          <p className="number">${resumen.totalPendiente.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabla de sesiones */}
      <table className="sesiones-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Paciente</th>
            <th>DNI</th>
            <th>Obra Social</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Duración</th>
            <th>Monto</th>
            <th>Pago</th>
            <th>Estado</th>
            <th>Observaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sesiones.map((sesion) => (
            <tr key={sesion.id} className={`estado-${sesion.estado}`}>
              <td>{sesion.numeroOrden}</td>
              <td>{sesion.paciente.nombreCompleto}</td>
              <td>{sesion.paciente.dni}</td>
              <td>{sesion.paciente.obraSocial?.nombre}</td>
              <td>{sesion.horaEntrada || '-'}</td>
              <td>{sesion.horaSalida || '-'}</td>
              <td>{sesion.duracion ? `${sesion.duracion} min` : '-'}</td>
              <td>${sesion.pago.monto.toLocaleString()}</td>
              <td>
                <span className={`badge ${sesion.pago.pagado ? 'success' : 'warning'}`}>
                  {sesion.pago.pagado ? 'Pagado' : 'Pendiente'}
                </span>
              </td>
              <td>
                <span className={`badge ${sesion.estado}`}>
                  {sesion.estado}
                </span>
              </td>
              <td className="observaciones">
                {sesion.observaciones || '-'}
              </td>
              <td>
                <button onClick={() => verDetalle(sesion.id)}>Ver</button>
                {!sesion.pago.pagado && (
                  <button onClick={() => registrarPago(sesion.id)}>
                    Cobrar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="totals">
            <td colSpan="7">TOTALES</td>
            <td>${resumen.totalRecaudado.toLocaleString()}</td>
            <td colSpan="4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default PlanillaDiaria;
```

---

### 4. Componente de Formulario de Sesión

```javascript
// SesionForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SesionService from '../services/sesionService';
import PacienteBuscador from './PacienteBuscador'; // Componente de búsqueda

const SesionForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    paciente: null,
    fecha: new Date().toISOString().split('T')[0],
    tipoSesion: 'presencial',
    horaEntrada: '',
    horaSalida: '',
    numeroOrden: 1,
    tratamiento: {
      descripcion: '',
      tecnicas: [],
      areas: [],
      intensidad: 'moderada'
    },
    evolucion: {
      estadoGeneral: 'estable',
      dolor: 5,
      movilidad: 'parcial',
      observaciones: ''
    },
    pago: {
      monto: 0,
      metodoPago: 'efectivo',
      pagado: false
    },
    estado: 'realizada',
    observaciones: '',
    indicaciones: ''
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePacienteSelect = (paciente) => {
    setFormData(prev => ({
      ...prev,
      paciente: paciente.id,
      pago: {
        ...prev.pago,
        monto: paciente.valorSesion || 0
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      await SesionService.registrarSesion(formData);
      alert('Sesión registrada exitosamente');
      navigate('/planilla-diaria');
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
    <form onSubmit={handleSubmit} className="sesion-form">
      <h2>Registrar Nueva Sesión</h2>

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

      {/* Selección de Paciente */}
      <section>
        <h3>Paciente *</h3>
        <PacienteBuscador onSelect={handlePacienteSelect} />
      </section>

      {/* Datos Básicos */}
      <section>
        <h3>Datos de la Sesión</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Fecha *</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Sesión</label>
            <select 
              name="tipoSesion" 
              value={formData.tipoSesion} 
              onChange={handleChange}
            >
              <option value="presencial">Presencial</option>
              <option value="domicilio">Domicilio</option>
              <option value="virtual">Virtual</option>
              <option value="evaluacion">Evaluación</option>
              <option value="control">Control</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Hora Entrada</label>
            <input
              type="time"
              name="horaEntrada"
              value={formData.horaEntrada}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Hora Salida</label>
            <input
              type="time"
              name="horaSalida"
              value={formData.horaSalida}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>N° Orden</label>
            <input
              type="number"
              name="numeroOrden"
              value={formData.numeroOrden}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>
      </section>

      {/* Tratamiento */}
      <section>
        <h3>Tratamiento</h3>
        
        <div className="form-group">
          <label>Descripción del Tratamiento</label>
          <textarea
            name="tratamiento.descripcion"
            value={formData.tratamiento.descripcion}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Intensidad</label>
          <select 
            name="tratamiento.intensidad" 
            value={formData.tratamiento.intensidad} 
            onChange={handleChange}
          >
            <option value="leve">Leve</option>
            <option value="moderada">Moderada</option>
            <option value="intensa">Intensa</option>
          </select>
        </div>
      </section>

      {/* Evolución */}
      <section>
        <h3>Evolución del Paciente</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Estado General</label>
            <select 
              name="evolucion.estadoGeneral" 
              value={formData.evolucion.estadoGeneral} 
              onChange={handleChange}
            >
              <option value="mejorado">Mejorado</option>
              <option value="estable">Estable</option>
              <option value="empeorado">Empeorado</option>
            </select>
          </div>

          <div className="form-group">
            <label>Nivel de Dolor (0-10)</label>
            <input
              type="number"
              name="evolucion.dolor"
              value={formData.evolucion.dolor}
              onChange={handleChange}
              min="0"
              max="10"
            />
          </div>

          <div className="form-group">
            <label>Movilidad</label>
            <select 
              name="evolucion.movilidad" 
              value={formData.evolucion.movilidad} 
              onChange={handleChange}
            >
              <option value="limitada">Limitada</option>
              <option value="parcial">Parcial</option>
              <option value="completa">Completa</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Observaciones de Evolución</label>
          <textarea
            name="evolucion.observaciones"
            value={formData.evolucion.observaciones}
            onChange={handleChange}
            rows="3"
          />
        </div>
      </section>

      {/* Pago */}
      <section>
        <h3>Información de Pago</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Monto *</label>
            <input
              type="number"
              name="pago.monto"
              value={formData.pago.monto}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Método de Pago</label>
            <select 
              name="pago.metodoPago" 
              value={formData.pago.metodoPago} 
              onChange={handleChange}
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="obra_social">Obra Social</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="pago.pagado"
                checked={formData.pago.pagado}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pago: { ...prev.pago, pagado: e.target.checked }
                }))}
              />
              Pagado
            </label>
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
            rows="3"
            maxLength="1000"
          />
        </div>

        <div className="form-group">
          <label>Indicaciones para el Paciente</label>
          <textarea
            name="indicaciones"
            value={formData.indicaciones}
            onChange={handleChange}
            rows="3"
            maxLength="500"
          />
        </div>
      </section>

      {/* Botones */}
      <div className="form-actions">
        <button type="button" onClick={() => navigate(-1)}>
          Cancelar
        </button>
        <button type="submit" disabled={loading || !formData.paciente}>
          {loading ? 'Guardando...' : 'Registrar Sesión'}
        </button>
      </div>
    </form>
  );
};

export default SesionForm;
```

---

## 📋 CHECKLIST DE INTEGRACIÓN

- [ ] Implementar servicio de sesiones
- [ ] Crear hooks personalizados
- [ ] Implementar planilla diaria
- [ ] Crear formulario de nueva sesión
- [ ] Implementar buscador de pacientes
- [ ] Crear vista de historial por paciente
- [ ] Implementar gestión de pagos
- [ ] Crear interfaz para cancelar sesiones
- [ ] Mostrar estadísticas
- [ ] Implementar lista de pagos pendientes
- [ ] Gráficos de evolución del paciente
- [ ] Validaciones de formulario
- [ ] Manejo de errores
- [ ] Estados de carga
- [ ] Confirmaciones de acciones
- [ ] Testing de todos los flujos

---

**Última actualización:** Noviembre 2025  
**Versión del documento:** 1.0.0

