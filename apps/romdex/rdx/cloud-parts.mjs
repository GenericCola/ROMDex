import {canonical,parseJSON,sha,same} from '../content/contracts.mjs';import {validateDocument} from './document.mjs';import {ensure,LIMITS} from './limits.mjs';
const arrays=['records','plans','reviews','mappings','views','tasks'];
// Exact canonical history documents are factored into immutable artifact objects.
// Editing one record therefore uploads that artifact and small reference tables,
// including the prior document's table, rather than uploading whole save files.
export function splitDocument(value){const objects=new Map(),owners=new Map(),seen=new Map();
 const put=(bytes,owner=null)=>{const hash=sha(bytes);objects.set(hash,bytes);if(owner)owners.set(hash,owner);return hash;};
 const document=d=>{const header=structuredClone(d),collections={};for(const key of arrays)if(Array.isArray(header.content[key])){collections[key]=header.content[key].map(a=>put(Buffer.from(canonical(a)),a.recordId||a.target?.recordId||null));delete header.content[key];}return put(Buffer.from(canonical({format:'RDXCloudParts/1',header,collections})));};
 const blobs=[];for(const a of value.document.assetInventory){if(seen.has(a.sha256))continue;seen.set(a.sha256,true);const bytes=value.blobs.get(a.sha256);ensure(bytes&&sha(bytes)===a.sha256,'INVALID','A Cloud Asset Is Missing or Changed.');let root=null;if(a.purpose==='history'&&a.mime==='application/json')try{const d=parseJSON(bytes);if(d.format==='RDXDocument/1'&&Buffer.from(canonical(d)).equals(bytes))root=document(d);}catch{}blobs.push({hash:a.sha256,bytes:bytes.length,...(root?{root}:{object:put(bytes)})});}
 const root=document(value.document);return {root,blobs,objects,owners};
}
export async function joinDocument(manifest,object){ensure(manifest&&typeof manifest.root==='string'&&Array.isArray(manifest.blobs),'INVALID','Invalid Cloud Document Descriptor.');let total=0;const cache=new Map();
 const get=async hash=>{if(cache.has(hash))return cache.get(hash);const bytes=await object(hash);ensure(Buffer.isBuffer(bytes)&&sha(bytes)===hash,'INTEGRITY','Cloud Object Bytes Differ.');total+=bytes.length;ensure(total<=LIMITS.decoded,'LIMIT','Cloud Document Decoded Size Exceeded.');cache.set(hash,bytes);return bytes;};
 const build=async root=>{const part=parseJSON(await get(root));ensure(part.format==='RDXCloudParts/1'&&part.header&&part.collections&&Object.keys(part.collections).every(k=>arrays.includes(k)),'INVALID','Unknown Cloud Parts Format.');const d=structuredClone(part.header);for(const [key,refs]of Object.entries(part.collections)){ensure(Array.isArray(refs)&&!Object.hasOwn(d.content,key),'INVALID','Cloud Collection Differs.');d.content[key]=[];for(const ref of refs)d.content[key].push(parseJSON(await get(ref)));}return Buffer.from(canonical(d));};
 const blobs=new Map();for(const ref of manifest.blobs){ensure(!blobs.has(ref.hash)&&Number.isSafeInteger(ref.bytes)&&ref.bytes>=0&&ref.bytes<=LIMITS.blob,'INVALID','Invalid Cloud Asset Descriptor.');const bytes=ref.root?await build(ref.root):await get(ref.object);ensure(bytes.length===ref.bytes&&sha(bytes)===ref.hash,'INTEGRITY','Cloud Asset Reconstruction Differs.');blobs.set(ref.hash,bytes);}
 const documentBytes=await build(manifest.root),validated=validateDocument(documentBytes,{blobs});return {...validated,document:validated.document||parseJSON(documentBytes),documentBytes,blobs};
}
export const sameParts=(a,b)=>a.root===b.root&&same(a.blobs,b.blobs);
