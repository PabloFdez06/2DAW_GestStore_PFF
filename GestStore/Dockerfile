# Etapa 1: Construcción
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependencias (sin package-lock para evitar conflictos)
RUN npm install --legacy-peer-deps --no-audit --progress=false

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
# Copiar todo el contenido de dist
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Nginx se ejecuta en primer plano por defecto
CMD ["nginx", "-g", "daemon off;"]
