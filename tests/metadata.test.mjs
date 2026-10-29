import test from 'node:test';
import assert from 'node:assert/strict';
import pdfLib from '../vendor/pdf-lib/pdf-lib.min.js';

globalThis.PDFLib = pdfLib;
const { stripGifMetadata, stripPdfMetadata } = await import('../src/metadata.js');

test('GIF metadata is removed without losing animation control data', async () => {
  const animated = Buffer.from('R0lGODlhAgACAPAAAP8AAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQACgAAACwAAAAAAgACAAAIBgABCAQQEAAh+QQACgAAACwAAAAAAgACAIAAAP8AAAAIBgABCAQQEAA7', 'base64');
  const dirty = new Blob([
    animated.subarray(0, -1),
    Buffer.from([0x21, 0xfe, 6]), Buffer.from('SECRET'), Buffer.from([0, 0x3b]),
  ], { type: 'image/gif' });
  const clean = await stripGifMetadata(dirty, new AbortController().signal);
  const text = Buffer.from(await clean.arrayBuffer()).toString('latin1');
  assert.equal(text.includes('SECRET'), false);
  assert.equal(text.includes('NETSCAPE2.0'), true);
  assert.equal((text.match(/\x2c/g) ?? []).length, 2);
});

test('PDF document information is absent from the rewritten file', async () => {
  const document = await pdfLib.PDFDocument.create();
  document.addPage();
  document.setTitle('SECRET TITLE');
  document.setAuthor('SECRET AUTHOR');
  const dirty = new Blob([await document.save()], { type: 'application/pdf' });
  const clean = await stripPdfMetadata(dirty, new AbortController().signal);
  const bytes = Buffer.from(await clean.arrayBuffer());
  const loaded = await pdfLib.PDFDocument.load(bytes, { updateMetadata: false });
  assert.equal(loaded.getTitle(), undefined);
  assert.equal(loaded.getAuthor(), undefined);
  assert.equal(bytes.toString('latin1').includes('SECRET'), false);
});
