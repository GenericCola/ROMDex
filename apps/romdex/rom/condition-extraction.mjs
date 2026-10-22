import {canonical,sha} from '../content/contracts.mjs';
import {requireRom} from './reader.mjs';

const truth=value=>({op:'constant',value}),keys=new WeakMap(),key=v=>{if(!keys.has(v))keys.set(v,canonical(v));return keys.get(v);},same=(a,b)=>key(a)===key(b);
const known=v=>v.op!=='unknown'&&(v.op==='not'?known(v.arg):['all','any'].includes(v.op)?v.args.every(known):true);
export function negate(value){if(value.op==='constant')return truth(!value.value);if(value.op==='not')return value.arg;if(value.op==='flag')return {...value,state:value.state==='set'?'unset':'set'};return {op:'not',arg:value};}
export function combine(op,values){
 const out=[];for(const v of values){if(v.op==='constant'){if(v.value===(op==='any'))return v;continue;}for(const x of v.op===op?v.args:[v])if(!out.some(y=>same(x,y)))out.push(x);}
 for(const x of out)if(known(x)&&out.some(y=>same(y,negate(x))))return truth(op==='any');
 if(op==='any')for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){
  const a=out[i].op==='all'?out[i].args:[out[i]],b=out[j].op==='all'?out[j].args:[out[j]],common=a.filter(x=>b.some(y=>same(x,y))),left=a.filter(x=>!common.includes(x)),right=b.filter(x=>!common.some(y=>same(x,y)));
  if(!left.length||!right.length)return combine('any',[...out.filter((_,n)=>n!==i&&n!==j),combine('all',!left.length?a:b)]);
  if(left.length===1&&right.length===1&&known(left[0])&&same(negate(left[0]),right[0]))return combine('any',[...out.filter((_,n)=>n!==i&&n!==j),combine('all',common)]);
 }
 return !out.length?truth(op==='all'):out.length===1?out[0]:{op,args:out.sort((a,b)=>key(a).localeCompare(key(b)))};
}
const hex=n=>'0x'+n.toString(16).toUpperCase().padStart(4,'0');
const comparators=['lt','eq','gt','lte','gte','ne'];
const compare=(a,b,op)=>({lt:a<b,eq:a===b,gt:a>b,lte:a<=b,gte:a>=b,ne:a!==b})[op];
const constant=value=>({term:'constant',value}),variable=id=>({term:'variable',variableId:hex(id)});
const source=(flow,row)=>({flow,offset:row?.offset??null,locator:row?.locator??null});
export const conditionRootKey=root=>canonical([root.kind,root.headerId,root.sourceId??null,root.flow,root.predicate??null,root.hookType??null]);
const unresolved=(reason,refs)=>({op:'unknown',reason,sourceRefs:refs});
const termUnknown=(reason,refs)=>({term:'unknown',reason,sourceRefs:refs});
const safe=new Set(['Noop','Dummy','End','Return','GoTo','GoToIf','Call','CallIf','CallStd','RunScript','LockAll','ReleaseAll','Lock','Release','FacePlayer','NPCMsg','NonNPCMsg','NPCMsgVar','NonNPCMsgVar','MsgBoxExtern','NonNPCMsgExtern','GenderMsgBox','TrainerTips','DirectionSignpost','OpenMsg','CloseMsg','HoldMsg','WaitABPress','WaitButton','WaitButtonOrDpad','ApplyMovement','WaitMovement','SetObjectFacing','SetObjectMovementType','MovePerson','ShowPerson','HidePerson','MenuInit','MenuInitStdGmm','MenuItemAdd','MenuItemAddAlt','GetStdMsgNaix']);
const cosmetic=n=>safe.has(n)||/^Buffer/.test(n)||/^(?:PlaySE|StopSE|WaitSE|PlayCry|WaitCry|PlayFanfare|WaitFanfare|PlayBGM|StopBGM|ResetBGM|FadeOutBGM|FadeInBGM|TempBGM|FadeScreen|WaitFade)$/.test(n);

