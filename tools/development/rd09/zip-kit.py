from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib, json, sys

root = Path('work/rd09/kit/ROMDex-Agent-Authoring-Kit').resolve()
output = Path('outputs/RD09-Agent-Authoring-Kit.zip').resolve()
files = sorted(p for p in root.rglob('*') if p.is_file())
with ZipFile(output, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
    for file in files:
        archive.write(file, 'ROMDex-Agent-Authoring-Kit/' + file.relative_to(root).as_posix())
with ZipFile(output) as archive:
    assert archive.testzip() is None
    for info in archive.infolist():
        assert not info.filename.startswith('/') and '..' not in Path(info.filename).parts
    extracted = Path(sys.argv[1] if len(sys.argv) > 1 else 'work/rd09/extracted').resolve()
    assert not extracted.exists(), 'Use a new extraction folder; do not overwrite test evidence.'
    archive.extractall(extracted)
record = {'path': str(output), 'bytes': output.stat().st_size, 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'files': len(files), 'archiveIntegrity': 'passed', 'sourceBytes': sum(p.stat().st_size for p in files)}
Path('work/rd09/archive-evidence.json').write_text(json.dumps(record, indent=2) + '\n', encoding='utf-8')
print(json.dumps(record))
