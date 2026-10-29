import { t } from './i18n.js';
import { MAX_PDF_PAGES, MAX_PDF_OUTPUT_SIZE, MAX_FILE_SIZE } from './limits.js';

const MAX_PAGES = MAX_PDF_PAGES;
const MAX_OUTPUT_SIZE = MAX_PDF_OUTPUT_SIZE;
const MAX_MERGE_INPUT_SIZE = MAX_FILE_SIZE;
const UNSAFE_CATALOG_KEYS = ['AcroForm', 'Outlines', 'Names', 'Perms', 'OCProperties', 'StructTreeRoot', 'Collection', 'DSS'];
const PAGE_SIZES = { a4: [595.28, 841.89], a4Landscape: [841.89, 595.28], letter: [612, 792], letterLandscape: [792, 612] };

export function isVisuallyBlank(data, width, height) {
  let marked = 0;
  const pixels = width * height;
  for (let at = 0; at < pixels * 4; at += 4) {
    if (data[at + 3] > 16 && Math.min(data[at], data[at + 1], data[at + 2]) < 245 && ++marked >= 8) return false;
  }
  return true;
}

export async function findBlankPdfPages(file, signal, onProgress = () => {}) {
  await loadSafePdf(file, signal);
  const pdfjs = await import('../vendor/pdfjs/pdf.mjs');
  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: new URL('../vendor/pdfjs/cmaps/', import.meta.url).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('../vendor/pdfjs/standard_fonts/', import.meta.url).href,
    wasmUrl: new URL('../vendor/pdfjs/wasm/', import.meta.url).href,
    iccUrl: new URL('../vendor/pdfjs/iccs/', import.meta.url).href,
    isEvalSupported: false,
  });
  const abort = () => { task.destroy().catch(() => {}); };
  signal?.addEventListener('abort', abort, { once: true });
  try {
    const pdf = await task.promise;
    const blank = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      signal?.throwIfAborted();
      const page = await pdf.getPage(number);
      const canvas = document.createElement('canvas');
      try {
        const text = await page.getTextContent();
        if (text.items.some((item) => item.str?.trim())) { onProgress(number, pdf.numPages); continue; }
        const size = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(1, 256 / Math.max(size.width, size.height)) });
        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));
        const context = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
        if (!context) throw new Error(t('canvasMemory'));
        await page.render({ canvasContext: context, viewport, background: 'white' }).promise;
        if (isVisuallyBlank(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)) blank.push(number - 1);
        onProgress(number, pdf.numPages);
      } finally {
        canvas.width = canvas.height = 0;
        page.cleanup();
      }
    }
    return blank;
  } finally {
    signal?.removeEventListener('abort', abort);
    await task.destroy();
  }
}

async function loadSafePdf(file, signal) {
  signal?.throwIfAborted();
  let document;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const decoder = new TextDecoder('latin1');
    let tail = '';
    for (let offset = 0; offset < bytes.length; offset += 1024 ** 2) {
      signal?.throwIfAborted();
      const chunk = tail + decoder.decode(bytes.subarray(offset, offset + 1024 ** 2));
      if (/\/(?:ByteRange|Sig|Encrypt|XFA|EmbeddedFiles)\b/.test(chunk)) throw new Error(t('pdfPagesUnsafe'));
      tail = chunk.slice(-64);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    document = await PDFLib.PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    signal?.throwIfAborted();
    if (error.message === t('pdfPagesUnsafe')) throw error;
    throw new Error(t('pdfReadError'));
  }
  signal?.throwIfAborted();
  if (UNSAFE_CATALOG_KEYS.some((key) => document.catalog.has(PDFLib.PDFName.of(key)))
    || document.getPages().some((page) => page.node.Annots()?.size() > 0)) {
    throw new Error(t('pdfPagesUnsafe'));
  }
  if (document.getPageCount() > MAX_PAGES) throw new Error(t('tooManyPages'));
  if (!document.getPageCount()) throw new Error(t('pdfReadError'));
  return document;
}

export async function inspectPdfPages(file, signal) {
  const document = await loadSafePdf(file, signal);
  return document.getPages().map((page, sourceIndex) => ({ sourceIndex, rotation: page.getRotation().angle }));
}

function checkPlan(plan, count) {
  if (!Array.isArray(plan) || !plan.length || plan.length > MAX_PAGES) throw new Error(t('pdfPagesEmpty'));
  const seen = new Set();
  for (const page of plan) {
    if (!Number.isInteger(page.sourceIndex) || page.sourceIndex < 0 || page.sourceIndex >= count
      || seen.has(page.sourceIndex) || ![0, 90, 180, 270].includes(page.rotation)) {
      throw new Error(t('pdfPagesInvalid'));
    }
    seen.add(page.sourceIndex);
  }
}

