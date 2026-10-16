import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const source=await fs.readFile('C:/Users/mrgen/.codex/visualizations/2026/10/13/01a135f2-44b2-76d2-8bd4-062ec143dbd9/romdex-header-review.html','utf8');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1152,height:760},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.abort());
 await page.setContent('<!doctype html><html><head><style>body{margin:0}</style></head><body>'+source+'</body></html>');
 await page.locator('[data-mount=direct] .rd-active-title').waitFor();
 await page.locator('[data-mount=direct] .rd-app').screenshot({path:'outputs/U05-Direct-Switch.png'});
 await page.locator('section[data-variant]').evaluateAll(es=>es.forEach(e=>e.hidden=e.dataset.variant!=='Compact Menu'));
 await page.locator('[data-mount=compact] [data-menu=workspace]').click();
 await page.locator('[data-mount=compact] .rd-app').screenshot({path:'outputs/U05-Compact-Menu.png'});
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({images:['outputs/U05-Direct-Switch.png','outputs/U05-Compact-Menu.png'],width:1152,pageErrors:errors,productionChanges:false}));
}finally{await browser.close();}
