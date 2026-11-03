import assert from 'node:assert/strict';
import test from 'node:test';

import { ensureUint8ArrayToHex } from '../src/pdfjs-compat.js';

test('PDF.js hex compatibility matches the standard method', () => {
  const original = Uint8Array.prototype.toHex;
  try {
    delete Uint8Array.prototype.toHex;
    ensureUint8ArrayToHex();
    assert.equal(new Uint8Array([0, 15, 16, 202, 254]).toHex(), '000f10cafe');
  } finally {
    if (original) Object.defineProperty(Uint8Array.prototype, 'toHex', { configurable: true, writable: true, value: original });
    else delete Uint8Array.prototype.toHex;
  }
});
