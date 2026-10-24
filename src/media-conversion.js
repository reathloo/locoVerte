import {
  ALL_FORMATS, BlobSource, StreamTarget, Conversion, Input, Output,
  Mp3OutputFormat, OggOutputFormat, FlacOutputFormat, WavOutputFormat,
  Mp4OutputFormat, MovOutputFormat, WebMOutputFormat, MkvOutputFormat, MpegTsOutputFormat,
  AdtsOutputFormat, Quality, canEncodeAudio, canEncodeVideo,
  registerMp3Encoder, CanvasSink, CanvasSource,
  GIFEncoder, quantize, applyPalette, parseGIF, decompressFrames,
} from '../vendor/generated/media-vendor.js';
import { t } from './i18n.js';
import { createSeekableBlob } from './seekable-blob.js';

const MAX_MEDIA_OUTPUT_SIZE = 1024 ** 3;

const profiles = [
  { audio: 192_000, video: 3_000_000, maxWidth: 1920 },
  { audio: 128_000, video: 1_500_000, maxWidth: 1280 },
  { audio: 64_000, video: 700_000, maxWidth: 854 },
];

const gifProfiles = [
  { fps: 12, maxWidth: 720, colors: 256 },
  { fps: 10, maxWidth: 600, colors: 128 },
  { fps: 8, maxWidth: 480, colors: 64 },
];

export async function mediaSupport(type) {
  if (['image/gif', 'image/jpeg', 'image/png', 'image/webp'].includes(type)) return true;
  if (type === 'audio/mpeg') {
    if (!(await canEncodeAudio('mp3'))) registerMp3Encoder();
    return canEncodeAudio('mp3');
  }
  if (['audio/mp4', 'audio/aac'].includes(type)) return canEncodeAudio('aac');
  if (type === 'audio/ogg') return canEncodeAudio('opus');
  if (type === 'audio/flac') return canEncodeAudio('flac');
  if (['video/mp4', 'video/quicktime', 'video/mp2t'].includes(type)) return await canEncodeVideo('avc') && await canEncodeAudio('aac');
  if (['video/webm', 'video/x-matroska'].includes(type)) return await canEncodeVideo('vp8') && await canEncodeAudio('opus');
  return type === 'audio/wav';
}

function outputFormatFor(type) {
  return {
    'audio/mpeg': Mp3OutputFormat,
    'audio/mp4': Mp4OutputFormat,
    'audio/aac': AdtsOutputFormat,
    'audio/ogg': OggOutputFormat,
    'audio/flac': FlacOutputFormat,
    'audio/wav': WavOutputFormat,
    'video/mp4': Mp4OutputFormat,
    'video/quicktime': MovOutputFormat,
    'video/webm': WebMOutputFormat,
    'video/x-matroska': MkvOutputFormat,
    'video/mp2t': MpegTsOutputFormat,
  }[type];
}

const videoCodecFor = (type) => ['video/webm', 'video/x-matroska'].includes(type) ? 'vp8' : 'avc';
const audioCodecFor = (type) => type === 'audio/mpeg' ? 'mp3' : type === 'audio/ogg' || ['video/webm', 'video/x-matroska'].includes(type) ? 'opus'
  : type === 'audio/flac' ? 'flac' : type === 'audio/wav' ? 'pcm-s16' : 'aac';

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (blob?.type === type) resolve(blob);
    else reject(new Error(t('imageEncodeError')));
  }, type, quality));
}

async function convertVideoFrame(input, outputType, strength, signal) {
  if (!(await input.canRead())) throw new Error(t('mediaReadError'));
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error(t('mediaReadError'));
  const level = strength <= 30 ? 0 : strength <= 65 ? 1 : 2;
  const sink = new CanvasSink(track, { width: Math.min(await track.getDisplayWidth(), profiles[level].maxWidth) });
  const frame = await sink.getCanvas(await track.getFirstTimestamp());
  signal.throwIfAborted();
  if (!frame) throw new Error(t('mediaReadError'));
  return canvasBlob(frame.canvas, outputType, [0.92, 0.8, 0.65][level]);
}

