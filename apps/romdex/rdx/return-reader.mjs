import {BASE} from '../youtrack.mjs';
import {same} from '../content/contracts.mjs';
import {ensure} from './limits.mjs';

// Reads through the service's established client. URLs and credentials never
// enter the journal or renderer. A complete inventory is required before any
// missing-file conclusion; a short page alone is not an end marker.
export const returnMetadata=a=>{
 ensure(a&&typeof a.id==='string'&&/^[-\w]{1,100}$/.test(a.id)&&typeof a.name==='string'&&a.name.length<=1024&&Number.isSafeInteger(a.size)&&a.size>=0&&Number.isSafeInteger(a.updated)&&a.updated>=0,'INTEGRITY','Invalid Returned File Metadata.');
 return {id:a.id,name:a.name,size:a.size,mimeType:typeof a.mimeType==='string'?a.mimeType.slice(0,256):'',updated:a.updated,author:a.author&&typeof a.author.id==='string'?{id:a.author.id,login:typeof a.author.login==='string'?a.author.login:null}:null};
};
export class ReturnReader{
 constructor(client){this.client=client;}
 async inventory(entry,signal){
  const yt=this.client,b=entry.binding.task;ensure(b.instanceOrigin===BASE&&/^PMON-\d+$/.test(entry.issueId),'AUTH','Unrecognized Linked Return Task.');signal?.throwIfAborted();
  const task=await yt.request('issues/'+encodeURIComponent(b.issueId)+'?fields=id,idReadable,project(id)'),actor=await yt.request('users/me?fields=id,login');
  ensure(task.id===b.issueId&&task.idReadable===entry.issueId&&task.project?.id===b.projectId,'AUTH','The Linked Task or Project Changed.');
  const attachments=[],ids=new Set();
  for(let skip=0;skip<10000;skip+=100){
   signal?.throwIfAborted();const page=await yt.request('issues/'+encodeURIComponent(b.issueId)+'/attachments?fields='+encodeURIComponent('id,name,size,mimeType,updated,removed,draft,author(id,login)')+'&$top=100&$skip='+skip);
   ensure(Array.isArray(page)&&page.length<=100,'INTEGRITY','Returned File Inventory Is Incomplete.');
   if(!page.length)return {target:{instanceOrigin:BASE,projectId:task.project.id,issueId:task.id},actor,attachments};
   for(const a of page){ensure(!ids.has(a.id),'INTEGRITY','Returned File Inventory Repeated an Attachment.');ids.add(a.id);if(!a.removed&&!a.draft)attachments.push(returnMetadata(a));}
  }throw Error('Returned File Inventory Exceeds 10,000 Entries; Nothing Was Marked Missing.');
 }
 async bytes(entry,expected,signal){
  ensure(expected.size<=50*1024*1024&&expected.size>=0,'LIMIT','Returned RDX Exceeds 50 MiB.');signal?.throwIfAborted();const b=entry.binding.task;ensure(b.instanceOrigin===BASE,'AUTH','The Linked Return Origin Differs.');const task=await this.client.request('issues/'+encodeURIComponent(b.issueId)+'?fields=id,idReadable,project(id)');
  ensure(task.id===b.issueId&&task.project?.id===b.projectId&&task.idReadable===entry.issueId,'AUTH','The Linked Return Task Changed.');
  const a=await this.client.request('issues/'+encodeURIComponent(b.issueId)+'/attachments/'+encodeURIComponent(expected.id)+'?fields='+encodeURIComponent('id,name,size,mimeType,updated,removed,draft,author(id,login),url'));
  ensure(!a.removed&&!a.draft&&same(returnMetadata(a),expected),'CONFLICT','The Returned Attachment Changed During Download.');
  const url=new URL(a.url,BASE);ensure(url.origin===BASE&&!url.username&&!url.password&&/^\/(youtrack\/)?api\/files\//.test(url.pathname),'AUTH','Unsupported Return Download Address.');
  const timeout=AbortSignal.timeout(30000),response=await fetch(url,{redirect:'error',headers:url.searchParams.has('sign')?{'Cache-Control':'no-cache'}:{Authorization:'Bearer '+this.client.token},signal:signal?AbortSignal.any([signal,timeout]):timeout});
  ensure(response.ok,'NETWORK','Returned File Download Failed (HTTP '+response.status+').');
  if(Number(response.headers.get('content-length'))>expected.size){await response.body?.cancel();throw Error('Returned File Download Exceeds Its Declared Size.');}
  const chunks=[];let count=0;try{for await(const chunk of response.body){signal?.throwIfAborted();count+=chunk.length;ensure(count<=expected.size,'LIMIT','Returned File Download Exceeds Its Declared Size.');chunks.push(Buffer.from(chunk));}}catch(e){await response.body?.cancel().catch(()=>{});throw e;}
  ensure(count===expected.size,'INTEGRITY','Returned File Download Is Incomplete.');return Buffer.concat(chunks);
 }
}
