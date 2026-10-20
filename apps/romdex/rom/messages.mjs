import fs from 'node:fs';
import {requireRom,sha256} from './reader.mjs';
const facts=JSON.parse(fs.readFileSync(new URL('./format-tables.json',import.meta.url),'utf8'));
const chars=facts.westernCharacters;
export function decodeMessage(bank,index,{maxWords=65536}={}){
 requireRom(Buffer.isBuffer(bank)&&bank.length>=4,'BOUNDS','Truncated message bank.');
 const count=bank.readUInt16LE(0),key=bank.readUInt16LE(2);
 requireRom(count<=8192&&4+count*8<=bank.length&&Number.isInteger(index)&&index>=0&&index<count,'BOUNDS','Message table/index is outside its bank.');
 const mask=((765*(index+1)*key)&65535)*65537,offset=(bank.readUInt32LE(4+index*8)^mask)>>>0,length=(bank.readUInt32LE(8+index*8)^mask)>>>0;
 requireRom(length>0&&length<=maxWords&&offset>=4+count*8&&length*2<=bank.length-offset,'BOUNDS','Message range or word budget is invalid.');
 let seed=((index+1)*596947)&65535;const words=[];
 for(let i=0;i<length;i++){words.push(bank.readUInt16LE(offset+2*i)^seed);seed=(seed+18749)&65535;}
 requireRom(words.at(-1)===65535,'INVALID','Message terminator is missing.');
 let codes=words,tokens=[],text='',i=0,compressed=false,ended=false;
 if(words[0]===0xf100){
  compressed=true;codes=[];let accumulator=0,bits=0,terminated=false;
  // The final FFFF also supplies packed sentinel bits when it straddles a word.
  for(let p=1;p<words.length&&!terminated;p++){requireRom(words[p]<0x8000||p===words.length-1,'INVALID','Compressed text contains a non-payload word.');accumulator|=(words[p]&0x7fff)<<bits;bits+=15;while(bits>=9){const v=accumulator&511;accumulator>>>=9;bits-=9;if(v===511){terminated=true;break;}codes.push(v);}}
  requireRom(terminated,'INVALID','Compressed trainer-name terminator is missing.');codes.push(65535);
 }
 while(i<codes.length){
  const at=i,code=codes[i++];if(code===65535){ended=true;break;}
  if(code===65534){
   requireRom(i+2<=codes.length,'BOUNDS','Truncated message control header.');const command=codes[i++],n=codes[i++];
   requireRom(n<=32&&i+n<codes.length,'BOUNDS','Truncated/oversized message control arguments.');const args=codes.slice(i,i+n);i+=n;tokens.push({kind:'control',word:at,command,args});text+='[CTRL:'+command.toString(16).padStart(4,'0')+':'+args.join(',')+']';
  }else if(Object.hasOwn(chars,code)){const value=chars[code];tokens.push({kind:'character',word:at,code,value});text+=value;}
  else{tokens.push({kind:'unknown-character',word:at,code});text+='[U16:'+code.toString(16).padStart(4,'0')+']';}
 }
 requireRom(ended,'INVALID','Message did not terminate.');
 requireRom(compressed||i===codes.length,'INVALID','Message has words after an early terminator.');
 const raw=Buffer.alloc(words.length*2);words.forEach((v,j)=>raw.writeUInt16LE(v,j*2));
 return {index,offset,bytes:length*2,compressed,text,tokens,wordSHA256:sha256(raw),encryptedSHA256:sha256(bank.subarray(offset,offset+length*2)),unknownCodes:[...new Set(tokens.filter(t=>t.kind==='unknown-character').map(t=>t.code))]};
}
