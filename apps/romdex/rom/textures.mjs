import {deflateSync} from 'node:zlib';
import {requireRom,sha256} from './reader.mjs';
const range=(b,o,n)=>{requireRom(Number.isSafeInteger(o)&&o>=0&&Number.isSafeInteger(n)&&n>=0&&o<=b.length&&n<=b.length-o,'BOUNDS','Texture range is outside its source.');return b.subarray(o,o+n);};
function info(b,offset,width){
 range(b,offset,16);const count=b[offset+1],size=b.readUInt16LE(offset+2),entries=offset+12+count*4;
 requireRom(count>0&&count<=128&&size>=16&&offset+size<=b.length&&b.readUInt16LE(offset+4)===8&&b.readUInt16LE(offset+6)===12+count*4&&b.readUInt32LE(offset+8)===383,'INVALID','Invalid Nitro dictionary.');
 range(b,entries,4);requireRom(b.readUInt16LE(entries)===width&&b.readUInt16LE(entries+2)===4+count*width,'INVALID','Invalid Nitro dictionary entry width.');
 const names=entries+4+count*width;requireRom(names+count*16<=offset+size,'BOUNDS','Nitro dictionary names exceed its range.');
 return Array.from({length:count},(_,i)=>({name:range(b,names+i*16,16).toString('latin1').replace(/\0.*$/s,''),data:range(b,entries+4+i*width,width)}));
}
export function readBTX(bytes){
 range(bytes,0,20);requireRom(bytes.toString('ascii',0,4)==='BTX0'&&bytes.readUInt16LE(4)===0xfeff&&bytes.readUInt16LE(6)===1&&bytes.readUInt32LE(8)===bytes.length&&bytes.readUInt16LE(12)===16&&bytes.readUInt16LE(14)===1,'UNSUPPORTED_TEXTURE','Unsupported BTX header.');
 const offset=bytes.readUInt32LE(16),b=range(bytes,offset,bytes.length-offset);range(b,0,60);requireRom(b.toString('ascii',0,4)==='TEX0'&&b.readUInt32LE(4)===b.length,'INVALID','Invalid TEX0 section.');
 const textureData=b.readUInt32LE(20),textureLength=b.readUInt16LE(12)*8,paletteData=b.readUInt32LE(56),paletteLength=b.readUInt16LE(48)*8;
 range(b,textureData,textureLength);range(b,paletteData,paletteLength);
 const textures=info(b,b.readUInt16LE(14),8).map(({name,data})=>{
  const at=data.readUInt16LE(0)*8,params=data.readUInt16LE(2),width=8<<((params>>>4)&7),height=8<<((params>>>7)&7),format=(params>>>10)&7,bpp=[0,8,2,4,8,2,8,16][format],length=width*height*bpp/8;
  requireRom(width*height<=1048576&&format>0,'LIMIT','Texture dimensions/format exceed supported bounds.');
  if(format===5)return {name,width,height,format,transparent:!!(params&8192),unresolved:'Compressed 4x4 texture rendering is not implemented.'};
  requireRom(at+length<=textureLength,'BOUNDS','Texture pixels exceed the image data.');
  return {name,width,height,format,transparent:!!(params&8192),offset:offset+textureData+at,bytes:length,pixels:range(b,textureData+at,length)};
 });
 const paletteEntries=info(b,b.readUInt32LE(52),4),starts=paletteEntries.map(r=>r.data.readUInt16LE(0)*8),sorted=[...new Set([...starts,paletteLength])].sort((a,b)=>a-b);
 const palettes=paletteEntries.map(({name},i)=>{const at=starts[i],end=sorted.find(v=>v>at);requireRom(at<paletteLength&&end!==undefined,'BOUNDS','Invalid texture palette.');return {name,offset:offset+paletteData+at,bytes:end-at,colors:Array.from({length:(end-at)/2},(_,j)=>b.readUInt16LE(paletteData+at+2*j))};});
 return {textures,palettes,sha256:sha256(bytes)};
}
const expand5=v=>(v<<3)|(v>>>2);
const color=v=>[expand5(v&31),expand5((v>>>5)&31),expand5((v>>>10)&31)];
export function renderTexture(texture,palette){
 requireRom(!texture.unresolved,'UNSUPPORTED_TEXTURE',texture.unresolved||'Unsupported texture.');
 const {width,height,format,pixels,transparent}=texture,rgba=Buffer.alloc(width*height*4);requireRom([1,2,3,4,6,7].includes(format)&&width*height<=1048576&&pixels.length===(width*height*[0,8,2,4,8,0,8,16][format])/8,'INVALID','Texture pixel length differs.');
 for(let i=0;i<width*height;i++){
  let c,alpha=255,index;
  if(format===7){c=pixels.readUInt16LE(i*2);alpha=c&32768?255:0;}
  else{
   const value=pixels[i];if(format===1){index=value&31;const a=value>>>5;alpha=expand5((a<<2)|(a>>>1));}
   else if(format===6){index=value&7;alpha=expand5(value>>>3);}
   else{const bits=format===2?2:format===3?4:8;index=(pixels[Math.floor(i*bits/8)]>>>((i*bits)%8))&((1<<bits)-1);if(!index&&transparent)alpha=0;}
   requireRom(palette&&index<palette.colors.length,'BOUNDS','Texture index exceeds its palette.');c=palette.colors[index];
  }
  rgba.set([...color(c),alpha],i*4);
 }
 return {width,height,rgba};
}
function crc32(bytes){let crc=0xffffffff;for(const v of bytes){crc^=v;for(let i=0;i<8;i++)crc=(crc>>>1)^(crc&1?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function chunk(type,bytes){const t=Buffer.from(type),out=Buffer.alloc(bytes.length+12);out.writeUInt32BE(bytes.length);t.copy(out,4);bytes.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([t,bytes])),8+bytes.length);return out;}
export function encodePNG({width,height,rgba}){
 requireRom(Number.isInteger(width)&&width>0&&Number.isInteger(height)&&height>0&&width*height<=1048576&&rgba.length===width*height*4,'INVALID','Invalid PNG dimensions.');
 const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
 const raw=Buffer.alloc(height*(width*4+1));for(let y=0;y<height;y++)rgba.copy(raw,y*(width*4+1)+1,y*width*4,(y+1)*width*4);
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
