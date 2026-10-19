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
import {openMetadataCloud} from '../cloud/metadata-provider.mjs';
import {MetadataProjection} from '../cloud/metadata-projection.mjs';
import {ReturnDiscovery} from '../rdx/return-discovery.mjs';
import {MapPackageWorkspace} from '../rdx/map-package-workspace.mjs';
import {MapWorkspace} from '../rdx/map-workspace.mjs';
import {PlanWorkspace} from '../rdx/plan-workspace.mjs';
import {DocumentCloud} from '../rdx/document-cloud.mjs';
import {YouTrackRDXStore} from '../rdx/youtrack-store.mjs';
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
let metadata=null,metadataError=null;
const metadataProjection=new MetadataProjection({storage:new DurableJSONStorage(path.join(profile,'desktop-workspace.json')),records:()=>backend.desktopAssignedRecords(),applyAssigned:(...args)=>backend.applyDesktopAssignedMetadata(...args)});
const engine=new WorkspaceEngine({transport,storage:metadataProjection,files:{
 async set(id,file){await files.stage(id,{name:file.name,size:file.size,mimeType:file.type||'application/octet-stream'},Buffer.from(await file.arrayBuffer()));},
 async get(id){try{const file=await files.read(id);return new File([file.bytes],file.metadata.name,{type:file.metadata.mimeType});}catch(error){if(error.code==='ENOENT'||error.message.includes('Missing'))return null;throw error;}},
 remove:id=>files.release(id)
},upload:async(id,file,name)=>{const form=new FormData();form.append('uploadId',id);form.append('file',file,name);const request=new Request('http://localhost/api/uploads',{method:'POST',body:form});const response=await backend.dispatchLocal('/api/uploads',{method:'POST',bytes:Buffer.from(await request.arrayBuffer()),headers:{'content-type':request.headers.get('content-type')}});const value=JSON.parse(response.bytes.toString());if(response.status>=400)throw Error(value.error);return value;}});
const clock=new WorkspaceClock(engine,{online:null,visibility:null});let started=false;
export function snapshot(){return Object.fromEntries(['state','busy','refreshing','connected','connection','rememberedConnection','mode','message','failures','pendingWrites','automaticSyncEnabled','youtrackAvailable','serviceAvailable','syncControl','settingBusy','manualSyncActive','lastAttempt'].map(k=>[k,engine[k]]).concat([['inflight',[...engine.inflight]],['metadataCloud',metadata?metadata.status():{active:false,label:'ROMDex Metadata',cloud:false,connection:metadataError?'unavailable':'local',attention:!!metadataError,localError:metadataError,message:metadataError||'ROMDex Metadata Uses Local Saves.'}]]));}
const listeners=new Set();export function subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}
function stopReturns(){clearInterval(returnTimer);returnTimer=null;returns?.pause();}
function startReturns(){returns?.resume();if(!returnTimer&&engine.automaticSyncEnabled){returnTimer=setInterval(()=>{if(!closing&&!suspended&&!updatesQuiesced&&started)returns.cycle().catch(()=>{});},15000);returnTimer.unref?.();returns.cycle().catch(()=>{});}}
function send(event){process.parentPort?.postMessage(event);for(const listener of listeners)listener(event);}
for(const type of ['change','mapping','refreshed','connectneeded','reviewneeded'])engine.addEventListener(type,e=>send(type==='change'?{type:'snapshot',value:snapshot()}:{type,detail:e.detail}));
let cloud=null,cloudError=null,maps=null,plans=null,rdxCloud=null,packages=null,returns=null,planTimer=null,returnTimer=null;
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
 if(command==='suspend'){suspended=true;clock.stop();clearTimeout(planTimer);plans?.pause();packages?.pause();stopReturns();await returns?.stop();await packages?.stop();await Promise.all([cloud?.stop(),metadata?.stop(),rdxCloud?.stop()]);return handle('checkpoint');}
 if(command==='resume'){plans?.resume();packages?.resume();suspended=false;updatesQuiesced=false;startReturns();if(started&&!closing){clock.start();cloud?.start();metadata?.start();rdxCloud?.start();engine.tick(true).catch(()=>{});}return true;}
 if(command==='prepare-update'){clock.stop();updatesQuiesced=true;clearTimeout(planTimer);plans?.pause();packages?.pause();stopReturns();await returns?.stop();await packages?.stop();await Promise.all([cloud?.stop(),metadata?.stop(),rdxCloud?.stop()]);const deadline=Date.now()+120000;while(engine.busy||engine.refreshing||engine.settingBusy||engine.statusTask||engine.staging||attachmentTasks.size){if(Date.now()>deadline){updatesQuiesced=false;if(!suspended&&started&&!closing){plans?.resume();packages?.resume();startReturns();clock.start();cloud?.start();metadata?.start();rdxCloud?.start();}throw Error('Wait for the Current Data Operation Before Updating.');}await new Promise(resolve=>setTimeout(resolve,100));}await handle('checkpoint');return true;}
 if(command==='metadataEditorState'){if(!metadata)return true;const value=args[0];if(!value||typeof value.active!=='boolean'||Object.keys(value).some(key=>!['active','head'].includes(key)))throw Error('Invalid Metadata Editor State.');if(value.active){if(updatesQuiesced||closing||suspended)throw Error('ROMDex Metadata Editing Is Paused for Desktop Lifecycle Work.');await engine.lock;await metadata.projectionTask;if(value.head!==(metadata.state.projectedTip??metadata.state.captureTip))throw Error('ROMDex Metadata Updated While Opening This Editor. Reopen It to Use the Current Version.');metadataProjection.held=true;}else{metadataProjection.held=false;if(!updatesQuiesced&&!closing&&!suspended)await metadata.projectCurrent();}return true;}
 if(command==='npcdexView')return maps.view();
 if(command==='rdxPlan'){if(updatesQuiesced||closing||suspended)throw Error('Plan Import Is Paused for Desktop Lifecycle Work.');return plans.dispatch(...args);}
 if(command==='npcdexContent'&&args[0]?.startsWith('/api/packages/')){if(updatesQuiesced||closing||suspended)throw Error('Map Packaging Is Paused for Desktop Lifecycle Work.');if(args[0]==='/api/packages/check-returns'){if(args[2]!==maps.active)throw Error('The Open Map Changed. Reopen Package Delivery.');await returns.cycle(true);return {entries:packages.status()};}return packages.dispatch(...args);}
 if(command==='npcdexContent'){if(args[0]!=='/api/editor'&&!args[0]?.startsWith('/api/view')&&(updatesQuiesced||closing||suspended))throw Error('Content Editing Is Paused for Desktop Lifecycle Work.');return maps.dispatch(...args);}
 if(command==='npcdexCheckpoint'){if(!cloud)throw Error(cloudError||'NPCDex Cloud Has Not Been Configured.');if(updatesQuiesced||closing)throw Error('The Desktop Is Checkpointing for an Update or Shutdown.');return cloud.stage(args[0],args[1]);}
 if(command==='npcdexSync'){if(updatesQuiesced||closing||suspended)throw Error('NPCDex Sync Is Paused for Desktop Lifecycle Work.');if(!cloud)throw Error(cloudError||'NPCDex Cloud Has Not Been Configured.');return cloud.cycle(true);}
 if(['npcdexReview','npcdexReviewDraft','npcdexReviewAsset','npcdexResolve'].includes(command)){if(!cloud)throw Error(cloudError||'NPCDex Cloud Has Not Been Configured.');if(command!=='npcdexReview'&&(updatesQuiesced||closing||suspended))throw Error('NPCDex Review Is Paused for Desktop Lifecycle Work.');if(command==='npcdexReview')return cloud.reviewView();if(command==='npcdexReviewDraft')return cloud.saveReviewDraft(args[0]);if(command==='npcdexReviewAsset')return cloud.reviewAsset(args[0]);return cloud.resolveReview(args[0]);}
 if(['metadataView','metadataSync','metadataReview','metadataReviewDraft','metadataReviewAsset','metadataResolve'].includes(command)){
  if(!metadata)throw Error(metadataError||'ROMDex Metadata Cloud Has Not Been Configured.');if(command==='metadataView')return metadata.view();if((updatesQuiesced||closing||suspended)&&command!=='metadataReview')throw Error('ROMDex Metadata Is Paused for Desktop Lifecycle Work.');
  if(command==='metadataReview')return metadata.reviewView();if(command==='metadataReviewDraft')return metadata.saveReviewDraft(args[0]);if(command==='metadataReviewAsset')return metadata.reviewAsset(args[0]);if(command==='metadataResolve')return metadata.resolveReview(args[0]);await engine.lock;await metadata.cycle(true);return metadata.view();
 }
 if(command==='storage')return storage(...args);
 if(command==='read')return read(args[0]);
 if(command==='attach'){const task=attach(...args);attachmentTasks.add(task);try{return await task;}finally{attachmentTasks.delete(task);}}
 if(command==='checkpoint'){await returns?.running;await packages?.running;await maps?.checkpoint();await cloud?.local;cloud?.journal.checkpoint();await metadata?.local;await metadata?.projectionTask;metadata?.journal.checkpoint();await Promise.allSettled([...attachmentTasks]);await engine.lock;if(engine.state)await engine.persist(engine.state);await Promise.all([...stores.values()].map(x=>x.writes));return true;}
 if(command==='shutdown'){closing=true;clock.stop();clearTimeout(planTimer);plans?.pause();packages?.pause();stopReturns();await returns?.stop();await packages?.stop();await Promise.all([cloud?.stop(),metadata?.stop(),rdxCloud?.stop()]);try{await handle('checkpoint');await plans?.close();await maps?.close();return true;}catch(error){closing=false;if(!suspended&&started){plans?.resume();packages?.resume();startReturns();clock.start();cloud?.start();metadata?.start();rdxCloud?.start();}throw error;}}
 const {method}=validateCall(command,args);
 if(updatesQuiesced)throw Error('ROMDex Is Checkpointing for an Application Update.');
 if(method==='init'){metadataProjection.held=false;await engine.init();if(!started){await metadata?.projectCurrent();if(!suspended){clock.start();cloud?.start();metadata?.start();rdxCloud?.start();}started=true;if(!suspended)startReturns();}return {snapshot:snapshot()};}
 if(!started)throw Error('Desktop Workspace Is Not Ready.');
 const value=await engine[method](...args);if(method==='sync'){await plans.reconcile({manual:args[0]===true});await packages.cycle(args[0]===true);await returns.cycle(args[0]===true);await rdxCloud.cycle(args[0]===true);}if(method==='setAutomaticSync'){if(engine.automaticSyncEnabled){plans?.resume();packages?.resume();startReturns();cloud?.start();metadata?.start();rdxCloud?.start();}else{clearTimeout(planTimer);stopReturns();await returns?.stop();returns?.resume();await Promise.all([cloud?.stop(),metadata?.stop(),rdxCloud?.stop()]);}}return {value,snapshot:snapshot()};
}
process.parentPort?.on('message',async({data})=>{if(data.credentialReply)return;const {id,command,args}=data;try{send({reply:id,value:await handle(command,args)});}catch(error){send({reply:id,error:error.message,syncStatus:error.syncStatus});}});
process.parentPort?.on('close',()=>{clock.stop();stopReturns();process.exit(0);});
if(!fixture||(process.env.ROMDEX_QA==='1'&&(process.env.ROMDEX_QA_CLOUD_BRANCH||process.env.ROMDEX_QA_CONTENT==='1')))try{cloud=await openNPCDexCloud({profile,protect:protectCredential,enabled:()=>engine.automaticSyncEnabled,changed:detail=>{maps?.adoption?.schedule();send({type:'npcdex-cloud',detail});},verificationBranch:process.env.ROMDEX_QA==='1'?process.env.ROMDEX_QA_CLOUD_BRANCH||null:null});}catch(error){cloudError='NPCDex Cloud Needs Recovery · '+error.message;}
maps=new MapWorkspace({dataDirectory:path.dirname(profile),fallback:cloud?.kind==='youtrack-content'?cloud:null,changed:()=>send({type:'npcdex-cloud',detail:{localRDX:true}})});await maps.initialize();
plans=new PlanWorkspace({maps,engine,attachmentBytes:async(id,file)=>{const response=await backend.dispatchLocal('/api/attachment-content?id='+encodeURIComponent(id)+'&attachmentId='+encodeURIComponent(file));if(response.status>=400)throw Error('A Native Attachment Could Not Be Read.');return response.bytes;}});
rdxCloud=new DocumentCloud({maps,transport:new YouTrackRDXStore({credential:async()=>protectCredential(await fs.readFile(path.join(profile,'connection.encrypted'),'utf8'),true)}),enabled:()=>engine.automaticSyncEnabled,changed:()=>send({type:'npcdex-cloud',detail:{rdx:true}})});maps.cloud=rdxCloud;
packages=new MapPackageWorkspace({maps,engine,authorizationSafety:()=>({ready:!metadata?.state.review&&!metadata?.projectionError&&!metadataProjection.recovering,localOnly:!metadata,cloudPending:!!metadata&&(metadata.status().pending>0||metadata.status().connection!=='connected')}),target:id=>backend.desktopPackageTarget(id),attachmentBytes:async(id,file)=>{const response=await backend.dispatchLocal('/api/attachment-content?id='+encodeURIComponent(id)+'&attachmentId='+encodeURIComponent(file));if(response.status>=400)throw Error('A Package Attachment Could Not Be Read.');return response.bytes;},changed:()=>send({type:'npcdex-cloud',detail:{mapPackage:true}})});
returns=new ReturnDiscovery({maps,packages,inventory:(...args)=>backend.desktopReturnInventory(...args),bytes:(...args)=>backend.desktopReturnBytes(...args),enabled:()=>engine.automaticSyncEnabled,changed:()=>send({type:'npcdex-cloud',detail:{returnedRDX:true}})});if(maps.store)await returns.open();packages.returnDiscovery=returns;
engine.addEventListener('change',()=>{if(closing||suspended||updatesQuiesced||!started)return;clearTimeout(planTimer);planTimer=setTimeout(()=>plans.reconcile().then(()=>packages.cycle()).catch(()=>{}),250);planTimer.unref?.();});
if(!fixture||(process.env.ROMDEX_QA==='1'&&process.env.ROMDEX_QA_CLOUD_BRANCH))try{metadata=await openMetadataCloud({profile,protect:protectCredential,enabled:()=>engine.automaticSyncEnabled,changed:()=>send({type:'snapshot',value:snapshot()}),current:await metadataProjection.load(),assigned:backend.desktopAssignedRecords(),project:manager=>metadataProjection.project(manager),verificationBranch:process.env.ROMDEX_QA==='1'?process.env.ROMDEX_QA_CLOUD_BRANCH||null:null});}catch(error){metadataError='ROMDex Metadata Cloud Needs Recovery · '+error.message;}
metadataProjection.attach(engine,metadata);
send({ready:true,versions:process.versions,fixture,contentProvider:true});
