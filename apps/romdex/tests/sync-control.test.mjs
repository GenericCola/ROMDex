import test from 'node:test';
import assert from 'node:assert/strict';
import {Workspace} from '../public/store.mjs';
import {connectionIndicator} from '../public/sync-control.mjs';
import {SyncSettings} from '../sync-settings.mjs';

const item={id:'PMON-1',summary:'Original',description:'Notes',state:'Done',assignedState:'Done',parentId:null,priority:'Normal',comments:[]};
const status=(enabled=true)=>({connected:true,connection:{localAssignedStatus:true,missingStates:[]},automaticSyncEnabled:enabled,syncControl:true,youtrackAvailable:true});
function fixture(t,{enabled=true,handler}={}){
 const calls=[],saved=[];let setting=enabled;
 const ws=new Workspace({storage:{save:async value=>saved.push(structuredClone(value))},transport:async(path,body)=>{
  calls.push({path,body});if(handler){const result=await handler(path,body);if(result!==undefined)return result;}
  if(path==='/api/status')return status(setting);
  if(path==='/api/sync-settings'){setting=body.enabled;return status(setting);}
  if(path==='/api/backup')return {ok:true};
  if(path==='/api/snapshot')return {items:[item],at:1,...status(setting)};
  if(path==='/api/sync')return {items:[{...item,summary:body.operations[0]?.patch.summary??item.summary}],completed:body.operations.map(x=>x.opId),mapping:{},at:1,...status(setting)};
  if(path.startsWith('/api/comments'))return {comments:[],...status(setting)};
  throw new Error('Unexpected request '+path);
 }});
 ws.state={remote:[structuredClone(item)],operations:[],order:{},images:{},expanded:[],selectorExpanded:[],blocked:null,automaticSyncEnabled:enabled};ws.applyStatus(status(enabled));ws.resting();
 t.after(()=>{clearTimeout(ws.timer);clearTimeout(ws.backupTimer);clearInterval(ws.interval);});
 return {ws,calls,saved,setShared:value=>setting=value};
}

