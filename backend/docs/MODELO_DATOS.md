# MODELO DE DATOS - GestStore Backend

## 1. Diagrama E/R (Entidad-Relación)

```
┌─────────────────────┐
│       USER          │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ email (UNIQUE)      │
│ password            │
│ role (ENUM)         │
│ phone               │
│ department          │
│ active              │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
       ┌───┴───────────┬──────────────┐
       │               │              │
    1:N createdBy   1:N assigned   1:N created
       │               │              │
       │               │              │
   ┌───┴───────────────┴──────────────┴────┐
   │            TASK                       │
   ├──────────────────────────────────────┤
   │ id (PK)                              │
   │ title                                │
   │ description                          │
   │ status (ENUM)                        │
   │ priority (ENUM)                      │
   │ dueDate                              │
   │ startDate                            │
   │ endDate                              │
   │ notes                                │
   │ completed                            │
   │ assigned_user_id (FK) - NULLABLE     │
   │ created_by_user_id (FK)              │
   │ created_at                           │
   │ updated_at                           │
   └──────────┬───────────────────────────┘
              │
              │ 1:N
              │ (TaskProduct)
              │
   ┌──────────┴──────────────────────────┐
   │        TASK_PRODUCT                 │
   ├─────────────────────────────────────┤
   │ id (PK)                             │
   │ quantity                            │
   │ quantity_used                       │
   │ notes                               │
   │ task_id (FK)                        │
   │ product_id (FK)                     │
   │ created_at                          │
   │ UNIQUE(task_id, product_id)        │
   └─────────────────┬────────────────────┘
                     │
                  N:M
                     │
   ┌─────────────────┴──────────────────┐
   │          PRODUCT                   │
   ├────────────────────────────────────┤
   │ id (PK)                            │
   │ name                               │
   │ sku (UNIQUE)                       │
   │ description                        │
   │ unit_price                         │
   │ category                           │
   │ active                             │
   │ created_at                         │
   │ updated_at                         │
   └──────────┬──────────────────────────┘
              │
              │ 1:1
              │
   ┌──────────┴──────────────────────────┐
   │           STOCK                     │
   ├────────────────────────────────────┤
   │ id (PK)                            │
   │ quantity_available                 │
   │ quantity_reserved                  │
   │ minimum_level                      │
   │ location                           │
   │ product_id (FK) - UNIQUE           │
   │ last_updated                       │
   └────────────────────────────────────┘
```

---

## 2. Descripción de Entidades

### 2.1 USER
**Propósito:** Almacenar información de los usuarios del sistema (administradores, gestores, trabajadores)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador único del usuario |
| name | VARCHAR(100) | NOT NULL | Nombre completo del usuario |
| email | VARCHAR(100) | NOT NULL, UNIQUE, INDEX | Correo electrónico (utilizado para login) |
| password | VARCHAR(255) | NOT NULL | Contraseña hasheada |
| role | ENUM | NOT NULL, INDEX | Rol del usuario (ADMIN, MANAGER, WORKER) |
| phone | VARCHAR(20) | Nullable | Teléfono de contacto |
| department | VARCHAR(255) | Nullable | Departamento o área |
| active | BOOLEAN | DEFAULT TRUE | Indica si el usuario está activo |
| created_at | TIMESTAMP | NOT NULL | Fecha de creación (auto-generada) |
| updated_at | TIMESTAMP | NOT NULL | Fecha de última actualización |

**Relaciones:**
- `assignedTasks` (1:N): Tareas asignadas al usuario
- `createdTasks` (1:N): Tareas creadas por el usuario

---

### 2.2 TASK
**Propósito:** Representar las tareas que deben realizarse en el sistema

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador único de la tarea |
| title | VARCHAR(150) | NOT NULL | Título o nombre de la tarea |
| description | TEXT | Nullable | Descripción detallada de la tarea |
| status | ENUM | NOT NULL, INDEX | Estado actual (PENDING, IN_PROGRESS, COMPLETED, CANCELLED) |
| priority | ENUM | NOT NULL, INDEX | Prioridad (LOW, MEDIUM, HIGH) |
| dueDate | TIMESTAMP | Nullable | Fecha límite de entrega |
| startDate | TIMESTAMP | Nullable | Fecha de inicio de la tarea |
| endDate | TIMESTAMP | Nullable | Fecha de finalización de la tarea |
| notes | TEXT | Nullable | Notas adicionales |
| completed | BOOLEAN | DEFAULT FALSE | Bandera de completitud |
| assigned_user_id | BIGINT | NULLABLE, INDEX, FK → USER | Usuario asignado para ejecutar la tarea |
| created_by_user_id | BIGINT | NOT NULL, FK → USER | Usuario que creó la tarea |
| created_at | TIMESTAMP | NOT NULL | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL | Fecha de última actualización |

