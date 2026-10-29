import { t } from './i18n.js';
import { officeEntries } from './office-conversion.js';
import { ALL_FORMATS, BlobSource, Input } from '../vendor/generated/media-vendor.js';

const decoder = new TextDecoder('latin1');
const exifNames = { 0x010f: 'Camera maker', 0x0110: 'Camera model', 0x0131: 'Software', 0x0132: 'Modified', 0x013b: 'Artist', 0x8298: 'Copyright', 0x9003: 'Taken', 0x9004: 'Digitized', 0x8825: 'GPS' };

function exif(bytes) {
  const findings = [];
  const start = decoder.decode(bytes.subarray(0, 6)) === 'Exif\0\0' ? 6 : 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset + start, bytes.byteLength - start);
  if (view.byteLength < 8) return findings;
  const little = view.getUint16(0) === 0x4949;
  if (!little && view.getUint16(0) !== 0x4d4d || view.getUint16(2, little) !== 42) return findings;
  const u16 = (at) => view.getUint16(at, little);
  const u32 = (at) => view.getUint32(at, little);
  const seen = new Set();
  function directory(at, depth = 0) {
    if (depth > 3 || at < 8 || at + 2 > view.byteLength || seen.has(at)) return;
    seen.add(at);
    const count = Math.min(u16(at), 512);
    const gps = {};
    for (let index = 0; index < count; index++) {
      const entry = at + 2 + index * 12;
      if (entry + 12 > view.byteLength) break;
      const tag = u16(entry), type = u16(entry + 2), length = u32(entry + 4), pointer = u32(entry + 8);
      if (tag === 0x8769 || tag === 0x8825) directory(pointer, depth + 1);
      if ([1, 3].includes(tag) && type === 2 && length <= 4) gps[tag] = decoder.decode(new Uint8Array(view.buffer, view.byteOffset + entry + 8, length)).replace(/\0/g, '');
      if ([2, 4].includes(tag) && type === 5 && length === 3 && pointer + 24 <= view.byteLength) {
        gps[tag] = [0, 1, 2].map((part) => {
          const numerator = u32(pointer + part * 8), denominator = u32(pointer + part * 8 + 4);
          return denominator ? numerator / denominator : 0;
        });
      }
      if (!exifNames[tag]) continue;
      let value = '';
      if (tag === 0x8825) value = t('privacyGpsPresent');
      else if (type === 2 && length > 0 && length < 4096) {
        const position = length <= 4 ? entry + 8 : pointer;
        if (position + length <= view.byteLength) value = decoder.decode(new Uint8Array(view.buffer, view.byteOffset + position, length)).replace(/\0+$/, '').trim();
      }
      if (value) findings.push({ label: exifNames[tag], value });
    }
    if (gps[2] && gps[4]) {
      const coordinate = (parts, sign) => ((parts[0] + parts[1] / 60 + parts[2] / 3600) * (['S', 'W'].includes(sign) ? -1 : 1)).toFixed(6);
      findings.push({ label: 'GPS', value: `${coordinate(gps[2], gps[1])}, ${coordinate(gps[4], gps[3])}` });
    }
  }
  directory(u32(4));
  return findings;
}

export async function inspectPrivacy(file) {
  const findings = [];
  const add = (label, value) => { if (value) findings.push({ label, value: String(value).slice(0, 240) }); };
  if (file.type === 'image/jpeg') {
    const bytes = new Uint8Array(await file.arrayBuffer());
    for (let at = 2; at + 4 <= bytes.length && bytes[at] === 0xff;) {
      const marker = bytes[at + 1], length = bytes[at + 2] * 256 + bytes[at + 3];
      if (length < 2 || at + 2 + length > bytes.length || marker === 0xda) break;
      if (marker === 0xe1) findings.push(...exif(bytes.subarray(at + 4, at + 2 + length)));
      if (marker === 0xed) add('IPTC', t('privacyEmbeddedData'));
      if (marker === 0xe1 && decoder.decode(bytes.subarray(at + 4, at + 32)).includes('xmp')) add('XMP', t('privacyEmbeddedData'));
      at += 2 + length;
    }
  } else if (file.type === 'image/png') {
    const bytes = new Uint8Array(await file.arrayBuffer());
    for (let at = 8; at + 12 <= bytes.length;) {
      const length = new DataView(bytes.buffer, bytes.byteOffset + at, 4).getUint32(0);
      if (at + 12 + length > bytes.length) break;
      const kind = decoder.decode(bytes.subarray(at + 4, at + 8));
      if (['tEXt', 'iTXt', 'zTXt', 'eXIf'].includes(kind)) {
        const raw = bytes.subarray(at + 8, at + 8 + length);
        if (kind === 'eXIf') findings.push(...exif(raw));
        else add(decoder.decode(raw.subarray(0, raw.indexOf(0) < 0 ? Math.min(raw.length, 80) : raw.indexOf(0))), kind === 'tEXt' ? decoder.decode(raw.subarray(raw.indexOf(0) + 1)) : t('privacyEmbeddedData'));
      }
      at += length + 12;
    }
  } else if (file.type === 'application/pdf') {
    const document = await PDFLib.PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
    for (const [label, value] of [['Title', document.getTitle()], ['Author', document.getAuthor()], ['Subject', document.getSubject()], ['Keywords', document.getKeywords()], ['Creator', document.getCreator()], ['Producer', document.getProducer()], ['Created', document.getCreationDate()], ['Modified', document.getModificationDate()]]) add(label, value instanceof Date ? value.toISOString() : value);
    if (document.catalog.has(PDFLib.PDFName.of('Metadata'))) add('XMP', t('privacyEmbeddedData'));
  } else if (file.type === 'image/gif') {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (decoder.decode(bytes).includes('XMP DataXMP')) add('XMP', t('privacyEmbeddedData'));
    if (bytes.some((byte, index) => byte === 0x21 && bytes[index + 1] === 0xfe)) add('Comment', t('privacyEmbeddedData'));
  } else if (/^(audio|video)\//.test(file.type)) {
    const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    try {
      if (!await input.canRead()) throw new Error(t('privacyUnavailable'));
      for (const [label, value] of Object.entries(await input.getMetadataTags())) {
        if (value == null) continue;
        add(label, typeof value === 'string' || typeof value === 'number' || value instanceof Date ? value : t('privacyEmbeddedData'));
      }
    } finally { input.dispose(); }
  } else if (file.type.includes('officedocument')) {
    const zip = await officeEntries(file);
    for (const path of ['docProps/core.xml', 'docProps/app.xml', 'docProps/custom.xml']) {
      if (!zip.has(path)) continue;
      const xml = new DOMParser().parseFromString(await zip.read(path), 'application/xml');
      if (xml.querySelector('parsererror')) continue;
      for (const node of xml.documentElement.children) {
        if (node.textContent.trim() && !['Properties', 'Application', 'AppVersion'].includes(node.localName)) add(node.localName, node.textContent.trim());
      }
    }
    for (const path of zip.names()) {
      if (/comments?\d*\.xml$/i.test(path)) add('Comments', t('privacyEmbeddedData'));
    }
  }
  return findings;
}
