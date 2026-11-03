// Keep PDF.js off the startup path and configure its worker before first use.
import { ensureUint8ArrayToHex } from './pdfjs-compat.js';

export async function loadPdfJs() {
  ensureUint8ArrayToHex();
  const pdfjs = await import('../vendor/pdfjs/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./pdfjs-worker.mjs', import.meta.url).href;
  return pdfjs;
}

export function pdfDocumentOptions(data, overrides = {}) {
  return {
    data,
    cMapUrl: new URL('../vendor/pdfjs/cmaps/', import.meta.url).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('../vendor/pdfjs/standard_fonts/', import.meta.url).href,
    wasmUrl: new URL('../vendor/pdfjs/wasm/', import.meta.url).href,
    iccUrl: new URL('../vendor/pdfjs/iccs/', import.meta.url).href,
    isEvalSupported: false,
    enableScripting: false,
    ...overrides,
  };
}
