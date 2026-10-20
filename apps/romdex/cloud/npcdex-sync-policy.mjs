import path from 'node:path';
import {DurableJSONStorage} from '../durable-json-storage.mjs';

// This temporary workspace pause is independent of the shared Auto-Sync switch.
// It never changes the journal, local checkpointing, or task/metadata sync.
export async function loadNPCDexSyncPolicy(profile){
 const record=await new DurableJSONStorage(path.join(profile,'npcdex-sync-policy.json')).load();
 if(record&&(record.format!=='ROMDexNPCDexSyncPolicy/1'||typeof record.paused!=='boolean'))throw Error('The NPCDex Sync Pause Setting Needs Review.');
 const paused=record?.paused===true;
 return {paused,enabled:automatic=>!!automatic&&!paused,view(value){
  if(!paused||!value?.status)return value;
  const status=value.status;
  return {...value,status:{...status,syncPaused:true,automaticRemote:false,syncing:false,connection:'paused',attention:!!status.localError||!!status.review||status.localCheckpoint===false,message:'Cloud Sync Paused · Local Saves Enabled. '+(Number(status.pendingWrites||status.pending||0))+' Queued Entries Preserved.'}};
 }};
}
