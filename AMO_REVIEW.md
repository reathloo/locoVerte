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

## Version 0.2.9 review correction

Version 0.2.9 addresses the rejection of version 0.2.8 under review reference `01a18de6-de48-7b61-81c4-f787b4c69901`. No obfuscator is used. The previous esbuild output was minified, which made the bundled third-party code difficult to review. This version disables esbuild minification and replaces the minified pdf-lib browser build with its official unminified build. The extension's behavior is otherwise unchanged.

`pnpm run build:vendor` performs all production steps that generate or copy third-party runtime code:

- esbuild bundles the media, GIF, and TIFF entry points without minification from the exact dependencies in `pnpm-lock.yaml`;
- the unminified pdf-lib 1.17.1 browser build is copied unmodified from its npm release;
- PDF.js 5.6.205 and its runtime resources are copied unmodified from the `pdfjs-dist` npm release;
- the applicable third-party license files are copied into the extension.

The extension contains no remotely hosted executable code. Conversion libraries and PDF resources are bundled and run locally.

## Third-party source releases

- Mediabunny 1.61.0: https://www.npmjs.com/package/mediabunny/v/1.61.0
- Mediabunny MP3 encoder 1.61.0: https://www.npmjs.com/package/@mediabunny/mp3-encoder/v/1.61.0
- pdf-lib 1.17.1: https://www.npmjs.com/package/pdf-lib/v/1.17.1
- PDF.js 5.6.205: https://www.npmjs.com/package/pdfjs-dist/v/5.6.205
- gifenc 1.0.3: https://www.npmjs.com/package/gifenc/v/1.0.3
- gifuct-js 2.1.2: https://www.npmjs.com/package/gifuct-js/v/2.1.2
- UTIF 3.1.0: https://www.npmjs.com/package/utif/v/3.1.0

All packages are fetched from the public npm registry through pnpm using the submitted lockfile. No private registry or unpublished dependency is used.

`@mediabunny/mp3-encoder` includes the official LAME WebAssembly payload published in that npm release. It is not downloaded or generated at runtime. The package also provides its readable TypeScript and C bridge sources through the same public npm release.

## Permissions and data

The `activeTab` and `scripting` permissions are used only when the user explicitly asks locoVerte to insert a processed file into a file input on the page from which the extension was opened. The extension has no backend, analytics, telemetry, account system, or file upload service. See `PRIVACY.md` for the complete English and German privacy policy.

## Known validator warnings

The packaged extension currently produces five warnings in Mozilla's linter. They refer to `Function` construction and dynamic imports in the unmodified PDF.js 5.6.205 release files. The package passes with zero errors.
