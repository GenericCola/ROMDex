const {app,BrowserWindow,protocol,ipcMain,utilityProcess,dialog,shell,session,Tray,Menu,powerMonitor,safeStorage}=require('electron');
const path=require('node:path'),fs=require('node:fs/promises');
protocol.registerSchemesAsPrivileged([{scheme:'romdex-app',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
const {IDENTITY,applicationFolder,profilePaths}=require('./install-layout.cjs');
app.setName(IDENTITY.name);app.setAppUserModelId(IDENTITY.appUserModelId);
const qa=process.env.ROMDEX_QA==='1',verify=qa||process.env.ROMDEX_VERIFY==='1';
const virtualized=/[\\/]Packages[\\/]sandbox\.[^\\/]+[\\/]AC(?:[\\/]|$)/i.test(process.env.LOCALAPPDATA||'');
const accountData=virtualized?path.join(process.env.USERPROFILE,'AppData','Local'):(process.env.LOCALAPPDATA||app.getPath('appData'));
const layout=qa?null:profilePaths(applicationFolder(process.execPath,app.getVersion()));
const base=qa&&process.env.ROMDEX_DESKTOP_PROFILE?path.resolve(process.env.ROMDEX_DESKTOP_PROFILE):layout?.base||path.join(accountData,'ROMDexDesktopData','qa-preview');
const sessionBase=qa?path.join(base,'session'):layout.session;
app.setPath('userData',sessionBase);app.setPath('sessionData',sessionBase);
let updater,updateState;
let win,service,tray,lease,lifecycle,rendererRecovery,quitting=false,shellReady=false,firstClose=false;
let trayState={active:'romdex',enabled:true,ready:false,busy:false};
let rdxOpen;
const pendingRdxLaunches=[[process.argv,process.cwd(),app.isPackaged?1:2]];
const rpc=(command,args=[])=>service?service.call(command,args):Promise.reject(Error('Desktop Service Is Starting.'));
const hasInstance=app.requestSingleInstanceLock();
let sessionMigrationError;
if(hasInstance&&!qa){try{require('./session-migration.cjs').prepareSessionKey({sourceProfile:path.join(accountData,'ROMDexDesktopData/thegobindsingh-PMON'),sourceSession:path.join(accountData,'ROMDexDesktopData/sessions/thegobindsingh-PMON'),destinationProfile:base,destinationSession:sessionBase});}catch(error){sessionMigrationError=error;}}
function showWindow(){if(!win||win.isDestroyed())return;if(win.isMinimized())win.restore();win.show();win.focus();if(rendererRecovery?.failed)rendererRecovery.retry().catch(()=>{});}
app.on('second-instance',(_event,argv,cwd)=>{if(rdxOpen)rdxOpen.enqueue(argv,cwd);else pendingRdxLaunches.push([argv,cwd,1]);showWindow();});app.on('activate',showWindow);
async function main(){
 if(sessionMigrationError)throw sessionMigrationError;
 const {assetPath,trustedURL,contentPolicy,externalURL,validateCall,STORES,ORIGIN}=await import('./policy.mjs');
 const {validateTicket,validateNativeSelection}=await import('./native-attachments.mjs');
 const {ProfileLease,QuitController,RendererRecovery,trayTemplate}=await import('./lifecycle.mjs');
 const {ServiceHost}=await import('./service-host.mjs');
 const {electronProtector}=await import('./credentials.mjs');const credentialProtector=electronProtector(safeStorage);
 if(!qa){const {ensureApplicationProfile}=await import('./profile-relocation.mjs');await ensureApplicationProfile({app,dialog,safeStorage,destination:base,accountData});}
 await fs.mkdir(base,{recursive:true});
 lease=new ProfileLease(base);lease.acquire();
 // QA remains isolated; normal launches require the reviewed stable profile.
 if(qa){const marker=path.join(base,'desktop-preview.json');try{const m=JSON.parse(await fs.readFile(marker,'utf8'));if(m.version!==1||m.application!=='ROMDexDesktopPreview')throw Error('Unknown Desktop Profile.');}catch(error){if(error.code!=='ENOENT')throw error;await fs.writeFile(marker,JSON.stringify({version:1,application:'ROMDexDesktopPreview',migrationPending:true}));}}
 service=new ServiceHost({fork:()=>utilityProcess.fork(path.join(__dirname,'service.mjs'),[],{env:{...process.env,ROMDEX_DATA_DIR:path.join(base,'service'),ROMDEX_DESKTOP:'1',YOUTRACK_TOKEN:''},stdio:'pipe',serviceName:'ROMDex Save and Sync'}),onOwner:pid=>lease.utility(pid),onCredential:credentialProtector,onEvent:message=>{if(win&&!win.isDestroyed())win.webContents.send('romdex:event',message);if(message.type==='service-error'){trayState.ready=false;rebuildTray();}}});
 const readyInfo=await service.start();
 const contentAsset=readyInfo.contentProvider?await (await import('../content/desktop-assets.mjs')).createContentAssets({publicDir:path.join(__dirname,'../public'),view:()=>rpc('npcdexView',[])}):null;
 const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
 const appSession=session.fromPartition('persist:romdex-desktop-v1');
 await appSession.protocol.handle('romdex-app',async request=>{try{
  if(!trustedURL(request.url)||request.method!=='GET')return new Response('Not Allowed',{status:403});
  const url=new URL(request.url);if(url.pathname.startsWith('/api/')){const response=await rpc('read',[url.pathname+url.search]);return new Response(new Uint8Array(response.bytes),{status:response.status,headers:response.headers});}
  const content=await contentAsset?.(url.pathname);if(content)return new Response(new Uint8Array(content.bytes),{headers:{'Content-Type':content.type,'Content-Security-Policy':contentPolicy(request.url),'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}});
  const target=assetPath(path.join(__dirname,'../public'),request.url),data=await fs.readFile(target);
  return new Response(data,{headers:{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Content-Security-Policy':contentPolicy(request.url),'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'}});
 }catch{return new Response('Application Resource Unavailable',{status:404});}});
 win=new BrowserWindow({title:qa?'ROMDex — Verification Preview':'ROMDex',icon:path.join(__dirname,'app.ico'),width:1440,height:960,minWidth:840,minHeight:600,show:false,backgroundColor:'#a92032',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,sandbox:true,nodeIntegration:false,nodeIntegrationInSubFrames:false,webSecurity:true,backgroundThrottling:false,partition:'persist:romdex-desktop-v1'}});
 win.removeMenu();
 function caller(event){if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!trustedURL(event.senderFrame.url)||new URL(event.senderFrame.url).pathname!=='/')throw Error('Untrusted Desktop Caller.');}
 const {RdxOpenBroker,routeRdxOpen}=await import('./rdx-open.mjs');
 rdxOpen=new RdxOpenBroker({rpc,changed:()=>{if(win&&!win.isDestroyed())win.webContents.send('romdex:event',{type:'rdx-open'});}});
 for(const args of pendingRdxLaunches.splice(0))rdxOpen.enqueue(...args);
 ipcMain.handle('romdex:rdx-open',(event,action,value)=>{caller(event);return routeRdxOpen(rdxOpen,action,value,!!(lifecycle?.busy||quitting));});
 ipcMain.handle('romdex:rom-import',async(event,action)=>{caller(event);if(lifecycle?.busy||quitting)throw Error('Wait for Application Lifecycle Work to Finish.');if(action==='choose'){const selected=await dialog.showOpenDialog(win,{title:'Open Read-Only ROM',properties:['openFile'],filters:[{name:'Nintendo DS ROM',extensions:['nds']}]});return selected.canceled?null:rpc('romImportSource',[selected.filePaths[0]]);}if(action==='export'){const preparation=await rpc('romImport',['status']),{mapRdxFilename}=await import('../public/area-presentation.mjs');const selected=await dialog.showSaveDialog(win,{title:'Export Prepared Map RDX',defaultPath:mapRdxFilename(preparation.prepared?.name),filters:[{name:'ROMDex Map',extensions:['rdx']}]});if(selected.canceled)return null;if(path.extname(selected.filePath).toLowerCase()!=='.rdx')throw Error('Export Maps as .rdx Files.');if(path.resolve(selected.filePath).toLowerCase().startsWith(path.resolve(base).toLowerCase()+path.sep))throw Error('Export Outside the Managed Application Data Folder.');const bytes=Buffer.from(await rpc('romImportExport'));const {replaceFile}=await import('../durable-json-storage.mjs');const temp=selected.filePath+'.'+require('node:crypto').randomUUID()+'.tmp';let handle;try{handle=await fs.open(temp,'wx');await handle.writeFile(bytes);await handle.sync();await handle.close();handle=null;await replaceFile(temp,selected.filePath);}finally{await handle?.close();await fs.unlink(temp).catch(()=>{});}return {saved:true,bytes:bytes.length};}throw Error('Unsupported ROM Import Picker.');});
 ipcMain.handle('romdex:profile-info',event=>{caller(event);return {migrated:!qa,version:app.getVersion()};});
 ipcMain.handle('romdex:tray-state',(event,state)=>{caller(event);if(!state||!['romdex','npcdex','rom-import'].includes(state.active)||['enabled','ready','busy'].some(k=>typeof state[k]!=='boolean'))throw Error('Invalid Tray State.');trayState={active:state.active,enabled:state.enabled,ready:state.ready,busy:state.busy};shellReady=true;if(state.ready)rendererRecovery?.ready();rebuildTray();});
 function rebuildTray(){if(tray&&!tray.isDestroyed())tray.setContextMenu(Menu.buildFromTemplate(trayTemplate({...trayState,busy:trayState.busy||!!lifecycle?.busy,quitBusy:!!lifecycle?.busy,updates:updateState,run:runCommand,quit:()=>lifecycle.request()})));}
 async function runCommand(command,value){
  if(command==='show'){showWindow();return;}
  if(command==='updates'){if(updater)await updater.open();else await dialog.showMessageBox(win,{type:'info',title:'Application Updates Unavailable',message:updateState?.message||'Update Controls Are Still Starting.',detail:'Your Workspaces and Data Synchronization Continue Normally.'});return;}
  if(command==='about'){showWindow();await dialog.showMessageBox(win,{type:'info',title:'About ROMDex',message:'ROMDex '+app.getVersion(),detail:'NPCDex Add-On\nYouTrack Tasks: Two-Way Sync\nNPCDex: Local Checkpoints and Private Cloud Sync When Configured\n'+(qa?'Isolated Verification Profile':'Saves Are Stored in the Application’s Data Folder')});return;}
  if(['workspace','connections'].includes(command))showWindow();
  try{if(!shellReady)throw Error('The Workspace Is Still Opening.');const result=await win.webContents.executeJavaScript('window.romdexShell.desktopCommand('+JSON.stringify(command)+','+JSON.stringify(value??null)+')',true);if(result?.review)showWindow();}catch(error){showWindow();await dialog.showMessageBox(win,{type:'error',title:'ROMDex Needs Review',message:error.message});}
 }
 tray=new Tray(path.join(__dirname,'app.ico'));tray.setToolTip('ROMDex');tray.on('click',showWindow);rebuildTray();
 const noticeFile=path.join(base,'tray-notice.json');try{firstClose=!!JSON.parse(await fs.readFile(noticeFile,'utf8')).shown;}catch{}
 lifecycle=new QuitController({pause:()=>rpc('pause-network'),resume:()=>rpc('resume'),checkpoint:async()=>{if(!shellReady&&!rendererRecovery?.failed)throw Error('Wait Until the Workspaces Finish Opening Before Quitting.');if(!service.ready)await service.start(true);if(!rendererRecovery?.failed){const results=await win.webContents.executeJavaScript('window.romdexShell.desktopCheckpoint()',true);if(results?.some(x=>!x.ok))throw Error(results.filter(x=>!x.ok).map(x=>x.message).join(' · '));}await rpc('checkpoint');await exportConfig.writes;await Promise.all([...exportWrites.values()].map(x=>x.writes));},shutdown:()=>service.shutdown(),exit:()=>{quitting=true;app.quit();},onError:async error=>{await win.webContents.executeJavaScript('window.romdexShell?.desktopResume()',true).catch(()=>{});showWindow();await dialog.showMessageBox(win,{type:'error',title:'Local Save Needs Review',message:error.message});},onChange:()=>{rebuildTray();if(win&&!win.isDestroyed())win.webContents.send('romdex:event',{type:'lifecycle',busy:!!lifecycle?.busy});}});
 rebuildTray();
 ipcMain.handle('romdex:call',(event,method,args)=>{caller(event);validateCall(method,args);return rpc(method,args);});
 ipcMain.handle('romdex:storage',(event,mode,key,value)=>{caller(event);if(!STORES.has(key)||!['load','save'].includes(mode)||JSON.stringify(value??null).length>16*1024*1024)throw Error('Invalid Storage Request.');return rpc('storage',[mode,key,value]);});
 ipcMain.handle('romdex:attach',async(event,id)=>{caller(event);if(typeof id!=='string'||!/^((PMON-\d+)|(local-[-\w]+))$/.test(id))throw Error('Invalid Ticket.');const selection=await dialog.showOpenDialog(win,{title:'Attach Files to '+id,properties:['openFile','multiSelections']});if(selection.canceled)return [];if(selection.filePaths.length>10)throw Error('Choose Up to 10 Files.');return rpc('attach',[id,selection.filePaths]);});
 ipcMain.handle('romdex:drop-files',(event,id,selection)=>{caller(event);validateTicket(id);validateNativeSelection(selection,{dropped:true});return rpc('attach',[id,selection,{dropped:true}]);});
 const {DurableJSONStorage}=await import('../durable-json-storage.mjs'),exportConfig=new DurableJSONStorage(path.join(base,'export-destination.json'));
 let exportDirectory=(await exportConfig.load())?.directory||path.join(base,'exports');
 const exportStatus=()=>({name:path.basename(exportDirectory),desktop:true});
 ipcMain.handle('romdex:export-status',event=>{caller(event);return exportStatus();});
 ipcMain.handle('romdex:choose-export',async event=>{caller(event);const result=await dialog.showOpenDialog(win,{title:'Choose NPCDex Export Folder',properties:['openDirectory','createDirectory']});if(result.canceled)return null;exportDirectory=result.filePaths[0];await exportConfig.save({directory:exportDirectory});return exportStatus();});
 const exportWrites=new Map();
 ipcMain.handle('romdex:write-export',async(event,snapshot)=>{caller(event);if(snapshot?.version!==2||!Array.isArray(snapshot.towns)||JSON.stringify(snapshot).length>16*1024*1024)throw Error('Invalid NPCDex Export.');await fs.mkdir(exportDirectory,{recursive:true});const target=path.join(exportDirectory,'npcdex-agent-export.json');if(!exportWrites.has(target))exportWrites.set(target,new DurableJSONStorage(target));await exportWrites.get(target).save(snapshot);return true;});
 appSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 appSession.setPermissionCheckHandler(()=>false);
 const contents=win.webContents;
 rendererRecovery=new RendererRecovery({reload:()=>{if(!quitting&&!lifecycle.busy&&!win.isDestroyed())contents.reload();},onUnavailable:()=>tray.displayBalloon({title:'ROMDex Workspace Needs Review',content:'The save service is still separate from the window. Click the ROMDex tray icon to retry opening the workspace.',iconType:'warning'})});
 contents.on('render-process-gone',()=>{if(quitting)return;shellReady=false;trayState.ready=false;rebuildTray();rendererRecovery.interrupted().catch(()=>{});});
 contents.setWindowOpenHandler(({url})=>{try{shell.openExternal(externalURL(url)).catch(()=>{});}catch{}return {action:'deny'};});
 contents.on('will-navigate',(event,url)=>{event.preventDefault();try{shell.openExternal(externalURL(url)).catch(()=>{});}catch{}});
 contents.on('will-frame-navigate',(event,details)=>{const url=typeof details==='string'?details:details?.url||event.url;if(!trustedURL(url))event.preventDefault();});
 app.on('web-contents-created',(_event,wc)=>{wc.on('will-attach-webview',event=>event.preventDefault());});
 contents.on('will-prevent-unload',event=>{if(quitting)event.preventDefault();});
 win.on('close',event=>{if(quitting)return;event.preventDefault();if(!tray){showWindow();return;}win.hide();if(!firstClose){firstClose=true;tray.displayBalloon({title:'ROMDex Is Still Running',content:'Sync follows your Auto-Sync setting. Click the ROMDex icon to return, or right-click it and choose Quit ROMDex to exit.',iconType:'info'});fs.writeFile(noticeFile,JSON.stringify({shown:true})).catch(()=>{});}if(shellReady)contents.executeJavaScript('window.romdexShell.desktopCheckpoint(false)',true).catch(()=>{});});
 app.on('before-quit',event=>{if(!quitting){event.preventDefault();lifecycle.request();}});
 app.on('will-quit',()=>{tray?.destroy();if(!service.worker||service.worker.romdexExited)lease?.release();});
 powerMonitor.on('suspend',()=>{rpc('suspend').catch(()=>{});});
 powerMonitor.on('resume',()=>{rpc('resume').catch(()=>{});});
 await win.loadURL(ORIGIN+'/');win.setTitle(qa?'ROMDex — Verification Preview':'ROMDex');win.show();
 const {setupUpdater}=await import('./updater-window.mjs');
 const updateFixtureConfig=qa?await fs.readFile(path.join(base,'updates/test-update-config.json'),'utf8').then(JSON.parse).catch(()=>undefined):undefined;
 try{updater=await setupUpdater({electron:{app,BrowserWindow,ipcMain,dialog,safeStorage,shell},profile:base,root:applicationFolder(process.execPath,app.getVersion()),mainWindow:win,version:app.getVersion(),upgradeCode:IDENTITY.upgradeCode,shortName:IDENTITY.shortName,service,qa,config:updateFixtureConfig,checkpoint:()=>lifecycle.checkpoint(),resume:async()=>{await rpc('resume').catch(()=>{});await win.webContents.executeJavaScript('window.romdexShell?.desktopResume()',true).catch(()=>{});},quit:()=>lifecycle.request(),changed:value=>{if(quitting)return;updateState=value;if(value.notice)tray.displayBalloon({title:'ROMDex Update Available',content:value.notice,iconType:'info'});rebuildTray();}});}catch(error){updateState={phase:'error',message:error.message};rebuildTray();}
 if(verify&&process.env.ROMDEX_QA_REPORT){global.romdexQA={get updater(){return updater;},get win(){return win;},get service(){return service;},get tray(){return tray;},runCommand,quit:()=>lifecycle.request(),verifyConnection:()=>rpc('verify-connection'),releaseDeliverySettings:()=>rpc('release-delivery-settings'),trayTemplate:()=>trayTemplate({...trayState,run:runCommand,quit:()=>lifecycle.request()}),power:event=>powerMonitor.emit(event),stubMessages(){dialog.showMessageBox=async(_window,options)=>{this.lastMessage=options;return {response:0};};},forceExit(){service.worker?.kill();app.exit(1);},secondLaunch(){win.hide();return new Promise((resolve,reject)=>{const child=require('node:child_process').spawn(process.execPath,process.argv.slice(1).filter(x=>!x.startsWith('--inspect')&&!x.startsWith('--remote-debugging')),{env:process.env,windowsHide:true,stdio:'ignore'}),timer=setTimeout(()=>{child.kill();reject(Error('Second Instance Did Not Exit'));},10000);child.on('exit',code=>{clearTimeout(timer);setTimeout(()=>resolve({code,visible:win.isVisible(),utility:service.worker.pid}),100);});child.on('error',reject);});}};await fs.writeFile(process.env.ROMDEX_QA_REPORT,JSON.stringify({versions:process.versions,utilityVersions:readyInfo.versions,profile:base,pid:process.pid,utilityPid:service.worker.pid,fixture:readyInfo.fixture,contentProvider:readyInfo.contentProvider}));}
}
if(!hasInstance)app.quit();else app.whenReady().then(main).catch(async error=>{if(verify&&process.env.ROMDEX_QA_REPORT)await fs.writeFile(process.env.ROMDEX_QA_REPORT,JSON.stringify({error:error.message}));else dialog.showErrorBox('ROMDex Could Not Start',error.message);quitting=true;await service?.terminate().catch(()=>{});if(!service?.worker||service.worker.romdexExited)lease?.release();app.quit();});
app.on('window-all-closed',()=>{if(quitting)app.quit();});
