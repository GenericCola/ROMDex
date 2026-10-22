from pathlib import Path
import shutil
root=Path.cwd();repo=root/'work/u13b/repository';out=root/'outputs/ROMDex'
files=['content/empty-workspace.js','rdx/map-workspace.mjs','content/desktop-assets.mjs','content/workspace-runtime.js','content/import-ui.js','content/native.css','tests/npcdex-empty.test.mjs','package.json','public/index.html','CHANGELOG.md']
for name in files:
 d=repo/'apps/romdex'/name;d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(out/name,d)
print('Mirrored',len(files),'reviewed application files; no Data or ROM included.')
