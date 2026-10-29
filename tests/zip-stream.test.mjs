import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zipBlobs } from '../src/zip.js';
import { officeEntries } from '../src/office-conversion.js';

test('streamed ZIP checksum remains valid across many Blob chunks', async () => {
  const content = 'local-data-'.repeat(200_000);
  const archive = await zipBlobs([{ name: 'payload.txt', blob: new Blob([content]) }], new AbortController().signal);
  const reader = await officeEntries(archive);
  assert.equal(await reader.read('payload.txt'), content);
});
