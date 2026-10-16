import {mountHeader} from './shared-ui/header.mjs';
import {WorkspaceHost} from './workspace-host.mjs';
const $=id=>document.getElementById(id);let notification;
function tell(message){$('shell-status').textContent=message;$('shell-status').hidden=false;clearTimeout(notification);notification=setTimeout(()=>$('shell-status').hidden=true,8000);}
const frames={romdex:$('romdex-frame'),npcdex:$('npcdex-frame')};
const host=new WorkspaceHost({frames,onChange:id=>{header.setWorkspace(id);document.title=id==='npcdex'?'NPCDex · ROMDex':'ROMDex · Pokémon Workspace';mirror();},onReady:(id,view)=>{const watch=new MutationObserver(mirror);watch.observe(view.doc.querySelector('.header,.device-header'),{subtree:true,attributes:true,childList:true,characterData:true});view.doc.addEventListener('pointerdown',()=>header.close());view.win.addEventListener('npcdex-status',mirror);view.win.addEventListener('romdex-status',mirror);}});
async function connections(){await host.activate('romdex');header.setWorkspace('romdex');host.views.get('romdex').doc.getElementById('connect-open').click();}
const header=mountHeader(document.querySelector('.device-header'),{npcdexAvailable:true,onWorkspace:id=>host.activate(id),onError:error=>tell(error.message),onConnection:()=>connections().catch(e=>tell(e.message)),onAbout:()=>{$('about-dialog').showModal();}});
function mirror(){
 const rom=host.views.get('romdex'),npc=host.views.get('npcdex');if(!rom)return;const doc=rom.doc,copy=id=>{const from=doc.getElementById(id),to=$(id);if(from&&to){to.className=from.className;to.title=from.title;}};
 copy('connection-light');$('connection-label').textContent=doc.getElementById('connection-label').textContent;$('connection-status').title=doc.getElementById('connection-status').title;
 $('connect-open').setAttribute('aria-label','Connection Details · '+$('connection-label').textContent);
 const toggle=doc.getElementById('auto-sync');$('auto-sync').disabled=toggle.disabled;$('auto-sync').setAttribute('aria-checked',toggle.getAttribute('aria-checked'));$('auto-sync-value').textContent=doc.getElementById('auto-sync-value').textContent;$('auto-sync').title=toggle.title+' · NPCDex Uses Manual Local Saves Until Cloud Sync Is Implemented';
 const localDirty=npc?.win.romdexWorkspace.dirty===true,romDirty=doc.getElementById('save-light').classList.contains('red');$('save-light').className='bulb save-light '+(localDirty||romDirty?'red':'green');$('save').classList.toggle('dirty',localDirty||romDirty);$('save').disabled=doc.getElementById('save').disabled||npc?.doc.getElementById('save').disabled===true;
 $('save').title=localDirty?'NPCDex Has Unsaved Local Changes · Save Changes Also Synchronizes YouTrack':doc.getElementById('save').title;$('connect-open').title='YouTrack Connection Details · NPCDex Currently Uses Local Saves';
}
$('connect-open').onclick=()=>connections().catch(e=>tell(e.message));
$('auto-sync').onclick=()=>host.views.get('romdex')?.doc.getElementById('auto-sync').click();
$('save').onclick=()=>{const npc=host.views.get('npcdex');host.views.get('romdex')?.doc.getElementById('save').click();if(npc){npc.doc.getElementById('save').click();if(host.current!=='npcdex'&&npc.doc.getElementById('data-dialog').open)tell('NPCDex Needs a Save Destination. Open NPCDex → Inventory Settings → Data.');}mirror();};
$('about-close').onclick=()=>$('about-dialog').close();
window.addEventListener('resize',()=>host.resize());
window.romdexShell={host};
try{await host.activate('romdex');$('shell-loading').hidden=true;mirror();}catch(error){$('shell-loading').hidden=true;tell(error.message);}
