"""Bounded ROM-only feasibility probe, not the production extractor/importer."""
from pathlib import Path
import argparse,json,struct,hashlib,re
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();rom=a.rom.read_bytes();inventory=json.loads(Path('work/ri01/rom-inventory.json').read_text());files={f['path']:f for f in inventory['files'] if f['path']};h=lambda b:hashlib.sha256(b).hexdigest();u16=lambda b,o:struct.unpack_from('<H',b,o)[0];u32=lambda b,o:struct.unpack_from('<I',b,o)[0]
def narc(path):
    f=files[path];data=rom[f['offset']:f['offset']+f['bytes']];assert h(data)==f['sha256'];pos=u16(data,12);spans=None
    for _ in range(u16(data,14)):
        magic=data[pos:pos+4];size=u32(data,pos+4)
        if magic==b'BTAF':spans=[struct.unpack_from('<II',data,pos+12+8*i) for i in range(u16(data,pos+8))]
        if magic==b'GMIF':return [data[pos+8+s:pos+8+e] for s,e in spans]
        pos+=size
    raise ValueError('No NARC member data')
messages=narc('a/0/2/7');events=narc('a/0/3/2');scripts=narc('a/0/1/2');matrices=narc('a/0/4/1');sprites=narc('a/0/8/1')
charmap={}
for line in Path('work/ri01/reference/charmap.txt').read_text(encoding='utf-8').splitlines():
    if re.match(r'^[0-9A-Fa-f]{4}=',line):
        key,value=line.split('=',1);charmap[int(key,16)]=value
def message(bank,index):
    b=messages[bank];count,key=struct.unpack_from('<HH',b);assert index<count
    mask=((key*765*(index+1))&65535)*0x10001;offset,length=struct.unpack_from('<II',b,4+index*8);offset^=mask;length^=mask;assert 4+count*8<=offset<=len(b) and length*2<=len(b)-offset
    words=[];seed=((index+1)*596947)&65535
    for i in range(length):words.append(u16(b,offset+2*i)^seed);seed=(seed+18749)&65535
    assert words and words[-1]==65535
    out=[];unknown=[];controls=[];i=0
    while i<len(words):
        code=words[i];i+=1
        if code==65535:break
        if code==65534:
            assert i+2<=len(words);command,count=words[i:i+2];i+=2;assert i+count<=len(words);args=words[i:i+count];i+=count;controls.append({'code':command,'args':args});out.append('[CTRL:%04X:%s]'%(command,','.join(map(str,args))));continue
        if code in charmap:out.append(charmap[code])
        else:unknown.append(code);out.append('[U16:%04X]'%code)
    return {'text':''.join(out),'wordCount':len(words),'sha256':h(struct.pack('<'+'H'*len(words),*words)),'unknown':sorted(set(unknown)),'controls':controls}
definitions={}
macro=Path('work/ri01/reference/script.inc').read_text().splitlines();current=None;body=[]
for line in macro:
    clean=line.split('//',1)[0].strip()
    if clean.startswith('.macro '):current=clean.split()[1];body=[]
    elif clean=='.endm' and current:
        if body and re.match(r'^\.short (0x[0-9A-Fa-f]+|[0-9]+)$',body[0]):
            op=int(body[0].split()[1],0);params=[];valid=True
            for row in body[1:]:
                m=re.match(r'^\.(byte|short|long|word)\s+(.+)$',row)
                if not m:valid=False;break
                width={'byte':1,'short':2,'long':4,'word':4}[m[1]];params.extend([width]*len(m[2].split(',')))
            if valid and op<0xfd13:definitions[op]={'name':current,'widths':params}
        current=None
    elif current and clean:body.append(clean)
def entries(data):
    pos=0;out=[]
    while pos+2<=len(data) and u16(data,pos)!=0xfd13:
        assert pos+4<=len(data);target=pos+4+struct.unpack_from('<i',data,pos)[0];assert 0<=target<len(data);out.append(target);pos+=4;assert len(out)<5000
    assert pos+2<=len(data) and u16(data,pos)==0xfd13;return out
