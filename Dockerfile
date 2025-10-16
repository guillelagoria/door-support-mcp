# Dockerfile para DOOR Knowledge MCP Server
# Optimizado para Railway.app deployment

FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Crear directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --production

# Copiar archivos del servidor
COPY door-knowledge-mcp-server.js ./
COPY build-search-index-complete.js ./
COPY server-http.js ./

# Copiar knowledge base completa
COPY door_knowledge_base ./door_knowledge_base

# Generar índice de búsqueda
RUN node build-search-index-complete.js

# Exponer puerto (Railway asigna dinámicamente)
EXPOSE ${PORT:-3000}

# Variable de entorno para Railway
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-3000}/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); });"

# Comando de inicio
CMD ["node", "server-http.js"]
