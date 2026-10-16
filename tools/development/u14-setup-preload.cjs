const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('romdexCloudSetup',{info:()=>ipcRenderer.invoke('u14:info'),openTokenSettings:()=>ipcRenderer.invoke('u14:token-page'),save:token=>ipcRenderer.invoke('u14:save',token)});
