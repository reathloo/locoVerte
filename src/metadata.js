import { t } from './i18n.js';

function subBlocksEnd(bytes, offset) {
  while (offset < bytes.length) {
    const size = bytes[offset++];
    if (size === 0) return offset;
    offset += size;
    if (offset > bytes.length) break;
  }
  throw new Error(t('metadataRemovalFailed'));
}

// GIF comments, plain-text blocks and application extensions may contain
// author, location or editing data. Graphic-control blocks and the animation
// loop extension are presentation data and must remain for correct playback.
export async function stripGifMetadata(file, signal) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  signal.throwIfAborted();
  const signature = new TextDecoder('ascii').decode(bytes.subarray(0, 6));
  if (!['GIF87a', 'GIF89a'].includes(signature) || bytes.length < 14) throw new Error(t('metadataRemovalFailed'));
  const globalTableSize = bytes[10] & 0x80 ? 3 * 2 ** ((bytes[10] & 0x07) + 1) : 0;
  let offset = 13 + globalTableSize;
  if (offset >= bytes.length) throw new Error(t('metadataRemovalFailed'));
  const parts = [bytes.slice(0, offset)];
  let trailerFound = false;

  while (offset < bytes.length) {
    signal.throwIfAborted();
    const start = offset;
    const marker = bytes[offset++];
    if (marker === 0x3b) {
      parts.push(bytes.slice(start, offset));
      trailerFound = true;
      break;
    }
    if (marker === 0x2c) {
      if (offset + 9 > bytes.length) throw new Error(t('metadataRemovalFailed'));
      const packed = bytes[offset + 8];
      offset += 9;
      if (packed & 0x80) offset += 3 * 2 ** ((packed & 0x07) + 1);
      if (offset >= bytes.length) throw new Error(t('metadataRemovalFailed'));
      offset += 1;
      offset = subBlocksEnd(bytes, offset);
      parts.push(bytes.slice(start, offset));
      continue;
    }
    if (marker !== 0x21 || offset >= bytes.length) throw new Error(t('metadataRemovalFailed'));
    const label = bytes[offset++];
    const firstBlockSize = bytes[offset];
    const identifier = label === 0xff && offset + 1 + firstBlockSize <= bytes.length
      ? new TextDecoder('ascii').decode(bytes.subarray(offset + 1, offset + 1 + firstBlockSize)) : '';
    offset = subBlocksEnd(bytes, offset);
    const keep = label === 0xf9 || (label === 0xff && ['NETSCAPE2.0', 'ANIMEXTS1.0'].includes(identifier));
    if (keep) parts.push(bytes.slice(start, offset));
  }
  if (!trailerFound) throw new Error(t('metadataRemovalFailed'));
  return new Blob(parts, { type: 'image/gif' });
}

function deleteReferenced(context, dictionary, name) {
  const key = PDFLib.PDFName.of(name);
  const reference = dictionary.get(key);
  dictionary.delete(key);
  if (reference instanceof PDFLib.PDFRef) context.delete(reference);
}

export async function stripPdfMetadata(blob, signal) {
  signal.throwIfAborted();
  try {
    const document = await PDFLib.PDFDocument.load(await blob.arrayBuffer(), { updateMetadata: false });
    const { context, catalog } = document;
    const info = context.trailerInfo.Info;
    context.trailerInfo.Info = undefined;
    if (info instanceof PDFLib.PDFRef) context.delete(info);
    for (const name of ['Metadata', 'PieceInfo']) deleteReferenced(context, catalog, name);
    for (const page of document.getPages()) {
      for (const name of ['Metadata', 'PieceInfo']) deleteReferenced(context, page.node, name);
    }
    const bytes = await document.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
    signal.throwIfAborted();
    return new Blob([bytes], { type: 'application/pdf' });
  } catch (error) {
    signal.throwIfAborted();
    throw new Error(t('metadataRemovalFailed'), { cause: error });
  }
}
