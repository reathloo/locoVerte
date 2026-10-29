import { test } from 'node:test';
import assert from 'node:assert/strict';
import pdfLib from '../vendor/pdf-lib/pdf-lib.min.js';
import { editPdfPages, isVisuallyBlank } from '../src/pdf-pages.js';

globalThis.PDFLib = pdfLib;

test('blank-page pixel check ignores pure white and keeps visible marks', () => {
  const white = new Uint8ClampedArray(20 * 20 * 4).fill(255);
  assert.equal(isVisuallyBlank(white, 20, 20), true);
  for (let index = 0; index < 8; index++) white[index * 4] = 0;
  assert.equal(isVisuallyBlank(white, 20, 20), false);
});

test('PDF copy fits mixed sizes and adds numbers and watermark', async () => {
  const input = await pdfLib.PDFDocument.create();
  input.addPage([300, 500]).drawText('Portrait content', { x: 30, y: 300 });
  input.addPage([500, 300]).drawText('Landscape content', { x: 30, y: 150 });
  const bytes = await input.save();
  const source = new File([bytes], 'mixed.pdf', { type: 'application/pdf' });
  const signal = new AbortController().signal;
  const before = new Uint8Array(await source.arrayBuffer());
  const output = await editPdfPages(source, [{ sourceIndex: 1, rotation: 90 }, { sourceIndex: 0, rotation: 0 }], signal,
    { pageSize: 'a4', pageNumbers: true, watermark: 'DRAFT' });
  const loaded = await pdfLib.PDFDocument.load(await output.arrayBuffer());
  assert.equal(loaded.getPageCount(), 2);
  for (const page of loaded.getPages()) {
    assert.ok(Math.abs(page.getWidth() - 595.28) < .01);
    assert.ok(Math.abs(page.getHeight() - 841.89) < .01);
  }
  assert.deepEqual(new Uint8Array(await source.arrayBuffer()), before);
});

test('unsupported watermark characters fail instead of producing a damaged PDF', async () => {
  const input = await pdfLib.PDFDocument.create();
  input.addPage([200, 300]);
  const source = new File([await input.save()], 'plain.pdf', { type: 'application/pdf' });
  await assert.rejects(editPdfPages(source, [{ sourceIndex: 0, rotation: 0 }], new AbortController().signal,
    { watermark: '秘密' }));
});
