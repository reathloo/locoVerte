import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GIFEncoder, quantize, applyPalette, parseGIF, decompressFrames } from '../vendor/generated/gif-vendor.js';
import { validateFile } from '../src/file-validation.js';

test('separate GIF bundle still encodes and decodes a frame', () => {
  const pixels = new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255]);
  const palette = quantize(pixels, 256);
  const gif = GIFEncoder();
  gif.writeFrame(applyPalette(pixels, palette), 2, 1, { palette });
  gif.finish();
  const parsed = parseGIF(gif.bytes().buffer);
  const frames = decompressFrames(parsed, true);
  assert.equal(frames.length, 1);
  assert.equal(frames[0].dims.width, 2);
});

test('lightweight file validation recognizes image and media signatures', async () => {
  const png = await validateFile(new File([Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])], 'photo', { type: '' }));
  assert.equal(png.type, 'image/png');
  const mp4 = await validateFile(new File([Uint8Array.from([0, 0, 0, 20, 102, 116, 121, 112, 109, 112, 52, 50])], 'movie.mp4', { type: '' }));
  assert.equal(mp4.type, 'video/mp4');
});
