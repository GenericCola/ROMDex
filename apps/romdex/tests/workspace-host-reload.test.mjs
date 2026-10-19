import test from 'node:test';import assert from 'node:assert/strict';import {WorkspaceHost} from '../public/workspace-host.mjs';

test('opening another document in the same workspace refreshes the active save/quit provider',async()=>{
 const oldHeight=globalThis.innerHeight;globalThis.innerHeight=900;
 const document=()=>({body:{},documentElement:{style:{setProperty(){}}},addEventListener(){},querySelectorAll:()=>[]});
 class Frame extends EventTarget{dataset={src:'romdex-app://shell/addons/npcdex/index.html'};set src(value){this.url=value;queueMicrotask(()=>this.dispatchEvent(new Event('load')));}}
 const frame=new Frame(),first=document();frame.contentDocument=first;frame.contentWindow={romdexWorkspace:{ready:Promise.resolve(),checkpoint:async()=>'original'}};const bound=[];let provider,nextReady;
 const host=new WorkspaceHost({frames:{npcdex:frame},onReady:(_id,view)=>{provider=view.win.romdexWorkspace;bound.push(view);nextReady?.();}});
 try{const view=await host.load('npcdex');host.current='npcdex';assert.equal(view.doc,first);assert.equal(await provider.checkpoint(),'original');
  const second=document();frame.contentDocument=second;frame.contentWindow={romdexWorkspace:{ready:Promise.resolve(),checkpoint:async()=>'new map'}};await new Promise(resolve=>{nextReady=resolve;frame.dispatchEvent(new Event('load'));});
  assert.equal(bound.length,2);assert.equal(host.current,'npcdex');assert.equal(host.views.get('npcdex').doc,second);assert.equal(await provider.checkpoint(),'new map');assert.equal(await host.load('npcdex'),host.views.get('npcdex'));
 }finally{if(oldHeight===undefined)delete globalThis.innerHeight;else globalThis.innerHeight=oldHeight;}
});
