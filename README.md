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

The optional **Remove metadata** setting is under **Adjust**. Same-format Office copies remove document properties while keeping DOCX, XLSX or PPTX. DOCX offers separate controls to remove comments or accept tracked changes. Same-format audio and video use packet copying when the container supports it, so streams are not re-encoded; unsupported copies fail. Other image conversions may re-encode, animated GIF playback is preserved, and PDFs are rebuilt as image-only pages for reliable removal. This PDF mode removes searchable text, links, forms and signatures.

Expand **Adjust** to inspect locally detected EXIF/GPS, PNG text, PDF document properties, GIF comments/XMP, Office properties or media tags. Findings appear directly below the metadata checkbox. A missing finding does not prove that a file contains no other embedded private data.

When several files are selected, each file has its own expandable **Adjust** section. Metadata removal, image dimensions, rotation, target size, and output name apply to that file only.

**Redact areas locally** opens an image/PDF editor. Draw rectangles, apply a region across PDF pages, remove header/footer bands, or crop page edges. The export is rebuilt from rendered pixels so original PDF text and objects are absent. PDF search, links, forms and signatures are lost; animated images become a still JPEG. Review the output visually before sharing.

**Edit PDF pages** can check for possibly blank pages and mark them for review. A separate action removes the marked pages from the new copy; at least one page is kept. The same editor can add page numbers, add a text watermark, and fit mixed page sizes onto A4 or US Letter pages without cropping. The original PDF stays unchanged. Signed or interactive PDFs are blocked from page editing.

## Install the stable release

Download `locoverte-0.2.6.zip` from **[Releases](https://github.com/reathloo/locoVerte/releases/latest)** and unzip it.

- **Chrome:** Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the unzipped folder containing `manifest.json`.
- **Edge:** Follow the same steps at `edge://extensions`.
- **Firefox:** Open `about:debugging` → **This Firefox** → **Load Temporary Add-on**, then select `manifest.json` from the unzipped folder. You must load it again after restarting Firefox. Permanent installation requires a Mozilla-signed XPI.

Click the locoVerte icon in your browser toolbar to open it. Manually installed GitHub releases **do not update automatically**; download and install newer versions yourself.

**Privacy:** Files stay on your device during processing. If you explicitly choose **Use in upload field**, the open website may then upload the result. See [PRIVACY.md](PRIVACY.md).

This stable GitHub release is distributed as an unpacked browser extension. It has not been published in browser stores. Supported formats and codecs vary by browser; image-based PDFs and simplified Office exports may lose searchable text or layout. Store preparation and validation details: [RELEASE.md](RELEASE.md).

## License

Original locoVerte code is licensed under [GPL-3.0-only](LICENSE). Commercial use is allowed under its terms; distributing modified versions carries source-code obligations. Bundled libraries retain their own licenses—see [third-party notices](THIRD_PARTY_NOTICES.md).