test('connection lens separates healthy, lost and disabled states from unsaved work',()=>{
 const healthy={connected:true,youtrackAvailable:true,serviceAvailable:true};
 assert.equal(connectionIndicator(healthy).color,'blue');
 assert.equal(connectionIndicator({...healthy,youtrackAvailable:false}).color,'red');
 assert.equal(connectionIndicator({...healthy,serviceAvailable:false}).color,'red');
 assert.equal(connectionIndicator({...healthy,automaticSyncEnabled:false,youtrackAvailable:false}).color,'dark-blue');
});
test('shared setting is durable before it becomes active and manual permission is explicit',async()=>{
 let persisted;const setting=new SyncSettings({},async value=>persisted=value);
 await setting.set(false);assert.deepEqual(persisted,{enabled:false});assert.equal(setting.allows(),false);assert.equal(setting.allows('true'),false);assert.equal(setting.allows(true),true);
 const restored=new SyncSettings(persisted);assert.equal(restored.enabled,false);
 await assert.rejects(restored.set('off'),/On or Off/);
});
test('failed settings persistence preserves the previous choice',async()=>{
 const setting=new SyncSettings({},async()=>{throw new Error('Disk full');});
 await assert.rejects(setting.set(false),/Disk full/);assert.equal(setting.enabled,true);
});
test('disabled workspace keeps edits locally and blocks outgoing, incoming and comment requests',async t=>{
 const {ws,calls,saved}=fixture(t,{enabled:false});await ws.edit(item.id,{summary:'Local'});
 await ws.sync();await ws.refresh();assert.equal(await ws.comments(item.id),null);await ws.tick(true);
 assert.equal(ws.state.operations.length,1);assert.equal(ws.items[0].summary,'Local');assert.equal(saved.at(-1).operations.length,1);
 assert.deepEqual(calls.map(x=>x.path),['/api/status']);
});
test('disabled initialization, online events and page-return events never refresh YouTrack',async t=>{
 const previousWindow=globalThis.window,previousDocument=globalThis.document;
 globalThis.window=new EventTarget();globalThis.document=new EventTarget();globalThis.document.hidden=false;
 t.after(()=>{globalThis.window=previousWindow;globalThis.document=previousDocument;});
 const {ws,calls}=fixture(t,{enabled:false});ws.storage.load=async()=>structuredClone(ws.state);await ws.init();
 window.dispatchEvent(new Event('online'));document.dispatchEvent(new Event('visibilitychange'));await ws.checkStatus();await Promise.resolve();
 assert.equal(calls.some(x=>['/api/sync','/api/snapshot'].includes(x.path)),false);assert.equal(ws.automaticSyncEnabled,false);
});
test('manual Save performs one cycle while off, pulls native changes, and does not resume',async t=>{
 const {ws,calls}=fixture(t,{enabled:false,handler:(path,body)=>path==='/api/sync'?{...status(false),items:[{...item,summary:'Local',description:'Native Notes'}],completed:body.operations.map(x=>x.opId),mapping:{},at:2}:undefined});
 await ws.edit(item.id,{summary:'Local'});await ws.sync(true);assert.equal(ws.state.operations.length,0);assert.equal(ws.items[0].description,'Native Notes');assert.equal(ws.automaticSyncEnabled,false);assert.equal(ws.mode,'paused');assert.equal(calls.find(x=>x.path==='/api/sync').body.manual,true);
 await ws.edit(item.id,{summary:'Later Local'});await ws.sync();await ws.tick(true);assert.equal(calls.filter(x=>x.path==='/api/sync').length,1);assert.equal(ws.state.operations.length,1);
});
test('one-time sync reads conflicting native values before committing and preserves the pending edit',async t=>{
 let reviewed=0;const {ws}=fixture(t,{enabled:false,handler:path=>path==='/api/sync'?{...status(false),items:[{...item,summary:'Native'}],completed:[],mapping:{},blocked:{opId:'queued',conflicts:[{field:'summary',base:'Original',local:'Local',remote:'Native'}]},at:2}:undefined});
 ws.state.operations=[{opId:'queued',type:'edit',issueId:item.id,base:item,patch:{summary:'Local'}}];ws.addEventListener('reviewneeded',()=>reviewed++);
 await ws.sync(true);assert.equal(reviewed,1);assert.equal(ws.state.operations.length,1);assert.equal(ws.items[0].summary,'Local');assert.equal(ws.state.remote[0].summary,'Native');assert.equal(ws.automaticSyncEnabled,false);assert.equal(ws.youtrackAvailable,true);
});
test('resolving a paused conflict commits one explicit cycle and leaves automatic sync off',async t=>{
 let cycles=0;const {ws,calls}=fixture(t,{enabled:false,handler:(path,body)=>{
  if(path!=='/api/sync')return;
  cycles++;return cycles===1?{...status(false),items:[{...item,summary:'Native'}],completed:[],mapping:{},blocked:{opId:'queued',conflicts:[{field:'summary',base:'Original',local:'Local',remote:'Native'}]},at:2}:{...status(false),items:[{...item,summary:'Local'}],completed:body.operations.map(x=>x.opId),mapping:{},blocked:null,at:3};
 }});
 ws.state.operations=[{opId:'queued',type:'edit',issueId:item.id,base:item,patch:{summary:'Local'}}];await ws.sync(true);await ws.resolve({summary:{mode:'local'}});
 assert.equal(ws.state.blocked,null);assert.equal(ws.state.operations.length,0);assert.equal(ws.automaticSyncEnabled,false);assert.ok(calls.filter(x=>x.path==='/api/sync').every(x=>x.body.manual===true));
});
test('a second window observes the shared off switch before sending its stale queued edit',async t=>{
 const {ws,calls,setShared}=fixture(t);await ws.edit(item.id,{summary:'Queued'});clearTimeout(ws.timer);setShared(false);await ws.sync();
 assert.equal(ws.automaticSyncEnabled,false);assert.equal(ws.state.operations.length,1);assert.equal(calls.some(x=>x.path==='/api/sync'),false);
});
test('a server-side off decision during an automatic request does not consume pending operations',async t=>{
 const {ws}=fixture(t,{handler:path=>path==='/api/sync'?{...status(false),syncDisabled:true}:undefined});
 await ws.edit(item.id,{summary:'Queued'});clearTimeout(ws.timer);await ws.sync();assert.equal(ws.state.operations.length,1);assert.equal(ws.automaticSyncEnabled,false);assert.equal(ws.mode,'paused');
});
test('re-enabling runs reconciliation, then follows new native snapshots automatically',async t=>{
 const {ws,calls}=fixture(t,{enabled:false,handler:path=>path==='/api/snapshot'?{...status(true),items:[{...item,summary:'Native Later'}],at:3}:undefined});
 await ws.edit(item.id,{summary:'Local'});await ws.setAutomaticSync(true);assert.equal(ws.state.operations.length,0);assert.equal(ws.automaticSyncEnabled,true);assert.equal(calls.find(x=>x.path==='/api/sync').body.manual,false);
 await ws.refresh();assert.equal(ws.items[0].summary,'Native Later');
});
test('another window sees re-enablement and resumes rather than retaining its local pause',async t=>{
 const {ws,calls,setShared}=fixture(t,{enabled:false});setShared(true);await ws.tick();assert.equal(ws.automaticSyncEnabled,true);assert.equal(calls.filter(x=>x.path==='/api/sync').length,1);
});
test('lost service marks the connection unavailable without discarding local work',async t=>{
 const {ws}=fixture(t,{handler:path=>{if(path==='/api/status')throw new Error('Service unavailable');}});
 await ws.edit(item.id,{summary:'Pending'});clearTimeout(ws.timer);await ws.tick(true);assert.equal(ws.serviceAvailable,false);assert.equal(ws.youtrackAvailable,false);assert.equal(ws.state.operations.length,1);
});

