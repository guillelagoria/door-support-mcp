# DOOR Knowledge MCP Server

Servidor MCP (Model Context Protocol) para acceder a la base de conocimiento de soporte de DOOR.

## Características

- 📚 Documentos de support.door.com (artículos + PDFs convertidos)
- 🔍 Búsqueda rápida con índice pre-generado
- 🌐 API HTTP para acceso remoto (desplegado en Railway)
- 🔄 Sincronización incremental de contenido
- ⚡ Sin necesidad de descargar repositorio (usando cliente HTTP)

## Instalación Rápida (Recomendado)

**Para usuarios de Claude Desktop**, la forma más fácil es usar el cliente HTTP remoto:

### 1. Configurar Claude Desktop

Abre tu archivo de configuración:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Agrega esta configuración:

```json
{
  "mcpServers": {
    "door-knowledge": {
      "command": "npx",
      "args": ["-y", "mcp-http-client", "https://door-support-mcp-production.up.railway.app"]
    }
  }
}
```

### 2. Reinicia Claude Desktop

¡Listo! Ya puedes preguntarle a Claude sobre documentación de Door sin descargar nada.

**Ventajas de esta instalación:**
- ✅ No descargas archivos grandes
- ✅ Instalación en 30 segundos
- ✅ Siempre tienes la última versión
- ✅ Funciona en cualquier plataforma
- ✅ No necesitas conocimientos técnicos

**Cliente HTTP**: https://github.com/guillelagoria/mcp-http-client

---

## Instalación Local (Para Desarrolladores)

```bash
# Instalar dependencias
npm install

# Sincronizar artículos de support.door.com
npm run sync

# Construir índice de búsqueda
npm run build-index

# Iniciar servidor MCP local
npm start

# O iniciar servidor HTTP
npm run start-http
```

## Uso

### Servidor MCP Local (para Claude Desktop)

Si prefieres ejecutar el servidor localmente (por ejemplo, para desarrollo):

```json
{
  "mcpServers": {
    "door-knowledge": {
      "command": "node",
      "args": ["/ruta/absoluta/a/door-support-mcp/door-knowledge-mcp-server.js"]
    }
  }
}
```

**Nota**: Este método requiere descargar el repositorio completo. Para uso normal, recomendamos usar el cliente HTTP (ver arriba).

### API HTTP

El servidor HTTP está desplegado en Railway y expone los siguientes endpoints:

**Base URL**: `https://door-support-mcp-production.up.railway.app`

- `GET /health` - Estado del servidor
- `GET /api/search?query=<term>&category=<cat>&limit=<num>` - Búsqueda de documentos
- `GET /api/document?id=<doc_id>` - Obtener documento completo
- `GET /api/categories` - Listar categorías

Ejemplos:
```bash
# Health check
curl "https://door-support-mcp-production.up.railway.app/health"

# Buscar documentos
curl "https://door-support-mcp-production.up.railway.app/api/search?query=installation&limit=5"

# Listar categorías
curl "https://door-support-mcp-production.up.railway.app/api/categories"

# Obtener documento específico
curl "https://door-support-mcp-production.up.railway.app/api/document?id=DOCUMENT_ID"
```

### Herramientas Disponibles

Una vez conectado a través de Claude Desktop, tendrás acceso a estas herramientas:

1. **`search_door_knowledge`** - Buscar documentos por query
2. **`get_door_document`** - Obtener contenido completo de un documento
3. **`list_door_categories`** - Listar todas las categorías disponibles

**Ejemplos de uso con Claude:**
- "Busca guías de instalación de Door"
- "Muéstrame todos los runbooks disponibles"
- "¿Qué categorías de documentación hay disponibles?"
- "Dame el contenido completo del documento XYZ"

## Scripts Disponibles

- `npm start` - Iniciar servidor MCP
- `npm run start-http` - Iniciar servidor HTTP
- `npm run sync` - Sincronizar artículos de Door
- `npm run build-index` - Construir índice de búsqueda
- `npm run clean` - Limpiar PDFs procesados
- `npm run reprocess` - Reprocesar todo desde cero

## Despliegue en Railway

Este proyecto está configurado para desplegarse fácilmente en Railway.app:

1. Conecta el repositorio a Railway
2. Railway detectará automáticamente el Dockerfile
3. El proyecto se construirá y desplegará automáticamente
4. El health check estará disponible en `/health`

## Estructura del Proyecto

```
door-support-mcp/
├── door_knowledge_base/     # Base de conocimiento extraída
├── door-knowledge-sync.js   # Sincronización de contenido
├── door-knowledge-mcp-server.js  # Servidor MCP
├── server-http.js            # Servidor HTTP
├── build-search-index-complete.js # Constructor de índice
├── package.json
├── Dockerfile
└── railway.json
```

## Licencia

MIT
