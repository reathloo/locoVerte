import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { zipBlobs } from '../src/zip.js';
import { officeEntries } from '../src/office-conversion.js';
import { cleanOffice } from '../src/office-cleanup.js';

globalThis.DOMParser = DOMParser;
globalThis.XMLSerializer = XMLSerializer;

const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const signal = new AbortController().signal;
const documentXml = '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Keep</w:t></w:r><w:ins w:author="Alice" w:date="2025-01-01"><w:r><w:t> Added</w:t></w:r></w:ins><w:del w:author="Bob"><w:r><w:delText> Deleted</w:delText></w:r></w:del><w:commentRangeStart w:id="0"/><w:commentReference w:id="0"/><w:commentRangeEnd w:id="0"/></w:p></w:body></w:document>';
const parts = {
  '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/></Types>',
  '_rels/.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r1" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>',
  'word/_rels/document.xml.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/></Relationships>',
  'word/document.xml': documentXml,
  'word/comments.xml': '<?xml version="1.0"?><w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:comment w:author="Alice" w:date="2025-01-01"><w:p><w:r><w:t>Secret</w:t></w:r></w:p></w:comment></w:comments>',
  'docProps/core.xml': '<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"><cp:creator>Alice</cp:creator></cp:coreProperties>',
};

async function fixture() {
  const zip = await zipBlobs(Object.entries(parts).map(([name, xml]) => ({ name, blob: new Blob([xml]) })), signal);
  return new File([zip], 'private.docx', { type: mime });
}

test('DOCX metadata removal keeps format, comments and revisions independent', async () => {
  const source = await fixture();
  const metadata = await officeEntries(await cleanOffice(source, { removeMetadata: true }, signal));
  assert.equal(metadata.has('docProps/core.xml'), false);
  assert.equal(metadata.has('word/comments.xml'), true);
  assert.equal((await metadata.read('word/document.xml')).includes('w:author'), false);
  assert.equal((await metadata.read('word/document.xml')).includes('w:ins'), true);
  assert.equal((await metadata.read('word/comments.xml')).includes('w:author'), false);

  const comments = await officeEntries(await cleanOffice(source, { removeComments: true }, signal));
  assert.equal(comments.has('word/comments.xml'), false);
  assert.equal(comments.has('docProps/core.xml'), true);
  assert.equal((await comments.read('word/document.xml')).includes('commentReference'), false);
  assert.equal((await comments.read('word/document.xml')).includes('w:ins'), true);

  const changes = await officeEntries(await cleanOffice(source, { acceptChanges: true }, signal));
  const content = await changes.read('word/document.xml');
  assert.equal(content.includes('Keep'), true);
  assert.equal(content.includes('Added'), true);
  assert.equal(content.includes('Deleted'), false);
  assert.equal(content.includes('w:ins'), false);
  assert.equal(changes.has('word/comments.xml'), true);
});

test('XLSX and PPTX metadata copies preserve their file types and content parts', async () => {
  for (const [kind, content] of [
    ['spreadsheetml.sheet', 'xl/workbook.xml'],
    ['presentationml.presentation', 'ppt/presentation.xml'],
  ]) {
    const type = `application/vnd.openxmlformats-officedocument.${kind}`;
    const zip = await zipBlobs([
      { name: content, blob: new Blob(['<root/>']) },
      { name: 'docProps/core.xml', blob: new Blob(['<creator>Private</creator>']) },
    ], signal);
    const result = await cleanOffice(new File([zip], 'private.zip', { type }), { removeMetadata: true }, signal);
    const archive = await officeEntries(result);
    assert.equal(result.type, type);
    assert.equal(archive.has(content), true);
    assert.equal(archive.has('docProps/core.xml'), false);
  }
});
