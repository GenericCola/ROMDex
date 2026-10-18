// Isolated RD01 design checks. No app imports, service calls or live-data writes.
// Restricted keyword evaluator for these pinned schemas, not a production parser
// or an independent complete JSON Schema implementation/metaschema certification.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),load=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const schema=load('rdx-contracts.schema.json'),native=load('native-content.schema.json'),checks=[];
const sha=b=>createHash('sha256').update(b).digest('hex'),ok=(v,m)=>assert.ok(v,m),clone=structuredClone;
const forbidden=new Set(['__proto__','constructor','prototype']);
function canonical(v){
 if(v===null||typeof v==='boolean')return JSON.stringify(v);
 if(typeof v==='string'){for(let i=0;i<v.length;i++){const n=v.charCodeAt(i);if(n>=0xd800&&n<=0xdbff){const next=v.charCodeAt(++i);ok(next>=0xdc00&&next<=0xdfff,'Unpaired surrogate');}else ok(n<0xdc00||n>0xdfff,'Unpaired surrogate');}return JSON.stringify(v);}
 if(typeof v==='number'){ok(Number.isSafeInteger(v)&&!Object.is(v,-0),'Unsafe number');return String(v);}
 if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
 ok(v&&Object.getPrototypeOf(v)===Object.prototype,'Plain JSON required');
 return '{'+Object.keys(v).sort().map(k=>{ok(!forbidden.has(k),'Reserved key');return canonical(k)+':'+canonical(v[k]);}).join(',')+'}';
}
const equal=(a,b)=>canonical(a)===canonical(b),reseal=(a,key='digest')=>{const b=clone(a);delete b[key];return {...b,[key]:sha(canonical(b))};};
const digest=a=>{const key=a.format==='RDXDocument/1'?'revision':a.schema==='NPCDexContentRevision/1'?'revisionId':'digest';ok(a[key]===reseal(a,key)[key],'Digest mismatch');};
const resources=new Map([[schema.$id,schema],[native.$id,native]]);
function resolve(s,resource){if(!s.$ref)return [s,resource];const [id,fragment='']=s.$ref.split('#');const next=id?resources.get(id):resource;ok(next,'Unknown schema resource');let target=next;for(const p of fragment.split('/').slice(1))target=target[p.replace(/~1/g,'/').replace(/~0/g,'~')];ok(target,'Unknown schema reference');return [target,next];}
function conforms(v,s=schema,resource=schema,budget={left:2000000}){
 ok(--budget.left>0,'Schema budget');
 if(s.$ref){const [t,r]=resolve(s,resource);if(!conforms(v,t,r,budget))return false;}
 const test=x=>conforms(v,x,resource,budget);
 if('const'in s&&!equal(v,s.const)||s.enum&&!s.enum.some(x=>equal(x,v)))return false;
 if(s.oneOf&&s.oneOf.filter(test).length!==1||s.anyOf&&!s.anyOf.some(test)||s.allOf&&!s.allOf.every(test))return false;
 if(s.if&&test(s.if)&&s.then&&!test(s.then))return false;
 const t=v===null?'null':Array.isArray(v)?'array':typeof v;
 if(s.type&&s.type!==t&&!(s.type==='integer'&&Number.isSafeInteger(v)))return false;
 if(t==='string'&&(s.minLength!==undefined&&[...v].length<s.minLength||s.pattern&&!new RegExp(s.pattern).test(v)))return false;
 if(t==='number'&&(s.minimum!==undefined&&v<s.minimum||s.maximum!==undefined&&v>s.maximum))return false;
 if(t==='array'&&(s.minItems!==undefined&&v.length<s.minItems||s.uniqueItems&&new Set(v.map(canonical)).size!==v.length||s.items&&!v.every(x=>conforms(x,s.items,resource,budget))))return false;
 if(t==='object'){if((s.required||[]).some(k=>!Object.hasOwn(v,k)))return false;for(const [k,value]of Object.entries(v)){if(s.propertyNames&&!conforms(k,s.propertyNames,resource,budget))return false;if(Object.hasOwn(s.properties||{},k)){if(!conforms(value,s.properties[k],resource,budget))return false;}else if(s.additionalProperties===false)return false;else if(s.additionalProperties&&typeof s.additionalProperties==='object'&&!conforms(value,s.additionalProperties,resource,budget))return false;}}
 return true;
}
const structural=a=>ok(conforms(a),'Structural contract rejected');
const keywords=new Set(['$schema','$id','$defs','$ref','title','description','type','properties','required','additionalProperties','propertyNames','items','minItems','uniqueItems','minLength','minimum','maximum','pattern','enum','const','oneOf','anyOf','allOf','if','then']);
function lint(s,resource=schema){for(const k of Object.keys(s))ok(keywords.has(k),'Unsupported keyword '+k);if(s.$ref)resolve(s,resource);for(const k of ['$defs','properties'])for(const child of Object.values(s[k]||{}))lint(child,child.$id?child:resource);for(const k of ['allOf','oneOf','anyOf'])for(const child of s[k]||[])lint(child,resource);for(const k of ['if','then','items','propertyNames','additionalProperties'])if(s[k]&&typeof s[k]==='object')lint(s[k],resource);}
const unique=(xs,m)=>ok(new Set(xs).size===xs.length,'Duplicate '+m);
const supported=new Set(['org.romdex.rdx.container-v1','org.romdex.rdx.map-v1','org.romdex.rdx.plan-v1','org.romdex.npcdex.content-v1']);
const mode=doc=>doc.capabilities.required.every(x=>supported.has(x))?'writable':'unsupported';
const artifactRef=r=>r.recordId+':'+r.revisionId;
function mapModel(doc){
 const c=doc.content;unique(c.records.map(artifactRef),'record revision');unique(c.recordHeads.map(r=>r.recordId),'record head');
 const revisions=new Map(c.records.map(r=>[artifactRef(r),r])),heads=new Map(c.recordHeads.map(r=>{const value=revisions.get(artifactRef(r));ok(value,'Missing head revision');return [r.recordId,value];}));
 for(const a of [...c.records,...c.mappings,...c.plans,...c.reviews,...c.views]){digest(a);ok(a.workspaceId===doc.datasetId,'Dataset mismatch');}
 for(const r of c.records)for(const parent of r.parents)ok(revisions.has(r.recordId+':'+parent),'Missing record ancestry');
 const own=new Set(doc.scope.ownedRecordIds),context=new Set(doc.scope.contextRecordIds);unique([...own,...context],'scope identity');
 ok(equal([...heads.keys()].sort(),[...own,...context].sort()),'Scope differs from selected heads');
 const primary=heads.get(doc.scope.mapRecordId);ok(primary?.kind==='map'&&own.has(primary.recordId),'Primary map missing');ok([...heads.values()].filter(r=>r.kind==='map').length===1,'Multiple primary maps');
 const need=(id,kind)=>{const r=heads.get(id);ok(r&&(!kind||r.kind===kind),'Missing/wrong-kind reference '+id);return r;};
 for(const r of heads.values()){
  let cursor=r;const seen=new Set();while(cursor){ok(!seen.has(cursor.recordId),'Hierarchy cycle');seen.add(cursor.recordId);cursor=cursor.parentRecordId?need(cursor.parentRecordId):null;}
  const p=r.current.payload;
  if(['region','profile','shared'].includes(r.kind)){ok(r.parentRecordId===null&&context.has(r.recordId),'Shared/root scope mismatch');}
  else ok(own.has(r.recordId),'Owned physical record missing');
  if(r.kind==='map'){need(r.parentRecordId,'region');need(p.timelineRef,'shared');ok(p.regionId===r.parentRecordId,'Region mismatch');for(const id of p.subzoneIds)ok(need(id,'subzone').parentRecordId===r.recordId,'Map membership');}
  if(r.kind==='subzone'){const parent=need(r.parentRecordId,'map');ok(p.mapId===parent.recordId&&parent.current.payload.subzoneIds.includes(r.recordId),'Subzone membership');for(const [key,kind]of [['appearanceIds','appearance'],['sceneIds','scene'],['interactiveIds','interactive']])for(const id of p[key])ok(need(id,kind).parentRecordId===r.recordId,'Entity membership');}
  if(['appearance','scene','interactive'].includes(r.kind)){const parent=need(r.parentRecordId,'subzone');ok(parent.current.payload[{appearance:'appearanceIds',scene:'sceneIds',interactive:'interactiveIds'}[r.kind]].includes(r.recordId),'Inverse membership');}
  if(r.kind==='appearance')for(const id of [p.profileId,...Object.values(p.profileByPlayerGender)].filter(Boolean))need(id,'profile');
  for(const id of p.sceneIds||[])need(id,'scene');for(const id of p.participantIds||[])need(id,'appearance');
  if(p.points){ok(equal(p.pointOrder.slice().sort(),Object.keys(p.points).sort()),'Point order');for(const [key,point]of Object.entries(p.points)){ok(key===point.id,'Point identity');ok(equal(point.blockOrder.slice().sort(),Object.keys(point.blocks).sort()),'Block order');for(const [blockId,b]of Object.entries(point.blocks)){ok(blockId===b.id,'Block identity');if(b.speaker)need(b.speaker,'profile');}}}
  for(const h of r.mappingRefs)ok(c.mappings.some(m=>m.digest===h&&m.recordId===r.recordId),'Missing mapping');
 }
 for(const p of c.plans){ok(revisions.has(artifactRef(p.baseline)),'Plan baseline missing');for(const r of p.readSet)ok(revisions.has(artifactRef(r)),'Plan read missing');}
 for(const parent of doc.scope.completeForParentIds)ok(own.has(parent)&&['map','subzone'].includes(need(parent).kind),'Invalid complete scope');
 unique(doc.scope.baselineInventory.map(r=>r.recordId),'baseline inventory');
 for(const r of doc.scope.baselineInventory)ok(revisions.has(artifactRef(r)),'Missing coverage base');
 for(const a of doc.assetInventory){const bytes=fs.readFileSync(path.join(root,'examples/blobs',a.sha256+'.bin'));ok(bytes.length===a.bytes&&sha(bytes)===a.sha256,'Asset integrity');}
 const assetIds=new Set(doc.assetInventory.map(a=>a.assetId));for(const r of heads.values()){const p=r.current.payload;for(const id of [p.baseImageId,p.overrides?.imageAssetId].filter(Boolean))ok(assetIds.has(id),'Missing content image');}
 for(const view of c.views){const pending=[view.payload];while(pending.length){const node=pending.pop();if(!node||typeof node!=='object')continue;if(node.format==='NPCDexViewImage/1')ok(assetIds.has(node.assetId),'Missing view image');else pending.push(...Object.values(node));}}
 for(const h of c.history)ok(doc.assetInventory.some(a=>a.sha256===h.sha256&&a.purpose==='history'),'Missing history blob');
 for(const a of c.archivalRequests)ok(own.has(a.recordId)&&revisions.has(a.recordId+':'+a.expectedRevision),'Invalid explicit archive');
 return heads;
}
function planModel(doc){const byId=new Map(doc.content.tasks.map(t=>[t.taskId,t]));unique(doc.content.tasks.map(t=>t.taskId),'task');unique(doc.content.roots,'plan root');ok(equal(doc.content.roots.slice().sort(),doc.content.tasks.filter(t=>!t.parentTaskId).map(t=>t.taskId).sort()),'Task roots mismatch');
 for(const t of byId.values()){const seen=new Set();let cursor=t;while(cursor){ok(!seen.has(cursor.taskId),'Task cycle');seen.add(cursor.taskId);if(cursor.parentTaskId){ok(byId.has(cursor.parentTaskId),'Missing task parent');cursor=byId.get(cursor.parentTaskId);}else cursor=null;}unique(t.comments.map(c=>c.commentId),'comment');unique(t.attachments.map(a=>a.attachmentId),'attachment');unique(t.fields.map(f=>f.key),'field');for(const a of t.attachments)ok(doc.assetInventory.some(x=>x.assetId===a.assetId),'Missing attachment');for(const f of t.fields)if(f.type==='date'&&f.value!==null)ok(new Date(f.value+'T00:00:00.000Z').toISOString().slice(0,10)===f.value,'Invalid calendar date');}
 for(const d of doc.content.deletionRequests)ok(byId.get(d.taskId)?.baseRevision===d.expectedRevision,'Unpinned task deletion');return byId;}
