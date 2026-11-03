# AMO reviewer notes

This document describes how to reproduce the submitted locoVerte extension package from its source archive.

## Requirements

- Node.js 22 or newer (tested with Node.js 22 and 24)
- pnpm 11.19.0
- Python 3.12 or newer
- Network access during `pnpm install` only

## Build

Run these commands from the extracted source archive:

```bash
npm install --global pnpm@11.19.0
pnpm install --frozen-lockfile
pnpm run build:vendor
python3 -m unittest discover -s tests -p 'test_*.py'
pnpm run test:local
python3 scripts/package_extension.py
```

The resulting extension is `dist/locoverte-VERSION.zip`.

## Version 0.2.10 review correction

Version 0.2.10 addresses the obfuscated-code rejections of versions 0.2.8 and 0.2.9 under review references `01a18de6-de48-7b61-81c4-f787b4c69901` and `01a18df9-9714-7291-b87c-3ddca7c260a2`. No obfuscator is used. The previous esbuild output was minified, which made bundled third-party code difficult to review. The build now creates readable, unminified bundles and copies the official unminified pdf-lib browser build. No conversion format or user-facing feature was removed.

`pnpm run build:vendor` performs all production steps that generate or copy third-party runtime code:

- esbuild bundles the media, GIF, and TIFF entry points without minification from the exact dependencies in `pnpm-lock.yaml`;
- the unminified pdf-lib 1.17.1 browser build is copied unmodified from its npm release;
- PDF.js 6.5.438, its worker, and only the rendering resources used by locoVerte are copied unmodified from the `pdfjs-dist` npm release;
- the applicable third-party license files are copied into the extension.

PDF.js scripting is explicitly disabled at every document-loading entry point (`enableScripting: false` and `isEvalSupported: false`). Therefore the unused PDF.js QuickJS scripting payload is not included. A small readable compatibility helper implements the standardized `Uint8Array.prototype.toHex` method for Firefox versions older than 133 before the official PDF.js modules load. PDF rendering, page tools, conversion, redaction, fonts, color profiles, and image codecs remain available.

The extension contains no remotely hosted executable code. Conversion libraries and PDF resources are bundled and run locally.

## Third-party source releases

- Mediabunny 1.65.0: https://www.npmjs.com/package/mediabunny/v/1.65.0
- Mediabunny MP3 encoder 1.65.0: https://www.npmjs.com/package/@mediabunny/mp3-encoder/v/1.65.0
- pdf-lib 1.17.1: https://www.npmjs.com/package/pdf-lib/v/1.17.1
- PDF.js 6.5.438: https://www.npmjs.com/package/pdfjs-dist/v/6.5.438
- gifenc 1.0.3: https://www.npmjs.com/package/gifenc/v/1.0.3
- gifuct-js 2.1.2: https://www.npmjs.com/package/gifuct-js/v/2.1.2
- UTIF 3.1.0: https://www.npmjs.com/package/utif/v/3.1.0

All packages are fetched from the public npm registry through pnpm using the submitted lockfile. No private registry or unpublished dependency is used.

`@mediabunny/mp3-encoder` includes the official LAME WebAssembly payload published in that npm release. It is not downloaded or generated at runtime. The submitted extension includes the package's provenance document as `vendor/generated/MP3-ENCODER-README.md` and the LAME license files. It identifies LAME 3.100 (`lame-3.100.tar.gz`, SHA-256 `ddfe36cab873794038ae2c1210557ad34857a4b6bdc515785d1da9e175b1da1e`), Emscripten 4.0.21 commit `d6f42310010ddec0753a69bab01a4b33aae255b7`, the package's readable `src/lame-bridge.c`, and the inlined WebAssembly SHA-256 `a680e507e9d91f1a4dcd6f846b9b94ff1fec7e19ff44e803358c218ddbe446a6`.

## Permissions and data

The `activeTab` and `scripting` permissions are used only when the user explicitly asks locoVerte to insert a processed file into a file input on the page from which the extension was opened. The extension has no backend, analytics, telemetry, account system, or file upload service. See `PRIVACY.md` for the complete English and German privacy policy.

## Validator result

`web-ext lint` 10.7.0 reports zero errors and two warnings for the packaged extension. Both are dynamic-import warnings in the official PDF.js 6.5.438 files (`vendor/pdfjs/pdf.mjs` and `vendor/pdfjs/pdf.worker.mjs`). PDF.js is loaded only from the packaged extension; the extension CSP permits scripts and connections only from `self`. The submitted source and CI workflow perform this check against the packaged files rather than the development tree.
