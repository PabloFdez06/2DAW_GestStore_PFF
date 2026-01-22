# Etapa 1: Construcción
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias usando ci para builds más rápidos y deterministas
RUN npm ci --no-audit --progress=false

# Copiar archivos de configuración
COPY tsconfig*.json angular.json ./

# Copiar el código fuente
COPY src ./src
COPY public ./public

# Construir la aplicación para producción
RUN npm run build -- --configuration production && \
    echo "=== Contenido de /app/dist ===" && \
    find /app/dist -type f && \
    echo "=== Fin del listado ==="

# Etapa 2: Servidor web con Nginx
FROM nginx:1.25-alpine

# Copiar archivos compilados desde la etapa de build
# Copiar el contenido de browser ya que Angular 17+ construye en dist/GestStore/browser
COPY --from=build /app/dist/GestStore/browser /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.digitalocean.conf /etc/nginx/conf.d/default.conf.template

# Script de inicio que reemplaza variables de entorno
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'envsubst "\$BACKEND_URL" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Variable de entorno para el backend (Digital Ocean la inyecta)
ENV BACKEND_URL=http://localhost:8080

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Ejecutar script que inyecta variables y arranca nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