// Static, bounded path analysis. It never executes VM bytecode or simulates a save.
// Raw evidence is resolved into pinned native mapping refs during compilation.
export function extractConditions(extraction,{maxStates=20000,maxStatesPerRoot=1500,maxCallDepth=16,maxEffects=20000,check=()=>{},progress=()=>{}}={}){
 requireRom(extraction?.source?.sha256&&Array.isArray(extraction.flows)&&Array.isArray(extraction.roots),'INVALID','Condition extraction requires pinned script graphs.');
 const flows=new Map(extraction.flows.map(f=>[f.key,{...f,byOffset:new Map(f.instructions.map(r=>[r.offset,r]))}]));
 const calls=new Map((extraction.flowReferences||[]).map(c=>[c.from+':'+c.offset,c]));
 const effects=[],coverage=[],warnings=[],conditions=new Map();let steps=0;
 const identity=parts=>'rom-condition:'+sha(canonical([extraction.identities?.projectId,extraction.testbed.key,...parts])).slice(0,40);
 function atoms(expr){return ['all','any'].includes(expr.op)?expr.args.flatMap(atoms):expr.op==='not'?atoms(expr.arg):expr.op==='constant'?[]:[expr];}
 function register(effect){
  const ids=[];for(const atom of atoms(effect.requires)){
   const normalized=atom.op==='flag'?{...atom,state:'set'}:atom,key=canonical(normalized),id=identity(['condition',normalized]);
   if(!conditions.has(key))conditions.set(key,{id,label:atom.op==='flag'?'Flag '+atom.flagId:atom.op==='variable'?'Variable '+atom.variableId+' '+atom.compare+' '+atom.value:atom.op==='runtime'?atom.check+' '+atom.compare+' '+atom.value:'Unresolved: '+atom.reason,labelOrigin:'raw-id',expression:normalized,sourceRefs:[]});
   const c=conditions.get(key);for(const ref of effect.sourceRefs)if(!c.sourceRefs.some(r=>same(r,ref)))c.sourceRefs.push(ref);if(!ids.includes(id))ids.push(id);
  }effect.conditionIds=ids;return effect;
 }
 const appearanceById=new Map((extraction.appearances||[]).map(a=>[a.sourceId,a]));
 for(const a of extraction.appearances||[]){const ref={flow:null,offset:null,locator:a.visibility?.locator??a.locator??null},flag=a.visibility?.flag||0;effects.push({id:identity(['presence',a.sourceId]),rootKey:null,kind:'presence',sourceId:a.sourceId,headerId:a.headerId,flow:null,offset:null,messageIndex:null,requires:flag?{op:'flag',flagId:hex(flag),state:'unset'}:truth(true),sourceRefs:[ref]});}
 const bound=extraction.roots.filter(r=>r.kind!=='local-entry'&&!r.unbound);
 for(const root of bound){
  const rootKey=conditionRootKey(root),notes=new Set(),sites=new Map();let rootSteps=0;
  const rootFlow=flows.get(root.flow),rootRow=rootFlow?.byOffset.get(rootFlow.entryOffset??rootFlow.roots?.[0]??rootFlow.instructions[0]?.offset),ref=source(root.flow,rootRow),rootRef={...ref,locator:root.locator??ref.locator};
  const a=appearanceById.get(root.sourceId),presence=a?.visibility?.flag?{op:'flag',flagId:hex(a.visibility.flag),state:'unset'}:truth(true);
  const entry=root.predicate?{op:'variable',variableId:hex(root.predicate.left),compare:'eq',value:root.predicate.right}:truth(true),guard=combine('all',[presence,entry]);
  const initial={flow:root.flow,offset:rootRow?.offset,guard,vars:{},flags:{},comparison:null,taint:null,stack:[],visited:new Set(),trace:[rootRef]};
  const queue=[initial];
  function unknown(reason,refs=[rootRef]){notes.add(reason);return unresolved(reason,refs);}
  function read(s,v,pointer=false){if(!pointer&&v<0x4000)return constant(v);return s.vars[v]??(s.taint?termUnknown(s.taint,s.taintRefs||s.trace.slice(-1)):v>=0x8000?termUnknown('Scratch variable '+hex(v)+' has no established caller value.',s.trace.slice(-1)):variable(v));}
  function testTerms(left,right,op,refs){
   if(left.term==='unknown'||right.term==='unknown')return unknown(left.reason||right.reason,[...refs,...left.sourceRefs||[],...right.sourceRefs||[]]);
   if(left.term==='constant'&&right.term==='constant')return truth(compare(left.value,right.value,op));
   if(left.term==='boolean'&&right.term==='constant'){
    const zero=compare(0,right.value,op),one=compare(1,right.value,op);return zero===one?truth(zero):one?left.expression:negate(left.expression);
   }
   if(left.term==='variable'&&right.term==='constant')return {op:'variable',variableId:left.variableId,compare:op,value:right.value};
   if(left.term==='runtime'&&right.term==='constant')return {op:'runtime',check:left.check,arguments:left.arguments,compare:op,value:right.value};
   if(left.term==='constant'&&['variable','runtime'].includes(right.term))return testTerms(right,left,({lt:'gt',lte:'gte',gt:'lt',gte:'lte',eq:'eq',ne:'ne'})[op],refs);
   if(same(left,right))return truth(compare(0,0,op));
   return unknown('A comparison between runtime values is not statically resolved.',refs);
  }
  function branch(s,row){
   const refs=[source(s.flow,row)],op=comparators[row.params?.[0]],c=s.comparison;if(!op||!c)return unknown('Comparison result is not established at '+s.flow+':'+row.offset,[...refs,...s.taintRefs||[]]);
   if(c.boolean){const zero=compare(0,1,op),one=compare(1,1,op);return zero===one?truth(zero):one?c.boolean:negate(c.boolean);}
   return testTerms(c.left,c.right,op,refs);
  }
  function emit(s,row,kind,messageIndex=null,subject=null){
   const key=canonical([kind,s.flow,row.offset,messageIndex,subject]),refs=[...s.trace,source(s.flow,row)],existing=sites.get(key);
   if(existing){
    if(existing.pathCount++>=32){existing.requires=combine('all',[guard,unknown('Alternative-path guard budget reached; this site requires review.',refs.slice(-1))]);existing.pathsUnresolved=true;}
    else if(!existing.pathsUnresolved)existing.requires=combine('any',[existing.requires,s.guard]);
    for(const r of refs)if(existing.sourceRefs.length<128&&!existing.sourceRefs.some(x=>same(x,r)))existing.sourceRefs.push(r);
   }
   else{requireRom(effects.length+sites.size<maxEffects,'LIMIT','Condition effects exceed their bound.');sites.set(key,{id:identity(['effect',rootKey,key]),rootKey,kind,sourceId:subject??root.sourceId??null,headerId:root.headerId,flow:s.flow,offset:row.offset,messageIndex,action:row.name,requires:s.guard,sourceRefs:refs,pathCount:1});}
  }
  function next(s,offset,extra={}){if(offset!==undefined)queue.push({...s,...extra,offset});}
  while(queue.length){
   if(++steps%16===0)check();if(++rootSteps>maxStatesPerRoot||steps>maxStates){notes.add('Static path budget reached; remaining paths are unresolved.');break;}
   const s=queue.pop();if(s.guard.op==='constant'&&!s.guard.value)continue;
   const flow=flows.get(s.flow),row=flow?.byOffset.get(s.offset);if(!row){notes.add('A reachable instruction or shared flow is unresolved.');continue;}
   const visit=canonical([s.flow,s.offset,s.stack.map(f=>[f.flow,f.offset])]);if(s.visited.has(visit)){notes.add('Loop/repeated path requires runtime iteration; no further dialogue is inferred.');continue;}
   const visited=new Set(s.visited);visited.add(visit);const current={...s,visited,vars:{...s.vars},flags:{...s.flags}},n=row.name,p=row.params||[],refs=[source(s.flow,row)],after=row.offset+(row.bytes??1);
   for(const [i,message]of (row.messageReferences||[]).entries())if(['dialogue','sign'].includes(message.role)||message.dynamic){const at=message.dynamic?{...current,guard:combine('all',[current.guard,unknown('Text reference requires runtime/caller state.',refs)])}:current;emit(at,row,'dialogue',i);}
   if(['ShowPerson','HidePerson'].includes(n)){
    const operand=read(current,p[0]),subject=operand.term==='constant'&&(extraction.appearances||[]).find(a=>a.headerId===root.headerId&&a.localId===operand.value);
    if(subject)emit(current,row,'presence',null,subject.sourceId);else{notes.add(n+' target placement requires runtime context.');emit(current,row,'script');}
   }else if(['SetFlag','ClearFlag','SetVar','SetFlagVar','ClearFlagVar','SetTrainerFlag','ClearTrainerFlag'].includes(n))emit(current,row,'script');
   if(n==='End'||n==='Return'){
    if(current.stack.length){const stack=current.stack.slice();let frame=stack.pop();if(n==='End')while(frame&&!frame.context)frame=stack.pop();if(frame)next(current,frame.offset,{flow:frame.flow,stack,...(frame.context?{comparison:frame.comparison}:{} )});}
    continue;
   }
   if(n==='RestartCurrentScript'){notes.add('Script restart/return context is unresolved.');continue;}
   if(['GoTo','Call','GoToIf','CallIf'].includes(n)){
    const conditional=n==='GoToIf'||n==='CallIf',isCall=n==='Call'||n==='CallIf',predicate=conditional?branch(current,row):truth(true),trace=[...current.trace,...refs];
    if(conditional)next(current,after,{guard:combine('all',[current.guard,negate(predicate)]),trace});
    const taken={...current,guard:combine('all',[current.guard,predicate]),trace};
    if(isCall){if(current.stack.length>=maxCallDepth){notes.add('Script call-depth budget reached.');continue;}taken.stack=[...current.stack,{flow:current.flow,offset:after,context:false}];}
    next(taken,row.target);continue;
   }
   if(['ObjectGoTo','BGGoTo','DirectionGoTo','GoToIfTrainerDefeated'].includes(n)){
    const predicate=unknown('Interaction dispatch '+n+' requires runtime context.',refs),trace=[...current.trace,...refs];next(current,row.target,{guard:combine('all',[current.guard,predicate]),trace});next(current,after,{guard:combine('all',[current.guard,negate(predicate)]),trace});continue;
   }
   if(n==='CallStd'||n==='RunScript'){
    const link=calls.get(current.flow+':'+row.offset),child=flows.get(link?.flow),start=child?.entryOffset??child?.roots?.[0]??child?.instructions[0]?.offset;
    if(!child||current.stack.length>=maxCallDepth){current.guard=combine('all',[current.guard,unknown('Shared call target or call-depth is unresolved.',refs)]);current.vars={};current.flags={};current.comparison=null;current.taint='Unresolved shared call may change runtime state.';current.taintRefs=refs;next(current,after);continue;}
    if(n==='RunScript'){
     const predicate=unknown('RunScript executes a separate concurrent context; scheduling is unresolved.',refs);
     queue.push({...current,flow:child.key,offset:start,guard:combine('all',[current.guard,predicate]),comparison:null,stack:[],trace:[...current.trace,...refs]});
     next(current,after,{vars:{},flags:{},comparison:null,taint:'Concurrent script may change runtime state.',taintRefs:refs});continue;
    }
    queue.push({...current,flow:child.key,offset:start,comparison:null,stack:[...current.stack,{flow:current.flow,offset:after,context:true,comparison:current.comparison}],trace:[...current.trace,...refs]});continue;
   }
   if(n==='CheckFlag'||n==='CheckTrainerFlag'){
    const flag=n==='CheckFlag'?constant(p[0]):read(current,p[0]),prefix=n==='CheckTrainerFlag'?'trainer:':'';
    const expr=flag.term!=='constant'?unknown('Dynamic flag identifier is unresolved.',refs):current.flags[prefix+flag.value]!==undefined?truth(current.flags[prefix+flag.value]):current.taint?unknown(current.taint,[...refs,...current.taintRefs||[]]):{op:'flag',flagId:prefix+hex(flag.value),state:'set'};current.comparison={boolean:expr};
   }else if(n==='CheckFlagVar'){
    const flag=read(current,p[0],true),expr=flag.term!=='constant'?unknown('Variable flag read requires unresolved runtime state.',[...refs,...flag.sourceRefs||[]]):current.flags[flag.value]!==undefined?truth(current.flags[flag.value]):!current.taint?{op:'flag',flagId:hex(flag.value),state:'set'}:unknown(current.taint,[...refs,...current.taintRefs||[]]);current.vars[p[1]]={term:'boolean',expression:expr};
   }else if(n==='CompareVarToValue'||n==='CompareVarToVar')current.comparison={left:read(current,p[0],true),right:n==='CompareVarToValue'?constant(p[1]):read(current,p[1],true)};
   else if(n==='SetVar')current.vars[p[0]]=constant(p[1]);
   else if(n==='CopyVar'||n==='SetOrCopyVar')current.vars[p[0]]=read(current,p[1],n==='CopyVar');
   else if(n==='AddVar'||n==='SubVar'){const a=read(current,p[0],true),b=read(current,p[1]);current.vars[p[0]]=a.term==='constant'&&b.term==='constant'?constant((a.value+(n==='AddVar'?b.value:-b.value))&65535):termUnknown('Arithmetic over runtime values is unresolved.',refs);}
   else if(n==='GetPlayerGender')current.vars[p[0]]={term:'runtime',check:'gender',arguments:{domain:'HGSS-player-gender',male:0,female:1}};
   else if(n==='GetWeekday')current.vars[p[0]]={term:'runtime',check:'time',arguments:{part:'weekday',domain:'NDS-RTC-weekday'}};
   else if(n==='GetStdMsgNaix'){current.vars[p[1]]=termUnknown('Standard message-bank lookup is not an access condition.',refs);}
   else if(n==='SetFlagVar'||n==='ClearFlagVar'){const flag=read(current,p[0],true);if(flag.term==='constant')current.flags[flag.value]=n==='SetFlagVar';else{current.flags={};current.taint='Dynamic flag mutation is unresolved.';current.taintRefs=refs;notes.add(current.taint);}}
   else if(['SetFlag','ClearFlag','SetTrainerFlag','ClearTrainerFlag'].includes(n)){const flag=n.includes('Trainer')?read(current,p[0]):constant(p[0]);if(flag.term==='constant')current.flags[(n.includes('Trainer')?'trainer:':'')+flag.value]=n.startsWith('Set');else{current.flags={};current.taint='Dynamic flag mutation is unresolved.';current.taintRefs=refs;notes.add(current.taint);}}
   else if(!cosmetic(n)){
    current.comparison=null;for(const v of p)if(v>=0x4000&&v<=0x80ff)current.vars[v]=termUnknown('Output of '+n+' requires unsupported native semantics.',refs);
    // Do not pretend that later reads still describe the initial game state.
    current.vars={};current.flags={};current.taint='Native command '+n+' may change state.';current.taintRefs=refs;notes.add(current.taint);
   }
   next(current,after);
  }
  if(root.kind==='scene-hook'||root.kind==='load-hook')effects.push({id:identity(['hook',rootKey]),rootKey,kind:root.kind==='scene-hook'?'scene':'script',sourceId:null,headerId:root.headerId,flow:root.flow,offset:rootRow?.offset??null,messageIndex:null,requires:guard,sourceRefs:[rootRef]});
  effects.push(...sites.values());coverage.push({rootKey,sourceId:root.sourceId??null,headerId:root.headerId,flow:root.flow,status:notes.size?'partial':'complete',reasons:[...notes].sort(),states:rootSteps});
  for(const reason of notes)warnings.push({rootKey,headerId:root.headerId,reason});
  progress({stage:'map-conditions',completed:coverage.length,total:bound.length,states:steps});
 }
 for(const effect of effects)register(effect);
 // Intern exact locators once. Repeating a complete NARC locator at every
 // branch/call/condition inflated a small map into megabytes of duplicate JSON.
 const evidence={},intern=ref=>{const id='source:'+sha(canonical(ref)).slice(0,40);evidence[id]??=ref;return id;},encoded=new WeakMap();
 const expression=v=>{if(encoded.has(v))return encoded.get(v);const out=v.op==='unknown'?{...v,sourceRefs:v.sourceRefs.map(intern)}:v.op==='not'?{...v,arg:expression(v.arg)}:['all','any'].includes(v.op)?{...v,args:v.args.map(expression)}:v;encoded.set(v,out);return out;};
 const value={format:'ROMDexConditionExtraction/1',sourceRomSha256:extraction.source.sha256,mapKey:extraction.testbed.key,conditions:[...conditions.values()].sort((a,b)=>a.id.localeCompare(b.id)).map(c=>({...c,expression:expression(c.expression),sourceRefs:c.sourceRefs.map(intern)})),effects:effects.sort((a,b)=>a.id.localeCompare(b.id)).map(e=>({...e,requires:expression(e.requires),sourceRefs:e.sourceRefs.map(intern)})),evidence,coverage,warnings,excludedUnboundRoots:extraction.roots.length-bound.length,states:steps,limits:{maxStates,maxStatesPerRoot,maxCallDepth,maxEffects},runtimeEmulated:false};
 value.digest=sha(canonical(value));return value;
}

