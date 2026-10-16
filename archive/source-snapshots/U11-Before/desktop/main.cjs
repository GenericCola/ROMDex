const {app,BrowserWindow,protocol,ipcMain,utilityProcess,dialog,shell,session}=require('electron');
const path=require('node:path'),fs=require('node:fs/promises'),crypto=require('node:crypto');
protocol.registerSchemesAsPrivileged([{scheme:'romdex-app',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
app.setName('ROMDex');app.setAppUserModelId('ROMDexDesktop');
const qa=process.env.ROMDEX_QA==='1';
const base=qa&&process.env.ROMDEX_DESKTOP_PROFILE?path.resolve(process.env.ROMDEX_DESKTOP_PROFILE):path.join(process.env.LOCALAPPDATA||app.getPath('appData'),'ROMDexDesktopData','preview-u10');
app.setPath('userData',path.join(base,'session'));app.setPath('sessionData',path.join(base,'session'));
let win,worker,quitting=false,workerReady=false;let sequence=0;const pending=new Map();
function rpc(command,args=[]){if(!workerReady)return Promise.reject(Error('Desktop Service Is Unavailable. Accepted Work Is Kept Locally.'));return new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('The Desktop Service Did Not Respond. Review Before Retrying.'));},180000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,command,args});});}
function rejectPending(message){workerReady=false;for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message));}pending.clear();}
async function main(){
 const {assetPath,trustedURL,contentPolicy,externalURL,validateCall,STORES,ORIGIN}=await import('./policy.mjs');
 const {validateTicket,validateNativeSelection}=await import('./native-attachments.mjs');
 await fs.mkdir(base,{recursive:true});
 // U10 uses a separate preview profile. No legacy credential/database adoption occurs here.
 const marker=path.join(base,'desktop-preview.json');try{const m=JSON.parse(await fs.readFile(marker,'utf8'));if(m.version!==1||m.application!=='ROMDexDesktopPreview')throw Error('Unknown Desktop Profile.');}catch(error){if(error.code!=='ENOENT')throw error;await fs.writeFile(marker,JSON.stringify({version:1,application:'ROMDexDesktopPreview',migrationPending:true}));}
 const ready=new Promise((resolve,reject)=>{
  worker=utilityProcess.fork(path.join(__dirname,'service.mjs'),[],{env:{...process.env,ROMDEX_DATA_DIR:path.join(base,'service'),ROMDEX_DESKTOP:'1',YOUTRACK_TOKEN:''},stdio:'pipe',serviceName:'ROMDex Save and Sync'});
  worker.stdout?.resume();worker.stderr?.resume();
  worker.on('message',message=>{if(message.ready){workerReady=true;resolve(message);}else if(message.reply){const p=pending.get(message.reply);if(p){clearTimeout(p.timer);pending.delete(message.reply);message.error?p.reject(Object.assign(Error(message.error),{syncStatus:message.syncStatus})):p.resolve(message.value);}}else if(win&&!win.isDestroyed())win.webContents.send('romdex:event',message);});
  worker.once('exit',code=>{rejectPending('Desktop Service Stopped. Local Work Has Been Preserved.');reject(Error('Desktop Service Exited ('+code+').'));if(win&&!quitting)win.webContents.send('romdex:event',{type:'service-error',detail:'Desktop Service Stopped. Close and Reopen the Preview.'});});
 });
 const readyInfo=await ready;
 const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
 const appSession=session.fromPartition('persist:romdex-desktop-v1');
 await appSession.protocol.handle('romdex-app',async request=>{try{
  if(!trustedURL(request.url)||request.method!=='GET')return new Response('Not Allowed',{status:403});
  const url=new URL(request.url);if(url.pathname.startsWith('/api/')){const response=await rpc('read',[url.pathname+url.search]);return new Response(new Uint8Array(response.bytes),{status:response.status,headers:response.headers});}
  const target=assetPath(path.join(__dirname,'../public'),request.url),data=await fs.readFile(target);
  return new Response(data,{headers:{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Content-Security-Policy':contentPolicy(request.url),'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'}});
 }catch{return new Response('Application Resource Unavailable',{status:404});}});
 win=new BrowserWindow({title:'ROMDex — Desktop Preview · Migration Pending',width:1440,height:960,minWidth:840,minHeight:600,show:false,backgroundColor:'#a92032',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,sandbox:true,nodeIntegration:false,nodeIntegrationInSubFrames:false,webSecurity:true,partition:'persist:romdex-desktop-v1'}});
 win.removeMenu();
 function caller(event){if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!trustedURL(event.senderFrame.url)||new URL(event.senderFrame.url).pathname!=='/')throw Error('Untrusted Desktop Caller.');}
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
 contents.setWindowOpenHandler(({url})=>{try{shell.openExternal(externalURL(url)).catch(()=>{});}catch{}return {action:'deny'};});
 contents.on('will-navigate',(event,url)=>{event.preventDefault();try{shell.openExternal(externalURL(url)).catch(()=>{});}catch{}});
 contents.on('will-frame-navigate',(event,details)=>{const url=typeof details==='string'?details:details?.url||event.url;if(!trustedURL(url))event.preventDefault();});
 app.on('web-contents-created',(_event,wc)=>{wc.on('will-attach-webview',event=>event.preventDefault());});
 contents.on('will-prevent-unload',event=>{if(quitting)event.preventDefault();});
 win.on('close',event=>{if(!quitting){event.preventDefault();quitting=true;(async()=>{try{const results=await contents.executeJavaScript("(async()=>{await window.romdexShell?.host.views.get('romdex')?.win.romdexWorkspace.flush?.();return window.romdexShell?.coordinator.checkpoint();})()",true);if(results?.some(x=>!x.ok))throw Error(results.filter(x=>!x.ok).map(x=>x.message).join(' · '));await rpc('checkpoint');app.quit();}catch(error){quitting=false;dialog.showErrorBox('Local Save Needs Review',error.message);}})();}});
 app.on('before-quit',()=>{quitting=true;});
 app.on('will-quit',()=>{worker?.kill();rejectPending('Application Closed.');});
 await win.loadURL(ORIGIN+'/');win.setTitle('ROMDex — Desktop Preview · Migration Pending');win.show();
 if(qa&&process.env.ROMDEX_QA_REPORT)await fs.writeFile(process.env.ROMDEX_QA_REPORT,JSON.stringify({versions:process.versions,utilityVersions:readyInfo.versions,profile:base,pid:process.pid,utilityPid:worker.pid,fixture:readyInfo.fixture}));
}
app.whenReady().then(main).catch(async error=>{if(qa&&process.env.ROMDEX_QA_REPORT)await fs.writeFile(process.env.ROMDEX_QA_REPORT,JSON.stringify({error:error.message}));else dialog.showErrorBox('ROMDex Could Not Start',error.message);quitting=true;app.quit();});
app.on('window-all-closed',()=>app.quit());
