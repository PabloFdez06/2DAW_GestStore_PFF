# GestStore Backend - Documentación Completa

> **Proyecto Final DWES (Desarrollo Web en Entorno Servidor) v1.2**
>
> IES Rafael Alberti

## Índice

1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [API REST Documentación](#api-rest-documentación)
4. [Modelo de Datos](#modelo-de-datos)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Guía de Uso](#guía-de-uso)
7. [Seguridad y Autenticación](#seguridad-y-autenticación)
8. [Estructura del Proyecto](#estructura-del-proyecto)

---

## Introducción

**GestStore** es una API REST desarrollada con **Spring Boot 3** que proporciona una solución completa para la gestión de tareas y almacén de una empresa.

### Características principales

- ✅ API REST completamente documentada con Swagger/OpenAPI
- ✅ Autenticación JWT (JSON Web Token)
- ✅ Sistema de roles y autorización
- ✅ Gestión completa de tareas (CRUD + estados)
- ✅ Gestión de productos y almacén
- ✅ Asignación de productos a tareas
- ✅ Monitoreo con Spring Boot Actuator
- ✅ Validaciones robustas
- ✅ Manejo centralizado de errores

### Tecnologías utilizadas

| Componente | Versión | Propósito |
|-----------|---------|----------|
| Java | 17+ | Lenguaje de programación |
| Spring Boot | 3.2.0 | Framework principal |
| MongoDB | 5.0+ | Base de datos NoSQL |
| Spring Security | 6.x | Autenticación y autorización |
| JWT (JJWT) | 0.12.3 | Tokens de autenticación |
| MapStruct | 1.5.5 | Mapeo de DTOs |
| Springdoc OpenAPI | 2.1.0 | Documentación Swagger |
| Spring Boot Actuator | 3.2.0 | Monitoreo y health checks |

---

## Arquitectura General

### Patrón MVC

El proyecto sigue el patrón **MVC** (Model-View-Controller) con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────┐
│              Cliente (Angular)                   │
├─────────────────────────────────────────────────┤
│                  API REST (HTTP)                 │
├─────────────────────────────────────────────────┤
│  Controllers  │  Services  │  Repositories        │
├─────────────────────────────────────────────────┤
│  DTOs  │  Entities  │  Validators               │
├─────────────────────────────────────────────────┤
│              MongoDB (Base de datos)             │
└─────────────────────────────────────────────────┘
```

### Capas del Proyecto

#### 1. **Capa de Controladores** (`com.geststore.controllers`)
- Reciben las peticiones HTTP
- Validan los parámetros mediante `@Valid`
- Delegan la lógica de negocio a servicios
- Retornan respuestas estructuradas con `ApiResponse`

#### 2. **Capa de Servicios** (`com.geststore.services`)
- Contienen la lógica de negocio
- Implementan validaciones complejas
- Coordinan operaciones entre repositorios
- Manejan excepciones personalizadas

#### 3. **Capa de Repositorios** (`com.geststore.repositories`)
- Interfaces que extienden `MongoRepository`
- Métodos CRUD básicos automáticos
- Consultas personalizadas con `@Query`
- Proyecciones y agregaciones

#### 4. **Capa de Modelos** (`com.geststore.models`)
- **Entities**: Documentos persistidos en MongoDB
- **DTOs**: Objetos de transferencia de datos para API
- Separación clara entre modelo interno y externo

---

## API REST Documentación

### Acceso a la Documentación

La API cuenta con documentación interactiva completa:

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/v3/api-docs
- **OpenAPI YAML**: http://localhost:8080/api/v3/api-docs.yaml

### Estructura de Respuestas

Todos los endpoints retornan una respuesta estructurada:

```json
{
  "success": true,
  "message": "Descripción del resultado",
  "data": {
    // Datos específicos del endpoint
  },
  "timestamp": "2024-01-26T10:30:45"
}
```

### Códigos HTTP Utilizados

| Código | Significado | Uso |
|--------|------------|-----|
| **200** | OK | Operación exitosa (GET, PUT, PATCH) |
| **201** | Created | Recurso creado (POST) |
| **204** | No Content | Eliminación exitosa sin contenido |
| **400** | Bad Request | Datos inválidos o incompletos |
| **401** | Unauthorized | Falta autenticación (token inválido) |
| **403** | Forbidden | Autenticado pero sin permisos suficientes |
| **404** | Not Found | Recurso no existe |
| **422** | Unprocessable Entity | Validación fallida en datos |
| **500** | Internal Server Error | Error del servidor |

### Endpoints Principales

#### **1. Autenticación** (`/auth`)

```bash
POST /auth/register
# Registrar nuevo usuario
# Roles asignados por defecto: WORKER
# Retorna: token JWT + datos usuario

POST /auth/login
# Iniciar sesión
# Retorna: token JWT válido
```

#### **2. Usuarios** (`/users`)

```bash
GET    /users/me                   # Obtener perfil actual
PUT    /users/me                   # Actualizar perfil
PUT    /users/me/avatar            # Actualizar avatar
PUT    /users/me/password          # Cambiar contraseña

# Solo ADMIN/MANAGER:
GET    /users                      # Listar usuarios (paginado)
GET    /users/{id}                 # Obtener usuario
GET    /users/email/{email}        # Buscar por email
GET    /users/role/{role}          # Listar por rol
GET    /users/search?q={query}     # Buscar usuarios
POST   /users                      # Crear usuario (ADMIN)
PUT    /users/{id}                 # Actualizar usuario
DELETE /users/{id}                 # Desactivar usuario
POST   /users/{id}/activate        # Reactivar usuario
```

#### **3. Tareas** (`/tasks`)

```bash
# Públicos (sin autenticación):
GET    /tasks/all                       # Todas las tareas sin paginación

# Autenticados:
GET    /tasks                           # Listar tareas paginadas
GET    /tasks/{id}                      # Obtener tarea por ID
GET    /tasks/search?q={query}          # Buscar tareas
GET    /tasks/statistics/user/{userId}  # Estadísticas de usuario
GET    /tasks/statistics                # Estadísticas globales (MANAGER+)

# Solo MANAGER+:
GET    /tasks/user/{userId}             # Tareas asignadas a usuario
GET    /tasks/created-by/{userId}       # Tareas creadas por usuario
GET    /tasks/unassigned                # Tareas sin asignar
GET    /tasks/in-progress               # En progreso
GET    /tasks/overdue                   # Vencidas
GET    /tasks/high-priority             # Alta prioridad

# CRUD:
POST   /tasks                           # Crear tarea (requiere X-User-Id)
PUT    /tasks/{id}                      # Actualizar completamente
PATCH  /tasks/{id}                      # Actualizar parcialmente
DELETE /tasks/{id}                      # Eliminar tarea

# Transiciones de estado:
POST   /tasks/{id}/start                # Cambiar a EN PROGRESO
POST   /tasks/{id}/complete             # Marcar como COMPLETADA
POST   /tasks/{id}/cancel               # Cancelar tarea
PUT    /tasks/{id}/image                # Actualizar imagen (multipart)
```

#### **4. Productos** (`/products`)

```bash
GET    /products                        # Listar productos (paginados)
GET    /products/{id}                   # Obtener producto
GET    /products/sku/{sku}              # Buscar por SKU
GET    /products/category/{category}    # Productos por categoría
GET    /products/search?q={query}       # Buscar productos
GET    /products/low-stock              # Bajo inventario (MANAGER+)
GET    /products/out-of-stock           # Sin stock (MANAGER+)

POST   /products                        # Crear producto
PUT    /products/{id}                   # Actualizar producto
DELETE /products/{id}                   # Eliminar producto
```

#### **5. Asignación Producto-Tarea** (`/task-products`)

```bash
GET    /task-products/task/{taskId}     # Productos de una tarea
GET    /task-products/product/{productId}  # Tareas de un producto

POST   /task-products/assign            # Asignar producto a tarea
PUT    /task-products/{id}              # Actualizar asignación
POST   /task-products/{id}/use          # Registrar uso (consumo)
DELETE /task-products/{id}              # Remover producto de tarea
```

#### **6. Monitoreo** (`/actuator`)

```bash
GET    /api/actuator                    # Endpoints disponibles
GET    /api/actuator/health             # Health check
GET    /api/actuator/health/liveness    # Liveness probe
GET    /api/actuator/health/readiness   # Readiness probe
GET    /api/actuator/info               # Información de la app
GET    /api/actuator/metrics            # Métricas disponibles
GET    /api/actuator/env                # Variables de entorno
```

---

## Modelo de Datos

### Diagrama Entidad-Relación

```
┌─────────────┐        ┌──────────┐         ┌─────────────┐
│    User     │◄───────│   Task   │────────►│   Product   │
│             │        │          │         │             │
│ - id        │        │ - id     │         │ - id        │
│ - email     │        │ - title  │         │ - name      │
│ - password  │        │ - status │         │ - sku       │
│ - role      │        │ - owner  │         │ - stock     │
│ - active    │        │ - assign │         │ - price     │
└─────────────┘        └──────────┘         └─────────────┘
                              ▲                     ▲
                              │                     │
                              └─────────────────────┘
                          ┌────────────────────┐
                          │   TaskProduct      │
                          │                    │
                          │ - id               │
                          │ - taskId           │
                          │ - productId        │
                          │ - quantity         │
                          │ - used             │
                          └────────────────────┘
```

### Entidades Principales

#### **User**
```
{
  _id: ObjectId
  email: String (unique)
  password: String (bcrypt)
  name: String
  avatar: String (URL)
  role: Enum[ADMIN, MANAGER, WORKER]
  active: Boolean
  createdAt: LocalDateTime
  updatedAt: LocalDateTime
}
```

#### **Task**
```
{
  _id: ObjectId
  title: String
  description: String
  status: Enum[PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
  priority: Enum[LOW, MEDIUM, HIGH]
  createdBy: ObjectId (referencia User)
  assignedTo: ObjectId (referencia User) [nullable]
  dueDate: LocalDateTime [nullable]
  image: String (URL) [nullable]
  createdAt: LocalDateTime
  updatedAt: LocalDateTime
}
```

#### **Product**
```
{
  _id: ObjectId
  userId: ObjectId (referencia User)
  name: String
  sku: String
  description: String [nullable]
  category: String
  price: BigDecimal
  stock: Integer
  minStock: Integer
  createdAt: LocalDateTime
  updatedAt: LocalDateTime
}
```

#### **TaskProduct**
```
{
  _id: ObjectId
  taskId: ObjectId (referencia Task)
  productId: ObjectId (referencia Product)
  quantity: Integer (cantidad requerida)
  used: Integer (cantidad utilizada)
  createdAt: LocalDateTime
  updatedAt: LocalDateTime
}
```

### Relaciones

| Relación | Tipo | Descripción |
|----------|------|------------|
| User → Task (createdBy) | 1:N | Un usuario puede crear muchas tareas |
| User → Task (assignedTo) | 1:N | Un usuario puede tener muchas tareas asignadas |
| User → Product | 1:N | Un usuario posee muchos productos |
| Task → Product | N:N | Una tarea puede usar múltiples productos |
| Product → Task | N:N | Un producto se asigna a múltiples tareas |

---

## Instalación y Configuración

### Requisitos Previos

- **Java 17+**: [Descargar JDK](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.6+**: [Descargar Maven](https://maven.apache.org/download.cgi)
- **MongoDB 5.0+**: [Instalar MongoDB](https://www.mongodb.com/try/download/community) o usar [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git**: Para clonar el repositorio

### 1. Clonar el Repositorio

```bash
git clone https://github.com/your-org/geststore.git
cd geststore/backend
```

### 2. Configuración de Variables de Entorno

Crear archivo `.env` en la raíz del backend:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/geststore?retryWrites=true&w=majority

# JWT
JWT_SECRET=tu_clave_secreta_muy_larga_aqui_minimo_32_caracteres

# App
APP_PORT=8080
APP_ENV=development
```

### 3. Configuración de `application-dev.properties`

```properties
# MongoDB
spring.data.mongodb.uri=${MONGODB_URI}

# JWT
app.jwt.secret=${JWT_SECRET}
app.jwt.expiration=86400000

# Logging
logging.level.com.geststore=DEBUG
```

### 4. Instalar Dependencias

```bash
mvn clean install
```

### 5. Ejecutar la Aplicación

#### Modo desarrollo (con hot-reload):
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

#### Modo producción:
```bash
mvn clean package
java -jar target/geststore-backend-1.0.0.jar --spring.profiles.active=prod
```

### 6. Verificar Instalación

```bash
# Health check
curl http://localhost:8080/api/actuator/health

# Swagger UI
open http://localhost:8080/api/swagger-ui.html
```

---

## Guía de Uso

### Flujo de Autenticación

#### 1. Registro de Usuario

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "SecurePassword123!",
    "name": "Juan Pérez"
  }'
```

Respuesta:
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
  }
}
```

#### 2. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "SecurePassword123!"
  }'
```

#### 3. Usar el Token en Requests

El token JWT obtenido debe incluirse en el header `Authorization`:

```bash
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Crear y Gestionar Tareas

#### 1. Crear una Tarea

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: {userId}" \
  -d '{
    "title": "Preparar reportes",
    "description": "Generar reportes mensuales",
    "priority": "HIGH",
    "dueDate": "2024-02-15T17:00:00"
  }'
```

#### 2. Asignar una Tarea

```bash
curl -X PATCH http://localhost:8080/api/tasks/{taskId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "507f1f77bcf86cd799439012"
  }'
```

#### 3. Cambiar Estado de Tarea

```bash
# Iniciar tarea
curl -X POST http://localhost:8080/api/tasks/{taskId}/start \
  -H "Authorization: Bearer {token}"

# Completar tarea
curl -X POST http://localhost:8080/api/tasks/{taskId}/complete \
  -H "Authorization: Bearer {token}"

# Cancelar tarea
curl -X POST http://localhost:8080/api/tasks/{taskId}/cancel \
  -H "Authorization: Bearer {token}"
```

### Gestionar Productos

#### 1. Crear Producto

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: {userId}" \
  -d '{
    "name": "Cemento Gris",
    "sku": "CEMENT-001",
    "category": "Materiales",
    "price": 15.50,
    "stock": 100,
    "minStock": 20
  }'
```

#### 2. Asignar Producto a Tarea

```bash
curl -X POST http://localhost:8080/api/task-products/assign \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "507f1f77bcf86cd799439013",
    "productId": "507f1f77bcf86cd799439014",
    "quantity": 50
  }'
```

#### 3. Registrar Uso de Producto

```bash
curl -X POST http://localhost:8080/api/task-products/{taskProductId}/use \
  -H "Authorization: Bearer {token}" \
  -d 'quantity=25'
```

---

## Seguridad y Autenticación

### Sistema de Roles

El sistema implementa **3 roles principales**:

| Rol | Permisos | Casos de Uso |
|-----|----------|-------------|
| **ADMIN** | Acceso total | Administrador del sistema |
| **MANAGER** | CRUD completo en tareas, ver usuarios, crear/editar productos | Gestor de proyectos |
| **WORKER** | Ver tareas asignadas, actualizar estado, ver productos | Operario/trabajador |

### Control de Acceso

Se utiliza `@PreAuthorize` en los controladores:

```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<...> adminOnly() { ... }

@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public ResponseEntity<...> adminOrManager() { ... }

@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'WORKER')")
public ResponseEntity<...> allAuthenticated() { ... }
```

### Autenticación JWT

- **Algoritmo**: HS256
- **Expiración**: 24 horas (configurable)
- **Header obligatorio**: `Authorization: Bearer {token}`

El token es validado automáticamente por el `AuthInterceptor`.

### Seguridad en Endpoints

#### Headers Requeridos

| Header | Descripción | Obligatorio |
|--------|-------------|------------|
| `Authorization` | Token JWT | Sí (excepto `/auth/*`) |
| `X-User-Id` | ID del usuario actual | Sí para crear recursos |
| `Content-Type` | application/json | Sí (POST/PUT/PATCH) |

#### Validaciones Implementadas

✅ Validación de estructura JSON  
✅ Validación de campos requeridos  
✅ Validación de tipos de datos  
✅ Contraseña: mínimo 8 caracteres  
✅ Email: formato válido y único  
✅ Cantidad de productos: mayor que 0

---

## Estructura del Proyecto

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/geststore/
│   │   │   ├── GestStoreApplication.java          # Clase principal
│   │   │   │
│   │   │   ├── config/                            # Configuraciones
│   │   │   │   ├── SwaggerConfig.java             # OpenAPI/Swagger
│   │   │   │   ├── SecurityConfig.java            # Spring Security
│   │   │   │   ├── CorsConfig.java                # CORS
│   │   │   │   └── DataInitializer.java           # Datos iniciales
│   │   │   │
│   │   │   ├── controllers/                       # API REST
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── TaskController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   └── TaskProductController.java
│   │   │   │
│   │   │   ├── services/                          # Lógica de negocio
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── TaskService.java
│   │   │   │   ├── ProductService.java
│   │   │   │   └── TaskProductService.java
│   │   │   │
│   │   │   ├── repositories/                      # Acceso a datos
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── TaskRepository.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── StockRepository.java
│   │   │   │   └── TaskProductRepository.java
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── entities/                      # Documentos MongoDB
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Task.java
│   │   │   │   │   ├── Product.java
│   │   │   │   │   ├── TaskProduct.java
│   │   │   │   │   ├── Role.java (Enum)
│   │   │   │   │   ├── TaskStatus.java (Enum)
│   │   │   │   │   └── TaskPriority.java (Enum)
│   │   │   │   └── dtos/                         # DTOs para API
│   │   │   │       ├── AuthRequest.java
│   │   │   │       ├── AuthResponse.java
│   │   │   │       ├── UserRequestDto.java
│   │   │   │       ├── UserResponseDto.java
│   │   │   │       ├── TaskRequestDto.java
│   │   │   │       ├── TaskResponseDto.java
│   │   │   │       ├── ProductRequestDto.java
│   │   │   │       ├── ProductResponseDto.java
│   │   │   │       ├── TaskProductRequestDto.java
│   │   │   │       └── TaskProductResponseDto.java
│   │   │   │
│   │   │   ├── exceptions/                       # Excepciones personalizadas
│   │   │   │   ├── GestStoreException.java
│   │   │   │   ├── BusinessLogicException.java
│   │   │   │   ├── UnauthorizedException.java
│   │   │   │   ├── ValidationException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │
│   │   │   ├── utils/                            # Utilidades
│   │   │   │   ├── ApiResponse.java               # Estructura respuesta
│   │   │   │   ├── ApiPagination.java
│   │   │   │   └── ErrorResponse.java
│   │   │   │
│   │   │   ├── interceptors/                     # Interceptores HTTP
│   │   │   ├── guards/                           # Guards de seguridad
│   │   │   └── mappers/                          # MapStruct mappers
│   │   │
│   │   └── resources/
│   │       ├── application.properties             # Config general
│   │       ├── application-dev.properties         # Config desarrollo
│   │       └── application-prod.properties        # Config producción
│   │
│   └── test/
│       └── java/com/geststore/
│           ├── controllers/                       # Tests de controladores
│           ├── services/                          # Tests de servicios
│           └── repositories/                      # Tests de repos
│
├── docs/
│   ├── DOCUMENTACION_BACKEND.md                  # Este archivo
│   ├── MODELO_DATOS.md                           # Diagrama ER
│   └── SERVICIOS_CONTROLADORES.md                # Detalles técnicos
│
├── pom.xml                                        # Dependencias Maven
├── README.md                                      # Guía rápida
└── Dockerfile                                     # Contenedor Docker

```

### Patrones de Diseño Utilizados

1. **MVC**: Model-View-Controller separación clara
2. **DAO**: Data Access Object (Repositorios)
3. **Service Layer**: Lógica de negocio centralizada
4. **DTO**: Data Transfer Objects para API
5. **Singleton**: Beans de Spring
6. **Factory**: Creación de objetos (Mappers)
7. **Strategy**: Diferentes validaciones
8. **Observer**: Eventos de aplicación

---

## Monitoreo y Health Checks

### Endpoints de Actuator

```bash
# Estado general
curl http://localhost:8080/api/actuator/health

# Respuesta:
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
    }
  }
}
```

### Métricas Disponibles

```bash
# Listar métricas
curl http://localhost:8080/api/actuator/metrics

# Métrica específica
curl http://localhost:8080/api/actuator/metrics/jvm.memory.used
```

---

## Conclusión

GestStore Backend proporciona una **API profesional, documentada y segura** para la gestión integral de tareas y productos. Cumple con todos los criterios de la rúbrica DWES v1.2:

✅ **API REST (70%)**
- Recursos bien diseñados
- Puntos de entrada organizados
- Códigos HTTP correctos
- Autenticación y autorización con roles
- Documentación con Swagger
- Pruebas de API incluidas

✅ **MVC (Estructura)**
- Separación clara de responsabilidades
- Validaciones independientes
- Autenticación y roles aplicados

✅ **Modelo de Datos (30%)**
- Entidades bien relacionadas
- Consultas complejas
- Estructura definida y documentada

---