# Guía de Despliegue en Koyeb - GestStore

## Arquitectura

Este Dockerfile unificado contiene:
- **Frontend**: Angular 17+ servido por Nginx
- **Backend**: Spring Boot 3.x con Java 17

> ⚠️ **IMPORTANTE**: La base de datos MongoDB debe ser externa (MongoDB Atlas recomendado)

## Paso 1: Configurar MongoDB Atlas (Gratuito)

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear una cuenta gratuita
3. Crear un cluster (el tier gratuito M0 es suficiente)
4. En **Database Access**: Crear un usuario con permisos de lectura/escritura
5. En **Network Access**: Añadir `0.0.0.0/0` para permitir conexiones desde cualquier IP
6. Obtener la **Connection String**:
   ```
   mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## Paso 2: Desplegar en Koyeb

### Opción A: Desde GitHub (Recomendado)

1. Ir a [Koyeb](https://www.koyeb.com/)
2. Crear una nueva App → **Web Service**
3. Conectar tu repositorio de GitHub
4. Configurar:
   - **Builder**: Docker
   - **Dockerfile path**: `Dockerfile` (en la raíz)
   - **Port**: `8000`

### Opción B: Desde Docker Hub

1. Construir y subir la imagen:
   ```bash
   docker build -t tu-usuario/geststore:latest .
   docker push tu-usuario/geststore:latest
   ```
2. En Koyeb, usar la imagen de Docker Hub

## Paso 3: Variables de Entorno en Koyeb

En la configuración del servicio, añadir las siguientes variables de entorno:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `SPRING_DATA_MONGODB_URI` | `mongodb+srv://...` | URI de conexión a MongoDB Atlas |
| `SPRING_PROFILES_ACTIVE` | `prod` | Perfil de Spring Boot |
| `JAVA_OPTS` | `-Xms256m -Xmx512m` | Opciones de JVM (ajustar según plan) |

## Paso 4: Configuración Adicional

### Puerto
- Koyeb detectará automáticamente el puerto `8000`
- Si hay problemas, configurar manualmente en Health Checks

### Health Check
- **Path**: `/`
- **Port**: `8000`
- **Protocol**: HTTP

### Recursos Recomendados
- **Mínimo**: 512MB RAM (plan nano)
- **Recomendado**: 1GB RAM para mejor rendimiento

## Comandos Útiles

### Construir localmente para probar
```bash
docker build -t geststore-koyeb .
```

### Ejecutar localmente (requiere MongoDB)
```bash
docker run -p 8000:8000 \
  -e SPRING_DATA_MONGODB_URI="mongodb+srv://..." \
  -e SPRING_PROFILES_ACTIVE=prod \
  geststore-koyeb
```

## Troubleshooting

### El backend no conecta a MongoDB
- Verificar que la URI de MongoDB es correcta
- Asegurarse de que Network Access en Atlas permite `0.0.0.0/0`
- Revisar logs en Koyeb

### La aplicación no responde
- Verificar que el puerto configurado es `8000`
- Revisar los logs de supervisor en Koyeb
- Aumentar el tiempo de start en Health Checks (90s recomendado)

### Error de memoria
- Aumentar el plan de Koyeb
- Reducir `JAVA_OPTS` a `-Xms128m -Xmx256m`

## Estructura de Archivos Necesarios

```
/
├── Dockerfile              # Dockerfile unificado
├── nginx.koyeb.conf        # Configuración de Nginx para Koyeb
├── supervisord.conf        # Configuración de Supervisor
├── GestStore/              # Código del frontend
│   ├── package.json
│   ├── src/
│   └── ...
└── backend/                # Código del backend
    ├── pom.xml
    ├── src/
    └── ...
```
