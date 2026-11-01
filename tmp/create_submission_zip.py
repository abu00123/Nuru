from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import subprocess

root = Path.cwd()
destination = root / 'Nuru-final-submission.zip'
tracked = subprocess.check_output(['git', 'ls-files', '-z']).decode().split('\0')
skip_parts = {'node_modules', 'venv', '.venv', 'dist', '__pycache__', '.git', 'tmp'}
skip_exact = {'nuru-mobile.zip'}
files = []
for name in tracked:
    if not name:
        continue
    path = Path(name)
    if name in skip_exact or any(part in skip_parts for part in path.parts):
        continue
    if path.name == '.env':
        continue
    full = root / path
    if full.is_file():
        files.append((full, Path('Nuru') / path))

# Include the current working versions of the assignment-facing materials.
for name in ('README.md', 'docs/technical-report.pdf'):
    path = root / name
    files = [(f, z) for f, z in files if z != Path('Nuru') / name]
    if path.is_file():
        files.append((path, Path('Nuru') / name))

with ZipFile(destination, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for full, inside in files:
        archive.write(full, inside.as_posix())

print(f'{destination} | {len(files)} files | {destination.stat().st_size:,} bytes')
