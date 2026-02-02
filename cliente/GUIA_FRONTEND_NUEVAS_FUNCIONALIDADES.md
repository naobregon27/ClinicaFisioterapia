# 📘 Guía para Frontend - Nuevas Funcionalidades

## 🎯 Resumen de Cambios

Se han agregado **nuevas funcionalidades** al backend que mejoran significativamente la experiencia del usuario:

- ✅ **Sistema de Notificaciones** en tiempo real
- ✅ **Dashboard con Métricas** consolidadas
- ✅ **Búsqueda Global** rápida
- ✅ **Vista de Calendario** para sesiones
- ✅ **Recordatorios Automáticos** (backend)
- ✅ **Historial Visual de Evolución** de pacientes
- ✅ **Exportación de Datos** (preparado para PDF)
- ✅ **Resumen Diario** por email (backend)

---

## 🔐 Autenticación

**TODOS los nuevos endpoints requieren autenticación** mediante JWT token en el header:

```http
Authorization: Bearer {tu_token_jwt}
```

---

## 📋 1. SISTEMA DE NOTIFICACIONES

### Base URL: `/api/notificaciones`

### 1.1. Obtener Notificaciones del Usuario

**Endpoint:** `GET /api/notificaciones`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 20)
- `leida` (opcional): Filtrar por estado de lectura (`true`/`false`)
- `tipo` (opcional): Filtrar por tipo de notificación
- `prioridad` (opcional): Filtrar por prioridad (`baja`, `media`, `alta`, `urgente`)