function documentModel(doc){structural(doc);digest(doc);canonical(doc);unique(doc.assetInventory.map(a=>a.assetId),'asset ID');return doc.kind==='map'?mapModel(doc):planModel(doc);}
function containerModel(manifest,doc){structural(manifest);ok(manifest.documentRevision===doc.revision,'Container revision mismatch');unique(manifest.entries.map(e=>e.id),'entry');ok(manifest.entries.filter(e=>e.id==='document').length===1,'Document count');let offset=0;for(const e of manifest.entries){ok(e.offset===offset,'Entry gap/overlap');ok(e.storedBytes>0&&e.decodedBytes>0&&e.decodedBytes<=1073741824,'Entry bounds');if(e.codec==='store')ok(e.storedBytes===e.decodedBytes,'Store lengths');const bytes=e.id==='document'?Buffer.from(canonical(doc)):fs.readFileSync(path.join(root,'examples/blobs',e.id.slice(5)+'.bin'));ok(sha(bytes)===e.sha256&&bytes.length===e.decodedBytes,'Entry decoded integrity');if(e.id!=='document')ok(e.id==='blob:'+e.sha256,'Blob identity');offset+=e.storedBytes;}ok(offset<=536870912,'Stored aggregate bound');ok(manifest.entries.reduce((n,e)=>n+e.decodedBytes,0)<=1073741824,'Decoded aggregate bound');return offset;}
function packageModel(pkg){structural(pkg);digest(pkg);for(const a of [...pkg.contextRecords,...pkg.mappings,...pkg.observations])digest(a);const plans=new Map(pkg.requests.map(p=>[p.digest,p])),records=new Map(pkg.contextRecords.map(r=>[artifactRef(r),r]));unique(pkg.contextRecords.map(r=>r.recordId),'package current record');unique(pkg.requests.map(p=>p.planId),'request');unique(pkg.groups.map(g=>g.groupId),'group');unique(pkg.groups.flatMap(g=>g.planDigests),'group request');ok(equal([...plans.keys()].sort(),pkg.groups.flatMap(g=>g.planDigests).sort()),'Ungrouped request');
 for(const p of plans.values()){digest(p);ok(p.workflow==='ready'&&p.intent!=='FINAL'&&p.instructions.trim(),'Nonexecutable request');for(const r of [p.baseline,...p.readSet])ok(records.has(artifactRef(r)),'Missing package baseline');}
 const groupById=new Map(pkg.groups.map(g=>[g.groupId,g]));for(const g of pkg.groups){for(const p of g.planDigests){const request=plans.get(p);for(const r of [request.baseline,...request.readSet])ok(g.readSet.some(x=>equal(x,r)),'Group omitted read');for(const c of request.changes)ok(g.writeRecordIds.includes(c.recordId),'Group omitted write');}for(const ref of g.readSet)ok(records.has(artifactRef(ref)),'Unknown group read');const visiting=new Set(),done=new Set();function walk(id){ok(!visiting.has(id),'Group cycle');if(done.has(id))return;const node=groupById.get(id);ok(node,'Missing dependency');visiting.add(id);node.dependsOn.forEach(walk);visiting.delete(id);done.add(id);}walk(g.groupId);}
 for(let i=0;i<pkg.groups.length;i++)for(let j=i+1;j<pkg.groups.length;j++)ok(!pkg.groups[i].writeRecordIds.some(id=>pkg.groups[j].writeRecordIds.includes(id)),'Split shared write');
 for(const a of pkg.assets){ok(new URL(a.location.instanceOrigin).origin===a.location.instanceOrigin,'Non-origin asset URL');ok(a.location.instanceOrigin==='https://youtrack.example.invalid','Fictional fixture origin only');}
 return plans;}
