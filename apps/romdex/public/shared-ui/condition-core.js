(function(root){
 'use strict';
 const effectsFor=(index,recordId,pointId=null,blockId=null)=>(index?.effects||[]).filter(e=>e.target.recordId===recordId&&(!pointId||e.target.pointId===pointId)&&(!blockId||e.target.blockIds.includes(blockId)));
 function describe(expr){
  if(!expr)return 'Access requirements unresolved.';
  if(expr.op==='constant')return expr.value?'Always available in this source context':'This source path is not taken';
  if(expr.op==='flag')return 'Flag '+expr.flagId+' '+expr.state;
  if(expr.op==='variable')return 'Variable '+expr.variableId+' '+({eq:'=',ne:'≠',lt:'<',lte:'≤',gt:'>',gte:'≥'})[expr.compare]+' '+expr.value;
  if(expr.op==='runtime')return (expr.check==='time'&&expr.arguments.part==='weekday'?'Weekday':expr.check)+' '+({eq:'=',ne:'≠',lt:'<',lte:'≤',gt:'>',gte:'≥'})[expr.compare]+' '+expr.value;
  if(expr.op==='unknown')return 'Unresolved: '+expr.reason;
  if(expr.op==='not')return 'NOT ('+describe(expr.arg)+')';
  return '('+expr.args.map(describe).join(expr.op==='all'?' AND ':' OR ')+')';
 }
 const hasUnknown=expr=>expr.op==='unknown'||expr.op==='not'&&hasUnknown(expr.arg)||['all','any'].includes(expr.op)&&expr.args.some(hasUnknown);
 const knownConditions=index=>(index?.displayOrder||[]).map(id=>index.conditions.find(c=>c.id===id)).filter(c=>c&&!hasUnknown(c.expression));
 // Event presentation is a projection, never a replacement for the portable
 // predicate/effect index. Stock meanings are only used for the audited build.
 // Other builds need source-evidenced/owner labels, not a guessed global story.
 const auditedBuild='cb743eb01fe18f8599e54911faa28701474b84a6b9d9764a9478bf8a7be1babd';
 const auditedEvents={
  'flag:0x006A':['After Receiving Your Starter',20],
  'flag:0x006B':['After Receiving the Pokédex',40],
  'flag:0x0099':['After Meeting the Passerby Boy',45],
  'flag:0x009C':['After Receiving the Pokégear',30],
  'flag:0x00A7':['After Discussing Your Adventure with Mom',50],
  'flag:0x00EE':['After Elm’s Urgent Phone Call',35],
  'flag:0x00F2':['After Receiving the S.S. Ticket',100],
  'flag:0x01A4':['After the Catching Tutorial',60],
  'flag:0x01A5':['After the Catching Tutorial',60],
  'flag:0x0964':['After Entering the Hall of Fame',90],
  'variable:0x4106:eq:0':['Before Talking to Mom',0],
  'variable:0x4106:eq:1':['After Talking to Mom',10]
 };
 const expressionKey=e=>e.op==='flag'?'flag:'+e.flagId:e.op==='variable'?'variable:'+e.variableId+':'+e.compare+':'+e.value:null;
 function eventInfo(index,c){
  if(c.labelOrigin==='owner')return {name:c.label,order:1000};
  if(c.labelOrigin==='source'&&/^(?:After |Before |During )/.test(c.label))return {name:c.label,order:Object.values(auditedEvents).find(([name])=>name===c.label)?.[1]??1000};
  const hit=index.sourceRomSha256===auditedBuild&&auditedEvents[expressionKey(c.expression)];
  return hit?{name:hit[0],order:hit[1]}:null;
 }
 const eventCache=new WeakMap();
 function events(index){
  if(!index)return [];const signature=index.sourceRomSha256+'|'+index.displayOrder.join('|')+'|'+index.conditions.map(c=>c.labelOrigin+':'+c.label).join('|'),cached=eventCache.get(index);if(cached?.signature===signature)return cached.value;
  const groups=new Map();for(const [position,c]of knownConditions(index).entries()){
   const info=eventInfo(index,c);if(!info)continue;
   const key=info.name;let group=groups.get(key);
   if(!group){group={id:c.id,name:info.name,event:'Changes associated with this event. Inspect the exact before/after requirements for each item.',conditionEffect:true,eventEntry:true,conditionIds:[],uncertain:false,order:info.order,position};groups.set(key,group);}
   group.conditionIds.push(c.id);
  }
  const value=[...groups.values()].sort((a,b)=>a.order-b.order||a.position-b.position).map(({order,position,...value})=>value);eventCache.set(index,{signature,value});return value;
 }
 function selectionIds(index,selection){return events(index).find(e=>e.id===selection)?.conditionIds||[selection];}
 function includesSelection(index,ids,selection){return selectionIds(index,selection).some(id=>ids?.includes(id));}
 // Event membership identifies affected items. Dialogue filtering additionally
 // rejects paths that contradict the selected event's known before/after fact.
 // Other game state stays unknown; this does not invent a complete save state.
 function selectionFacts(index,selection){const event=events(index).find(e=>e.id===selection),flags=new Map(),variables=new Map();if(!event)return {flags,variables};for(const id of event.conditionIds){const c=index.conditions.find(c=>c.id===id),e=c?.expression;if(e?.op==='flag'){const state=c.labelOrigin==='owner'?e.state:/^After /.test(event.name)?'set':/^Before /.test(event.name)?'unset':e.state;flags.set(e.flagId,state);}else if(e?.op==='variable'&&e.compare==='eq'){if(!variables.has(e.variableId))variables.set(e.variableId,e.value);else if(variables.get(e.variableId)!==e.value)variables.set(e.variableId,null);}}return {flags,variables};}
 function evaluateSelection(expr,facts){if(!expr)return null;if(expr.op==='constant')return expr.value;if(expr.op==='flag')return facts.flags.has(expr.flagId)?facts.flags.get(expr.flagId)===expr.state:null;if(expr.op==='variable'){const n=facts.variables.get(expr.variableId);if(n===undefined||n===null)return null;return {eq:n===expr.value,ne:n!==expr.value,lt:n<expr.value,lte:n<=expr.value,gt:n>expr.value,gte:n>=expr.value}[expr.compare];}if(expr.op==='not'){const v=evaluateSelection(expr.arg,facts);return v===null?null:!v;}if(expr.op==='all'||expr.op==='any'){const values=expr.args.map(e=>evaluateSelection(e,facts));return expr.op==='all'?(values.includes(false)?false:values.includes(null)?null:true):(values.includes(true)?true:values.includes(null)?null:false);}return null;}
 function matchesSelection(index,ids,selection,requires=null){if(!includesSelection(index,ids,selection))return false;if(requires===null)return true;const facts=selectionFacts(index,selection),paths=Array.isArray(requires)?requires:[requires];return paths.some(e=>evaluateSelection(e,facts)!==false);}
 function selectionExpression(index,selection){const facts=selectionFacts(index,selection),args=[...facts.flags].map(([flagId,state])=>({op:'flag',flagId,state})).concat([...facts.variables].filter(([,value])=>value!==null).map(([variableId,value])=>({op:'variable',variableId,compare:'eq',value})));return args.length===1?args[0]:args.length?{op:'all',args}:index?.conditions.find(c=>c.id===selection)?.expression||{op:'unknown',reason:'Event requirements need review.'};}
 function unclassified(index,ids){const named=new Set(events(index).flatMap(e=>e.conditionIds));return (ids||[]).some(id=>!named.has(id));}
 function affectedItems(index,selection){const ids=selectionIds(index,selection);return [...new Set((index?.effects||[]).filter(e=>e.conditionIds.some(id=>ids.includes(id))).map(e=>e.target.recordId))];}
 function groupSpeakerTurns(turns,accept=()=>true,selectedEntry=null){
  const groups=[];for(const turn of turns.filter(accept)){let group=groups.at(-1);if(!group||group.speakerKey!==turn.speakerKey){group={...turn,entries:[],conditionIds:[],access:'',unresolved:false};groups.push(group);}
   for(const entry of turn.entries)group.entries.push({...entry,access:turn.access,conditionIds:turn.conditionIds,unresolved:turn.unresolved,sourceTurnKey:turn.entries[0].key});
   group.conditionIds=[...new Set([...group.conditionIds,...turn.conditionIds||[]])];group.unresolved||=turn.unresolved;
  }
  for(const group of groups){const active=group.entries.find(e=>e.key===selectedEntry)||group.entries[0];group.access=active.access;group.reviewAnchorKey=active.sourceTurnKey;}
  return groups;
 }
 function stages(index){return knownConditions(index).map(c=>({id:c.id,name:c.label,event:describe(c.expression),conditionEffect:true,uncertain:false}));}
 function indexFor(snapshot,town){return snapshot.timelines?.[town?.timelineRef]?.conditionIndex||null;}
 function blockEffects(index,recordId,pointId,blockId){return effectsFor(index,recordId,pointId,blockId).filter(e=>e.kind==='dialogue');}
 function matches(index,recordId,pointId,blockId,selection){
  if(selection==='all'||selection==='conditional')return true;
  const effects=blockEffects(index,recordId,pointId,blockId);
  if(selection==='unresolved')return !effects.length||effects.some(e=>hasUnknown(e.requires));
  if(selection==='other-conditions')return !effects.length||effects.some(e=>hasUnknown(e.requires)||unclassified(index,e.conditionIds));
  return effects.some(e=>matchesSelection(index,e.conditionIds,selection,e.requires));
 }
 root.romdexConditions=Object.freeze({effectsFor,describe,hasUnknown,knownConditions,stages,indexFor,blockEffects,matches,events,eventInfo,selectionIds,includesSelection,matchesSelection,selectionExpression,unclassified,affectedItems,groupSpeakerTurns});
})(globalThis);
