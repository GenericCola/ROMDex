import {sha256,gitBlob,DESCRIPTOR_BYTES} from './github-store.mjs';
import {documentHash,makeChange,validateChange,applyChange} from './npcdex-change.mjs';
import {inspectNPC} from './npcdex-import.mjs';
const bytes=value=>Buffer.from(JSON.stringify(value)),check=(test,message)=>{if(!test)throw Error(message);};

// One service owns the durable journal. Renderer versions are semantic record IDs.
export class NPCDexSync{
 constructor({journal,store,workspace,device,enabled=()=>true,changed=()=>{},mirror=async()=>{},now=()=>Date.now()}){Object.assign(this,{journal,store,workspace,device,enabled,changed,mirror,now});this.root=`workspaces/${workspace}`;this.local=Promise.resolve();this.running=null;this.stopped=false;this.failures=0;this.nextAttempt=0;this.error=null;this.materialized=new Map();}
 exclusive(operation){const task=this.local.then(operation);this.local=task.catch(()=>{});return task;}
 get state(){return this.journal.state();}
 view(){const state=this.state;return {active:true,head:state.tip,version:state.version,snapshot:JSON.parse(this.journal.document()),status:this.status()};}
 status(){const state=this.state,pending=this.journal.queue().length;return {active:true,label:'NPCDex Cloud',cloud:true,automaticRemote:true,automaticSyncEnabled:this.enabled(),pending,syncing:!!this.running,review:state?.review||null,attention:!!state?.review||!!this.error||pending>0&&!this.enabled(),message:state?.review?'Different NPCDex Versions Are Preserved for Review.':this.error||(pending?this.enabled()?'NPCDex Changes Are Queued for Cloud Sync.':'NPCDex Changes Are Saved Locally; Auto-Sync Is Off.':'NPCDex Cloud Copy Is Current.'),lastSync:state?.lastSync||null};}
 emit(){this.changed({head:this.state?.tip,version:this.state?.version,status:this.status()});}
 async init({prepared,current,carrier}){
  if(!this.state){const genesis=JSON.parse(prepared.sources.find(x=>x.name==='npcdex-current.json').bytes);inspectNPC(bytes(current));
   this.journal.transaction(()=>{this.cacheFiles(prepared.prepared.files);this.journal.setDocument('genesis',bytes(genesis));this.journal.setDocument('current',bytes(genesis));this.journal.setState({format:'ROMDexNPCDexSync/1',workspace:this.workspace,device:this.device,genesis:prepared.prepared.id,tip:prepared.prepared.id,sequence:0,version:0,carrier,remoteHeads:[prepared.prepared.id],review:null,lastSync:null});});
   await this.stage(current,prepared.prepared.id);
  }else{check(this.state.format==='ROMDexNPCDexSync/1'&&this.state.workspace===this.workspace&&this.state.device===this.device,'The NPCDex Journal Identity Changed.');
   if(documentHash(current)!==documentHash(JSON.parse(this.journal.document()))){const state=this.state,id='external-'+sha256(bytes(current));this.journal.transaction(()=>{this.journal.setDocument(id,bytes(current));if(!(state.compatibilityHashes||[]).includes(documentHash(current))&&documentHash(current)!==documentHash(JSON.parse(this.journal.document('genesis')))){state.review={reason:'An Unrecognized Local Save Copy Needs Review.',preserved:[state.tip],preservedDocument:id};this.journal.setState(state);}});}
  }
  check(this.journal.record(this.state.genesis),'The Initial NPCDex Record Is Missing Locally.');const loaded=inspectNPC(this.journal.document()).document,expected=this.state.tip===this.state.genesis?documentHash(JSON.parse(this.journal.document('genesis'))):validateChange(this.journal.record(this.state.tip),this.state.tip,this.workspace).after;check(documentHash(loaded)===expected,'The NPCDex Journal Document Failed Its Integrity Check.');await this.writeMirror(loaded);this.nextAttempt=this.state.retryAt||0;this.emit();return this.view();
 }
 cacheFiles(files){for(const [file,b]of files){if(file.includes('/objects/'))this.journal.putBlob(file.split('/').at(-1),b);else if(file.includes('/records/'))this.journal.putRecord(file.split('/').at(-1).slice(0,-5),b);}}
 async localMaterialize(id){const records=new Map(),seen=new Set();let cursor=id;while(cursor!==this.state.genesis){check(!seen.has(cursor)&&seen.size<5000,'NPCDex Ancestry Is Invalid or Too Large.');seen.add(cursor);const b=this.journal.record(cursor);check(b,'The NPCDex Edit Base Is Missing.');const r=validateChange(b,cursor,this.workspace);records.set(cursor,{bytes:b,record:r});cursor=r.parents[0];}return this.materialize(id,records,async id=>this.journal.blob(id));}
 async materialize(id,records,readObject){
  const initial=this.state.genesis;if(id===initial)return JSON.parse(this.journal.document('genesis'));
  const chain=[],seen=new Set();let cursor=id;
  while(cursor!==initial&&!this.materialized.has(cursor)){check(!seen.has(cursor)&&seen.size<5000,'NPCDex Revision Ancestry Is Invalid.');seen.add(cursor);const entry=records.get(cursor);check(entry,'A NPCDex Parent Revision Is Missing.');chain.push({id:cursor,...entry});cursor=entry.record.parents[0];}
  let document=cursor===initial?JSON.parse(this.journal.document('genesis')):structuredClone(this.materialized.get(cursor));
  for(const entry of chain.reverse())document=await applyChange({before:document,bytes:entry.bytes,id:entry.id,workspace:this.workspace,readObject});
  this.materialized.set(id,structuredClone(document));while(this.materialized.size>8)this.materialized.delete(this.materialized.keys().next().value);return document;
 }
 async stage(snapshot,base){return this.exclusive(async()=>{
  const state=this.state;check(typeof base==='string'&&this.journal.record(base),'The NPCDex Edit Base Is Unknown. Local Input Has Not Been Acknowledged.');inspectNPC(bytes(snapshot));
  if(documentHash(snapshot)===documentHash(JSON.parse(this.journal.document()))){this.journal.transaction(()=>this.journal.setDocument('current',bytes(snapshot)));await this.writeMirror(snapshot);return this.view();}
  const before=base===state.tip?JSON.parse(this.journal.document()):await this.localMaterialize(base),change=makeChange({before,after:snapshot,workspace:this.workspace,device:this.device,parent:base,sequence:state.sequence+1});
  if(!change)return this.view();
  if(base!==state.tip)state.review={reason:'A Renderer Edited an Earlier NPCDex Revision.',preserved:[state.tip,change.id],remoteHeads:state.remoteHeads};
  state.tip=change.id;state.sequence++;state.version++;
  this.journal.transaction(()=>{this.cacheFiles(change.files);this.journal.setDocument('current',bytes(snapshot));this.journal.enqueue(change.id);this.journal.setState(state);});
  this.materialized.set(change.id,structuredClone(snapshot));while(this.materialized.size>8)this.materialized.delete(this.materialized.keys().next().value);await this.writeMirror(snapshot);this.emit();return this.view();
 });}
 async writeMirror(document){try{await this.mirror(document);const state=this.state;state.compatibilityHashes=[...new Set([...(state.compatibilityHashes||[]),documentHash(document)])].slice(-16);this.journal.transaction(()=>this.journal.setState(state));this.mirrorError=null;}catch{this.mirrorError='NPCDex Is Safe in the Local Journal, but Its Compatibility Copy Could Not Be Written.';this.error=this.mirrorError;}}
 async remoteObject(id,inventory){const file=`${this.root}/objects/${id.slice(0,2)}/${id}`,expected=inventory.entries.get(file);check(expected,'A Cloud NPCDex Dependency Is Missing.');const local=this.journal.blob(id);if(local){check(gitBlob(local)===expected,'An Immutable NPCDex Cloud Dependency Changed.');return local;}const b=await this.store.readBlob(expected);check(sha256(b)===id,'Cloud NPCDex Object Hash Differs.');this.journal.putBlob(id,b);return b;}
 ancestor(ancestor,head,records){const seen=new Set();while(head!==ancestor&&head!==this.state.genesis){if(seen.has(head)||!records.has(head))return false;seen.add(head);head=records.get(head).record.parents[0];}return head===ancestor;}
 async discover(){
  const inventory=await this.store.verifyAccess(),state=this.state;await this.store.descendant(state.carrier,inventory.commit);
  const genesis=await this.store.readBlob(inventory.entries.get(this.root+'/npcdex/genesis.json'),DESCRIPTOR_BYTES);check(genesis.equals(bytes({format:'ROMDexNPCDexGenesis/1',workspace:this.workspace,record:state.genesis})),'The Cloud NPCDex Genesis Changed.');
  const records=new Map(),names=[];for(const [name,gitID]of inventory.entries){if(!name.startsWith(this.root+'/npcdex/'))continue;if(name===this.root+'/npcdex/genesis.json')continue;const match=name.slice((this.root+'/npcdex/').length).match(/^records\/([a-f0-9]{64})\.json$/);check(match,'An Unknown Cloud NPCDex Record Needs Review.');const id=match[1];let b=this.journal.record(id);if(b)check(gitBlob(b)===gitID,'An Immutable NPCDex Record Changed.');else{b=await this.store.readBlob(gitID,DESCRIPTOR_BYTES);check(sha256(b)===id,'A Cloud NPCDex Record Hash Differs.');}
   if(id===state.genesis)check(b.equals(this.journal.record(state.genesis)),'Initial NPCDex Record Changed.');else{const record=validateChange(b,id,this.workspace);records.set(id,{record,bytes:b});}names.push(id);check(names.length<=5000,'NPCDex Discovery Requires a Larger Validated Checkpoint.');}
  check(names.includes(state.genesis),'The Cloud NPCDex Initial Record Is Missing.');const all=new Set(names),parents=new Set();for(const {record}of records.values()){check(all.has(record.parents[0]),'A Cloud NPCDex Parent Is Missing.');parents.add(record.parents[0]);for(const chunk of record.payload.chunks)await this.remoteObject(chunk.sha256,inventory);}
  const initial=JSON.parse(this.journal.record(state.genesis));for(const doc of initial.documents)for(const chunk of doc.chunks)await this.remoteObject(chunk.sha256,inventory);
  const valid=new Set([state.genesis]);for(const id of records.keys()){const chain=[],seen=new Set();let cursor=id;while(!valid.has(cursor)){check(!seen.has(cursor)&&records.has(cursor),'The Cloud NPCDex Graph Contains a Cycle or Missing Parent.');seen.add(cursor);chain.push(cursor);cursor=records.get(cursor).record.parents[0];}for(const member of chain)valid.add(member);}
  const heads=names.filter(id=>!parents.has(id)).sort();check(heads.length>0,'The Cloud NPCDex Graph Has No Valid Head.');
  const docs=new Map();for(const id of heads)docs.set(id,await this.materialize(id,records,id=>this.remoteObject(id,inventory)));
  // Caches do not advance a frontier; adopt only after the complete graph validates.
  return this.exclusive(async()=>{const current=this.state;for(const [id,entry]of records)this.journal.putRecord(id,entry.bytes);let incoming=null;
   const pending=this.journal.queue().length;
   if(!current.review&&heads.length===1&&this.ancestor(current.tip,heads[0],records)&&!pending){if(heads[0]!==current.tip){incoming=docs.get(heads[0]);current.tip=heads[0];current.version++;}}
   else if(heads.length!==1||!this.ancestor(heads[0],current.tip,new Map([...records,...this.journal.queue().map(q=>{const b=this.journal.record(q.id);return [q.id,{record:validateChange(b,q.id,this.workspace),bytes:b}];})])))current.review={reason:'Concurrent NPCDex Versions Need Review.',preserved:[current.tip,...heads],remoteHeads:heads};
   current.remoteHeads=heads;current.carrier=inventory.commit;current.lastSync=this.now();
   if(incoming){const local=JSON.parse(this.journal.document());if(Object.hasOwn(local,'preferences'))incoming.preferences=local.preferences;else delete incoming.preferences;}
   this.journal.transaction(()=>{if(incoming)this.journal.setDocument('current',bytes(incoming));this.journal.setState(current);});
   if(incoming)await this.writeMirror(incoming);this.emit();return {inventory,heads};
  });
 }
 outgoingFiles(queue){const files=new Map();for(const item of queue){const b=this.journal.record(item.id),r=validateChange(b,item.id,this.workspace);files.set(`${this.root}/npcdex/records/${item.id}.json`,b);for(const chunk of r.payload.chunks){const object=this.journal.blob(chunk.sha256);check(object,'A Queued NPCDex Dependency Is Missing.');files.set(`${this.root}/objects/${chunk.sha256.slice(0,2)}/${chunk.sha256}`,object);}}return files;}
 cycle(force=false){if(this.running)return this.running;if(!force&&(this.stopped||!this.enabled()||this.now()<this.nextAttempt))return Promise.resolve(this.status());
  this.abort=new AbortController();this.store.signal=this.abort.signal;
  this.running=(async()=>{try{
   await this.discover();const queue=this.journal.queue().slice(0,20);
   if(queue.length){const ids=queue.map(x=>x.id),files=this.outgoingFiles(queue);this.journal.transaction(()=>this.journal.attempt(ids));const result=await this.store.publishChanges(files,this.state.genesis);this.journal.transaction(()=>this.journal.acknowledge(ids));await this.discover();}
   this.failures=0;this.error=this.mirrorError||null;this.nextAttempt=this.now()+30000;const state=this.state;state.retryAt=this.nextAttempt;this.journal.transaction(()=>this.journal.setState(state));
  }catch(error){this.failures++;this.error=this.stopped&&this.abort.signal.aborted?null:error.message;const server=Math.max(Number(error.retryAfter||0)*1000,Number(error.rateReset||0)*1000-this.now());this.nextAttempt=this.now()+Math.max(Math.min(300000,5000*2**Math.min(this.failures,6)),Number.isFinite(server)?Math.max(0,server):0);try{const state=this.state;state.retryAt=this.nextAttempt;this.journal.transaction(()=>this.journal.setState(state));}catch{this.error='NPCDex Retry State Could Not Be Written. Local Recovery Needs Review.';}
  }finally{this.running=null;this.emit();}return this.status();})();this.emit();return this.running;
 }
 start(){this.stopped=false;if(this.timer)return;this.timer=setInterval(()=>this.cycle(),30000);this.timer.unref?.();this.cycle();}
 async stop(){this.stopped=true;clearInterval(this.timer);this.timer=null;this.abort?.abort();await this.running;await this.local;this.journal.checkpoint();}
}
