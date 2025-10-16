#!/usr/bin/env node
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { glob } from 'glob';

class DoorKnowledgePDFProcessor {
  constructor(knowledgeBaseDir) {
    this.knowledgeBaseDir = knowledgeBaseDir;
    this.pdfDir = path.join(knowledgeBaseDir, '_pdfs_extracted');
    this.processedFile = path.join(this.pdfDir, '.processed.json');
    this.processed = {};
  }

  async initialize() {
    await fs.mkdir(this.pdfDir, { recursive: true });

    try {
      const data = await fs.readFile(this.processedFile, 'utf8');
      this.processed = JSON.parse(data);
    } catch {
      this.processed = {};
    }

    console.log(`📚 DOOR Knowledge PDF Processor v2`);
    console.log(`   Knowledge Base: ${this.knowledgeBaseDir}`);
    console.log(`   PDFs Cache: ${this.pdfDir}\n`);
  }

  async scanForAttachmentLinks() {
    console.log('🔍 Escaneando archivos Markdown por links de attachments...\n');

    const mdFiles = await glob('**/*.md', {
      cwd: this.knowledgeBaseDir,
      absolute: true
    });

    const attachmentLinks = [];

    for (const file of mdFiles) {
      const content = await fs.readFile(file, 'utf8');

      // Buscar links de DOOR support attachments
      const patterns = [
        // <a href="https://support.door.com/hc/article_attachments/xxx">texto</a>
        /<a href="(https?:\/\/support\.door\.com\/hc\/article_attachments\/[^"]+)"[^>]*>([^<]+)<\/a>/gi,
        // href="https://support.door.com/hc/article_attachments/xxx"
        /href="(https?:\/\/support\.door\.com\/hc\/article_attachments\/[^"]+)"/gi,
        // URLs directas a attachments
        /(https?:\/\/support\.door\.com\/hc\/article_attachments\/[^\s"'>]+)/gi
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          let url, linkText;

          if (match[2]) {
            // Patrón con texto del link
            url = match[1];
            linkText = match[2].trim();
          } else {
            // Solo URL
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

    // Eliminar duplicados por URL
    const uniqueLinks = Array.from(
      new Map(attachmentLinks.map(item => [item.url, item])).values()
    );

    console.log(`✅ Encontrados ${uniqueLinks.length} attachments únicos\n`);

    // Mostrar algunos ejemplos
    if (uniqueLinks.length > 0) {
      console.log('📋 Ejemplos encontrados:');
      uniqueLinks.slice(0, 5).forEach((link, i) => {
        console.log(`   ${i + 1}. "${link.linkText}" en ${link.sourceFile}`);
      });
      console.log('');
    }

    return uniqueLinks;
  }

  async downloadAttachment(url, fileName) {
    try {
      console.log(`⬇️  Descargando: ${fileName}`);
      console.log(`   URL: ${url}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PDFExtractor/1.0)',
          'Accept': '*/*'
        },
        redirect: 'follow'
      });

      if (!response.ok) {
        console.log(`   ⚠️  HTTP ${response.status} - Intentando como PDF...`);
      }

      const buffer = await response.buffer();

      // Verificar si es un PDF mirando los primeros bytes
      const pdfSignature = buffer.slice(0, 4).toString();
      if (!pdfSignature.includes('%PDF')) {
        // Si no es PDF, intentar como HTML y buscar redirect
        const content = buffer.toString();
        const redirectMatch = content.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);

        if (redirectMatch) {
          console.log(`   🔄 Encontrado redirect a: ${redirectMatch[1]}`);
          return await this.downloadAttachment(redirectMatch[1], fileName);
        }

        console.log(`   ❌ No es un archivo PDF válido`);
        return null;
      }

      const filePath = path.join(this.pdfDir, fileName);
      await fs.writeFile(filePath, buffer);

      console.log(`   ✅ Guardado: ${fileName} (${(buffer.length / 1024).toFixed(2)} KB)`);
      return filePath;

    } catch (error) {
      console.error(`   ❌ Error descargando: ${error.message}`);
      return null;
    }
  }

  cleanFileName(url, linkText) {
    // Extraer ID del attachment de la URL
    const urlMatch = url.match(/article_attachments\/(\d+)/);
    const attachmentId = urlMatch ? urlMatch[1] : 'attachment';

    // Limpiar el texto del link para usar como nombre
    let name = linkText
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '_')
      .substring(0, 50); // Limitar longitud

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

  async convertToMarkdown(pdfPath, originalLink) {
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
> - **Extraído:** ${new Date().toLocaleString()}

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
      console.log(`   📝 Convertido a: ${path.relative(this.knowledgeBaseDir, mdPath)}`);

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
        // Detectar títulos (líneas cortas en mayúsculas)
        if (line.length < 80 && /^[A-Z]/.test(line) && !line.endsWith('.')) {
          const words = line.split(' ');
          const capitalizedWords = words.filter(w => /^[A-Z]/.test(w));
          if (capitalizedWords.length >= words.length * 0.6) {
            return `\n### ${line.trim()}\n`;
          }
        }

        // Detectar listas
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

  async updateOriginalFiles(attachmentLinks) {
    console.log('\n📝 Actualizando archivos originales...\n');

    const fileUpdates = {};
    for (const link of attachmentLinks) {
      if (!fileUpdates[link.sourceFile]) {
        fileUpdates[link.sourceFile] = [];
      }
      fileUpdates[link.sourceFile].push(link);
    }

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
            // Buscar el link original y agregar nota
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
        console.log(`✅ Actualizado: ${file}`);
      }
    }
  }

  async saveProcessedInfo() {
    await fs.writeFile(this.processedFile, JSON.stringify(this.processed, null, 2));
  }

  async processAll() {
    await this.initialize();

    const attachmentLinks = await this.scanForAttachmentLinks();

    if (attachmentLinks.length === 0) {
      console.log('❌ No se encontraron links de attachments de DOOR.');
      return;
    }

    console.log('📥 Descargando y procesando attachments...\n');

    for (const link of attachmentLinks) {
      const fileName = this.cleanFileName(link.url, link.linkText);

      if (this.processed[link.url]) {
        console.log(`⏭️  Ya procesado: ${fileName}`);
        continue;
      }

      const filePath = await this.downloadAttachment(link.url, fileName);

      if (filePath) {
        const mdPath = await this.convertToMarkdown(filePath, link);

        if (mdPath) {
          this.processed[link.url] = {
            pdfPath: path.relative(this.knowledgeBaseDir, filePath),
            mdPath: path.relative(this.knowledgeBaseDir, mdPath),
            processedAt: new Date().toISOString(),
            sourceFile: link.sourceFile,
            linkText: link.linkText
          };
        }
      }

      console.log('');
    }

    await this.saveProcessedInfo();
    await this.updateOriginalFiles(attachmentLinks);

    console.log(`\n✨ Procesamiento completado`);
    console.log(`📊 Total procesados: ${Object.keys(this.processed).length} documentos`);
    console.log(`📁 Archivos guardados en: ${this.pdfDir}`);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
📚 DOOR Knowledge PDF Processor v2

Extrae automáticamente PDFs de DOOR Support attachments en archivos Markdown

Uso:
  node door-knowledge-pdf-processor-v2.js <directorio-knowledge-base>

Ejemplo:
  node door-knowledge-pdf-processor-v2.js ./door_knowledge_base
`);
    process.exit(1);
  }

  const processor = new DoorKnowledgePDFProcessor(args[0]);
  await processor.processAll();
}

main().catch(console.error);