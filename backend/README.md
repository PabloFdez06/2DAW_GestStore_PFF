# GestStore Backend

API REST para gestionar tareas y almacén de una empresa. Desarrollado con **Spring Boot 3** y **MySQL**.

## 📋 Índice

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
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── models/
│   │   │   │   ├── entities/                       # Entidades JPA
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Task.java
│   │   │   │   │   ├── Product.java
│   │   │   │   │   ├── Stock.java
│   │   │   │   │   ├── TaskProduct.java
│   │   │   │   │   ├── Role.java (Enum)
│   │   │   │   │   ├── TaskStatus.java (Enum)
│   │   │   │   │   └── TaskPriority.java (Enum)
│   │   │   │   └── dtos/                           # Data Transfer Objects
│   │   │   │       ├── User*Dto.java
│   │   │   │       ├── Task*Dto.java
│   │   │   │       ├── Product*Dto.java
│   │   │   │       ├── Stock*Dto.java
│   │   │   │       └── TaskProduct*Dto.java
│   │   │   └── repositories/                       # Interfaces de Repositorio
│   │   │       ├── UserRepository.java
│   │   │       ├── TaskRepository.java
│   │   │       ├── ProductRepository.java
│   │   │       ├── StockRepository.java
│   │   │       └── TaskProductRepository.java
│   │   └── resources/
│   │       ├── application.properties              # Configuración general
│   │       ├── application-dev.properties          # Perfil desarrollo
│   │       └── application-prod.properties         # Perfil producción
│   └── test/
├── docs/
│   └── MODELO_DATOS.md                            # Documentación del modelo
├── pom.xml                                         # Dependencias Maven
└── README.md                                       # Este archivo

```

---

## 📋 Requisitos

- **Java 17** o superior
- **Maven 3.8+**
- **MySQL 8.0+**
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

### 3. Crear base de datos
```sql
-- En MySQL
CREATE DATABASE geststore_dev;
USE geststore_dev;
```

---

## ⚙️ Configuración

### Configuración de Base de Datos

Edita `src/main/resources/application-dev.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/geststore_dev
spring.datasource.username=root
spring.datasource.password=tu_contraseña
```

### Perfiles de Ejecución

- **dev** (desarrollo): `spring.jpa.hibernate.ddl-auto=create-drop`
- **prod** (producción): `spring.jpa.hibernate.ddl-auto=validate`

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

### Modelo de Datos
Lee la documentación completa del modelo en: [`docs/MODELO_DATOS.md`](./docs/MODELO_DATOS.md)

Incluye:
- ✅ Diagrama E/R (Entidad-Relación)
- ✅ Descripción de todas las entidades
- ✅ Decisiones de diseño
- ✅ Consultas personalizadas
- ✅ DTOs

### Diagrama E/R

```
USER (1:N)──→ TASK (N:M)──→ PRODUCT (1:1)──→ STOCK
     └──────────────────────────────────┘
              TASK_PRODUCT
```

---

## 🔌 API Endpoints

### Authentication (Futuro)
```
POST   /api/auth/login         - Login de usuario
POST   /api/auth/register      - Registro de usuario
POST   /api/auth/logout        - Logout
```

### Users
```
GET    /api/users              - Listar todos los usuarios
GET    /api/users/:id          - Obtener usuario por ID
POST   /api/users              - Crear nuevo usuario
PUT    /api/users/:id          - Actualizar usuario
DELETE /api/users/:id          - Eliminar usuario (soft delete)
```

### Tasks
```
GET    /api/tasks              - Listar todas las tareas
GET    /api/tasks/:id          - Obtener tarea por ID
POST   /api/tasks              - Crear nueva tarea
PUT    /api/tasks/:id          - Actualizar tarea
DELETE /api/tasks/:id          - Eliminar tarea
GET    /api/tasks/user/:userId - Tareas del usuario
```

### Products
```
GET    /api/products           - Listar todos los productos
GET    /api/products/:id       - Obtener producto por ID
POST   /api/products           - Crear nuevo producto
PUT    /api/products/:id       - Actualizar producto
DELETE /api/products/:id       - Eliminar producto
```

### Stock
```
GET    /api/stock              - Listar inventario
GET    /api/stock/product/:id  - Stock de producto específico
PUT    /api/stock/:id          - Actualizar stock
GET    /api/stock/low          - Productos con bajo stock
```

---

## 🛠️ Tecnologías

- **Spring Boot 3.2.0**: Framework principal
- **Spring Data JPA**: Acceso a datos ORM
- **Spring Security**: Autenticación y autorización
- **MySQL Connector**: Driver MySQL
- **Lombok**: Generador de boilerplate (getters, setters, etc.)
- **MapStruct**: Mapeador de DTOs
- **JWT**: Autenticación sin estado (futuro)

---

## 📝 Notas de Desarrollo

### Buenas Prácticas Implementadas

✅ **Separación de capas**: Entities, DTOs, Repositories
✅ **DTOs Request/Response**: No exponer entidades directamente
✅ **Consultas personalizadas**: Métodos en repositorios optimizados
✅ **Índices de BD**: En campos frecuentemente buscados
✅ **Auditoria**: Campos created_at y updated_at
✅ **Soft Delete**: Campo active en lugar de eliminar
✅ **Validaciones**: Con anotaciones de Spring Validation
✅ **CORS configurado**: Para comunicación con frontend
✅ **Profiles de aplicación**: dev/prod

---

## 🐛 Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
**Solución**: Verifica las credenciales en `application-dev.properties`

### Error: "Table doesn't exist"
**Solución**: Asegúrate de que tienes el perfil dev activo (`spring.jpa.hibernate.ddl-auto=create-drop`)

### Puerto 8080 en uso
```bash
# Cambiar puerto en application.properties
server.port=8081
```

---

## 📖 Próximas Fases

1. **Servicios**: Lógica de negocio en capas de servicio
2. **Controladores**: REST endpoints
3. **Autenticación JWT**: Seguridad avanzada
4. **Validaciones**: Bean Validation
5. **Manejo de errores**: ExceptionHandler global
6. **Tests unitarios**: JUnit + Mockito

---

## 👨‍💻 Autor

Desarrollado como parte del **Proyecto Fin de Forma (PFF)** en 2DAW

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](../LICENSE)
