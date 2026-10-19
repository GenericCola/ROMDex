import fs from 'node:fs/promises';
import {canonical,seal,sha} from '../content/contracts.mjs';
import {packRdx,unpackRdx} from '../rdx/container.mjs';
import {documentRevision} from '../rdx/document.mjs';
import {inspectMapPackage,buildMapPackage} from '../rdx/map-package.mjs';
import {buildReturnContext,handoffManifest,authorizationKey} from '../rdx/agent-handoff.mjs';

export async function fixture(value=null){
 const dir=new URL('./fixtures/rdx/',import.meta.url);if(!value){const document=JSON.parse(await fs.readFile(new URL('map.document.json',dir))),blobs=new Map();for(const a of document.assetInventory)blobs.set(a.sha256,await fs.readFile(new URL('blobs/'+a.sha256+'.bin',dir)));value=await unpackRdx(await packRdx(Buffer.from(canonical(document)),blobs));}
 const selection=inspectMapPackage(value).rows.filter(r=>r.recordId==='fixture:guide'&&r.kind==='change').map(r=>r.key),prepared=inspectMapPackage(value,{selection}),origin='https://thegobindsingh.youtrack.cloud',target={instanceOrigin:origin,projectId:'0-1',issueId:'3-1'},files=new Map();let sequence=0;
 const put=(name,bytes,type='application/json',id='file-'+(++sequence))=>{files.set(id,{id,name,size:bytes.length,mimeType:type,updated:1,author:{id:'2-2',login:'GenericCola'},url:origin+'/api/files/'+id,bytes});return id;};
 const assets=prepared.assets.map(a=>({...a,location:{...target,attachmentId:put(a.assetId,value.blobs.get(a.sha256),a.mime)}})).map(({purpose,...a})=>a),built=buildMapPackage(prepared,{packageId:'package:test-agent',version:1,assets}),packetId=put(built.name,built.bytes),binding=seal({format:'RDXTaskBinding/1',bindingId:'package:test-binding',package:{packageId:built.package.packageId,version:1,sha256:built.sha256},task:{...target,attachmentId:packetId},dispatch:'none'}),bindingId=put('binding.json',Buffer.from(canonical(binding))),context=buildReturnContext(value,built.package,binding),contextId=put('return-context.json',context.bytes);
 const entry={id:'entry',fingerprint:sha('entry'),datasetId:built.package.datasetId,mapRecordId:built.package.mapRecordId,packageId:built.package.packageId,version:1,packageHash:built.sha256,binding,contextHash:context.sha256,issueId:'PMON-1',uploads:[...files.values()].map(f=>({role:f.id===packetId?'package':f.id===contextId?'return-context':f.id===bindingId?'binding':'asset',name:f.name,bytes:f.bytes.length,hash:sha(f.bytes),verified:true,receipt:{id:f.id}}))},event=seal({format:'RDXAgentAuthorization/1',id:'event',action:'authorize',parent:null,lineage:authorizationKey(entry),entryHash:entry.fingerprint,binding,contextHash:context.sha256,contextBytes:context.bytes.length,contextAttachmentId:contextId,actor:{id:'2-2',login:'GenericCola'},observedAttachments:[...files.keys()].sort(),createdAt:'2026-10-19T18:00:00.000Z'}),manifest=handoffManifest(entry,event);
 async function result(){const old=JSON.parse(await fs.readFile(new URL('returned-map.document.json',dir))),d=structuredClone(context.context.document),outcome=old.result.groups[0].outcomes[0],after=old.content.records.find(r=>r.revisionId===outcome.writes[0].afterRevision);d.content.records.push(after);d.content.recordHeads=d.content.recordHeads.map(r=>r.recordId===after.recordId?{recordId:r.recordId,revisionId:after.revisionId}:r);d.origin=old.origin;d.result={...old.result,taskBinding:binding,baseDocument:built.package.baseDocument,groups:[{groupId:built.package.groups.find(g=>g.planDigests.includes(outcome.planDigest)).groupId,outcomes:[outcome]}]};d.revision=documentRevision(d);return {document:d,bytes:await packRdx(Buffer.from(canonical(d)),context.blobs)};}
 return {value,prepared,built,binding,context,entry,event,manifest,files,put,result};
}
export function transport(f){
 let account={id:'2-2',login:'GenericCola'},uploads=0,lost=false;
 const fetch=async(url,options={})=>{const u=new URL(url),route=u.pathname,method=options.method||'GET';if(options.headers.Authorization!=='Bearer test-only')throw Error('Missing fixture credential');
  if(route==='/api/users/me')return Response.json(account);
  if(route==='/api/issues/3-1')return Response.json({id:'3-1',idReadable:'PMON-1',project:{id:'0-1'}});
  if(route==='/api/issues/3-1/attachments'){
   if(method==='POST'){uploads++;const file=options.body.get('upload1'),bytes=Buffer.from(await file.arrayBuffer()),id=f.put(file.name,bytes,file.type);if(lost){lost=false;throw Error('Lost reply');}return Response.json([{id}]);}
   return Response.json([...f.files.values()].slice(Number(u.searchParams.get('$skip')),Number(u.searchParams.get('$skip'))+100).map(({bytes,...m})=>m));
  }
  if(route.startsWith('/api/files/'))return new Response(f.files.get(route.slice('/api/files/'.length))?.bytes||null);
  throw Error('Unexpected task-file route');
 };
 return {fetch,get uploads(){return uploads;},wrongAccount(){account={id:'2-3',login:'Other'};},loseUploadReply(){lost=true;}};
}
