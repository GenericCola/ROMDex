import sys, pathlib, zipfile
root=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2], 'w', zipfile.ZIP_DEFLATED) as archive:
    for item in root.iterdir():
        if item.is_file(): archive.write(item,item.name)
