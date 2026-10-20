import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {readBoundedFile,unpackRdx} from '../rdx/container.mjs';

// Listing is a read-only peek at opaque IDs, safe even while Quit checkpoints.
// Reading files, changing requests and staging imports retain the lifecycle gate.
export function routeRdxOpen(broker,action,value,lifecycleBusy=false){
 if(action==='list')return broker.list();
 if(lifecycleBusy)throw Error('Wait for the Application Lifecycle Work to Finish.');
 if(action==='inspect'&&typeof value==='string')return broker.inspect(value);
 if(action==='dismiss'&&typeof value==='string')return broker.dismiss(value);
 if(action==='stage'&&value&&typeof value==='object')return broker.stage(value);
 throw Error('Invalid RDX Open Request.');
}

// Only OS launch arguments supply paths. The renderer receives opaque IDs and
// bounded transfer metadata; it cannot ask this broker to read arbitrary files.
export class RdxOpenBroker {
 constructor({rpc,changed=()=>{},now=Date.now,read=readBoundedFile,decode=unpackRdx}={}){this.rpc=rpc;this.changed=changed;this.now=now;this.read=read;this.decode=decode;this.entries=new Map();this.selection=null;this.busy=false;}
 enqueue(argv,cwd=process.cwd(),skip=1){
  for(const arg of argv.slice(skip)){
   if(typeof arg!=='string'||arg.startsWith('-')||!/\.rdx$/i.test(arg)||arg.includes('\0'))continue;
   const file=path.resolve(cwd,arg);
   if(process.platform==='win32'&&(!/^[a-z]:[\\/]/i.test(file)||file.slice(2).includes(':')))continue;
   if([...this.entries.values()].some(e=>e.file.toLowerCase()===file.toLowerCase()))continue;
   if(this.entries.size>=16)break;
   const id=randomUUID();this.entries.set(id,{id,file,name:path.basename(file)});
  }
  this.changed();return this.list();
 }
 list(){return [...this.entries.values()].map(({id,name})=>({id,name}));}
 dismiss(id){if(this.busy)throw Error('Wait for the RDX File Check to Finish.');this.entries.delete(id);if(this.selection?.id===id)this.selection=null;this.changed();}
 async inspect(id){
  if(this.busy)throw Error('Another RDX File Is Being Read.');const entry=this.entries.get(id);if(!entry)throw Error('This RDX Open Request Has Expired.');this.busy=true;this.selection=null;
  try{const bytes=await this.read(entry.file,512*1024*1024),value=await this.decode(bytes),d=value.document;
   if(d.origin?.role==='agent-result')throw Error('Returned Agent RDX Requires the Task Reconciliation Workflow and Human Testing. No Import Was Performed.');
   const workspace=d.namespace==='org.romdex.npcdex'&&d.kind==='map'?'npcdex':d.namespace==='org.romdex.tasks'&&d.kind==='plan'?'romdex':null;
   if(!workspace)throw Error('This RDX Workspace or Document Type Is Not Supported.');
   const token=randomUUID();this.selection={id,token,workspace,bytes,expires:this.now()+15*60*1000};return {id,token,workspace,name:entry.name};
  }finally{this.busy=false;}
 }
 async stage({id,token,workspace,context=null}={}){
  if(this.busy)throw Error('Another RDX File Is Being Read.');const s=this.selection;
  if(!s||s.id!==id||s.token!==token||s.workspace!==workspace||s.expires<this.now())throw Error('The RDX Open Preview Has Expired. Open the File Again.');
  this.busy=true;let transfer;
  const call=(route,body)=>workspace==='romdex'?this.rpc('rdxPlan',[route,body]):this.rpc('npcdexContent',['/api/rdx/'+route,body,context]);
  try{transfer=await call('begin',{bytes:s.bytes.length});for(let offset=0;offset<s.bytes.length;offset+=transfer.chunkBytes)await call('chunk',{id:transfer.id,offset,base64:s.bytes.subarray(offset,offset+transfer.chunkBytes).toString('base64')});this.selection=null;return transfer;
  }catch(error){if(transfer)await call('cancel',{}).catch(()=>{});throw error;}finally{this.busy=false;}
 }
}