**Relaciones:**
- `assignedUser` (N:1): Usuario asignado a la tarea
- `createdByUser` (N:1): Usuario que creó la tarea
- `taskProducts` (N:M): Productos requeridos (a través de TaskProduct)

**Índices:**
- `idx_status`: Búsquedas por estado
- `idx_priority`: Ordenamiento por prioridad
- `idx_assigned_user`: Búsqueda de tareas por usuario
- `idx_created_by`: Búsqueda de tareas creadas por usuario

---

### 2.3 PRODUCT
**Propósito:** Almacenar el catálogo de productos disponibles en el almacén

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador único del producto |
| name | VARCHAR(100) | NOT NULL, INDEX | Nombre del producto |
| sku | VARCHAR(50) | NOT NULL, UNIQUE, INDEX | Código SKU único |
| description | TEXT | Nullable | Descripción detallada |
| unit_price | DECIMAL(10,2) | NOT NULL | Precio unitario |
| category | VARCHAR(50) | Nullable | Categoría del producto |
| active | BOOLEAN | DEFAULT TRUE | Indica si el producto está activo |
| created_at | TIMESTAMP | NOT NULL | Fecha de creación |
| updated_at | TIMESTAMP | NOT NULL | Fecha de última actualización |

**Relaciones:**
- `stock` (1:1): Información de inventario
- `taskProducts` (N:M): Tareas que lo utilizan (a través de TaskProduct)

**Índices:**
- `idx_sku`: Búsqueda por código SKU
- `idx_name`: Búsqueda por nombre

---

### 2.4 STOCK
**Propósito:** Mantener el control de inventario de cada producto

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador único del registro de stock |
| quantity_available | INT | DEFAULT 0 | Cantidad disponible para usar |
| quantity_reserved | INT | DEFAULT 0 | Cantidad reservada para tareas |
| minimum_level | INT | DEFAULT 10 | Nivel mínimo recomendado |
| location | VARCHAR(100) | Nullable | Ubicación en el almacén (ej: Pasillo A) |
| product_id | BIGINT | NOT NULL, UNIQUE, FK → PRODUCT | Producto asociado |
| last_updated | TIMESTAMP | NOT NULL | Última actualización del stock |

**Campos Calculados (Transientes):**
- `totalQuantity`: quantity_available + quantity_reserved
- `isLowStock()`: boolean que indica si está por debajo del mínimo

**Relaciones:**
- `product` (1:1): El producto del que mantiene stock

---

### 2.5 TASK_PRODUCT
**Propósito:** Relacionar tareas con productos en una relación N:M

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Identificador único |
| quantity | INT | DEFAULT 1 | Cantidad requerida del producto |
| quantity_used | INT | DEFAULT 0 | Cantidad utilizada en la tarea |
| notes | TEXT | Nullable | Observaciones sobre el producto |
| task_id | BIGINT | NOT NULL, INDEX, FK → TASK | Tarea asociada |
| product_id | BIGINT | NOT NULL, INDEX, FK → PRODUCT | Producto asociado |
| created_at | TIMESTAMP | NOT NULL | Fecha de creación |
| UNIQUE(task_id, product_id) | - | - | Evita duplicados |

**Relaciones:**
- `task` (N:1): Tarea que requiere el producto
- `product` (N:1): Producto requerido

---

## 3. Enums

### TaskStatus
```
PENDING    - Tarea creada pero no iniciada
IN_PROGRESS - Tarea en ejecución
COMPLETED   - Tarea finalizada exitosamente
CANCELLED   - Tarea cancelada
```

### TaskPriority
```
LOW    - Prioridad baja (nivel 1)
MEDIUM - Prioridad normal (nivel 2)
HIGH   - Prioridad urgente (nivel 3)
```

### Role
```
ADMIN   - Acceso completo al sistema
MANAGER - Puede crear y asignar tareas
WORKER  - Puede ver y ejecutar tareas asignadas
```

---

## 4. Relaciones

| Relación | Tipo | De | A | Descripción |
|----------|------|----|----|-------------|
| createdTasks | 1:N | User | Task | Un usuario crea múltiples tareas |
| assignedTasks | 1:N | User | Task | Un usuario tiene múltiples tareas asignadas |
| taskProducts | N:M | Task | Product | Una tarea requiere múltiples productos |
| stock | 1:1 | Product | Stock | Un producto tiene un registro de stock |

