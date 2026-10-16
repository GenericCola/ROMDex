import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {buildIdentity} from '../outputs/ROMDex/runtime-profile.mjs';
const origin='http://127.0.0.1:4322',recordFile='work/s01/live-record.json',sha=b=>createHash('sha256').update(b).digest('hex');
async function api(route,input){const res=await fetch(origin+'/api/'+route,{method:input===undefined?'GET':'POST',headers:input===undefined?{}:{Origin:origin,'Content-Type':'application/json'},body:input===undefined?undefined:JSON.stringify(input),signal:AbortSignal.timeout(180000)}),data=await res.json();if(!res.ok||data.error||data.blocked)throw Error(JSON.stringify({route,status:res.status,error:data.error,blocked:data.blocked}));return data;}
const expected=await buildIdentity(path.resolve('outputs/ROMDex-v0.4.1/ROMDex')),status=await api('status');assert.equal(status.version,'0.4.1');assert.equal(status.installationId,expected.installationId);assert.equal(status.serviceBuild,expected.serviceBuild);assert.equal(status.connected,true);assert.equal(status.rememberedConnection,true);
const manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.1-Manifest.json'));let served=0;for(const file of manifest.files.filter(x=>x.path.startsWith('ROMDex/public/'))){const res=await fetch(origin+'/'+file.path.slice('ROMDex/public/'.length));assert.equal(res.status,200);assert.equal(sha(Buffer.from(await res.arrayBuffer())),file.sha256,file.path);served++;}
const cipher=JSON.parse(await fs.readFile('work/s01/credential-integrity.json'));assert.equal(sha(await fs.readFile(cipher.path)),cipher.sha256);
try{await fs.access(recordFile);throw Error('QA Record Already Exists; Inspect Before Repeating.');}catch(e){if(e.code!=='ENOENT')throw e;}
const before=(await api('sync',{manual:true,operations:[]})).items,marker='ROMDex S01 QA · Disposable · '+randomUUID();
const record={marker,baselineIds:before.map(x=>x.id),originalAutoSync:status.automaticSyncEnabled,qaId:null,files:[],cleaned:false};
const save=()=>fs.writeFile(recordFile,JSON.stringify(record,null,2));await save();
const create={opId:randomUUID(),type:'create',issueId:'local-s01-qa',item:{id:'local-s01-qa',summary:marker,description:marker+'\nTemporary attachment verification only. No project work belongs here.',state:'To do',type:'Task'}};
record.createOperation=create;await save();let result=await api('sync',{manual:true,operations:[create]});record.qaId=result.mapping[create.issueId];assert.match(record.qaId,/^PMON-\d+$/);await save();
async function own(){const item=(await api('sync',{manual:true,operations:[]})).items.find(x=>x.id===record.qaId);assert.ok(item);assert.equal(item.summary,marker);assert.ok(item.description.startsWith(marker));return item;}
for(const name of ['S01-Delete-Test.txt','S01-Keep-Test.txt']){
 await own();const bytes=Buffer.from(marker+'\n'+name),uploadId=randomUUID(),form=new FormData();form.append('uploadId',uploadId);form.append('file',new Blob([bytes],{type:'text/plain'}),name);
 const staged=await fetch(origin+'/api/uploads',{method:'POST',headers:{Origin:origin},body:form});assert.equal(staged.status,200);
 const op={opId:uploadId,type:'attachment',uploadId,issueId:record.qaId,file:{name,size:bytes.length,mimeType:'text/plain',hash:sha(bytes)}};await api('sync',{manual:true,operations:[op]});
 const attachments=(await api('attachments?id='+record.qaId+'&manual=true')).attachments,found=attachments.find(x=>x.name===name);assert.ok(found);record.files.push(found);await save();
}
let item=await own();assert.deepEqual(item.attachments.map(x=>x.id).sort(),record.files.map(x=>x.id).sort());
const deletion={opId:randomUUID(),type:'attachment-delete',issueId:record.qaId,attachmentId:record.files[0].id,base:record.files[0]};record.deleteOperation=deletion;await save();
result=await api('sync',{manual:true,operations:[deletion]});assert.deepEqual(result.completed,[deletion.opId]);
item=await own();assert.deepEqual(item.attachments.map(x=>x.id),[record.files[1].id]);record.singleFileDeletionVerified=true;await save();
result=await api('sync',{manual:true,operations:[deletion]});assert.deepEqual(result.completed,[deletion.opId]);assert.deepEqual((await own()).attachments.map(x=>x.id),[record.files[1].id]);record.replayVerified=true;await save();
const bytes=await fetch(origin+'/api/attachment-content?id='+record.qaId+'&attachmentId='+record.files[1].id);assert.equal(bytes.status,200);assert.equal(sha(Buffer.from(await bytes.arrayBuffer())),sha(Buffer.from(marker+'\nS01-Keep-Test.txt')));record.neighborBytesPreserved=true;await save();
await own();const last={opId:randomUUID(),type:'attachment-delete',issueId:record.qaId,attachmentId:record.files[1].id,base:record.files[1]};await api('sync',{manual:true,operations:[last]});item=await own();assert.equal(item.attachments.length,0);
const all=(await api('sync',{manual:true,operations:[]})).items;assert.equal(all.some(x=>x.parentId===record.qaId),false);item=all.find(x=>x.id===record.qaId);assert.equal(item.summary,marker);assert.equal(item.attachments.length,0);
await api('sync',{manual:true,operations:[{opId:randomUUID(),type:'delete',issueId:record.qaId,ids:[record.qaId],bases:{[record.qaId]:item}}]});
const final=(await api('sync',{manual:true,operations:[]})).items;assert.equal(final.some(x=>x.id===record.qaId),false);assert.equal(record.baselineIds.filter(id=>!final.some(x=>x.id===id)).length,0);const afterStatus=await api('status');assert.equal(afterStatus.automaticSyncEnabled,record.originalAutoSync);assert.equal(afterStatus.rememberedConnection,true);assert.equal(sha(await fs.readFile(cipher.path)),cipher.sha256);
record.cleaned=true;await save();
const verification={verifiedAt:new Date().toISOString(),version:afterStatus.version,installationIdentityMatches:true,serviceBuildMatches:true,connected:afterStatus.connected,rememberedConnection:true,ciphertextUnchanged:true,automaticSyncUnchanged:true,servedAssetsVerified:served,controlledAttachmentDeletion:true,replaySafe:true,neighborBytesPreserved:true,qaTicketCleaned:true,allOriginalIdsRetained:true,originalItemCount:record.baselineIds.length,finalItemCount:final.length,existingProductionFilesDeleted:false};await fs.writeFile('work/s01/live-verification.json',JSON.stringify(verification,null,2));console.log(JSON.stringify(verification));
