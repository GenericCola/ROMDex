import fs from 'node:fs/promises';import path from 'node:path';
import {GitHubSaveStore} from './github-store.mjs';import {restorePreparedImport} from './npcdex-import.mjs';
import {NPCDexJournal} from './npcdex-journal.mjs';import {NPCDexSync} from './npcdex-sync.mjs';import {DurableJSONStorage} from '../durable-json-storage.mjs';
export async function openNPCDexCloud({profile,protect,enabled,changed,verificationBranch=null}){
 const base=path.dirname(profile),cloud=path.join(base,'cloud');let connection,seed;
 try{connection=JSON.parse(await fs.readFile(path.join(cloud,'github-connection.encrypted'),'utf8'));seed=JSON.parse(await fs.readFile(path.join(cloud,'npcdex-import.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw error;}
 const store=new GitHubSaveStore({connection,credential:()=>protect(JSON.stringify(connection.credential),true),writeInterval:1500,verificationBranch});
 if(seed.format!=='ROMDexNPCDexCloudSeed/1'||seed.workspace!==store.workspace||!path.resolve(seed.localBackup).startsWith(path.join(cloud,'imports')+path.sep))throw Error('The Accepted NPCDex Cloud Import Needs Review.');
 const prepared=await restorePreparedImport(seed.localBackup);if(prepared.prepared.id!==seed.record)throw Error('The Initial NPCDex Cloud Revision Changed.');
 const journal=new NPCDexJournal(path.join(cloud,'runtime')),mirror=new DurableJSONStorage(path.join(profile,'npcdex-current.json'));
 const engine=new NPCDexSync({journal,store,workspace:store.workspace,device:connection.deviceId,enabled,changed,mirror:value=>mirror.save(value)});
 try{await engine.init({prepared,current:await mirror.load(),carrier:seed.commit});}catch(error){journal.close();throw error;}
 return engine;
}
