// Executable U20A design model. No runtime app imports, network or production writes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const load=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const schema=load('npcdex-contracts.schema.json');
const clone=structuredClone;
const checks=[];
const check=(name,fn)=>{fn();checks.push(name);};
const requireThat=(value,message)=>assert.ok(value,message);
export function canonical(value){
 if(value===null||typeof value==='boolean')return JSON.stringify(value);
 if(typeof value==='string'){for(let i=0;i<value.length;i++){const c=value.charCodeAt(i);if(c>=0xd800&&c<=0xdbff){const next=value.charCodeAt(++i);requireThat(next>=0xdc00&&next<=0xdfff,'Unpaired surrogate');}else requireThat(c<0xdc00||c>0xdfff,'Unpaired surrogate');}return JSON.stringify(value);}
 if(typeof value==='number'){requireThat(Number.isSafeInteger(value)&&!Object.is(value,-0),'Only safe integer JSON numbers');return String(value);}
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 requireThat(value&&Object.getPrototypeOf(value)===Object.prototype,'Plain JSON objects only');
 return '{'+Object.keys(value).sort().map(key=>{requireThat(!['__proto__','constructor','prototype'].includes(key),'Reserved object key');return canonical(key)+':'+canonical(value[key]);}).join(',')+'}';
}
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const same=(a,b)=>canonical(a)===canonical(b);
export function verifyDigest(artifact){const key=artifact.schema==='NPCDexContentRevision/1'?'revisionId':'digest';const {[key]:expected,...body}=artifact;requireThat(expected===sha(canonical(body)),'Artifact digest differs');return expected;}
const reseal=artifact=>{const a=clone(artifact),key=a.schema==='NPCDexContentRevision/1'?'revisionId':'digest';delete a[key];return {...a,[key]:sha(canonical(a))};};

