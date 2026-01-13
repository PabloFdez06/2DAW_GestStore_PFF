# GestStore - Docker

Este directorio contiene la configuración de Docker para el proyecto GestStore.

## 📋 Requisitos Previos

- Docker 20.10 o superior
- Docker Compose 2.0 o superior
- 4GB RAM mínimo disponible
- 10GB espacio en disco

## 🚀 Inicio Rápido

1. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores personalizados
```

2. **Levantar todos los servicios**
```bash
docker-compose up -d
```

3. **Ver logs de los servicios**
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:80
- Backend API: http://localhost:8080/api
- Adminer (Gestor BD): http://localhost:8081

## 📦 Servicios

### Base de Datos (MySQL 8.0)
- Puerto: 3306
- Usuario: geststore
- Base de datos: geststore_dev

### Backend (Spring Boot)
- Puerto: 8080
- Endpoint: /api
- Health check: http://localhost:8080/api/actuator/health

### Frontend (Angular + Nginx)
- Puerto: 80
- Proxy API configurado en /api

### Adminer
- Puerto: 8081
- Servidor: db

## 🛠️ Comandos Útiles

### Construir y levantar servicios
```bash
# Construcción completa desde cero
docker-compose build --no-cache

# Levantar servicios
docker-compose up -d

# Levantar servicios específicos
docker-compose up -d db backend
```

### Gestión de servicios
```bash
# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores y volúmenes
docker-compose down -v

# Reiniciar servicio específico
docker-compose restart backend
```

### Logs y debugging
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver últimas 100 líneas de logs
docker-compose logs --tail=100

# Ver logs de un servicio
docker-compose logs -f backend
```

### Acceder a contenedores
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Base de datos
docker-compose exec db mysql -u geststore -p
```

### Limpieza
```bash
# Eliminar contenedores, redes y volúmenes
docker-compose down -v

# Limpiar imágenes no utilizadas
docker image prune -a

# Limpiar todo el sistema Docker
docker system prune -a --volumes
```

## 🔧 Configuración de Desarrollo

Para desarrollo local, puedes montar volúmenes para hot-reload:

```yaml
# Agregar en docker-compose.yml bajo el servicio backend
volumes:
  - ./backend/src:/app/src

# Agregar en docker-compose.yml bajo el servicio frontend
volumes:
  - ./GestStore/src:/app/src
```

## 🐛 Solución de Problemas

### El backend no se conecta a la base de datos
1. Verificar que el servicio de BD esté saludable:
   ```bash
   docker-compose ps
   ```
2. Verificar las credenciales en `.env`
3. Revisar logs del backend:
   ```bash
   docker-compose logs backend
   ```

### Puerto ya en uso
Si un puerto está ocupado, cambiar en `.env`:
```
FRONTEND_PORT=8000
BACKEND_PORT=8888
DB_PORT=3307
```

### Reconstruir desde cero
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Ver uso de recursos
```bash
docker stats
```

## 📝 Variables de Entorno

Ver [.env.example](.env.example) para lista completa de variables configurables.

### Variables Principales:
- `DB_ROOT_PASSWORD`: Contraseña del usuario root de MySQL
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña del usuario
- `BACKEND_PORT`: Puerto del backend
- `FRONTEND_PORT`: Puerto del frontend
- `SPRING_PROFILE`: Perfil de Spring (dev, prod)
- `JAVA_OPTS`: Opciones JVM para el backend

## 🔒 Seguridad en Producción

Para producción, asegúrate de:
1. Cambiar todas las contraseñas por defecto
2. Usar contraseñas seguras y complejas
3. Configurar HTTPS con certificados SSL
4. Usar secretos de Docker en lugar de variables de entorno para datos sensibles
5. Limitar puertos expuestos solo a los necesarios
6. Actualizar regularmente las imágenes base

## 📚 Documentación Adicional

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [Angular Docker Deployment](https://angular.io/guide/deployment)
