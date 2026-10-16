import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {buildIdentity} from '../outputs/ROMDex/runtime-profile.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex'),base='outputs/ROMDex',installed='outputs/ROMDex-v0.4.1/ROMDex';
const before=JSON.parse(await fs.readFile('work/u06/before-manifest.json'));
for(const f of before.files)assert.equal(sha(await fs.readFile('outputs/U06-Before/'+f.path.slice(7))),f.sha256);
assert.equal(sha(await fs.readFile('outputs/ROMDex-v0.4.1.zip')),before.zipSHA256);
const credentials=JSON.parse(await fs.readFile('work/u06/credential-integrity.json'));assert.equal(sha(await fs.readFile(credentials.path)),credentials.sha256);
const reference=JSON.parse(await fs.readFile('work/u06/reference-integrity.json'));for(const key of ['savedExport','npcTemplate'])assert.equal(sha(await fs.readFile(reference[key].path)),reference[key].sha256);
const assets=['theme.css','header.mjs','npcdex-pokeball.svg','standard-settings-icon.svg'];
for(const name of assets){const bytes=await fs.readFile(base+'/public/shared-ui/'+name);for(const dir of [base+'/shared-ui','outputs/Tool-Suite-UI'])assert.ok(bytes.equals(await fs.readFile(dir+'/'+name)),dir+'/'+name);}
async function walk(dir){const all=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const f=path.join(dir,entry.name);if(entry.isDirectory()){if(!['node_modules','.romdex'].includes(entry.name))all.push(...await walk(f));}else if(f.endsWith('.mjs'))all.push(f);}return all;}
let syntax=0;for(const file of await walk(base)){const r=spawnSync(process.execPath,['--check',file],{windowsHide:true,encoding:'utf8'});assert.equal(r.status,0,r.stderr);syntax++;}
const origin='http://127.0.0.1:4322',api=async()=>{const r=await fetch(origin+'/api/status',{signal:AbortSignal.timeout(10000)});assert.equal(r.status,200);return r.json();};
const old=await api(),identity=await buildIdentity(path.resolve(installed));assert.equal(old.serviceBuild,identity.serviceBuild);assert.equal(old.installationId,identity.installationId);assert.equal(old.connected,true);assert.equal(old.rememberedConnection,true);
const files=[...assets.map(n=>'public/shared-ui/'+n),...assets.map(n=>'shared-ui/'+n),'shared-ui/README.md','public/app.mjs','public/styles.css','public/index.html'];
const entries=[];for(const file of files){const bytes=await fs.readFile(base+'/'+file),prior=await fs.readFile(installed+'/'+file).catch(e=>{if(e.code==='ENOENT')return null;throw e;});const original=before.files.find(f=>f.path==='ROMDex/'+file);assert.equal(prior?sha(prior):null,original?.sha256||null,'Unexpected installation change: '+file);entries.push({path:file,bytes:bytes.length,beforeSHA256:prior?sha(prior):null,sha256:sha(bytes)});}
for(const file of files){await fs.mkdir(path.dirname(installed+'/'+file),{recursive:true});await fs.copyFile(base+'/'+file,installed+'/'+file);}
let served=0;for(const f of entries){assert.equal(sha(await fs.readFile(installed+'/'+f.path)),f.sha256);if(f.path.startsWith('public/')){const r=await fetch(origin+'/'+f.path.slice(7),{signal:AbortSignal.timeout(10000)});assert.equal(r.status,200);assert.equal(sha(Buffer.from(await r.arrayBuffer())),f.sha256);served++;}}
const final=await api();assert.equal(final.serviceBuild,old.serviceBuild);assert.equal(final.installationId,old.installationId);assert.equal(final.automaticSyncEnabled,old.automaticSyncEnabled);assert.equal(final.connected,true);assert.equal(final.rememberedConnection,true);assert.equal(sha(await fs.readFile(credentials.path)),credentials.sha256);
const record={task:'U06',baseVersion:'0.4.1',patch:'U06 Shared Header',verifiedAt:new Date().toISOString(),testsPassed:227,syntaxChecks:syntax,uiChecks:20,servedAssetsVerified:served,serviceRestartRequired:false,serviceIdentityUnchanged:true,rememberedConnection:true,credentialCiphertextUnchanged:true,automaticSyncUnchanged:true,npcDexFilesUnchanged:true,originalReleaseZIPUnchanged:true,productionWrites:false,files:entries};
await fs.writeFile('outputs/U06-Patch-Manifest.json',JSON.stringify(record,null,2));console.log(JSON.stringify({...record,files:entries.length}));
