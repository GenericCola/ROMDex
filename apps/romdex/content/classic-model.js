// Original NPCDex feedback identities mapped onto versioned content records.
(()=>{
 const heads=values=>{const parents=new Set(values.flatMap(v=>v.parents));return values.filter(v=>!parents.has(v.digest));};
 const payload=r=>r.current.payload.points?r.current.payload:r.current.payload.definitions||{};
 const point=(r,id)=>Object.values(payload(r).points||{}).find(p=>p.id===id||p.legacyData?.legacyId===id);
 const block=(p,id)=>Object.values(p?.blocks||{}).find(b=>b.id===id||b.legacyData?.legacyId===id);
 const uiPoint=p=>p?.legacyData?.legacyId||p?.id;
 const uiBlock=b=>b?.legacyData?.legacyId||b?.id;
 const targetKey=t=>t.townId+'|'+t.type+'|'+t.id;
 const fail=message=>{throw Error(message);};
 function resolve(records,spec){
  const c=spec.context||{},old=spec.target||c.target||{},town=old.townId||c.townId,pid=old.pointId||(!old.type||['point','prompt'].includes(old.type)?c.pointId:null);
  const belongs=r=>{const seen=new Set();while(r&&!seen.has(r.recordId)){seen.add(r.recordId);if(r.recordId===town||r.legacyRefs.some(x=>x.townId===town))return true;r=records.find(x=>x.recordId===r.parentRecordId);}return false;};
  let matches=records.filter(r=>pid?point(r,pid)&&(belongs(r)||r.recordId===old.recordId):r.recordId===old.id||r.legacyRefs.some(x=>x.townId===town&&x.kind===old.type&&x.id===old.id));
  if(matches.length!==1)fail('This Feedback Target Needs Review Before It Can Be Saved.');
  const r=matches[0],p=point(r,pid);let bids=old.blockIds;
  if(!bids&&p){if(c.scope==='passage')bids=[c.blockId||c.sourceBlockId].filter(Boolean);else bids=Object.values(p.blocks).filter(b=>(c.passageKeys||[]).some(k=>k==='entry:'+uiBlock(b)+':0'||k.startsWith('entry:'+uiBlock(b)+':')||k===b.reviewKey)).map(b=>b.id);}
  const blocks=(bids||[]).map(id=>block(p,id)||fail('A Selected Passage No Longer Exists.'));
  return {recordId:r.recordId,pointId:p?.id||null,blockIds:[...new Set(blocks.map(b=>b.id))],promptKey:spec.type==='review'?spec.key:old.type==='prompt'?old.id:null,gender:old.gender||c.gender||null};
 }
 function command(context,spec){
  const list=heads(spec.type==='review'?context.reviews:context.plans),identity=spec.type==='review'?'reviewId':'planId';
  let matches=list.filter(v=>v[identity]===spec.identity||spec.before?.id&&(v[identity]===spec.before.id||v.legacyRefs?.some(x=>x.kind==='plan'&&x.id===spec.before.id)));
  let target;
  if(!matches.length){target=resolve(context.records,spec);matches=list.filter(v=>v.target.recordId===target.recordId&&v.target.pointId===target.pointId&&JSON.stringify(v.target.blockIds)===JSON.stringify(target.blockIds)&&(v.target.promptKey===target.promptKey||spec.type==='review'&&v.target.promptKey===null&&spec.context?.scope==='passage'));}
  if(matches.length>1)fail('Conflicting Feedback Versions Require Review Sync.');
  const prior=matches[0];target=prior?.target||target;const r=context.records.find(r=>r.recordId===target.recordId);
  if(spec.recordRevision&&r.revisionId!==spec.recordRevision)fail('Current Content Changed While You Were Editing. Review It Before Saving.');
  const result={type:spec.type,...target,expectedRevision:r.revisionId,...(prior?{[identity]:prior[identity],expectedParents:[prior.digest]}:{})};
  const merge=(name,before,after,current)=>{if(spec.before&&before===after)return current;if(prior&&spec.before&&current!==before&&current!==after)fail('This '+name+' Changed on Another Computer. Review Both Versions.');return after;};
  if(spec.type==='review'){const flag=a=>a?.flag?(a.critical?'critical':'standard'):'none',nextFlag=merge('Flag',flag(spec.before),flag(spec.after),prior?.flag||'none'),note=merge('Note',spec.before?.note||'',spec.after.note||'',prior?.note||'');return {...result,flag:nextFlag,note,testStatus:spec.testingChanged?merge('Testing Status',spec.before?.testStatus||'unreviewed',spec.after.testStatus||'unreviewed',prior?.testStatus||'unreviewed'):prior&&prior.baseline.revisionId===r.revisionId?prior.testStatus:'unreviewed'};}
  if(!spec.after){if(!prior)fail('The Change Decision No Longer Exists.');for(const field of ['intent','instructions','proposedDialogue'])if(spec.before&&prior[field]!==spec.before[field])fail('This Decision Changed on Another Computer. Review It Before Clearing.');return {...result,intent:prior.intent,workflow:'superseded',instructions:prior.instructions,proposedDialogue:prior.proposedDialogue,sharedAcknowledged:r.kind==='profile'};}
  const intent=merge('Decision',spec.before?.intent,spec.after.intent,prior?.intent),instructions=merge('Change Description',spec.before?.instructions||'',spec.after.instructions||'',prior?.instructions||''),dialogue=merge('Proposed Dialogue',spec.before?.proposedDialogue||'',spec.after.proposedDialogue||'',prior?.proposedDialogue||'');
  return {...result,intent,workflow:intent==='FINAL'?'final':'draft',instructions,proposedDialogue:dialogue,sharedAcknowledged:r.kind==='profile'};
 }
 function legacyTarget(document,records,t){
  const r=records.find(r=>r.recordId===t.recordId);if(!r)return null;const p=point(r,t.pointId),pid=uiPoint(p);
  const found=document.towns.flatMap(town=>town.areas.flatMap(area=>area.elements.filter(e=>e.points.some(p=>p.id===pid)).map(e=>({town,area,element:e}))));
  if(p){let owner=r;const seen=new Set(),towns=new Set(r.legacyRefs.filter(x=>x.kind==='point'&&x.id===pid).map(x=>x.townId));while(owner&&!seen.has(owner.recordId)){seen.add(owner.recordId);if(owner.kind==='map'){towns.add(owner.recordId);for(const ref of owner.legacyRefs)towns.add(ref.townId);}owner=records.find(x=>x.recordId===owner.parentRecordId);}const candidates=found.filter(row=>towns.has(row.town.id));if(candidates.length!==1)return null;const row=candidates[0],id=t.promptKey||pid;return {townId:row.town.id,type:t.promptKey?.startsWith('prompt:')?'prompt':'point',id,pointId:pid,gender:t.gender,blockIds:t.blockIds.map(k=>uiBlock(block(p,k))),elementId:row.element.id};}
  const ref=r.legacyRefs.find(x=>['character','element','location','town','area'].includes(x.kind));if(ref)return {townId:ref.townId,type:ref.kind,id:ref.id};
  for(const town of document.towns){const character=town.characters.find(c=>c.id===r.recordId),element=town.areas.flatMap(a=>a.elements).find(e=>e.id===r.recordId);if(character||element)return {townId:town.id,type:character?'character':'element',id:r.recordId};}
  return null;
 }
 function decorate(document,domain){
  document.promptStatusUnset||={};document.changePlans||={};document.annotations||={};
  const records=domain.records,manifest=document.contentPreview.nativeTree?{reviewIndex:document.contentPreview.reviewBindings||[]}:records.find(r=>r.current.payload.definitions?.migration)?.current.payload.definitions.migration,keys={};
  const planHeads=heads(domain.plans),reviewHeads=heads(domain.reviews);
  for(const p of planHeads){if(planHeads.filter(x=>x.planId===p.planId).length!==1)continue;
   const entry=Object.entries(document.changePlans).find(([,old])=>old.id===p.planId||p.legacyRefs?.some(x=>x.kind==='plan'&&x.id===old.id));let t=entry?.[1].target||legacyTarget(document,records,p.target);if(!t)continue;const key=entry?.[0]||targetKey(t);keys[key]={planId:p.planId};
   if(p.workflow==='superseded'){delete document.changePlans[key];document.promptStatusUnset[key]=true;continue;}
   if(entry&&!p.parents.length)continue;delete document.promptStatusUnset[key];const r=records.find(r=>r.recordId===p.target.recordId),pointValue=point(r,p.target.pointId);
   document.changePlans[key]={...entry?.[1],id:entry?.[1].id||p.planId,target:t,label:entry?.[1].label||r.current.payload.name+(pointValue?' · '+pointValue.condition:''),intent:p.intent,workflow:p.workflow==='draft'&&p.instructions.trim()?'planned':p.workflow,instructions:p.instructions,proposedDialogue:p.proposedDialogue,sharedSceneHandling:'instructions'};
  }
  for(const review of reviewHeads){if(reviewHeads.filter(x=>x.reviewId===review.reviewId).length!==1)continue;const inferred=Object.entries(document.annotations).filter(([key,a])=>{try{const t=resolve(records,{type:'review',key,context:a.context,target:a.context?.target});return t.recordId===review.target.recordId&&t.pointId===review.target.pointId&&JSON.stringify(t.blockIds)===JSON.stringify(review.target.blockIds)&&(review.target.promptKey===key||review.target.promptKey===null&&a.scope==='passage');}catch{return false;}});const original=manifest?.reviewIndex.find(x=>x.reviewId===review.reviewId)||(inferred.length===1?{legacyKey:inferred[0][0]}:null),t=legacyTarget(document,records,review.target);if(!t)continue;let key=original?.legacyKey||review.target.promptKey;
   const r=records.find(r=>r.recordId===review.target.recordId),p=point(r,review.target.pointId),b=block(p,review.target.blockIds[0]);if(!key)key=b?'entry:'+uiBlock(b)+':0':p?'point:'+uiPoint(p):t.type+':'+t.id;keys[key]={...keys[key],reviewId:review.reviewId};const stale=r.revisionId!==review.baseline.revisionId;
   if(original&&!review.parents.length&&!stale)continue;const prior=document.annotations[key],scope=key.startsWith('entry:')?'passage':'prompt';
   document.annotations[key]={...prior,flag:review.flag!=='none',critical:review.flag==='critical',note:review.note,testStatus:stale?'unreviewed':review.testStatus,scope,context:prior?.context||{townId:t.townId,pointId:t.pointId,elementId:t.elementId,blockId:uiBlock(b),gender:review.target.gender||'both',scope,promptKey:scope==='prompt'?key:null,passageKeys:review.target.blockIds.map(k=>'entry:'+uiBlock(block(p,k))+':0'),label:r.current.payload.name+(p?' · '+p.condition:''),selected:{type:'element',id:t.elementId},...(!p?{target:{type:t.type,id:t.id}}:{})}};
  }
  document.contentPreview.feedbackKeys=keys;return document;
 }
 function reviewed(context,spec){
  const probe=command(context,{...spec,recordRevision:null,before:undefined}),identity=spec.type==='review'?'reviewId':'planId',prior=heads(spec.type==='review'?context.reviews:context.plans).find(v=>v[identity]===probe[identity]),record=context.records.find(r=>r.recordId===probe.recordId);
  const current=spec.type==='review'?{flag:!!prior&&prior.flag!=='none',critical:prior?.flag==='critical',note:prior?.note||'',testStatus:prior?.baseline.revisionId===record.revisionId?prior.testStatus:'unreviewed'}:{...spec.before,intent:prior?.intent,instructions:prior?.instructions||'',proposedDialogue:prior?.proposedDialogue||''};let after;
  if(spec.after){after={...spec.after,...current};const fields=spec.type==='review'?['flag','critical','note',...(spec.testingChanged?['testStatus']:[])]:['intent','instructions','proposedDialogue'];for(const field of fields)if(!spec.before||spec.before[field]!==spec.after[field])after[field]=spec.after[field];}
  return {...spec,before:current,after,identity:prior?.[identity],recordRevision:record.revisionId,discardOnly:false};
 }
 globalThis.romdexClassicModel={heads,resolve,command,decorate,legacyTarget,reviewed};
})();