// Deliberately restricted schema-keyword evaluator for this design bundle, not a
// general JSON Schema implementation or independent metaschema conformance test.
const keywords=new Set(['$schema','$id','$defs','title','description','$ref','type','enum','const','oneOf','anyOf','allOf','if','then','required','properties','additionalProperties','items','uniqueItems','minItems','minLength','pattern','minimum','maximum']);
function lintSchema(s){if(typeof s!=='object'||s===null)return;for(const k of Object.keys(s))requireThat(keywords.has(k),'Unsupported schema keyword '+k);for(const key of ['$defs','properties'])for(const sub of Object.values(s[key]||{}))lintSchema(sub);for(const key of ['oneOf','anyOf','allOf'])for(const sub of s[key]||[])lintSchema(sub);for(const key of ['if','then','items','additionalProperties'])if(s[key]&&typeof s[key]==='object')lintSchema(s[key]);}
function conforms(value,s){
 if(s.$ref)return conforms(value,schema.$defs[s.$ref.split('/').at(-1)]);
 if('const' in s&&!same(value,s.const))return false;
 if(s.enum&&!s.enum.some(x=>same(x,value)))return false;
 if(s.oneOf&&s.oneOf.filter(x=>conforms(value,x)).length!==1)return false;
 if(s.anyOf&&!s.anyOf.some(x=>conforms(value,x)))return false;
 if(s.allOf&&!s.allOf.every(x=>conforms(value,x)))return false;
 if(s.if&&conforms(value,s.if)&&s.then&&!conforms(value,s.then))return false;
 const type=value===null?'null':Array.isArray(value)?'array':typeof value;
 if(s.type&&!(s.type===type||s.type==='integer'&&Number.isSafeInteger(value)))return false;
 if(typeof value==='string'&&(s.minLength!==undefined&&[...value].length<s.minLength||s.pattern&&!new RegExp(s.pattern).test(value)))return false;
 if(typeof value==='number'&&(s.minimum!==undefined&&value<s.minimum||s.maximum!==undefined&&value>s.maximum))return false;
 if(Array.isArray(value)){
  if(s.minItems!==undefined&&value.length<s.minItems)return false;
  if(s.uniqueItems&&new Set(value.map(canonical)).size!==value.length)return false;
  if(s.items&&!value.every(x=>conforms(x,s.items)))return false;
 }
 if(type==='object'){
  if((s.required||[]).some(k=>!Object.hasOwn(value,k)))return false;
  for(const [k,v]of Object.entries(value)){if(s.properties&&Object.hasOwn(s.properties,k)){if(!conforms(v,s.properties[k]))return false;}else if(s.additionalProperties===false)return false;else if(s.additionalProperties&&typeof s.additionalProperties==='object'&&!conforms(v,s.additionalProperties))return false;}
 }
 return true;
}
const structural=a=>requireThat(conforms(a,schema),'Schema structure rejected');
const get=(o,p)=>{const parts=p.slice(1).split('/').map(k=>k.replace(/~1/g,'/').replace(/~0/g,'~'));for(const k of parts){requireThat(!['__proto__','prototype','constructor'].includes(k),'Reserved pointer');if(!o||!Object.hasOwn(o,k))return {exists:false};o=o[k];}return {exists:true,value:o};};
const set=(o,p,state)=>{const parts=p.slice(1).split('/').map(k=>k.replace(/~1/g,'/').replace(/~0/g,'~'));for(const k of parts)requireThat(!['__proto__','prototype','constructor'].includes(k),'Reserved pointer');let node=o;for(const k of parts.slice(0,-1)){requireThat(node&&Object.hasOwn(node,k),'Missing pointer parent');node=node[k];}requireThat(state.exists,'Physical content deletion forbidden');node[parts.at(-1)]=clone(state.value);};
const unique=(values,label)=>requireThat(new Set(values).size===values.length,'Duplicate '+label);
function graph(records){
 const map=new Map(records.map(r=>[r.recordId,r]));unique(records.map(r=>r.recordId),'record');
 const exists=(id,kind)=>{const r=map.get(id);requireThat(r,'Missing linked record '+id);if(kind)requireThat(r.kind===kind,'Wrong linked kind');return r;};
 for(const r of records){structural(r);verifyDigest(r);let cursor=r;const seen=new Set([r.recordId]);while(cursor.parentRecordId){requireThat(!seen.has(cursor.parentRecordId),'Hierarchy cycle');seen.add(cursor.parentRecordId);cursor=exists(cursor.parentRecordId);}
  const p=r.current.payload;
  if(r.kind==='region'||r.kind==='profile'||r.kind==='shared')requireThat(r.parentRecordId===null,'Registry records must be root-owned');
  if(r.kind==='map'){exists(r.parentRecordId,'region');requireThat(r.parentRecordId===p.regionId,'Region mismatch');exists(p.timelineRef,'shared');for(const id of p.subzoneIds)requireThat(exists(id,'subzone').parentRecordId===r.recordId,'Sub-zone membership mismatch');}
  if(r.kind==='subzone'){exists(r.parentRecordId,'map');requireThat(p.mapId===r.parentRecordId,'Map mismatch');for(const [key,kind]of [['appearanceIds','appearance'],['sceneIds','scene'],['interactiveIds','interactive']])for(const id of p[key])requireThat(exists(id,kind).parentRecordId===r.recordId,'Verse membership mismatch');}
  if(['appearance','scene','interactive'].includes(r.kind)){
   const parent=exists(r.parentRecordId,'subzone');const list={appearance:'appearanceIds',scene:'sceneIds',interactive:'interactiveIds'}[r.kind];requireThat(parent.current.payload[list].includes(r.recordId),'Missing inverse membership');
  }
  if(r.kind==='appearance')for(const id of [p.profileId,...Object.values(p.profileByPlayerGender)].filter(Boolean))exists(id,'profile');
  if(p.participantIds)for(const id of p.participantIds){const participant=exists(id,'appearance');if(r.current.lifecycle==='active')requireThat(participant.current.lifecycle==='active','Active scene contains inactive appearance');}
  if(p.points){requireThat(same([...Object.keys(p.points)].sort(),[...p.pointOrder].sort()),'Point order mismatch');for(const [key,point]of Object.entries(p.points)){requireThat(key===point.id,'Point dictionary mismatch');requireThat(same(Object.keys(point.blocks).sort(),[...point.blockOrder].sort()),'Block order mismatch');for(const [k,b]of Object.entries(point.blocks))requireThat(k===b.id,'Block dictionary mismatch');}}
 }
 return map;
}
function validatePackage(pkg){
 structural(pkg);verifyDigest(pkg);
 for(const m of pkg.mappings)for(const locator of m.locators)requireThat(!/^(?:[a-z][a-z0-9+.-]*:|[\\/])/i.test(locator.path)&&!locator.path.split(/[\\/]/).some(p=>p==='..'||p==='.'),'Unsafe source path');
 const records=graph(pkg.recordSnapshots);requireThat(records.get(pkg.mapId)?.kind==='map','Package map missing');
 for(const item of [...pkg.recordSnapshots,...pkg.plans,...pkg.mappings,...pkg.observations.map(o=>o.review)]){structural(item);verifyDigest(item);requireThat(item.workspaceId===pkg.workspaceId,'Mixed workspace');}
 unique(pkg.plans.map(p=>p.planId),'plan');unique(pkg.groups.map(g=>g.groupId),'group');unique(pkg.assets.map(a=>a.assetId),'asset');
 const groupIds=new Set(pkg.groups.map(g=>g.groupId)),memberIds=[];
 unique(pkg.groups.flatMap(g=>g.recordIds),'record write across independent groups');
 for(const g of pkg.groups){for(const id of g.dependsOnGroups)requireThat(groupIds.has(id)&&id!==g.groupId,'Unknown/self group dependency');memberIds.push(...g.itemIds);requireThat(same([...new Set(pkg.plans.filter(p=>g.itemIds.includes(p.planId)).flatMap(p=>p.changes.map(c=>c.recordId)))].sort(),[...g.recordIds].sort()),'Group record footprint differs');}
 unique(memberIds,'group plan membership');requireThat(same([...memberIds].sort(),pkg.plans.map(p=>p.planId).sort()),'Incomplete group membership');
 const visit=(id,trail=new Set())=>{requireThat(!trail.has(id),'Group dependency cycle');for(const dep of pkg.groups.find(g=>g.groupId===id).dependsOnGroups)visit(dep,new Set([...trail,id]));};for(const id of groupIds)visit(id);
 for(const p of pkg.plans){requireThat(p.workflow==='ready'&&['ADD','UPDATE','REMOVE'].includes(p.intent)&&p.instructions.trim(),'Package includes non-executable plan');requireThat(p.changes.length>0,'No requested mutations');requireThat(p.target.recordId===p.baseline.recordId,'Plan baseline target differs');for(const read of [p.baseline,...p.readSet])requireThat(records.get(read.recordId)?.revisionId===read.revisionId,'Missing/stale package baseline');
  for(const c of p.changes){const r=records.get(c.recordId);requireThat(r&&p.readSet.some(x=>x.recordId===c.recordId&&x.revisionId===r.revisionId),'Write lacks baseline');requireThat(c.recordId===p.target.recordId,'Plan writes outside target record');requireThat(same(get(r.current,c.path),c.before),'Patch before differs');if(p.target.pointId)requireThat(p.target.blockIds.some(id=>c.path.startsWith('/payload/points/'+p.target.pointId+'/blocks/'+id+'/')),'Prompt write outside selected blocks');if(p.intent==='REMOVE'){requireThat(c.path==='/lifecycle'&&c.after.value==='archived','Removal must archive');const owner=pkg.groups.find(g=>g.itemIds.includes(p.planId));for(const scene of pkg.recordSnapshots.filter(r=>r.kind==='scene'&&r.current.lifecycle==='active'&&r.current.payload.participantIds.includes(c.recordId)))requireThat(owner.recordIds.includes(scene.recordId),'Dependent scene must share removal group');}}
  for(const assetId of p.requiredAssetIds)requireThat(pkg.assets.some(a=>a.assetId===assetId),'Required asset missing');
 }
 for(const r of pkg.recordSnapshots)for(const digest of r.mappingRefs)requireThat(pkg.mappings.some(m=>m.digest===digest&&m.recordId===r.recordId),'Required mapping missing');
 for(const asset of pkg.assets)if(asset.delivery.kind==='inline'){const bytes=Buffer.from(asset.delivery.base64,'base64');requireThat(bytes.toString('base64')===asset.delivery.base64&&bytes.length===asset.bytes&&sha(bytes)===asset.sha256,'Asset integrity differs');}
 return records;
}
function validateResult(result,pkg,current,{observedActor='fixture:agent',allowedActors=['fixture:agent'],allowIllustrative=true,completedGroups=[]}={}){
 structural(result);verifyDigest(result);requireThat(result.workspaceId===pkg.workspaceId,'Wrong result workspace');requireThat(result.actorClaim===observedActor&&allowedActors.includes(observedActor),'Unapproved server-observed actor');requireThat(result.packageDigest===pkg.digest,'Wrong package revision');requireThat(allowIllustrative||result.rom.verification!=='illustrative','Illustrative evidence cannot enter production');
 const group=pkg.groups.find(g=>g.groupId===result.groupId);requireThat(group,'Unknown result group');requireThat(group.dependsOnGroups.every(id=>completedGroups.includes(id)),'Dependency group incomplete');requireThat(same([...group.itemIds].sort(),[...result.itemIds].sort()),'Partial group rejected');unique(result.recordUpdates.map(u=>u.before.recordId),'result record');
 const plans=pkg.plans.filter(p=>result.itemIds.includes(p.planId)),requiredReads=[...new Map(plans.flatMap(p=>p.readSet).map(r=>[r.recordId,r])).values()];requireThat(same([...requiredReads].sort((a,b)=>a.recordId.localeCompare(b.recordId)),[...result.readSet].sort((a,b)=>a.recordId.localeCompare(b.recordId))),'Incomplete/altered read set');
 for(const r of result.readSet)requireThat(current.get(r.recordId)?.revisionId===r.revisionId,'Stale accepted content');
 requireThat(same(group.recordIds.slice().sort(),result.recordUpdates.map(u=>u.before.recordId).sort()),'Extra/missing writes');
 for(const u of result.recordUpdates){verifyDigest(u.after);structural(u.after);requireThat(u.after.recordId===u.before.recordId&&u.after.workspaceId===pkg.workspaceId,'Retargeted result');const base=current.get(u.before.recordId);requireThat(base?.revisionId===u.before.revisionId,'Stale write baseline');requireThat(u.after.parents.length===1&&u.after.parents[0]===u.before.revisionId,'Changed ancestry');requireThat(u.after.kind===base.kind&&u.after.parentRecordId===base.parentRecordId&&same(u.after.mappingRefs,base.mappingRefs)&&same(u.after.legacyRefs,base.legacyRefs)&&same(u.after.legacyData,base.legacyData),'Unscoped identity/mapping edit');
  const expected=clone(base.current);for(const p of plans)for(const change of p.changes.filter(c=>c.recordId===base.recordId)){requireThat(same(get(expected,change.path),change.before),'Patch baseline changed');set(expected,change.path,change.after);}requireThat(same(expected,u.after.current),'Unapproved content mutation');
 }
 for(const digest of result.resolvedReviewDigests)requireThat(pkg.observations.some(o=>o.review.digest===digest),'Unrelated feedback resolution');
 const trial=new Map(current);for(const u of result.recordUpdates)trial.set(u.after.recordId,u.after);graph([...trial.values()]);return trial;
}
// Projection state deliberately separates fixed plan versions, acknowledgements,
// current mutable drafts, review annotations and accepted implementation history.
function reconcile(state,result,pkg){
 const previous=state.results.get(result.resultId);
 if(previous){requireThat(previous===result.digest,'Reused result identity with changed bytes');return state;}
 const records=validateResult(result,pkg,state.records),plans=new Map(state.plans),acks=new Set(state.acknowledged),reviews=new Map(state.reviews);
 for(const p of pkg.plans.filter(p=>result.itemIds.includes(p.planId))){acks.add(p.digest);const active=plans.get(p.planId);if(active?.digest===p.digest)plans.delete(p.planId);}
 for(const [id,review]of reviews){let next=review;if(result.recordUpdates.some(u=>u.before.recordId===review.target.recordId))next={...next,testStatus:'unreviewed'};if(result.resolvedReviewDigests.includes(review.digest)&&pkg.observations.some(o=>o.review.digest===review.digest))next={...next,flag:'none',note:''};reviews.set(id,next);}
 return {...state,records,plans,acknowledged:acks,reviews,results:new Map([...state.results,[result.resultId,result.digest]]),history:[...state.history,result.digest]};
}
const pkg=load('examples/map-package.json'),dialogue=load('examples/dialogue-result.json'),removal=load('examples/dependent-removal-result.json'),draft=load('examples/newer-draft.json'),correction=load('examples/documentation-correction.json'),binding=load('examples/task-binding.json'),publication=load('examples/group-publication.json');
const projection=(currentPlans=pkg.plans)=>({records:new Map(pkg.recordSnapshots.map(r=>[r.recordId,r])),plans:new Map(currentPlans.map(p=>[p.planId,p])),acknowledged:new Set(),reviews:new Map(pkg.observations.map(o=>[o.review.reviewId,{...o.review,testStatus:'verified'}])),results:new Map(),history:[]});
let records;
check('Schema uses only locally evaluated structural keywords',()=>lintSchema(schema));
check('All nine artifact kinds in examples satisfy structural and digest checks',()=>{for(const a of [pkg,...pkg.recordSnapshots,...pkg.mappings,...pkg.plans,...pkg.observations.map(o=>o.review),dialogue,removal,draft,correction,binding,publication]){structural(a);verifyDigest(a);}});
check('Whole map package resolves hierarchy, identity, mapping, assets, plans and groups',()=>{records=validatePackage(pkg);});
check('Independent dialogue result accepts without removal/addition',()=>requireThat(validateResult(dialogue,pkg,records).get('fixture:guide').current.payload.points['fixture:point-guide'].blocks['fixture:block-guide'].text==='The lab is east of here.','Dialogue not applied'));
check('Complete dependent removal archives appearance and retains shared profile',()=>{const t=validateResult(removal,pkg,records);requireThat(t.get('fixture:visitor').current.lifecycle==='archived'&&t.has('fixture:profile-visitor'),'Profile lost');requireThat(t.get('fixture:scene').current.payload.participantIds.length===1,'Scene not updated');});
check('Independent groups converge in either arrival order',()=>{const a=validateResult(removal,pkg,validateResult(dialogue,pkg,records)),b=validateResult(dialogue,pkg,validateResult(removal,pkg,records));requireThat(same([...a],[...b]),'Order changed projection');});
check('A newer unsubmitted draft is retained when the older package applies',()=>{const state=projection([draft,...pkg.plans.slice(1)]),next=reconcile(state,dialogue,pkg);requireThat(next.plans.get(draft.planId)?.digest===draft.digest&&next.acknowledged.has(pkg.plans[0].digest),'Draft overwritten or published version not acknowledged');});
check('Only the exact implemented plan version is cleared from pending work',()=>{const state=projection(),next=reconcile(state,dialogue,pkg);requireThat(!next.plans.has(pkg.plans[0].planId)&&next.plans.has(pkg.plans[1].planId),'Wrong pending plan cleared');requireThat(state.plans.has(pkg.plans[0].planId),'Input state mutated');});
check('Implementation resets testing without clearing unresolved notes',()=>{const state=projection(),next=reconcile(state,dialogue,pkg),review=next.reviews.get('fixture:note');requireThat(review.testStatus==='unreviewed'&&review.note===state.reviews.get('fixture:note').note,'Testing or feedback lost');});
check('Replaying an accepted result is idempotent',()=>{const next=reconcile(projection(),dialogue,pkg);assert.equal(reconcile(next,dialogue,pkg),next);assert.equal(next.history.length,1);});
check('Reusing a result identity with different content requires review',()=>{const next=reconcile(projection(),dialogue,pkg),r=clone(dialogue);r.checks.push('Different report');assert.throws(()=>reconcile(next,reseal(r),pkg),/Reused result/);});
check('A newer note is preserved when an older annotation was reported resolved',()=>{const state=projection(),review=state.reviews.get('fixture:note'),newerReview=reseal({...review,note:'Newer feedback',operationId:'fixture:newer-note'});state.reviews.set(review.reviewId,newerReview);const r=clone(dialogue);r.resolvedReviewDigests=[review.digest];const next=reconcile(state,reseal(r),pkg);assert.equal(next.reviews.get(review.reviewId).note,'Newer feedback');});
check('Partial dependent group is rejected before any projection changes',()=>{const r=clone(removal);r.recordUpdates.pop();r.itemIds.pop();const original=canonical([...records]);assert.throws(()=>validateResult(reseal(r),pkg,records));assert.equal(canonical([...records]),original);});
check('Documentation correction preserves history and makes an older result stale',()=>{requireThat(correction.romChangeRequested===false,'Correction dispatch');const t=new Map(records);t.set(correction.recordUpdates[0].after.recordId,correction.recordUpdates[0].after);assert.throws(()=>validateResult(dialogue,pkg,t),/Stale/);requireThat(records.get('fixture:guide').revisionId===correction.recordUpdates[0].before.revisionId,'Old version lost');});
check('Claimed actor does not replace server-observed identity',()=>assert.throws(()=>validateResult(dialogue,pkg,records,{observedActor:'fixture:unknown'}),/actor/));
check('Broad shared identity can be held for review by the adapter policy',()=>assert.throws(()=>validateResult(dialogue,pkg,records,{allowedActors:[]}),/actor/));
check('Illustrative ROM evidence cannot pass production evidence mode',()=>assert.throws(()=>validateResult(dialogue,pkg,records,{allowIllustrative:false}),/Illustrative/));
check('Wrong package version is rejected',()=>{const r=clone(dialogue);r.packageDigest='0'.repeat(64);assert.throws(()=>validateResult(reseal(r),pkg,records),/package/);});
check('Wrong workspace is rejected',()=>{const r=clone(dialogue);r.workspaceId='fixture:other';assert.throws(()=>validateResult(reseal(r),pkg,records),/workspace/);});
check('Unknown result group is not inferred complete',()=>{const r=clone(dialogue);r.groupId='fixture:unknown';assert.throws(()=>validateResult(reseal(r),pkg,records),/group/);});
check('Omitted read dependencies are rejected',()=>{const r=clone(dialogue);r.readSet.pop();assert.throws(()=>validateResult(reseal(r),pkg,records),/read set/);});
check('Unrelated record mutation is rejected',()=>{const r=clone(dialogue);r.recordUpdates[0].after.current.payload.name='Unapproved Rename';r.recordUpdates[0].after=reseal(r.recordUpdates[0].after);assert.throws(()=>validateResult(reseal(r),pkg,records),/Unapproved/);});
check('Retargeting a result to another entity is rejected',()=>{const r=clone(dialogue);r.recordUpdates[0].after.recordId='fixture:visitor';r.recordUpdates[0].after=reseal(r.recordUpdates[0].after);assert.throws(()=>validateResult(reseal(r),pkg,records),/Retargeted/);});
check('Physical record disappearance is not a removal result',()=>{const r=clone(removal);r.recordUpdates[0].after.current.lifecycle='deleted';r.recordUpdates[0].after=reseal(r.recordUpdates[0].after);assert.throws(()=>validateResult(reseal(r),pkg,records));});
check('Unrelated feedback cannot be cleared',()=>{const r=clone(dialogue);r.resolvedReviewDigests=['0'.repeat(64)];assert.throws(()=>validateResult(reseal(r),pkg,records),/feedback/);});
check('Tampered package payload is rejected',()=>{const p=clone(pkg);p.instructions.push('tampered');assert.throws(()=>validatePackage(p),/digest/);});
check('Missing required asset is rejected',()=>{const p=clone(pkg);p.assets=[];assert.throws(()=>validatePackage(reseal(p)),/asset/);});
check('Changed asset bytes are rejected',()=>{const p=clone(pkg);p.assets[0].delivery.base64='BAUGBw==';assert.throws(()=>validatePackage(reseal(p)),/integrity/);});
check('Missing mapping dependency is rejected',()=>{const p=clone(pkg);p.mappings=[];assert.throws(()=>validatePackage(reseal(p)),/mapping/);});
check('Draft and editorial FINAL plans cannot become executable package entries',()=>{for(const mutate of [p=>p.workflow='draft',p=>p.intent='FINAL']){const p=clone(pkg);mutate(p.plans[0]);p.plans[0]=reseal(p.plans[0]);assert.throws(()=>validatePackage(reseal(p)),/non-executable/);}});
check('Missing group membership is rejected',()=>{const p=clone(pkg);p.groups.pop();assert.throws(()=>validatePackage(reseal(p)),/membership/);});
check('Removing an appearance cannot be packaged apart from its dependent scene',()=>{const p=clone(pkg);const g=p.groups[1];g.itemIds=[p.plans[1].planId];g.recordIds=['fixture:visitor'];p.groups.push({groupId:'fixture:split-scene',itemIds:[p.plans[2].planId],dependsOnGroups:[],recordIds:['fixture:scene'],acceptanceChecks:['Scene changed.']});assert.throws(()=>validatePackage(reseal(p)),/Dependent scene/);});
check('A prompt plan cannot write outside its selected blocks',()=>{const p=clone(pkg);p.plans[0].changes=[{...p.plans[0].changes[0],path:'/payload/name',before:{exists:true,value:'Guide'},after:{exists:true,value:'Other'}}];p.plans[0]=reseal(p.plans[0]);assert.throws(()=>validatePackage(reseal(p)),/Prompt write/);});
check('Source traversal, absolute paths and arbitrary URLs are rejected',()=>{for(const sourcePath of ['../secret','C:/secret','/secret','https://example.invalid/secret']){const p=clone(pkg);p.mappings[0].locators[0].path=sourcePath;p.mappings[0]=reseal(p.mappings[0]);assert.throws(()=>validatePackage(reseal(p)),/Unsafe source path/);}});
check('Group dependency cycles are rejected',()=>{const p=clone(pkg);p.groups[0].dependsOnGroups=[p.groups[1].groupId];p.groups[1].dependsOnGroups=[p.groups[0].groupId];assert.throws(()=>validatePackage(reseal(p)),/cycle/);});
check('A result waits for prerequisite groups',()=>{const p=clone(pkg);p.groups[0].dependsOnGroups=[p.groups[1].groupId];const next=reseal(p),r=clone(dialogue);r.packageDigest=next.digest;assert.throws(()=>validateResult(reseal(r),next,records),/Dependency/);});
check('A missing parent record blocks materialization',()=>assert.throws(()=>graph(pkg.recordSnapshots.filter(r=>r.kind!=='region')),/Missing/));
check('Unknown structural keys and wrong record payload kinds are rejected',()=>{const r=clone(pkg.recordSnapshots[0]);r.unrecognized=true;assert.equal(conforms(r,schema),false);const a=clone(pkg.recordSnapshots[0]);a.current.payload={name:'Wrong'};assert.equal(conforms(a,schema),false);});
check('Publication cannot apply a group with a missing artifact',()=>{const available=new Set([removal.digest,...removal.recordUpdates.map(u=>u.after.revisionId)]);requireThat(publication.artifactDigests.every(id=>available.has(id)),'Missing complete publication');available.delete(removal.recordUpdates[0].after.revisionId);requireThat(!publication.artifactDigests.every(id=>available.has(id)),'Partial publication accepted');});
check('Task binding verifies exact downloadable bytes and never dispatches',()=>{const bytes=fs.readFileSync(path.join(root,'examples/map-package.json'));assert.equal(sha(bytes),binding.verifiedAttachmentSha256);assert.equal(binding.dispatch,'none');});
check('Canonical hash vector ignores object key order and preserves text/array order',()=>{for(const v of load('examples/hash-vectors.json').vectors){assert.equal(canonical(v.input),v.canonical);assert.equal(sha(canonical(v.input)),v.sha256);assert.equal(canonical({n:null,a:[2,1],z:'Keep  spaces\n'}),v.canonical);assert.notEqual(sha(canonical({...v.input,z:'Keep spaces\n'})),v.sha256);}assert.equal(canonical({'2':2,'10':10}),'{"10":10,"2":2}');});
check('Noncanonical numeric values, unpaired surrogates and reserved keys are rejected',()=>{for(const v of [1.25,-0,Infinity,Number.MAX_SAFE_INTEGER+1,'\ud800',JSON.parse('{"__proto__":1}')])assert.throws(()=>canonical(v));});

