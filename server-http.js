#!/usr/bin/env node
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Servidor HTTP para Door MCP remoto (Railway deployment)
 * Expone el MCP via HTTP para que usuarios remotos puedan acceder
 */

class HTTPMCPServer {
  constructor() {
    this.port = process.env.PORT || 3000;
    this.knowledgeBasePath = path.join(__dirname, 'door_knowledge_base');
    this.searchIndexPath = path.join(__dirname, 'door_knowledge_base', '_pdfs_extracted', 'search-index.json');
    this.searchIndex = null;
  }

  async loadSearchIndex() {
    if (!this.searchIndex) {
      try {
        const data = await fs.readFile(this.searchIndexPath, 'utf-8');
        this.searchIndex = JSON.parse(data);
      } catch (err) {
        throw new Error(`No se pudo cargar el índice: ${err.message}`);
      }
    }
    return this.searchIndex;
  }

  async searchDoorKnowledge(query, category, limit = 10) {
    const index = await this.loadSearchIndex();
    const searchTerm = query.toLowerCase();

    let results = index.documents.filter(doc => {
      if (category && doc.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      return doc.keywords.includes(searchTerm);
    });

    results = results
      .map(doc => {
        const matches = (doc.keywords.match(new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
        return { ...doc, relevance: matches };
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return results;
  }

  async getDoorDocument(documentId) {
    const index = await this.loadSearchIndex();
    const doc = index.documents.find(d => d.id === documentId);

    if (!doc) {
      throw new Error(`Documento no encontrado: ${documentId}`);
    }

    const mdPath = path.join(this.knowledgeBasePath, doc.mdPath);
    const content = await fs.readFile(mdPath, 'utf-8');

    return {
      ...doc,
      content
    };
  }

  async listDoorCategories() {
    const index = await this.loadSearchIndex();
    return {
      totalDocuments: index.totalDocuments,
      categories: index.categories,
      generatedAt: index.generatedAt
    };
  }

  async handleRequest(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    try {
      // Health check
      if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          service: 'door-knowledge-mcp',
          version: '1.0',
          documents: this.searchIndex?.totalDocuments || 0
        }));
        return;
      }

      // API endpoints
      if (url.pathname === '/api/search') {
        const query = url.searchParams.get('query');
        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '10');

        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Query parameter required' }));
          return;
        }

        const results = await this.searchDoorKnowledge(query, category, limit);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          query,
          totalResults: results.length,
          results
        }));
        return;
      }

      if (url.pathname === '/api/document') {
        const docId = url.searchParams.get('id');

        if (!docId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Document id required' }));
          return;
        }

        const doc = await this.getDoorDocument(docId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(doc));
        return;
      }

      if (url.pathname === '/api/categories') {
        const categories = await this.listDoorCategories();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(categories));
        return;
      }

      // Root endpoint - API info
      if (url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          service: 'DOOR Knowledge MCP Server',
          version: '1.0',
          endpoints: {
            search: '/api/search?query=<term>&category=<cat>&limit=<num>',
            document: '/api/document?id=<doc_id>',
            categories: '/api/categories',
            health: '/health'
          },
          documents: this.searchIndex?.totalDocuments || 0,
          status: 'running'
        }));
        return;
      }

      // 404
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint not found' }));

    } catch (error) {
      console.error('Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  async start() {
    // Cargar índice al inicio
    try {
      await this.loadSearchIndex();
      console.log(`✅ Índice cargado: ${this.searchIndex.totalDocuments} documentos`);
    } catch (err) {
      console.error('❌ Error cargando índice:', err.message);
      process.exit(1);
    }

    // Crear servidor HTTP
    const server = http.createServer((req, res) => this.handleRequest(req, res));

    server.listen(this.port, () => {
      console.log(`🚀 DOOR Knowledge MCP Server v1.0`);
      console.log(`   📡 Listening on port ${this.port}`);
      console.log(`   📄 ${this.searchIndex.totalDocuments} documentos disponibles`);
      console.log(`   📁 ${Object.keys(this.searchIndex.categories).length} categorías`);
      console.log(`   🌐 Endpoints:`);
      console.log(`      - GET /health`);
      console.log(`      - GET /api/search?query=...`);
      console.log(`      - GET /api/document?id=...`);
      console.log(`      - GET /api/categories`);
    });
  }
}

// Iniciar servidor
const server = new HTTPMCPServer();
server.start().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
