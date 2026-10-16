import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveProfile,prepareProfile,buildIdentity,saveProtectedConnection,PRIVATE_FILES} from '../runtime-profile.mjs';
const scratch=process.env.ROMDEX_TEST_SCRATCH||os.tmpdir();await fs.mkdir(scratch,{recursive:true});
async function fixture(){const base=await fs.mkdtemp(path.join(scratch,'romdex-profile-')),root=path.join(base,'build-a'),env={LOCALAPPDATA:path.join(base,'account-data')};await fs.mkdir(path.join(root,'.romdex'),{recursive:true});return {base,root,env,platform:'win32'};}
test('build folders share one account profile while explicit test directories stay isolated',()=>{
 const a=resolveProfile({root:'C:/build-a',env:{LOCALAPPDATA:'C:/Account'},platform:'win32'}),b=resolveProfile({root:'C:/build-b',env:{LOCALAPPDATA:'C:/Account'},platform:'win32'});assert.equal(a.dataDir,b.dataDir);assert.equal(a.shared,true);
 const isolated=resolveProfile({root:'C:/build-a',env:{LOCALAPPDATA:'C:/Account',ROMDEX_DATA_DIR:'C:/fixture'},platform:'win32'});assert.equal(isolated.shared,false);assert.equal(isolated.dataDir,path.resolve('C:/fixture'));
});
test('Windows sandbox and normal launches use the same granted account profile',()=>{
 const regular=resolveProfile({env:{LOCALAPPDATA:'C:/Users/Test/AppData/Local'},platform:'win32'}),sandbox=resolveProfile({env:{USERPROFILE:'C:/Users/Test',LOCALAPPDATA:'C:/Users/Test/AppData/Local/Packages/sandbox.fixture/AC'},platform:'win32'});
 assert.equal(regular.dataDir,sandbox.dataDir);
});
test('migration preserves ciphertext and all private state byte-for-byte and leaves the legacy backup intact',async()=>{
 const config=await fixture(),legacy=path.join(config.root,'.romdex');
 const data={'connection.encrypted':'opaque fixture ciphertext','assigned-statuses.json':JSON.stringify({'PMON-1':{assignedState:'To do'}}),'journal.json':JSON.stringify({op:{status:'running'}}),'sync-settings.json':'{"enabled":false}','workspace.json':JSON.stringify({remote:[],operations:[{opId:'pending',type:'comment',text:'Saved work'}],images:{a:'data:image/png;base64,fixture'},order:{a:1}})};
 for(const [file,value]of Object.entries(data))await fs.writeFile(path.join(legacy,file),value);
 const profile=await prepareProfile(config);assert.equal(profile.migrated,true);
 for(const file of PRIVATE_FILES){assert.equal(await fs.readFile(path.join(profile.dataDir,file),'utf8'),data[file]);assert.equal(await fs.readFile(path.join(legacy,file),'utf8'),data[file]);}
 assert.equal(JSON.parse(await fs.readFile(path.join(profile.dataDir,'profile.json'),'utf8')).legacyBackup,legacy);
});
test('a later build reuses the profile without overwriting it with an older local backup',async()=>{
 const config=await fixture();await fs.writeFile(path.join(config.root,'.romdex','sync-settings.json'),' {"enabled":false}');
 const first=await prepareProfile(config),root=path.join(config.base,'build-b');await fs.mkdir(path.join(root,'.romdex'),{recursive:true});await fs.writeFile(path.join(root,'.romdex','sync-settings.json'),' {"enabled":true}');
 const second=await prepareProfile({...config,root});assert.equal(second.dataDir,first.dataDir);assert.equal(second.migrated,false);assert.equal(JSON.parse(await fs.readFile(path.join(second.dataDir,'sync-settings.json'),'utf8')).enabled,false);
});
test('unknown destination and damaged legacy JSON are refused without replacing data',async()=>{
 const config=await fixture(),destination=resolveProfile(config).dataDir;await fs.mkdir(destination,{recursive:true});await fs.writeFile(path.join(destination,'sentinel'),'Keep this');
 await assert.rejects(prepareProfile(config),/needs review/);assert.equal(await fs.readFile(path.join(destination,'sentinel'),'utf8'),'Keep this');
 const other=await fixture();await fs.writeFile(path.join(other.root,'.romdex','workspace.json'),'{broken');await assert.rejects(prepareProfile(other));await assert.rejects(fs.stat(resolveProfile(other).dataDir),{code:'ENOENT'});assert.equal(await fs.readFile(path.join(other.root,'.romdex','workspace.json'),'utf8'),'{broken');
});
test('explicit fixture directory never imports an adjacent connection or workspace',async()=>{
 const config=await fixture();await fs.writeFile(path.join(config.root,'.romdex','connection.encrypted'),'Must not import');
 const profile=await prepareProfile({...config,env:{...config.env,ROMDEX_DATA_DIR:path.join(config.base,'isolated')}});assert.equal(profile.shared,false);assert.deepEqual(await fs.readdir(profile.dataDir),[]);await assert.rejects(fs.stat(path.join(config.env.LOCALAPPDATA,'ROMDex')),{code:'ENOENT'});
});
test('atomic protected-token replacement retains the previous file when publication fails',async()=>{
 const config=await fixture(),dir=path.join(config.root,'.romdex');await saveProtectedConnection(dir,'previous-ciphertext');await saveProtectedConnection(dir,'replacement-ciphertext');
 await assert.rejects(saveProtectedConnection(dir,'failed-ciphertext',{publish:async()=>{throw new Error('Fixture publication failed');}}),/publication failed/);assert.equal(await fs.readFile(path.join(dir,'connection.encrypted'),'utf8'),'replacement-ciphertext');
});
test('build identity distinguishes folders and changed imported service code',async()=>{
 const source=path.resolve(fileURLToPath(new URL('..',import.meta.url))),config=await fixture();
 for(const name of ['package.json','server.mjs','credential-protection.mjs','durable-json-storage.mjs','runtime-profile.mjs','youtrack.mjs','assigned-statuses.mjs','sync-settings.mjs','complexity-field.mjs','attachment-storage.mjs','attachment-service.mjs','public/attachment-core.mjs','public/core.mjs','public/bulk-hierarchy.mjs','public/item-editor.mjs','public/custom-editor.mjs','public/field-tags.mjs']){const target=path.join(config.root,name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(source,name),target);}
 const a=await buildIdentity(source),b=await buildIdentity(config.root);assert.equal(a.serviceBuild,b.serviceBuild);assert.notEqual(a.installationId,b.installationId);
 await fs.appendFile(path.join(config.root,'youtrack.mjs'),'\n// Changed fixture build\n');const c=await buildIdentity(config.root);assert.notEqual(c.serviceBuild,b.serviceBuild);assert.equal(c.installationId,b.installationId);
});
