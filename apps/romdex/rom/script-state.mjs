import {requireRom} from './reader.mjs';
const constant=n=>({kind:'constant',value:n}),unknown=()=>({kind:'unknown'});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const noWrite=new Set(['NPCMsg','NonNPCMsg','NPCMsgVar','NonNPCMsgVar','MsgBoxExtern','NonNPCMsgExtern','GenderMsgBox','MenuItemAdd','CompareVarToValue','CompareVarToVar','GoTo','GoToIf','Call','CallIf','End','Return','LockAll','ReleaseAll','FacePlayer','CloseMsg','OpenMsg','HoldMsg','WaitButton','WaitABPress','PlaySE','WaitSE','SetFlag','ClearFlag','CheckFlag','SetTrainerFlag','ClearTrainerFlag','ApplyMovement','WaitMovement','TrainerMessage','BufferPlayersName','BufferItemName','BufferSpeciesName','BufferInt','GetStdMsgNaix']);
function transfer(row,input,defaultBank,{menuMessageBank,standardMessageBanks}){
 const out=structuredClone(input),n=row.name,p=row.params,get=v=>v<0x4000?constant(v):out.vars[v]||unknown();
 if(n==='CompareVarToValue'||n==='CompareVarToVar')out.comparison={kind:n,left:{variable:p[0],value:out.vars[p[0]]||unknown()},right:n==='CompareVarToValue'?constant(p[1]):{variable:p[1],value:out.vars[p[1]]||unknown()},producer:row.offset};
 else if(n==='CheckFlag')out.comparison={kind:'flag-set',flag:p[0],producer:row.offset};
 else if(!noWrite.has(n))out.comparison=unknown();
 if(n==='SetVar')out.vars[p[0]]=constant(p[1]);
 else if(n==='CopyVar'||n==='SetOrCopyVar')out.vars[p[0]]=get(p[1]);
 else if(n==='GetStdMsgNaix'){const v=get(p[0]);out.vars[p[1]]=v.kind==='constant'&&v.value<standardMessageBanks.length?constant(standardMessageBanks[v.value]):unknown();}
 else if(n==='MenuInit')out.menuBank=constant(defaultBank);
 else if(n==='MenuInitStdGmm')out.menuBank=constant(menuMessageBank);
 else if(n==='Call'||n==='CallIf'||n==='CallStd'||n==='RunScript'){out.vars={};out.menuBank=unknown();out.comparison=unknown();}
 else if(!noWrite.has(n)){
  // Unknown commands may write any variable operand. Discard knowledge rather than retain a stale value.
  for(const value of p)if(value>=0x4000&&value<=0x80ff)out.vars[value]=unknown();
 }
 return out;
}
function join(a,b){
 const vars={};for(const key of new Set([...Object.keys(a.vars),...Object.keys(b.vars)])){const left=a.vars[key]||unknown(),right=b.vars[key]||unknown();vars[key]=same(left,right)?left:unknown();}
 return {vars,menuBank:same(a.menuBank,b.menuBank)?a.menuBank:unknown(),comparison:same(a.comparison,b.comparison)?a.comparison:unknown()};
}
export function analyzeScriptState(graph,defaultBank,{maxIterations=100000,menuMessageBank=191,standardMessageBanks=[752,211,30,435]}={}){
 const byOffset=new Map(graph.instructions.map(n=>[n.offset,n])),edges=new Map(),states=new Map(),queue=[...graph.roots];let steps=0;
 for(const edge of graph.edges){if(!edges.has(edge.from))edges.set(edge.from,[]);edges.get(edge.from).push(edge);}
 for(const root of graph.roots)states.set(root,{vars:{},menuBank:unknown(),comparison:unknown()});
 while(queue.length){
  requireRom(++steps<=maxIterations,'LIMIT','Script state analysis exceeded its convergence budget.');
  const offset=queue.shift(),row=byOffset.get(offset);if(!row)continue;const output=transfer(row,states.get(offset),defaultBank,{menuMessageBank,standardMessageBanks});
  for(const edge of edges.get(offset)||[]){
   if(!byOffset.has(edge.to))continue;
   const candidate=edge.kind==='return-continuation'?{vars:{},menuBank:unknown(),comparison:unknown()}:output;
   const previous=states.get(edge.to),merged=previous?join(previous,candidate):structuredClone(candidate);
   if(!previous||!same(previous,merged)){states.set(edge.to,merged);queue.push(edge.to);}
  }
 }
 return {at:offset=>structuredClone(states.get(offset)||{vars:{},menuBank:unknown(),comparison:unknown()}),operand:(offset,value)=>value<0x4000?constant(value):structuredClone(states.get(offset)?.vars[value]||unknown())};
}
