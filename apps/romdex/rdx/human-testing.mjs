import {randomUUID} from 'node:crypto';
import {canonical,sha,same} from '../content/contracts.mjs';
import {mapDomain} from './map-import.mjs';
import {validateTestingHistory,appendTesting,verifiedTesting,reversalPending} from './human-testing-contract.mjs';
import {guardTestingCompletion} from '../public/testing-state.mjs';
import {ensure} from './limits.mjs';

const digest=value=>sha(canonical(value));
// Decisions arrive only through the private metadata owner. Portable files,
// native State changes and ordinary per-dialogue reviews cannot confirm them.
export class HumanTesting{
 constructor({maps,packages,application,engine,record,knownAcceptances=()=>({}),knownTesting=()=>null,safety=()=>false,changed=()=>{},now=()=>Date.now()}){Object.assign(this,{maps,packages,application,engine,record,knownAcceptances,knownTesting,safety,changed,now});}
 async open(){await this.application.open();this.maps.store.db.exec('CREATE TABLE IF NOT EXISTS human_testing_proofs(digest TEXT PRIMARY KEY,group_key TEXT NOT NULL,value BLOB NOT NULL,revoked INTEGER NOT NULL DEFAULT 0)');this.opened=true;}
 confirm(histories,acceptances){if(!this.opened||!this.maps.store)return;this.maps.store.transaction(()=>{for(const [key,history]of Object.entries(histories||{})){validateTestingHistory(history);const acceptance=acceptances[key];ensure(acceptance&&history.events.every(e=>e.receiptDigest===acceptance.receiptDigest&&e.bindingDigest===acceptance.binding.digest&&e.key===key),'INVALID','Testing Decision Acceptance Differs.');const event=history.events.at(-1);this.maps.store.db.prepare('INSERT OR IGNORE INTO human_testing_proofs VALUES(?,?,?,0)').run(event.digest,key,Buffer.from(canonical({historyHash:digest(history)})));}});}
 invalidate(keys){if(!this.opened||!this.maps.store)return;for(const key of keys)this.maps.store.db.prepare('UPDATE human_testing_proofs SET revoked=1 WHERE group_key=?').run(key);}
 acceptances(){if(this.application.acceptanceProofs&&this.maps.store){const count=this.maps.store.db.prepare('SELECT count(*) AS n FROM return_private_acceptances').get().n;if(this.proofCount!==count){this.proofCount=count;this.localAcceptances=Object.fromEntries(this.maps.store.db.prepare('SELECT value FROM return_private_acceptances').all().map(r=>{const value=JSON.parse(Buffer.from(r.value));return [value.key,value];}));}}return {...this.localAcceptances,...this.knownAcceptances(),...this.engine.state?.resultAcceptances};}
 intent(key){return this.application.opened&&this.maps.store?this.application.get('return_applications',key):null;}
 domain(entry){const revision=this.maps.store.row(entry.key).head;this.domains??=new Map();const cached=this.domains.get(entry.key);if(cached?.revision===revision)return cached.result;const value=this.maps.store.load(entry.key,revision),result={value:{document:value.document},domain:mapDomain(value)};this.domains.set(entry.key,{revision,result});while(this.domains.size>8)this.domains.delete(this.domains.keys().next().value);return result;}
 observed(intent,domain){return intent.affected.map(({recordId})=>({recordId,revisionId:domain.records.find(r=>r.recordId===recordId)?.revisionId||null}));}
 history(key){return this.engine.state?.resultTesting?.[key]||null;}
 verified(acceptance,intent,entry){
  if(!intent||intent.state!=='applied'||!entry||intent.receipt.digest!==acceptance.receiptDigest||!this.application.isAccepted(intent.receipt))return false;const history=this.history(acceptance.key),event=history?.events.at(-1);if(!event)return false;const known=this.knownTesting();if(known&&!same(known[acceptance.key]||null,history))return false;
  const proof=this.maps.store.db.prepare('SELECT value,revoked FROM human_testing_proofs WHERE digest=?').get(event.digest);if(!proof||proof.revoked||JSON.parse(Buffer.from(proof.value)).historyHash!==digest(history))return false;
  try{return verifiedTesting(acceptance,history,this.observed(intent,this.domain(entry).domain));}catch{return false;}
 }
 taskId(acceptance){return this.packages.entries().find(e=>e.binding?.digest===acceptance.binding.digest)?.issueId||(this.engine.state?.remote||[]).find(r=>r.dbId===acceptance.binding.task.issueId)?.id||null;}
 indicators(){
  const tasks={...this.sourceUpdates?.tasks(this.packages)};
  for(const acceptance of Object.values(this.acceptances())){const id=this.taskId(acceptance);if(!id)continue;const intent=this.intent(acceptance.key),entry=this.packages.entries().find(e=>e.binding?.digest===acceptance.binding.digest),verified=this.verified(acceptance,intent,entry);tasks[id]??={pending:false,total:0,verified:0};tasks[id].total++;tasks[id].verified+=Number(verified);tasks[id].pending||=!verified;}
  const parents=new Map((this.engine.state?.remote||[]).map(r=>[r.id,r.parentId]));for(const [id,value]of Object.entries({...tasks})){let parent=parents.get(id),seen=new Set([id]);while(parent&&!seen.has(parent)){seen.add(parent);tasks[parent]??={pending:false,total:0,verified:0};tasks[parent].pending||=value.pending;parent=parents.get(parent);}}
  return tasks;
 }
 assertCompletion(id,patch,native=null){
  if(![patch?.state,patch?.assignedState].some(v=>['Done','Fixed','Complete'].includes(v)))return;
  guardTestingCompletion(id,patch,this.indicators());
  if(native?.dbId)for(const acceptance of Object.values(this.acceptances()).filter(a=>a.binding.task.issueId===native.dbId)){const entry=this.packages.entries().find(e=>e.binding?.digest===acceptance.binding.digest);if(!this.verified(acceptance,this.intent(acceptance.key),entry))guardTestingCompletion(id,patch,{[id]:{pending:true}});}
  for(const entry of this.packages.entries().filter(e=>e.issueId===id))if(this.packages.authorization(entry).state==='authorized'){
   const groups=this.packages.frozen(entry.id).prepared.groups.filter(g=>g.writeRecordIds.length);
   ensure(groups.every(g=>this.intent(digest({binding:entry.binding.digest,group:g.groupId}))?.state==='applied'||this.sourceUpdates?.covers(entry,g.planDigests)),'TESTING_REQUIRED','Authorized Map Work Remains Unimplemented. Keep This Task Open.');
  }
 }
 async beforeCompletion(operations,refresh){
  const completing=operations.filter(op=>op.type==='edit'&&[op.patch?.state,op.patch?.assignedState].some(v=>['Done','Fixed','Complete'].includes(v)));if(!completing.length)return;
  const indicators=this.indicators(),related=this.packages.entries().filter(e=>completing.some(op=>op.issueId===e.issueId));
  if(related.length||completing.some(op=>indicators[op.issueId]))try{await refresh(related);}catch(error){throw Object.assign(Error('Accepted Result History Must Be Refreshed Before Completion. The Queued Edit Is Preserved. '+error.message),{code:'TESTING_REQUIRED',operationId:completing[0].opId});}
  for(const op of completing)try{this.assertCompletion(op.issueId,op.patch);}catch(error){error.operationId=op.opId;throw error;}
 }
 status(entry){
  if(!this.opened||!this.maps.store)return [];
  return this.application.rows('return_applications').filter(i=>i.entryId===entry.id&&['accepted','applied'].includes(i.state)).map(intent=>{const acceptance=this.acceptances()[intent.key],history=this.history(intent.key),verified=acceptance&&this.verified(acceptance,intent,entry);return {key:intent.key,groupId:intent.groupId,state:intent.state,testing:verified?'verified':history?.events.at(-1)?.action==='fail'?'failed':'unreviewed',requiresHumanTesting:!verified,events:history?.events||[],receiptDigest:intent.receipt.digest,affected:intent.affected};});
 }
 preview({id,key,eventOffset=0,changeOffset=0}){
  ensure(Number.isSafeInteger(eventOffset)&&eventOffset>=0&&eventOffset<=1000&&Number.isSafeInteger(changeOffset)&&changeOffset>=0&&changeOffset<=10000,'INVALID','Invalid History Page.');
  const entry=this.packages.entries().find(e=>e.id===id),intent=this.intent(key),acceptance=this.acceptances()[key];ensure(entry&&intent?.entryId===id&&acceptance&&acceptance.receiptDigest===intent.receipt.digest,'NOT_FOUND','Accepted Result History Is Unavailable.');
  const {value,domain}=this.domain(entry),observed=this.observed(intent,domain);ensure(observed.every(r=>r.revisionId),'REVIEW_REQUIRED','Affected Content Is Missing. Preserve the Result and Review Its History.');
  const pkg=JSON.parse(intent.receipt.packageJSON),result=JSON.parse(intent.receipt.resultJSON),group=pkg.groups.find(g=>g.groupId===intent.groupId),plans=pkg.requests.filter(p=>group.planDigests.includes(p.digest)),history=this.history(key),token=digest({id,key,receipt:acceptance.receiptDigest,head:value.document.revision,history,observed,state:intent.state,ready:this.safety()});
  const allChanges=plans.flatMap(p=>p.changes),compact=v=>{const text=JSON.stringify(v,null,2);return text.length<=4000?v:{truncated:true,characters:text.length,preview:text.slice(0,4000),fullValues:'Download History and Reversal Reference'};};
  return {id,key,token,eventOffset,eventCount:history?.events.length||0,latestAction:history?.events.at(-1)?.action||null,reversalPending:reversalPending(history),changeOffset,changeCount:allChanges.length,task:entry.issueId,map:entry.mapName,groupId:intent.groupId,state:intent.state,receiptDigest:intent.receipt.digest,returnSHA256:intent.sourceHash,source:result.source,affected:observed.map(r=>({...r,name:domain.records.find(a=>a.recordId===r.recordId).current.payload.name,changedSinceApplication:intent.affected.find(a=>a.recordId===r.recordId)?.revisionId!==r.revisionId})),changes:allChanges.slice(changeOffset,changeOffset+20).map(c=>({...c,before:compact(c.before),after:compact(c.after)})),events:[...(history?.events||[])].reverse().slice(eventOffset,eventOffset+20),ready:this.safety(),testing:this.status(entry).find(r=>r.key===key)?.testing||'unreviewed',notice:'Verify the Current Affected Content Against the Build You Tested. Ticket State and Agent Claims Do Not Verify It. Reversal Decisions Preserve Evidence and Require a New Reviewed ROM Change Request.'};
 }
 async decide(input){
  ensure(input?.approved===true,'REVIEW_REQUIRED','Explicit Human Testing Confirmation Is Required.');const preview=this.preview(input);ensure(preview.token===input.token,'CONFLICT','The Testing Baseline or History Changed. Review the Latest Result.');
  ensure(preview.state==='applied'&&preview.ready,'DEFERRED','Finish Verified Result Delivery and Private Metadata Sync Before Recording Testing.');
  const acceptance=this.acceptances()[input.key],event={id:randomUUID(),key:input.key,receiptDigest:acceptance.receiptDigest,bindingDigest:acceptance.binding.digest,action:input.action,build:input.build||'',notes:input.notes||'',observed:preview.affected.map(({recordId,revisionId})=>({recordId,revisionId})),createdAt:new Date(this.now()).toISOString()},history=appendTesting(this.engine.state.resultTesting,event);
  ensure(typeof this.record==='function','DEFERRED','Private Human Testing Storage Is Unavailable.');await this.record(input.key,history,preview.token,()=>this.preview(input).token);this.changed();return this.preview(input);
 }
 decorateView(view){
  if(!this.opened||!view?.snapshot)return view;const indicators={},byTown={},merge=(map,id,verified)=>{if(!id)return;map[id]??={pending:false,verified:true};map[id].pending||=!verified;map[id].verified&&=verified;};
  for(const entry of this.packages.entries()){
   const items=this.status(entry);if(!items.length)continue;const {domain}=this.domain(entry),views=domain.views||[],mapView=views.filter(v=>v.recordId===entry.mapRecordId).at(-1),townId=mapView?.payload.fields?.id||entry.mapRecordId;byTown[townId]??={};
   for(const item of items){const verified=item.testing==='verified',ids=new Set(item.affected.map(r=>r.recordId));for(const record of domain.records)if(record.kind==='appearance'&&[record.current.payload.profileId,...Object.values(record.current.payload.profileByPlayerGender||{})].some(id=>ids.has(id)))ids.add(record.recordId);for(const record of domain.records)if(record.kind==='scene'&&record.current.payload.participantIds?.some(id=>ids.has(id)))ids.add(record.recordId);
    for(const id of ids){merge(indicators,id,verified);merge(byTown[townId],id,verified);const record=domain.records.find(r=>r.recordId===id);for(const v of views.filter(v=>v.recordId===id))merge(byTown[townId],v.payload.fields?.id,verified);merge(byTown[townId],record?.legacyData?.legacyElementId,verified);for(const area of record?.kind==='subzone'?record.current.payload.sourceAreaKeys:[])merge(byTown[townId],area,verified);}
   }
  }
  const decorated={...view,testingRevision:digest({indicators,byTown}),snapshot:{...view.snapshot,testingIndicators:indicators,testingIndicatorsByTown:byTown}};return this.sourceUpdates?this.sourceUpdates.decorate(decorated):decorated;
 }

 reversalReference(input){const p=this.preview(input),intent=this.intent(input.key),pkg=JSON.parse(intent.receipt.packageJSON),group=pkg.groups.find(g=>g.groupId===intent.groupId),changes=intent.receipt.review?.format==='RDXReviewedScope/1'?intent.receipt.review.changes:pkg.requests.filter(r=>group.planDigests.includes(r.digest)).flatMap(r=>r.changes);if(input.token)ensure(input.token===p.token,'CONFLICT','The Result History Changed. Refresh Before Exporting.');return {format:'ROMDexReversalReference/1',task:p.task,acceptedReceipt:p.receiptDigest,returnedFileSHA256:p.returnSHA256,source:p.source,groupId:p.groupId,affected:p.affected,implementedChanges:changes,testingHistory:this.history(input.key)?.events||[],inverseChanges:changes.map(c=>({...c,before:c.after,after:c.before})),dispatch:'none',instructions:'Reference Only. Current NPCDex/ROM Content Has Not Been Reversed. Compare With Current ROM and NPCDex, Stage a New Change Plan, Review and Attach a New JSON Map Package, Then Explicitly Authorize It. Preserve Original Result and Testing History.'};}
}
