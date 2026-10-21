import {randomUUID} from 'node:crypto';
import {canonical,sha,parseJSON} from '../content/contracts.mjs';
import {mapDomain} from '../rdx/map-import.mjs';
import {documentRevision} from '../rdx/document.mjs';
import {documentKey} from '../rdx/managed-store.mjs';
import {recoverSourceScope} from './staging-document.mjs';
import {previewMapUpdate} from './map-update.mjs';
import {UPDATE_EXTENSION} from './update-contract.mjs';
import {selectedCatalogGroup,groupTree} from '../public/rom-catalog.mjs';
import {requireRom} from './reader.mjs';

export function installUpdateWorkspace(Workspace){
 Object.assign(Workspace.prototype,{
  documentMetadata(row){this.updateMetadataCache??=new Map();let cached=this.updateMetadataCache.get(row.key);if(cached?.head!==row.head){const version=this.maps.store.db.prepare('SELECT document,byte_hash FROM versions WHERE key=? AND revision=?').get(row.key,row.head),bytes=Buffer.from(version.document);requireRom(sha(bytes)===version.byte_hash,'INTEGRITY','Stored Map Metadata Changed.');cached={head:row.head,document:parseJSON(bytes)};this.updateMetadataCache.set(row.key,cached);}return cached.document;},
  project(){return (this.state.projects||[]).find(p=>p.builds.some(b=>b.sha256===this.state.source?.source.sha256))||null;},
  async discoverProjects(){await this.maps.open();let changed=false;this.state.projects??=[];for(const row of this.maps.store.db.prepare("SELECT key,head FROM documents WHERE kind='map'").all()){const doc=this.documentMetadata(row),x=doc.extensions[UPDATE_EXTENSION],link=doc.extensions['org.romdex.rom-project'],id=x?.romProjectId||link?.id;if(!/^rom-project:[a-f0-9-]{36}$/.test(id||''))continue;let p=this.state.projects.find(p=>p.id===id);if(!p){p={id,name:typeof link?.name==='string'&&link.name.length<=128?link.name:'Imported ROM Project '+id.slice(-8),builds:[],maps:[]};this.state.projects.push(p);changed=true;}if(!p.maps.includes(row.key)){p.maps.push(row.key);changed=true;}}if(changed)await this.persist();},
  async updateTargets(){await this.maps.open();const project=this.project(),rows=[];for(const row of this.maps.store.db.prepare("SELECT key,head FROM documents WHERE kind='map'").all()){
   const doc=this.documentMetadata(row),source=doc.extensions['org.romdex.rom-source'];if(!source)continue;
   const bound=doc.extensions[UPDATE_EXTENSION]?.romProjectId||doc.extensions['org.romdex.rom-project']?.id||(this.state.projects||[]).find(p=>p.maps?.includes(row.key)||p.builds.some(b=>b.sha256===source.sourceSHA256))?.id;
   if(bound&&project&&bound!==project.id)continue;const map=doc.content.records.find(r=>r.kind==='map'&&doc.content.recordHeads.some(h=>h.recordId===r.recordId&&h.revisionId===r.revisionId));rows.push({key:row.key,name:map.current.payload.name,revision:row.head,sourceSHA256:source.sourceSHA256,projectId:bound||null,adopted:!!this.maps.adoption?.owns(row.key)});
  }return rows;},
  async linkBuild(input){requireRom(this.state.source&&!this.job,'BUSY','Open a ROM and Wait for Inspection to Finish.');this.state.projects??=[];let project=this.state.projects.find(p=>p.id===input.projectId);
   if(!project){requireRom(!input.projectId&&typeof input.name==='string'&&input.name.trim().length>0&&input.name.length<=128,'INVALID','Choose an Existing ROM Project or Name a New One.');project={id:'rom-project:'+randomUUID(),name:input.name.trim(),builds:[],maps:[]};this.state.projects.push(project);}
   const prior=this.project();requireRom(!prior||prior.id===project.id,'CONFLICT','This Build Is Already Linked to Another ROM Project.');
   if(!project.builds.some(b=>b.sha256===this.state.source.source.sha256))project.builds.push({sha256:this.state.source.source.sha256,profile:this.state.source.profile,...(this.state.source.layout?{layout:this.state.source.layout}:{})});
   await this.persist();return this.view();
  },
  async beginUpdate(input){requireRom(!this.job&&this.project()&&selectedCatalogGroup(this.state.source,this.state.selected),'REVIEW_REQUIRED','Select a Map and Link the Open ROM to Its Project First.');
   requireRom(!this.state.update||this.state.update.state==='applied','REVIEW_REQUIRED','Resume or Discard the Current Map Update Review First.');
   const targets=await this.updateTargets(),target=targets.find(t=>t.key===input.targetKey);requireRom(target&&!target.adopted,'REVIEW_REQUIRED','Choose an Existing Managed NPCDex Map. Original Adoption Journals Require Their Existing Recovery Workflow.');
   const value=await this.maps.store.view(target.key);requireRom(value.status.saved,'RECOVERY','Recover the Target Map Working File Before Reviewing an Update.');
   this.state.update={format:'ROMDexMapUpdateSession/1',state:'preparing',targetKey:target.key,targetRevision:target.revision,romProjectId:this.project().id,sourceSHA256:this.state.source.source.sha256,selected:this.state.selected,options:{matches:{},passages:{},missing:{},conflicts:{},implemented:[]}};await this.persist();
   const nodes=groupTree(this.state.source,this.state.selected),scope=recoverSourceScope(value);
   return this.start({mode:'update',update:true,file:this.state.source.file,sourceSHA256:this.state.source.source.sha256,scopeHeaders:[...selectedCatalogGroup(this.state.source,this.state.selected).headers],headers:this.state.headers,scope,grouping:nodes.length>1?{rootId:this.state.selected,nodes}:null,compatibility:this.state.source.layout});
  },
  async updatePreview(input){const session=this.state.update;requireRom(session?.incomingKey&&session.state!=='applied','REVIEW_REQUIRED','Prepare an Update Before Reviewing It.');
   let options=session.options;if(input?.options){requireRom(Object.keys(input.options).every(k=>['matches','passages','missing','conflicts','implemented'].includes(k)),'INVALID','Unsupported Update Review Choice.');requireRom(['matches','passages','missing','conflicts'].every(k=>input.options[k]&&typeof input.options[k]==='object'&&!Array.isArray(input.options[k]))&&Array.isArray(input.options.implemented),'INVALID','Invalid Update Review Choices.');options=structuredClone(input.options);}
   const local=await this.maps.store.view(session.targetKey),incoming=await this.stage.store.view(session.incomingKey);requireRom(local.status.saved&&incoming.status.saved,'RECOVERY','Recover the Map Working Files Before Reviewing.');
   const result=previewMapUpdate(incoming,local,{...options,romProjectId:session.romProjectId,catalogGroupId:session.selected});session.options=options;session.previewBaseline=local.document.revision;session.previewToken=result.preview.token;session.state='review';await this.persist();
   return {...result.preview,options:session.options,targetKey:session.targetKey,sync:{paused:this.paused(),automatic:this.enabled()}};
  },
  async updateCommit(input){requireRom(input?.approved===true&&input.warningsAcknowledged===true,'REVIEW_REQUIRED','Review the Entire Map and Acknowledge Human Testing.');return this.maps.execute(async()=>{
   const s=this.state.update;requireRom(s?.state==='review'&&input.token===s.previewToken,'CONFLICT','The Map Update Preview Changed. Review It Again.');
   const local=await this.maps.store.view(s.targetKey),incoming=await this.stage.store.view(s.incomingKey);requireRom(local.status.saved&&incoming.status.saved,'RECOVERY','Recover the Map Working Files Before Applying an Update.');
   requireRom(local.document.revision===s.previewBaseline,'CONFLICT','NPCDex Changed During Review. Refresh the Whole Map Review Before Applying.');
   const result=previewMapUpdate(incoming,local,{...s.options,romProjectId:s.romProjectId,catalogGroupId:s.selected});requireRom(result.preview.token===input.token&&!result.preview.unresolved.length&&result.preview.conflicts.every(c=>c.choice),'REVIEW_REQUIRED','Resolve Every Identity, Passage and Content Conflict First.');
   const nextRecords=mapDomain(result).records;for(const row of this.maps.store.db.prepare("SELECT key,head FROM documents WHERE kind='map' AND key<>?").all(s.targetKey)){const other=this.maps.store.load(row.key,row.head),shared=mapDomain(other).records.filter(r=>['region','shared','profile'].includes(r.kind));for(const r of shared){const changed=nextRecords.find(n=>n.recordId===r.recordId);requireRom(!changed||changed.revisionId===r.revisionId,'REVIEW_REQUIRED','A Shared Profile or Timeline Is Used by Another Map. Coordinate Its Content Review Before Updating.');}}
   requireRom(!this.maps.cloud?.get(s.targetKey)?.review&&!this.maps.cloud?.get(s.targetKey)?.held,'REVIEW_REQUIRED','Resolve the Existing NPCDex Cloud Review Before Applying This Update.');
   // Durable document history is the application receipt. Retrying after a crash
   // can recognize this exact baseline before performing a second application.
   this.sourceTesting.retain(input.token,local,result);
   await this.maps.store.save(s.targetKey,{documentBytes:result.documentBytes,blobs:result.blobs,expectedRevision:local.document.revision});
   s.state='applied';s.appliedRevision=this.maps.store.row(s.targetKey).head;s.appliedToken=input.token;s.appliedAt=new Date().toISOString();const project=this.state.projects.find(p=>p.id===s.romProjectId);project.maps=[...new Set([...(project.maps||[]),s.targetKey])];
   this.maps.active=s.targetKey;this.maps.set('active',s.targetKey);this.maps.changed();await this.persist();
   return {saved:true,key:s.targetKey,requiresHumanTesting:true,cloudConfirmed:false,message:this.paused()?'Map Updated Locally. Human Testing Required. NPCDex Cloud Sync Is Paused.':this.enabled()?'Map Updated Locally. Human Testing Required. Cloud Delivery Will Follow Auto-Sync.':'Map Updated Locally. Human Testing Required. Cloud Delivery Waits for Manual Sync.'};
  });},
  async updateDetail(input){const s=this.state.update;requireRom(s?.incomingKey,'NOT_FOUND','No Map Update Review Is Open.');const owner=input.side==='existing'?this.maps:this.stage,key=input.side==='existing'?s.targetKey:s.incomingKey,v=await owner.store.view(key),records=mapDomain(v).records,r=records.find(r=>r.recordId===input.id);requireRom(r,'NOT_FOUND','Review Item Is Missing.');const profile=records.find(o=>o.recordId===r.current.payload.profileId),imageId=r.current.payload.overrides?.imageAssetId||r.current.payload.baseImageId||profile?.current.payload.baseImageId,a=v.document.assetInventory.find(a=>a.assetId===imageId);return {record:r,image:a?'data:'+a.mime+';base64,'+v.blobs.get(a.sha256).toString('base64'):null};},
  async updateAction(action,input){if(action==='source-testing-preview')return this.sourceTesting.preview(input.id);if(action==='source-testing-decide'){const result=this.sourceTesting.decide(input);await this.persist();return result;}if(action==='link-build')return this.linkBuild(input);if(action==='update-begin')return this.beginUpdate(input);if(action==='update-preview')return this.updatePreview(input);if(action==='update-commit')return this.updateCommit(input);if(action==='update-detail')return this.updateDetail(input);if(action==='update-discard'){requireRom(!this.job,'BUSY','Cancel the Extraction Before Discarding Its Review.');this.state.update=null;await this.persist();return this.view();}throw Error('Unknown Map Update Action.');}
 });
}
