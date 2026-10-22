from pathlib import Path
p=Path('outputs/ROMDex/rdx/document-cloud.mjs');s=p.read_text();at=s.index(' async acceptRemote(')
method=""" // MAPDex handoff authorizes a local intent. Network preflight belongs to the
 // existing cancellable cloud cycle, never the local staging/checkpoint lock.
 queueBinding(key,input){ensure(input?.approved===true,'REVIEW_REQUIRED','Explicit Map Handoff Approval Is Required.');if(this.get(key))return this.status(key);const row=this.maps.store.row(key),value=this.maps.store.load(key,row.head);ensure(row.checkpoint_revision===row.head&&!this.maps.store.pending(key)&&value.document.kind==='map'&&value.document.origin.role!=='agent-result','REVIEW_REQUIRED','Queue Only a Saved Editable Map.');this.save(key,{format:'RDXDocumentBinding/1',instance:RDX_INSTANCE,projectId:'0-2',ownerId:'2-2',registry:{},lastRemote:null,publishedRevision:null,connection:'cached',intent:null,review:null,error:null,held:false,preflight:true});return this.status(key);}
"""
s=s[:at]+method+s[at:];old="if(!s.review){if(await this.pull(key,s)===false)";new="if(!s.review){if(s.preflight){await this.transport.verify();const registries=await this.transport.registries(key);ensure(registries.length<=1,'REVIEW_REQUIRED','More Than One RDX Registry Matches This Document.');s.registry=registries.length?{id:registries[0].id}:{};s.preflight=false;this.save(key,s);}if(await this.pull(key,s)===false)";assert old in s;s=s.replace(old,new);p.write_text(s)
p=Path('outputs/ROMDex/rom/workspace.mjs');s=p.read_text();start=s.index(' async publishBindings(');end=s.index('\n async dispatch(',start)
s=s[:start]+""" async publishBindings(manual=false){if(this.publishing)return this.publishing;if(this.paused()||!manual&&!this.enabled()||!this.maps.cloud)return;this.publishing=this.execute(async()=>{for(const b of [...this.state.bindings]){if(this.paused())break;if(b.error&&!manual)continue;try{if(!this.maps.cloud.get(b.key))this.maps.cloud.queueBinding(b.key,{approved:true});this.state.bindings=this.state.bindings.filter(x=>x.key!==b.key);}catch(e){b.error=e.message;}await this.persist();}}).finally(()=>this.publishing=null);return this.publishing;}
"""+s[end:]
p.write_text(s)
print('Queued handoff binding uses the cancellable cloud owner; local checkpoints never wait for network preflight.')
