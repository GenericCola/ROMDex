import fs from 'node:fs/promises';
const base='outputs/ROMDex/';
async function edit(file,replacements){let s=await fs.readFile(base+file,'utf8');for(const [from,to]of replacements){if(!s.includes(from))throw Error('Missing '+file+': '+from.slice(0,90));s=s.replace(from,to);}await fs.writeFile(base+file,s);}
await edit('public/shell.mjs',[
 ["import {Workspace} from './store.mjs';","import {Workspace} from './store.mjs';\nimport {DesktopWorkspace} from './desktop-workspace.mjs';"],
 ['const native=new Workspace();','const desktop=window.romdexDesktop;const native=desktop?new DesktopWorkspace(desktop):new Workspace();'],
 ["storage:new BrowserWorkspaceStorage({name:'romdex-coordinator-v1',bucket:'application'})","storage:desktop?{load:()=>desktop.storage('load','coordinator'),save:value=>desktop.storage('save','coordinator',value)}:new BrowserWorkspaceStorage({name:'romdex-coordinator-v1',bucket:'application'})"],
 ["await native.lock;await native.request('/api/backup',native.state);","if(desktop)await desktop.call('checkpoint',[]);else{await native.lock;await native.request('/api/backup',native.state);}"],
 ["native.addEventListener('change',()=>coordinator.emit());","native.addEventListener('change',()=>coordinator.emit());native.addEventListener('service-error',e=>{nativeError=e.detail;native.connected=false;native.serviceAvailable=false;native.youtrackAvailable=false;tell(e.detail);coordinator.emit();});"],
 ["finally{$('shell-loading').hidden=true;mirror();}","finally{$('shell-loading').hidden=true;mirror();if(desktop)tell('Desktop Preview · Current Browser Saves and Connection Will Be Migrated in U12.');}"]
]);
await edit('public/app.mjs',[
 ["const data=await ws.comments(id);if(!data)return;await ws.transaction(s=>{const item=s.remote.find(x=>x.id===id);if(item){item.comments=data.comments;item.commentCount=data.comments.length;}});","await ws.loadComments(id);"],
 ["const data=await request('/api/attachment-review?opId='+encodeURIComponent(b.dataset.reviewUpload));if(data.completed){await ws.transaction(s=>s.blocked=null);await ws.sync(true);","const data=await ws.reviewAttachment(b.dataset.reviewUpload);if(data.completed){await ws.retryBlocked();"],
 ["const result=await request('/api/complexity-setup',{});ws.applyStatus(result);ws.emit();","await ws.setupComplexity();"],
 ["if(block.error){await ws.transaction(s=>s.blocked=null);ws.mode='syncing';await ws.sync(true);}","if(block.error){await ws.retryBlocked();}"],
 ["await request('/api/acknowledge',{opId:block.opId,action,issueId:$('uncertain-id')?.value.trim(),manual:true});await ws.transaction(s=>s.blocked=null);ws.mode='syncing';await ws.sync(true);","await ws.acknowledge(block.opId,action,$('uncertain-id')?.value.trim());"]
]);
await edit('public/item-editor-view.mjs',[["const data=await this.ws.request('/api/edit-options'+(item.id.startsWith('local-')?'':'?id='+encodeURIComponent(item.id)));this.ws.applyStatus(data);await this.ws.transaction(state=>{state.editOptions=data.options;const at=state.remote.findIndex(x=>x.id===data.item?.id);if(at>=0&&(!state.remote[at].updated||data.item.updated>=state.remote[at].updated))state.remote[at]={...state.remote[at],...data.item,comments:data.item.comments??state.remote[at].comments};});","const data=await this.ws.loadEditOptions(item.id);"]]);
await edit('public/attachment-view.mjs',[
 ["$('attachment-input').onchange=()=>this.attach();","$('attachment-input').onchange=()=>this.attach();\n  if(ws.chooseAttachments)$('attachment-input').addEventListener('click',async event=>{event.preventDefault();if(this.busy||!this.item())return;this.busy=true;this.render();try{await ws.chooseAttachments(this.id);$('attachment-error').textContent='Files Kept Locally; Upload Follows the Auto-Sync Setting.';}catch(error){$('attachment-error').textContent=error.message;}finally{this.busy=false;this.render();}});"],
 ["const result=await this.ws.request('/api/attachments?id='+encodeURIComponent(id)+'&manual=true');this.ws.applyStatus(result);await this.ws.transaction(s=>{const item=s.remote.find(x=>x.id===id);if(item)item.attachments=result.attachments;});","await this.ws.loadAttachments(id);"]
]);
await edit('desktop/policy.mjs',[["'init','edit'","'init','checkpoint','edit'"],["'paneSplit','detailsSize'","'paneSplit','paneLayout','detailsSize'"]]);
// Native storage/export is selected only in the desktop host. The browser implementation stays intact.
await edit('public/addons/npcdex/workspace.js',[
 ["function readDB(){return new Promise","const nativeDesktop=window.parent?.romdexDesktop;\nfunction readDB(){if(nativeDesktop)return nativeDesktop.storage('load','npcdex-current');return new Promise"],
 ["function writeDB(snapshot){return new Promise","function writeDB(snapshot){if(nativeDesktop)return nativeDesktop.storage('save','npcdex-current',snapshot);return new Promise"],
 ["function readExportDirectory(){return new Promise","function readExportDirectory(){if(nativeDesktop)return nativeDesktop.exportStatus();return new Promise"],
 ["function rememberExportDirectory(handle){return new Promise","function rememberExportDirectory(handle){if(nativeDesktop)return Promise.resolve();return new Promise"],
 ["async function chooseExportDirectory(){if(typeof window.showDirectoryPicker","async function chooseExportDirectory(){if(nativeDesktop){const chosen=await nativeDesktop.chooseExport();if(!chosen)throw Object.assign(Error('Folder Selection Canceled.'),{name:'AbortError'});exportDirectory=chosen;showExportDestination();return chosen;}if(typeof window.showDirectoryPicker"],
 ["async function writeExportFile(directory,snapshot){const file=","async function writeExportFile(directory,snapshot){if(nativeDesktop)return nativeDesktop.writeExport(snapshot);const file="]
]);
await edit('public/addons/npcdex/coordination.js',[["const access=(mode,key,value)=>new Promise","const access=(mode,key,value)=>nativeDesktop?nativeDesktop.storage(mode==='readonly'?'load':'save','npcdex-'+key,value??null):new Promise"]]);
const pkg=JSON.parse(await fs.readFile(base+'package.json','utf8'));pkg.main='desktop/main.cjs';pkg.scripts.desktop='electron .';pkg.desktopRuntime={electron:'44.7.2',platform:'win32',arch:'x64',manifest:'desktop/runtime-lock.json'};await fs.writeFile(base+'package.json',JSON.stringify(pkg,null,2)+'\n');
console.log('Desktop facade wired; browser adapters retained.');
