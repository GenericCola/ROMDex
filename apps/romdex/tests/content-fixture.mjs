import fs from 'node:fs';
import {seal,sha,requireThat} from '../content/contracts.mjs';
import {MANIFEST_NAME} from '../content/carrier.mjs';
export const example=name=>JSON.parse(fs.readFileSync(new URL('./fixtures/content/'+name+'.json',import.meta.url),'utf8'));
export class FixtureContentTransport{
 constructor(){this.projectId='0-2';this.registryIssueId='3-1000';this.ownerId='2-2';this.issues=new Map([[this.registryIssueId,{id:this.registryIssueId,summary:'U20C Isolated Preview Registry',parentIssueId:null,descriptionSha256:sha(''),commentsSha256:sha('[]')}]]);this.attachments=new Map();this.next=1;this.reads=0;this.fail=false;this.bindings=[];}
 begin(signal){this.signal=signal;}
 async issue(id){requireThat(this.issues.has(id),'Missing Fixture Issue.');return structuredClone(this.issues.get(id));}
 put(issueId,bytes,name='content.json'){const id='12-'+this.next++;this.attachments.set(id,{issueId,bytes:Buffer.from(bytes),meta:{id,name,size:bytes.length,updated:this.next,authorId:'2-2'}});return {issueId,attachmentId:id,sha256:sha(bytes),bytes:bytes.length};}
 object(issueId,bytes){const chunks=[];for(let i=0;i<bytes.length;i+=512*1024)chunks.push(this.put(issueId,bytes.subarray(i,i+512*1024)));return {sha256:sha(bytes),bytes:bytes.length,chunks};}
 async discover(){this.reads++;requireThat(!this.fail,'Fixture Network Is Offline.');return this.inventory(this.registryIssueId);}
 async inventory(issueId){return [...this.attachments.values()].filter(a=>a.issueId===issueId).map(a=>structuredClone(a.meta));}
 async download(issueId,ref){requireThat(!this.fail&&!this.signal?.aborted,'Fixture Read Interrupted.');const a=this.attachments.get(ref.attachmentId);requireThat(a&&a.issueId===issueId&&a.meta.authorId==='2-2'&&a.bytes.length===ref.bytes,'Missing or Unauthorized Fixture Attachment.');return Buffer.from(a.bytes);}
 seed(){const pkg=example('map-package');this.bindings=pkg.recordSnapshots.map((r,i)=>({recordId:r.recordId,issueId:'3-'+(1100+i)}));for(const r of pkg.recordSnapshots){const binding=this.bindings.find(b=>b.recordId===r.recordId);this.issues.set(binding.issueId,{id:binding.issueId,summary:r.current.payload.name,parentIssueId:this.bindings.find(b=>b.recordId===r.parentRecordId)?.issueId||null,descriptionSha256:sha(''),commentsSha256:sha('[]')});}const assets=pkg.assets.map(a=>({assetId:a.assetId,mime:a.mime,bytes:Buffer.from(a.delivery.base64,'base64')}));return this.publish({kind:'bootstrap',artifacts:[...pkg.recordSnapshots,...pkg.plans,...pkg.mappings,...pkg.observations.map(o=>o.review)],assets});}
 publish({kind,artifacts,parent=null,assets=[],resultDigest=null,baseRevisions=[],operationId='fixture:u20c-'+kind+'-'+this.next}){
  const pub=seal({schema:'NPCDexPublication/1',workspaceId:'fixture:workspace',operationId,createdAt:'2026-10-17T12:00:00.000Z',actorClaim:'fixture:owner',publicationId:operationId,kind,parentPublications:parent?[parent]:[],artifactDigests:artifacts.map(a=>a.revisionId||a.digest),baseRevisions,resultDigest,groupId:null});
  const carrier=seal({schema:'NPCDexCarrier/1',workspaceId:'fixture:workspace',operationId,publication:this.object(this.registryIssueId,Buffer.from(JSON.stringify(pub))),artifacts:artifacts.map(a=>({digest:a.revisionId||a.digest,object:this.object(this.bindings.find(b=>b.recordId===(a.recordId||a.target?.recordId))?.issueId||this.registryIssueId,Buffer.from(JSON.stringify(a)))})),assets:assets.map(a=>({assetId:a.assetId,mime:a.mime,object:this.object(this.registryIssueId,a.bytes)})),bindings:structuredClone(this.bindings),nativeMetadata:[...this.issues.values()].map(x=>structuredClone(x))});
  // Native metadata uses issueId rather than the transport's id property.
  carrier.nativeMetadata=carrier.nativeMetadata.map(({id,...rest})=>({issueId:id,...rest}));const sealed=seal(carrier),ref=this.put(this.registryIssueId,Buffer.from(JSON.stringify(sealed)),MANIFEST_NAME);return {pub,carrier:sealed,ref};
 }
 correction(parent,edit=null,operationSuffix='one'){
  const correction=example('documentation-correction');if(edit){const after=correction.recordUpdates[0].after;after.current.payload.points['fixture:point-guide'].blocks['fixture:block-guide'].text=edit;after.operationId+='-'+operationSuffix;correction.recordUpdates[0].after=seal(after);correction.operationId+='-'+operationSuffix;correction.correctionId+='-'+operationSuffix;}
  const c=seal(correction);return this.publish({kind:'correction',parent,artifacts:[c,...c.recordUpdates.map(u=>u.after)],resultDigest:c.digest,baseRevisions:c.readSet});
 }
}
