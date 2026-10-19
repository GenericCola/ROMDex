// Share a full task-service cycle across task and metadata save providers.
export function coalesceSave(action){let active=null;return ()=>active||(active=Promise.resolve().then(action).finally(()=>active=null));}
export function savingMessage(state){return 'Saving · '+Object.entries(state.saveProgress||{}).filter(([,p])=>p.state==='running').map(([id])=>{const p=state.providers[id]||{};return (p.label||id)+': '+(p.message||'Waiting for Confirmation');}).join(' · ');}
// Provider orchestration is independent of DOM, browser clocks and storage technology.
export class SaveCoordinator extends EventTarget {
 constructor({storage,setting,now=()=>Date.now()}){super();this.storage=storage;this.setting=setting;this.now=now;this.providers=new Map();this.record={version:1,lastManual:null};this.writes=Promise.resolve();this.saving=false;this.settingBusy=false;this.storageError=null;}
 async init(){const record=await this.storage.load();if(record&&record.version!==1){this.incompatible=true;throw Error('Unknown Save Coordinator Format.');}this.record=record||this.record;this.emit();}
 register(id,provider){if(this.providers.has(id))throw Error('A Provider Already Owns This Workspace.');this.providers.set(id,provider);this.emit();}
 emit(){this.dispatchEvent(new Event('change'));}
 snapshot(){const providers=Object.fromEntries([...this.providers].map(([id,p])=>[id,p.status()]));return {providers,automaticSyncEnabled:this.setting.enabled(),saving:this.saving,settingBusy:this.settingBusy,storageError:this.storageError,attention:!!this.storageError||Object.values(providers).some(s=>s.attention),lastManual:this.record.lastManual,saveProgress:structuredClone(this.saveProgress||{})};}
 persist(){if(this.incompatible)return Promise.reject(Error('Unknown Save Coordinator Format.'));const value=structuredClone(this.record),run=this.writes.then(()=>this.storage.save(value));this.writes=run.catch(()=>{});return run;}
 save(){if(this.manual)return this.manual;if(this.settingBusy)return Promise.resolve({deferred:true});this.saving=true;this.saveProgress=Object.fromEntries([...this.providers.keys()].map(id=>[id,{state:'running'}]));this.emit();
  // Invoke all providers before awaiting, preserving file-picker user activation.
  const started=[...this.providers].map(([id,p])=>{try{return {id,task:Promise.resolve(p.save())};}catch(error){return {id,task:Promise.reject(error)};}});
  this.manual=(async()=>{const results=await Promise.all(started.map(async({id,task})=>{let result;try{result={id,...await task};}catch(error){result={id,ok:false,message:error.message};}this.saveProgress[id]={state:'finished',ok:result.ok,message:result.message};this.emit();return result;}));this.record.lastManual={at:this.now(),results};try{await this.persist();this.storageError=null;}catch(error){this.storageError='Save Result Could Not Be Kept Locally · '+error.message;}return {results,storageError:this.storageError};})().finally(()=>{this.saving=false;this.manual=null;this.emit();});return this.manual;
 }
 async setAutomatic(enabled){if(this.settingBusy||this.saving)return false;this.settingBusy=true;this.emit();try{await this.setting.set(enabled);this.record.automaticSyncEnabled=this.setting.enabled();await this.persist();this.storageError=null;return true;}catch(error){this.storageError=error.message;throw error;}finally{this.settingBusy=false;this.emit();}}
 async checkpoint(target=null){return Promise.all([...this.providers].filter(([id])=>!target||target===id).map(async([id,p])=>{try{await p.checkpoint?.();return {id,ok:true};}catch(error){return {id,ok:false,message:error.message};}}));}
}
