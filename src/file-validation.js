import { t } from './i18n.js';
import { officeEntries } from './office-conversion.js';
import { MAX_FILE_SIZE, MAX_MEDIA_FILE_SIZE } from './limits.js';

// Identify local files from their signatures before choosing a converter.
export async function validateFile(file) {
  if (!file.size) throw new Error(t('emptyFile'));
  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const starts = (...signature) => signature.every((byte, index) => bytes[index] === byte);
  const text = new TextDecoder('latin1').decode(bytes);
  const lowerName = file.name.toLowerCase();
  const isoMedia = text.slice(4, 8) === 'ftyp';
  const audioMp4 = isoMedia && (file.type.startsWith('audio/') || /\.(m4a|m4b)$/.test(lowerName));
  const claimedAac = file.type === 'audio/aac' || lowerName.endsWith('.aac');
  const adts = starts(0xff) && (bytes[1] & 0xf6) === 0xf0;
  const transportStream = starts(0x47) && bytes[188] === 0x47;
  const type = starts(0xff, 0xd8, 0xff) ? 'image/jpeg'
    : starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a) ? 'image/png'
      : text.startsWith('RIFF') && text.slice(8, 12) === 'WEBP' ? 'image/webp'
        : text.startsWith('BM') ? 'image/bmp'
        : text.startsWith('GIF87a') || text.startsWith('GIF89a') ? 'image/gif'
          : starts(0x49, 0x49, 0x2a, 0x00) || starts(0x4d, 0x4d, 0x00, 0x2a) ? 'image/tiff'
            : text.slice(4, 12).includes('ftypavif') || text.slice(4, 12).includes('ftypavis') ? 'image/avif'
              : /^ftyp(heic|heix|hevc|hevx|mif1)/.test(text.slice(4, 12)) ? 'image/heic'
        : text.startsWith('%PDF-') ? 'application/pdf'
          : audioMp4 ? 'audio/mp4'
            : isoMedia ? 'video/mp4'
            : starts(0x1a, 0x45, 0xdf, 0xa3) ? (text.includes('webm') ? 'video/webm' : 'video/x-matroska')
              : transportStream ? 'video/mp2t'
              : text.startsWith('fLaC') ? 'audio/flac'
                : text.startsWith('OggS') ? 'audio/ogg'
          : text.startsWith('RIFF') && text.slice(8, 12) === 'WAVE' ? 'audio/wav'
            : adts || claimedAac && text.startsWith('ID3') ? 'audio/aac'
              : text.startsWith('ID3') || (starts(0xff) && (bytes[1] & 0xe0) === 0xe0) ? 'audio/mpeg'
              : starts(0x50, 0x4b, 0x03, 0x04) ? 'office/zip' : null;
  if (!type) throw new Error(t('unsupported'));
  const limit = type.startsWith('audio/') || type.startsWith('video/') ? MAX_MEDIA_FILE_SIZE : MAX_FILE_SIZE;
  if (file.size > limit) throw new Error(t('fileTooLarge', { limit: Math.round(limit / 1024 ** 2) }));
  if (type === 'office/zip') {
    const archive = await officeEntries(file);
    const documentType = archive.has('word/document.xml') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : archive.has('xl/workbook.xml') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : archive.has('ppt/presentation.xml') ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : null;
    if (!documentType) throw new Error(t('unsupported'));
    return new File([file], file.name, { type: documentType, lastModified: file.lastModified });
  }
  return file.type === type ? file : new File([file], file.name, { type, lastModified: file.lastModified });
}
