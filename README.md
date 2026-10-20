# locoVerte

Convert and compress images, PDFs, Office documents, audio, and video right in your browser (subject to browser codec support). Files are processed locally, even offline; no upload is needed for conversion.

## Install the test version

Download `locoverte-0.2.3.zip` from **[Releases](https://github.com/reathloo/locoVerte/releases)** and unzip it.

- **Chrome:** Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the unzipped folder containing `manifest.json`.
- **Edge:** Follow the same steps at `edge://extensions`.
- **Firefox:** Open `about:debugging` → **This Firefox** → **Load Temporary Add-on**, then select `manifest.json` from the unzipped folder. You must load it again after restarting Firefox. Permanent installation requires a Mozilla-signed XPI, which this test release does not include.

Click the locoVerte icon in your browser toolbar to open it. GitHub test releases **do not update automatically**; download and install newer versions yourself.

**Privacy:** Files stay on your device during processing. If you explicitly choose **Use in upload field**, the open website may then upload the result. See [PRIVACY.md](PRIVACY.md).

This is a test release, not a browser-store version. Supported formats and codecs vary by browser; image-based PDFs and simplified Office exports may lose searchable text or layout. Development, testing, and future store steps: [RELEASE.md](RELEASE.md).

## License

Original locoVerte code is licensed under [GPL-3.0-only](LICENSE). Commercial use is allowed under its terms; distributing modified versions carries source-code obligations. Bundled libraries retain their own licenses—see [third-party notices](THIRD_PARTY_NOTICES.md).
