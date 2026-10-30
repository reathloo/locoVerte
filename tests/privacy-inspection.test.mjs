import test from 'node:test';
import assert from 'node:assert/strict';
import pdfLib from '../vendor/pdf-lib/pdf-lib.js';

globalThis.PDFLib = pdfLib;
const { inspectPrivacy } = await import('../src/privacy-inspection.js');

test('PDF properties report the values present in the selected file', async () => {
  const document = await pdfLib.PDFDocument.create();
  document.addPage();
  document.setAuthor('Ada Example');
  document.setTitle('Private draft');
  const findings = await inspectPrivacy(new Blob([await document.save()], { type: 'application/pdf' }));
  assert.ok(findings.some(({ label, value }) => label === 'Author' && value === 'Ada Example'));
  assert.ok(findings.some(({ label, value }) => label === 'Title' && value === 'Private draft'));
});

test('PNG textual metadata reports its actual value', async () => {
  const header = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const data = new TextEncoder().encode('Author\0Ada Example');
  const chunk = new Uint8Array(12 + data.length);
  new DataView(chunk.buffer).setUint32(0, data.length);
  chunk.set(new TextEncoder().encode('tEXt'), 4);
  chunk.set(data, 8);
  const findings = await inspectPrivacy(new Blob([header, chunk], { type: 'image/png' }));
  assert.deepEqual(findings, [{ label: 'Author', value: 'Ada Example' }]);
});