async function convertGifToVideo(file, outputType, strength, signal, onProgress) {
  const parsed = parseGIF(await file.arrayBuffer());
  const width = parsed.lsd.width;
  const height = parsed.lsd.height;
  const encodedFrames = parsed.frames.filter((frame) => frame.image);
  const decodedPixels = encodedFrames.reduce((sum, frame) => sum + frame.image.descriptor.width * frame.image.descriptor.height, 0);
  if (!encodedFrames.length || width * height > 20_000_000 || encodedFrames.length > 2_000 || decodedPixels > 100_000_000) throw new Error(t('mediaReadError'));
  const frames = decompressFrames(parsed, true);
  const level = strength <= 30 ? 0 : strength <= 65 ? 1 : 2;
  const profile = profiles[level];
  const scale = Math.min(1, profile.maxWidth / width);
  const composite = document.createElement('canvas');
  composite.width = width;
  composite.height = height;
  const compositeContext = composite.getContext('2d');
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = Math.max(1, Math.round(width * scale));
  outputCanvas.height = Math.max(1, Math.round(height * scale));
  const outputContext = outputCanvas.getContext('2d', { alpha: false });
  const patchCanvas = document.createElement('canvas');
  const patchContext = patchCanvas.getContext('2d');
  if (!compositeContext || !outputContext || !patchContext) throw new Error(t('canvasMemory'));
  const sink = createSeekableBlob(MAX_MEDIA_OUTPUT_SIZE);
  const outputFormat = outputFormatFor(outputType);
  const output = new Output({ format: new outputFormat(), target: new StreamTarget(sink.writable, { chunked: true }) });
  const source = new CanvasSource(outputCanvas, {
    codec: videoCodecFor(outputType),
    quality: new Quality({ bitrate: profile.video }),
  });
  output.addVideoTrack(source);
  const abort = () => { output.cancel().catch(() => {}); };
  signal.addEventListener('abort', abort, { once: true });
  let previous;
  let restore;
  let timestamp = 0;
  let finalized = false;
  const step = Math.max(1, Math.ceil(frames.length / 600));
  try {
    await output.start();
    for (let index = 0; index < frames.length; index += 1) {
      signal.throwIfAborted();
      if (previous?.disposalType === 2) compositeContext.clearRect(previous.dims.left, previous.dims.top, previous.dims.width, previous.dims.height);
      else if (previous?.disposalType === 3 && restore) compositeContext.putImageData(restore, 0, 0);
      const frame = frames[index];
      const nextRestore = frame.disposalType === 3 ? compositeContext.getImageData(0, 0, width, height) : null;
      patchCanvas.width = frame.dims.width;
      patchCanvas.height = frame.dims.height;
      patchContext.putImageData(new ImageData(frame.patch, frame.dims.width, frame.dims.height), 0, 0);
      compositeContext.drawImage(patchCanvas, frame.dims.left, frame.dims.top);
      if (index % step === 0) {
        const duration = frames.slice(index, Math.min(frames.length, index + step))
          .reduce((sum, item) => sum + Math.max(20, item.delay || 100), 0) / 1000;
        outputContext.fillStyle = '#000';
        outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
        outputContext.drawImage(composite, 0, 0, outputCanvas.width, outputCanvas.height);
        await source.add(timestamp, duration);
        timestamp += duration;
      }
      previous = frame;
      restore = nextRestore;
      onProgress('mediaProgress', { percent: Math.round((index + 1) / frames.length * 100) });
    }
    await output.finalize();
    finalized = true;
    return sink.blob(outputType);
  } finally {
    signal.removeEventListener('abort', abort);
    if (!finalized) await output.cancel().catch(() => {});
    composite.width = composite.height = outputCanvas.width = outputCanvas.height = patchCanvas.width = patchCanvas.height = 0;
  }
}

