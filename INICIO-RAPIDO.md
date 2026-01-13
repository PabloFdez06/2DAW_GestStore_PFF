# 🚀 GestStore - Guía de Inicio Rápido

Esta guía te ayudará a levantar el proyecto completo con Docker en pocos minutos.

## 📋 Prerrequisitos

- **Docker Desktop** instalado y en ejecución
- **Git** (para clonar el repositorio)
- Al menos **4GB de RAM** libres
- Puertos libres: **80** (frontend), **8080** (backend), **3306** (MySQL), **8081** (Adminer)

## 🎯 Inicio Rápido (3 pasos)

### 1️⃣ Configurar variables de entorno

```bash
# En la raíz del proyecto
cp .env.example .env
```

El archivo `.env` ya tiene valores por defecto que funcionan. Solo edítalo si necesitas cambiar puertos o contraseñas.

### 2️⃣ Levantar todos los servicios

```bash
docker-compose up -d
```

Este comando:
- ✅ Descarga las imágenes necesarias
- ✅ Construye el backend (Spring Boot)
- ✅ Construye el frontend (Angular)
- ✅ Crea la base de datos MySQL
- ✅ Inserta datos de prueba
- ✅ Levanta Adminer para gestión de BD

**Primera vez**: Puede tardar 5-10 minutos mientras descarga y construye todo.

### 3️⃣ Acceder a la aplicación

Una vez que los servicios estén saludables (puedes verificarlo con `docker-compose ps`):

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Adminer (Gestor BD)**: http://localhost:8081
  - Sistema: **MySQL**
  - Servidor: **db**
  - Usuario: **geststore**
  - Contraseña: **geststore123**
  - Base de datos: **geststore_dev**

## 📊 Ver el Dashboard

1. Abre tu navegador en http://localhost
2. Navega a la sección **Dashboard**
3. Verás las tareas cargadas desde la base de datos
4. Si no hay tareas, verás el mensaje "Aún no existen tareas"

## 🔍 Verificar que todo funciona

### Verificar estado de los contenedores
```bash
docker-compose ps
```

Todos los servicios deberían estar en estado `healthy`.

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo el backend
docker-compose logs -f backend

# Solo el frontend
docker-compose logs -f frontend
```

### Verificar la API
```bash
# En PowerShell
Invoke-WebRequest -Uri http://localhost:8080/api/tasks/all

# En bash/Linux
curl http://localhost:8080/api/tasks/all
```

Deberías recibir un JSON con las tareas de prueba.

## 🛠️ Comandos Útiles

### Reiniciar un servicio específico
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Ver logs de errores
```bash
docker-compose logs --tail=100 backend
```

### Reconstruir desde cero
```bash
# Detener y eliminar todo
docker-compose down -v

# Reconstruir sin cache
docker-compose build --no-cache

# Levantar de nuevo
docker-compose up -d
```

### Acceder a un contenedor
```bash
# Backend
docker-compose exec backend sh

# Base de datos
docker-compose exec db mysql -u geststore -p
# Contraseña: geststore123
```

## 📝 Datos de Prueba

El proyecto incluye datos de prueba:

### Usuarios:
- **Admin**: admin@geststore.com
- **Manager (Pablo)**: pablo@geststore.com
- **Worker (Juan)**: juan@geststore.com
- **Contraseña para todos**: password123

### Tareas:
- 7 tareas de ejemplo con diferentes estados
- 3 tareas pendientes/en progreso
- 2 tareas completadas
- Productos y stock asociados

## 🐛 Solución de Problemas

### Error: "Port already in use"
Un puerto está ocupado. Opciones:
1. Cambiar el puerto en `.env`:
   ```
   FRONTEND_PORT=8000
   BACKEND_PORT=8888
   ```
2. Detener la aplicación que usa ese puerto

### Error: "Cannot connect to database"
```bash
# Verificar que MySQL está saludable
docker-compose ps db

# Ver logs de la BD
docker-compose logs db

# Reiniciar la BD
docker-compose restart db
```

### Error: "Backend returns 404"
```bash
# Verificar que el backend está levantado
docker-compose logs backend

# Reconstruir el backend
docker-compose build --no-cache backend
docker-compose up -d backend
```

### El frontend no carga las tareas
1. Verifica que el backend esté funcionando: http://localhost:8080/api/tasks/all
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que no hay errores CORS en la consola

### Limpiar y empezar de cero
```bash
# Parar y eliminar todo (incluidos volúmenes)
docker-compose down -v

# Limpiar imágenes no utilizadas
docker system prune -a

# Volver a levantar
docker-compose up -d
```

## 📚 Estructura del Proyecto

```
.
├── backend/                 # Spring Boot API
│   ├── Dockerfile
│   ├── init-db/            # Scripts SQL de inicialización
│   └── src/
├── GestStore/              # Angular Frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── docker-compose.yml      # Orquestación de servicios
├── .env.example           # Plantilla de variables
└── DOCKER-README.md       # Documentación de Docker
```

## 🎨 Características Implementadas

✅ Dashboard funcional con datos reales de la API  
✅ Carga dinámica de tareas desde MySQL  
✅ Mensaje cuando no existen tareas  
✅ Estadísticas en tiempo real  
✅ Sistema completo dockerizado  
✅ Base de datos con datos de prueba  
✅ Hot-reload en desarrollo  
✅ CORS configurado  
✅ Health checks en todos los servicios  

## 🔗 Endpoints Principales de la API

- `GET /api/tasks/all` - Todas las tareas
- `GET /api/tasks/{id}` - Tarea por ID
- `POST /api/tasks` - Crear tarea
- `PUT /api/tasks/{id}` - Actualizar tarea
- `POST /api/tasks/{id}/complete` - Completar tarea
- `POST /api/tasks/{id}/cancel` - Cancelar tarea
- `GET /api/tasks/statistics` - Estadísticas

## 💡 Próximos Pasos

1. **Autenticación**: Implementar JWT para autenticación real
2. **Roles**: Activar control de acceso por roles
3. **Testing**: Agregar tests unitarios e integración
4. **CI/CD**: Configurar pipeline de despliegue
5. **Monitoreo**: Agregar Prometheus y Grafana

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los logs: `docker-compose logs`
2. Verifica el estado: `docker-compose ps`
3. Consulta la sección "Solución de Problemas"

---

**¡Listo!** 🎉 Ahora tienes GestStore funcionando completamente con Docker.