**Ejemplo de Request:**
```http
GET /api/notificaciones?page=1&limit=20&leida=false
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Notificaciones obtenidas exitosamente",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "tipo": "sesion_proxima",
      "titulo": "Sesión programada para mañana",
      "mensaje": "Tienes una sesión con Juan Pérez mañana a las 10:00",
      "datos": {
        "pacienteId": {
          "_id": "507f1f77bcf86cd799439012",
          "nombre": "Juan",
          "apellido": "Pérez",
          "dni": "12345678"
        },
        "sesionId": {
          "_id": "507f1f77bcf86cd799439013",
          "fecha": "2024-01-15T10:00:00.000Z",
          "horaEntrada": "10:00",
          "estado": "programada"
        },
        "fecha": "2024-01-15T10:00:00.000Z",
        "url": "/sesiones/507f1f77bcf86cd799439013"
      },
      "leida": false,
      "prioridad": "alta",
      "createdAt": "2024-01-14T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Tipos de Notificaciones Disponibles:**
- `sesion_proxima` - Sesión próxima (mañana/próximas 24h)
- `pago_pendiente` - Pago pendiente
- `paciente_nuevo` - Nuevo paciente registrado
- `sesion_cancelada` - Sesión cancelada
- `sesion_reprogramada` - Sesión reprogramada
- `alta_medica_pendiente` - Alta médica pendiente
- `recordatorio` - Recordatorio general
- `sistema` - Notificación del sistema

---

### 1.2. Obtener Notificaciones No Leídas (Rápido)

**Endpoint:** `GET /api/notificaciones/no-leidas`

**Ejemplo de Request:**
```http
GET /api/notificaciones/no-leidas
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Notificaciones no leídas obtenidas exitosamente",
  "data": {
    "notificaciones": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "tipo": "pago_pendiente",
        "titulo": "Pago pendiente",
        "mensaje": "El paciente Juan Pérez tiene un pago pendiente de $5000",
        "leida": false,
        "prioridad": "media",
        "createdAt": "2024-01-14T08:00:00.000Z"
      }
    ],
    "cantidadNoLeidas": 5
  }
}
```

**💡 Recomendación Frontend:**
- Usar este endpoint para mostrar un badge con el número de notificaciones no leídas
- Actualizar cada 30-60 segundos o usar WebSockets para tiempo real

---

### 1.3. Marcar Notificación como Leída

**Endpoint:** `PUT /api/notificaciones/:id/leer`

**Ejemplo de Request:**
```http
PUT /api/notificaciones/507f1f77bcf86cd799439011/leer
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída",
  "data": {
    "notificacion": {
      "_id": "507f1f77bcf86cd799439011",
      "leida": true,
      "fechaLectura": "2024-01-14T10:30:00.000Z"
    }
  }
}
```

---

### 1.4. Marcar Todas las Notificaciones como Leídas

**Endpoint:** `PUT /api/notificaciones/leer-todas`

**Ejemplo de Request:**
```http
PUT /api/notificaciones/leer-todas
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas",
  "data": {
    "actualizadas": 5
  }
}
```

---

### 1.5. Eliminar Notificación

**Endpoint:** `DELETE /api/notificaciones/:id`

**Ejemplo de Request:**
```http
DELETE /api/notificaciones/507f1f77bcf86cd799439011
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Notificación eliminada exitosamente"
}
```

---

## 📊 2. DASHBOARD CON MÉTRICAS

### Base URL: `/api/dashboard`

### 2.1. Obtener Métricas del Dashboard

**Endpoint:** `GET /api/dashboard/metricas`

**Query Parameters:**
- `fecha` (opcional): Fecha para calcular métricas (formato: `YYYY-MM-DD`). Si no se envía, usa la fecha actual.

**Ejemplo de Request:**
```http
GET /api/dashboard/metricas?fecha=2024-01-15
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Métricas obtenidas exitosamente",
  "data": {
    "metricas": {
      "sesionesHoy": 8,
      "pacientesActivosHoy": 6,
      "ingresosHoy": 45000,
      "ingresosMes": 320000,
      "pacientesNuevosMes": 12,
      "sesionesRealizadasMes": 145,
      "sesionesCanceladasMes": 5,
      "ingresosSemana": 85000,
      "pagosPendientes": 3,
      "notificacionesNoLeidas": 5
    },
    "proximasSesiones": [
      {
        "id": "507f1f77bcf86cd799439013",
        "paciente": {
          "nombre": "Juan",
          "apellido": "Pérez",
          "telefono": "3814123456"
        },
        "fecha": "2024-01-15T10:00:00.000Z",
        "horaEntrada": "10:00",
        "horaSalida": "11:00"
      },
      {
        "id": "507f1f77bcf86cd799439014",
        "paciente": {
          "nombre": "María",
          "apellido": "González",
          "telefono": "3814123457"
        },
        "fecha": "2024-01-15T11:00:00.000Z",
        "horaEntrada": "11:00",
        "horaSalida": "12:00"
      }
    ],
    "ingresosUltimos7Dias": [
      {
        "fecha": "2024-01-09",
        "dia": "mar",
        "ingresos": 35000
      },
      {
        "fecha": "2024-01-10",
        "dia": "mié",
        "ingresos": 42000
      },
      {
        "fecha": "2024-01-11",
        "dia": "jue",
        "ingresos": 38000
      },
      {
        "fecha": "2024-01-12",
        "dia": "vie",
        "ingresos": 45000
      },
      {
        "fecha": "2024-01-13",
        "dia": "sáb",
        "ingresos": 28000
      },
      {
        "fecha": "2024-01-14",
        "dia": "dom",
        "ingresos": 0
      },
      {
        "fecha": "2024-01-15",
        "dia": "lun",
        "ingresos": 45000
      }
    ]
  }
}
```

**💡 Recomendación Frontend:**
- Usar `ingresosUltimos7Dias` para crear un gráfico de líneas o barras
- Mostrar `proximasSesiones` en una lista o tarjeta destacada
- Actualizar las métricas cada 5-10 minutos o cuando el usuario vuelva a la página

---

## 🔍 3. BÚSQUEDA GLOBAL

### Base URL: `/api/buscar`

### 3.1. Búsqueda Global Rápida

**Endpoint:** `GET /api/buscar`

**Query Parameters:**
- `q` (requerido): Término de búsqueda (mínimo 2 caracteres)
- `limit` (opcional): Límite de resultados por tipo (default: 10)
- `tipos` (opcional): Tipos a buscar separados por coma. Valores: `pacientes`, `sesiones`, `usuarios` (default: todos)

**Ejemplo de Request:**
```http
GET /api/buscar?q=juan&limit=5&tipos=pacientes,sesiones
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Búsqueda realizada exitosamente",
  "data": {
    "pacientes": [
      {
        "id": "507f1f77bcf86cd799439012",
        "tipo": "paciente",
        "nombre": "Juan Pérez",
        "dni": "12345678",
        "telefono": "3814123456",
        "email": "juan@example.com",
        "estado": "activo",
        "url": "/pacientes/507f1f77bcf86cd799439012"
      }
    ],
    "sesiones": [
      {
        "id": "507f1f77bcf86cd799439013",
        "tipo": "sesion",
        "paciente": "Juan Pérez",
        "fecha": "2024-01-15T10:00:00.000Z",
        "horaEntrada": "10:00",
        "horaSalida": "11:00",
        "estado": "programada",
        "monto": 5000,
        "pagado": false,
        "url": "/sesiones/507f1f77bcf86cd799439013"
      }
    ],
    "usuarios": [],
    "total": 2,
    "termino": "juan"
  }
}
```

**💡 Recomendación Frontend:**
- Implementar búsqueda con debounce (esperar 300-500ms después de que el usuario deje de escribir)
- Mostrar resultados agrupados por tipo con iconos diferentes
- Permitir hacer clic en cada resultado para navegar a la URL proporcionada

---

## 📅 4. CALENDARIO

### Base URL: `/api/calendario`

### 4.1. Obtener Sesiones por Rango de Fechas (Para Calendario)

**Endpoint:** `GET /api/calendario/sesiones`

**Query Parameters:**
- `fechaInicio` (requerido): Fecha de inicio (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss.sssZ`)
- `fechaFin` (requerido): Fecha de fin (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss.sssZ`)
- `profesionalId` (opcional): Filtrar por profesional
- `pacienteId` (opcional): Filtrar por paciente
- `estado` (opcional): Filtrar por estado (`programada`, `realizada`, `cancelada`, etc.)

**Ejemplo de Request:**
```http
GET /api/calendario/sesiones?fechaInicio=2024-01-01&fechaFin=2024-01-31
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Sesiones obtenidas exitosamente",
  "data": {
    "sesiones": [
      {
        "id": "507f1f77bcf86cd799439013",
        "title": "Juan Pérez",
        "start": "2024-01-15T10:00:00.000Z",
        "end": "2024-01-15T11:00:00.000Z",
        "allDay": false,
        "extendedProps": {
          "paciente": {
            "id": "507f1f77bcf86cd799439012",
            "nombre": "Juan",
            "apellido": "Pérez",
            "dni": "12345678",
            "telefono": "3814123456"
          },
          "profesional": {
            "id": "507f1f77bcf86cd799439015",
            "nombre": "Dr.",
            "apellido": "García"
          },
          "horaEntrada": "10:00",
          "horaSalida": "11:00",
          "duracion": 60,
          "estado": "programada",
          "tipoSesion": "presencial",
          "numeroOrden": 1,
          "numeroSesion": 3,
          "pago": {
            "monto": 5000,
            "pagado": false,
            "metodoPago": "pendiente"
          },
          "url": "/sesiones/507f1f77bcf86cd799439013"
        },
        "color": "#3498db",
        "textColor": "#ffffff"
      }
    ],
    "total": 1
  }
}
```

**💡 Compatibilidad con Librerías de Calendario:**
- El formato de respuesta es compatible con **FullCalendar**, **React Big Calendar**, etc.
- `start` y `end` están en formato ISO 8601
- `color` y `textColor` están incluidos para facilitar el estilo
- `extendedProps` contiene toda la información adicional

**Colores por Estado:**
- `programada`: `#3498db` (Azul)
- `realizada`: `#27ae60` (Verde)
- `cancelada`: `#e74c3c` (Rojo)
- `ausente`: `#95a5a6` (Gris)
- `reprogramada`: `#f39c12` (Naranja)

