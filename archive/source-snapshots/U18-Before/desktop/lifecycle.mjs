import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

export function processAlive(pid){
 if(!Number.isSafeInteger(pid)||pid<1)return false;
 try{process.kill(pid,0);return true;}catch(error){return error.code!=='ESRCH';}
}

// Covers alternate executable paths as well as Electron's per-userData singleton.
export class ProfileLease {
 constructor(directory,{alive=processAlive,pid=process.pid}={}){this.file=path.join(directory,'desktop-owner.json');this.alive=alive;this.pid=pid;this.token=randomUUID();}
 acquire(){
  fs.mkdirSync(path.dirname(this.file),{recursive:true});
  for(let attempt=0;attempt<2;attempt++){
   try{this.record={version:1,pid:this.pid,utilityPid:null,token:this.token};fs.writeFileSync(this.file,JSON.stringify(this.record),{flag:'wx'});this.owned=true;return;}
   catch(error){if(error.code!=='EEXIST')throw error;}
   let prior;try{prior=JSON.parse(fs.readFileSync(this.file,'utf8'));}catch{throw Error('Desktop Profile Ownership Needs Review. No Data Has Been Replaced.');}
   if(this.alive(prior.pid)||this.alive(prior.utilityPid))throw Error('This ROMDex Profile Is Already Running. Open Its Existing Window or Quit It First.');
   fs.unlinkSync(this.file);
  }
  throw Error('Could Not Acquire the Desktop Profile.');
 }
 utility(pid){const current=JSON.parse(fs.readFileSync(this.file,'utf8'));if(current.token!==this.token)throw Error('Desktop Profile Ownership Changed.');this.record.utilityPid=pid;const temporary=this.file+'.'+this.token+'.tmp';fs.writeFileSync(temporary,JSON.stringify(this.record));fs.renameSync(temporary,this.file);}
 release(){if(!this.owned)return;try{if(JSON.parse(fs.readFileSync(this.file,'utf8')).token===this.token)fs.unlinkSync(this.file);this.owned=false;}catch(error){if(error.code!=='ENOENT')throw error;}}
}

export class QuitController {
 constructor({checkpoint,shutdown,exit,onError,onChange=()=>{}}){Object.assign(this,{checkpoint,shutdown,exit,onError,onChange});this.allowed=false;this.busy=null;}
 request(){
  if(this.busy)return this.busy;
  this.busy=Promise.resolve().then(async()=>{try{await this.checkpoint();await this.shutdown();this.allowed=true;this.exit();return true;}catch(error){await this.onError(error);return false;}}).finally(()=>{this.busy=null;if(!this.allowed)this.onChange();});this.onChange();
  return this.busy;
 }
}

export class RendererRecovery {
 constructor({reload,onUnavailable=()=>{},delay=ms=>new Promise(r=>setTimeout(r,ms)),now=()=>Date.now()}){Object.assign(this,{reload,onUnavailable,delay,now});this.attempts=0;this.failed=false;this.lastReady=0;}
 ready(){this.failed=false;this.lastReady=this.now();}
 async interrupted(){
  if(this.lastReady&&this.now()-this.lastReady>60000)this.attempts=0;
  this.failed=true;
  if(++this.attempts>3){this.onUnavailable();return false;}
  await this.delay(250);await this.reload();return true;
 }
 retry(){this.attempts=0;return this.interrupted();}
}

export function trayTemplate({active='romdex',enabled=true,ready=false,busy=false,quitBusy=false,updates=null,run,quit}){
 return [
  {label:'Show ROMDex',click:()=>run('show')},
  {label:'Open Workspace',enabled:ready,submenu:['romdex','npcdex'].map(id=>({label:id==='romdex'?'ROMDex':'NPCDex',type:'radio',checked:active===id,click:()=>run('workspace',id)}))},
  {type:'separator'},
  {label:'Save Changes',enabled:ready&&!busy,click:()=>run('save')},
  {label:'Auto-Sync Data',type:'checkbox',checked:enabled,enabled:ready&&!busy,click:item=>run('automatic',item.checked)},
  {label:'Connection Details…',enabled:ready,click:()=>run('connections')},
  {type:'separator'},
  {label:'About ROMDex…',click:()=>run('about')},
  ...(updates?[{label:updates.available?'Update Available: '+updates.available.version+'…':'Check for Updates…',enabled:!quitBusy&&updates.phase!=='installing',click:()=>run('updates')}]:[]),
  {type:'separator'},
  {label:'Quit ROMDex',enabled:!quitBusy,click:quit}
 ];
}