---

## 5. Decisiones de Diseño

### 5.1 Separación de Conceptos
- **User vs Task**: Los usuarios se separan en una entidad independiente para permitir múltiples roles (ADMIN, MANAGER, WORKER) con diferentes permisos.
- **Product vs Stock**: Se separaron para diferenciar la información del producto (nombre, precio, categoría) del control de inventario (cantidades, ubicación).

### 5.2 Relación N:M (Task-Product)
- Se crea una tabla de unión `TaskProduct` para permitir que una tarea requiera múltiples productos y un producto pueda usarse en múltiples tareas.
- Incluye campos como `quantity` (requerido) y `quantityUsed` (actual) para controlar el consumo.

### 5.3 Auditoría
- Todas las entidades incluyen `created_at` y `updated_at` para rastrear cambios.
- Los datos se actualizan automáticamente mediante `@PrePersist` y `@PreUpdate`.

### 5.4 Soft Delete (Lógico)
- Se usa un campo `active` en lugar de eliminar registros físicamente.
- Permite mantener la referencial integrity y recuperar datos si es necesario.

### 5.5 Índices
- Se crean índices en campos frecuentemente buscados o filtrados:
  - Email (búsqueda de usuarios)
  - SKU (búsqueda de productos)
  - Status, Priority (filtrado de tareas)
  - FK's (JOIN's)

### 5.6 Validaciones
- El campo `assigned_user_id` es NULLABLE porque una tarea puede crearse sin asignarla inicialmente.
- El campo `created_by_user_id` es NOT NULL porque siempre debe haber un creador.
- TaskProduct tiene UNIQUE(task_id, product_id) para evitar duplicados.

---

## 6. Consultas Personalizadas por Repositorio

### UserRepository
- `findByEmail()`: Búsqueda por email (login)
- `findByRole()`: Usuarios por rol
- `findActiveUsersByRole()`: Usuarios activos de un rol específico
- `searchByName()`: Búsqueda por nombre
- `findByDepartment()`: Usuarios de un departamento

### ProductRepository
- `findBySku()`: Búsqueda por código SKU
- `findByActive()`: Productos activos
- `findLowStockProducts()`: Productos bajo stock
- `findOutOfStockProducts()`: Productos sin existencias
- `findActiveProductsByCategory()`: Productos activos por categoría

### StockRepository
- `findOutOfStockItems()`: Artículos sin stock
- `findBelowMinimumLevel()`: Artículos bajo el mínimo
- `findCriticalStocks()`: Stocks que necesitan reabastecimiento
- `calculateTotalInventoryValue()`: Valor total del inventario

### TaskRepository
- `findTasksByAssignedUser()`: Tareas de un usuario
- `findUnassignedTasks()`: Tareas sin asignar
- `findOverdueTasks()`: Tareas vencidas
- `findTasksInProgress()`: Tareas en progreso
- `findHighPriorityActiveTasks()`: Tareas críticas sin completar

### TaskProductRepository
- `findByTaskId()`: Productos de una tarea
- `findByProductId()`: Tareas que usan un producto
- `calculateTotalReservedQuantity()`: Cantidad total reservada de un producto
- `findWithQuantityDiscrepancies()`: Productos con diferencia entre requerido y usado

---

## 7. DTOs (Data Transfer Objects)

Se proporcionan DTOs separados para Request/Response:

### User
- `UserRequestDto`: Crear/actualizar usuario
- `UserResponseDto`: Respuesta segura (sin contraseña)

### Product & Stock
- `ProductRequestDto`/`ProductResponseDto`
- `StockRequestDto`/`StockResponseDto`

### Task
- `TaskRequestDto`: Crear/actualizar tarea
- `TaskResponseDto`: Respuesta con información completa

### TaskProduct
- `TaskProductRequestDto`/`TaskProductResponseDto`

---

## 8. Justificación de la Estructura

Este modelo cumple con los siguientes principios:

 - **Normalización**: Elimina redundancias y mantiene la integridad referencial
 - **Escalabilidad**: Permite crecer sin afectar la estructura base
 - **Seguridad**: Separación de conceptos (User sin roles duros)
 - **Auditoría**: Rastreo de cambios mediante timestamps
 - **Consultas Eficientes**: Índices en campos de búsqueda frecuente
 - **Mantenibilidad**: Código limpio con anotaciones y documentación

