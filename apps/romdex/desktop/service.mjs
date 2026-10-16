import fs from 'node:fs/promises';
import path from 'node:path';
import {WorkspaceEngine} from '../public/workspace-engine.mjs';
import {WorkspaceClock} from '../public/workspace-runtime.mjs';
import {DurableJSONStorage} from '../durable-json-storage.mjs';
import {UploadStorage} from '../attachment-storage.mjs';
import {validateCall,STORES} from './policy.mjs';
import {chosenFiles,validateTicket} from './native-attachments.mjs';
import {setDesktopProtector,protectCredential} from '../credential-protection.mjs';
import {openNPCDexCloud} from '../cloud/desktop-provider.mjs';
const root=path.resolve(import.meta.dirname,'..'),profile=process.env.ROMDEX_DATA_DIR;
if(!profile)throw Error('A Desktop Profile Is Required.');
process.env.ROMDEX_DESKTOP='1';process.env.ROMDEX_PORT='0';delete process.env.YOUTRACK_TOKEN;
if(process.parentPort){let sequence=0;const credentials=new Map();process.parentPort.on('message',({data})=>{if(data.credentialReply){const request=credentials.get(data.credentialReply);if(request){credentials.delete(data.credentialReply);clearTimeout(request.timer);data.error?request.reject(Error(data.error)):request.resolve(data.value);}}});setDesktopProtector((value,decrypt)=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{credentials.delete(id);reject(Error('Windows Credential Protection Did Not Respond.'));},30000);credentials.set(id,{resolve,reject,timer});process.parentPort.postMessage({credentialRequest:id,value,decrypt});}));}
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
let cloud=null,cloudError=null;
const stores=new Map();function store(key){if(!STORES.has(key))throw Error('Unknown Workspace Store.');if(!stores.has(key))stores.set(key,new DurableJSONStorage(path.join(profile,key+'.json')));return stores.get(key);}
async function storage(mode,key,value){if(key==='npcdex-current'){if(cloudError)throw Error(cloudError);if(cloud){if(mode==='load')return cloud.view().snapshot;throw Error('NPCDex Cloud Writes Require Their Observed Revision.');}}const target=store(key);if(mode==='load')return target.load();if(mode!=='save'||JSON.stringify(value??null).length>16*1024*1024)throw Error('Invalid Storage Request.');await target.save(value??null);return true;}
const allowedReads=new Set(['/api/status','/api/attachments','/api/attachment-content','/api/attachment-review']);
const attachmentTasks=new Set();
let suspended=false,closing=false,updatesQuiesced=false;
async function read(route){const url=new URL(route,'http://127.0.0.1');if(!allowedReads.has(url.pathname))throw Error('Unsupported Read Request.');return backend.dispatchLocal(url.pathname+url.search);}
async function attach(id,selection,options){validateTicket(id);if(!engine.items.some(x=>x.id===id))throw Error('This Ticket Is No Longer Available.');return engine.attach(id,await chosenFiles(selection,options));}
export async function handle(command,args=[]){
 if(command==='verify-connection')return backend.verifyDesktopConnection();
 if(command==='release-delivery-settings')return backend.releaseDeliverySettings();
 if(command==='suspend'){suspended=true;clock.stop();await cloud?.stop();return handle('checkpoint');}
 if(command==='resume'){suspended=false;updatesQuiesced=false;if(started&&!closing){clock.start();cloud?.start();engine.tick(true).catch(()=>{});}return true;}
 if(command==='prepare-update'){clock.stop();updatesQuiesced=true;await cloud?.stop();const deadline=Date.now()+120000;while(engine.busy||engine.refreshing||engine.settingBusy||engine.statusTask||engine.staging||attachmentTasks.size){if(Date.now()>deadline){updatesQuiesced=false;if(!suspended&&started&&!closing)clock.start();throw Error('Wait for the Current Data Operation Before Updating.');}await new Promise(resolve=>setTimeout(resolve,100));}await handle('checkpoint');return true;}
 if(command==='npcdexView')return cloud?cloud.view():{active:false,error:cloudError};
 if(command==='npcdexCheckpoint'){if(!cloud)throw Error(cloudError||'NPCDex Cloud Has Not Been Configured.');if(updatesQuiesced||closing)throw Error('The Desktop Is Checkpointing for an Update or Shutdown.');return cloud.stage(args[0],args[1]);}
 if(command==='npcdexSync'){if(updatesQuiesced||closing||suspended)throw Error('NPCDex Sync Is Paused for Desktop Lifecycle Work.');if(!cloud)throw Error(cloudError||'NPCDex Cloud Has Not Been Configured.');return cloud.cycle(true);}
 if(['npcdexReview','npcdexReviewDraft','npcdexReviewAsset','npcdexResolve'].includes(command)){if(!cloud)throw Error(cloudError||'NPCDex Cloud Has Not Been Configured.');if(command!=='npcdexReview'&&(updatesQuiesced||closing||suspended))throw Error('NPCDex Review Is Paused for Desktop Lifecycle Work.');if(command==='npcdexReview')return cloud.reviewView();if(command==='npcdexReviewDraft')return cloud.saveReviewDraft(args[0]);if(command==='npcdexReviewAsset')return cloud.reviewAsset(args[0]);return cloud.resolveReview(args[0]);}
 if(command==='storage')return storage(...args);
 if(command==='read')return read(args[0]);
 if(command==='attach'){const task=attach(...args);attachmentTasks.add(task);try{return await task;}finally{attachmentTasks.delete(task);}}
 if(command==='checkpoint'){await cloud?.local;cloud?.journal.checkpoint();await Promise.allSettled([...attachmentTasks]);await engine.lock;if(engine.state)await engine.persist(engine.state);await Promise.all([...stores.values()].map(x=>x.writes));return true;}
 if(command==='shutdown'){closing=true;clock.stop();await cloud?.stop();try{await handle('checkpoint');return true;}catch(error){closing=false;if(!suspended&&started)clock.start();throw error;}}
 const {method}=validateCall(command,args);
 if(updatesQuiesced)throw Error('ROMDex Is Checkpointing for an Application Update.');
 if(method==='init'){await engine.init();if(!started){if(!suspended){clock.start();cloud?.start();}started=true;}return {snapshot:snapshot()};}
 if(!started)throw Error('Desktop Workspace Is Not Ready.');
 const value=await engine[method](...args);if(method==='setAutomaticSync'){if(engine.automaticSyncEnabled)cloud?.start();else await cloud?.stop();}return {value,snapshot:snapshot()};
}
process.parentPort?.on('message',async({data})=>{if(data.credentialReply)return;const {id,command,args}=data;try{send({reply:id,value:await handle(command,args)});}catch(error){send({reply:id,error:error.message,syncStatus:error.syncStatus});}});
process.parentPort?.on('close',()=>{clock.stop();process.exit(0);});
if(!fixture||(process.env.ROMDEX_QA==='1'&&process.env.ROMDEX_QA_CLOUD_BRANCH))try{cloud=await openNPCDexCloud({profile,protect:protectCredential,enabled:()=>engine.automaticSyncEnabled,changed:detail=>send({type:'npcdex-cloud',detail}),verificationBranch:process.env.ROMDEX_QA==='1'?process.env.ROMDEX_QA_CLOUD_BRANCH||null:null});}catch(error){cloudError='NPCDex Cloud Needs Recovery · '+error.message;}
send({ready:true,versions:process.versions,fixture});
