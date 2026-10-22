import fs from 'node:fs/promises';import assert from 'node:assert/strict';import path from 'node:path';import {createRequire} from 'node:module';
import {createContentPreview} from '../../outputs/ROMDex/content/preview-server.mjs';
import {readRdxFile} from '../../outputs/ROMDex/rdx/container.mjs';import {mapDomain} from '../../outputs/ROMDex/rdx/map-import.mjs';
const {chromium}=createRequire('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/probe.cjs')('playwright');
const snapshots=await Promise.all(['new-bark-town','route-29'].map(key=>fs.readFile(new URL('../mx03/'+key+'.snapshot.json',import.meta.url),'utf8').then(JSON.parse)));
const snapshot={...snapshots[0],towns:snapshots.flatMap(s=>s.towns),timelines:Object.assign({},...snapshots.map(s=>s.timelines))};
const values=await Promise.all(['new-bark-town','route-29'].map(k=>readRdxFile(new URL('../mx03/'+k+'.rdx',import.meta.url)))),domains=values.map(mapDomain),domain=Object.fromEntries(Object.keys(domains[0]).map(k=>[k,[...new Map(domains.flatMap(d=>d[k]).map(r=>[r.recordId||r.revisionId||r.digest||r.assetId||r.sha256,r])).values()]])),blobs=new Map(values.flatMap(v=>[...v.blobs]));
const store=new Map(),reader={cache:{get:k=>k.startsWith('domain:')?domain:store.get(k),set:(k,v)=>store.set(k,v),object:k=>blobs.get(k)},view:()=>({provider:'youtrack-content',active:true,head:'a'.repeat(64),snapshot,review:[],status:{state:'cached',pending:0,message:'Isolated read-only UI proof; no production connection.'}}),start(){},async stop(){}};
const preview=await createContentPreview({reader});let browser;
try{
 const bootstrap=await fetch(preview.origin+'/bootstrap.js');assert.equal(bootstrap.status,200,await bootstrap.text());
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},bypassCSP:true}),errors=[];page.setDefaultTimeout(60000);page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR: '+e.stack);});
 await page.exposeFunction('getProofContext',()=>({head:'a'.repeat(64),records:domain.records,plans:domain.plans,reviews:domain.reviews,draft:null,operations:[],conflicts:[]}));
 await page.addInitScript(()=>{window.romdexContentAPI=async(route,body)=>route==='/api/editor'?window.getProofContext():route==='/api/draft'?{}:fetch(route,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined}).then(r=>r.json());});
 await page.goto(preview.origin);await page.waitForSelector('[data-select-type="town"]');
 const towns=page.locator('[data-select-type="town"]');assert.equal(await towns.count(),2);await towns.nth(0).click();
 assert.equal(await page.locator('#stages [data-stage]').count(),46);await page.locator('[data-select-type="character"]').first().click();
 await page.waitForSelector('#speaker-label');await page.addStyleTag({content:await fs.readFile(new URL('../../outputs/ROMDex/content/native.css',import.meta.url),'utf8')});for(const name of ['editor-ui.js','classic-ui.js'])await page.addScriptTag({content:await fs.readFile(new URL('../../outputs/ROMDex/content/'+name,import.meta.url),'utf8')});assert((await page.locator('.conditions-pane').innerText()).includes('Access Requirements'));
 await page.evaluate(()=>openSettings('character',selected.id));await page.waitForSelector('#content-inline-tools #settings-dialog[open]');assert(await page.locator('#dialogue').isVisible());assert.equal(await page.locator('#settings-dialog').evaluate(e=>e.matches(':modal')),false);
 await page.locator('#content-correct-recorded').click();await page.waitForSelector('#content-inline-tools .content-editor-dialog[open]');assert(await page.locator('#dialogue').isVisible());await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.content-editor-dialog').open);
 await page.setViewportSize({width:1200,height:620});await page.evaluate(()=>openSettings('character',selected.id));await page.waitForSelector('#content-inline-tools #settings-dialog[open]');await page.screenshot({path:new URL('npcdex-inline-short.png',import.meta.url).pathname.slice(1),fullPage:true});await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('settings-dialog').open);await page.setViewportSize({width:1440,height:1000});
 await page.locator('#stages [data-stage]').first().click();await page.screenshot({path:new URL('new-bark-conditions.png',import.meta.url).pathname.slice(1),fullPage:true});
 await towns.nth(1).click();assert.equal(await page.locator('#stages [data-stage]').count(),8);assert.equal(await page.locator('#conditional').getAttribute('aria-pressed'),'true');
 await page.locator('[data-select-type="character"]').first().click();await page.locator('#unresolved-conditions').click();
 assert.equal(await page.locator('#unresolved-conditions').getAttribute('aria-pressed'),'true');
 await page.screenshot({path:new URL('route-29-unresolved.png',import.meta.url).pathname.slice(1),fullPage:true});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({maps:2,knownConditions:[46,8],mapSwitchReset:true,unresolvedReachable:true,sourceRequirementsVisible:true,pageErrors:errors}));
}finally{await browser?.close();await preview.close();}


