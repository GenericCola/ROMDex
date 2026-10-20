import {testingItems} from './testing-state.mjs';
import {materialize} from './core.mjs';
import {METHODS} from './desktop-methods.mjs';
export class DesktopWorkspace extends EventTarget{
 constructor(bridge){super();this.bridge=bridge;this.state=null;this.inflight=new Set();this.lock=Promise.resolve();this.callsPending=0;this.enginePendingWrites=0;this.automaticSyncEnabled=true;this.message='Opening Desktop Service…';this.files={get:async()=>null};bridge.onEvent(event=>this.receive(event));}
 get pendingWrites(){return this.callsPending+this.enginePendingWrites;}
 get items(){return testingItems(materialize(this.state.remote,this.state.operations),this.state.testingIndicators);}
 receive(event){if(event.type==='snapshot'){const {pendingWrites,...values}=event.value;Object.assign(this,values);this.enginePendingWrites=pendingWrites||0;this.inflight=new Set(event.value.inflight||[]);this.emit();}else this.dispatchEvent(new CustomEvent(event.type,{detail:event.detail}));}
 emit(){this.dispatchEvent(new Event('change'));}
 init(){if(!this.initializing)this.initializing=this.invoke('init',[]);return this.initializing;}
 async invoke(method,args){this.callsPending++;try{const result=await this.bridge.call(method,args);if(result.snapshot)this.receive({type:'snapshot',value:result.snapshot});return result.value;}finally{this.callsPending--;}}
 chooseAttachments(id){return this.bridge.chooseAttachments(id);}
 async dropAttachments(id,files){this.callsPending++;try{return await this.bridge.dropAttachments(id,files);}finally{this.callsPending--;}}
 async request(route,body){const response=await fetch(route,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw Object.assign(Error(data.error||'Desktop Request Failed.'),{syncStatus:data});return data;}
}
for(const method of METHODS)if(method!=='init')DesktopWorkspace.prototype[method]=function(...args){return this.invoke(method,args);};
