import fs from 'node:fs/promises';import path from 'node:path';
import {GitHubSaveStore} from './github-store.mjs';import {NPCDexJournal} from './npcdex-journal.mjs';import {MetadataSync} from './metadata-sync.mjs';import {captureMetadata} from './metadata-core.mjs';
export async function openMetadataCloud({profile,protect,enabled,changed,current,assigned,project,verificationBranch=null}){
 const cloud=path.join(path.dirname(profile),'cloud');let connection;try{connection=JSON.parse(await fs.readFile(path.join(cloud,'github-connection.encrypted'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;try{await fs.stat(path.join(cloud,'runtime/romdex-metadata.sqlite'));}catch(missing){if(missing.code==='ENOENT')return null;throw missing;}throw Error('The Existing Metadata Journal Is Missing Its Connection.');}
 if(!current)return null;
 const store=new GitHubSaveStore({connection,credential:()=>protect(JSON.stringify(connection.credential),true),writeInterval:1500,verificationBranch}),journal=new NPCDexJournal(path.join(cloud,'runtime'),{filename:'romdex-metadata.sqlite'}),manager=new MetadataSync({journal,store,workspace:store.workspace,device:connection.deviceId,enabled,changed,project});
 const importExisting=Object.keys(current.images||{}).length>0||Object.keys(current.order||{}).length>0||Object.values(assigned).some(x=>x.explicitAssigned||x.assignedState!==x.lastState);
 try{await manager.init({current:captureMetadata(current,assigned),importExisting});}catch(error){journal.close();throw error;}return manager;
}
