import { build } from 'esbuild';
import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

await build({
  entryPoints: ['scripts/media-vendor.js', 'scripts/gif-vendor.js', 'scripts/tiff-vendor.js'],
  outdir: 'vendor/generated',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  sourcemap: false,
  legalComments: 'external',
});

const utifRequire = createRequire(import.meta.resolve('utif'));
const pakoRoot = dirname(utifRequire.resolve('pako/package.json'));
const pdfjsDirectories = ['cmaps', 'iccs', 'standard_fonts', 'wasm'];

await Promise.all([
  mkdir('vendor/pdf-lib', { recursive: true }),
  mkdir('vendor/pdfjs', { recursive: true }),
]);
await Promise.all(pdfjsDirectories.map((name) => rm(`vendor/pdfjs/${name}`, { recursive: true, force: true })));

const generatedLicenses = [
  ['mediabunny', 'MEDIABUNNY-LICENSE'],
  ['@mediabunny/mp3-encoder', 'MP3-ENCODER-LICENSE'],
  ['gifuct-js', 'GIFUCT-LICENSE'],
  ['utif', 'UTIF-LICENSE'],
].map(([name, filename]) => copyFile(`node_modules/${name}/LICENSE`, `vendor/generated/${filename}`));

await Promise.all([
  copyFile('node_modules/pdf-lib/dist/pdf-lib.min.js', 'vendor/pdf-lib/pdf-lib.min.js'),
  copyFile('node_modules/pdf-lib/LICENSE.md', 'vendor/pdf-lib/LICENSE.md'),
  copyFile('node_modules/pdfjs-dist/build/pdf.mjs', 'vendor/pdfjs/pdf.mjs'),
  copyFile('node_modules/pdfjs-dist/build/pdf.worker.mjs', 'vendor/pdfjs/pdf.worker.mjs'),
  copyFile('node_modules/pdfjs-dist/LICENSE', 'vendor/pdfjs/LICENSE'),
  ...generatedLicenses,
  copyFile('node_modules/gifenc/LICENSE.md', 'vendor/generated/GIFENC-LICENSE'),
  copyFile(join(pakoRoot, 'LICENSE'), 'vendor/generated/PAKO-LICENSE'),
  copyFile(join(pakoRoot, 'lib/zlib/README'), 'vendor/generated/PAKO-ZLIB-NOTICE'),
  ...pdfjsDirectories.map((name) => cp(`node_modules/pdfjs-dist/${name}`, `vendor/pdfjs/${name}`, { recursive: true })),
]);
