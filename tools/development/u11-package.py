from pathlib import Path
import json,hashlib,shutil,subprocess,ctypes,struct
root=Path.cwd();source=root/'outputs/ROMDex';release=root/'outputs/ROMDex-Desktop-U11';runtime=root/'work/u10/runtime/electron'
pkg=json.loads((source/'package.json').read_text());pkg['version']='0.5.0-preview.11';(source/'package.json').write_text(json.dumps(pkg,indent=2)+'\n')
index=source/'public/index.html';index.write_text(index.read_text(encoding='utf-8').replace('ROMDex 0.5.0-preview.10f · NPCDex Add-On','ROMDex 0.5.0-preview.11 · NPCDex Add-On'),encoding='utf-8')
release.mkdir(exist_ok=False)
for item in runtime.iterdir():
 if item.name=='electron.exe':shutil.copyfile(item,release/'ROMDex.exe')
 elif item.is_dir():shutil.copytree(item,release/item.name)
 else:shutil.copyfile(item,release/item.name)

# Stamp the existing SVG-derived ICO into the private unsigned executable.
k=ctypes.WinDLL('kernel32',use_last_error=True)
k.BeginUpdateResourceW.argtypes=[ctypes.c_wchar_p,ctypes.c_bool];k.BeginUpdateResourceW.restype=ctypes.c_void_p
k.UpdateResourceW.argtypes=[ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_ushort,ctypes.c_void_p,ctypes.c_uint];k.UpdateResourceW.restype=ctypes.c_bool
k.EndUpdateResourceW.argtypes=[ctypes.c_void_p,ctypes.c_bool];k.EndUpdateResourceW.restype=ctypes.c_bool
k.LoadLibraryExW.argtypes=[ctypes.c_wchar_p,ctypes.c_void_p,ctypes.c_uint];k.LoadLibraryExW.restype=ctypes.c_void_p
k.FreeLibrary.argtypes=[ctypes.c_void_p]
enum_name=ctypes.WINFUNCTYPE(ctypes.c_bool,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_ssize_t)
enum_lang=ctypes.WINFUNCTYPE(ctypes.c_bool,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_ushort,ctypes.c_ssize_t)
k.EnumResourceNamesW.argtypes=[ctypes.c_void_p,ctypes.c_void_p,enum_name,ctypes.c_ssize_t]
k.EnumResourceLanguagesW.argtypes=[ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,enum_lang,ctypes.c_ssize_t]
old=[];module=k.LoadLibraryExW(str(release/'ROMDex.exe'),None,2)
@enum_name
def names(module,kind,name,param):
 copied=name if name<=65535 else ctypes.wstring_at(name)
 @enum_lang
 def languages(module,kind,name,lang,param):old.append((kind,copied,lang));return True
 k.EnumResourceLanguagesW(module,kind,name,languages,0);return True
for kind in [3,14]:k.EnumResourceNamesW(module,kind,names,0)
k.FreeLibrary(module)
handle=k.BeginUpdateResourceW(str(release/'ROMDex.exe'),False)
if not handle:raise ctypes.WinError(ctypes.get_last_error())
def update(kind,name,lang,data):
 name_ptr=ctypes.c_void_p(name) if isinstance(name,int) else ctypes.cast(ctypes.c_wchar_p(name),ctypes.c_void_p)
 buffer=ctypes.create_string_buffer(data) if data else None
 if not k.UpdateResourceW(handle,ctypes.c_void_p(kind),name_ptr,lang,buffer,len(data) if data else 0):raise ctypes.WinError(ctypes.get_last_error())
try:
 for kind,name,lang in old:update(kind,name,lang,None)
 ico=(source/'desktop/app.ico').read_bytes();count=struct.unpack_from('<H',ico,4)[0];group=bytearray(ico[:6])
 for i in range(count):
  entry=ico[6+i*16:22+i*16];size,offset=struct.unpack_from('<II',entry,8);resource=3001+i;update(3,resource,1033,ico[offset:offset+size]);group+=entry[:12]+struct.pack('<H',resource)
 update(14,1,1033,bytes(group))
 if not k.EndUpdateResourceW(handle,False):raise ctypes.WinError(ctypes.get_last_error())
except:
 k.EndUpdateResourceW(handle,True);raise

baseline=json.loads((root/'work/u11/baseline.json').read_text());paths={r['path'] for r in baseline['files']};paths.update(['desktop/app.ico','desktop/app.png','desktop/lifecycle.mjs','desktop/service-host.mjs','tests/desktop-lifecycle.test.mjs','U11-Desktop-Guide.md']);syntax=0
for rel in sorted(paths):
 data=((root/'outputs/U11-Before/preview.png') if rel=='preview.png' else source/rel).read_bytes();target=release/'resources/app'/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 if rel.endswith(('.mjs','.cjs','.js')):
  r=subprocess.run(['C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe','--check',str(target)],capture_output=True,text=True)
  if r.returncode:raise RuntimeError(r.stderr)
  syntax+=1
shutil.copyfile(source/'U11-Desktop-Guide.md',release/'READ-ME-FIRST.md');records=[]
for file in sorted(release.rglob('*')):
 if file.is_file():records.append({'path':file.relative_to(release).as_posix(),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
manifest={'task':'U11','version':pkg['version'],'electron':'44.7.2','platform':'win32-x64','testsPassed':256,'syntaxChecks':syntax,'files':records,'bytes':sum(x['bytes'] for x in records),'appIconSource':'public/icon.svg','windowsIconSizes':[16,20,24,32,48,64,128,256],'executableIconEmbedded':True,'credentialsExcluded':True,'includesPrivateProjectData':True,'graphicalAcceptancePending':True}
(root/'outputs/U11-Desktop-Manifest.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({k:v for k,v in manifest.items() if k!='files'}))