test('background connection/setup retries never reopen Connection Details; manual requests remain available',async t=>{
 const {ws,calls}=fixture(t);let opens=0;ws.addEventListener('connectneeded',()=>opens++);
 for(const connected of [false,true]){
  ws.connected=connected;ws.connection={missingStates:connected?['Needs Testing']:[]};
  for(let n=0;n<3;n++)await ws.sync();
  assert.equal(opens,connected?1:0);assert.equal(ws.mode,'manual');assert.equal(calls.length,0);
  if(connected)assert.match(ws.message,/Setup Required/);
  await ws.sync(true);assert.equal(opens,connected?2:1);
 }
});
test('failed YouTrack sync turns connection red; the next successful cycle restores blue',async t=>{
 let fail=true;const {ws}=fixture(t,{handler:path=>{if(path==='/api/sync'&&fail)throw new Error('Network interrupted');}});
 await ws.edit(item.id,{summary:'Pending'});clearTimeout(ws.timer);await ws.sync(true);assert.equal(connectionIndicator(ws).color,'red');assert.equal(ws.state.operations.length,1);
 fail=false;await ws.sync(true);assert.equal(connectionIndicator(ws).color,'blue');assert.equal(ws.state.operations.length,0);
});
test('a stale status response cannot undo a newer explicit switch change',async t=>{
 let release;const delayed=new Promise(resolve=>release=resolve);const {ws}=fixture(t,{handler:path=>path==='/api/status'?delayed:undefined});
 const old=ws.checkStatus();await ws.setAutomaticSync(false);release(status(true));await old;assert.equal(ws.automaticSyncEnabled,false);
});
test('shared setting checks do not overwrite another window’s workspace queue',async t=>{
 const {ws,saved,setShared}=fixture(t);setShared(false);await ws.checkStatus();assert.equal(ws.automaticSyncEnabled,false);assert.equal(saved.length,0);await ws.setAutomaticSync(false);assert.equal(saved.length,0);
});
test('a local save failure does not claim the healthy YouTrack connection is lost',async t=>{
 const {ws}=fixture(t,{handler:path=>{if(path==='/api/sync'){const error=new Error('Disk full');error.syncStatus=status(true);throw error;}}});
 await ws.edit(item.id,{summary:'Pending'});clearTimeout(ws.timer);await ws.sync(true);assert.equal(connectionIndicator(ws).color,'blue');assert.equal(ws.mode,'manual');assert.equal(ws.state.operations.length,1);
});
