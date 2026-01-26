# Guía de Endpoints API - GestStore Backend

> Referencia completa de todos los endpoints disponibles en la API REST

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Tareas](#tareas)
4. [Productos](#productos)
5. [Asignación Producto-Tarea](#asignación-producto-tarea)
6. [Monitoreo](#monitoreo)

---

## Autenticación

### POST /auth/register

Registra un nuevo usuario en el sistema.

**Seguridad**: ❌ Público

**Request**:
```json
{
  "email": "usuario@example.com",
  "password": "SecurePassword123!",
  "name": "Juan Pérez"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "WORKER"
  },
  "timestamp": "2024-01-26T10:30:45"
}
```

**Errores**:
- `400`: Email ya registrado o datos inválidos
- `422`: Validación fallida en los campos

---

### POST /auth/login

Autentica un usuario existente.

**Seguridad**: ❌ Público

**Request**:
```json
{
  "email": "usuario@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "role": "WORKER"
  }
}
```

**Errores**:
- `401`: Credenciales inválidas
- `400`: Datos incompletos

---

## Usuarios

### GET /users/me

Obtiene el perfil del usuario autenticado actual.

**Seguridad**: 🔒 Requiere token JWT

**Headers**:
```
Authorization: Bearer {token}
X-User-Id: {userId}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "avatar": "https://...",
    "role": "WORKER",
    "active": true,
    "createdAt": "2024-01-01T10:00:00"
  }
}
```

---

### PUT /users/me

Actualiza el perfil del usuario autenticado.

**Seguridad**: 🔒 Requiere token JWT

**Request**:
```json
{
  "name": "Juan Carlos Pérez",
  "avatar": "https://..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": { /* usuario actualizado */ }
}
```

---

### PUT /users/me/avatar

Carga una nueva imagen de avatar.

**Seguridad**: 🔒 Requiere token JWT

**Content-Type**: `multipart/form-data`

**Form Data**:
```
file: (archivo de imagen, máx 10MB)
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "avatar": "https://..."
  }
}
```

---

### PUT /users/me/password

Cambia la contraseña del usuario autenticado.

**Seguridad**: 🔒 Requiere token JWT

**Request**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores**:
- `401`: Contraseña actual incorrecta
- `422`: Contraseña nueva no cumple requisitos

---

### GET /users

Lista todos los usuarios del sistema (paginado).

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Query Parameters**:
```
page=0&size=20&sort=createdAt,desc
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "507f1f77bcf86cd799439011",
        "email": "usuario@example.com",
        "name": "Juan Pérez",
        "role": "WORKER",
        "active": true
      }
    ],
    "totalElements": 45,
    "totalPages": 3,
    "currentPage": 0
  }
}
```

---

### GET /users/{id}

Obtiene información de un usuario específico.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**URL Parameters**:
- `{id}`: ID del usuario

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* información del usuario */ }
}
```

**Errores**:
- `404`: Usuario no encontrado

---

### GET /users/email/{email}

Busca un usuario por su email.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* usuario encontrado */ }
}
```

---

### GET /users/role/{role}

Lista todos los usuarios activos de un rol específico.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**URL Parameters**:
- `{role}`: ADMIN, MANAGER o WORKER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    { /* usuario */ },
    { /* usuario */ }
  ]
}
```

---

### GET /users/search?q={query}

Busca usuarios por nombre o email.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Query Parameters**:
- `q`: Término de búsqueda

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* usuarios coincidentes */ ]
}
```

---

### POST /users

Crea un nuevo usuario (solo ADMIN).

**Seguridad**: 👑 Requiere ADMIN

**Request**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "name": "Nuevo Usuario",
  "role": "WORKER"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": { /* usuario creado */ }
}
```

---

### PUT /users/{id}

Actualiza un usuario existente.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Request**:
```json
{
  "name": "Nombre Actualizado",
  "role": "MANAGER"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* usuario actualizado */ }
}
```

---

### DELETE /users/{id}

Desactiva un usuario (no elimina datos).

**Seguridad**: 👑 Requiere ADMIN

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente",
  "data": {
    "active": false
  }
}
```

---

### POST /users/{id}/activate

Reactiva un usuario desactivado.

**Seguridad**: 👑 Requiere ADMIN

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Usuario activado exitosamente",
  "data": {
    "active": true
  }
}
```

---

## Tareas

### GET /tasks

Lista todas las tareas del sistema (paginadas).

**Seguridad**: 🔐 Requiere ADMIN/MANAGER/WORKER

**Query Parameters**:
```
page=0&size=20&sort=createdAt,desc
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "507f1f77bcf86cd799439012",
        "title": "Tarea 1",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "assignedTo": "507f1f77bcf86cd799439011",
        "dueDate": "2024-02-15T17:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0
  }
}
```

---

### GET /tasks/all

Lista todas las tareas sin paginación.

**Seguridad**: ❌ Público

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    { /* tarea */ },
    { /* tarea */ }
  ]
}
```

