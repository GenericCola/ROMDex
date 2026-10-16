import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {EventEmitter} from 'node:events';
import {ProfileLease,QuitController,RendererRecovery,trayTemplate} from '../desktop/lifecycle.mjs';
import {ServiceHost} from '../desktop/service-host.mjs';
const waitFor=async fn=>{for(let i=0;i<100&&!fn();i++)await new Promise(r=>setTimeout(r,5));assert(fn());};
function temporary(t){const dir=fs.mkdtempSync(path.join(process.env.ROMDEX_TEST_SCRATCH||os.tmpdir(),'romdex-lease-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}

test('profile lease refuses another live application or orphan utility and releases only its own lease',t=>{
 const dir=temporary(t),alive=pid=>[11,22].includes(pid),owner=new ProfileLease(dir,{alive,pid:11});owner.acquire();owner.utility(22);
 const contender=new ProfileLease(dir,{alive,pid:33});assert.throws(()=>contender.acquire(),/Already Running/);contender.release();assert(fs.existsSync(owner.file));
 fs.writeFileSync(owner.file,JSON.stringify({...owner.record,pid:99}));assert.throws(()=>new ProfileLease(dir,{alive,pid:33}).acquire(),/Already Running/);
 owner.release();assert(!fs.existsSync(owner.file));
});
test('dead-owner lease is reclaimed but corrupt ownership is never silently removed',t=>{
 const dir=temporary(t),file=path.join(dir,'desktop-owner.json');fs.writeFileSync(file,JSON.stringify({pid:99,utilityPid:98}));const lease=new ProfileLease(dir,{alive:()=>false,pid:11});lease.acquire();assert.equal(JSON.parse(fs.readFileSync(file)).pid,11);lease.release();
 fs.writeFileSync(file,'broken');assert.throws(()=>new ProfileLease(dir).acquire(),/Needs Review/);assert.equal(fs.readFileSync(file,'utf8'),'broken');
});
test('quit coalesces duplicate requests and checkpoints before stopping service or exiting',async()=>{
 const calls=[];let release;const gate=new Promise(r=>release=r),q=new QuitController({checkpoint:async()=>{calls.push('checkpoint');await gate;},shutdown:async()=>calls.push('shutdown'),exit:()=>calls.push('exit'),onError:()=>assert.fail('unexpected error'),onChange:()=>assert(!q.allowed,'Never Update a Destroyed Tray After Exit')});
 const first=q.request();assert.equal(q.request(),first);assert(!q.allowed);release();assert(await first);assert.deepEqual(calls,['checkpoint','shutdown','exit']);assert(q.allowed);
});
test('local save failure prevents quit, restores review and permits a later retry',async()=>{
 let fail=true;const calls=[],q=new QuitController({checkpoint:async()=>{if(fail)throw Error('disk full');},shutdown:async()=>calls.push('shutdown'),exit:()=>calls.push('exit'),onError:e=>calls.push(e.message)});
 assert.equal(await q.request(),false);assert.deepEqual(calls,['disk full']);assert(!q.allowed);fail=false;assert.equal(await q.request(),true);assert.deepEqual(calls,['disk full','shutdown','exit']);
});
test('shutdown failure never exits and can be retried',async()=>{
 let stop=false,errors=0;const q=new QuitController({checkpoint:async()=>{},shutdown:async()=>{if(!stop)throw Error('busy');},exit:()=>assert(stop),onError:()=>errors++});assert.equal(await q.request(),false);assert.equal(errors,1);stop=true;assert(await q.request());
});
test('approved tray groups commands, uses shared state and omits unavailable update placeholder',()=>{
 const calls=[],items=trayTemplate({active:'npcdex',enabled:false,ready:true,run:(...args)=>calls.push(args),quit:()=>calls.push(['quit'])});assert(!items.some(x=>x.label?.includes('Update')));const workspaces=items.find(x=>x.submenu).submenu;assert(workspaces[1].checked&&!workspaces[0].checked);items[0].click();workspaces[0].click();items.find(x=>x.type==='checkbox').click({checked:true});items.at(-1).click();assert.deepEqual(calls,[['show'],['workspace','romdex'],['automatic',true],['quit']]);
 const paused=trayTemplate({ready:false,run:()=>{},quit:()=>{}});assert.equal(paused.find(x=>x.label==='Save Changes').enabled,false);assert.equal(paused.at(-1).enabled,true);
 const syncing=trayTemplate({ready:true,busy:true,run:()=>{},quit:()=>{}});assert.equal(syncing.find(x=>x.label==='Save Changes').enabled,false);assert.equal(syncing.at(-1).enabled,true);assert.equal(trayTemplate({quitBusy:true}).at(-1).enabled,false);
});
test('tray update availability opens its own controls while project saving remains independent',()=>{const commands=[],items=trayTemplate({ready:true,updates:{phase:'error'},run:name=>commands.push(name)});items.find(x=>x.label==='Check for Updates…').click();assert.deepEqual(commands,['updates']);assert.equal(items.find(x=>x.label==='Save Changes').enabled,true);const available=trayTemplate({ready:true,updates:{phase:'ready',available:{version:'0.5.4'}}});assert(available.some(x=>x.label==='Update Available: 0.5.4…'));const installing=trayTemplate({updates:{phase:'installing'}});assert.equal(installing.find(x=>x.label==='Check for Updates…').enabled,false);});

test('renderer recovery is bounded, allows manual retry and never claims readiness before load',async()=>{
 let reloads=0,reviews=0;const recovery=new RendererRecovery({reload:()=>reloads++,onUnavailable:()=>reviews++,delay:async()=>{}});
 for(let i=0;i<4;i++)await recovery.interrupted();assert.equal(reloads,3);assert.equal(reviews,1);assert(recovery.failed);await recovery.retry();assert.equal(reloads,4);assert(recovery.failed);recovery.ready();assert(!recovery.failed);
});
test('renderer retry budget resets after a stable minute',async()=>{
 let now=1,reloads=0;const recovery=new RendererRecovery({reload:()=>reloads++,delay:async()=>{},now:()=>now});recovery.ready();await recovery.interrupted();recovery.ready();now=60002;await recovery.interrupted();assert.equal(recovery.attempts,1);assert.equal(reloads,2);
});

function fakeService(t,{delay=async()=>{},reply=true}={}){
 const children=[],events=[];let pid=300;const host=new ServiceHost({timeout:500,delay,onEvent:e=>events.push(e),fork:()=>{const child=new EventEmitter();child.pid=++pid;child.calls=[];child.postMessage=message=>{child.calls.push(message);if(reply)queueMicrotask(()=>child.emit('message',{reply:message.id,value:message.command==='init'?{snapshot:{state:{operations:[]}}}:true}));};child.kill=()=>{queueMicrotask(()=>child.emit('exit',0));return true;};children.push(child);queueMicrotask(()=>{child.emit('spawn');child.emit('message',{ready:true,fixture:true});});return child;}});t.after(()=>host.terminate());return {host,children,events};
}
test('service restart reloads accepted disk state without replaying interrupted mutations',async t=>{
 const {host,children,events}=fakeService(t);await host.start();await host.call('init');await host.call('edit',['PMON-1',{summary:'Accepted'}]);children[0].emit('exit',1);await waitFor(()=>children.length===2&&events.some(e=>e.type==='service-ready'));assert.deepEqual(children[1].calls.map(x=>x.command),['init']);assert(events.some(e=>e.type==='service-error'));assert(events.some(e=>e.type==='snapshot'));assert(host.ready);
});
test('interrupted RPCs reject explicitly and are never sent to the replacement worker',async t=>{
 const {host,children}=fakeService(t,{reply:false});await host.start();const pending=host.call('create',['New Item']);const rejected=assert.rejects(pending,/Review Any Interrupted Action/);children[0].emit('exit',1);await rejected;await waitFor(()=>children.length===2);assert.equal(children[1].calls.length,0);
});
test('quit while recovery is delayed prevents a replacement utility from starting',async t=>{
 let release;const delay=()=>new Promise(r=>release=r),{host,children}=fakeService(t,{delay});await host.start();children[0].emit('exit',1);await waitFor(()=>!!release);await host.terminate();release();await new Promise(r=>setTimeout(r,10));assert.equal(children.length,1);
});
test('service shutdown is acknowledged before the worker is terminated',async t=>{
 const {host,children}=fakeService(t);await host.start();await host.shutdown();assert.deepEqual(children[0].calls.map(x=>x.command),['shutdown']);assert(!host.ready);assert.equal(host.worker,null);assert(host.stopped);
});
test('startup calls coalesce into one worker, including explicit recovery during backoff',async t=>{
 const {host,children}=fakeService(t);const a=host.start(),b=host.start();assert.equal(a,b);await a;await host.start(true);assert.equal(children.length,1);
});

test('credential replies stay on the private worker channel and failures disclose no credential',async t=>{
 const {host,children,events}=fakeService(t,{reply:false});await host.start();const child=children[0];
 host.onCredential=async(value,decrypt)=>{assert.equal(value,'test-ciphertext');assert.equal(decrypt,true);return 'test-secret';};
 child.emit('message',{credentialRequest:7,value:'test-ciphertext',decrypt:true});
 await waitFor(()=>child.calls.some(x=>x.credentialReply===7));
 assert.deepEqual(child.calls.find(x=>x.credentialReply===7),{credentialReply:7,value:'test-secret'});assert.deepEqual(events,[]);
 host.onCredential=async()=>{throw Error('private failure test-secret');};
 child.emit('message',{credentialRequest:8,value:'test-ciphertext',decrypt:true});
 await waitFor(()=>child.calls.some(x=>x.credentialReply===8));
 assert.deepEqual(child.calls.find(x=>x.credentialReply===8),{credentialReply:8,error:'Windows Could Not Protect or Restore the Connection.'});assert.deepEqual(events,[]);
});
