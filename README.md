# locoVerte

Convert and compress images, PDFs, Office documents, audio, and video right in your browser (subject to browser codec support). Files are processed locally, even offline; no upload is needed for conversion.

## Supported conversions

| Input | Local output options |
| --- | --- |
| JPEG, PNG, WebP, AVIF, BMP, GIF, TIFF, HEIC | JPEG, PNG, WebP, GIF, AVIF where supported, PDF |
| Animated GIF | MP4, MOV, WebM, MKV, MPEG-TS |
| PDF | optimized PDF, selectable text, JPG/PNG/WebP page archive, AVIF where supported |
| MP3, M4A, AAC, OGG, FLAC, WAV | MP3, M4A, AAC, OGG, FLAC, WAV |
| MP4, MOV, WebM, MKV, MPEG-TS | MP4, MOV, WebM, MKV, MPEG-TS, animated GIF, JPG/PNG/WebP frame, or extracted audio |
| DOCX, XLSX, PPTX | simplified PDF and text/CSV exports |

Media options are shown only when the browser can encode the required codec. GIF and MP3 encoding are bundled; M4A/AAC and video codecs use local browser support. Converting GIF to another image format uses its first frame; converting it to a video preserves the animation.

## Install the stable release

Download `locoverte-0.2.4.zip` from **[Releases](https://github.com/reathloo/locoVerte/releases/latest)** and unzip it.

- **Chrome:** Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the unzipped folder containing `manifest.json`.
- **Edge:** Follow the same steps at `edge://extensions`.
- **Firefox:** Open `about:debugging` → **This Firefox** → **Load Temporary Add-on**, then select `manifest.json` from the unzipped folder. You must load it again after restarting Firefox. Permanent installation requires a Mozilla-signed XPI.

Click the locoVerte icon in your browser toolbar to open it. Manually installed GitHub releases **do not update automatically**; download and install newer versions yourself.

**Privacy:** Files stay on your device during processing. If you explicitly choose **Use in upload field**, the open website may then upload the result. See [PRIVACY.md](PRIVACY.md).

This stable GitHub release is distributed as an unpacked browser extension. It has not been published in browser stores. Supported formats and codecs vary by browser; image-based PDFs and simplified Office exports may lose searchable text or layout. Store preparation and validation details: [RELEASE.md](RELEASE.md).

## License

Original locoVerte code is licensed under [GPL-3.0-only](LICENSE). Commercial use is allowed under its terms; distributing modified versions carries source-code obligations. Bundled libraries retain their own licenses—see [third-party notices](THIRD_PARTY_NOTICES.md).
