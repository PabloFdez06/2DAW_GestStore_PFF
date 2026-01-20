# ============================================
# Dockerfile Unificado para Koyeb
# GestStore - Frontend (Angular) + Backend (Spring Boot)
# ============================================
# NOTA: La base de datos MongoDB debe ser externa (MongoDB Atlas u otro servicio)
# Koyeb no soporta múltiples servicios en un contenedor de forma óptima para BD

# ============================================
# ETAPA 1: Build del Frontend Angular
# ============================================
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Copiar archivos de dependencias del frontend
COPY GestStore/package.json GestStore/package-lock.json ./

# Instalar dependencias
RUN npm ci --no-audit --progress=false

# Copiar archivos de configuración
COPY GestStore/tsconfig*.json GestStore/angular.json ./

# Copiar el código fuente
COPY GestStore/src ./src
COPY GestStore/public ./public

# Construir la aplicación para producción
RUN npm run build -- --configuration production

# ============================================
# ETAPA 2: Build del Backend Spring Boot
# ============================================
FROM maven:3.9.5-eclipse-temurin-17-alpine AS backend-build

WORKDIR /backend

# Copiar archivos de configuración de Maven
COPY backend/pom.xml .

# Descargar dependencias (se cachea si pom.xml no cambia)
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY backend/src ./src

# Compilar y empaquetar la aplicación
RUN mvn clean package -DskipTests

# ============================================
# ETAPA 3: Imagen de Producción con Nginx + Java
# ============================================
FROM eclipse-temurin:17-jre-alpine

# Instalar Nginx y Supervisor
RUN apk add --no-cache nginx supervisor wget curl

WORKDIR /app

# Crear directorios necesarios
RUN mkdir -p /run/nginx /var/log/supervisor /app/logs

# ============================================
# Configuración del Frontend (Nginx)
# ============================================
# Copiar archivos compilados de Angular
COPY --from=frontend-build /frontend/dist/GestStore/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx para Koyeb
COPY nginx.koyeb.conf /etc/nginx/http.d/default.conf

# ============================================
# Configuración del Backend (Spring Boot)
# ============================================
# Copiar el JAR del backend
COPY --from=backend-build /backend/target/*.jar /app/app.jar

# ============================================
# Configuración de Supervisor
# ============================================
COPY supervisord.conf /etc/supervisord.conf

# ============================================
# Variables de entorno
# ============================================
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xms256m -Xmx512m"
# La URI de MongoDB debe configurarse en Koyeb como variable de entorno
ENV SPRING_DATA_MONGODB_URI=""

# Puerto expuesto (Koyeb usará este puerto)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/ || exit 1

# Iniciar servicios con Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
