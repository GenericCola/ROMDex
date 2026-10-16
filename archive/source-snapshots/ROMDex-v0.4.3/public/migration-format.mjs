// Local, versioned transfer envelope; existing NPCDex request/hash semantics are unchanged.
export const MIGRATION_MAGIC=new TextEncoder().encode('ROMDEXM1');
export const MAX_HEADER_BYTES=64*1024*1024,MAX_TRANSFER_BYTES=512*1024*1024;
export const hex=bytes=>[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
export function validateMigrationMeta(meta){
 if(meta?.format!=='ROMDexWebMigration/1'||meta.sourceOrigin!=='http://127.0.0.1:4322'||meta.project!=='thegobindsingh-PMON'||typeof meta.id!=='string'||!Array.isArray(meta.files)||typeof meta.automaticSyncEnabled!=='boolean')throw Error('This Is Not a Supported PMON Browser Migration Copy.');
 const state=meta.stores?.native;if(state?.version!==1||!Array.isArray(state.remote)||!Array.isArray(state.operations))throw Error('The Browser Task Save Is Missing or Unsupported.');
 if(!state.remote.length)throw Error('The Browser Task Save Is Empty. Review It Before Migrating.');
 for(const key of ['npcCurrent','npcRecovery','npcHeld'])if(meta.stores[key]!==null&&typeof meta.stores[key]!=='object')throw Error('Invalid NPCDex Save Record.');
 const ids=new Set();let total=0;for(const file of meta.files){if(typeof file.id!=='string'||!/^[-\w]{1,100}$/.test(file.id)||ids.has(file.id)||typeof file.name!=='string'||!file.name||file.name.length>255||/[\\/\r\n\0]/.test(file.name)||!Number.isSafeInteger(file.size)||file.size<0||file.size>50*1024*1024||!/^[a-f0-9]{64}$/.test(file.hash))throw Error('Invalid or Duplicate Queued File in Migration Copy.');ids.add(file.id);total+=file.size;}
 if(total>MAX_TRANSFER_BYTES)throw Error('This Migration Copy Exceeds the Current 512 MB Transfer Limit. Nothing Has Been Discarded; Review the Queued Files.');
 return {files:meta.files.length,fileBytes:total};
}
export function migrationSummary(meta){const state=meta.stores.native,npc=meta.stores.npcCurrent,npcData=npc?.data||npc?.snapshot||npc;return {items:state.remote.length,pending:state.operations.length,images:Object.keys(state.images||{}).length,orderKeys:Object.keys(state.order||{}).length,files:meta.files.length,fileBytes:meta.files.reduce((n,x)=>n+x.size,0),npcRevision:npcData?.revision??null,npcRecovery:!!meta.stores.npcRecovery,npcHeld:!!meta.stores.npcHeld};}
