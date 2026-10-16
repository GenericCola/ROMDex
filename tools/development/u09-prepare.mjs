import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex'),release=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4.2-Manifest.json')),patch=JSON.parse(await fs.readFile('outputs/Header-Correction-Patch-Manifest.json')),map=new Map(release.files.map(f=>[f.path.slice(7),f]));for(const f of patch.files)map.set(f.path,f);
await fs.mkdir('outputs/U09-Before');await fs.mkdir('work/u09');const files=[];
for(const [name,entry]of map){const bytes=await fs.readFile('outputs/ROMDex-v0.4.2/ROMDex/'+name);assert.equal(sha(bytes),entry.sha256);if(name!=='preview.png')assert.ok(bytes.equals(await fs.readFile('outputs/ROMDex/'+name)));const target='outputs/U09-Before/'+name;await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);files.push({path:name,sha256:sha(bytes),bytes:bytes.length});}
await fs.writeFile('work/u09/baseline.json',JSON.stringify({files,baseVersion:'0.4.2 + H01'},null,2));
let source=await fs.readFile('outputs/ROMDex/public/store.mjs','utf8');const start=source.indexOf('export class Workspace');let engine=source.slice(start).replace('export class Workspace extends','export class WorkspaceEngine extends');
engine=engine.replace('constructor({transport=request,storage=null,files=new FileStorage(),upload=uploadRequest}={})','constructor({transport,storage,files,upload,preferenceCache={load:state=>state.automaticSyncEnabled!==false,save:()=>{}},now=()=>Date.now()}={})');
engine=engine.replace('super();this.request=transport;',"super();if(!transport||!storage?.load||!storage?.save)throw Error('Workspace Requires Transport and Durable Storage.');this.preferenceCache=preferenceCache;this.now=now;this.request=transport;");
engine=engine.replace(/  let state;if\(this.storage\)[^\n]+/, '  let state=await this.storage.load();');engine=engine.replace('cachedSyncPreference(state)','this.preferenceCache.load(state)');
engine=engine.replace(/  this.interval=setInterval[^\n]+\n  window.addEventListener[^\n]+\n  document.addEventListener[^\n]+\n/,'');
engine=engine.replace(/async persist\(state\)\{[^\n]+/,'async persist(state){return this.storage.save(state);}')
 .replace('cacheSyncPreference(this.automaticSyncEnabled)','this.preferenceCache.save(this.automaticSyncEnabled)')
 .replaceAll('clearTimeout(this.timer)',"this.dispatchEvent(new Event('cancel-scheduled-sync'))")
 .replace('clearTimeout(this.backupTimer);this.backupTimer=setTimeout(()=>this.request(\'/api/backup\',this.state).catch(()=>{}),1000);',"this.dispatchEvent(new Event('backup-needed'));")
 .replace('this.timer=setTimeout(()=>this.sync(),800)',"this.dispatchEvent(new CustomEvent('schedule-sync',{detail:800}))")
 .replace('this.timer=setTimeout(()=>this.sync(),1500)',"this.dispatchEvent(new CustomEvent('schedule-sync',{detail:1500}))")
 .replaceAll('Date.now()','this.now()');
engine=engine.replace('now=()=>this.now()','now=()=>Date.now()');
engine=engine.replace('async init(){','init(){if(!this.initializing)this.initializing=this.initialize();return this.initializing;}\n async initialize(){');
engine=engine.replace(' async sync(manual=false){',` sync(manual=false){
  if(this.syncTask){if(!manual||this.syncIsManual)return this.syncTask;if(!this.pendingManual)this.pendingManual=this.syncTask.then(()=>{this.pendingManual=null;return this.sync(true);});return this.pendingManual;}
  this.syncIsManual=manual;this.syncTask=this.performSync(manual).finally(()=>{this.syncTask=null;this.syncIsManual=false;});return this.syncTask;
 }
 async performSync(manual=false){`);
const imports=source.slice(0,source.indexOf('export async function request')).replace("import {FileStorage,uploadRequest} from './attachment-files.mjs';\n",'');
assert.equal(/\b(window|document|localStorage|indexedDB|setTimeout|setInterval)\b/.test(engine),false);await fs.writeFile('outputs/ROMDex/public/workspace-engine.mjs',imports+engine);
await fs.writeFile('outputs/ROMDex/public/store.mjs',`import {WorkspaceEngine} from './workspace-engine.mjs';
import {FileStorage,uploadRequest} from './attachment-files.mjs';
import {BrowserWorkspaceStorage,WorkspaceClock,preferenceCache} from './workspace-runtime.mjs';
export async function request(path,body){const response=await fetch(path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(180000)});const data=await response.json();if(!response.ok){const error=new Error(data.error||'Request failed.');error.syncStatus=data;throw error;}return data;}
export class Workspace extends WorkspaceEngine{
 constructor({transport=request,storage=new BrowserWorkspaceStorage(),files=new FileStorage(),upload=uploadRequest,...options}={}){super({transport,storage,files,upload,preferenceCache,...options});this.clock=new WorkspaceClock(this);}
 async init(){await super.init();this.clock.start();}
 dispose(){this.clock.stop();}
}
`);
console.log('Protected 0.4.2 + H01 and extracted the native queue engine without browser globals or timers.');
