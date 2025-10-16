#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script MEJORADO para construir índice completo de DOOR Knowledge Base
 * Indexa TODOS los archivos .md, no solo PDFs extraídos
 */

async function buildCompleteSearchIndex() {
  console.log('🔍 Construyendo índice COMPLETO de búsqueda...');

  const knowledgeBasePath = path.join(__dirname, 'door_knowledge_base');
  const indexPath = path.join(__dirname, 'door_knowledge_base', '_pdfs_extracted', 'search-index.json');

  const index = {
    documents: [],
    categories: {},
    generatedAt: new Date().toISOString(),
    totalDocuments: 0
  };

  // Buscar TODOS los archivos .md en la knowledge base
  const allMdFiles = await glob('**/*.md', {
    cwd: knowledgeBasePath,
    absolute: false,
    ignore: ['_pdfs_extracted/**'] // Ignorar solo PDFs ya extraídos
  });

  console.log(`📄 Encontrados ${allMdFiles.length} archivos markdown`);

  for (const relativePath of allMdFiles) {
    const fullPath = path.join(knowledgeBasePath, relativePath);

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const lines = content.split('\n');

      // Extraer título (primera línea con #)
      let title = 'Sin título';
      for (const line of lines) {
        if (line.startsWith('#') && !line.startsWith('##')) {
          title = line.replace(/^#+\s*/, '').trim();
          break;
        }
      }

      // Extraer ID y URL del frontmatter si existe
      let docId = null;
      let url = null;
      for (let i = 0; i < Math.min(20, lines.length); i++) {
        const line = lines[i];
        if (line.startsWith('**ID:**')) {
          docId = line.replace('**ID:**', '').trim();
        }
        if (line.startsWith('**URL:**')) {
          url = line.replace('**URL:**', '').trim();
        }
      }

      // Generar ID único si no existe
      if (!docId) {
        docId = path.basename(relativePath, '.md').replace(/\s+/g, '_');
      }

      // Extraer categoría del path
      const pathParts = relativePath.split(path.sep);
      const category = pathParts[0] || 'General';
      const subcategory = pathParts.length > 2 ? pathParts[1] : '';

      // Extraer resumen (primeras líneas de contenido, excluyendo HTML)
      let summaryLines = [];
      let inContent = false;
      for (const line of lines) {
        // Saltar frontmatter y metadata
        if (line.startsWith('**') || line.startsWith('---') || line.trim() === '') {
          continue;
        }
        // Saltar tags HTML
        if (line.startsWith('<')) {
          inContent = true;
          // Extraer texto de tags HTML
          const textMatch = line.match(/>([^<]+)</);
          if (textMatch) {
            summaryLines.push(textMatch[1].trim());
          }
          continue;
        }
        // Saltar headers
        if (line.startsWith('#')) {
          inContent = true;
          continue;
        }
        if (inContent && line.trim()) {
          summaryLines.push(line.trim());
          if (summaryLines.length >= 3) break;
        }
      }
      const summary = summaryLines.join(' ').substring(0, 300);

      // Crear keywords para búsqueda (todo en minúsculas)
      const keywords = [
        title.toLowerCase(),
        category.toLowerCase(),
        subcategory.toLowerCase(),
        summary.toLowerCase(),
        content.substring(0, 2000).toLowerCase() // Primeros 2000 chars del contenido
      ].join(' ');

      // Determinar tipo de documento
      const isExtracted = relativePath.includes('_extracted.md');
      const docType = isExtracted ? 'PDF Extraído' : 'Artículo';

      const doc = {
        id: docId,
        title,
        category,
        subcategory,
        summary,
        type: docType,
        mdPath: relativePath,
        url: url || null,
        keywords,
        relativePath
      };

      index.documents.push(doc);

      // Agrupar por categorías
      if (!index.categories[category]) {
        index.categories[category] = {
          name: category,
          count: 0,
          subcategories: {}
        };
      }
      index.categories[category].count++;

      if (subcategory) {
        if (!index.categories[category].subcategories[subcategory]) {
          index.categories[category].subcategories[subcategory] = {
            name: subcategory,
            count: 0
          };
        }
        index.categories[category].subcategories[subcategory].count++;
      }

    } catch (err) {
      console.warn(`⚠️  No se pudo indexar ${relativePath}: ${err.message}`);
    }
  }

  index.totalDocuments = index.documents.length;

  // Guardar índice
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2));

  console.log(`✅ Índice COMPLETO creado:`);
  console.log(`   📄 ${index.totalDocuments} documentos indexados`);
  console.log(`   📁 ${Object.keys(index.categories).length} categorías:`);
  for (const [catName, catData] of Object.entries(index.categories)) {
    console.log(`      - ${catName}: ${catData.count} docs`);
  }
  console.log(`   💾 Guardado en: ${indexPath}`);

  return index;
}

// Ejecutar si se llama directamente
const isMainModule = process.argv[1] &&
  (import.meta.url === `file://${process.argv[1]}` ||
   import.meta.url.endsWith(path.basename(process.argv[1])));

if (isMainModule) {
  buildCompleteSearchIndex().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

export { buildCompleteSearchIndex };