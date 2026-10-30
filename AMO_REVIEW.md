# AMO reviewer notes

This document describes how to reproduce the submitted locoVerte extension package from its source archive.

## Requirements

- Node.js 22
- pnpm 11
- Python 3.12
- Network access during `pnpm install` only

## Build

Run these commands from the extracted source archive:

```bash
pnpm install --frozen-lockfile
pnpm run build:vendor
python3 -m unittest discover -s tests -p 'test_*.py'
pnpm run test:local
python3 scripts/package_extension.py
```

The resulting extension is `dist/locoverte-VERSION.zip`.

`pnpm run build:vendor` performs all production steps that generate or copy third-party runtime code:

- esbuild bundles and minifies the media, GIF, and TIFF entry points from the exact dependencies in `pnpm-lock.yaml`;
- pdf-lib 1.17.1 is copied unmodified from its npm release;
- PDF.js 5.6.205 and its runtime resources are copied unmodified from the `pdfjs-dist` npm release;
- the applicable third-party license files are copied into the extension.

The extension contains no remotely hosted executable code. Conversion libraries and PDF resources are bundled and run locally.

## Permissions and data

The `activeTab` and `scripting` permissions are used only when the user explicitly asks locoVerte to insert a processed file into a file input on the page from which the extension was opened. The extension has no backend, analytics, telemetry, account system, or file upload service. See `PRIVACY.md` for the complete English and German privacy policy.

## Known validator warnings

The packaged extension currently produces five warnings in Mozilla's linter. They refer to `Function` construction and dynamic imports in the unmodified PDF.js 5.6.205 release files. The package passes with zero errors.