export function validateConditionExtraction(value,extraction){
 const body={...value};delete body.digest;
 requireRom(value?.format==='ROMDexConditionExtraction/1'&&value.digest===sha(canonical(body)),'INTEGRITY','Condition extraction digest differs.');
 requireRom(value.sourceRomSha256===extraction.source.sha256&&value.mapKey===extraction.testbed.key,'INTEGRITY','Condition extraction belongs to another map or ROM.');
 const conditionIds=new Set(value.conditions.map(c=>c.id)),effectIds=new Set(value.effects.map(e=>e.id));
 requireRom(conditionIds.size===value.conditions.length&&effectIds.size===value.effects.length,'INTEGRITY','Duplicate condition/effect identity.');
 const refs=values=>{requireRom(Array.isArray(values)&&values.every(ref=>Object.hasOwn(value.evidence,ref)),'INVALID_REFERENCE','Missing condition source evidence.');};
 const expr=(v,depth=0)=>{requireRom(v&&depth<64&&['constant','flag','variable','runtime','all','any','not','unknown'].includes(v.op),'INVALID_REFERENCE','Invalid or oversized condition expression.');if(v.op==='unknown')refs(v.sourceRefs);if(v.op==='not')expr(v.arg,depth+1);if(['all','any'].includes(v.op)){requireRom(Array.isArray(v.args)&&v.args.length>=2,'INVALID_REFERENCE','A compound condition requires operands.');v.args.forEach(a=>expr(a,depth+1));}};
 for(const c of value.conditions){refs(c.sourceRefs);expr(c.expression);}
 const flows=new Map(extraction.flows.map(f=>[f.key,f]));
 for(const e of value.effects){refs(e.sourceRefs);expr(e.requires);requireRom(e.conditionIds.every(id=>conditionIds.has(id)),'INVALID_REFERENCE','Effect references an unknown condition.');if(e.flow){const row=flows.get(e.flow)?.instructions.find(r=>r.offset===e.offset);requireRom(row,'INVALID_REFERENCE','Condition effect site is absent from the source.');if(e.messageIndex!==null)requireRom(row.messageReferences?.[e.messageIndex],'INVALID_REFERENCE','Condition message target is absent.');}}
 requireRom(value.coverage.length===extraction.roots.filter(r=>r.kind!=='local-entry'&&!r.unbound).length,'INVALID_REFERENCE','Map condition coverage differs from bound roots.');return value;
}