---

### GET /tasks/{id}

Obtiene una tarea específica.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER/WORKER

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Tarea importante",
    "description": "Descripción detallada",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "createdBy": "507f1f77bcf86cd799439011",
    "assignedTo": "507f1f77bcf86cd799439013",
    "dueDate": "2024-02-15T17:00:00",
    "image": "https://...",
    "createdAt": "2024-01-20T10:00:00",
    "updatedAt": "2024-01-25T14:30:00"
  }
}
```

---

### GET /tasks/user/{userId}

Obtiene las tareas asignadas a un usuario.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* tareas del usuario */ ]
}
```

---

### GET /tasks/created-by/{userId}

Obtiene las tareas creadas por un usuario.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* tareas creadas */ ]
}
```

---

### GET /tasks/unassigned

Lista las tareas sin asignar.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* tareas sin asignar */ ]
}
```

---

### GET /tasks/in-progress

Lista las tareas en progreso.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* tareas en progreso */ ]
}
```

---

### GET /tasks/overdue

Lista las tareas con fecha vencida.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* tareas vencidas */ ]
}
```

---

### GET /tasks/high-priority

Lista las tareas de alta prioridad activas.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* tareas prioritarias */ ]
}
```

---

### GET /tasks/search?q={query}

Busca tareas por título o descripción.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Query Parameters**:
- `q`: Término de búsqueda

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* tareas coincidentes */ ]
}
```

---

### POST /tasks

Crea una nueva tarea.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Headers**:
```
X-User-Id: {userId}  // ID del usuario que crea la tarea
```

**Request**:
```json
{
  "title": "Nueva tarea",
  "description": "Descripción de la tarea",
  "priority": "HIGH",
  "dueDate": "2024-02-15T17:00:00",
  "assignedTo": "507f1f77bcf86cd799439013"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Tarea creada exitosamente",
  "data": { /* tarea creada */ }
}
```

**Errores**:
- `400`: X-User-Id no proporcionado
- `422`: Validación fallida

---

### PUT /tasks/{id}

Actualiza completamente una tarea.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Request**:
```json
{
  "title": "Título actualizado",
  "description": "Nueva descripción",
  "priority": "MEDIUM",
  "status": "COMPLETED",
  "dueDate": "2024-02-20T17:00:00"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* tarea actualizada */ }
}
```

---

### PATCH /tasks/{id}

Actualiza parcialmente una tarea.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER/WORKER

**Request** (solo campos a actualizar):
```json
{
  "status": "IN_PROGRESS"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* tarea actualizada */ }
}
```

---

### POST /tasks/{id}/start

Cambia el estado de una tarea a EN PROGRESO.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER/WORKER

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Tarea iniciada exitosamente",
  "data": {
    "status": "IN_PROGRESS"
  }
}
```

---

### POST /tasks/{id}/complete

Marca una tarea como completada.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER/WORKER

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Tarea completada exitosamente",
  "data": {
    "status": "COMPLETED"
  }
}
```

---

### POST /tasks/{id}/cancel

Cancela una tarea en progreso.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Tarea cancelada exitosamente",
  "data": {
    "status": "CANCELLED"
  }
}
```

---

### DELETE /tasks/{id}

Elimina una tarea permanentemente.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Tarea eliminada exitosamente"
}
```

**Errores**:
- `404`: Tarea no encontrada

---

### PUT /tasks/{id}/image

Actualiza la imagen de una tarea.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER/WORKER

**Content-Type**: `multipart/form-data`

**Form Data**:
```
file: (archivo de imagen, máx 10MB)
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "image": "https://..."
  }
}
```

---

### GET /tasks/statistics

Obtiene estadísticas globales de tareas.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 50,
    "completed": 25,
    "inProgress": 15,
    "pending": 10,
    "cancelled": 0,
    "overdue": 3,
    "highPriority": 8
  }
}
```

---

### GET /tasks/statistics/user/{userId}

Obtiene estadísticas de tareas para un usuario.

**Seguridad**: ❌ Público

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* estadísticas del usuario */ }
}
```

---

## Productos

### GET /products

Lista los productos del usuario (paginados).

**Seguridad**: 🔐 Requiere token JWT

**Headers**:
```
X-User-Id: {userId}
```

**Query Parameters**:
```
page=0&size=20&sort=name,asc
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "Cemento Gris",
        "sku": "CEMENT-001",
        "category": "Materiales",
        "price": 15.50,
        "stock": 100,
        "minStock": 20
      }
    ],
    "totalElements": 30,
    "totalPages": 2
  }
}
```

