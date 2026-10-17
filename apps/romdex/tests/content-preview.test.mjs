import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {FixtureContentTransport} from './content-fixture.mjs';import {ContentCache} from '../content/cache.mjs';import {ContentReader} from '../content/reader.mjs';import {createContentPreview} from '../content/preview-server.mjs';
test('Isolated NPCDex preview uses the existing UI without the coded baseline or save APIs',async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'romdex-preview-')),transport=new FixtureContentTransport(),seed=transport.seed(),cache=new ContentCache({directory,workspace:'fixture:workspace',isolation:true}),reader=new ContentReader({transport,cache,workspace:'fixture:workspace',bootstrapPublication:seed.pub.digest});let preview;
 try{
  await reader.cycle(true);preview=await createContentPreview({reader});
  const page=await fetch(preview.origin),html=await page.text();assert.equal(page.status,200);assert(html.includes('/preview.js')&&html.includes('Auto-Sync Data'));assert(!html.includes('src="workspace.js"'));assert(page.headers.get('content-security-policy').includes("connect-src 'self'"));
  const runtime=await (await fetch(preview.origin+'/runtime.js')).text();assert(runtime.startsWith('const ORIGINAL=window.romdexContentSnapshot;'));assert(runtime.length<500000);assert(!runtime.includes('const ORIGINAL={'));assert(!runtime.includes('const startupReady=start();'));
  const bootstrap=await (await fetch(preview.origin+'/bootstrap.js')).text();assert(bootstrap.includes('fixture:map'));assert(!bootstrap.includes('New Bark Town'));assert(!bootstrap.includes('signed='));
  const post=(route,data)=>fetch(preview.origin+route,{method:'POST',headers:{'Content-Type':'application/json',Origin:preview.origin},body:JSON.stringify(data)});
  assert.equal((await post('/api/connect',{token:'synthetic'})).status,405);assert.equal((await post('/api/sync',{snapshot:{}})).status,400);
  const off=await (await post('/api/auto',{enabled:false})).json();assert.equal(off.status.automaticRemote,false);const reads=transport.reads;const manual=await (await post('/api/sync',{})).json();assert(manual.active);assert.equal(manual.status.automaticRemote,false);assert.equal(transport.reads,reads+1);
  assert.equal((await fetch(preview.origin+'/api/view',{headers:{Origin:'https://example.invalid'}})).status,400);assert.equal((await fetch(preview.origin+'/api/view',{headers:{'Sec-Fetch-Site':'cross-site'}})).status,400);
  const update=transport.correction(seed.pub.digest);await post('/api/sync',{});const next=await (await fetch(preview.origin+'/api/view?gender=female')).json();assert.equal(next.head,update.pub.digest);assert.equal(next.snapshot.preferences.gender,'female');assert.equal(cache.get('preview-auto-sync'),false);
 }finally{await preview?.close();cache.close();fs.rmSync(directory,{recursive:true,force:true});}
});
