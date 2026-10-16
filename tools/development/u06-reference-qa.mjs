import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {server}=await import('./u06/ui-fixture.mjs');if(!server.listening)await once(server,'listening');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const old=await fs.readFile('outputs/U06-Before/public/index.html','utf8'),css=await fs.readFile('outputs/U06-Before/public/styles.css','utf8');
 await page.route('**/baseline',r=>r.fulfill({contentType:'text/html',body:old.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'')}));
 await page.route('**/styles.css',r=>r.fulfill({contentType:'text/css',body:css}));
 await page.goto('http://127.0.0.1:4342/baseline');
 const measure=()=>page.evaluate(()=>Object.fromEntries(['.device-header','.brand-title','.lens','.lamps','#save'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return[s,{x:r.x,y:r.y,width:r.width,height:r.height}];})));
 const before=await measure();await page.unroute('**/styles.css');await page.goto('http://127.0.0.1:4342/');await page.locator('#all-items.active').waitFor();const after=await measure();
 for(const s of ['.device-header','.brand-title','.lens','.lamps'])assert.deepEqual(after[s],before[s],s);assert.equal(after['#save'].height,before['#save'].height);assert.equal(after['#save'].width,before['#save'].width);
 const npc=await fs.readFile('C:/Users/mrgen/Downloads/npcdex-v2.42/npcdex-template.html','utf8');const npcCSS=npc.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
 await page.route('**/npc-reference',r=>r.fulfill({contentType:'text/html',body:`<!doctype html><style>${npcCSS}</style><link rel="stylesheet" href="/shared-ui/theme.css"><div class="device"><header class="device-header"></header></div><script type="module">import {mountHeader} from '/shared-ui/header.mjs';mountHeader(document.querySelector('header'),{active:'npcdex',npcdexAvailable:true});</script>`}));
 await page.goto('http://127.0.0.1:4342/npc-reference');await page.locator('.brand-title').filter({hasText:'NPCDex'}).waitFor();const npcTitle=await page.locator('.brand-title').boundingBox();assert.equal(npcTitle.x,after['.brand-title'].x);assert.equal(npcTitle.height,after['.brand-title'].height);assert.equal((await page.locator('.lamps').boundingBox()).x,after['.lamps'].x);assert.equal(await page.locator('.device-header').evaluate(e=>e.getBoundingClientRect().height),84);
 await fs.writeFile('outputs/U06-Reference-Verification.json',JSON.stringify({before,after,npcHeaderWithOriginalStyles:true,privateNPCDataLoaded:false},null,2));console.log('Brand geometry and Save size match baseline; shared header works with original NPCDex stylesheet and no private data.');
}finally{await browser.close();await new Promise(r=>server.close(r));}


