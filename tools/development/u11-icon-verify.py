from pathlib import Path
import ctypes,struct,json,hashlib
root=Path.cwd();exe=root/'outputs/ROMDex-Desktop-U11/ROMDex.exe';ico=(root/'outputs/ROMDex/desktop/app.ico').read_bytes();k=ctypes.WinDLL('kernel32',use_last_error=True)
k.LoadLibraryExW.argtypes=[ctypes.c_wchar_p,ctypes.c_void_p,ctypes.c_uint];k.LoadLibraryExW.restype=ctypes.c_void_p
k.FindResourceExW.argtypes=[ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_ushort];k.FindResourceExW.restype=ctypes.c_void_p
k.LoadResource.argtypes=[ctypes.c_void_p,ctypes.c_void_p];k.LoadResource.restype=ctypes.c_void_p
k.LockResource.argtypes=[ctypes.c_void_p];k.LockResource.restype=ctypes.c_void_p
k.SizeofResource.argtypes=[ctypes.c_void_p,ctypes.c_void_p];k.SizeofResource.restype=ctypes.c_uint
k.FreeLibrary.argtypes=[ctypes.c_void_p]
module=k.LoadLibraryExW(str(exe),None,2)
def resource(kind,name):
 found=k.FindResourceExW(module,ctypes.c_void_p(kind),ctypes.c_void_p(name),1033)
 if not found:raise ctypes.WinError(ctypes.get_last_error())
 return ctypes.string_at(k.LockResource(k.LoadResource(module,found)),k.SizeofResource(module,found))
group=resource(14,1);count=struct.unpack_from('<H',group,4)[0];assert count==8;checks=[]
for i in range(count):
 entry=ico[6+i*16:22+i*16];size,offset=struct.unpack_from('<II',entry,8);embedded=resource(3,3001+i);assert embedded==ico[offset:offset+size];assert struct.unpack_from('<H',group,6+i*14+12)[0]==3001+i;checks.append({'size':entry[0] or 256,'sha256':hashlib.sha256(embedded).hexdigest()})
k.FreeLibrary(module)
result={'source':'outputs/ROMDex/public/icon.svg','sourceSHA256':hashlib.sha256((root/'outputs/ROMDex/public/icon.svg').read_bytes()).hexdigest(),'icoSHA256':hashlib.sha256(ico).hexdigest(),'executable':str(exe),'embeddedFramesMatchICO':True,'frames':checks}
(root/'outputs/U11-Icon-Verification.json').write_text(json.dumps(result,indent=2));print(json.dumps({'embeddedFramesMatchICO':True,'sizes':[x['size'] for x in checks]}))
