const {contextBridge,ipcRenderer,webUtils}=require('electron');
// Only the shell gets native capabilities. Trusted child views use its narrow application facade.
if(process.isMainFrame){
 contextBridge.exposeInMainWorld('romdexDesktop',Object.freeze({
  call:(method,args=[])=>ipcRenderer.invoke('romdex:call',method,args),
  trayState:state=>ipcRenderer.invoke('romdex:tray-state',state),
  profileInfo:()=>ipcRenderer.invoke('romdex:profile-info'),
  rdxOpen:(action,value)=>ipcRenderer.invoke('romdex:rdx-open',action,value),
  romImport:action=>ipcRenderer.invoke('romdex:rom-import',action),
  storage:(mode,key,value)=>ipcRenderer.invoke('romdex:storage',mode,key,value),
  chooseAttachments:id=>ipcRenderer.invoke('romdex:attach',id),
  dropAttachments:(id,files)=>{
   if(!Array.isArray(files)||!files.length||files.length>10)return Promise.reject(Error('Drop 1–10 Files.'));
   const selection=files.map(file=>{const nativePath=webUtils.getPathForFile(file);if(!nativePath)throw Error('Drop Files Directly from File Explorer or the Desktop.');return {path:nativePath,name:file.name,size:file.size,lastModified:file.lastModified};});
   return ipcRenderer.invoke('romdex:drop-files',id,selection);
  },
  chooseExport:()=>ipcRenderer.invoke('romdex:choose-export'),
  exportStatus:()=>ipcRenderer.invoke('romdex:export-status'),
  writeExport:snapshot=>ipcRenderer.invoke('romdex:write-export',snapshot),
  onEvent:callback=>{const handler=(_,event)=>callback(event);ipcRenderer.on('romdex:event',handler);return()=>ipcRenderer.removeListener('romdex:event',handler);}
 }));
}
