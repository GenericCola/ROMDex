import assert from 'node:assert/strict';import {sha} from '../content/contracts.mjs';
export class MemoryCloud{
 constructor(){this.regs=new Map();this.records=new Map();this.files=new Map();this.metadata=new Map();this.next=0;this.uploads=[];this.online=true;}
 begin(){}async verify(){assert(this.online,'Offline');return {instance:'https://thegobindsingh.youtrack.cloud',projectId:'0-2',project:'NPCD',ownerId:'2-2'};}async registries(key){return this.regs.has(key)?[{id:this.regs.get(key)}]:[];}
 async registry(key,slot,save){await this.verify();slot.id=this.regs.get(key)||'3-'+(++this.next);this.regs.set(key,slot.id);save();return slot.id;}
 async record(key,r,parent,slot,save){const k=key+':'+r.recordId;slot.id=this.records.get(k)||'3-'+(++this.next);this.records.set(k,slot.id);if(!this.metadata.has(slot.id))this.metadata.set(slot.id,{issueId:slot.id,summary:'[RDX] '+r.current.payload.name,parentIssueId:parent,descriptionSha256:sha(k),commentsSha256:sha('[]')});save();return slot.id;}
 async native(id){return structuredClone(this.metadata.get(id));}
 async inventory(issueId){return [...this.files.values()].filter(f=>f.issueId===issueId).map(f=>({id:f.attachmentId,name:f.name,size:f.bytes.length,author:{id:'2-2'}}));}
 async object(issueId,b,slot,save,{name='rdx-'+sha(b)+'.bin'}={}){await this.verify();let f=[...this.files.values()].find(f=>f.issueId===issueId&&f.name===name&&f.bytes.equals(b));if(!f){f={issueId,attachmentId:'4-'+(++this.next),name,bytes:Buffer.from(b)};this.files.set(f.attachmentId,f);this.uploads.push(f);if(this.loseOnce&&name==='rdx-commit.json'){this.loseOnce=false;throw Object.assign(Error('Lost Commit Response'),{code:'CONNECTION'});}}slot.id=f.attachmentId;slot.verified=true;save();return {issueId,attachmentId:f.attachmentId,sha256:sha(b),bytes:b.length};}
 async readObject(r){const f=this.files.get(r.attachmentId);assert.equal(f.issueId,r.issueId);assert.equal(sha(f.bytes),r.sha256);return Buffer.from(f.bytes);}
 async commits(key,registryId){return [...this.files.values()].filter(f=>f.issueId===registryId&&f.name==='rdx-commit.json').map(f=>JSON.parse(f.bytes));}
}
