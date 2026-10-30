#!/usr/bin/env python3
"""Build a deterministic AMO source archive from project files."""

import argparse
import json
import subprocess
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_PREFIXES = ("assets/icon-concepts/", "vendor/")
TIMESTAMP = (1980, 1, 1, 0, 0, 0)


def source_paths():
    project_files = subprocess.check_output(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"], cwd=ROOT
    ).split(b"\0")
    paths = sorted(
        Path(raw.decode()).as_posix()
        for raw in project_files
        if raw and not raw.decode().startswith(EXCLUDED_PREFIXES)
    )
    for name in paths:
        path = ROOT / name
        if path.is_symlink() or not path.is_file():
            raise SystemExit(f"Not a regular source file: {name}")
    return paths


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, help="ZIP path (default: dist/locoverte-VERSION-source.zip)")
    args = parser.parse_args()
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    output = args.output or ROOT / "dist" / f"locoverte-{version}-source.zip"
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name in source_paths():
            info = ZipInfo(name, TIMESTAMP)
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, (ROOT / name).read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)
    print(f"{output}: source for version {version}")


if __name__ == "__main__":
    main()
