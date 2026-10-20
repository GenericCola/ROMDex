import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

export class RomError extends Error{
 constructor(code,message,details={}){super(message);this.name='RomError';this.code=code;this.details=details;}
}
export const requireRom=(ok,code,message,details)=>{if(!ok)throw new RomError(code,message,details);};
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const ROM_LIMITS=Object.freeze({bytes:512*1024*1024,read:64*1024*1024,files:65536,directories:4096,depth:64,members:65536,milliseconds:120000});
const safeInteger=v=>Number.isSafeInteger(v)&&v>=0;
const component=name=>/^[\x20-\x7e]+$/.test(name)&&!['.','..'].includes(name)&&!/[\\/:]/.test(name);

// Opened read-only. No extract/write/repack method exists on this object.
export class RomReader{
 #handle;#baseline;#files=[];#paths=new Map();#narcs=new Map();#hashes=new Map();#digest=null;#closed=false;
 constructor(handle,stat,{signal,limits={}}={}){
  this.#handle=handle;this.#baseline=stat;this.signal=signal;this.limits={...ROM_LIMITS};
  for(const [key,value]of Object.entries(limits)){requireRom(Object.hasOwn(ROM_LIMITS,key)&&safeInteger(value)&&value>0&&value<=ROM_LIMITS[key],'LIMIT','Invalid ROM limit: '+key);this.limits[key]=value;}
  this.size=Number(stat.size);requireRom(this.size>=512&&this.size<=this.limits.bytes,'LIMIT','ROM size is outside the supported bound.');this.deadline=Date.now()+this.limits.milliseconds;
 }
 static async open(file,options={}){
  const handle=await fs.open(file,'r');
  try{const stat=await handle.stat({bigint:true});requireRom(stat.isFile(),'INVALID','Select a regular ROM file.');const reader=new RomReader(handle,stat,options);await reader.#initialize();return reader;}
  catch(error){await handle.close();throw error;}
 }
 check(){
  requireRom(!this.#closed,'CLOSED','The ROM reader is closed.');
  requireRom(!this.signal?.aborted,'CANCELLED','ROM work was cancelled.');
  requireRom(Date.now()<=this.deadline,'LIMIT','ROM work exceeded its time budget.');
 }
 async assertUnchanged(){
  // ctime also changes for Windows/OneDrive metadata updates, not only ROM writes.
  // Keep file identity, byte length and content-modification time pinned.
  this.check();const now=await this.#handle.stat({bigint:true});
  requireRom(['size','mtimeNs','ino','dev'].every(k=>now[k]===this.#baseline[k]),'SOURCE_CHANGED','The ROM changed during inspection. Reopen and preview it again.');
 }
 async read(offset,length){
  this.check();requireRom(safeInteger(offset)&&safeInteger(length)&&offset<=this.size&&length<=this.size-offset,'BOUNDS','ROM range is outside the input file.');
  requireRom(length<=this.limits.read,'LIMIT','ROM read exceeds the per-read bound.');const out=Buffer.alloc(length);let at=0;
  while(at<length){this.check();const result=await this.#handle.read(out,at,Math.min(length-at,1024*1024),offset+at);requireRom(result.bytesRead>0,'SOURCE_CHANGED','The ROM ended during inspection.');at+=result.bytesRead;}
  return out;
 }
 async hashRange(offset,length){
  requireRom(safeInteger(offset)&&safeInteger(length)&&offset<=this.size&&length<=this.size-offset,'BOUNDS','ROM hash range is outside the input file.');const hash=createHash('sha256');
  for(let at=0;at<length;at+=1024*1024)hash.update(await this.read(offset+at,Math.min(1024*1024,length-at)));
  await this.assertUnchanged();return hash.digest('hex');
 }
 async fingerprint(){
  this.check();if(!this.#digest)this.#digest=await this.hashRange(0,this.size);await this.assertUnchanged();
  return {format:'ROMDexROMFingerprint/1',sha256:this.#digest,bytes:this.size,...structuredClone(this.header)};
 }
 files(){return structuredClone(this.#files);}
 fileInfo(key){const value=typeof key==='string'?this.#paths.get(key):this.#files[key];requireRom(value,'NOT_FOUND','ROM resource is missing.',{resource:key});return {...value};}
 async readFile(key){const f=this.fileInfo(key);return this.read(f.offset,f.bytes);}
 async fileHash(key){const f=this.fileInfo(key);this.check();if(!this.#hashes.has(f.fileId))this.#hashes.set(f.fileId,await this.hashRange(f.offset,f.bytes));await this.assertUnchanged();return this.#hashes.get(f.fileId);}
 async systemInfo(kind,id){
  if(kind==='arm9')return {...this.header.arm9,path:'__rom__/arm9.bin',kind};
  requireRom(kind==='overlay','INVALID','Unknown ROM system resource.');const overlay=this.overlays.find(o=>o.id===id);requireRom(overlay,'NOT_FOUND','ROM overlay is missing.',{id});return {...overlay,...this.fileInfo(overlay.fileId),path:'__rom__/overlay/'+id+'.bin',kind};
 }
 async systemHash(kind,id){
  const info=await this.systemInfo(kind,id),key=kind+':'+(id??'main');this.check();
  if(!this.#hashes.has(key))this.#hashes.set(key,await this.hashRange(info.offset,info.bytes));await this.assertUnchanged();return this.#hashes.get(key);
 }
 async resolveAddress(address,{overlayId}={}){
  this.check();requireRom(safeInteger(address),'INVALID','Invalid ROM RAM address.');
  const candidates=this.overlays.filter(o=>address>=o.ramAddress&&address<o.ramAddress+o.ramBytes);
  const owners=overlayId===undefined?candidates:candidates.filter(o=>o.id===overlayId);
  requireRom(owners.length===1,'AMBIGUOUS_ADDRESS','RAM address needs one verified overlay owner.',{address,candidates:candidates.map(o=>o.id)});
  const owner=owners[0];requireRom(!owner.compressed,'UNSUPPORTED','Compressed overlay decoding is not supported by this reader version.',{overlayId:owner.id});
  const f=this.fileInfo(owner.fileId),relative=address-owner.ramAddress;requireRom(relative<f.bytes,'BOUNDS','RAM address resolves to uninitialized overlay memory.');return {...owner,offset:f.offset+relative,relative,available:f.bytes-relative};
 }
 async narc(key){
  this.check();
  const f=this.fileInfo(key);if(this.#narcs.has(f.fileId))return structuredClone(this.#narcs.get(f.fileId));
  requireRom(f.bytes>=16,'INVALID','Truncated NARC header.');const header=await this.read(f.offset,16);
  requireRom(header.toString('ascii',0,4)==='NARC','INVALID','Resource is not a NARC archive.');
  requireRom(header.readUInt16LE(4)===0xfffe&&header.readUInt16LE(6)===0x100,'UNSUPPORTED','Unsupported NARC byte order or version.');
  requireRom(header.readUInt32LE(8)===f.bytes&&header.readUInt16LE(12)===16&&header.readUInt16LE(14)===3,'INVALID','NARC size or section header differs.');
  let pos=16,members=null,dataOffset=null,dataBytes=null;const sections=[];
  for(const expected of ['BTAF','BTNF','GMIF']){
   requireRom(pos+8<=f.bytes,'BOUNDS','Truncated NARC section.');const head=await this.read(f.offset+pos,8),magic=head.toString('ascii',0,4),size=head.readUInt32LE(4);
   requireRom(magic===expected&&size>=8&&size<=f.bytes-pos,'INVALID','Invalid NARC section range or order.');sections.push({type:magic,bytes:size});
   if(magic==='BTAF'){
    requireRom(size>=12,'INVALID','Truncated NARC allocation table.');const count=(await this.read(f.offset+pos+8,4)).readUInt16LE(0);
    requireRom(count<=this.limits.members&&12+count*8===size,'LIMIT','NARC allocation count or size is invalid.');const table=await this.read(f.offset+pos+12,count*8);
    members=Array.from({length:count},(_,i)=>({index:i,start:table.readUInt32LE(i*8),end:table.readUInt32LE(i*8+4)}));
   }
   if(magic==='GMIF'){dataOffset=f.offset+pos+8;dataBytes=size-8;}
   pos+=size;
  }
  requireRom(pos===f.bytes,'INVALID','Unexpected trailing NARC data.');let end=0;
  for(const member of members){requireRom(member.start>=end&&member.end>=member.start&&member.end<=dataBytes,'BOUNDS','Invalid or overlapping NARC member.');end=member.end;}
  const result={file:f,sections,dataOffset,dataBytes,members:members.map(m=>({index:m.index,offset:dataOffset+m.start,bytes:m.end-m.start}))};this.#narcs.set(f.fileId,result);return structuredClone(result);
 }
 async member(key,index){
  requireRom(safeInteger(index),'INVALID','Invalid NARC member index.');const archive=await this.narc(key),member=archive.members[index];requireRom(member,'NOT_FOUND','NARC member is missing.',{resource:key,index});return this.read(member.offset,member.bytes);
 }
 async #initialize(){
  const h=await this.read(0,512),u32=o=>h.readUInt32LE(o),span=(offset,bytes)=>{requireRom(bytes>0&&safeInteger(offset)&&offset<=this.size&&bytes<=this.size-offset,'BOUNDS','Invalid ROM system table.');return {offset,bytes};};
  const arm9={...span(u32(32),u32(44)),entry:u32(36),ramAddress:u32(40)},arm7={...span(u32(48),u32(60)),entry:u32(52),ramAddress:u32(56)};
  this.header={title:h.toString('ascii',0,12).replace(/\0+$/,''),gameCode:h.toString('ascii',12,16),maker:h.toString('ascii',16,18),version:h[30],arm9,arm7};
  const fntRange=span(u32(64),u32(68)),fatRange=span(u32(72),u32(76));requireRom(fatRange.bytes%8===0&&fatRange.bytes/8<=this.limits.files,'LIMIT','Invalid ROM allocation count.');
  const fat=await this.read(fatRange.offset,fatRange.bytes);
  for(let id=0;id<fat.length/8;id++){const offset=fat.readUInt32LE(id*8),end=fat.readUInt32LE(id*8+4);requireRom(offset<=end&&end<=this.size,'BOUNDS','Invalid ROM file allocation.');this.#files.push({fileId:id,path:null,offset,bytes:end-offset});}
  const fnt=await this.read(fntRange.offset,fntRange.bytes);requireRom(fnt.length>=8,'INVALID','Truncated ROM filename table.');const count=fnt.readUInt16LE(6);
  requireRom(count>0&&count<=this.limits.directories&&count*8<=fnt.length,'LIMIT','Invalid ROM directory count.');const seen=new Set();
  const directory=(id,prefix,parent,depth)=>{
   this.check();const index=id-0xf000;requireRom(index>=0&&index<count&&!seen.has(id)&&depth<=this.limits.depth,'INVALID','Invalid or cyclic ROM directory.');seen.add(id);
   let at=fnt.readUInt32LE(index*8),fileId=fnt.readUInt16LE(index*8+4);requireRom(at>=count*8&&at<fnt.length,'BOUNDS','Invalid ROM directory subtable.');if(parent!==null)requireRom(fnt.readUInt16LE(index*8+6)===parent,'INVALID','ROM directory parent differs.');
   while(true){
    requireRom(at<fnt.length,'BOUNDS','Unterminated ROM directory.');const tag=fnt[at++];if(!tag)break;const length=tag&127;requireRom(length>0&&at+length<=fnt.length,'BOUNDS','Truncated ROM filename.');
    const raw=fnt.subarray(at,at+length);requireRom(raw.every(b=>b>=32&&b<=126),'INVALID','Unsupported ROM filename encoding.');const name=raw.toString('ascii');at+=length;requireRom(component(name),'INVALID','Unsafe ROM path component.');
    const path=prefix+name;requireRom(!this.#paths.has(path),'INVALID','Duplicate ROM resource path.');
    if(tag&128){requireRom(at+2<=fnt.length,'BOUNDS','Truncated ROM directory ID.');const child=fnt.readUInt16LE(at);at+=2;this.#paths.set(path,{directory:true});directory(child,path+'/',id,depth+1);}
    else{const f=this.#files[fileId++];requireRom(f&&!f.path,'INVALID','Invalid or repeated ROM file ID.');f.path=path;this.#paths.set(path,f);}
   }
  };directory(0xf000,'',null,0);requireRom(seen.size===count,'INVALID','Unreachable ROM directory.');
  for(const [path,value]of this.#paths)if(value.directory)this.#paths.delete(path);
  const ovOffset=u32(80),ovSize=u32(84);requireRom(ovSize%32===0&&ovOffset<=this.size&&ovSize<=this.size-ovOffset&&ovSize/32<=this.limits.files,'BOUNDS','Invalid ARM9 overlay table.');
  const ov=await this.read(ovOffset,ovSize);this.overlays=[];const ids=new Set();
  for(let i=0;i<ov.length;i+=32){const id=ov.readUInt32LE(i),ramAddress=ov.readUInt32LE(i+4),ramBytes=ov.readUInt32LE(i+8),fileId=ov.readUInt32LE(i+24),flags=ov.readUInt32LE(i+28);requireRom(!ids.has(id)&&this.#files[fileId]&&ramAddress+ramBytes<=0x100000000,'INVALID','Invalid ROM overlay entry.');ids.add(id);this.overlays.push({id,ramAddress,ramBytes,bssBytes:ov.readUInt32LE(i+12),fileId,compressed:!!(flags&0x01000000),storedSize:flags&0xffffff});}
  await this.assertUnchanged();
 }
 async close(){if(!this.#closed){this.#closed=true;await this.#handle.close();}}
}
