import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const {chromium}=createRequire(import.meta.url)('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=await fs.readFile('C:/Users/mrgen/.codex/visualizations/2026/10/13/01a135f2-44b2-76d2-8bd4-062ec143dbd9/romdex-header-review.html','utf8');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
const page=await context.newPage(),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',route=>{requests.push(route.request().url());route.abort();});
await page.setContent('<!doctype html><html><head><style>body{margin:0}button{cursor:pointer}</style></head><body>'+source+'</body></html>');
const direct=page.locator('[data-mount=direct]');
await direct.locator('.rd-active-title').filter({hasText:'NPCDex'}).waitFor();
const rect=loc=>loc.evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2};});
const baseline={lens:await rect(direct.locator('.rd-lens')),title:await rect(direct.locator('h1')),lamps:await rect(direct.locator('.rd-lamps')),save:await rect(direct.locator('.rd-save'))};
const fontFamilies=await direct.locator('.rd-app,.rd-fixture-tile,.rd-nav,.rd-save').evaluateAll(es=>es.map(e=>({element:e.className,font:getComputedStyle(e).fontFamily})));
assert.ok(fontFamilies.every(x=>x.font.includes('system-ui')),JSON.stringify(fontFamilies));
await direct.locator('.rd-switch [data-tool=tasks]').click();
assert.equal(await direct.locator('.rd-active-title').textContent(),'ROMDex');
assert.equal(await direct.locator('[data-view=tasks]').isVisible(),true);
assert.deepEqual(await rect(direct.locator('.rd-lens')),baseline.lens);
assert.deepEqual(await rect(direct.locator('h1')),baseline.title);
assert.deepEqual(await rect(direct.locator('.rd-lamps')),baseline.lamps);
assert.equal((await rect(direct.locator('.rd-save'))).height,34);
assert.equal((await rect(direct.locator('.rd-auto'))).height,34);
assert.equal((await rect(direct.locator('.rd-save'))).cy,(await rect(direct.locator('.rd-auto'))).cy);
const light=await rect(direct.locator('.rd-connection-light'));
assert.equal(light.width,11);assert.equal(light.height,11);
assert.equal(light.cy,(await rect(direct.locator('.rd-save'))).cy);
assert.equal(await direct.locator('.rd-gear img').first().evaluate(e=>e.naturalWidth),16);
await direct.locator('.rd-auto').click();assert.equal(await direct.locator('.rd-on').textContent(),'Off');
await direct.locator('.rd-save').click();assert.equal(await direct.locator('.rd-on').textContent(),'Off');
assert.match(await direct.locator('.rd-save-message').textContent(),/Both Workspaces Saved; Auto-Sync Remains Off/);
await direct.locator('.rd-connection').click();assert.equal(await direct.locator('.rd-panel h2').textContent(),'Connections');
await direct.locator('[data-close-panel]').click();
await direct.locator('.rd-switch [data-tool=npcdex]').click();
await direct.locator('[data-menu=inventory]').click();
await direct.locator('[data-popup=inventory] [data-panel=Data]').click();assert.equal(await direct.locator('.rd-panel h2').textContent(),'Data');
await page.keyboard.press('Escape');assert.equal(await direct.locator('.rd-overlay').isVisible(),false);
await direct.locator('[data-panel="Flags, Notes & Changes"]').click();assert.equal(await direct.locator('.rd-panel h2').textContent(),'Flags, Notes & Changes');await direct.locator('[data-close-panel]').click();
const gender=await rect(direct.locator('.rd-gender')),cog=await rect(direct.locator('[data-menu=inventory]'));
assert.ok(gender.x+gender.width<cog.x);assert.equal(gender.cy,cog.cy);
for(const variant of ['direct','compact']){
 await page.locator('section[data-variant]').evaluateAll((es,name)=>es.forEach(e=>e.hidden=(name==='direct'?e.dataset.variant!=='Direct Switch':e.dataset.variant!=='Compact Menu')),variant);
 const app=page.locator('[data-mount='+variant+']');
 if(variant==='compact'){await app.locator('[data-menu=workspace]').click();await app.locator('[data-popup=workspace] [data-tool=tasks]').click();assert.equal(await app.locator('.rd-active-title').textContent(),'ROMDex');await app.locator('[data-menu=workspace]').click();await app.locator('[data-popup=workspace] [data-tool=npcdex]').click();}
 for(const width of [1280,1024,768,600,320]){
  await page.setViewportSize({width,height:1000});
  const overflow=await app.locator('.rd-app').evaluate(e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll('*')].filter(x=>x.getClientRects().length&&getComputedStyle(x).position!=='absolute').filter(x=>{const b=x.getBoundingClientRect();return b.width>0&&(b.left<r.left-.5||b.right>r.right+.5);}).map(x=>x.className);});
  assert.deepEqual(overflow,[],variant+' overflow at '+width);
  if(width===1024&&variant==='direct')await page.screenshot({path:'work/u05-layout/direct-1024.png',fullPage:true});
  if(width===320&&variant==='direct')await page.screenshot({path:'work/u05-layout/direct-320.png',fullPage:true});
 }
}
await page.setViewportSize({width:1280,height:900});
await page.locator('section[data-variant]').evaluateAll(es=>es.forEach(e=>e.hidden=e.dataset.variant!=='Direct Switch'));
// Compare preserved brand and Save geometry against actual released CSS/markup in another isolated page.
const ref=await context.newPage();const romHtml=await fs.readFile('outputs/ROMDex/public/index.html','utf8'),romCSS=await fs.readFile('outputs/ROMDex/public/styles.css','utf8');
await ref.setContent('<!doctype html><style>'+romCSS+'</style>'+romHtml.match(/<header class="device-header">[\s\S]*?<\/header>/)[0]);
const released={lens:await rect(ref.locator('.lens')),title:await rect(ref.locator('h1')),lamps:await rect(ref.locator('.lamps')),save:await rect(ref.locator('#save'))};
assert.deepEqual(baseline.lens,released.lens);assert.deepEqual(baseline.title,released.title);assert.deepEqual(baseline.lamps,released.lamps);
assert.equal(baseline.save.width,released.save.width);assert.equal(baseline.save.height,released.save.height);
assert.equal(errors.length,0);assert.deepEqual(requests,[]);
const hash=b=>createHash('sha256').update(b).digest('hex'),manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4-Manifest.json'));
for(const f of manifest.files){const rel=f.path.slice(7),src=rel==='preview.png'?'outputs/ROMDex-v0.4-Preview.png':'outputs/ROMDex/'+rel;for(const p of [src,'outputs/ROMDex-v0.4/'+f.path])assert.equal(hash(await fs.readFile(p)),f.sha256,p);}
const result={verifiedAt:new Date().toISOString(),variants:2,widths:[1280,1024,768,600,320],brandMatchesReleasedGeometry:true,brandStableOnToolSwitch:true,saveSizeMatchesRelease:true,headerControlHeight:34,connectionCircleSize:11,genderImmediatelyLeftOfInventoryCog:true,toolSwitching:true,connectionDetails:true,inventoryDataMenu:true,flagsAndNotes:true,manualSaveLeavesSyncOff:true,fontFamilies,pageErrors:errors,externalRequests:requests,releaseFilesVerifiedInSourceAndInstallation:manifest.files.length,productionChanged:false,geometry:{proposal:baseline,released}};
await fs.writeFile('outputs/U05-Layout-Verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
await browser.close();
