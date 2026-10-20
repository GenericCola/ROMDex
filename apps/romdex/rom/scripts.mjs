import fs from 'node:fs';
import {requireRom,sha256} from './reader.mjs';
const definitions=JSON.parse(fs.readFileSync(new URL('./format-tables.json',import.meta.url),'utf8')).commands;
const branchNames=new Set(['GoTo','GoToIf','Call','CallIf','ObjectGoTo','BGGoTo','DirectionGoTo','GoToIfTrainerDefeated']);
export function scriptEntries(bytes,{maxEntries=8192}={}){
 const entries=[];let at=0;
 while(at+2<=bytes.length&&bytes.readUInt16LE(at)!==0xfd13){
  requireRom(at+4<=bytes.length&&entries.length<maxEntries,'BOUNDS','Truncated or oversized script entry table.');entries.push(at+4+bytes.readInt32LE(at));at+=4;
 }
 requireRom(at+2<=bytes.length&&bytes.readUInt16LE(at)===0xfd13,'INVALID','Script entry table has no terminator.');
 requireRom(entries.every(v=>v>=at+2&&v+2<=bytes.length),'BOUNDS','Script entry points outside executable data.');return {entries,bytes:at+2};
}
export function decodeInstruction(bytes,offset){
 requireRom(Number.isSafeInteger(offset)&&offset>=0&&offset+2<=bytes.length,'BOUNDS','Script instruction is outside its member.');
 const opcode=bytes.readUInt16LE(offset);let definition=definitions[opcode],widths=definition?.widths;
 if(opcode===465||opcode===489){
  requireRom(offset+4<=bytes.length,'BOUNDS','Truncated variable-length command.');const action=bytes.readUInt16LE(offset+2);
  if(opcode===465){requireRom(action<=7,'UNSUPPORTED_OPCODE','Unknown friend-group subcommand.');widths=[2,...Array(action<=3?2:action===6?0:1).fill(2)];}
  else{requireRom(action<=8,'UNSUPPORTED_OPCODE','Unknown mystery-gift subcommand.');widths=[2,...Array(action>=1&&action<=3?1:action===5||action===6?2:0).fill(2)];}
  definition={name:opcode===465?'ScrCmd_465':'MysteryGift'};
 }
 requireRom(definition&&Array.isArray(widths),'UNSUPPORTED_OPCODE','Command width is not established.',{offset,opcode});
 const end=offset+2+widths.reduce((a,b)=>a+b,0);requireRom(end<=bytes.length,'BOUNDS','Truncated script operands.');let at=offset+2;
 const params=widths.map(w=>{const value=bytes.readUIntLE(at,w);at+=w;return value;});
 const row={offset,bytes:end-offset,opcode,name:definition.name,params,sha256:sha256(bytes.subarray(offset,end))};
 if(branchNames.has(row.name)||row.name==='ApplyMovement'){const p=params.at(-1);row.target=end+(p|0);}
 return row;
}
export function decodeScriptGraph(bytes,roots,{maxInstructions=20000}={}){
 const nodes=new Map(),edges=[],unresolved=[],queue=[...roots],occupied=new Map();
 const edge=(from,to,kind,condition=null)=>{edges.push({from,to,kind,...(condition?{condition}:{})});queue.push(to);};
 while(queue.length){
  const start=queue.pop();if(nodes.has(start))continue;
  requireRom(!occupied.has(start),'INVALID','A branch targets the middle of another instruction.');
  requireRom(nodes.size<maxInstructions,'LIMIT','Script graph exceeded its instruction budget.');
  let row;try{row=decodeInstruction(bytes,start);}catch(e){if(!['UNSUPPORTED_OPCODE','BOUNDS'].includes(e.code))throw e;unresolved.push({offset:start,code:e.code,message:e.message,...e.details});continue;}
  for(let p=start;p<start+row.bytes;p++){requireRom(!occupied.has(p)||occupied.get(p)===start,'INVALID','A branch targets the middle of another instruction.');occupied.set(p,start);}
  nodes.set(start,row);const next=start+row.bytes,n=row.name;
  if(branchNames.has(n)){
   if(n==='GoToIf'||n==='CallIf')requireRom(row.params[0]<=5,'INVALID','Invalid comparison condition.');
   const conditional=!['GoTo','Call'].includes(n),call=n==='Call'||n==='CallIf';
   edge(start,row.target,call?'call':'branch',conditional?{kind:['GoToIf','CallIf'].includes(n)?'comparison-result':n,operands:row.params.slice(0,-1)}:null);
   if(n!=='GoTo')edge(start,next,call?'return-continuation':'fallthrough',conditional?{kind:'not-taken',branchOffset:start}:null);
  }else if(!['End','Return','RestartCurrentScript'].includes(n))edge(start,next,'next');
 }
 return {roots:[...roots],instructions:[...nodes.values()].sort((a,b)=>a.offset-b.offset),edges,unresolved};
}
export function decodeLevelScripts(bytes){
 const hooks=[];let at=0;
 while(at<bytes.length&&bytes[at]!==0){
  requireRom(at+5<=bytes.length&&hooks.length<32,'BOUNDS','Truncated level-script hook.');const type=bytes[at],value=bytes.readUInt32LE(at+1),offset=at;at+=5;
  if(type!==1){hooks.push({offset,bytes:5,type,scriptNumber:value&65535});continue;}
  if(!value){hooks.push({offset,bytes:5,type,conditions:[]});continue;}
  let p=at+value;const conditions=[];
  while(true){
   requireRom(p+2<=bytes.length&&conditions.length<4096,'BOUNDS','Invalid level-script scene table.');const left=bytes.readUInt16LE(p);if(!left)break;
   requireRom(p+6<=bytes.length,'BOUNDS','Truncated level-script predicate.');conditions.push({offset:p,bytes:6,left,right:bytes.readUInt16LE(p+2),scriptNumber:bytes.readUInt16LE(p+4),operator:'equal'});p+=6;
  }
  hooks.push({offset,bytes:5,type,conditions});
 }
 requireRom(at<bytes.length,'BOUNDS','Unterminated level-script hooks.');return hooks;
}
export function resolveScriptNumber(number,context,namespaces){
 requireRom(Number.isInteger(number)&&number>=0&&number<=65535,'INVALID_REFERENCE','Invalid event script number.');
 for(const row of namespaces)if(number>=row.minimum)return {scriptBank:row.scriptBank,messageBank:row.messageBank,entry:number-row.minimum};
 return number?{...context,entry:number-1}:{scriptBank:140,messageBank:184,entry:0};
}
export function spriteReference(id){return id>=101&&id<=117?{kind:'variable',variable:0x4020+id-101}:{kind:'static',tableId:id};}