---

### 4.2. Obtener Sesiones Agrupadas por Día

**Endpoint:** `GET /api/calendario/sesiones-agrupadas`

**Query Parameters:** (Igual que el endpoint anterior)

**Ejemplo de Request:**
```http
GET /api/calendario/sesiones-agrupadas?fechaInicio=2024-01-01&fechaFin=2024-01-31
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Sesiones agrupadas obtenidas exitosamente",
  "data": {
    "sesionesPorDia": [
      {
        "fecha": "2024-01-15",
        "sesiones": [
          {
            "id": "507f1f77bcf86cd799439013",
            "title": "Juan Pérez",
            "start": "2024-01-15T10:00:00.000Z",
            "end": "2024-01-15T11:00:00.000Z",
            "extendedProps": { /* ... */ }
          }
        ],
        "total": 1,
        "realizadas": 0,
        "programadas": 1,
        "canceladas": 0
      }
    ],
    "total": 1
  }
}
```

**💡 Recomendación Frontend:**
- Usar este endpoint para vistas de lista o agenda semanal/mensual
- Mostrar resumen por día con contadores de sesiones

---

## 📈 5. HISTORIAL VISUAL DE EVOLUCIÓN

### Base URL: `/api/evolucion`

### 5.1. Obtener Datos de Evolución de un Paciente

