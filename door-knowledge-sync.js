#!/usr/bin/env node
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { glob } from 'glob';
import crypto from 'crypto';

class DoorKnowledgeSync {
  constructor(knowledgeBaseDir) {
    this.knowledgeBaseDir = knowledgeBaseDir;
    this.pdfDir = path.join(knowledgeBaseDir, '_pdfs_extracted');
    this.processedFile = path.join(this.pdfDir, '.processed.json');
    this.processed = {};
    this.stats = {
      new: 0,
      updated: 0,
      removed: 0,
      unchanged: 0,
      errors: 0
    };
  }

  async initialize() {
    await fs.mkdir(this.pdfDir, { recursive: true });

    try {
      const data = await fs.readFile(this.processedFile, 'utf8');
      this.processed = JSON.parse(data);
    } catch {
      this.processed = {};
    }

    console.log(`🔄 DOOR Knowledge Sync - Sincronización Inteligente`);
    console.log(`   Knowledge Base: ${this.knowledgeBaseDir}`);
    console.log(`   PDFs Cache: ${this.pdfDir}`);
    console.log(`   Modo: Incremental con detección de cambios\n`);
  }

  async scanForAttachmentLinks() {
    console.log('🔍 Escaneando archivos Markdown por links de attachments...\n');

    const mdFiles = await glob('**/*.md', {
      cwd: this.knowledgeBaseDir,
      absolute: true,
      ignore: ['_pdfs_extracted/**']
    });

    const attachmentLinks = [];

    for (const file of mdFiles) {
      const content = await fs.readFile(file, 'utf8');

      const patterns = [
        /<a href="(https?:\/\/support\.door\.com\/hc\/article_attachments\/[^"]+)"[^>]*>([^<]+)<\/a>/gi,
        /href="(https?:\/\/support\.door\.com\/hc\/article_attachments\/[^"]+)"/gi,
        /(https?:\/\/support\.door\.com\/hc\/article_attachments\/[^\s"'>]+)/gi
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          let url, linkText;

          if (match[2]) {
            url = match[1];
            linkText = match[2].trim();
          } else {
            url = match[1];
            linkText = 'DOOR Attachment';
          }

          const relativeFile = path.relative(this.knowledgeBaseDir, file);

          attachmentLinks.push({
            url: url,
            sourceFile: relativeFile,
            linkText: linkText,
            directory: path.dirname(relativeFile)
          });
        }
      }
    }

    const uniqueLinks = Array.from(
      new Map(attachmentLinks.map(item => [item.url, item])).values()
    );

    console.log(`✅ Encontrados ${uniqueLinks.length} attachments únicos en los artículos\n`);

    return uniqueLinks;
  }

  async downloadAndChecksum(url, fileName) {
    try {
      console.log(`⬇️  Verificando: ${fileName}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PDFExtractor/1.0)',
          'Accept': '*/*'
        },
        redirect: 'follow'
      });

      if (!response.ok) {
        console.log(`   ⚠️  HTTP ${response.status}`);
      }

      const buffer = await response.buffer();

      const pdfSignature = buffer.slice(0, 4).toString();
      if (!pdfSignature.includes('%PDF')) {
        const content = buffer.toString();
        const redirectMatch = content.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);

        if (redirectMatch) {
          console.log(`   🔄 Redirect a: ${redirectMatch[1]}`);
          return await this.downloadAndChecksum(redirectMatch[1], fileName);
        }

        console.log(`   ❌ No es un archivo PDF válido`);
        return null;
      }

      // Calcular checksum del contenido
      const checksum = crypto.createHash('md5').update(buffer).digest('hex');

      const filePath = path.join(this.pdfDir, fileName);

      // Verificar si el archivo existe y comparar checksum
      let needsUpdate = true;
      if (this.processed[url] && this.processed[url].checksum === checksum) {
        try {
          await fs.access(filePath);
          console.log(`   ✅ Sin cambios (checksum: ${checksum.substring(0, 8)}...)`);
          needsUpdate = false;
          this.stats.unchanged++;
        } catch {
          console.log(`   ⚠️  Archivo local perdido, re-descargando...`);
        }
      } else if (this.processed[url]) {
        console.log(`   🔄 PDF actualizado (checksum cambió)`);
        this.stats.updated++;
      } else {
        console.log(`   🆕 Nuevo PDF`);
        this.stats.new++;
      }

      if (needsUpdate) {
        await fs.writeFile(filePath, buffer);
        console.log(`   💾 Guardado: ${fileName} (${(buffer.length / 1024).toFixed(2)} KB)`);
      }

      return { filePath, checksum, needsUpdate };

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  cleanFileName(url, linkText) {
    const urlMatch = url.match(/article_attachments\/(\d+)/);
    const attachmentId = urlMatch ? urlMatch[1] : 'attachment';

    let name = linkText
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    return `${attachmentId}_${name}.pdf`;
  }

  async extractTextFromPDF(pdfPath) {
    try {
      const data = await fs.readFile(pdfPath);
      const uint8Array = new Uint8Array(data);

      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      let fullText = '';
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');

        fullText += `\n--- Página ${pageNum} ---\n${pageText}\n`;
      }

      return {
        text: fullText,
        numPages: numPages
      };
    } catch (error) {
      console.error(`Error extrayendo texto del PDF: ${error.message}`);
      throw error;
    }
  }

  async convertToMarkdown(pdfPath, originalLink, checksum) {
    try {
      const dataBuffer = await fs.readFile(pdfPath);
      const pdfData = await this.extractTextFromPDF(pdfPath);

      const fileName = path.basename(pdfPath, '.pdf');
      const mdFileName = `${fileName}_extracted.md`;

      const targetDir = path.join(this.knowledgeBaseDir, originalLink.directory);
      const mdPath = path.join(targetDir, mdFileName);

      const markdown = `# ${originalLink.linkText} (Extraído)

> 📄 **Documento PDF Extraído Automáticamente**
> - **Fuente:** [${originalLink.linkText}](${originalLink.url})
> - **Archivo origen:** ${originalLink.sourceFile}
> - **Páginas:** ${pdfData.numPages}
> - **Checksum:** ${checksum.substring(0, 8)}...
> - **Última sincronización:** ${new Date().toLocaleString()}

---

## Contenido del PDF

${this.formatPDFText(pdfData.text)}

---

## Información del documento

- **URL original:** ${originalLink.url}
- **Tamaño PDF:** ${(dataBuffer.length / 1024).toFixed(2)} KB
- **PDF guardado en:** ${path.relative(this.knowledgeBaseDir, pdfPath)}

---

*Este contenido fue extraído automáticamente del PDF de DOOR Support. Para la versión más actualizada, consulte el [documento original](${originalLink.url}).*
`;

      await fs.writeFile(mdPath, markdown);
      console.log(`   📝 Actualizado Markdown: ${path.relative(this.knowledgeBaseDir, mdPath)}`);

      return mdPath;
    } catch (error) {
      console.error(`   ❌ Error convirtiendo: ${error.message}`);
      return null;
    }
  }

  formatPDFText(text) {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+$/gm, '')
      .split('\n')
      .map(line => {
        if (line.length < 80 && /^[A-Z]/.test(line) && !line.endsWith('.')) {
          const words = line.split(' ');
          const capitalizedWords = words.filter(w => /^[A-Z]/.test(w));
          if (capitalizedWords.length >= words.length * 0.6) {
            return `\n### ${line.trim()}\n`;
          }
        }

        if (/^[•·▪▫◦‣⁃]\s/.test(line)) {
          return `- ${line.substring(2).trim()}`;
        }
        if (/^\d+\.\s/.test(line)) {
          return line.trim();
        }

        return line;
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
  }

  async cleanupOrphanedFiles() {
    console.log('\n🧹 Limpiando archivos huérfanos...\n');

    const currentUrls = new Set();
    const attachmentLinks = await this.scanForAttachmentLinks();

    attachmentLinks.forEach(link => currentUrls.add(link.url));

    const orphanedUrls = [];

    for (const url in this.processed) {
      if (!currentUrls.has(url)) {
        orphanedUrls.push(url);
      }
    }

    for (const url of orphanedUrls) {
      const info = this.processed[url];
      console.log(`🗑️  Eliminando huérfano: ${info.linkText}`);

      try {
        // Eliminar PDF
        const pdfPath = path.join(this.knowledgeBaseDir, info.pdfPath);
        await fs.unlink(pdfPath);
        console.log(`   ✅ PDF eliminado: ${info.pdfPath}`);
      } catch (err) {
        console.log(`   ⚠️  PDF ya no existe: ${info.pdfPath}`);
      }

      try {
        // Eliminar Markdown
        const mdPath = path.join(this.knowledgeBaseDir, info.mdPath);
        await fs.unlink(mdPath);
        console.log(`   ✅ Markdown eliminado: ${info.mdPath}`);
      } catch (err) {
        console.log(`   ⚠️  Markdown ya no existe: ${info.mdPath}`);
      }

      delete this.processed[url];
      this.stats.removed++;
    }

    if (orphanedUrls.length === 0) {
      console.log('✅ No hay archivos huérfanos');
    }
  }

  async updateOriginalFiles(attachmentLinks) {
    console.log('\n📝 Actualizando referencias en archivos originales...\n');

    const fileUpdates = {};
    for (const link of attachmentLinks) {
      if (!fileUpdates[link.sourceFile]) {
        fileUpdates[link.sourceFile] = [];
      }
      fileUpdates[link.sourceFile].push(link);
    }

    let updatedCount = 0;
    for (const [file, links] of Object.entries(fileUpdates)) {
      const fullPath = path.join(this.knowledgeBaseDir, file);
      let content = await fs.readFile(fullPath, 'utf8');
      let modified = false;

      for (const link of links) {
        if (this.processed[link.url]) {
          const fileName = this.cleanFileName(link.url, link.linkText);
          const mdFileName = fileName.replace('.pdf', '_extracted.md');

          const noteText = `\n\n> 📄 **Contenido extraído:** [Ver ${link.linkText} en Markdown](./${mdFileName})`;

          if (!content.includes(mdFileName)) {
            const originalLinkRegex = new RegExp(
              link.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'g'
            );

            if (originalLinkRegex.test(content)) {
              content = content.replace(
                originalLinkRegex,
                `${link.url}${noteText}`
              );
              modified = true;
            }
          }
        }
      }

      if (modified) {
        await fs.writeFile(fullPath, content);
        console.log(`✅ Referencias actualizadas en: ${file}`);
        updatedCount++;
      }
    }

    if (updatedCount === 0) {
      console.log('✅ Todas las referencias ya están actualizadas');
    }
  }

  async saveProcessedInfo() {
    await fs.writeFile(this.processedFile, JSON.stringify(this.processed, null, 2));
  }

  async syncAll() {
    await this.initialize();

    const attachmentLinks = await this.scanForAttachmentLinks();

    if (attachmentLinks.length === 0) {
      console.log('❌ No se encontraron links de attachments de DOOR.');
      await this.cleanupOrphanedFiles();
      return;
    }

    console.log('📥 Sincronizando attachments...\n');

    for (const link of attachmentLinks) {
      const fileName = this.cleanFileName(link.url, link.linkText);

      const result = await this.downloadAndChecksum(link.url, fileName);

      if (result) {
        if (result.needsUpdate) {
          const mdPath = await this.convertToMarkdown(result.filePath, link, result.checksum);

          if (mdPath) {
            this.processed[link.url] = {
              pdfPath: path.relative(this.knowledgeBaseDir, result.filePath),
              mdPath: path.relative(this.knowledgeBaseDir, mdPath),
              checksum: result.checksum,
              processedAt: new Date().toISOString(),
              lastSyncAt: new Date().toISOString(),
              sourceFile: link.sourceFile,
              linkText: link.linkText
            };
          }
        } else {
          // Actualizar fecha de última sincronización
          if (this.processed[link.url]) {
            this.processed[link.url].lastSyncAt = new Date().toISOString();
          }
        }
      }

      console.log('');
    }

    await this.cleanupOrphanedFiles();
    await this.saveProcessedInfo();
    await this.updateOriginalFiles(attachmentLinks);

    console.log(`\n✨ Sincronización completada`);
    console.log(`📊 Estadísticas:`);
    console.log(`   🆕 Nuevos: ${this.stats.new}`);
    console.log(`   🔄 Actualizados: ${this.stats.updated}`);
    console.log(`   ✅ Sin cambios: ${this.stats.unchanged}`);
    console.log(`   🗑️  Eliminados: ${this.stats.removed}`);
    console.log(`   ❌ Errores: ${this.stats.errors}`);
    console.log(`   📁 Total activos: ${Object.keys(this.processed).length} documentos`);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
🔄 DOOR Knowledge Sync - Sincronización Inteligente

Sincroniza PDFs de DOOR Support de manera incremental:
- Descarga solo PDFs nuevos
- Actualiza PDFs que cambiaron (checksum)
- Elimina PDFs huérfanos (ya no referenciados)
- Mantiene todo sincronizado eficientemente

Uso:
  node door-knowledge-sync.js <directorio-knowledge-base>

Ejemplo:
  node door-knowledge-sync.js ./door_knowledge_base

Características:
  ✅ Detección de cambios por checksum MD5
  ✅ Eliminación automática de archivos huérfanos
  ✅ Actualización incremental eficiente
  ✅ Estadísticas detalladas de sincronización
`);
    process.exit(1);
  }

  const processor = new DoorKnowledgeSync(args[0]);
  await processor.syncAll();
}

main().catch(console.error);