import fs from 'node:fs/promises';
import {openAsBlob} from 'node:fs';
import path from 'node:path';
import {WorkspaceEngine} from '../public/workspace-engine.mjs';
import {WorkspaceClock} from '../public/workspace-runtime.mjs';
import {DurableJSONStorage} from '../durable-json-storage.mjs';
import {UploadStorage} from '../attachment-storage.mjs';
import {MAX_FILES,validateFile} from '../public/attachment-core.mjs';
import {validateCall,STORES} from './policy.mjs';
const root=path.resolve(import.meta.dirname,'..'),profile=process.env.ROMDEX_DATA_DIR;
if(!profile)throw Error('A Desktop Profile Is Required.');
process.env.ROMDEX_DESKTOP='1';process.env.ROMDEX_PORT='0';delete process.env.YOUTRACK_TOKEN;
const backend=await import('../server.mjs'),files=new UploadStorage(path.join(profile,'queued-files'));
const fixture=process.env.ROMDEX_QA==='1'&&process.env.ROMDEX_DESKTOP_FIXTURE==='1';
let fixtureItems=fixture?JSON.parse(await fs.readFile(path.join(profile,'fixture.json'),'utf8')).items:null;
async function transport(route,body){
 if(route==='/seed.json')return JSON.parse(await fs.readFile(path.join(root,'public/seed.json'),'utf8'));
 if(fixture&&['/api/status','/api/snapshot','/api/sync','/api/sync-settings'].includes(route)){
  if(route==='/api/sync-settings')await new DurableJSONStorage(path.join(profile,'sync-settings.json')).save({enabled:body.enabled});
  const status={connected:true,automaticSyncEnabled:(await new DurableJSONStorage(path.join(profile,'sync-settings.json')).load())?.enabled!==false,syncControl:true,youtrackAvailable:true,connection:{project:'PMON',missingStates:[],complexity:{ready:true}}};
  if(route==='/api/status')return status;
  if(route==='/api/snapshot'||route==='/api/sync')fixtureItems=JSON.parse(await fs.readFile(path.join(profile,'fixture.json'),'utf8')).items;
  if(body?.operations){if(body.operations.length)throw Error('QA Fixture Does Not Publish Native Operations.');}
  return {...status,items:fixtureItems,completed:[],mapping:{},at:Date.now()};
 }
 const response=await backend.dispatchLocal(route,{method:body===undefined?'GET':'POST',bytes:body===undefined?undefined:Buffer.from(JSON.stringify(body)),headers:{'content-type':'application/json'}});
 const value=JSON.parse(response.bytes.toString());if(response.status>=400)throw Object.assign(Error(value.error||'Service Request Failed.'),{syncStatus:value});return value;
}
const engine=new WorkspaceEngine({transport,storage:new DurableJSONStorage(path.join(profile,'desktop-workspace.json')),files:{
 async set(id,file){await files.stage(id,{name:file.name,size:file.size,mimeType:file.type||'application/octet-stream'},Buffer.from(await file.arrayBuffer()));},
 async get(id){try{const file=await files.read(id);return new File([file.bytes],file.metadata.name,{type:file.metadata.mimeType});}catch(error){if(error.code==='ENOENT'||error.message.includes('Missing'))return null;throw error;}},
 remove:id=>files.release(id)
},upload:async(id,file,name)=>{const form=new FormData();form.append('uploadId',id);form.append('file',file,name);const request=new Request('http://localhost/api/uploads',{method:'POST',body:form});const response=await backend.dispatchLocal('/api/uploads',{method:'POST',bytes:Buffer.from(await request.arrayBuffer()),headers:{'content-type':request.headers.get('content-type')}});const value=JSON.parse(response.bytes.toString());if(response.status>=400)throw Error(value.error);return value;}});
const clock=new WorkspaceClock(engine,{online:null,visibility:null});let started=false;
export function snapshot(){return Object.fromEntries(['state','busy','refreshing','connected','connection','rememberedConnection','mode','message','failures','pendingWrites','automaticSyncEnabled','youtrackAvailable','serviceAvailable','syncControl','settingBusy','manualSyncActive','lastAttempt'].map(k=>[k,engine[k]]).concat([['inflight',[...engine.inflight]]]));}
const listeners=new Set();export function subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}
function send(event){process.parentPort?.postMessage(event);for(const listener of listeners)listener(event);}
for(const type of ['change','mapping','refreshed','connectneeded','reviewneeded'])engine.addEventListener(type,e=>send(type==='change'?{type:'snapshot',value:snapshot()}:{type,detail:e.detail}));
const stores=new Map();function store(key){if(!STORES.has(key))throw Error('Unknown Workspace Store.');if(!stores.has(key))stores.set(key,new DurableJSONStorage(path.join(profile,key+'.json')));return stores.get(key);}
async function storage(mode,key,value){const target=store(key);if(mode==='load')return target.load();if(mode!=='save'||JSON.stringify(value??null).length>16*1024*1024)throw Error('Invalid Storage Request.');await target.save(value??null);return true;}
const allowedReads=new Set(['/api/status','/api/attachments','/api/attachment-content','/api/attachment-review']);
async function read(route){const url=new URL(route,'http://127.0.0.1');if(!allowedReads.has(url.pathname))throw Error('Unsupported Read Request.');return backend.dispatchLocal(url.pathname+url.search);}
async function attach(id,paths){if(typeof id!=='string'||!engine.items.some(x=>x.id===id)||!paths.length||paths.length>MAX_FILES)throw Error('Choose a Valid Ticket and 1–10 Files.');const chosen=[];for(const file of paths){const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Choose Regular Files.');validateFile({name:path.basename(file),size:stat.size});const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.txt':'text/plain'}[path.extname(file).toLowerCase()]||'application/octet-stream';chosen.push(new File([await openAsBlob(file)],path.basename(file),{type:mime}));}return engine.attach(id,chosen);}
export async function handle(command,args=[]){
 if(command==='storage')return storage(...args);
 if(command==='read')return read(args[0]);
 if(command==='attach')return attach(...args);
 if(command==='checkpoint'){await engine.lock;if(engine.state)await engine.persist(engine.state);await Promise.all([...stores.values()].map(x=>x.writes));return true;}
 if(command==='shutdown'){clock.stop();await handle('checkpoint');return true;}
 const {method}=validateCall(command,args);
 if(method==='init'){await engine.init();if(!started){clock.start();started=true;}return {snapshot:snapshot()};}
 if(!started)throw Error('Desktop Workspace Is Not Ready.');
 const value=await engine[method](...args);return {value,snapshot:snapshot()};
}
process.parentPort?.on('message',async({data})=>{const {id,command,args}=data;try{send({reply:id,value:await handle(command,args)});}catch(error){send({reply:id,error:error.message,syncStatus:error.syncStatus});}});
send({ready:true,versions:process.versions,fixture});