**Endpoint:** `GET /api/evolucion/paciente/:pacienteId`

**Query Parameters:**
- `fechaInicio` (opcional): Filtrar desde fecha
- `fechaFin` (opcional): Filtrar hasta fecha

**Ejemplo de Request:**
```http
GET /api/evolucion/paciente/507f1f77bcf86cd799439012?fechaInicio=2024-01-01&fechaFin=2024-01-31
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Datos de evolución obtenidos exitosamente",
  "data": {
    "paciente": {
      "id": "507f1f77bcf86cd799439012",
      "nombre": "Juan Pérez",
      "dni": "12345678"
    },
    "sesiones": [
      {
        "fecha": "2024-01-10T10:00:00.000Z",
        "numeroSesion": 1,
        "dolor": 8,
        "movilidad": "limitada",
        "estadoGeneral": "estable",
        "observaciones": "Paciente con dolor moderado",
        "tecnicas": ["masaje", "estiramiento"]
      },
      {
        "fecha": "2024-01-12T10:00:00.000Z",
        "numeroSesion": 2,
        "dolor": 6,
        "movilidad": "parcial",
        "estadoGeneral": "mejorado",
        "observaciones": "Mejora notable",
        "tecnicas": ["masaje", "ejercicios"]
      },
      {
        "fecha": "2024-01-15T10:00:00.000Z",
        "numeroSesion": 3,
        "dolor": 4,
        "movilidad": "parcial",
        "estadoGeneral": "mejorado",
        "observaciones": "Continúa mejorando",
        "tecnicas": ["masaje", "estiramiento", "ejercicios"]
      }
    ],
    "graficos": {
      "dolor": [
        {
          "fecha": "2024-01-10T10:00:00.000Z",
          "numeroSesion": 1,
          "valor": 8,
          "label": "Sesión 1"
        },
        {
          "fecha": "2024-01-12T10:00:00.000Z",
          "numeroSesion": 2,
          "valor": 6,
          "label": "Sesión 2"
        },
        {
          "fecha": "2024-01-15T10:00:00.000Z",
          "numeroSesion": 3,
          "valor": 4,
          "label": "Sesión 3"
        }
      ],
      "movilidad": [
        {
          "fecha": "2024-01-10T10:00:00.000Z",
          "numeroSesion": 1,
          "valor": 1,
          "label": "limitada",
          "labelCompleto": "Limitada"
        },
        {
          "fecha": "2024-01-12T10:00:00.000Z",
          "numeroSesion": 2,
          "valor": 2,
          "label": "parcial",
          "labelCompleto": "Parcial"
        },
        {
          "fecha": "2024-01-15T10:00:00.000Z",
          "numeroSesion": 3,
          "valor": 2,
          "label": "parcial",
          "labelCompleto": "Parcial"
        }
      ],
      "estadoGeneral": [
        {
          "fecha": "2024-01-10T10:00:00.000Z",
          "numeroSesion": 1,
          "valor": 2,
          "label": "estable",
          "labelCompleto": "Estable"
        },
        {
          "fecha": "2024-01-12T10:00:00.000Z",
          "numeroSesion": 2,
          "valor": 3,
          "label": "mejorado",
          "labelCompleto": "Mejorado"
        },
        {
          "fecha": "2024-01-15T10:00:00.000Z",
          "numeroSesion": 3,
          "valor": 3,
          "label": "mejorado",
          "labelCompleto": "Mejorado"
        }
      ]
    },
    "estadisticas": {
      "totalSesiones": 3,
      "sesionesConDatos": {
        "dolor": 3,
        "movilidad": 3,
        "estadoGeneral": 3
      },
      "dolor": {
        "promedio": 6,
        "inicial": 8,
        "final": 4,
        "mejora": 4,
        "mejoraPorcentual": 50
      },
      "movilidad": {
        "inicial": "limitada",
        "final": "parcial",
        "mejora": true
      },
      "estadoGeneral": {
        "inicial": "estable",
        "final": "mejorado",
        "mejora": true
      }
    }
  }
}
```