async function savePdf(document, signal) {
  signal?.throwIfAborted();
  const bytes = await document.save({ useObjectStreams: true });
  signal?.throwIfAborted();
  if (bytes.byteLength > MAX_OUTPUT_SIZE) throw new Error(t('pdfOutputTooLarge'));
  return new Blob([bytes], { type: 'application/pdf' });
}

function pageOptions(options = {}) {
  const pageSize = options.pageSize || 'original';
  const watermark = (options.watermark || '').trim();
  if (pageSize !== 'original' && !PAGE_SIZES[pageSize] || watermark.length > 80 || /[\x00-\x1f]/.test(watermark)) throw new Error(t('pdfPageOptionsInvalid'));
  return { pageSize, watermark, pageNumbers: !!options.pageNumbers };
}

function drawPageNumber(page, font, number) {
  const label = String(number);
  const size = 10;
  page.drawText(label, { x: (page.getWidth() - font.widthOfTextAtSize(label, size)) / 2, y: 18, size, font, color: PDFLib.rgb(.25, .29, .34) });
}

function drawWatermark(page, font, label) {
  const size = Math.min(44, page.getWidth() * .7 / Math.max(font.widthOfTextAtSize(label, 1), 1));
  const width = font.widthOfTextAtSize(label, size);
  const angle = Math.PI / 6;
  page.drawText(label, { x: page.getWidth() / 2 - width * Math.cos(angle) / 2, y: page.getHeight() / 2 - width * Math.sin(angle) / 2,
    size, font, rotate: PDFLib.degrees(30), color: PDFLib.rgb(.35, .4, .46), opacity: .2 });
}

export async function editPdfPages(file, plan, signal, options = {}) {
  const input = await loadSafePdf(file, signal);
  checkPlan(plan, input.getPageCount());
  const { pageSize, watermark, pageNumbers } = pageOptions(options);
  const output = await PDFLib.PDFDocument.create();
  if (pageSize === 'original' && !watermark && !pageNumbers) {
    const pages = await output.copyPages(input, plan.map((page) => page.sourceIndex));
    for (let index = 0; index < pages.length; index++) {
      signal?.throwIfAborted();
      pages[index].setRotation(PDFLib.degrees(plan[index].rotation));
      output.addPage(pages[index]);
    }
  } else {
    const font = watermark || pageNumbers ? await output.embedFont(PDFLib.StandardFonts.Helvetica) : null;
    if (watermark) {
      try { font.encodeText(watermark); } catch { throw new Error(t('pdfWatermarkCharacters')); }
    }
    for (const [index, item] of plan.entries()) {
      signal?.throwIfAborted();
      const source = input.getPage(item.sourceIndex);
      const crop = source.getCropBox();
      const embedded = await output.embedPage(source, { left: crop.x, bottom: crop.y, right: crop.x + crop.width, top: crop.y + crop.height });
      const turned = item.rotation % 180 !== 0;
      const visualWidth = turned ? crop.height : crop.width;
      const visualHeight = turned ? crop.width : crop.height;
      const [width, height] = PAGE_SIZES[pageSize] || [visualWidth, visualHeight];
      const margin = Math.min(pageSize === 'original' ? (pageNumbers ? 28 : 0) : 24, Math.min(width, height) * .1);
      const scale = Math.min((width - 2 * margin) / visualWidth, (height - 2 * margin) / visualHeight);
      const angle = -item.rotation * Math.PI / 180;
      const corners = [[0, 0], [crop.width * scale, 0], [0, crop.height * scale], [crop.width * scale, crop.height * scale]]
        .map(([x, y]) => [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)]);
      const minX = Math.min(...corners.map(([x]) => x)), maxX = Math.max(...corners.map(([x]) => x));
      const minY = Math.min(...corners.map(([, y]) => y)), maxY = Math.max(...corners.map(([, y]) => y));
      const page = output.addPage([width, height]);
      page.drawPage(embedded, { x: (width - (maxX - minX)) / 2 - minX, y: (height - (maxY - minY)) / 2 - minY,
        width: crop.width * scale, height: crop.height * scale, rotate: PDFLib.degrees(-item.rotation) });
      if (watermark) drawWatermark(page, font, watermark);
      if (pageNumbers) drawPageNumber(page, font, index + 1);
    }
  }
  return savePdf(output, signal);
}

export async function mergePdfs(files, signal, onProgress = () => {}) {
  if (files.length < 2 || files.reduce((size, file) => size + file.size, 0) > MAX_MERGE_INPUT_SIZE) {
    throw new Error(t('pdfMergeLimit'));
  }
  const output = await PDFLib.PDFDocument.create();
  let count = 0;
  for (let index = 0; index < files.length; index++) {
    signal?.throwIfAborted();
    onProgress(index + 1, files.length);
    const input = await loadSafePdf(files[index], signal);
    count += input.getPageCount();
    if (count > MAX_PAGES) throw new Error(t('tooManyPages'));
    const pages = await output.copyPages(input, input.getPageIndices());
    for (const page of pages) output.addPage(page);
  }
  return savePdf(output, signal);
}
