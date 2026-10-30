import subprocess
import sys
import tempfile
import unittest
import json
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
PACKAGER = ROOT / "scripts" / "package_extension.py"
SOURCE_PACKAGER = ROOT / "scripts" / "package_source.py"


class PackageTests(unittest.TestCase):
    def test_package_is_repeatable_and_excludes_development_files(self):
        with tempfile.TemporaryDirectory() as directory:
            first = Path(directory) / "first.zip"
            second = Path(directory) / "second.zip"
            for output in (first, second):
                subprocess.run([sys.executable, str(PACKAGER), "--output", str(output)], cwd=ROOT, check=True, capture_output=True)
            self.assertEqual(first.read_bytes(), second.read_bytes())
            with ZipFile(first) as archive:
                names = set(archive.namelist())
                self.assertEqual(archive.testzip(), None)
                self.assertIn("LICENSE", names)
                self.assertIn("THIRD_PARTY_NOTICES.md", names)
                self.assertIn("vendor/generated/PAKO-LICENSE", names)
                self.assertIn("vendor/generated/PAKO-ZLIB-NOTICE", names)
                self.assertIn("vendor/generated/GIFENC-LICENSE", names)
                self.assertIn("vendor/generated/GIFUCT-LICENSE", names)
                self.assertIn("manifest.json", names)
                self.assertIn("src/main.js", names)
                self.assertIn("assets/icons/icon-128.png", names)
                self.assertIn("vendor/pdfjs/pdf.worker.mjs", names)
                self.assertIn("vendor/pdf-lib/pdf-lib.js", names)
                self.assertNotIn("vendor/pdf-lib/pdf-lib.min.js", names)
                self.assertIn("vendor/generated/media-vendor.js", names)
                self.assertIn("vendor/generated/gif-vendor.js", names)
                self.assertIn("vendor/generated/tiff-vendor.js", names)
                self.assertIn("src/media-conversion.js", names)
                self.assertIn("src/zip.js", names)
                self.assertIn("src/upload-field.js", names)
                self.assertIn("src/file-drop.js", names)
                self.assertIn("src/pdf-pages.js", names)
                self.assertIn("src/clipboard-image.js", names)
                self.assertIn("src/limits.js", names)
                self.assertIn("src/seekable-blob.js", names)
                self.assertIn("src/metadata.js", names)
                self.assertIn("src/privacy-inspection.js", names)
                self.assertIn("src/redaction.js", names)
                self.assertIn("src/office-cleanup.js", names)
                self.assertIn("src/media-metadata.js", names)
                self.assertIn("src/file-validation.js", names)
                self.assertIn("src/pdfjs-loader.js", names)
                self.assertIn("src/launcher-position.js", names)
                self.assertFalse(any(name.startswith(("tests/", "assets/icon-concepts/", "dist/")) for name in names))
                index = archive.read("index.html").decode("utf-8")
                self.assertIn('.mp4,video/mp4', index)
                self.assertIn('.mov,video/quicktime', index)
                self.assertIn('.webm,video/webm', index)
                self.assertIn('.m4a,audio/mp4', index)
                self.assertIn('.aac,audio/aac', index)
                self.assertIn('.mkv,video/x-matroska', index)
                self.assertIn('.ts,video/mp2t', index)
                main = archive.read("src/main.js").decode("utf-8")
                self.assertIn("['image/gif', 'GIF']", main)
                self.assertIn("['audio/mpeg', 'MP3']", main)
                self.assertIn("['video/x-matroska', 'MKV']", main)
                self.assertEqual(archive.read("manifest.json"), (ROOT / "manifest.json").read_bytes())
                self.assertEqual(archive.read("LICENSE"), (ROOT / "LICENSE").read_bytes())
                self.assertEqual(archive.read("THIRD_PARTY_NOTICES.md"), (ROOT / "THIRD_PARTY_NOTICES.md").read_bytes())
                manifest = json.loads(archive.read("manifest.json"))
                self.assertEqual(manifest["browser_specific_settings"]["gecko"]["data_collection_permissions"]["required"], ["none"])
                self.assertEqual(manifest["browser_specific_settings"]["gecko"]["id"], "locoverte@jmakau.de")
                self.assertEqual(manifest["permissions"], ["activeTab", "scripting"])
                self.assertEqual(manifest["version"], "0.2.9")

    def test_amo_source_package_is_repeatable_and_excludes_built_vendor_files(self):
        with tempfile.TemporaryDirectory() as directory:
            first = Path(directory) / "first-source.zip"
            second = Path(directory) / "second-source.zip"
            for output in (first, second):
                subprocess.run([sys.executable, str(SOURCE_PACKAGER), "--output", str(output)], cwd=ROOT, check=True, capture_output=True)
            self.assertEqual(first.read_bytes(), second.read_bytes())
            with ZipFile(first) as archive:
                names = set(archive.namelist())
                self.assertEqual(archive.testzip(), None)
                self.assertIn("AMO_REVIEW.md", names)
                self.assertIn("PROJECT_README.md", names)
                self.assertIn("package.json", names)
                self.assertIn("pnpm-lock.yaml", names)
                self.assertIn("scripts/build-vendor.mjs", names)
                self.assertIn("scripts/package_extension.py", names)
                self.assertIn("src/main.js", names)
                self.assertIn("tests/test_package.py", names)
                self.assertEqual(archive.read("README.md"), (ROOT / "AMO_REVIEW.md").read_bytes())
                self.assertFalse(any(name.startswith(("assets/icon-concepts/", "vendor/", "dist/", "node_modules/")) for name in names))


if __name__ == "__main__":
    unittest.main()