**💡 Recomendación Frontend:**
- Usar `graficos.dolor` para crear un gráfico de líneas (escala 0-10)
- Usar `graficos.movilidad` y `graficos.estadoGeneral` para gráficos de barras o áreas
- Mostrar `estadisticas` en tarjetas destacadas
- Valores de movilidad: `limitada` = 1, `parcial` = 2, `completa` = 3
- Valores de estado: `empeorado` = 1, `estable` = 2, `mejorado` = 3

**Librerías Recomendadas para Gráficos:**
- Chart.js
- Recharts (React)
- ApexCharts
- Victory

---

## 📄 6. EXPORTACIÓN

### Base URL: `/api/exportar`

### 6.1. Exportar Planilla Diaria

**Endpoint:** `GET /api/exportar/planilla-diaria`

**Query Parameters:**
- `fecha` (requerido): Fecha de la planilla (formato: `YYYY-MM-DD`)

**Ejemplo de Request:**
```http
GET /api/exportar/planilla-diaria?fecha=2024-01-15
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Datos preparados para PDF. Nota: Requiere implementar generación de PDF con pdfkit",
  "data": {
    "fecha": "lunes, 15 de enero de 2024",
    "sesiones": [
      {
        "orden": 1,
        "paciente": "Juan Pérez",
        "dni": "12345678",
        "obraSocial": "OSDE",
        "horaEntrada": "10:00",
        "horaSalida": "11:00",
        "duracion": "60 min",
        "monto": 5000,
        "pagado": "Sí",
        "metodoPago": "efectivo",
        "estado": "realizada"
      }
    ],
    "totales": {
      "sesiones": 8,
      "ingresos": 45000,
      "pendientes": 5000
    }
  }
}
```

**⚠️ Nota Importante:**
- Actualmente este endpoint solo prepara los datos
- Para generar PDF real, el backend necesita instalar `pdfkit` y completar la implementación
- Por ahora, el frontend puede usar estos datos para generar PDFs del lado del cliente con librerías como `jsPDF` o `pdfmake`

---

### 6.2. Exportar Ficha de Paciente

**Endpoint:** `GET /api/exportar/ficha-paciente/:pacienteId`

**Ejemplo de Request:**
```http
GET /api/exportar/ficha-paciente/507f1f77bcf86cd799439012
Authorization: Bearer {token}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "message": "Datos preparados para PDF. Nota: Requiere implementar generación de PDF con pdfkit",
  "data": {
    "paciente": {
      "nombreCompleto": "Juan Pérez",
      "dni": "12345678",
      "fechaNacimiento": "15/03/1985",
      "edad": 38,
      "genero": "masculino",
      "telefono": "3814123456",
      "email": "juan@example.com",
      "direccion": "Av. Libertador 123, San Miguel de Tucumán",
      "obraSocial": "OSDE",
      "diagnostico": "Lumbalgia",
      "estado": "activo",
      "fechaAlta": "10/01/2024",
      "estadisticas": {
        "totalSesiones": 10,
        "totalAbonado": 45000,
        "saldoPendiente": 5000,
        "ultimaSesion": "2024-01-15T10:00:00.000Z"
      }
    },
    "sesiones": [
      {
        "fecha": "15/01/2024",
        "numeroSesion": 10,
        "profesional": "Dr. García",
        "estado": "realizada",
        "monto": 5000,
        "pagado": "Sí"
      }
    ],
    "totalSesiones": 10
  }
}
```

**⚠️ Nota Importante:**
- Igual que el endpoint anterior, solo prepara datos
- El frontend puede usar estos datos para generar PDFs del lado del cliente

---

## 🔄 7. INTEGRACIÓN CON NOTIFICACIONES EN TIEMPO REAL

### Recomendaciones para Implementar Notificaciones en Tiempo Real

**Opción 1: Polling (Simple)**
```javascript
// Actualizar notificaciones cada 30 segundos
setInterval(async () => {
  const response = await fetch('/api/notificaciones/no-leidas', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  // Actualizar UI con data.data.cantidadNoLeidas
}, 30000);
```

**Opción 2: WebSockets (Recomendado para producción)**
- El backend tiene `socket.io` instalado pero aún no está configurado
- Se puede implementar para notificaciones en tiempo real
- Contactar al equipo backend para habilitar WebSockets

---

## 📝 8. MANEJO DE ERRORES

Todos los endpoints siguen el mismo formato de error:

**Ejemplo de Error:**
```json
{
  "success": false,
  "message": "Mensaje de error descriptivo",
  "errors": {
    "campo": "Detalle del error en el campo"
  }
}
```