let compatibility={checked:false,reason:'No legacy file argument supplied; fixture checks only.'};
const legacyArg=process.argv.find(a=>a.startsWith('--legacy='));
if(legacyArg){
 const legacyPath=path.resolve(legacyArg.slice('--legacy='.length)),bytes=fs.readFileSync(legacyPath),legacy=JSON.parse(bytes),originalHash=sha(bytes);
 let requests=0;check('Protected legacy baseline/request hashes retain original JSON.stringify semantics',()=>{for(const r of legacy.changeRequests||[]){assert.equal(sha(JSON.stringify(r.baseline)),r.baselineHash);assert.equal(sha(JSON.stringify({target:r.target,intent:r.intent,instructions:r.instructions,proposedDialogue:r.proposedDialogue,sharedSceneHandling:r.sharedSceneHandling,updatedAt:r.updatedAt})),r.requestHash);requests++;}});
 const entries=[];let aliases=0;const add=(town,kind,item)=>entries.push({townId:town,kind,id:item.id});
 for(const t of legacy.towns){add(t.id,'town',t);for(const l of t.locations){add(t.id,'location',l);if(l.aliasOf)aliases++;}for(const c of t.characters)add(t.id,'character',c);for(const a of t.areas){add(t.id,'area',a);for(const e of a.elements){add(t.id,'element',e);for(const p of e.points){add(t.id,'point',p);for(const b of p.blocks)add(t.id,'block',b);}}}}
 check('Scoped legacy identities are preserved without label-based merging',()=>unique(entries.map(e=>JSON.stringify([e.townId,e.kind,e.id])),'legacy identity'));
 check('Protected source bytes remain unchanged after inspection',()=>assert.equal(sha(fs.readFileSync(legacyPath)),originalHash));
 compatibility={checked:true,sourceRole:'Protected U19 checkpoint; representative compatibility evidence only, not migration authority',sourceSha256:originalHash,sourceBytes:bytes.length,revision:legacy.revision,scopeIdentities:entries.length,counts:Object.fromEntries(['town','location','area','character','element','point','block'].map(kind=>[kind,entries.filter(e=>e.kind===kind).length])),plans:Object.keys(legacy.changePlans||{}).length,history:legacy.history?.length||0,requestsWithVerifiedLegacyHashes:requests,locationAliases:aliases,rootFields:Object.keys(legacy),unknownRootFieldsPolicy:'Preserve exact original bytes and all unknown fields; derive and validate the later projection without flattening or dropping them.'};
}
const report={schema:'U20AContractModelReport/1',status:'passed',checks:checks.length,scenarios:checks,compatibility,limitations:['Design model only; no live YouTrack/project/ROM/installer checks or writes.','Schema evaluator covers this bundle’s keywords only; an independent standard metaschema/validator check remains a later implementation gate.','No production parser, authorization, durable discovery, conditional-write or cross-issue atomicity is established.','Examples use only fictional identities, source paths, assets and ROM evidence. Production must reject illustrative evidence.','No migration, complete legacy projection or real ROM extraction has been implemented.']};
if(process.argv.includes('--report'))fs.writeFileSync(path.join(root,'verification-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
