import { ALL_FORMATS, BlobSource, StreamTarget, Conversion, Input, Output,
  Mp3OutputFormat, OggOutputFormat, FlacOutputFormat, WavOutputFormat,
  Mp4OutputFormat, MovOutputFormat, WebMOutputFormat, MkvOutputFormat,
  MpegTsOutputFormat, AdtsOutputFormat } from '../vendor/generated/media-vendor.js';
import { createSeekableBlob } from './seekable-blob.js';
import { t } from './i18n.js';

const formats = {
  'audio/mpeg': Mp3OutputFormat, 'audio/mp4': Mp4OutputFormat,
  'audio/aac': AdtsOutputFormat, 'audio/ogg': OggOutputFormat,
  'audio/flac': FlacOutputFormat, 'audio/wav': WavOutputFormat,
  'video/mp4': Mp4OutputFormat, 'video/quicktime': MovOutputFormat,
  'video/webm': WebMOutputFormat, 'video/x-matroska': MkvOutputFormat,
  'video/mp2t': MpegTsOutputFormat,
};

export async function removeMediaMetadata(file, signal, onProgress = () => {}) {
  const Format = formats[file.type];
  if (!Format) throw new Error(t('metadataRemovalFailed'));
  signal.throwIfAborted();
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  let conversion;
  try {
    if (!(await input.canRead())) throw new Error(t('mediaReadError'));
    const inputTracks = [...await input.getVideoTracks(), ...await input.getAudioTracks()];
    if (!inputTracks.length) throw new Error(t('mediaReadError'));
    const sink = createSeekableBlob(1024 ** 3);
    const output = new Output({ format: new Format(), target: new StreamTarget(sink.writable, { chunked: true }) });
    conversion = await Conversion.init({ input, output, tracks: 'all', copy: { mode: 'forced' }, tags: {}, showWarnings: false });
    if (!conversion.isValid || conversion.discardedTracks.length || conversion.utilizedTracks.length !== inputTracks.length) throw new Error(t('mediaCopyUnavailable'));
    conversion.onProgress = (progress) => onProgress('mediaProgress', { percent: Math.round(progress * 100) });
    const abort = () => conversion.cancel().catch(() => {});
    signal.addEventListener('abort', abort, { once: true });
    try {
      await conversion.execute();
      signal.throwIfAborted();
      const blob = sink.blob(file.type);
      const check = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
      try {
        if (!(await check.canRead()) || (await check.getAudioTracks()).length + (await check.getVideoTracks()).length !== inputTracks.length || Object.keys(await check.getMetadataTags()).length) throw new Error(t('metadataRemovalFailed'));
      } finally { check.dispose(); }
      return blob;
    } finally { signal.removeEventListener('abort', abort); }
  } catch (error) {
    signal.throwIfAborted();
    if (error.message === t('mediaCopyUnavailable')) throw error;
    throw new Error(t('metadataRemovalFailed'), { cause: error });
  } finally { input.dispose(); }
}
