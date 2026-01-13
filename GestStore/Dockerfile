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

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Health check (usando 127.0.0.1 en lugar de localhost para evitar problemas IPv6)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Nginx se ejecuta en primer plano por defecto
CMD ["nginx", "-g", "daemon off;"]
