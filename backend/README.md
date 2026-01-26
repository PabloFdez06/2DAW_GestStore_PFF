# GestStore Backend

API REST para gestionar tareas y almacén de una empresa. Desarrollado con **Spring Boot 3** y **MongoDB**.

## Índice

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecutar la Aplicación](#ejecutar-la-aplicación)
- [Documentación](#documentación)
- [API Endpoints](#api-endpoints)

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/geststore/
│   │   │   ├── GestStoreApplication.java          # Clase principal
│   │   │   ├── config/                             # Configuraciones
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── SwaggerConfig.java
│   │   │   ├── models/
│   │   │   │   ├── entities/                       # Entidades MongoDB
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Task.java
│   │   │   │   │   ├── Product.java
│   │   │   │   │   ├── TaskProduct.java
│   │   │   │   │   ├── Role.java (Enum)
│   │   │   │   │   ├── TaskStatus.java (Enum)
│   │   │   │   │   └── TaskPriority.java (Enum)
│   │   │   │   └── dtos/                           # Data Transfer Objects
│   │   │   │       ├── User*Dto.java
│   │   │   │       ├── Task*Dto.java
│   │   │   │       ├── Product*Dto.java
│   │   │   │       └── TaskProduct*Dto.java
│   │   │   ├── controllers/                        # REST Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── TaskController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   └── TaskProductController.java
│   │   │   ├── services/                           # Servicios de negocio
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── TaskService.java
│   │   │   │   ├── ProductService.java
│   │   │   │   └── TaskProductService.java
│   │   │   ├── repositories/                       # Interfaces de Repositorio
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── TaskRepository.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   └── TaskProductRepository.java
│   │   │   ├── exceptions/                         # Excepciones personalizadas
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── BadRequestException.java
│   │   │   │   ├── UnauthorizedException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── utils/                              # Utilidades
│   │   │       ├── JwtTokenProvider.java
│   │   │       └── SecurityUtils.java
│   │   └── resources/
│   │       ├── application.properties              # Configuración general
│   │       ├── application-dev.properties          # Perfil desarrollo
│   │       └── application-prod.properties         # Perfil producción
│   └── test/
├── docs/
│   ├── DOCUMENTACION_BACKEND.md                   # Documentación técnica completa
│   ├── API_ENDPOINTS_REFERENCE.md                 # Referencia de endpoints
│   ├── MODELO_DATOS.md                            # Modelo de datos
│   └── RESUMEN_DOCUMENTACION.md                   # Resumen ejecutivo
├── pom.xml                                         # Dependencias Maven
└── README.md                                       # Este archivo

```

---

## 📋 Requisitos

- **Java 17** o superior
- **Maven 3.8+**
- **MongoDB 5.0+**
- **Git**

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/GestStore.git
cd GestStore/backend
```

### 2. Instalar dependencias
```bash
mvn clean install
```

---

## ⚙️ Configuración

### Configuración de Base de Datos

Edita `src/main/resources/application-dev.properties`:

```properties
# MongoDB
spring.data.mongodb.uri=mongodb+srv://usuario:contraseña@cluster.mongodb.net/geststore
spring.data.mongodb.database=geststore

# JWT
app.jwt.secret=tu_clave_secreta_muy_segura_minimo_32_caracteres
app.jwt.expiration=86400000
```

### Perfiles de Ejecución

- **dev** (desarrollo): Configuración de desarrollo con logs detallados
- **prod** (producción): Configuración optimizada para producción

---

## ▶️ Ejecutar la Aplicación

### Desarrollo
```bash
# Con Maven
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# O con IDE (ejecuta GestStoreApplication.java)
```

### Producción
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
```

La aplicación estará disponible en: **http://localhost:8080/api**

---

## 📚 Documentación

### Documentación Técnica Completa

He generado documentación detallada del backend que incluye:

- **DOCUMENTACION_BACKEND.md**: Guía técnica completa con:
  - Introducción y características
  - Arquitectura general (patrón MVC)
  - Explicación de capas (Controllers, Services, Repositories)
  - Documentación API REST
  - Modelo de datos con diagrama ER
  - Guía de instalación paso a paso
  - Ejemplos de uso con curl
  - Seguridad y autenticación JWT
  - Estructura del proyecto
  - Monitoreo con Actuator

- **API_ENDPOINTS_REFERENCE.md**: Referencia completa de:
  - 52+ endpoints documentados
  - Ejemplos de request y response
  - Códigos de error
  - Headers requeridos
  - Parámetros de query
  - Niveles de seguridad por endpoint

- **MODELO_DATOS.md**: Documentación del modelo:
  - Diagrama E/R (Entidad-Relación)
  - Descripción de todas las entidades
  - Decisiones de diseño
  - Consultas personalizadas
  - DTOs

### Acceso a Documentación Interactiva

Una vez ejecutada la aplicación:

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/v3/api-docs
- **OpenAPI YAML**: http://localhost:8080/api/v3/api-docs.yaml
- **Health Check**: http://localhost:8080/api/actuator/health
- **Métricas**: http://localhost:8080/api/actuator/metrics

---

## 🔌 API Endpoints

### Autenticación
```
POST   /auth/register         - Registrar nuevo usuario
POST   /auth/login            - Iniciar sesión
```

### Usuarios
```
GET    /users/me              - Obtener perfil actual
GET    /users                 - Listar todos los usuarios (ADMIN/MANAGER)
GET    /users/{id}            - Obtener usuario específico
POST   /users                 - Crear nuevo usuario (ADMIN)
PUT    /users/{id}            - Actualizar usuario
DELETE /users/{id}            - Desactivar usuario
PUT    /users/me/avatar       - Actualizar avatar
PUT    /users/me/password     - Cambiar contraseña
```

### Tareas
```
GET    /tasks                 - Listar tareas (paginado)
GET    /tasks/{id}            - Obtener tarea específica
POST   /tasks                 - Crear nueva tarea
PUT    /tasks/{id}            - Actualizar tarea
PATCH  /tasks/{id}            - Actualización parcial
DELETE /tasks/{id}            - Eliminar tarea
POST   /tasks/{id}/start      - Iniciar tarea
POST   /tasks/{id}/complete   - Completar tarea
POST   /tasks/{id}/cancel     - Cancelar tarea
GET    /tasks/user/{userId}   - Tareas de un usuario
GET    /tasks/created-by/{userId} - Tareas creadas por usuario
GET    /tasks/unassigned      - Tareas sin asignar
GET    /tasks/in-progress     - Tareas en progreso
GET    /tasks/overdue         - Tareas vencidas
GET    /tasks/high-priority   - Tareas de alta prioridad
GET    /tasks/search          - Buscar tareas
GET    /tasks/statistics      - Estadísticas de tareas
```

### Productos
```
GET    /products              - Listar productos (paginado)
GET    /products/{id}         - Obtener producto específico
POST   /products              - Crear nuevo producto
PUT    /products/{id}         - Actualizar producto
DELETE /products/{id}         - Eliminar producto
GET    /products/sku/{sku}    - Buscar por SKU
GET    /products/category/{cat} - Productos por categoría
GET    /products/search       - Búsqueda de productos
GET    /products/low-stock    - Productos con bajo stock
GET    /products/out-of-stock - Productos agotados
```

### Task-Products
```
GET    /task-products/task/{taskId}    - Productos de tarea
GET    /task-products/product/{prodId} - Tareas de producto
POST   /task-products/assign           - Asignar producto a tarea
PUT    /task-products/{id}             - Actualizar asignación
POST   /task-products/{id}/use         - Registrar uso
DELETE /task-products/{id}             - Remover asignación
```

### Monitoreo (Actuator)
```
GET    /actuator/health               - Estado general
GET    /actuator/health/liveness      - Probe de disponibilidad
GET    /actuator/health/readiness     - Probe de preparación
GET    /actuator/info                 - Información de aplicación
GET    /actuator/metrics              - Métricas de rendimiento
```

---

## 🔐 Autenticación y Autorización

### Obtener Token JWT

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "SecurePassword123!"
  }'
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

### Usar Token en Requests

```bash
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer {token}"
```

### Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ADMIN** | Administrador del sistema | Acceso total, gestión de usuarios |
| **MANAGER** | Gestor de tareas y productos | CRUD completo de tareas, ver productos |
| **WORKER** | Trabajador | Ver tareas asignadas, actualizar estado |

---

## 🛠️ Tecnologías

- **Spring Boot 3.2.0**: Framework principal
- **Spring Data MongoDB**: Acceso a datos NoSQL
- **Spring Security**: Autenticación y autorización
- **JWT (JJWT 0.12.3)**: Autenticación sin estado
- **Springdoc OpenAPI 2.1.0**: Documentación automática (Swagger/OpenAPI)
- **Spring Boot Actuator**: Monitoreo y health checks
- **MapStruct 1.5.5**: Mapeador de DTOs
- **Lombok**: Generador de boilerplate
- **MongoDB Connector**: Driver para MongoDB

---

## 📝 Buenas Prácticas Implementadas

- Separación de capas: Controllers → Services → Repositories → Entities
- DTOs Request/Response: No exponer entidades directamente al cliente
- Consultas personalizadas: Métodos optimizados en repositorios
- Validaciones: Anotaciones de Spring Validation en DTOs
- Manejo centralizado de errores: GlobalExceptionHandler
- CORS configurado: Para comunicación con frontend Angular
- Perfiles de aplicación: dev/prod
- Auditoria: Campos createdAt y updatedAt en entidades
- Documentación automática: Anotaciones Swagger en todos los endpoints
- Seguridad: JWT con roles y autorización por método

---

## 🧪 Tests

```bash
# Ejecutar todos los tests
mvn test

# Test específico
mvn test -Dtest=TaskControllerTest

# Con reporte de cobertura
mvn test jacoco:report
```

---

## 🐛 Troubleshooting

### Error: "MongoDB connection refused"
**Solución**: Verifica que MongoDB está corriendo o configura MongoDB Atlas en `application-dev.properties`

### Error: "JWT token expired"
**Solución**: Realiza login nuevamente para obtener un nuevo token

### Error: "Access denied" (403)
**Solución**: Verifica que tu rol (ADMIN/MANAGER/WORKER) tiene permisos para la acción solicitada

### Puerto 8080 en uso
**Solución**: Cambia el puerto en `application.properties`:
```properties
server.port=8081
```

---

## 📖 Próximas Mejoras

1. Implementar rate limiting para proteger endpoints
2. Agregar tests unitarios e integración
3. Configurar CI/CD con GitHub Actions
4. Integrar caché con Redis
5. Implementar auditoría de accesos
6. Agregar notificaciones por email

---

## 👨‍💻 Autor

Desarrollado como parte del **Proyecto Fin de Forma (PFF)** en 2DAW

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](../LICENSE)
