import { zipBlobs } from './zip.js';
import { t } from './i18n.js';

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const MAX_UNCOMPRESSED = 512 * 1024 ** 2;
const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = value >>> 1 ^ (value & 1 ? 0xedb88320 : 0);
  return value >>> 0;
});

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 255] ^ value >>> 8;
  return (value ^ 0xffffffff) >>> 0;
}

async function entries(file, signal) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const u16 = (at) => view.getUint16(at, true), u32 = (at) => view.getUint32(at, true);
  let end = -1;
  for (let at = bytes.length - 22; at >= Math.max(0, bytes.length - 65557); at--) if (u32(at) === 0x06054b50) { end = at; break; }
  if (end < 0 || u16(end + 8) !== u16(end + 10) || u16(end + 10) > 10000) throw new Error(t('officeReadError'));
  const list = [];
  let at = u32(end + 16), total = 0;
  for (let index = 0; index < u16(end + 10); index++) {
    signal.throwIfAborted();
    if (at + 46 > bytes.length || u32(at) !== 0x02014b50 || u16(at + 8) & 1) throw new Error(t('officeReadError'));
    const method = u16(at + 10), compressed = u32(at + 20), size = u32(at + 24), nameSize = u16(at + 28);
    const name = decoder.decode(bytes.subarray(at + 46, at + 46 + nameSize));
    const local = u32(at + 42), start = local + 30 + u16(local + 26) + u16(local + 28);
    if (local + 30 > bytes.length || u32(local) !== 0x04034b50 || start + compressed > bytes.length || ![0, 8].includes(method) || !name || name.includes('..') || name.startsWith('/')) throw new Error(t('officeReadError'));
    total += size;
    if (total > MAX_UNCOMPRESSED) throw new Error(t('officeReadError'));
    let data = bytes.subarray(start, start + compressed);
    if (method === 8) data = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    if (data.length !== size || crc32(data) !== u32(at + 16)) throw new Error(t('officeReadError'));
    list.push({ name, data });
    at += 46 + nameSize + u16(at + 30) + u16(at + 32);
  }
  return list;
}

const isCommentPart = (name) => /(?:^|\/)(?:comments(?:Extended|Ids)?\d*|commentAuthors|person|people)\.xml$/i.test(name);
const isProperties = (name) => /^docProps\/(?:core|app|custom)\.xml$|^docProps\/thumbnail\.[^/]+$/i.test(name);

function parseXml(data) {
  const xml = new DOMParser().parseFromString(decoder.decode(data), 'application/xml');
  if (xml.getElementsByTagName('parsererror').length || xml.doctype) throw new Error(t('officeReadError'));
  return xml;
}

function editXml(entry, { removeMetadata, removeComments, acceptChanges }) {
  const xml = parseXml(entry.data);
  const elements = Array.from(xml.getElementsByTagName('*'));
  for (const node of elements.reverse()) {
    if (!node.parentNode) continue;
    const name = node.localName;
    const namespace = node.namespaceURI || '';
    if (removeMetadata && /wordprocessingml|spreadsheetml|presentationml/.test(namespace) && /^(ins|del|moveFrom|moveTo|comment|commentAuthor|person|author)$/.test(name)) {
      for (const attribute of [...node.attributes]) {
        if (/^(author|date|initials|name|userId|providerId|email)$/i.test(attribute.localName)) node.removeAttributeNode(attribute);
      }
    }
    if (removeComments && /wordprocessingml|spreadsheetml|presentationml/.test(namespace) && ['commentRangeStart', 'commentRangeEnd', 'commentReference', 'comment', 'legacyDrawing'].includes(name)) node.parentNode.removeChild(node);
    if (acceptChanges && /wordprocessingml/.test(namespace)) {
      if (['del', 'moveFrom', 'delText'].includes(name)) node.parentNode.removeChild(node);
      else if (['ins', 'moveTo'].includes(name)) {
        while (node.firstChild) node.parentNode.insertBefore(node.firstChild, node);
        node.parentNode.removeChild(node);
      } else if (['rPrChange', 'pPrChange', 'tblPrChange', 'trPrChange', 'tcPrChange', 'sectPrChange'].includes(name)) node.parentNode.removeChild(node);
    }
    if (!node.parentNode) continue;
    if (removeComments && namespace.includes('package/2006/relationships') && /comment|person/.test(node.getAttribute('Type') || '')) node.parentNode.removeChild(node);
    if (removeMetadata && namespace.includes('package/2006/relationships') && /core-properties|extended-properties|custom-properties|thumbnail/.test(node.getAttribute('Type') || '')) node.parentNode.removeChild(node);
    if (removeComments && name === 'Override' && /comments|person/.test(node.getAttribute('PartName') || '')) node.parentNode.removeChild(node);
    if (removeMetadata && name === 'Override' && /docProps\//.test(node.getAttribute('PartName') || '')) node.parentNode.removeChild(node);
  }
  return encoder.encode(new XMLSerializer().serializeToString(xml));
}

export async function cleanOffice(file, options, signal) {
  const list = await entries(file, signal);
  if (list.some(({ name }) => /^_xmlsignatures\//i.test(name))) throw new Error(t('officeReadError'));
  if ((options.acceptChanges || options.removeComments) && !file.type.includes('wordprocessingml')) throw new Error(t('officeChangesDocxOnly'));
  const output = [];
  for (const entry of list) {
    signal.throwIfAborted();
    if (options.removeMetadata && isProperties(entry.name) || options.removeComments && isCommentPart(entry.name)) continue;
    let data = entry.data;
    if (entry.name.endsWith('.xml') || entry.name.endsWith('.rels')) {
      if (options.removeComments || options.acceptChanges || options.removeMetadata && (entry.name.endsWith('.rels') || entry.name === '[Content_Types].xml' || /^(?:word|xl|ppt)\//.test(entry.name))) data = editXml(entry, options);
    }
    output.push({ name: entry.name, blob: new Blob([data]) });
  }
  const blob = await zipBlobs(output, signal);
  return new Blob([blob], { type: file.type });
}
