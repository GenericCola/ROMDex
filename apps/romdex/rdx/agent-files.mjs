import {canonical,sha,parseJSON,same} from '../content/contracts.mjs';
import {validateMapPackage} from './map-package.mjs';
import {validateHandoffManifest,validateReturnContext} from './agent-handoff.mjs';
import {validateDocument} from './document.mjs';
import {unpackRdx} from './container.mjs';
import {ensure,LIMITS} from './limits.mjs';
import {validateBoundResult} from './agent-result-builder.mjs';

const ORIGIN='https://thegobindsingh.youtrack.cloud',MAX_FILE=50*1024*1024;
// Deterministic task-file transport. No project/admin changes, State writes,
// direct NPCD access, token discovery, arbitrary URLs or agent execution.
export class AgentTaskFiles{
 constructor({credential,fetch:fetchImpl=globalThis.fetch}){Object.assign(this,{credential,fetch:fetchImpl});}
 async response(url,options={},limit=LIMITS.json){
  ensure(new URL(url).origin===ORIGIN,'AUTH','Agent Files Are Restricted to the Approved YouTrack Origin.');let token=await this.credential();ensure(typeof token==='string'&&token.length>0&&token.length<=4096&&!/[\r\n]/.test(token),'AUTH','Configure the YouTrack Credential Securely in This Execution Environment.');let r;
  try{r=await this.fetch(url,{...options,headers:{...options.headers,Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(120000)});}catch{throw Error('YouTrack File Transfer Interrupted. Rediscover Before Retrying an Upload.');}finally{token=null;}
  if(!r.ok){await r.body?.cancel();throw Error('YouTrack File Access Failed (HTTP '+r.status+').');}
  if(Number(r.headers.get('content-length'))>limit){await r.body?.cancel();throw Error('YouTrack File Response Exceeds Its Bound.');}
  const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;ensure(size<=limit,'LIMIT','YouTrack File Response Exceeds Its Bound.');chunks.push(Buffer.from(chunk));}return Buffer.concat(chunks);
 }
 async json(route,options={}){return parseJSON(await this.response(ORIGIN+'/api/'+route,options));}
 async identity(manifest){
  validateHandoffManifest(manifest);ensure(manifest.binding.task.instanceOrigin===ORIGIN,'AUTH','The Task Origin Differs.');const me=await this.json('users/me?fields=id,login');ensure(me.id===manifest.account.id&&me.login===manifest.account.login,'AUTH','The Authenticated Account Differs From the Handoff.');
  const task=await this.json('issues/'+encodeURIComponent(manifest.binding.task.issueId)+'?fields=id,idReadable,project(id)');ensure(task.id===manifest.binding.task.issueId&&task.project.id===manifest.binding.task.projectId&&/^PMON-\d+$/.test(task.idReadable),'AUTH','The Handoff Task or Project Differs.');return {account:me,task};
 }
 async inventory(manifest){
  const result=[],ids=new Set(),fields='id,name,size,mimeType,updated,removed,draft,author(id,login),url';
  for(let skip=0;skip<10000;skip+=100){const page=await this.json('issues/'+encodeURIComponent(manifest.binding.task.issueId)+'/attachments?fields='+encodeURIComponent(fields)+'&$top=100&$skip='+skip);ensure(Array.isArray(page)&&page.length<=100,'INTEGRITY','Attachment Discovery Is Incomplete.');if(!page.length)return result;for(const a of page){ensure(typeof a.id==='string'&&!ids.has(a.id)&&Number.isSafeInteger(a.size)&&a.size>=0,'INTEGRITY','Attachment Discovery Repeated or Invalid.');ids.add(a.id);if(!a.removed&&!a.draft)result.push(a);}}throw Error('Task Attachment Discovery Exceeds Its Bound.');
 }
 async bytes(manifest,id,{sha256,bytes},inventory){
  ensure(Number.isSafeInteger(bytes)&&bytes>=0&&bytes<=MAX_FILE,'LIMIT','A Required File Exceeds 50 MiB.');const a=inventory.find(a=>a.id===id);ensure(a&&a.size===bytes,'INTEGRITY','A Pinned Task Attachment Is Missing or Has Changed.');const url=new URL(a.url,ORIGIN);ensure(url.origin===ORIGIN&&!url.username&&!url.password&&/^\/(youtrack\/)?api\/files\//.test(url.pathname),'AUTH','Unsupported Attachment Download Address.');
  const data=await this.response(url.href,{},Math.max(bytes,1));ensure(data.length===bytes&&sha(data)===sha256,'INTEGRITY','A Downloaded Task File Differs From Its Pinned Hash.');return data;
 }
 async fetchBundle(manifest){
  const identity=await this.identity(manifest),inventory=await this.inventory(manifest),binding=manifest.binding,packet=await this.bytes(manifest,binding.task.attachmentId,{sha256:binding.package.sha256,bytes:manifest.packageBytes},inventory),pkg=validateMapPackage(parseJSON(packet));
  ensure(pkg.packageId===binding.package.packageId&&pkg.version===binding.package.version,'INTEGRITY','The Package Identity Differs.');const contextBytes=await this.bytes(manifest,manifest.context.attachmentId,manifest.context,inventory),context=validateReturnContext(contextBytes,pkg,binding),blobs=new Map();let total=packet.length+contextBytes.length;
  ensure(pkg.assets.length<=1000,'LIMIT','Too Many Required Asset Identities.');for(const asset of pkg.assets){ensure(same(asset.location,{...binding.task,attachmentId:asset.location.attachmentId}),'AUTH','An Asset Is Bound to Another Task.');if(blobs.has(asset.sha256))continue;total+=asset.bytes;ensure(total<=160*1024*1024,'LIMIT','Required Handoff Files Exceed 160 MiB.');blobs.set(asset.sha256,await this.bytes(manifest,asset.location.attachmentId,asset,inventory));}
  const documentBytes=Buffer.from(canonical(context.document));validateDocument(documentBytes,{blobs});return {identity,packageBytes:packet,contextBytes,document:context.document,documentBytes,blobs};
 }
 async returnFile(manifest,bytes,{journal}){
  ensure(Buffer.isBuffer(bytes)&&bytes.length<=MAX_FILE,'LIMIT','Returned RDX Exceeds 50 MiB.');ensure(journal&&typeof journal.load==='function'&&typeof journal.save==='function','INVALID','A Durable Upload Journal Is Required.');
  const {account}=await this.identity(manifest),value=await unpackRdx(bytes),d=value.document,result=d.result,bundle=await this.fetchBundle(manifest);
  ensure(d.origin.role==='agent-result'&&result?.requiresHumanTesting===true&&same(result.taskBinding,manifest.binding)&&same(result.baseDocument,JSON.parse(bundle.contextBytes).baseDocument)&&d.datasetId===bundle.document.datasetId&&d.documentId===bundle.document.documentId&&d.scope.mapRecordId===bundle.document.scope.mapRecordId,'AUTH','Returned RDX Task, Package, Map or Base Differs.');
  const pkg=JSON.parse(bundle.packageBytes);for(const g of result.groups){const expected=pkg.groups.find(x=>x.groupId===g.groupId);ensure(expected&&g.outcomes.every(o=>expected.planDigests.includes(o.planDigest)&&pkg.requests.some(p=>p.digest===o.planDigest&&p.planId===o.planId)),'AUTH','Returned Outcomes Are Outside This Package.');}validateBoundResult(value,bundle,manifest);
  const hash=sha(bytes),prior=await journal.load();ensure(!prior||prior.sha256===hash&&prior.resultId===result.resultId&&same(prior.binding,manifest.binding),'REVIEW_REQUIRED','An Existing Return Upload Journal Refers to Different Work.');
  const intent={format:'RDXAgentUploadJournal/1',sha256:hash,resultId:result.resultId,binding:manifest.binding,status:prior?.status||'prepared'},name='NPCDex-result-'+sha(result.resultId).slice(0,32)+'.rdx';
  const find=async()=>{const files=await this.inventory(manifest);let checked=0,readBytes=0;const matches=[];for(const a of files.filter(a=>a.name.endsWith('.rdx'))){ensure(++checked<=64,'LIMIT','Too Many RDX Results for Bounded Recovery.');readBytes+=a.size;ensure(a.size<=MAX_FILE&&readBytes<=160*1024*1024,'LIMIT','Existing Results Exceed Transfer Bounds.');const url=new URL(a.url,ORIGIN);ensure(url.origin===ORIGIN&&/^\/(youtrack\/)?api\/files\//.test(url.pathname)&&!url.username&&!url.password,'AUTH','Unsupported Result Download Address.');const raw=await this.response(url.href,{},Math.max(a.size,1));if(sha(raw)===hash){ensure(raw.length===bytes.length&&a.author?.id===account.id,'AUTH','Existing Result Attribution Differs.');matches.push(a);continue;}let old;try{old=await unpackRdx(raw);}catch{continue;}ensure(old.document.result?.resultId!==result.resultId,'REVIEW_REQUIRED','This Result Identity Already Exists With Different Bytes.');}ensure(matches.length<=1,'REVIEW_REQUIRED','Duplicate Result Attachments Need Review.');return matches[0];};
  let actual=await find();if(actual){await journal.save({...intent,status:'verified',attachmentId:actual.id});return {attachmentId:actual.id,sha256:hash,reused:true,requiresHumanTesting:true};}
  ensure(!prior||prior.status==='prepared','REVIEW_REQUIRED','The Previous Upload Is Uncertain or Missing. Inspect the Task Before Authorizing a Retry.');await journal.save({...intent,status:'uploading'});
  try{const form=new FormData();form.append('upload1',new Blob([bytes],{type:'application/x-rdx'}),name);await this.json('issues/'+encodeURIComponent(manifest.binding.task.issueId)+'/attachments?fields=id',{method:'POST',body:form});actual=await find();ensure(actual,'INTEGRITY','Returned RDX Upload Is Not Yet Verified.');await journal.save({...intent,status:'verified',attachmentId:actual.id});return {attachmentId:actual.id,sha256:hash,reused:false,requiresHumanTesting:true};}
  catch{await journal.save({...intent,status:'uncertain'});throw Error('Return Upload Needs Rediscovery. The Task Was Not Closed and No Automatic Retry Was Made.');}
 }
}
