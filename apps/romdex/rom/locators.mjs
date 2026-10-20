import {requireRom,sha256} from './reader.mjs';
import {HGSS_ADAPTER,PROFILES} from './profiles.mjs';
const integer=v=>Number.isSafeInteger(v)&&v>=0;
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
async function sourceInfo(rom,selectors,path){
 if(selectors.sourceType==='file'){
  const f=rom.fileInfo(selectors.fileId);requireRom(path===(f.path||'__rom__/file/'+f.fileId+'.bin'),'INTEGRITY','ROM resource path differs from its ID.');return {...f,hash:await rom.fileHash(f.fileId)};
 }
 requireRom(['arm9','overlay'].includes(selectors.sourceType),'INVALID','Unknown ROM locator source type.');
 const f=await rom.systemInfo(selectors.sourceType,selectors.overlayId);requireRom(path===f.path,'INTEGRITY','ROM system resource path differs.');
 return {...f,hash:await rom.systemHash(selectors.sourceType,selectors.overlayId)};
}
export async function makeLocator(rom,{kind,sourceType='file',fileId,overlayId,memberId,offset=0,bytes,selectors={}}){
 requireRom(['map','event','script','message','asset','source-document'].includes(kind),'INVALID','Invalid native locator kind.');
 requireRom(selectors&&typeof selectors==='object'&&!Array.isArray(selectors)&&!['sourceType','fileId','overlayId','memberId','byteOffset','byteLength','selectionSHA256'].some(k=>Object.hasOwn(selectors,k)),'INVALID','Reserved ROM locator selectors must use explicit source arguments.');
 const info=sourceType==='file'?rom.fileInfo(fileId):await rom.systemInfo(sourceType,overlayId),path=info.path||'__rom__/file/'+info.fileId+'.bin';
 const base={...selectors,sourceType,...(sourceType==='file'?{fileId:info.fileId}:{}),...(sourceType==='overlay'?{overlayId}:{}),...(memberId!==undefined?{memberId}:{})};
 let start=info.offset,length=info.bytes;
 if(memberId!==undefined){requireRom(sourceType==='file'&&integer(memberId),'INVALID','NARC selector needs a file and member ID.');const a=await rom.narc(fileId),m=a.members[memberId];requireRom(m,'NOT_FOUND','ROM locator member is missing.');start=m.offset;length=m.bytes;}
 requireRom(integer(offset)&&integer(bytes)&&bytes>0&&offset<=length&&bytes<=length-offset,'BOUNDS','ROM locator span is outside its resource.');
 const selected=await rom.read(start+offset,bytes),sourceHash=sourceType==='file'?await rom.fileHash(info.fileId):await rom.systemHash(sourceType,overlayId);
 return {kind,adapter:HGSS_ADAPTER,path,fileSha256:sourceHash,selectors:{...base,byteOffset:offset,byteLength:bytes,selectionSHA256:sha256(selected)}};
}
export async function resolveLocator(rom,locator,expectedRomSHA256){
 requireRom(hash(expectedRomSHA256),'INVALID','A pinned ROM fingerprint is required.');
 requireRom((await rom.fingerprint()).sha256===expectedRomSHA256,'SOURCE_CHANGED','This locator belongs to a different ROM revision.');
 requireRom(locator?.adapter===HGSS_ADAPTER&&['map','event','script','message','asset','source-document'].includes(locator.kind)&&hash(locator.fileSha256)&&typeof locator.path==='string'&&locator.selectors&&typeof locator.selectors==='object'&&!Array.isArray(locator.selectors),'INVALID','Invalid ROM locator.');
 const s=locator.selectors;requireRom(Object.values(s).every(v=>typeof v==='string'||integer(v)),'INVALID','Invalid ROM locator selector.');
 const info=await sourceInfo(rom,s,locator.path);requireRom(info.hash===locator.fileSha256,'INTEGRITY','ROM resource hash differs from its locator.');
 let start=info.offset,length=info.bytes;
 if(Object.hasOwn(s,'memberId')){requireRom(s.sourceType==='file'&&integer(s.memberId),'INVALID','Invalid NARC locator.');const member=(await rom.narc(s.fileId)).members[s.memberId];requireRom(member,'NOT_FOUND','ROM locator member is missing.');start=member.offset;length=member.bytes;}
 requireRom(integer(s.byteOffset)&&integer(s.byteLength)&&s.byteLength>0&&s.byteOffset<=length&&s.byteLength<=length-s.byteOffset&&hash(s.selectionSHA256),'BOUNDS','ROM locator selection is outside its resource.');
 const profile=PROFILES.find(p=>p.sha256===expectedRomSHA256);
 if(profile&&Object.hasOwn(s,'mapHeaderId')){
  const count=rom.fileInfo(profile.internalNames).bytes/profile.internalNameWidth;requireRom(integer(s.mapHeaderId)&&s.mapHeaderId<count,'INVALID_REFERENCE','Locator map header is outside the catalog.');
  const headerOffset=profile.headerOffset+s.mapHeaderId*24,header=await rom.read(rom.header.arm9.offset+headerOffset,24);
  if(locator.kind==='map')requireRom(s.sourceType==='arm9'&&s.byteOffset===headerOffset&&s.byteLength===24,'INTEGRITY','Map locator selects a different header.');
  if(locator.kind==='event'){
   requireRom(s.sourceType==='file'&&locator.path===profile.archives.events&&s.memberId===header.readUInt16LE(16)&&s.eventBank===s.memberId,'INTEGRITY','Event locator does not match its map header.');
   if(Object.hasOwn(s,'eventKind')||Object.hasOwn(s,'eventIndex')){
    const event=await rom.member(s.fileId,s.memberId),widths={backgrounds:20,overworlds:32,warps:12,triggers:16};let at=0,matched=false;
    for(const [kind,width]of Object.entries(widths)){requireRom(at+4<=event.length,'BOUNDS','Truncated event locator source.');const count=event.readUInt32LE(at);at+=4;requireRom(count<=Math.floor((event.length-at)/width),'BOUNDS','Invalid event locator source range.');if(kind===s.eventKind){requireRom(integer(s.eventIndex)&&s.eventIndex<count&&s.byteOffset===at+s.eventIndex*width&&s.byteLength===width,'INTEGRITY','Event locator selects a different event row.');matched=true;}at+=count*width;}
    requireRom(matched&&at===event.length,'INTEGRITY','Unknown event locator section.');
   }
  }
 }
 const bytes=await rom.read(start+s.byteOffset,s.byteLength);requireRom(sha256(bytes)===s.selectionSHA256,'INTEGRITY','ROM locator bytes differ.');await rom.assertUnchanged();return bytes;
}