async function convertVideoToGif(input, strength, signal, onProgress) {
  if (!(await input.canRead())) throw new Error(t('mediaReadError'));
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error(t('mediaReadError'));
  const duration = await input.computeDuration();
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(t('mediaReadError'));
  const level = strength <= 30 ? 0 : strength <= 65 ? 1 : 2;
  const profile = gifProfiles[level];
  const sourceWidth = await track.getDisplayWidth();
  const width = Math.min(sourceWidth, profile.maxWidth);
  const frameCount = Math.max(1, Math.min(600, Math.ceil(duration * profile.fps)));
  const frameDuration = duration / frameCount;
  const timestamps = Array.from({ length: frameCount }, (_, index) => Math.min(duration - 0.001, index * frameDuration));
  const sink = new CanvasSink(track, { width, poolSize: 1 });
  const gif = GIFEncoder();
  let encoded = 0;
  for await (const frame of sink.canvasesAtTimestamps(timestamps)) {
    signal.throwIfAborted();
    if (!frame) continue;
    const context = frame.canvas.getContext('2d');
    const pixels = context.getImageData(0, 0, frame.canvas.width, frame.canvas.height).data;
    const palette = quantize(pixels, profile.colors);
    gif.writeFrame(applyPalette(pixels, palette), frame.canvas.width, frame.canvas.height, {
      palette, delay: Math.max(20, Math.round(frameDuration * 1000)), repeat: 0,
    });
    encoded += 1;
    if (gif.bytesView().byteLength > MAX_MEDIA_OUTPUT_SIZE) throw new RangeError('Media output exceeds the local size limit');
    onProgress('mediaProgress', { percent: Math.round(encoded / frameCount * 100) });
  }
  if (!encoded) throw new Error(t('mediaReadError'));
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}

export async function convertMedia(file, outputType, strength, signal, onProgress = () => {}) {
  signal.throwIfAborted();
  if (!(await mediaSupport(outputType))) throw new Error(t('mediaCodecUnavailable'));
  if (file.type === 'image/gif' && outputType.startsWith('video/')) {
    try { return await convertGifToVideo(file, outputType, strength, signal, onProgress); }
    catch (error) {
      signal.throwIfAborted();
      if (error instanceof RangeError && error.message === 'Media output exceeds the local size limit') throw new Error(t('mediaOutputTooLarge'));
      if (error instanceof Error && [t('mediaCodecUnavailable'), t('mediaReadError'), t('mediaOutputTooLarge')].includes(error.message)) throw error;
      throw new Error(t('mediaReadError'));
    }
  }
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  let conversion;
  try {
    if (outputType === 'image/gif') return await convertVideoToGif(input, strength, signal, onProgress);
    if (['image/jpeg', 'image/png', 'image/webp'].includes(outputType)) return await convertVideoFrame(input, outputType, strength, signal);
    if (!(await input.canRead())) throw new Error(t('mediaReadError'));
    const level = strength <= 30 ? 0 : strength <= 65 ? 1 : 2;
    const profile = profiles[level];
    const sink = createSeekableBlob(MAX_MEDIA_OUTPUT_SIZE);
    const target = new StreamTarget(sink.writable, { chunked: true });
    const outputFormat = outputFormatFor(outputType);
    if (!outputFormat) throw new Error(t('unsupported'));
    const output = new Output({ format: new outputFormat(), target });
    const audioCodec = audioCodecFor(outputType);
    const videoCodec = videoCodecFor(outputType);
    conversion = await Conversion.init({
      input, output, tracks: 'primary', copy: false, showWarnings: false,
      video: outputType.startsWith('video/') ? async (track) => ({
        codec: videoCodec,
        width: Math.min(profile.maxWidth, await track.getCodedWidth()),
        quality: new Quality({ bitrate: profile.video }),
      }) : { discard: true },
      audio: { codec: audioCodec, quality: new Quality({ bitrate: profile.audio }) },
    });
    if (!conversion.isValid || !conversion.utilizedTracks.length) {
      throw new Error(t('mediaCodecUnavailable'), { cause: conversion.discardedTracks.map(({ reason }) => reason).join(',') || 'invalid_conversion' });
    }
    conversion.onProgress = (progress) => onProgress('mediaProgress', { percent: Math.round(progress * 100) });
    const abort = () => { conversion.cancel().catch(() => {}); };
    signal.addEventListener('abort', abort, { once: true });
    try {
      await conversion.execute();
      signal.throwIfAborted();
      const blob = sink.blob(outputType);
      const check = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
      try {
        const tracks = outputType.startsWith('video/') ? await check.getVideoTracks() : await check.getAudioTracks();
        if (!tracks.length) throw new Error(t('mediaReadError'));
      } finally { check.dispose(); }
      signal.throwIfAborted();
      return blob;
    } finally { signal.removeEventListener('abort', abort); }
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof RangeError && error.message === 'Media output exceeds the local size limit') throw new Error(t('mediaOutputTooLarge'));
    if (error instanceof Error && [t('mediaCodecUnavailable'), t('mediaReadError'), t('mediaOutputTooLarge')].includes(error.message)) throw error;
    throw new Error(t('mediaReadError'));
  } finally { input.dispose(); }
}
