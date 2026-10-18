// Shared, side-effect-free presentation rules for contextual editing and summaries.
(()=>{
 const id=r=>r?.recordId||r?.id,payload=r=>r?.current?.payload||{},points=r=>payload(r).points?payload(r):payload(r).definitions||{},legacy=r=>r?.legacyData||{};
 const heads=(items,key)=>{const parents=new Set(items.flatMap(i=>i.parents||[]));return items.filter(i=>!parents.has(i.digest));};
 const title=r=>payload(r).overrides?.displayName||payload(r).name||r?.name||'Unnamed Item';
 const point=(r,key)=>points(r).points?.[key]||Object.values(points(r).points||{}).find(p=>p.legacyData?.legacyId===key);
 const block=(p,key)=>p?.blocks?.[key]||Object.values(p?.blocks||{}).find(b=>b.legacyData?.legacyId===key);
 function resolve(records,scope){
  const local=records.filter(r=>legacy(r).legacyTownId===scope.townId||id(r)===scope.characterId||scope.elementIds?.includes(id(r)));
  if(scope.pointId){const matches=local.filter(r=>point(r,scope.pointId));if(matches.length===1){const record=matches[0],p=point(record,scope.pointId),b=block(p,scope.blockId);return {recordId:id(record),pointId:p.id,blockId:b?.id||''};}}
  const matches=local.filter(r=>scope.elementIds?.includes(id(r))||scope.elementIds?.includes(legacy(r).legacyElementId));
  return matches.length===1?{recordId:id(matches[0]),pointId:'',blockId:''}:null;
 }
 function ancestry(records,record){const map=new Map(records.map(r=>[id(r),r])),result=[],seen=new Set();for(let r=record;r&&!seen.has(id(r));r=map.get(r.parentRecordId)){seen.add(id(r));result.unshift(r);}return result;}
 function label(records,target){const r=records.find(r=>id(r)===target.recordId);if(!r)return {path:'Unavailable Content',name:'Target Needs Review',condition:'',current:'',record:null};const chain=ancestry(records,r),p=point(r,target.pointId),blocks=(target.blockIds||[]).map(k=>block(p,k)).filter(Boolean);return {record:r,path:chain.filter(x=>['map','subzone','shared'].includes(x.kind)&&id(x)!==id(r)).map(title).join(' → ')||(r.kind==='profile'?'Shared Character':'Shared Content'),name:title(r),condition:p?.condition||(target.pointId?'Dialogue Entry Needs Review':'Whole Item'),current:(blocks.length?blocks.map(b=>b.text):p?(p.blockOrder||[]).map(k=>p.blocks[k]?.text):[]).filter(Boolean).join('\n\n'),stages:p?.stageIds||[]};}
 function zones(records,scope){const candidates=records.filter(r=>r.kind==='subzone'&&r.current?.lifecycle!=='archived'&&(legacy(r).legacyTownId===scope.townId||ancestry(records,r).some(x=>x.kind==='map'&&id(x)===scope.townId)));const matches=candidates.filter(r=>id(r)===scope.locationId||legacy(r).legacyLocationId===scope.locationId||scope.areaId&&payload(r).sourceAreaKeys?.includes(scope.areaId));return {candidates,selected:matches.length===1?id(matches[0]):candidates.length===1?id(candidates[0]):''};}
 const sameTarget=(a,b)=>a.recordId===b.recordId&&(a.pointId||'')===(b.pointId||'')&&JSON.stringify(a.blockIds||[])===JSON.stringify(b.blockIds||[]);
 function entries(context){
  const result=[],states=new Map((context.reviewStates||[]).map(s=>[s.digest,s]));
  for(const [items,key,kind]of [[context.plans||[],'planId','plan'],[context.reviews||[],'reviewId','review']])for(const item of heads(items,key)){
   if(kind==='review'&&!item.note&&item.flag==='none'&&item.testStatus==='unreviewed')continue;
   const where=label(context.records,item.target),state=states.get(item.digest),category=kind==='plan'?(item.intent==='FINAL'?'Finalized':'Changes'):'Notes';
   const changes=(item.changes||[]).filter(c=>c.path.endsWith('/name')||c.path.endsWith('/displayName')).map(c=>'Proposed Name: '+c.after.value);
   result.push({kind,identity:item[key],digest:item.digest,item,...where,category,decision:kind==='plan'?item.intent:(item.flag==='critical'?'CRITICAL FLAG':item.flag==='standard'?'FLAG':'NOTE'),body:kind==='plan'?[item.instructions,['UPDATE','ADD'].includes(item.intent)&&item.proposedDialogue&&'Proposed Dialogue:\n'+item.proposedDialogue,...changes,item.requiredAssetIds?.length?'Proposed Images: '+item.requiredAssetIds.length:''].filter(Boolean).join('\n\n'):(item.note||'Flagged for Review'),testing:state?.status||item.testStatus||null,stale:!!state?.stale});
  }
  return result.sort((a,b)=>[a.path,a.name,a.condition].join().localeCompare([b.path,b.name,b.condition].join()));
 }
 // The active shape stays compatible with 0.5.9; other contexts are retained alongside it.
 const draftKey=d=>JSON.stringify([d.mode,d.fields?.recordId||'',d.fields?.pointId||'',d.fields?.blockId||'']);
 function drafts(value){if(!value)return [];const {otherDrafts=[],...active}=value;return [active,...otherDrafts].filter(d=>d.mode&&d.fields).filter((d,i,all)=>all.findIndex(x=>draftKey(x)===draftKey(d))===i);}
 function saveDraft(value,draft,remove=false){const others=drafts(value).filter(d=>draftKey(d)!==draftKey(draft));const all=remove?others:[draft,...others];return all.length?{...all[0],...(all.length>1?{otherDrafts:all.slice(1)}:{})}:null;}
 const stageFor=(point,current)=>point?.stageIds?.includes(current)?current:point?.stageIds?.[0]||'conditional';
 const testingFor=(review,record)=>review.baseline?.revisionId===record.revisionId?review.testStatus:'unreviewed';
 globalThis.romdexContentModel={id,payload,points,legacy,heads,title,point,block,resolve,ancestry,label,zones,sameTarget,entries,draftKey,drafts,saveDraft,stageFor,testingFor};
})();
