(function(root){
 'use strict';
 const assert=(ok,message)=>{if(!ok)throw Error(message);},object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const validId=id=>typeof id==='string'&&/^[A-Za-z][A-Za-z0-9:._-]{0,159}$/.test(id)&&!['all','conditional','__proto__','constructor','prototype'].includes(id);
 function roman(value){assert(Number.isSafeInteger(value)&&value>0&&value<=3999,'Invalid Timeline Ordinal.');let n=value,out='';for(const [v,label]of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){out+=label;n-=v;}return out;}
 function validateStages(stages,{inspection=false}={}){
  assert(Array.isArray(stages)&&stages.length<=256,'Timeline Stages Must Be a Bounded List.');const ids=new Set();
  for(const s of stages){assert(object(s)&&validId(s.id)&&!ids.has(s.id)&&(inspection&&s.name===undefined||typeof s.name==='string'&&s.name.length<=4096)&&(inspection&&s.event===undefined||typeof s.event==='string'&&s.event.length<=65536),'Timeline Stages Need Unique Stable IDs, Names and Conditions.');ids.add(s.id);}
  return stages;
 }
 function definitionStages(definitions){
  assert(object(definitions),'Timeline Definition Is Missing.');
  if(Object.hasOwn(definitions,'stages'))return validateStages(definitions.stages);
  // Historical portable files declared IDs only. Keep those identities and
  // explicitly unknown conditions; never synthesize ten global stages.
  assert(Array.isArray(definitions.stageIds)&&definitions.stageIds.length<=256&&new Set(definitions.stageIds).size===definitions.stageIds.length&&definitions.stageIds.every(validId),'Timeline Definition Is Missing or Invalid.');
  return definitions.stageIds.map((id,i)=>({id,name:'Stage '+roman(i+1),event:'Condition Not Supplied in This Legacy Timeline.'}));
 }
 function snapshotStages(snapshot,town,options={}){
  const ref=town?.timelineRef??snapshot.defaultTimelineRef;
  if(ref!==undefined&&ref!==null){
   const t=snapshot.timelines?.[ref];assert(object(t)&&t.id===ref,'Selected Map Timeline Is Missing.');return validateStages(t.stages,options);
  }
  return validateStages(snapshot.stages,options);
 }
 function validateSnapshot(snapshot,options={}){
  validateStages(snapshot.stages,options);
  if(snapshot.timelines!==undefined){assert(object(snapshot.timelines)&&Object.keys(snapshot.timelines).length<=512,'Invalid Map Timeline Registry.');for(const [id,t]of Object.entries(snapshot.timelines)){assert(validId(id)&&object(t)&&t.id===id&&typeof t.name==='string','Invalid Map Timeline Identity.');validateStages(t.stages);}}
  if(snapshot.defaultTimelineRef!==undefined&&snapshot.defaultTimelineRef!==null)assert(snapshot.timelines?.[snapshot.defaultTimelineRef],'Default Timeline Is Missing.');
  for(const town of snapshot.towns||[]){const stages=snapshotStages(snapshot,town,options),known=new Set(['all',...stages.map(s=>s.id)]);for(const area of town.areas||[])for(const e of area.elements||[])for(const p of e.points||[]){if(options.inspection&&p.stages===undefined)continue;assert(Array.isArray(p.stages)&&new Set(p.stages).size===p.stages.length&&p.stages.every(id=>known.has(id)),'Dialogue References a Stage Outside Its Map Timeline.');}}
  return snapshot;
 }
 function chooseStage(stages,current,point=null){
  const known=new Set(stages.map(s=>s.id));if(point){const ids=point.stages||point.stageIds||[];if(!ids.length)return 'conditional';if(ids.includes('all'))return known.has(current)?current:stages[0]?.id||'conditional';if(known.has(current)&&ids.includes(current))return current;return ids.find(id=>known.has(id))||'conditional';}
  return current==='conditional'||known.has(current)?current:stages[0]?.id||'conditional';
 }
 function label(stages,id){const at=stages.findIndex(s=>s.id===id);return at<0?id:roman(at+1);}
 root.romdexTimelines=Object.freeze({validId,roman,validateStages,definitionStages,snapshotStages,validateSnapshot,chooseStage,label});
})(globalThis);