**Códigos de Estado HTTP Comunes:**
- `200` - OK
- `201` - Creado
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (token inválido o expirado)
- `403` - Forbidden (sin permisos)
- `404` - Not Found (recurso no encontrado)
- `422` - Unprocessable Entity (error de validación)
- `500` - Internal Server Error

---

## 🎨 9. EJEMPLOS DE IMPLEMENTACIÓN FRONTEND

### Ejemplo: Componente de Notificaciones (React)

```javascript
import { useState, useEffect } from 'react';

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0);

  useEffect(() => {
    // Cargar notificaciones al montar
    cargarNotificaciones();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const response = await fetch('/api/notificaciones/no-leidas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setNotificaciones(data.data.notificaciones);
        setCantidadNoLeidas(data.data.cantidadNoLeidas);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await fetch(`/api/notificaciones/${id}/leer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      cargarNotificaciones(); // Recargar
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  return (
    <div>
      <h2>Notificaciones ({cantidadNoLeidas})</h2>
      {notificaciones.map(notif => (
        <div key={notif._id} onClick={() => marcarComoLeida(notif._id)}>
          <h3>{notif.titulo}</h3>
          <p>{notif.mensaje}</p>
          {!notif.leida && <span className="badge">Nueva</span>}
        </div>
      ))}
    </div>
  );
}
```

### Ejemplo: Dashboard con Métricas (React)

```javascript
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

function Dashboard() {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    try {
      const response = await fetch('/api/dashboard/metricas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMetricas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!metricas) return <div>Error al cargar métricas</div>;

  const chartData = {
    labels: metricas.ingresosUltimos7Dias.map(d => d.dia),
    datasets: [{
      label: 'Ingresos',
      data: metricas.ingresosUltimos7Dias.map(d => d.ingresos),
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.1)'
    }]
  };

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="metricas-grid">
        <div className="metrica-card">
          <h3>Sesiones Hoy</h3>
          <p className="valor">{metricas.metricas.sesionesHoy}</p>
        </div>
        
        <div className="metrica-card">
          <h3>Ingresos del Día</h3>
          <p className="valor">${metricas.metricas.ingresosHoy.toLocaleString()}</p>
        </div>
        
        <div className="metrica-card">
          <h3>Pagos Pendientes</h3>
          <p className="valor">{metricas.metricas.pagosPendientes}</p>
        </div>
      </div>

      <div className="grafico">
        <h2>Ingresos Últimos 7 Días</h2>
        <Line data={chartData} />
      </div>

      <div className="proximas-sesiones">
        <h2>Próximas Sesiones</h2>
        {metricas.proximasSesiones.map(sesion => (
          <div key={sesion.id}>
            <p>{sesion.paciente.nombre} {sesion.paciente.apellido}</p>
            <p>{new Date(sesion.fecha).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ 10. CHECKLIST DE INTEGRACIÓN

- [ ] Implementar componente de notificaciones con badge de contador
- [ ] Implementar dashboard con métricas y gráficos
- [ ] Implementar búsqueda global con debounce
- [ ] Integrar calendario con librería compatible (FullCalendar, etc.)
- [ ] Implementar vista de evolución con gráficos
- [ ] Implementar exportación PDF del lado del cliente (usando datos del backend)
- [ ] Manejar errores y estados de carga apropiadamente
- [ ] Implementar actualización automática de notificaciones (polling o WebSockets)
- [ ] Probar todos los endpoints con diferentes roles de usuario
- [ ] Validar que los tokens JWT se envíen correctamente en todos los requests

---

## 📞 11. CONTACTO Y SOPORTE

Si tienes dudas sobre la implementación o encuentras algún problema:

1. Revisa los logs del backend para ver errores específicos
2. Verifica que el token JWT sea válido y no haya expirado
3. Confirma que los parámetros de query estén en el formato correcto
4. Contacta al equipo backend para consultas sobre la lógica de negocio

---

## 📚 12. RECURSOS ADICIONALES

- **Documentación de Endpoints Completa**: Ver `ENDPOINTS_Y_FUNCIONALIDADES.md`
- **Base URL de la API**: `http://localhost:5000/api` (desarrollo) o tu URL de producción
- **Formato de Fechas**: Siempre usar ISO 8601 (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss.sssZ`)

---

**Última actualización:** Enero 2024  
**Versión del API:** 1.0.0
