#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Servidor MCP optimizado para DOOR Knowledge Base
 * Proporciona acceso bajo demanda a documentos PDF extraídos
 *
 * OPTIMIZACIÓN: Solo carga el índice (ligero), no todo el contenido
 */

class DoorKnowledgeMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'door-knowledge-optimized',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.knowledgeBasePath = path.join(__dirname, 'door_knowledge_base');
    this.searchIndexPath = path.join(__dirname, 'door_knowledge_base', '_pdfs_extracted', 'search-index.json');
    this.searchIndex = null;

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async loadSearchIndex() {
    if (!this.searchIndex) {
      try {
        const data = await fs.readFile(this.searchIndexPath, 'utf-8');
        this.searchIndex = JSON.parse(data);
      } catch (err) {
        throw new Error(`No se pudo cargar el índice de búsqueda. Ejecuta: npm run build-index\nError: ${err.message}`);
      }
    }
    return this.searchIndex;
  }

  setupToolHandlers() {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_door_knowledge',
          description: 'Busca documentos en la DOOR Knowledge Base por palabras clave, categorías o contenido. Retorna una lista de documentos relevantes con resúmenes. Es MUY RÁPIDO porque usa un índice pre-generado.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Término de búsqueda (ej: "installation", "latch m", "intercom", "wiring")',
              },
              category: {
                type: 'string',
                description: 'Filtrar por categoría específica (opcional). Usa list_door_categories para ver las disponibles.',
              },
              limit: {
                type: 'number',
                description: 'Número máximo de resultados (default: 10)',
                default: 10,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_door_document',
          description: 'Obtiene el contenido completo de un documento específico de la DOOR Knowledge Base. Usa el ID obtenido de search_door_knowledge.',
          inputSchema: {
            type: 'object',
            properties: {
              document_id: {
                type: 'string',
                description: 'ID del documento (obtenido de search_door_knowledge)',
              },
            },
            required: ['document_id'],
          },
        },
        {
          name: 'list_door_categories',
          description: 'Lista todas las categorías y subcategorías disponibles en la DOOR Knowledge Base con conteo de documentos.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Manejar llamadas a herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'search_door_knowledge':
            return await this.searchDoorKnowledge(request.params.arguments);
          case 'get_door_document':
            return await this.getDoorDocument(request.params.arguments);
          case 'list_door_categories':
            return await this.listDoorCategories(request.params.arguments);
          default:
            throw new Error(`Herramienta desconocida: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async searchDoorKnowledge(args) {
    const { query, category, limit = 10 } = args;
    const index = await this.loadSearchIndex();

    const searchTerm = query.toLowerCase();
    let results = index.documents.filter(doc => {
      // Filtrar por categoría si se especifica
      if (category && doc.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      // Buscar en keywords
      return doc.keywords.includes(searchTerm);
    });

    // Ordenar por relevancia (número de coincidencias)
    results = results
      .map(doc => {
        const matches = (doc.keywords.match(new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
        return { ...doc, relevance: matches };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No se encontraron resultados para: "${query}"\n\nIntenta con otros términos o usa list_door_categories para ver las categorías disponibles.`,
          },
        ],
      };
    }

    // Formatear resultados de manera concisa
    let response = `🔍 Encontrados ${results.length} resultados para: "${query}"\n\n`;

    results.forEach((doc, i) => {
      response += `${i + 1}. **${doc.title}**\n`;
      response += `   📁 ${doc.category}${doc.subcategory ? ` > ${doc.subcategory}` : ''}\n`;
      response += `   📄 ID: \`${doc.id}\` | ${doc.pages} páginas\n`;
      if (doc.summary) {
        response += `   📝 ${doc.summary.substring(0, 150)}${doc.summary.length > 150 ? '...' : ''}\n`;
      }
      response += `\n`;
    });

    response += `\n💡 Usa get_door_document con el ID para ver el contenido completo.`;

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  }

  async getDoorDocument(args) {
    const { document_id } = args;
    const index = await this.loadSearchIndex();

    // Buscar documento en el índice
    const doc = index.documents.find(d => d.id === document_id);
    if (!doc) {
      throw new Error(`Documento no encontrado: ${document_id}`);
    }

    // Leer contenido completo
    const mdPath = path.join(this.knowledgeBasePath, doc.mdPath);

    try {
      const content = await fs.readFile(mdPath, 'utf-8');

      return {
        content: [
          {
            type: 'text',
            text: `# ${doc.title}\n\n**Categoría:** ${doc.category} > ${doc.subcategory}\n**Páginas:** ${doc.pages}\n**Archivo fuente:** ${doc.sourceFile}\n\n---\n\n${content}`,
          },
        ],
      };
    } catch (err) {
      throw new Error(`No se pudo leer el documento: ${err.message}`);
    }
  }

  async listDoorCategories(args) {
    const index = await this.loadSearchIndex();

    let response = `# 📚 Categorías de DOOR Knowledge Base\n\n`;
    response += `**Total de documentos:** ${index.totalDocuments}\n`;
    response += `**Última actualización:** ${new Date(index.generatedAt).toLocaleString()}\n\n`;
    response += `---\n\n`;

    Object.entries(index.categories).forEach(([catName, catData]) => {
      response += `## 📁 ${catName}\n`;
      response += `**Total:** ${catData.count} documentos\n\n`;

      if (Object.keys(catData.subcategories).length > 0) {
        response += `**Subcategorías:**\n`;
        Object.entries(catData.subcategories).forEach(([subName, subData]) => {
          response += `  - ${subName} (${subData.count} docs)\n`;
        });
        response += `\n`;
      }
    });

    response += `\n💡 Usa search_door_knowledge con el nombre de la categoría para buscar documentos específicos.`;

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  }

  async run() {
    // Verificar que el índice existe
    try {
      await this.loadSearchIndex();
      console.error(`✅ DOOR Knowledge MCP Server v2.0 (Optimizado)`);
      console.error(`   📄 ${this.searchIndex.totalDocuments} documentos indexados`);
      console.error(`   📁 ${Object.keys(this.searchIndex.categories).length} categorías`);
      console.error(`   ⚡ Búsquedas instantáneas sin cargar contenido en memoria`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Iniciar servidor
const server = new DoorKnowledgeMCPServer();
server.run().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});