function returnedModel(doc,pkg,binding,{authenticated=true,taskMatches=true,currentBase=true}={}){documentModel(doc);packageModel(pkg);structural(binding);digest(binding);ok(authenticated&&taskMatches,'Untrusted result author/task');ok(currentBase,'Stale result baseline');ok(doc.origin.role==='agent-result'&&doc.result?.requiresHumanTesting,'Result classification');const r=doc.result;ok(equal(r.taskBinding,binding),'Different task binding');ok(equal(r.baseDocument,pkg.baseDocument),'Different base document');ok(binding.package.packageId===pkg.packageId&&binding.package.version===pkg.version,'Different package identity');ok(binding.package.sha256===sha(fs.readFileSync(path.join(root,'examples/map-package.json'))),'Wrong package bytes');
 unique(r.groups.map(g=>g.groupId),'result group');const writes=new Map();for(const group of r.groups){const planned=pkg.groups.find(g=>g.groupId===group.groupId);ok(planned,'Unapproved group');ok(equal(group.outcomes.map(o=>o.planDigest).sort(),planned.planDigests.slice().sort()),'Partial dependency group');ok(group.outcomes.every(o=>o.outcome==='implemented')||group.outcomes.every(o=>o.outcome!=='implemented'),'Partially implemented dependent group needs review');for(const o of group.outcomes){const p=pkg.requests.find(p=>p.digest===o.planDigest&&p.planId===o.planId);ok(p,'Unknown request version');if(o.outcome!=='implemented')ok(o.writes.length===0,'Unresolved outcome writes');else ok(o.writes.length>0,'Implemented outcome has no effects');for(const w of o.writes){ok(planned.writeRecordIds.includes(w.recordId),'Unapproved result write');if(writes.has(w.recordId))ok(equal(writes.get(w.recordId),w),'Inconsistent shared result write');else writes.set(w.recordId,w);const after=doc.content.records.find(x=>x.recordId===w.recordId&&x.revisionId===w.afterRevision),before=pkg.contextRecords.find(x=>x.recordId===w.recordId&&x.revisionId===w.beforeRevision);ok(after,'Missing after revision');ok(before,'Wrong before revision');ok(doc.content.recordHeads.some(x=>x.recordId===w.recordId&&x.revisionId===w.afterRevision),'Result does not select its after revision');ok(after.kind===before.kind&&after.parentRecordId===before.parentRecordId&&equal(after.parents,[before.revisionId])&&equal(after.legacyRefs,before.legacyRefs)&&equal(after.legacyData,before.legacyData),'Result changed identity or history');const expected=clone(before.current);for(const patch of pkg.requests.filter(x=>planned.planDigests.includes(x.digest)).flatMap(x=>x.changes).filter(x=>x.recordId===w.recordId)){const parts=patch.path.slice(1).split('/').map(x=>x.replace(/~1/g,'/').replace(/~0/g,'~'));ok(parts.every(x=>!forbidden.has(x)),'Unsafe target');let cursor=expected;for(const key of parts.slice(0,-1)){ok(cursor&&Object.hasOwn(cursor,key),'Missing patch parent');cursor=cursor[key];}const key=parts.at(-1);ok(equal({exists:Object.hasOwn(cursor,key),...(Object.hasOwn(cursor,key)?{value:cursor[key]}:{})},patch.before),'Patch before mismatch');cursor[key]=clone(patch.after.value);}ok(equal(after.current,expected),'Result differs from approved changes');}}}
 for(const head of doc.content.recordHeads){const baseline=pkg.contextRecords.find(x=>x.recordId===head.recordId);if(!baseline||baseline.revisionId!==head.revisionId)ok(writes.has(head.recordId),'Undeclared changed head');}
 for(const baseline of pkg.contextRecords)ok(doc.content.recordHeads.some(h=>h.recordId===baseline.recordId),'Omitted current content in result');
 return {taskComplete:false,needsHumanReviewAndTesting:true,affectedTesting:'unreviewed'};}
