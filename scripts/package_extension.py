#!/usr/bin/env python3
"""Build a small, deterministic store ZIP from tracked extension files."""

import argparse
import json
import subprocess
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
ROOT_FILES = {"LICENSE", "THIRD_PARTY_NOTICES.md", "manifest.json", "index.html", "launcher.html", "styles.css"}
DIRECTORIES = ("_locales/", "src/", "vendor/", "assets/icons/")
REQUIRED_BUNDLES = {
    "src/media-conversion.js",
    "src/zip.js",
    "src/upload-field.js",
    "src/file-drop.js",
    "src/pdf-pages.js",
    "src/clipboard-image.js",
    "src/limits.js",
    "src/seekable-blob.js",
    "src/metadata.js",
    "src/privacy-inspection.js",
    "src/redaction.js",
    "src/office-cleanup.js",
    "src/media-metadata.js",
    "src/file-validation.js",
    "src/pdfjs-loader.js",
    "vendor/generated/media-vendor.js",
    "vendor/generated/gif-vendor.js",
    "vendor/generated/tiff-vendor.js",
    "vendor/generated/media-vendor.js.LEGAL.txt",
    "vendor/generated/MEDIABUNNY-LICENSE",
    "vendor/generated/MP3-ENCODER-LICENSE",
    "vendor/generated/GIFENC-LICENSE",
    "vendor/generated/GIFUCT-LICENSE",
    "vendor/generated/UTIF-LICENSE",
    "vendor/generated/PAKO-LICENSE",
    "vendor/generated/PAKO-ZLIB-NOTICE",
}
TIMESTAMP = (1980, 1, 1, 0, 0, 0)


def package_paths():
    try:
        tracked = subprocess.check_output(
            ["git", "ls-files", "-z"], cwd=ROOT, stderr=subprocess.DEVNULL
        ).split(b"\0")
        candidates = (Path(raw.decode()).as_posix() for raw in tracked if raw)
    except (FileNotFoundError, subprocess.CalledProcessError):
        candidates = (
            path.relative_to(ROOT).as_posix()
            for path in ROOT.rglob("*")
            if path.is_file()
        )
    paths = sorted(set(
        name for name in candidates
        if name in ROOT_FILES or name.startswith(DIRECTORIES)
    ) | REQUIRED_BUNDLES)
    missing = ROOT_FILES - set(paths)
    if missing:
        raise SystemExit(f"Missing required files: {', '.join(sorted(missing))}")
    for name in paths:
        path = ROOT / name
        if path.is_symlink() or not path.is_file():
            raise SystemExit(f"Not a regular extension file: {name}")
    return paths


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, help="ZIP path (default: dist/locoverte-VERSION.zip)")
    args = parser.parse_args()
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    output = args.output or ROOT / "dist" / f"locoverte-{version}.zip"
    output.parent.mkdir(parents=True, exist_ok=True)
    paths = package_paths()
    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name in paths:
            info = ZipInfo(name, TIMESTAMP)
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, (ROOT / name).read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)
    print(f"{output}: {len(paths)} files, version {version}")


if __name__ == "__main__":
    main()
