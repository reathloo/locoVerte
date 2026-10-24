import { build } from 'esbuild';
import { copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

await build({
  entryPoints: ['scripts/media-vendor.js', 'scripts/tiff-vendor.js'],
  outdir: 'vendor/generated',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  sourcemap: false,
  legalComments: 'external',
});

const utifRequire = createRequire(import.meta.resolve('utif'));
const pakoRoot = dirname(utifRequire.resolve('pako/package.json'));

await Promise.all([
  ['mediabunny', 'MEDIABUNNY-LICENSE'],
  ['@mediabunny/mp3-encoder', 'MP3-ENCODER-LICENSE'],
  ['gifuct-js', 'GIFUCT-LICENSE'],
  ['utif', 'UTIF-LICENSE'],
].map(([name, filename]) => copyFile(`node_modules/${name}/LICENSE`, `vendor/generated/${filename}`)).concat([
  copyFile('node_modules/gifenc/LICENSE.md', 'vendor/generated/GIFENC-LICENSE'),
  copyFile(join(pakoRoot, 'LICENSE'), 'vendor/generated/PAKO-LICENSE'),
  copyFile(join(pakoRoot, 'lib/zlib/README'), 'vendor/generated/PAKO-ZLIB-NOTICE'),
]));
