<div align="center">
  <img src="assets/icons/icon-128.png" width="96" height="96" alt="locoVerte icon">
  <h1>locoVerte</h1>
  <p>Convert, compress, and clean files locally in your browser.</p>
</div>

locoVerte is an offline-first browser extension for images, PDFs, Office documents, audio, and video. Your files stay on your device—no account, server, or upload is required.

## Highlights

- Convert multiple files with individual settings.
- Compress images and PDFs.
- Inspect and remove common metadata.
- Redact image and PDF areas locally.
- Reorder, remove, number, watermark, or resize PDF pages.
- Insert a processed file into a website upload field when requested.

## Supported formats

| Input | Output |
| --- | --- |
| JPEG, PNG, WebP, AVIF, BMP, GIF, TIFF, HEIC | JPEG, PNG, WebP, GIF, AVIF, PDF |
| PDF | Optimized PDF, text, or page images |
| DOCX, XLSX, PPTX | Simplified PDF, text, or CSV |
| MP3, M4A, AAC, OGG, FLAC, WAV | Common audio formats |
| MP4, MOV, WebM, MKV, MPEG-TS | Video, animated GIF, frame, or audio |

> [!NOTE]
> Available media formats depend on your browser's codec support. PDF and Office conversions may simplify layout or remove searchable text, links, forms, and signatures.

## Install

1. Download the latest `locoverte-*.zip` from [GitHub Releases](https://github.com/reathloo/locoVerte/releases/latest).
2. Unzip the archive.
3. Load the folder containing `manifest.json` in your browser:
   - **Chrome:** `chrome://extensions` → enable **Developer mode** → **Load unpacked**
   - **Edge:** `edge://extensions` → enable **Developer mode** → **Load unpacked**
   - **Firefox:** `about:debugging` → **This Firefox** → **Load Temporary Add-on**
4. Open locoVerte from the browser toolbar.

> [!IMPORTANT]
> GitHub installations do not update automatically. Firefox also removes temporary add-ons after a restart.

## Privacy

All conversion happens on your device. locoVerte has no backend, analytics, or telemetry. Only the optional **Use in upload field** action passes the processed file to the website you opened it from.

See [PRIVACY.md](PRIVACY.md) for details.

## Development

Requirements: Node.js, pnpm, and Python 3.

```bash
pnpm install --frozen-lockfile
pnpm run build:vendor
pnpm run test:local
python3 -m unittest discover -s tests -p 'test_*.py'
python3 scripts/package_extension.py
```

For packaging and browser-store requirements, see [RELEASE.md](RELEASE.md). Third-party licenses are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
