import {canonical} from '../content/contracts.mjs';
import {requireRom,sha256} from './reader.mjs';
import {PROFILES,HGSS_ADAPTER} from './profiles.mjs';
import {makeLocator} from './locators.mjs';

export async function readerLayout(rom,profile){
 const names=decodeMapNames(await rom.readFile(rom.fileInfo(profile.internalNames).fileId)),arm=await rom.read(rom.header.arm9.offset,rom.header.arm9.bytes),end=profile.headerOffset+names.length*profile.headerWidth;
 requireRom(end<=arm.length,'UNSUPPORTED_BUILD','The Map Table Layout Changed. A Reader Profile Review Is Required.');
 const overlays=[];for(const id of [...new Set([profile.spritePointer.overlay,profile.spritePointer.owner,profile.textSemantics.overlay])]){const o=await rom.systemInfo('overlay',id);requireRom(!o.compressed,'UNSUPPORTED_BUILD','The Reader Layout Uses an Unsupported Compressed Overlay.');overlays.push({id,ramAddress:o.ramAddress,ramBytes:o.ramBytes,sha256:await rom.fileHash(o.fileId)});}
 const value={format:'ROMDexReaderLayout/1',profile:profile.id,gameCode:rom.header.gameCode,arm9Address:rom.header.arm9.ramAddress,arm9Bytes:arm.length,mapCount:names.length,headerOffset:profile.headerOffset,codeBefore:sha256(arm.subarray(0,profile.headerOffset)),codeAfter:sha256(arm.subarray(end)),overlays};return {...value,digest:sha256(Buffer.from(canonical(value)))};
}
export async function identifyRom(rom,{compatibility=[]}={}){
 const source=await rom.fingerprint(),profile=PROFILES.find(p=>p.sha256===source.sha256);
 if(profile&&profile.gameCode===source.gameCode){const layout=await readerLayout(rom,profile);rom.validatedLayout=layout;rom.validatedSourceSHA256=source.sha256;return {source,support:'known-build',adapter:HGSS_ADAPTER,profile:profile.id,layout};}
 for(const basis of Array.isArray(compatibility)?compatibility:[compatibility]){const p=PROFILES.find(p=>p.id===basis?.profile&&p.gameCode===source.gameCode);if(!p)continue;const layout=await readerLayout(rom,p);if(canonical(layout)===canonical(basis)){rom.validatedLayout=layout;rom.validatedSourceSHA256=source.sha256;return {source,support:'validated-layout',adapter:HGSS_ADAPTER,profile:p.id,layout};}}
 return {source,support:source.gameCode==='IPKE'?'unreviewed-build':'unsupported-build',adapter:null,profile:null,reason:'A game code alone does not establish support for a modified ROM. Preserve the fingerprint and review its source layout before extraction.'};
}
export function decodeMapNames(bytes,width=16,max=10000){
 requireRom(width===16&&bytes.length>0&&bytes.length%width===0&&bytes.length/width<=max,'INVALID','Invalid map-name catalog size.');
 const names=[];for(let at=0;at<bytes.length;at+=width){const row=bytes.subarray(at,at+width),zero=row.indexOf(0),text=zero<0?row:row.subarray(0,zero);requireRom(text.length>0&&text.every(v=>v>=32&&v<=126),'INVALID','Invalid map-name encoding.');if(zero>=0)requireRom(row.subarray(zero).every(v=>v===0),'INVALID','Map-name padding differs.');names.push(text.toString('ascii'));}return names;
}
export function decodeMapHeader(bytes,id,name){
 requireRom(bytes.length===24,'INVALID','Map header must contain 24 bytes.');const flags=bytes.readUInt32LE(20),position=bytes.readUInt16LE(2);
 return {headerId:id,internalName:name,sha256:sha256(bytes),wildEncounterBank:bytes[0],areaDataBank:bytes[1],moveModelBank:position&15,worldMapX:(position>>>4)&63,worldMapY:position>>>10,matrixId:bytes.readUInt16LE(4),scriptBank:bytes.readUInt16LE(6),levelScriptBank:bytes.readUInt16LE(8),messageBank:bytes.readUInt16LE(10),dayMusicId:bytes.readUInt16LE(12),nightMusicId:bytes.readUInt16LE(14),eventBank:bytes.readUInt16LE(16),locationSection:bytes[18],regionId:flags&1,weather:(flags>>>1)&127,mapType:(flags>>>8)&15,rawFlags:flags};
}
export function decodeEvents(bytes,{maxEntries=20000}={}){
 const result={backgrounds:[],overworlds:[],warps:[],triggers:[]};let at=0,total=0;
 for(const [kind,width]of [['backgrounds',20],['overworlds',32],['warps',12],['triggers',16]]){
  requireRom(at+4<=bytes.length,'BOUNDS','Truncated event section count.');const count=bytes.readUInt32LE(at);at+=4;total+=count;requireRom(total<=maxEntries&&count<=Math.floor((bytes.length-at)/width),'LIMIT','Event section count exceeds its range or budget.');
  for(let index=0;index<count;index++){
   const offset=at+index*width,row=bytes.subarray(offset,offset+width),u16=o=>row.readUInt16LE(o),i16=o=>row.readInt16LE(o);let fields;
   if(kind==='overworlds'){fields=Object.fromEntries(['localId','spriteTableId','movement','type','visibilityFlag','scriptNumber','orientation','sightRange','unknown1','unknown2','xRange','yRange'].map((n,i)=>[n,u16(i*2)]));Object.assign(fields,{x:i16(24),y:i16(26),z:row.readInt32LE(28)});}
   else if(kind==='warps')fields={x:i16(0),y:i16(2),destinationHeader:u16(4),destinationWarp:u16(6),height:row.readUInt32LE(8)};
   else if(kind==='triggers')fields={scriptNumber:u16(0),x:i16(2),y:i16(4),width:u16(6),height:u16(8),z:u16(10),expectedValue:u16(12),variable:u16(14)};
   else fields={scriptNumber:u16(0),type:u16(2),x:i16(4),unknown2:u16(6),y:i16(8),z:row.readInt32LE(10),unknown4:u16(14),direction:u16(16),unknown5:u16(18)};
   result[kind].push({index,byteOffset:offset,byteLength:width,sha256:sha256(row),...fields});
  }
  at+=count*width;
 }
 requireRom(at===bytes.length,'INVALID','Unexpected trailing event data.');return result;
}
export function linkWarps(maps){
 const byId=new Map(maps.map(m=>[m.headerId,m])),links=[];
 for(const map of maps)for(const warp of map.events.warps){
  const target=byId.get(warp.destinationHeader);let state,reason=null;
  if(warp.destinationHeader>=0xfffe){state='runtime-dependent';reason='Dynamic map destination';}
  else if(!target){state='unresolved';reason='Destination map is outside the catalog';}
  else if(warp.destinationWarp>=target.events.warps.length){state='unresolved';reason='Destination warp is outside its event list';}
  else state='resolved';
  links.push({fromHeader:map.headerId,fromWarp:warp.index,toHeader:warp.destinationHeader,toWarp:warp.destinationWarp,state,...(reason?{reason}:{})});
 }
 return links;
}
async function resource(rom,kind,profileKey,archives){
 const file=rom.fileInfo(profileKey),archive=await rom.narc(file.fileId);archives[kind]={path:file.path,fileId:file.fileId,sha256:await rom.fileHash(file.fileId),members:archive.members.length};return archive;
}
async function spriteTable(rom,profile){
 const location=await rom.resolveAddress(profile.spritePointer.address,{overlayId:profile.spritePointer.overlay}),pointer=(await rom.read(location.offset,4)).readUInt32LE(0),owner=await rom.resolveAddress(pointer,{overlayId:profile.spritePointer.owner});
 let at=0;const rows=[],seen=new Set(),table=await rom.read(owner.offset,Math.min(owner.available,120002));
 while(at+2<=table.length){
  rom.check();const key=table.readUInt16LE(at);if(key===0xffff)break;
  requireRom(at+6<=table.length&&rows.length<20000&&!seen.has(key),'INVALID','Invalid or duplicate relocated sprite row.');seen.add(key);rows.push({tableId:key,spriteMember:table.readUInt16LE(at+2),properties:table.readUInt16LE(at+4)});at+=6;
 }
 requireRom(at+2<=table.length,'BOUNDS','Relocated sprite table is unterminated.');
 return {pointer,ownerOverlay:owner.id,rows,locator:await makeLocator(rom,{kind:'source-document',sourceType:'overlay',overlayId:owner.id,offset:owner.relative,bytes:at+2,selectors:{table:'overworld-sprites'}})};
}
export async function inventoryHGSS(rom,{progress=()=>{},compatibility=[]}={}){
 const identification=await identifyRom(rom,{compatibility});requireRom(['known-build','validated-layout'].includes(identification.support),'UNSUPPORTED_BUILD',identification.reason||'Unsupported ROM build.',{identification});
 const profile=PROFILES.find(p=>p.id===identification.profile),arm9=rom.header.arm9;
 requireRom(arm9.bytes>=0xbb8&&(await rom.read(arm9.offset+0xbb4,4)).readUInt32LE(0)===0,'UNSUPPORTED','Compressed ARM9 decoding is not supported by this reader version.');
 const namesFile=rom.fileInfo(profile.internalNames),names=decodeMapNames(await rom.readFile(namesFile.fileId),16),tableBytes=names.length*24;
 requireRom(profile.headerOffset+tableBytes<=arm9.bytes,'BOUNDS','Map-header table does not fit the ROM ARM9.');const arm=await rom.read(arm9.offset,arm9.bytes),pointer=arm9.ramAddress+profile.headerOffset;
 const headerPointerOffsets=[];for(let at=0;at+4<=arm.length;at+=4)if(arm.readUInt32LE(at)===pointer)headerPointerOffsets.push(at);
 requireRom(headerPointerOffsets.length>0,'UNSUPPORTED','Map-header table has no validated ARM9 pointer evidence.');
 const archives={},indexes={};for(const [key,path]of Object.entries(profile.archives))indexes[key]=await resource(rom,key,path,archives);progress({stage:'catalog',maps:names.length});
 const maps=[],eventCache=new Map(),warnings=[],nameIds=new Map();
 for(let id=0;id<names.length;id++){
  rom.check();const offset=profile.headerOffset+id*24,bytes=arm.subarray(offset,offset+24),map=decodeMapHeader(bytes,id,names[id]);
  for(const [field,key]of [['matrixId','matrices'],['scriptBank','scripts'],['levelScriptBank','scripts'],['messageBank','messages'],['eventBank','events']])requireRom(map[field]<indexes[key].members.length,'INVALID_REFERENCE','Map references a missing archive member.',{map:id,field,value:map[field]});
  if(!eventCache.has(map.eventBank))eventCache.set(map.eventBank,decodeEvents(await rom.member(archives.events.fileId,map.eventBank)));
  map.events=structuredClone(eventCache.get(map.eventBank));map.locator=await makeLocator(rom,{kind:'map',sourceType:'arm9',offset,bytes:24,selectors:{mapHeaderId:id}});
  const eventMember=indexes.events.members[map.eventBank];map.eventLocator=await makeLocator(rom,{kind:'event',fileId:archives.events.fileId,memberId:map.eventBank,bytes:eventMember.bytes,selectors:{mapHeaderId:id,eventBank:map.eventBank}});
  for(const [kind,rows]of Object.entries(map.events))for(const row of rows)row.locator={...structuredClone(map.eventLocator),selectors:{...map.eventLocator.selectors,eventKind:kind,eventIndex:row.index,byteOffset:row.byteOffset,byteLength:row.byteLength,selectionSHA256:row.sha256}};
  const localIds=new Set();for(const row of map.events.overworlds){if(localIds.has(row.localId))warnings.push({code:'DUPLICATE_LOCAL_ID',mapHeaderId:id,localId:row.localId});localIds.add(row.localId);}
  if(nameIds.has(map.internalName))warnings.push({code:'DUPLICATE_INTERNAL_NAME',headers:[nameIds.get(map.internalName),id]});else nameIds.set(map.internalName,id);
  maps.push(map);if(id%50===0)progress({stage:'maps',completed:id+1,total:names.length});
 }
 const sprites=await spriteTable(rom,profile);requireRom(sprites.rows.every(r=>r.spriteMember<archives.sprites.members),'INVALID_REFERENCE','Relocated sprite table references a missing texture.');
 const warps=linkWarps(maps);for(const link of warps)if(link.state!=='resolved')warnings.push({code:link.state==='runtime-dependent'?'DYNAMIC_WARP':'UNRESOLVED_WARP',...link});
 const result={format:'ROMDexSourceInventory/1',adapter:HGSS_ADAPTER,profile:profile.id,source:identification.source,catalog:{mapCount:names.length,namesPath:namesFile.path,namesSHA256:await rom.fileHash(namesFile.fileId),headerSource:'arm9',headerByteOffset:profile.headerOffset,headerWidth:24,headerPointerOffsets},archives,maps,warps,spriteTable:sprites,scopeCandidate:{...structuredClone(profile.candidateGroup),authority:'User-selected Violet City testbed; ROM location section 128, independently decoded as Violet City'},warnings,coverage:{dialogueDecoded:false,scriptsDecoded:false,spritesRendered:false,timelinesDerived:false,rdxCompiled:false,cloudPublished:false}};
 result.layout=identification.layout;result.digest=inventoryDigest(result);await rom.assertUnchanged();progress({stage:'complete',maps:maps.length});return result;
}
export function inventoryDigest(inventory){const value={...inventory};delete value.digest;return sha256(Buffer.from(canonical(value)));}
export function validateInventory(inventory){
 requireRom(inventory?.format==='ROMDexSourceInventory/1'&&inventory.adapter===HGSS_ADAPTER&&inventory.source?.format==='ROMDexROMFingerprint/1'&&/^[a-f0-9]{64}$/.test(inventory.source.sha256)&&Array.isArray(inventory.maps)&&inventory.maps.length<=10000&&inventory.digest===inventoryDigest(inventory),'INTEGRITY','Invalid or changed ROM source inventory.');
 const ids=new Set();let total=0;
 for(const map of inventory.maps){
  requireRom(map&&Number.isSafeInteger(map.headerId)&&map.headerId>=0&&!ids.has(map.headerId)&&typeof map.internalName==='string'&&/^[a-f0-9]{64}$/.test(map.sha256)&&map.events&&['backgrounds','overworlds','warps','triggers'].every(k=>Array.isArray(map.events[k])),'INTEGRITY','Invalid source map inventory.');ids.add(map.headerId);
  for(const rows of Object.values(map.events)){requireRom(Array.isArray(rows),'INTEGRITY','Unknown source event section.');for(let i=0;i<rows.length;i++){const row=rows[i];requireRom(row?.index===i&&/^[a-f0-9]{64}$/.test(row.sha256),'INTEGRITY','Invalid source event evidence.');requireRom(++total<=50000,'LIMIT','ROM event inventory exceeds its bound.');}}
 }
 return inventory;
}
