import {MIGRATION_MAGIC,MAX_HEADER_BYTES,hex,validateMigrationMeta,migrationSummary} from './migration-format.mjs';
const $=id=>document.getElementById(id);let prepared;
if(location.origin!=='http://127.0.0.1:4322')throw Error('Open This Page from Your Live ROMDex Address.');
const digest=async bytes=>new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
async function readStore(name,bucket){
 const known=await indexedDB.databases();if(!known.some(x=>x.name===name))return new Map();
 const db=await new Promise((resolve,reject)=>{const r=indexedDB.open(name);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 try{if(!db.objectStoreNames.contains(bucket))throw Error('Unsupported Browser Save Layout.');return await new Promise((resolve,reject)=>{const tx=db.transaction(bucket),store=tx.objectStore(bucket),values=store.getAll(),keys=store.getAllKeys();tx.oncomplete=()=>resolve(new Map(keys.result.map((key,i)=>[key,values.result[i]])));tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
}
async function capture(){
 const [native,coord,npc,files,status]=await Promise.all([readStore('romdex-v1','workspace'),readStore('romdex-coordinator-v1','application'),readStore('ROMDex-NPCDex','snapshots'),readStore('romdex-files-v1','files'),fetch('/api/status').then(r=>{if(!r.ok)throw Error('Cannot Read the Current ROMDex Service.');return r.json();})]);
 return {native:native.get('current'),coordinator:coord.get('current')??null,npcCurrent:npc.get('current')??null,npcRecovery:npc.get('recovery-draft')??null,npcHeld:npc.get('held-recovery')??null,files,status,exportFolder:npc.get('export-directory')?.name??null};
}
const fingerprint=value=>JSON.stringify({stores:{native:value.native,coordinator:value.coordinator,npcCurrent:value.npcCurrent,npcRecovery:value.npcRecovery,npcHeld:value.npcHeld},automaticSyncEnabled:value.status.automaticSyncEnabled,files:[...value.files].map(([id,file])=>({id,name:file.name,size:file.size,type:file.type,lastModified:file.lastModified})).sort((a,b)=>a.id.localeCompare(b.id))});
$('ready').onchange=()=>$('capture').disabled=!$('ready').checked;
$('capture').onclick=async()=>{prepared=null;$('capture').disabled=true;$('download').hidden=true;$('result').textContent='';$('summary').textContent='Checking Saved Data and Queued Files…';try{
 const source=await capture(),files=[];for(const [id,file]of [...source.files].sort(([a],[b])=>a.localeCompare(b))){if(!(file instanceof Blob))throw Error('A Queued File Cannot Be Read. Nothing Was Discarded.');files.push({id,name:file.name,size:file.size,mimeType:file.type||'application/octet-stream',hash:hex(await digest(await file.arrayBuffer()))});}
 const meta={format:'ROMDexWebMigration/1',id:crypto.randomUUID(),createdAt:new Date().toISOString(),sourceOrigin:location.origin,project:'thegobindsingh-PMON',automaticSyncEnabled:source.status.automaticSyncEnabled!==false,legacyExportFolder:source.exportFolder,stores:{native:source.native,coordinator:source.coordinator,npcCurrent:source.npcCurrent,npcRecovery:source.npcRecovery,npcHeld:source.npcHeld},files};validateMigrationMeta(meta);
 if(fingerprint(source)!==fingerprint(await capture()))throw Error('The Save Changed During Capture. Close Other ROMDex Tabs and Try Again.');
 const bytes=new TextEncoder().encode(JSON.stringify(meta));if(bytes.length>MAX_HEADER_BYTES)throw Error('The Saved Data Exceeds the Current Transfer Limit. No Data Was Discarded.');
 const summary=migrationSummary(meta);$('summary').textContent=`ROMDex: ${summary.items} Items\nPending Operations: ${summary.pending}\nSelector Images: ${summary.images}\nManual Order Keys: ${summary.orderKeys}\nBrowser File Copies: ${summary.files} (${summary.fileBytes} Bytes)\nNPCDex Saved Revision: ${summary.npcRevision??'No Browser Save — Preserved Package Will Be Compared'}\nNPCDex Recovery Copy: ${summary.npcRecovery?'Present':'None'}\nNPCDex Held Copy: ${summary.npcHeld?'Present':'None'}\nAuto-Sync: ${meta.automaticSyncEnabled?'On':'Off'}`;
 prepared={meta,bytes,source,fingerprint:fingerprint(source)};$('download').hidden=false;
}catch(error){$('summary').textContent=error.message;}finally{$('capture').disabled=!$('ready').checked;}};
$('download').onclick=async()=>{if(!prepared)return;$('download').disabled=true;try{
 if(fingerprint(await capture())!==prepared.fingerprint)throw Error('The Save Changed After Preview. Check the Browser Saves Again.');
 const prefix=new Uint8Array(12);prefix.set(MIGRATION_MAGIC);new DataView(prefix.buffer).setUint32(8,prepared.bytes.length,true);const parts=[prefix,prepared.bytes,...prepared.meta.files.map(file=>prepared.source.files.get(file.id)),await digest(prepared.bytes)];const blob=new Blob(parts,{type:'application/octet-stream'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ROMDex-Web-Migration.rdx';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);$('result').textContent='Migration Copy Created. Wait for Chrome’s Download to Finish, Then Tell Codex. Your Original Saves Are Unchanged.';
}catch(error){$('result').textContent=error.message;prepared=null;$('download').hidden=true;}finally{$('download').disabled=false;}};
