import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=await fs.readFile('C:/Users/mrgen/.codex/visualizations/2026/10/13/01a135f2-44b2-76d2-8bd4-062ec143dbd9/romdex-footer-switch-review.html','utf8');
assert.ok(!source.includes('id="romdex-header-review"'));assert.ok(!source.includes('<div class="rd-switch"'));assert.ok(!source.includes('<div class="rd-menu-wrap"'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1152,height:760},reducedMotion:'reduce'}),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',route=>{requests.push(route.request().url());route.abort();});
 await page.setContent('<!doctype html><html><head><style>body{margin:0}</style></head><body>'+source+'</body></html>');
 const app=page.locator('.rd-app'),trigger=app.locator('.rd-footer-switch'),menu=app.locator('.rd-footer-menu');
 await trigger.waitFor();assert.equal((await trigger.textContent()).trim(),'');
 assert.equal(await trigger.getAttribute('aria-label'),'Switch Workspace');
 await trigger.click();assert.equal(await menu.isVisible(),true);
 assert.deepEqual(await menu.locator('[data-tool]>span:first-child').allTextContents(),['ROMDex','NPCDex']);
 await page.keyboard.press('Escape');assert.equal(await menu.isVisible(),false);assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);
 await app.locator('[data-gender=female]').click();
 await trigger.click();await menu.locator('[data-tool=tasks]').click();assert.equal(await menu.isVisible(),false);assert.equal(await app.locator('.rd-active-title').textContent(),'ROMDex');
 await trigger.click();await menu.locator('[data-tool=npcdex]').click();assert.equal(await app.locator('[data-gender=female]').getAttribute('aria-pressed'),'true');
 await trigger.click();await page.keyboard.press('ArrowUp');assert.equal(await menu.locator('[data-tool=tasks]').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Escape');
 await trigger.click();await app.locator('h1').click();assert.equal(await menu.isVisible(),false);
 for(const width of [1280,1024,768,600,320]){await page.setViewportSize({width,height:900});const overflow=await app.evaluate(e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll('*')].filter(x=>x.getClientRects().length&&getComputedStyle(x).position!=='absolute').filter(x=>{const b=x.getBoundingClientRect();return b.width>0&&(b.left<r.left-.5||b.right>r.right+.5);}).map(x=>x.className);});assert.deepEqual(overflow,[],String(width));}
 await page.setViewportSize({width:1152,height:760});
 await app.screenshot({path:'outputs/U05-Footer-Switch-Closed.png'});
 await trigger.click();await app.screenshot({path:'outputs/U05-Footer-Switch-Open.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 const result={verifiedAt:new Date().toISOString(),layout:'Footer Workspace Menu',visibleButtonLabel:false,accessibleButtonLabel:'Switch Workspace',workspaceLabels:['ROMDex','NPCDex'],escapeClosesAndRestoresFocus:true,selectionClosesMenu:true,workspaceGenderPreserved:true,arrowNavigation:true,outsideClickCloses:true,widths:[1280,1024,768,600,320],pageErrors:errors,externalRequests:requests,productionChanged:false,limits:'Layout prototype demonstrates retained DOM/one workspace setting; complete selection, drafts, scroll, navigation and focus preservation remain U08 implementation checks.'};
 await fs.writeFile('outputs/U05-Footer-Layout-Verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
