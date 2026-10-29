import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { zipBlobs } from '../src/zip.js';

test('batch adjustments stay independent and apply metadata removal per file', async () => {
  const window = new Window({ url: 'https://local.invalid/index.html', settings: { disableJavaScriptEvaluation: true } });
  window.document.write(readFileSync(new URL('../index.html', import.meta.url), 'utf8'));
  for (const key of ['window', 'document', 'navigator', 'location', 'localStorage', 'Element', 'File', 'DataTransfer', 'Event']) {
    Object.defineProperty(globalThis, key, { value: window[key], configurable: true });
  }
  globalThis.DOMParser = DOMParser;
  globalThis.XMLSerializer = XMLSerializer;
  globalThis.Option = function Option(label, value) {
    const option = document.createElement('option');
    option.textContent = label;
    option.value = value;
    return option;
  };
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:,';
  await import('../src/main.js');

  const rows = () => [...document.querySelectorAll('.batch-item')];
  const waitFor = async (ready) => {
    for (let attempt = 0; attempt < 200; attempt++) {
      if (ready()) return;
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    throw new Error('The batch UI did not reach the expected state.');
  };
  const choose = (...files) => {
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    const input = document.querySelector('#file-input');
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const archive = await zipBlobs([
    { name: 'xl/workbook.xml', blob: new Blob(['<root/>']) },
    { name: 'docProps/core.xml', blob: new Blob(['<creator>Private</creator>']) },
  ], new AbortController().signal);
  const bytes = await archive.arrayBuffer();
  const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  choose(new File([bytes], 'first.xlsx', { type }), new File([bytes], 'second.xlsx', { type }));
  await waitFor(() => rows().length === 2);
  assert.equal(document.querySelector('#batch-remove-metadata'), null);
  rows()[0].querySelector('.batch-adjust-options').open = true;
  const metadata = rows()[0].querySelector('[data-batch-field="remove-metadata"]');
  metadata.checked = true;
  metadata.dispatchEvent(new Event('change', { bubbles: true }));
  assert.equal(rows()[0].querySelector('.batch-adjust-options').open, true);
  assert.equal(rows()[0].querySelector('[data-batch-field="remove-metadata"]').checked, true);
  assert.equal(rows()[1].querySelector('[data-batch-field="remove-metadata"]').checked, false);

  document.querySelector('#batch-process').click();
  await waitFor(() => rows().every((row) => row.querySelector('[data-action="download"]')));
  const statuses = rows().map((row) => row.querySelector('.batch-item-status').textContent);
  assert.match(statuses[0], /Metadata removed/);
  assert.doesNotMatch(statuses[1], /Metadata removed/);

  rows()[1].querySelector('[data-action="remove"]').click();
  assert.equal(document.querySelector('#single-workspace').hidden, false);
  assert.equal(document.querySelector('#remove-metadata').checked, true);
  document.querySelector('#remove-file').click();

  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
  choose(new File([png], 'first.png', { type: 'image/png' }), new File([png], 'second.png', { type: 'image/png' }));
  await waitFor(() => rows().length === 2 && rows()[0].querySelector('.batch-item-name').textContent === 'first.png');
  assert.equal(rows()[0].querySelector('.batch-adjust-options summary').textContent, 'Adjust image');
  const dimension = rows()[0].querySelector('[data-batch-field="max-dimension"]');
  dimension.value = '800';
  dimension.dispatchEvent(new Event('change', { bubbles: true }));
  assert.equal(rows()[0].querySelector('[data-batch-field="max-dimension"]').value, '800');
  assert.equal(rows()[1].querySelector('[data-batch-field="max-dimension"]').value, '');
  rows()[1].querySelector('[data-action="remove"]').click();
  assert.equal(document.querySelector('#max-dimension').value, '800');
});
