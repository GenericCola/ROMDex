"""Read-only structural inventory; emits no ROM payloads or decoded dialogue."""
import argparse,hashlib,json,struct
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
b=a.rom.read_bytes();u16=lambda data,o:struct.unpack_from('<H',data,o)[0];u32=lambda data,o:struct.unpack_from('<I',data,o)[0]
def span(o,n):
    assert 0<=o<=len(b) and 0<=n<=len(b)-o
    return b[o:o+n]
fnt=span(u32(b,0x40),u32(b,0x44));fat=span(u32(b,0x48),u32(b,0x4c));assert len(fat)%8==0
paths={};seen=set()
def directory(did,prefix):
    assert did not in seen;seen.add(did);index=did-0xf000;assert 0<=index<u16(fnt,6)
    offset=u32(fnt,index*8);fid=u16(fnt,index*8+4)
    while True:
        mark=fnt[offset];offset+=1
        if not mark:break
        length=mark&127;assert length;name=fnt[offset:offset+length].decode('ascii');offset+=length
        if mark&128:
            child=u16(fnt,offset);offset+=2;directory(child,prefix+name+'/')
        else:
            assert fid not in paths;paths[fid]=prefix+name;fid+=1
directory(0xf000,'')
files=[]
for fid in range(len(fat)//8):
    start,end=struct.unpack_from('<II',fat,fid*8);data=span(start,end-start);entry={'fileId':fid,'path':paths.get(fid),'offset':start,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
    if data[:4]==b'NARC':
        header=u16(data,12);blocks=u16(data,14);pos=header;sections=[];count=None
        for i in range(blocks):
            assert pos+8<=len(data);magic=data[pos:pos+4].decode('ascii');size=u32(data,pos+4);assert size>=8 and pos+size<=len(data);sections.append({'type':magic,'bytes':size})
            if magic=='BTAF':
                count=u16(data,pos+8);assert 12+count*8<=size
                spans=[struct.unpack_from('<II',data,pos+12+j*8) for j in range(count)]
            if magic=='GMIF':
                assert count is not None and all(0<=s<=e<=size-8 for s,e in spans)
            pos+=size
        assert pos==len(data);entry['narc']={'members':count,'sections':sections}
    files.append(entry)
overlays=[]
ov=span(u32(b,0x50),u32(b,0x54));assert len(ov)%32==0
for o in range(0,len(ov),32):
    oid,ram,size,bss,init0,init1,fid,flags=struct.unpack_from('<8I',ov,o);assert fid<len(files)
    overlays.append({'overlayId':oid,'ramAddress':ram,'ramBytes':size,'fileId':fid,'flags':flags})
out={'format':'ROMDexROMInspection/1','mode':'read-only-structural','fileName':a.rom.name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'title':b[:12].rstrip(b'\0').decode('ascii'),'gameCode':b[12:16].decode('ascii'),'maker':b[16:18].decode('ascii'),'romVersion':b[0x1e],'arm9':dict(zip(['offset','entry','ramAddress','bytes'],struct.unpack_from('<4I',b,0x20))),'arm7':dict(zip(['offset','entry','ramAddress','bytes'],struct.unpack_from('<4I',b,0x30))),'namedFiles':len(paths),'fatFiles':len(files),'narcArchives':sum('narc'in f for f in files),'files':files,'overlays':overlays}
a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(json.dumps(out,indent=2).encode());print(json.dumps({k:v for k,v in out.items() if k not in ['files','overlays']}))
