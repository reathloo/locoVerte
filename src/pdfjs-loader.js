// Keep PDF.js off the startup path and configure its worker before first use.
export async function loadPdfJs() {
  const pdfjs = await import('../vendor/pdfjs/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.mjs', import.meta.url).href;
  return pdfjs;
}
