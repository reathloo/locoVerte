# Third-party notices

The original locoVerte code is licensed under GPL-3.0-only; see [LICENSE](LICENSE). This does not replace the licenses of bundled third-party components. Their notices are included in the extension ZIP and remain applicable to those components.

| Component | License | Included notice | Source |
| --- | --- | --- | --- |
| PDF.js and bundled PDF resources | Apache-2.0 and resource-specific licenses | `vendor/pdfjs/LICENSE` and license files below `vendor/pdfjs/` | [mozilla/pdf.js](https://github.com/mozilla/pdf.js) |
| pdf-lib | MIT | `vendor/pdf-lib/LICENSE.md` | [Hopding/pdf-lib](https://github.com/Hopding/pdf-lib) |
| Mediabunny | MPL-2.0 | `vendor/generated/MEDIABUNNY-LICENSE` | [Vanilagy/mediabunny](https://github.com/Vanilagy/mediabunny) |
| @mediabunny/mp3-encoder | MPL-2.0 | `vendor/generated/MP3-ENCODER-LICENSE` | [Vanilagy/mediabunny](https://github.com/Vanilagy/mediabunny) |
| gifenc | MIT | `vendor/generated/GIFENC-LICENSE` | [mattdesl/gifenc](https://github.com/mattdesl/gifenc) |
| gifuct-js | MIT | `vendor/generated/GIFUCT-LICENSE` | [matt-way/gifuct-js](https://github.com/matt-way/gifuct-js) |
| UTIF.js | MIT | `vendor/generated/UTIF-LICENSE` | [photopea/UTIF.js](https://github.com/photopea/UTIF.js) |
| pako (used by UTIF.js) | MIT and zlib | `vendor/generated/PAKO-LICENSE`, `vendor/generated/PAKO-ZLIB-NOTICE` | [nodeca/pako](https://github.com/nodeca/pako) |

The generated media bundle includes `vendor/generated/media-vendor.js.LEGAL.txt` with build-time notices. The build script copies the applicable license texts for the media, GIF, and TIFF bundles from installed packages into `vendor/generated/`.
