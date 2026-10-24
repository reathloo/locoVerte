// Generate local regression files without shipping binary test data in the extension.
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateSync, deflateRawSync } from 'node:zlib';
import pdfLib from '../vendor/pdf-lib/pdf-lib.min.js';
import UTIF from 'utif';

const directory = process.argv[2] ? join(process.cwd(), process.argv[2]) : await mkdtemp(join(tmpdir(), 'locoverte-tests-'));
if (process.argv[2]) await mkdir(directory, { recursive: true });
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}
const width = 900;
const height = 650;
const pixels = Buffer.alloc((width * 3 + 1) * height);
let seed = 42;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    const offset = y * (width * 3 + 1) + 1 + x * 3;
    pixels[offset] = x / width * 200 + (seed % 35);
    pixels[offset + 1] = y / height * 200 + (seed % 35);
    pixels[offset + 2] = 120 + (seed % 60);
  }
}
const header = Buffer.alloc(13);
header.writeUInt32BE(width);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 2;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
const files = {};
async function save(name, content) {
  files[name] = join(directory, name);
  await writeFile(files[name], content);
}
await save('image.png', png);
await save('image-no-extension', png);
await save('image.gif', Buffer.from('R0lGODlhAgACAPAAAP8AAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQACgAAACwAAAAAAgACAAAIBgABCAQQEAAh+QQACgAAACwAAAAAAgACAIAAAP8AAAAIBgABCAQQEAA7', 'base64'));
await save('image.tiff', Buffer.from(UTIF.encodeImage(new Uint8Array([255, 0, 0, 255]), 1, 1)));
await save('invalid.jpg', 'This is not an image.');
await save('broken.pdf', '%PDF-1.7\nBroken PDF for error handling.');
await save('empty.png', '');
const text = await pdfLib.PDFDocument.create();
text.addPage().drawText('locoVerte: searchable text and vector shapes', { x: 40, y: 780, size: 16 });
text.getPage(0).drawRectangle({ x: 40, y: 650, width: 150, height: 80, color: pdfLib.rgb(.2, .4, .7) });
await save('text.pdf', await text.save());
const scan = await pdfLib.PDFDocument.create();
const embedded = await scan.embedPng(png);
for (let index = 0; index < 12; index++) {
  const page = scan.addPage([900, 650]);
  page.drawImage(embedded, { x: 0, y: 0, width: 900, height: 650 });
}
await save('scan.pdf', await scan.save());
function zip(entries) {
  const local = [];
  const central = [];
  let position = 0;
  for (const [filename, content] of Object.entries(entries)) {
    const name = Buffer.from(filename);
    const raw = Buffer.from(content);
    const compressed = deflateRawSync(raw);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(8, 8);
    header.writeUInt32LE(crc32(raw), 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(raw.length, 22);
    header.writeUInt16LE(name.length, 26);
    local.push(header, name, compressed);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50);
    directory.writeUInt16LE(20, 4);
    directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(8, 10);
    directory.writeUInt32LE(crc32(raw), 16);
    directory.writeUInt32LE(compressed.length, 20);
    directory.writeUInt32LE(raw.length, 24);
    directory.writeUInt16LE(name.length, 28);
    directory.writeUInt32LE(position, 42);
    central.push(directory, name);
    position += header.length + name.length + compressed.length;
  }
  const localData = Buffer.concat(local);
  const directoryData = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10);
  end.writeUInt32LE(directoryData.length, 12);
  end.writeUInt32LE(localData.length, 16);
  return Buffer.concat([localData, directoryData, end]);
}
await save('document.docx', zip({
  'word/document.xml': '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Hello Word</w:t></w:r></w:p><w:p><w:r><w:t>Second line</w:t></w:r></w:p></w:body></w:document>',
}));
await save('sheet.xlsx', zip({
  'xl/workbook.xml': '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets><sheet name="Sheet1" sheetId="1"/></sheets></workbook>',
  'xl/sharedStrings.xml': '<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Name</t></si><si><t>Ada</t></si></sst>',
  'xl/worksheets/sheet1.xml': '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1"><v>42</v></c></row><row r="2"><c r="A2" t="s"><v>1</v></c><c r="B2"><v>7</v></c></row></sheetData></worksheet>',
}));
await save('slides.pptx', zip({
  'ppt/presentation.xml': '<?xml version="1.0"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>',
  'ppt/slides/slide1.xml': '<?xml version="1.0"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:p><a:r><a:t>Hello Slides</a:t></a:r></a:p></p:sld>',
}));
const wav = Buffer.alloc(44 + 44100 * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVE', 8); wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(44100, 24); wav.writeUInt32LE(88200, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);
for (let index = 0; index < 44100; index++) wav.writeInt16LE(Math.round(Math.sin(index * 440 * 2 * Math.PI / 44100) * 8000), 44 + index * 2);
await save('tone.wav', wav);
console.log(JSON.stringify(files, null, 2));
