import { build } from 'esbuild';
import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

await rm('vendor/generated', { recursive: true, force: true });
await mkdir('vendor/generated', { recursive: true });

await build({
  entryPoints: ['scripts/media-vendor.js', 'scripts/gif-vendor.js', 'scripts/tiff-vendor.js'],
  outdir: 'vendor/generated',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: false,
  sourcemap: false,
  legalComments: 'external',
});

const utifRequire = createRequire(import.meta.resolve('utif'));
const pakoRoot = dirname(utifRequire.resolve('pako/package.json'));
const pdfjsDirectories = ['cmaps', 'iccs', 'standard_fonts'];
const pdfjsWasmFiles = [
  'LICENSE_JBIG2',
  'LICENSE_OPENJPEG',
  'LICENSE_PDFJS_JBIG2',
  'LICENSE_PDFJS_OPENJPEG',
  'LICENSE_PDFJS_QCMS',
  'LICENSE_QCMS',
  'jbig2.wasm',
  'jbig2_nowasm_fallback.js',
  'openjpeg.wasm',
  'openjpeg_nowasm_fallback.js',
  'qcms_bg.wasm',
];

await Promise.all([
  mkdir('vendor/pdf-lib', { recursive: true }),
  mkdir('vendor/pdfjs', { recursive: true }),
  rm('vendor/pdfjs/wasm', { recursive: true, force: true }),
]);
await Promise.all(pdfjsDirectories.map((name) => rm(`vendor/pdfjs/${name}`, { recursive: true, force: true })));
await mkdir('vendor/pdfjs/wasm', { recursive: true });

const generatedLicenses = [
  ['mediabunny', 'MEDIABUNNY-LICENSE'],
  ['@mediabunny/mp3-encoder', 'MP3-ENCODER-LICENSE'],
  ['gifuct-js', 'GIFUCT-LICENSE'],
  ['utif', 'UTIF-LICENSE'],
].map(([name, filename]) => copyFile(`node_modules/${name}/LICENSE`, `vendor/generated/${filename}`));

await Promise.all([
  copyFile('node_modules/pdf-lib/dist/pdf-lib.js', 'vendor/pdf-lib/pdf-lib.js'),
  copyFile('node_modules/pdf-lib/LICENSE.md', 'vendor/pdf-lib/LICENSE.md'),
  copyFile('node_modules/pdfjs-dist/build/pdf.mjs', 'vendor/pdfjs/pdf.mjs'),
  copyFile('node_modules/pdfjs-dist/build/pdf.worker.mjs', 'vendor/pdfjs/pdf.worker.mjs'),
  copyFile('node_modules/pdfjs-dist/LICENSE', 'vendor/pdfjs/LICENSE'),
  ...generatedLicenses,
  copyFile('node_modules/@mediabunny/mp3-encoder/README.md', 'vendor/generated/MP3-ENCODER-README.md'),
  copyFile('node_modules/@mediabunny/mp3-encoder/licenses/lame/LICENSE', 'vendor/generated/LAME-LICENSE'),
  copyFile('node_modules/@mediabunny/mp3-encoder/licenses/lame/COPYING', 'vendor/generated/LAME-COPYING'),
  copyFile('node_modules/gifenc/LICENSE.md', 'vendor/generated/GIFENC-LICENSE'),
  copyFile(join(pakoRoot, 'LICENSE'), 'vendor/generated/PAKO-LICENSE'),
  copyFile(join(pakoRoot, 'lib/zlib/README'), 'vendor/generated/PAKO-ZLIB-NOTICE'),
  ...pdfjsWasmFiles.map((name) => copyFile(`node_modules/pdfjs-dist/wasm/${name}`, `vendor/pdfjs/wasm/${name}`)),
  ...pdfjsDirectories.map((name) => cp(`node_modules/pdfjs-dist/${name}`, `vendor/pdfjs/${name}`, { recursive: true })),
]);