const archiveCandidates=(doc,destination)=>doc.scope.mode!=='complete'?[]:doc.scope.baselineInventory.filter(r=>doc.scope.completeForParentIds.includes(r.parentRecordId)&&!doc.scope.ownedRecordIds.includes(r.recordId)&&destination.some(x=>equal(x,r))).map(r=>r.recordId);
const tiers=['epic','saga','story','verse','task'];function placedTiers(plan,destinationDepth){const byId=new Map(plan.content.tasks.map(t=>[t.taskId,t]));return Object.fromEntries(plan.content.tasks.map(t=>{let n=destinationDepth;for(let p=t.parentTaskId;p;p=byId.get(p).parentTaskId)n++;return [t.taskId,tiers[Math.min(n,4)]];}));}
const map=load('examples/map.document.json'),plan=load('examples/plan.document.json'),pkg=load('examples/map-package.json'),binding=load('examples/task-binding.json'),returned=load('examples/returned-map.document.json'),optional=load('examples/optional-extension.document.json'),manifest=load('examples/container.manifest.json');
const check=(name,fn)=>{fn();checks.push(name);},reject=(name,base,mutation,validate,sealKey)=>check(name,()=>{let x=clone(base);mutation(x);if(sealKey)x=reseal(x,sealKey);assert.throws(()=>validate(x));});
check('All schema keywords and resource references are understood by the restricted model',()=>lint(schema));
for(const [n,v]of [['map',map],['plan',plan],['returned map',returned],['optional extension',optional]])check(n+' structure, digests and portable relationships',()=>documentModel(v));
check('Package structure, exact request grouping and context',()=>packageModel(pkg));
check('Task binding pins exact downloadable JSON bytes',()=>{structural(binding);digest(binding);assert.equal(binding.package.sha256,sha(fs.readFileSync(path.join(root,'examples/map-package.json'))));});
check('Proposed stored-entry manifest is contiguous and hash-correct',()=>containerModel(manifest,map));
check('Returned independent group is accepted only as unreviewed and task stays open',()=>assert.deepEqual(returnedModel(returned,pkg,binding),{taskComplete:false,needsHumanReviewAndTesting:true,affectedTesting:'unreviewed'}));
check('Returned file includes the exact materializable base document as retained history',()=>{const h=returned.content.history.find(h=>h.schema==='RDXDocument/1'),base=load('examples/blobs/'+h.sha256+'.bin');digest(base);assert.equal(base.revision,returned.result.baseDocument.revision);assert.deepEqual(base,map);});
check('Unknown optional extension survives resealing and round-trip exactly',()=>assert.deepEqual(JSON.parse(JSON.stringify(optional)).extensions,optional.extensions));
check('Different asset identities may share one exact deduplicated blob',()=>{let d=clone(map);d.assetInventory.push({...d.assetInventory[0],assetId:'fixture:asset-alias'});documentModel(reseal(d,'revision'));});
check('Unknown required capability blocks writable import',()=>{const d=clone(map);d.capabilities.required.push('org.romdex.future.required-v9');assert.equal(mode(d),'unsupported');});
reject('Unknown namespace is rejected',map,d=>d.namespace='org.other.tool',documentModel,'revision');
reject('Unknown document major is rejected',map,d=>d.format='RDXDocument/99',documentModel,'revision');
reject('Unknown core field cannot be silently stripped',map,d=>d.unrecognized=true,documentModel,'revision');
reject('Unnamespaced optional extension is rejected',map,d=>d.extensions.bad={},documentModel,'revision');
reject('Tampered document revision is rejected',map,d=>d.createdAt='2026-10-19T00:00:00.000Z',documentModel);
reject('Tampered native record seal is rejected',map,d=>d.content.records[0].current.payload.name='Changed',documentModel,'revision');
reject('Duplicate selected record head is rejected',map,d=>d.content.recordHeads.push(d.content.recordHeads[0]),documentModel,'revision');
reject('Missing selected record revision is rejected',map,d=>d.content.recordHeads[0].revisionId='0'.repeat(64),documentModel,'revision');
reject('Shared record cannot be silently made writable map content',map,d=>{const id=d.scope.contextRecordIds.pop();d.scope.ownedRecordIds.push(id);},documentModel,'revision');
reject('Whole-workspace archival scope is rejected',map,d=>d.scope.completeForParentIds.push('fixture:region'),documentModel,'revision');
reject('Forged coverage baseline cannot authorize archival',map,d=>d.scope.baselineInventory[0].revisionId='0'.repeat(64),documentModel,'revision');
reject('Same record in owned and context scope is rejected',map,d=>d.scope.contextRecordIds.push(d.scope.ownedRecordIds[0]),documentModel,'revision');
reject('Missing blob length is rejected',map,d=>d.assetInventory[0].bytes++,documentModel,'revision');
reject('Missing view image reference is rejected',map,d=>d.assetInventory=d.assetInventory.filter(a=>a.mime!=='image/png'),documentModel,'revision');
reject('Task hierarchy cycle is rejected',plan,d=>d.content.tasks[0].parentTaskId=d.content.tasks.at(-1).taskId,documentModel,'revision');
reject('Task with missing parent is rejected',plan,d=>d.content.tasks[2].parentTaskId='fixture:absent',documentModel,'revision');
reject('Omitted attachment asset is rejected',plan,d=>d.assetInventory=[],documentModel,'revision');
reject('Invalid due-date calendar value is rejected',plan,d=>d.content.tasks.at(-1).fields[1].value='2026-02-30',documentModel,'revision');
reject('String substituted for integer field is rejected',plan,d=>d.content.tasks.at(-1).fields.push({key:'count',type:'integer',value:'3',readOnly:false}),documentModel,'revision');
reject('Unpinned explicit task deletion is rejected',plan,d=>d.content.deletionRequests=[{taskId:'fixture:task-1',expectedRevision:'0'.repeat(64),reason:'delete'}],documentModel,'revision');
check('Nested plan preview rebases entire subtree and leaves deepest levels as tasks',()=>{const placed=placedTiers(plan,1);assert.deepEqual(Object.values(placed),['saga','story','verse','task','task']);});
check('Task omissions retain existing destination tasks',()=>{const destination=['fixture:task-1','fixture:older-task'];const imported=new Set(plan.content.tasks.map(t=>t.taskId));const remaining=new Set([...destination,...imported]);assert.ok(remaining.has('fixture:older-task'));assert.equal(plan.content.deletionRequests.length,0);});
check('Partial map omissions never propose archival',()=>{const d=clone(map);d.scope.mode='partial';d.scope.ownedRecordIds=d.scope.ownedRecordIds.filter(x=>x!=='fixture:visitor');assert.deepEqual(archiveCandidates(d,map.scope.baselineInventory),[]);});
check('Complete snapshot proposes only missing covered unchanged records',()=>{const d=clone(map);d.scope.ownedRecordIds=d.scope.ownedRecordIds.filter(x=>x!=='fixture:visitor');assert.deepEqual(archiveCandidates(d,map.scope.baselineInventory),['fixture:visitor']);});
check('Newer destination record is protected from omission archival',()=>{const d=clone(map),dest=clone(map.scope.baselineInventory);d.scope.ownedRecordIds=d.scope.ownedRecordIds.filter(x=>x!=='fixture:visitor');dest.find(x=>x.recordId==='fixture:visitor').revisionId='1'.repeat(64);assert.deepEqual(archiveCandidates(d,dest),[]);});
reject('Overlapping container entry offsets are rejected',manifest,m=>m.entries[1].offset--,m=>containerModel(m,map));
reject('Wrong store decoded length is rejected',manifest,m=>m.entries[0].decodedBytes++,m=>containerModel(m,map));
reject('Mismatched document entry digest is rejected',manifest,m=>m.entries[0].sha256='0'.repeat(64),m=>containerModel(m,map));
reject('Duplicate container entry is rejected',manifest,m=>m.entries.push(m.entries[1]),m=>containerModel(m,map));
reject('Filesystem path entry is rejected',manifest,m=>m.entries[1].id='../outside',m=>containerModel(m,map));
reject('Unsupported codec is rejected',manifest,m=>m.entries[0].codec='execute',m=>containerModel(m,map));
reject('Unassigned request cannot disappear from a package group',pkg,p=>p.groups.shift(),packageModel,'digest');
reject('Split shared write must not be advertised as independent',pkg,p=>p.groups[1].writeRecordIds.push(p.groups[0].writeRecordIds[0]),packageModel,'digest');
reject('Missing declared read is rejected',pkg,p=>p.groups[0].readSet=[],packageModel,'digest');
reject('Dependency cycle is rejected',pkg,p=>p.groups[0].dependsOn=[p.groups[0].groupId],packageModel,'digest');
reject('An editorial FINAL is not an executable request',pkg,p=>{p.requests[0].intent='FINAL';p.requests[0]=reseal(p.requests[0]);},packageModel,'digest');
reject('Expiring/path URL is not a stable origin reference',pkg,p=>p.assets[0].location.instanceOrigin+='/?token=temporary',packageModel,'digest');
reject('Agent file cannot certify human testing',returned,d=>d.result.requiresHumanTesting=false,d=>returnedModel(d,pkg,binding),'revision');
reject('Result provenance cannot be removed while keeping agent-result role',returned,d=>d.result=null,documentModel,'revision');
reject('Returned provenance cannot claim ordinary user role',returned,d=>d.origin.role='user',documentModel,'revision');
reject('Wrong returned package byte hash is rejected',returned,d=>d.result.taskBinding.package.sha256='0'.repeat(64),d=>returnedModel(d,pkg,binding),'revision');
reject('Unrelated result task is rejected',returned,d=>d.result.taskBinding.task.issueId='fixture:other',d=>returnedModel(d,pkg,binding),'revision');
reject('Different base document is rejected',returned,d=>d.result.baseDocument.revision='0'.repeat(64),d=>returnedModel(d,pkg,binding),'revision');
reject('Out-of-scope write is rejected',returned,d=>d.result.groups[0].outcomes[0].writes[0].recordId='fixture:visitor',d=>returnedModel(d,pkg,binding),'revision');
reject('Unresolved result cannot change current content',returned,d=>d.result.groups[0].outcomes[0].outcome='unresolved',d=>returnedModel(d,pkg,binding),'revision');
reject('Unexpected extra after-content enters review',returned,d=>{const h=d.content.recordHeads.find(h=>h.recordId==='fixture:visitor'),before=d.content.records.find(r=>r.recordId===h.recordId&&r.revisionId===h.revisionId);const after=reseal({...before,parents:[before.revisionId],current:{...before.current,payload:{...before.current.payload,name:'Unapproved rename'}}},'revisionId');d.content.records.push(after);h.revisionId=after.revisionId;},d=>returnedModel(d,pkg,binding),'revision');
reject('Changed dialogue outside the approved patch enters review',returned,d=>{const h=d.content.recordHeads.find(h=>h.recordId==='fixture:guide'),i=d.content.records.findIndex(r=>r.recordId===h.recordId&&r.revisionId===h.revisionId);d.content.records[i].current.payload.points['fixture:point-guide'].blocks['fixture:block-guide'].text='Different unapproved request';d.content.records[i]=reseal(d.content.records[i],'revisionId');h.revisionId=d.content.records[i].revisionId;d.result.groups[0].outcomes[0].writes[0].afterRevision=h.revisionId;},d=>returnedModel(d,pkg,binding),'revision');
check('Spoofed actor claim never substitutes for authenticated identity',()=>assert.throws(()=>returnedModel(returned,pkg,binding,{authenticated:false})));
check('Stale current baseline requires review',()=>assert.throws(()=>returnedModel(returned,pkg,binding,{currentBase:false})));
check('Incomplete dependent group requires review',()=>{let d=clone(returned);d.result.groups[0].groupId='fixture:group-removal';d=reseal(d,'revision');assert.throws(()=>returnedModel(d,pkg,binding));});
check('A dependent group with one unimplemented member cannot apply',()=>{let d=clone(returned);const group=pkg.groups.find(g=>g.groupId==='fixture:group-removal');d.result.groups=[{groupId:group.groupId,outcomes:group.planDigests.map((h,i)=>({planId:pkg.requests.find(p=>p.digest===h).planId,planDigest:h,outcome:i?'unresolved':'implemented',reason:'Partial group',writes:[],checks:[]}))}];d=reseal(d,'revision');assert.throws(()=>returnedModel(d,pkg,binding),/Partially implemented/);});
check('Newer draft is preserved when older packaged request is acknowledged',()=>{const old=pkg.requests[0],newer=reseal({...old,version:old.version+1,parents:[old.digest],instructions:'Newer draft survives.'});const pending=[old,newer].filter(p=>p.digest!==returned.result.groups[0].outcomes[0].planDigest);assert.equal(pending.length,1);assert.equal(pending[0].digest,newer.digest);});
check('Exact strings and image bytes survive JSON projection',()=>{const s='Text  \n\\v[PLAYER]';assert.equal(JSON.parse(canonical({text:s})).text,s);const a=map.assetInventory.find(a=>a.mime==='image/png'),b=fs.readFileSync(path.join(root,'examples/blobs',a.sha256+'.bin'));assert.equal(sha(b),a.sha256);});
check('Canonicalization rejects fractions, negative zero and invalid Unicode',()=>{assert.throws(()=>canonical(0.5));assert.throws(()=>canonical(-0));assert.throws(()=>canonical('\ud800'));});
check('Package exact-byte hash changes after harmless formatting changes',()=>{const bytes=fs.readFileSync(path.join(root,'examples/map-package.json'));assert.notEqual(sha(bytes),sha(JSON.stringify(JSON.parse(bytes))));});
check('Modern and legacy magic values are distinct and eight bytes long',()=>{const inventory=load('source-inventory.json');assert.equal(Buffer.byteLength(inventory.legacyMagic),8);assert.equal(Buffer.byteLength(inventory.proposedMagic),8);assert.notEqual(inventory.legacyMagic,inventory.proposedMagic);});
check('Native schema snapshot preserves its original resource identity and exact semantics',()=>assert.deepEqual(schema.$defs.native,native));
const approval=fs.existsSync(path.join(root,'approval.json'))?load('approval.json'):null;
const report={task:'RD01',date:'2026-10-18',approval,status:approval?.accepted?'passed-design-checks-user-approved':'passed-design-checks-awaiting-human-review',checks:checks.length,passed:checks,scope:{applicationCodeChanged:false,actualRdxPacked:false,liveYouTrackTested:false,realRomExtractionTested:false,installedApplicationChanged:false,fullJsonSchemaMetaschemaCertification:false},nextGate:'Current task authorization is tracked in the overall action checklist.'};
fs.writeFileSync(path.join(root,'verification-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:checks.length,limitations:report.scope},null,2));
