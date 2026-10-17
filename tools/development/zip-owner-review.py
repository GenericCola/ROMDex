"""Build and independently verify the explicitly requested owner-review ZIP."""
import hashlib
import json
import pathlib
import re
import zipfile
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

cwd = pathlib.Path.cwd()
build = json.loads((cwd / "work/owner-review-build.json").read_text(encoding="utf-8"))
stage = pathlib.Path(build["stage"]).resolve()
target = pathlib.Path(build["zip"]).resolve()
outputs = (cwd / "outputs").resolve()
assert stage.parent == outputs and target.parent == outputs
assert stage.name == "ROMDex-Review-0.5.7-2026-10-16"
assert not target.exists(), "Do not overwrite an existing review archive"
files = sorted(p for p in stage.rglob("*") if p.is_file())
assert all(not p.is_symlink() and p.resolve().is_relative_to(stage) for p in files)
assert len(files) == build["totalFiles"]


def digest_stream(stream):
    h = hashlib.sha256()
    while chunk := stream.read(1024 * 1024):
        h.update(chunk)
    return h.hexdigest()


def digest_file(file):
    with file.open("rb") as stream:
        return digest_stream(stream)


class Links(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []
        self.scripts = 0

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "script":
            self.scripts += 1
        for key, value in attrs:
            if key in ("href", "src") and value:
                self.refs.append(value)
            assert not key.lower().startswith("on"), "Active HTML handler refused"


for rel in ["START-HERE.html", "README.html", "FEATURES.html", "PROJECT-STATUS.html",
            "KNOWN-LIMITATIONS.html", "DEVELOPMENT-LOG.html", "DOCUMENT-INDEX.html"]:
    file = stage / rel
    parser = Links()
    parser.feed(file.read_text(encoding="utf-8"))
    assert parser.scripts == 0
    for ref in parser.refs:
        url = urlsplit(ref)
        if url.scheme or not url.path:
            continue
        resolved = (file.parent / unquote(url.path)).resolve()
        assert resolved.is_relative_to(stage) and resolved.is_file(), (rel, ref)

expected = {}
for line in (stage / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines():
    checksum, rel = line.split("  ", 1)
    assert re.fullmatch("[a-f0-9]{64}", checksum)
    assert rel not in expected
    expected[rel] = checksum
assert set(expected) == {p.relative_to(stage).as_posix() for p in files if p.name != "SHA256SUMS.txt"}
for file in files:
    rel = file.relative_to(stage).as_posix()
    assert not re.search(r"(^|/)(Data|Runtime|private-profile|session|node_modules|\.git|\.romdex|uploads)(/|$)|\.encrypted$", rel, re.I)
    if rel in expected:
        assert digest_file(file) == expected[rel], rel
assert expected["installer/ROMDex-0.5.7-x64.msi"] == build["installerSha256"]

with zipfile.ZipFile(target, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as archive:
    for file in files:
        archive.write(file, arcname=f"{stage.name}/{file.relative_to(stage).as_posix()}")

with zipfile.ZipFile(target) as archive:
    names = archive.namelist()
    assert len(names) == len(set(names)) == len(files)
    assert set(names) == {f"{stage.name}/{p.relative_to(stage).as_posix()}" for p in files}
    for file in files:
        rel = file.relative_to(stage).as_posix()
        name = f"{stage.name}/{rel}"
        info = archive.getinfo(name)
        assert info.file_size == file.stat().st_size
        # Reading to EOF validates ZIP CRC and independently verifies exact bytes.
        with archive.open(name) as member:
            assert digest_stream(member) == digest_file(file), rel

result = {
    "package": target.name,
    "version": "0.5.7",
    "status": "verified",
    "zipBytes": target.stat().st_size,
    "zipMiB": round(target.stat().st_size / (1024 * 1024), 2),
    "zipSha256": digest_file(target),
    "verifiedArchiveFiles": len(files),
    "markdownDocuments": build["markdownDocuments"],
    "htmlDocuments": build["htmlDocuments"],
    "installerSha256": build["installerSha256"],
    "releaseSignatureVerified": build["releaseSignatureVerified"],
    "windowsInstallerPublisherSigned": False,
    "currentOverviewLinksVerified": True,
    "zipCrcAndEveryFileHashVerified": True,
    "privateDataOrCredentialPatternFindings": build["secretPatternFindings"],
    "unbundledHistoricalReferences": build["unbundledHistoricalReferences"],
    "historicalReferencePolicy": "Retained in the link audit; current overview and index links resolve inside the ZIP.",
    "liveSavesIncluded": False,
    "credentialsIncluded": False,
    "privateSigningKeysIncluded": False,
    "installedApplicationModified": False,
    "youtrackMutationsForPackaging": 0,
}
report = outputs / f"{stage.name}-Verification.json"
report.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
(outputs / f"{stage.name}.zip.sha256").write_text(f"{result['zipSha256']}  {target.name}\n", encoding="utf-8")
print(json.dumps(result, indent=2))
