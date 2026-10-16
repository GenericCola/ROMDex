import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';

export const PROFILE_KEY='thegobindsingh-PMON';
export const PRIVATE_FILES=['connection.encrypted','assigned-statuses.json','journal.json','sync-settings.json','workspace.json'];
const markerFile='profile.json';
const serviceFiles=['package.json','server.mjs','runtime-profile.mjs','youtrack.mjs','assigned-statuses.mjs','sync-settings.mjs','complexity-field.mjs','public/core.mjs','public/bulk-hierarchy.mjs','public/item-editor.mjs','public/custom-editor.mjs','public/field-tags.mjs'];
const here=path.dirname(fileURLToPath(import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

export function resolveProfile({root=here,env=process.env,platform=process.platform,home=os.homedir()}={}){
 if(env.ROMDEX_DATA_DIR)return {dataDir:path.resolve(env.ROMDEX_DATA_DIR),legacyDir:path.join(root,'.romdex'),shared:false};
 // Windows test sandboxes virtualize LOCALAPPDATA. Use the granted account folder there,
 // so a tested build and a normal Windows launch resolve the same remembered connection.
 const virtualized=/[\\/]Packages[\\/]sandbox\.[^\\/]+[\\/]AC(?:[\\/]|$)/i.test(env.LOCALAPPDATA||'');
 const windowsBase=virtualized?path.join(env.USERPROFILE||home,'AppData','Local'):(env.LOCALAPPDATA||path.join(home,'AppData','Local'));
 const base=platform==='win32'?windowsBase:(env.XDG_DATA_HOME||path.join(home,'.local','share'));
 return {dataDir:path.join(base,'ROMDex',PROFILE_KEY),legacyDir:path.join(root,'.romdex'),shared:true};
}
async function exists(file){try{await fs.stat(file);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}}
async function validExisting(dir){
 if(!await exists(dir))return false;
 let marker;try{marker=JSON.parse(await fs.readFile(path.join(dir,markerFile),'utf8'));}catch(error){throw new Error('The existing ROMDex profile needs review. Its data has not been overwritten.');}
 if(marker.version!==1||marker.profile!==PROFILE_KEY)throw new Error('The existing ROMDex profile belongs to a different configuration. Its data has not been overwritten.');
 return true;
}

export async function prepareProfile(options={}){
 const profile=resolveProfile(options);
 if(!profile.shared){await fs.mkdir(profile.dataDir,{recursive:true});return {...profile,migrated:false};}
 if(await validExisting(profile.dataDir))return {...profile,migrated:false};
 const parent=path.dirname(profile.dataDir);await fs.mkdir(parent,{recursive:true});
 const stage=path.join(parent,'.'+PROFILE_KEY+'-migration-'+randomUUID());await fs.mkdir(stage);
 const copied=[],missing=[];
 // Copy ciphertext as bytes. Only the service's normal Windows protection routine decrypts it.
 for(const name of PRIVATE_FILES){
  const source=path.join(profile.legacyDir,name);if(!await exists(source)){missing.push(name);continue;}
  const stat=await fs.lstat(source);if(!stat.isFile()||stat.isSymbolicLink())throw new Error('The legacy profile contains an unexpected file. Migration stopped; the original is preserved.');
  const target=path.join(stage,name);await fs.copyFile(source,target);
  const bytes=await fs.readFile(target);
  if(name.endsWith('.json'))JSON.parse(bytes.toString('utf8'));
  if(hash(bytes)!==hash(await fs.readFile(source)))throw new Error('The legacy profile changed during migration. Close ROMDex and try again; the original is preserved.');
  copied.push({name,digest:hash(bytes)});
 }
 // Verify the complete set again so a live writer cannot produce a mixed snapshot unnoticed.
 for(const entry of copied)if(hash(await fs.readFile(path.join(profile.legacyDir,entry.name)))!==entry.digest)throw new Error('The legacy profile changed during migration. Close ROMDex and try again; the original is preserved.');
 for(const name of missing)if(await exists(path.join(profile.legacyDir,name)))throw new Error('The legacy profile changed during migration. Close ROMDex and try again; the original is preserved.');
 await fs.writeFile(path.join(stage,markerFile),JSON.stringify({version:1,profile:PROFILE_KEY,createdAt:new Date().toISOString(),legacyBackup:copied.length?profile.legacyDir:null},null,2));
 // Publishing the complete directory is atomic. Never merge into an established destination.
 try{await fs.rename(stage,profile.dataDir);}catch(error){throw new Error('ROMDex could not publish the saved profile. Original data and the staged backup are preserved. Review the destination before retrying.');}
 return {...profile,migrated:copied.length>0};
}

export async function buildIdentity(root=here){
 const digest=createHash('sha256');for(const name of serviceFiles){digest.update(name);digest.update(await fs.readFile(path.join(root,name)));}
 const pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
 return {version:pkg.version,installationId:hash(path.resolve(root).toLowerCase()),serviceBuild:digest.digest('hex')};
}
export async function saveProtectedConnection(dir,ciphertext,{publish=fs.rename}={}){
 const target=path.join(dir,'connection.encrypted'),temporary=target+'.'+randomUUID()+'.tmp';
 await fs.writeFile(temporary,ciphertext,{flag:'wx'});await publish(temporary,target);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const command=process.argv[2];if(!['--identity','--prepare'].includes(command))throw new Error('Use --identity or --prepare.');
 const profile=command==='--prepare'?await prepareProfile():resolveProfile();
 console.log(JSON.stringify({...await buildIdentity(),...profile}));
}
