const {contextBridge,ipcRenderer}=require('electron');
// Only the shell gets native capabilities. Trusted child views use its narrow application facade.
if(process.isMainFrame){
 contextBridge.exposeInMainWorld('romdexDesktop',Object.freeze({
  call:(method,args=[])=>ipcRenderer.invoke('romdex:call',method,args),
  storage:(mode,key,value)=>ipcRenderer.invoke('romdex:storage',mode,key,value),
  chooseAttachments:id=>ipcRenderer.invoke('romdex:attach',id),
  chooseExport:()=>ipcRenderer.invoke('romdex:choose-export'),
  exportStatus:()=>ipcRenderer.invoke('romdex:export-status'),
  writeExport:snapshot=>ipcRenderer.invoke('romdex:write-export',snapshot),
  onEvent:callback=>{const handler=(_,event)=>callback(event);ipcRenderer.on('romdex:event',handler);return()=>ipcRenderer.removeListener('romdex:event',handler);}
 }));
}
