import {parseJSON,requireThat,verifyDigest,isHash,unique,CHUNK_BYTES,MAX_JSON_BYTES,MAX_MANIFEST_BYTES} from './contracts.mjs';
export const MANIFEST_NAME='npcdex-publication.json';
const id=x=>typeof x==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9:._-]{0,159}$/.test(x);
const exact=(value,keys)=>requireThat(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>keys.includes(k))&&keys.every(k=>Object.hasOwn(value,k)),'Invalid Carrier Fields.');
export function descriptor(value,{allowEmpty=false}={}){
 exact(value,['sha256','bytes','chunks']);requireThat(isHash(value.sha256)&&Number.isSafeInteger(value.bytes)&&(allowEmpty?value.bytes>=0:value.bytes>0)&&value.bytes<=MAX_JSON_BYTES,'Invalid Object Descriptor.');
 requireThat(Array.isArray(value.chunks)&&(value.bytes===0?value.chunks.length===0:value.chunks.length>0)&&value.chunks.length<=32,'Invalid Chunk Manifest.');let total=0;
 for(const ref of value.chunks){exact(ref,['issueId','attachmentId','sha256','bytes']);requireThat(id(ref.issueId)&&id(ref.attachmentId)&&isHash(ref.sha256)&&Number.isSafeInteger(ref.bytes)&&ref.bytes>0&&ref.bytes<=CHUNK_BYTES,'Invalid Chunk Binding.');total+=ref.bytes;}
 requireThat(total===value.bytes,'Chunk Lengths Do Not Match.');return value;
}
export function validateCarrier(bytes,workspace){
 const c=parseJSON(bytes,{maxBytes:MAX_MANIFEST_BYTES});exact(c,['schema','workspaceId','operationId','publication','artifacts','assets','bindings','nativeMetadata','digest']);
 requireThat(c.schema==='NPCDexCarrier/1'&&c.workspaceId===workspace&&id(c.operationId),'Unsupported Carrier Identity.');verifyDigest(c);descriptor(c.publication);
 requireThat(Array.isArray(c.artifacts)&&c.artifacts.length>0&&c.artifacts.length<=10000,'Invalid Artifact Manifest.');
 for(const a of c.artifacts){exact(a,['digest','object']);requireThat(isHash(a.digest),'Invalid Artifact Identity.');descriptor(a.object);}unique(c.artifacts.map(a=>a.digest),'Carrier Artifact');
 requireThat(Array.isArray(c.assets)&&c.assets.length<=10000,'Invalid Asset Manifest.');
 for(const a of c.assets){exact(a,['assetId','mime','object']);requireThat(id(a.assetId)&&['image/png','image/jpeg','image/gif','image/webp','application/octet-stream','text/plain'].includes(a.mime),'Unsupported Asset.');descriptor(a.object,{allowEmpty:true});}unique(c.assets.map(a=>a.assetId),'Asset Identity');
 requireThat(Array.isArray(c.bindings)&&c.bindings.length<=10000&&Array.isArray(c.nativeMetadata)&&c.nativeMetadata.length<=10001,'Invalid Record Bindings.');
 for(const b of c.bindings){exact(b,['recordId','issueId']);requireThat(id(b.recordId)&&id(b.issueId),'Invalid Record Binding.');}unique(c.bindings.map(b=>b.recordId),'Bound Record');unique(c.bindings.map(b=>b.issueId),'Bound Issue');
 for(const m of c.nativeMetadata){exact(m,['issueId','summary','parentIssueId','descriptionSha256','commentsSha256']);requireThat(id(m.issueId)&&typeof m.summary==='string'&&m.summary.length<=1024&&(m.parentIssueId===null||id(m.parentIssueId))&&isHash(m.descriptionSha256)&&isHash(m.commentsSha256),'Invalid Native Metadata Pin.');}unique(c.nativeMetadata.map(m=>m.issueId),'Metadata Pin');
 return c;
}