def flow(data,entry):
    pending=[entry];seen={};unresolved=[];maxSteps=20000
    while pending:
        pos=pending.pop()
        while pos not in seen:
            if len(seen)>=maxSteps:unresolved.append({'offset':pos,'reason':'probe budget'});break
            if pos<0 or pos+2>len(data):unresolved.append({'offset':pos,'reason':'out of range'});break
            op=u16(data,pos);definition=definitions.get(op)
            if not definition:unresolved.append({'offset':pos,'opcode':op,'reason':'no fixed-width reference definition'});break
            end=pos+2+sum(definition['widths'])
            if end>len(data):unresolved.append({'offset':pos,'opcode':op,'reason':'truncated'});break
            values=[];at=pos+2
            for width in definition['widths']:values.append(int.from_bytes(data[at:at+width],'little'));at+=width
            row={'offset':pos,'opcode':op,'name':definition['name'],'params':values};seen[pos]=row;name=row['name']
            if name in ['GoTo','Call','GoToIf','CallIf']:
                displacement=values[-1];displacement=displacement if displacement<0x80000000 else displacement-0x100000000;pending.append(end+displacement)
            if name in ['End','Return','GoTo']:break
            pos=end
    return {'instructions':list(seen.values()),'unresolved':unresolved}
arm9=inventory['arm9'];base=arm9['offset']+0xf6be0;headers=[]
for mapid in [60,61,62,63,64,65,66,384]:
    offset=base+24*mapid;data=rom[offset:offset+24];matrix,script,level,text=struct.unpack_from('<4H',data,4);event=u16(data,16);section=data[18]
    assert matrix<len(matrices) and script<len(scripts) and level<len(scripts) and text<len(messages) and event<len(events)
    ev=events[event];pos=0;evrows={}
    for kind,width in [('backgrounds',20),('overworlds',32),('warps',12),('triggers',16)]:
        count=u32(ev,pos);pos+=4;assert pos+count*width<=len(ev);rows=[]
        for i in range(count):
            row=ev[pos+i*width:pos+(i+1)*width]
            if kind=='overworlds':
                fields=dict(zip(['localId','spriteTableId','movement','type','visibilityFlag','scriptNumber','orientation','sightRange','unknown1','unknown2','xRange','yRange'],struct.unpack_from('<12H',row)));fields.update(x=struct.unpack_from('<h',row,24)[0],y=struct.unpack_from('<h',row,26)[0],z=struct.unpack_from('<i',row,28)[0]);rows.append(fields)
            else:rows.append({'index':i,'sha256':h(row)})
        evrows[kind]=rows;pos+=count*width
    assert pos==len(ev)
    entrypoints=entries(scripts[script]);flows=[flow(scripts[script],entry) for entry in entrypoints]
    count=u16(messages[text],0);decoded=[message(text,i) for i in range(count)]
    headers.append({'mapHeaderId':mapid,'headerROMOffset':offset,'headerSHA256':h(data),'matrix':matrix,'scriptBank':script,'levelScriptBank':level,'textBank':text,'eventBank':event,'locationSection':section,'locationName':message(279,section)['text'],'events':evrows,'scriptEntries':len(entrypoints),'scriptCoverage':[{'entry':i,'instructions':len(v['instructions']),'names':sorted(set(r['name'] for r in v['instructions'])),'unresolved':v['unresolved']} for i,v in enumerate(flows)],'messages':{'count':count,'unknownCodes':sorted(set(c for d in decoded for c in d['unknown'])),'controlCount':sum(len(d['controls']) for d in decoded),'samples':[{'index':i,'text':d['text'],'sha256':d['sha256']} for i,d in enumerate(decoded[:3])]},'resourceHashes':{'event':h(ev),'script':h(scripts[script]),'levelScript':h(scripts[level]),'text':h(messages[text])}})
out={'format':'ROMDexROMOnlyScopeProbe/1','romSHA256':h(rom),'input':'ROM only; public fixed format references, no editable project/prepared map exports','retailHeaderOffsetCandidate':hex(0xf6be0),'fixedWidthReferenceCommands':len(definitions),'candidate':'New Bark Town and its eight physical areas','headers':headers,'overworldArchiveMembers':len(sprites),'limits':['Feasibility probe only; no RDX built or imported','Retail header lookup not yet independently checked against runtime code','Referenced standard/global scripts and native calls are not recursively resolved by this probe','Message control codes retained as numeric tokens; unknown text/compression remains explicit','No NPC identity, timeline meaning or runtime reachability inferred']}
a.output.write_bytes(json.dumps(out,indent=2,ensure_ascii=False).encode());print(json.dumps({'headers':[{'map':r['mapHeaderId'],'name':r['locationName'],'scriptBank':r['scriptBank'],'eventBank':r['eventBank'],'textBank':r['textBank'],'NPCs':len(r['events']['overworlds']),'messages':r['messages']['count'],'unknownCodes':r['messages']['unknownCodes'],'entries':r['scriptEntries'],'unresolvedFlows':sum(bool(f['unresolved']) for f in r['scriptCoverage'])} for r in headers],'fixedWidthDefinitions':len(definitions)},ensure_ascii=False))
