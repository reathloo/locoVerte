import { imageBitmap } from './conversion.js';
import { MAX_PDF_OUTPUT_SIZE, MAX_PDF_PAGES } from './limits.js';
import { t } from './i18n.js';
import { loadPdfJs } from './pdfjs-loader.js';

// Rectangles use fractions of the original page; display scaling never changes export coordinates.
export function createRedactionEditor(root, onResult, onError) {
  const $ = (id) => root.querySelector(`[data-redact-field="${id}"]`) ?? root.querySelector(`#${id}`);
  const preview = $('redact-preview'), overlay = $('redact-overlay');
  const context = overlay.getContext('2d');
  let file, document, pages = [], regions = [], current = 0, drag = null, generation = 0;
  const normalized = (event) => {
    const bounds = overlay.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) };
  };
  const rect = (a, b) => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) });
  function paint() {
    overlay.width = preview.width; overlay.height = preview.height;
    context.fillStyle = '#101010';
    for (const area of [...regions.filter((item) => item.page === current || item.all), ...(drag ? [rect(drag, drag.end)] : [])]) {
      context.fillRect(area.x * overlay.width, area.y * overlay.height, area.width * overlay.width, area.height * overlay.height);
    }
    $('redact-count').textContent = t('redactCount', { count: regions.length });
  }
  async function pageCanvas(index, scale = 1) {
    const canvas = globalThis.document.createElement('canvas');
    if (document) {
      const page = await document.getPage(index + 1);
      const original = page.getViewport({ scale: 1 });
      const factor = Math.min(scale, 3200 / Math.max(original.width, original.height), Math.sqrt(12_000_000 / (original.width * original.height)));
      const viewport = page.getViewport({ scale: factor });
      canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
      await page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport, background: 'white' }).promise;
    } else {
      const bitmap = await imageBitmap(file);
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      bitmap.close();
    }
    return canvas;
  }
  async function showPage() {
    const request = generation;
    const canvas = await pageCanvas(current, document ? 1.2 : 1);
    if (request !== generation) return;
    preview.width = canvas.width; preview.height = canvas.height;
    preview.getContext('2d').drawImage(canvas, 0, 0);
    canvas.width = canvas.height = 0;
    $('redact-page').textContent = t('redactPage', { page: current + 1, total: pages.length });
    $('redact-prev').disabled = current === 0;
    $('redact-next').disabled = current === pages.length - 1;
    paint();
  }
  function reset() {
    generation++;
    document?.destroy(); document = null; file = null; pages = []; regions = []; current = 0;
    drag = null;
    preview.width = preview.height = overlay.width = overlay.height = 0;
    for (const side of ['top', 'right', 'bottom', 'left']) $(`redact-crop-${side}`).value = '0';
    $('redact-all-pages').checked = false;
    root.hidden = true;
  }
  async function open(source) {
    reset(); file = source; root.hidden = false;
    $('redact-status').textContent = t('redactLoading');
    try {
      if (source.type === 'application/pdf') {
        const pdfjs = await loadPdfJs();
        const task = pdfjs.getDocument({ data: new Uint8Array(await source.arrayBuffer()), isEvalSupported: false,
          cMapUrl: new URL('../vendor/pdfjs/cmaps/', import.meta.url).href, cMapPacked: true,
          standardFontDataUrl: new URL('../vendor/pdfjs/standard_fonts/', import.meta.url).href,
          wasmUrl: new URL('../vendor/pdfjs/wasm/', import.meta.url).href,
          iccUrl: new URL('../vendor/pdfjs/iccs/', import.meta.url).href });
        document = await task.promise;
        if (!document.numPages || document.numPages > MAX_PDF_PAGES) throw new Error(t('tooManyPages'));
        pages = Array.from({ length: document.numPages }, (_, index) => index);
      } else pages = [0];
      await showPage();
      $('redact-status').textContent = t('redactInstructions');
    } catch (error) { reset(); onError(error); }
  }
  overlay.addEventListener('pointerdown', (event) => {
    if (!file) return;
    overlay.setPointerCapture(event.pointerId);
    drag = { ...normalized(event), end: normalized(event) }; paint();
  });
  overlay.addEventListener('pointermove', (event) => { if (drag) { drag.end = normalized(event); paint(); } });
  overlay.addEventListener('pointerup', (event) => {
    if (!drag) return;
    const area = rect(drag, normalized(event)); drag = null;
    if (area.width > .002 && area.height > .002) regions.push({ ...area, page: current, all: $('redact-all-pages').checked });
    paint();
  });
  $('redact-prev').addEventListener('click', () => { current--; showPage().catch(onError); });
  $('redact-next').addEventListener('click', () => { current++; showPage().catch(onError); });
  $('redact-undo').addEventListener('click', () => { regions.pop(); paint(); });
  $('redact-cancel').addEventListener('click', reset);
  $('redact-header').addEventListener('click', () => addBand('top'));
  $('redact-footer').addEventListener('click', () => addBand('bottom'));
  function addBand(position) {
    const amount = Number($('redact-band-size').value) / 100;
    if (!(amount > 0 && amount <= .4)) return;
    regions.push({ x: 0, y: position === 'top' ? 0 : 1 - amount, width: 1, height: amount, page: current, all: $('redact-all-pages').checked });
    paint();
  }
  $('redact-export').addEventListener('click', async () => {
    const crop = ['top', 'right', 'bottom', 'left'].map((side) => Number($(`redact-crop-${side}`).value) / 100);
    if (!file || !regions.length && crop.every((amount) => amount === 0)) return onError(new Error(t('redactNothing')));
    if (crop.some((amount) => !Number.isFinite(amount) || amount < 0 || amount > .4) || crop[0] + crop[2] >= .8 || crop[1] + crop[3] >= .8) return onError(new Error(t('redactInvalidCrop')));
    $('redact-export').disabled = true;
    try {
      const pdf = document ? await PDFLib.PDFDocument.create() : null;
      let imageResult;
      for (let index = 0; index < pages.length; index++) {
        const canvas = await pageCanvas(index, document ? 2 : 1);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        for (const area of regions.filter((item) => item.all || item.page === index)) {
          const x = Math.floor(area.x * canvas.width), y = Math.floor(area.y * canvas.height);
          ctx.fillRect(x, y, Math.ceil(area.width * canvas.width) + 1, Math.ceil(area.height * canvas.height) + 1);
        }
        let outputCanvas = canvas;
        if (crop.some(Boolean)) {
          outputCanvas = globalThis.document.createElement('canvas');
          const x = Math.floor(crop[3] * canvas.width), y = Math.floor(crop[0] * canvas.height);
          outputCanvas.width = Math.max(1, canvas.width - x - Math.floor(crop[1] * canvas.width));
          outputCanvas.height = Math.max(1, canvas.height - y - Math.floor(crop[2] * canvas.height));
          outputCanvas.getContext('2d').drawImage(canvas, -x, -y);
        }
        const jpeg = await new Promise((resolve) => outputCanvas.toBlob(resolve, 'image/jpeg', .94));
        if (!jpeg) throw new Error(t('imageEncodeError'));
        if (pdf) {
          const embedded = await pdf.embedJpg(await jpeg.arrayBuffer());
          pdf.addPage([outputCanvas.width, outputCanvas.height]).drawImage(embedded, { x: 0, y: 0, width: outputCanvas.width, height: outputCanvas.height });
        } else imageResult = jpeg;
        if (outputCanvas !== canvas) outputCanvas.width = outputCanvas.height = 0;
        canvas.width = canvas.height = 0;
      }
      const blob = pdf ? new Blob([await pdf.save()], { type: 'application/pdf' }) : imageResult;
      if (blob.size > MAX_PDF_OUTPUT_SIZE) throw new Error(t('pdfOutputTooLarge'));
      onResult(file, blob);
      reset();
    } catch (error) { onError(error); }
    finally { $('redact-export').disabled = false; }
  });
  return { open, reset };
}
