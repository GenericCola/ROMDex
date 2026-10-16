// A stopped utility is replaced only after exit; uncertain RPCs are never replayed.
export class ServiceHost {
 constructor({fork,onEvent=()=>{},onOwner=()=>{},delay=ms=>new Promise(r=>setTimeout(r,ms)),timeout=180000}){Object.assign(this,{fork,onEvent,onOwner,delay,timeout});this.pending=new Map();this.sequence=0;this.ready=false;this.stopped=false;this.initialized=false;this.failures=0;}
 call(command,args=[]){
  if(!this.ready)return Promise.reject(Error('Desktop Service Is Unavailable. Accepted Work Is Kept Locally.'));
  if(command==='init')this.initialized=true;
  return new Promise((resolve,reject)=>{const id=++this.sequence,timer=setTimeout(()=>{this.pending.delete(id);reject(Error('The Desktop Service Did Not Respond. Review Before Retrying.'));},this.timeout);this.pending.set(id,{resolve,reject,timer});try{this.worker.postMessage({id,command,args});}catch(error){clearTimeout(timer);this.pending.delete(id);reject(error);}});
 }
 rejectPending(){this.ready=false;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('Desktop Service Stopped. Review Any Interrupted Action Before Retrying.'));}this.pending.clear();}
 start(recovering=false){
  if(this.starting)return this.starting;
  if(this.ready)return Promise.resolve(this.info);
  this.starting=this.launch(recovering).then(info=>this.info=info).finally(()=>this.starting=null);return this.starting;
 }
 async launch(recovering){
  this.stopped=false;
  const info=await new Promise((resolve,reject)=>{
   const child=this.fork();this.worker=child;child.romdexExited=false;child.stdout?.resume();child.stderr?.resume();let announced=false;
   const timer=setTimeout(()=>{reject(Error('Desktop Service Startup Timed Out.'));child.kill();},30000);
   child.on('spawn',()=>{try{this.onOwner(child.pid);}catch(error){reject(error);this.stopped=true;child.kill();}});
   child.on('message',message=>{
    if(message.ready){announced=true;clearTimeout(timer);this.ready=true;resolve(message);}
    else if(message.reply){const p=this.pending.get(message.reply);if(p){clearTimeout(p.timer);this.pending.delete(message.reply);message.error?p.reject(Object.assign(Error(message.error),{syncStatus:message.syncStatus})):p.resolve(message.value);}}
    else this.onEvent(message);
   });
   child.once('exit',code=>{child.romdexExited=true;clearTimeout(timer);this.rejectPending();if(!announced)reject(Error('Desktop Service Exited ('+code+').'));if(!this.stopped){this.onEvent({type:'service-error',detail:'Desktop Service Interrupted. Recovering Local Work…'});this.recover();}});
  });
  if(recovering&&this.initialized){const result=await this.call('init');this.onEvent({type:'snapshot',value:result.snapshot});this.onEvent({type:'service-ready'});}
  return info;
 }
 async recover(){
  // Let an in-progress launch settle before attempting another. Back off on crashes.
  await this.starting?.catch(()=>{});if(this.stopped||this.ready)return;
  if(++this.failures>3){this.onEvent({type:'service-error',detail:'Desktop Service Could Not Recover. Quit and Reopen ROMDex; Local Work Is Retained.'});return;}
  await this.delay(1000*2**(this.failures-1));if(this.stopped||this.ready)return;
  try{await this.start(true);}catch(error){this.onEvent({type:'service-error',detail:error.message});}
 }
 async shutdown(){
  this.stopped=true;
  try{await this.call('shutdown');}catch(error){this.stopped=false;throw error;}
  await this.terminate();
 }
 async terminate(){
  this.stopped=true;const child=this.worker;if(!child)return;
  await new Promise((resolve,reject)=>{if(child.romdexExited){resolve();return;}const timer=setTimeout(()=>reject(Error('Desktop Service Has Not Stopped. ROMDex Will Stay Open.')),10000);child.once('exit',()=>{clearTimeout(timer);resolve();});child.kill();});
  this.worker=null;this.rejectPending();
 }
}
