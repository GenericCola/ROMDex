import {parseJSON,sha} from '../content/contracts.mjs';import {ensure} from './limits.mjs';
const cache=new Map(),MAX=16*1024*1024;let size=0;
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;}
// Every lookup rehashes exact bytes. Only bounded immutable parse results are
// reused; editing callers receive independent clones, never cached objects.
export function verifiedJSON(bytes,hash,{maxBytes=16*1024*1024,maxDepth=64,maxNodes=300000,clone=false}={}){ensure(Buffer.isBuffer(bytes)&&bytes.length<=maxBytes&&sha(bytes)===hash,'INTEGRITY','Verified JSON Bytes Changed.');const key=hash+':'+maxBytes+':'+maxDepth+':'+maxNodes;let entry=cache.get(key);if(!entry){const value=freeze(parseJSON(bytes,{maxBytes,maxDepth,maxNodes}));entry={value,bytes:bytes.length,checks:new Set()};if(bytes.length<=MAX){while((size+bytes.length>MAX||cache.size>=128)&&cache.size){const [k,e]=cache.entries().next().value;cache.delete(k);size-=e.bytes;}cache.set(key,entry);size+=bytes.length;}}else{cache.delete(key);cache.set(key,entry);}return {value:clone?structuredClone(entry.value):entry.value,checks:entry.checks};}
