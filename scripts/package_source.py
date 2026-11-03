#!/usr/bin/env python3
"""Build a deterministic AMO source archive from project files."""

import argparse
import json
import subprocess
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_PREFIXES = ("assets/icon-concepts/", "vendor/", "dist/", "node_modules/", ".git/")
TIMESTAMP = (1980, 1, 1, 0, 0, 0)


def source_paths():
    try:
        git_root = Path(subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"], cwd=ROOT, stderr=subprocess.DEVNULL, text=True
        ).strip()).resolve()
        if git_root != ROOT.resolve():
            raise RuntimeError("project root is not the active Git root")
        project_files = subprocess.check_output(
            ["git", "ls-files", "-z"], cwd=ROOT, stderr=subprocess.DEVNULL
        ).split(b"\0")
        candidates = (raw.decode() for raw in project_files if raw)
    except (FileNotFoundError, subprocess.CalledProcessError, RuntimeError):
        candidates = (
            path.relative_to(ROOT).as_posix()
            for path in ROOT.rglob("*")
            if path.is_file()
        )
    paths = sorted(
        Path(name).as_posix()
        for name in candidates
        if not name.startswith(EXCLUDED_PREFIXES)
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
            archive_name = "PROJECT_README.md" if name == "README.md" else name
            info = ZipInfo(archive_name, TIMESTAMP)
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, (ROOT / name).read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)
        info = ZipInfo("README.md", TIMESTAMP)
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, (ROOT / "AMO_REVIEW.md").read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)
    print(f"{output}: source for version {version}")


if __name__ == "__main__":
    main()