---

### GET /products/{id}

Obtiene un producto específico.

**Seguridad**: 🔐 Requiere token JWT

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* producto */ }
}
```

---

### GET /products/sku/{sku}

Busca un producto por SKU.

**Seguridad**: 🔐 Requiere token JWT

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* producto */ }
}
```

---

### GET /products/category/{category}

Lista productos por categoría.

**Seguridad**: 🔐 Requiere token JWT

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* productos */ ]
}
```

---

### GET /products/search?q={query}

Busca productos por nombre.

**Seguridad**: 🔐 Requiere token JWT

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* productos encontrados */ ]
}
```

---

### GET /products/low-stock

Lista productos con bajo inventario.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* productos bajo stock */ ]
}
```

---

### GET /products/out-of-stock

Lista productos sin existencias.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* productos sin stock */ ]
}
```

---

### POST /products

Crea un nuevo producto.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Headers**:
```
X-User-Id: {userId}
```

**Request**:
```json
{
  "name": "Acero Estructural",
  "sku": "STEEL-001",
  "category": "Materiales",
  "price": 45.00,
  "stock": 50,
  "minStock": 10
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": { /* producto creado */ }
}
```

---

### PUT /products/{id}

Actualiza un producto.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Request**:
```json
{
  "stock": 75,
  "price": 47.50
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* producto actualizado */ }
}
```

---

### DELETE /products/{id}

Elimina un producto.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

## Asignación Producto-Tarea

### GET /task-products/task/{taskId}

Obtiene los productos asignados a una tarea.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER/WORKER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439015",
      "taskId": "507f1f77bcf86cd799439012",
      "productId": "507f1f77bcf86cd799439014",
      "quantity": 50,
      "used": 25
    }
  ]
}
```

---

### GET /task-products/product/{productId}

Obtiene las tareas que usan un producto.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* asignaciones */ ]
}
```

---

### POST /task-products/assign

Asigna un producto a una tarea.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Query Parameters**:
- `taskId`: ID de la tarea

**Request**:
```json
{
  "productId": "507f1f77bcf86cd799439014",
  "quantity": 50
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Producto asignado exitosamente",
  "data": { /* asignación */ }
}
```

---

### PUT /task-products/{id}

Actualiza la asignación de un producto.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Request**:
```json
{
  "quantity": 75
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* asignación actualizada */ }
}
```

---

### POST /task-products/{id}/use

Registra el uso/consumo de un producto.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER/WORKER

**Query Parameters**:
- `quantity`: Cantidad utilizada

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Uso registrado exitosamente",
  "data": {
    "used": 25,
    "remaining": 25
  }
}
```

---

### DELETE /task-products/{id}

Remueve un producto de una tarea.

**Seguridad**: 🔐 Requiere ADMIN/MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Producto removido exitosamente"
}
```

---

## Monitoreo

### GET /actuator/health

Health check del sistema.

**Seguridad**: ❌ Público

**Response** (200 OK):
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MongoDB"
      }
    },
    "livenessState": {
      "status": "LIVE"
    },
    "readinessState": {
      "status": "READY"
    }
  }
}
```

---

### GET /actuator/health/liveness

Verifica que la aplicación está viva.

**Seguridad**: ❌ Público

**Response** (200 OK):
```json
{
  "status": "UP"
}
```

---

### GET /actuator/health/readiness

Verifica que la aplicación está lista para servir tráfico.

**Seguridad**: ❌ Público

**Response** (200 OK):
```json
{
  "status": "UP"
}
```

---

### GET /actuator/info

Información general de la aplicación.

**Seguridad**: ❌ Público

**Response** (200 OK):
```json
{
  "app": {
    "name": "GestStore Backend",
    "version": "1.0.0",
    "description": "API REST para gestionar tareas y almacén"
  }
}
```

---

### GET /actuator/metrics

Lista todas las métricas disponibles.

**Seguridad**: ❌ Público

**Response** (200 OK):
```json
{
  "names": [
    "jvm.memory.used",
    "jvm.threads.live",
    "process.uptime",
    "http.server.requests",
    ...
  ]
}
```

---

## Leyenda de Seguridad

| Símbolo | Significado |
|---------|------------|
| ❌ Público | Sin autenticación requerida |
| 🔒 Requiere token | Cualquier usuario autenticado |
| 🔐 Requiere rol | Roles específicos (ADMIN/MANAGER/WORKER) |
| 👑 Solo ADMIN | Solo administradores |

---

**Versión**: 1.0.0
**Última actualización**: Enero 26, 2024
