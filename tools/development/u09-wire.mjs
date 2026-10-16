import fs from 'node:fs/promises';
const shell=`import {mountHeader} from './shared-ui/header.mjs';
import {WorkspaceHost} from './workspace-host.mjs';
import {Workspace} from './store.mjs';
import {BrowserWorkspaceStorage} from './workspace-runtime.mjs';
import {SaveCoordinator} from './save-coordinator.mjs';
import {saveNeedsAttention} from './core.mjs';
import {connectionIndicator} from './sync-control.mjs';
const $=id=>document.getElementById(id);let notification,npc=null,npcError=null,checkpointTimer;
function tell(message){$('shell-status').textContent=message;$('shell-status').hidden=false;clearTimeout(notification);notification=setTimeout(()=>$('shell-status').hidden=true,8000);}
const native=new Workspace();window.romdexApplication={native};
const coordinator=new SaveCoordinator({storage:new BrowserWorkspaceStorage({name:'romdex-coordinator-v1',bucket:'application'}),setting:{enabled:()=>native.automaticSyncEnabled,set:value=>native.setAutomaticSync(value)}});
const host=new WorkspaceHost({frames:{romdex:$('romdex-frame'),npcdex:$('npcdex-frame')},onChange:id=>{header.setWorkspace(id);document.title=id==='npcdex'?'NPCDex · ROMDex':'ROMDex · Pokémon Workspace';mirror();},onReady:(id,view)=>{view.doc.addEventListener('pointerdown',()=>header.close());if(id==='npcdex'){npc=view.win.romdexWorkspace;npcError=null;view.win.addEventListener('npcdex-status',()=>{coordinator.emit();clearTimeout(checkpointTimer);checkpointTimer=setTimeout(()=>coordinator.checkpoint('npcdex').then(()=>coordinator.emit()),800);});}else{const panel=view.doc.createElement('section');panel.id='workspace-save-status';panel.innerHTML='<h3>Workspace Save Status</h3><p data-provider="youtrack"></p><p data-provider="npcdex"></p>';view.doc.getElementById('connection-dialog').append(panel);}coordinator.emit();}});
coordinator.register('youtrack',{status:()=>({label:'YouTrack Tasks',cloud:true,automaticRemote:true,pending:native.state?.operations.length||0,attention:native.state?saveNeedsAttention(native.state,{connected:native.connected,automaticSyncEnabled:native.automaticSyncEnabled||native.manualSyncActive,mode:native.mode,failures:native.failures,missingStates:native.connection?.missingStates},host.views.get('romdex')?.win.romdexWorkspace.editorStatus?.()||{}):false,message:native.message}),save:async()=>{await host.views.get('romdex')?.win.romdexWorkspace.flush?.();await native.sync(true);return {ok:!!native.connected&&!native.state?.blocked&&!native.state?.operations.length&&native.failures===0,message:native.message};},checkpoint:async()=>{await native.lock;await native.request('/api/backup',native.state);}});
coordinator.register('npcdex',{status:()=>npc?npc.status():({label:'NPCDex',cloud:false,automaticRemote:false,localCheckpoint:true,attention:!!npcError,message:npcError||'Loading Local Workspace…'}),save:()=>{if(!npc)throw Error(npcError||'NPCDex Is Still Loading.');return npc.manualSave();},checkpoint:()=>npc?.checkpoint()});
async function connections(){await host.activate('romdex');header.setWorkspace('romdex');host.views.get('romdex').doc.getElementById('connect-open').click();}
const header=mountHeader(document.querySelector('.device-header'),{npcdexAvailable:true,onWorkspace:id=>host.activate(id),onError:error=>tell(error.message)});
function mirror(){
 const state=coordinator.snapshot();$('save-light').className='bulb save-light '+(state.attention?'red':'green');$('save').classList.toggle('dirty',state.attention);$('save').disabled=state.saving||state.settingBusy||!native.state||!npc&&!npcError;$('save').title=state.saving?'Saving Both Workspaces…':state.storageError||Object.values(state.providers).map(p=>p.label+': '+p.message).join(' · ');
 const link=connectionIndicator(native);$('connection-light').className='bulb '+link.color;const label=link.label+' · NPCDex Uses Local Saves';$('connection-label').textContent=label;$('connection-status').title=label;$('connect-open').setAttribute('aria-label','Connection Details · '+label);
 $('auto-sync').setAttribute('aria-checked',String(native.automaticSyncEnabled));$('auto-sync-value').textContent=native.automaticSyncEnabled?'On':'Off';$('auto-sync').disabled=state.saving||state.settingBusy||native.settingBusy||!native.syncControl;$('auto-sync').title='Automatic YouTrack Sync · NPCDex Has Local Recovery Checkpoints; Cloud Delivery Is Not Yet Available';
 const panel=host.views.get('romdex')?.doc.getElementById('workspace-save-status');if(panel){panel.querySelector('[data-provider=youtrack]').textContent='YouTrack Tasks · '+state.providers.youtrack.message;panel.querySelector('[data-provider=npcdex]').textContent='NPCDex · Local Only · '+state.providers.npcdex.message;}
}
native.addEventListener('change',()=>coordinator.emit());coordinator.addEventListener('change',mirror);
$('connect-open').onclick=()=>connections().catch(error=>tell(error.message));
$('auto-sync').onclick=()=>coordinator.setAutomatic(!native.automaticSyncEnabled).catch(error=>tell(error.message));
$('save').onclick=()=>coordinator.save().then(result=>{const failures=result.results?.filter(p=>!p.ok)||[];if(failures.length||result.storageError)tell([...failures.map(p=>p.message),result.storageError].filter(Boolean).join(' · '));else tell('Both Workspaces Saved.');});
$('about-close').onclick=()=>$('about-dialog').close();
window.addEventListener('resize',()=>host.resize());window.romdexShell={host,coordinator,native};
await coordinator.init().catch(error=>{coordinator.storageError=error.message;coordinator.emit();});
try{await native.init();await host.activate('romdex');$('shell-loading').hidden=true;await host.load('npcdex');host.resize();mirror();}catch(error){$('shell-loading').hidden=true;npcError=error.message;mirror();tell(error.message);}
`;
await fs.writeFile('outputs/ROMDex/public/shell.mjs',shell);
let file='outputs/ROMDex/public/app.mjs',s=await fs.readFile(file,'utf8');s=s.replace('const ws=new Workspace();','const ws=window.parent!==window&&window.parent.romdexApplication?.native||new Workspace();');s=s.replace('resize:()=>paneSplit?.apply(),ready:','resize:()=>paneSplit?.apply(),flush:()=>flushEditors(),editorStatus:()=>({...editorDirty}),ready:');await fs.writeFile(file,s);
file='outputs/ROMDex/public/addons/npcdex/index.html';s=await fs.readFile(file,'utf8');s=s.replace('<script src="workspace.js"></script>','<script src="workspace.js"></script><script src="coordination.js"></script>');await fs.writeFile(file,s);
