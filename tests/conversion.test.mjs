import { test } from 'node:test';
import assert from 'node:assert/strict';
import pdfLib from '../vendor/pdf-lib/pdf-lib.js';
import { compressImageToTarget, estimatePdf } from '../src/conversion.js';

test('target-size image search decodes and closes the source bitmap once', async () => {
  let decodes = 0;
  let closes = 0;
  globalThis.createImageBitmap = async () => {
    decodes += 1;
    return { width: 800, height: 600, close: () => { closes += 1; } };
  };
  globalThis.document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({
        fillRect() {},
        translate() {},
        rotate() {},
        drawImage() {},
      }),
      toBlob(callback, type, quality) {
        callback(new Blob([new Uint8Array(100 + Math.round(quality * 1_000))], { type }));
      },
    }),
  };

  const source = new File([new Uint8Array([1])], 'source.png', { type: 'image/png' });
  const result = await compressImageToTarget(source, 'image/jpeg', 1, new AbortController().signal);

  assert.equal(result.targetMet, false);
  assert.equal(decodes, 1);
  assert.equal(closes, 1);
});

test('gentle structural PDF estimate does not require loading PDF.js', async () => {
  globalThis.PDFLib = pdfLib;
  const document = await pdfLib.PDFDocument.create();
  document.addPage([300, 400]);
  const source = new File([await document.save()], 'plain.pdf', { type: 'application/pdf' });

  const result = await estimatePdf(source, 80, new AbortController().signal);

  assert.equal(result.pages, 1);
  assert.equal(result.structural, true);
  assert.ok(result.size > 0);
});
