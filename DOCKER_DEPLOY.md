# 🐳 Guía de Despliegue con Docker - GestStore

Esta guía proporciona instrucciones paso a paso para desplegar GestStore en local usando Docker Compose.

## 📋 Requisitos Previos

- Docker Desktop instalado y ejecutándose
- Docker Compose (incluido con Docker Desktop)
- Al menos 4GB de RAM disponible para los contenedores
- Puertos disponibles: 80, 8080, 27017, 8081

## 🚀 Despliegue Rápido

### 1. Verificar el archivo .env

Asegúrate de que el archivo `.env` en la raíz del proyecto tiene la configuración correcta:

```env
# Base de Datos MongoDB
DB_NAME=geststore_dev
DB_USER=geststore
DB_PASSWORD=geststore123
DB_PORT=27017

# Backend Spring Boot
BACKEND_PORT=8080
SPRING_PROFILE=prod
JAVA_OPTS=-Xms256m -Xmx512m

# Frontend Angular
FRONTEND_PORT=80

# Mongo Express (Gestor de Base de Datos)
MONGO_EXPRESS_PORT=8081
```

### 2. Construir y levantar los contenedores

Desde la raíz del proyecto, ejecuta:

```powershell
# Construir y levantar todos los servicios
docker-compose up --build -d

# O si usas Docker Compose v2:
docker compose up --build -d
```

### 3. Verificar el estado de los contenedores

```powershell
docker-compose ps
```

Deberías ver 4 contenedores ejecutándose:
- `geststore-db` (MongoDB)
- `geststore-backend` (Spring Boot API)
- `geststore-frontend` (Angular + Nginx)
- `geststore-mongo-express` (Administrador de MongoDB)

### 4. Acceder a la aplicación

Una vez que todos los servicios estén saludables (puede tardar 1-2 minutos):

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **Mongo Express**: http://localhost:8081

## 🔍 Verificación de Salud

### Comprobar logs

```powershell
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Health Checks

El docker-compose incluye health checks para todos los servicios:

```powershell
# Ver el estado de salud
docker inspect geststore-backend --format='{{json .State.Health}}'
docker inspect geststore-frontend --format='{{json .State.Health}}'
docker inspect geststore-db --format='{{json .State.Health}}'
```

### Endpoints de salud

- **Backend**: http://localhost:8080/api/actuator/health
- **Frontend**: http://localhost

## 🛠️ Comandos Útiles

### Detener los contenedores

```powershell
docker-compose stop
```

### Iniciar contenedores detenidos

```powershell
docker-compose start
```

### Detener y eliminar contenedores

```powershell
docker-compose down
```

### Eliminar contenedores y volúmenes (¡cuidado! se perderán los datos)

```powershell
docker-compose down -v
```

### Reconstruir un servicio específico

```powershell
# Reconstruir y reiniciar el backend
docker-compose up -d --build backend

# Reconstruir y reiniciar el frontend
docker-compose up -d --build frontend
```

### Ver recursos utilizados

```powershell
docker stats
```

## 🐛 Solución de Problemas

### El backend no arranca

1. Verificar que MongoDB está saludable:
   ```powershell
   docker-compose logs db
   ```

2. Verificar logs del backend:
   ```powershell
   docker-compose logs backend
   ```

3. Comprobar conectividad a MongoDB:
   ```powershell
   docker exec -it geststore-backend wget -qO- http://localhost:8080/api/actuator/health
   ```

### El frontend no carga

1. Verificar que Nginx está ejecutándose:
   ```powershell
   docker exec -it geststore-frontend nginx -t
   ```

2. Ver logs del frontend:
   ```powershell
   docker-compose logs frontend
   ```

3. Verificar que el backend está accesible desde el frontend:
   ```powershell
   docker exec -it geststore-frontend wget -qO- http://backend:8080/api/actuator/health
   ```

### Error de conexión a MongoDB

Si ves errores de conexión a MongoDB, verifica:

1. Que el contenedor de MongoDB está ejecutándose:
   ```powershell
   docker-compose ps db
   ```

2. Que las credenciales en `.env` son correctas

3. Reiniciar el servicio de base de datos:
   ```powershell
   docker-compose restart db
   ```

### Puertos ya en uso

Si algún puerto está ocupado, puedes cambiarlos en el archivo `.env`:

```env
BACKEND_PORT=8090  # Cambiar de 8080 a 8090
FRONTEND_PORT=3000  # Cambiar de 80 a 3000
DB_PORT=27018  # Cambiar de 27017 a 27018
```

Luego, reinicia los contenedores:
```powershell
docker-compose down
docker-compose up -d
```

## 🔄 Actualización de Código

### Desarrollo del Backend

Para ver cambios en el código del backend:

```powershell
# Reconstruir la imagen del backend
docker-compose build backend

# Reiniciar el servicio
docker-compose up -d backend
```

### Desarrollo del Frontend

Para ver cambios en el código del frontend:

```powershell
# Reconstruir la imagen del frontend
docker-compose build frontend

# Reiniciar el servicio
docker-compose up -d frontend
```

## 📦 Gestión de Datos

### Backup de MongoDB

```powershell
# Crear backup
docker exec geststore-db mongodump --authenticationDatabase admin -u geststore -p geststore123 -d geststore_dev -o /data/backup

# Copiar backup a tu máquina
docker cp geststore-db:/data/backup ./mongodb-backup
```

### Restaurar MongoDB

```powershell
# Copiar backup al contenedor
docker cp ./mongodb-backup geststore-db:/data/restore

# Restaurar
docker exec geststore-db mongorestore --authenticationDatabase admin -u geststore -p geststore123 -d geststore_dev /data/restore/geststore_dev
```

## 🔐 Seguridad para Producción

**⚠️ IMPORTANTE**: Antes de desplegar en producción:

1. Cambiar las contraseñas en `.env`:
   ```env
   DB_USER=usuario_seguro
   DB_PASSWORD=contraseña_muy_segura_y_larga
   ```

2. Usar secretos de Docker en lugar de variables de entorno

3. Configurar HTTPS con certificados SSL

4. Limitar la exposición de puertos (especialmente MongoDB y Mongo Express)

5. Configurar firewall y reglas de red apropiadas

6. Revisar y aplicar actualizaciones de seguridad regularmente

## 📚 Recursos Adicionales

- [Documentación del Backend](backend/docs/DOCUMENTACION_BACKEND.md)
- [Documentación del Frontend](GestStore/docs/cliente/DOCUMENTACION_CLIENTE.md)
- [API Reference](backend/docs/API_ENDPOINTS_REFERENCE.md)
- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)

## 🆘 Soporte

Si encuentras problemas no cubiertos en esta guía, verifica:

1. Los logs de Docker: `docker-compose logs`
2. El estado de los contenedores: `docker-compose ps`
3. La documentación específica de cada componente

---

**Nota**: Esta configuración está optimizada para desarrollo local. Para producción, se recomienda usar configuraciones adicionales de seguridad y optimización.
