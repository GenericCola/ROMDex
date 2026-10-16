import {WorkspaceEngine} from './workspace-engine.mjs';
import {FileStorage,uploadRequest} from './attachment-files.mjs';
import {BrowserWorkspaceStorage,WorkspaceClock,preferenceCache} from './workspace-runtime.mjs';
export async function request(path,body){const response=await fetch(path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(180000)});const data=await response.json();if(!response.ok){const error=new Error(data.error||'Request failed.');error.syncStatus=data;throw error;}return data;}
export class Workspace extends WorkspaceEngine{
 constructor({transport=request,storage=new BrowserWorkspaceStorage(),files=new FileStorage(),upload=uploadRequest,...options}={}){if(!storage.load)storage={...storage,load:async()=>undefined};super({transport,storage,files,upload,preferenceCache,...options});this.clock=new WorkspaceClock(this);}
 async init(){await super.init();this.clock.start();}
 dispose(){this.clock.stop();}
}
