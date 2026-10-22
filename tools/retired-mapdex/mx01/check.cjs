const {createRequire}=require('node:module');
const {pathToFileURL}=require('node:url');
const {chromium}=createRequire('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/probe.cjs')('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1056,height:1500}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(__dirname+'/preview.html').href);
 const f=page.frames().find(f=>f!==page.mainFrame());
 const app=f.locator('[data-mode="inspector"]');
 await app.locator('.mx-item-name').waitFor();
 await page.screenshot({path:__dirname+'/mapdex.png',fullPage:true});
 await app.locator('[data-select-map="route"]').click();
 if(!await app.locator('.mx-conditions').textContent().then(x=>x.includes('Catching lesson')))throw Error('Map conditions did not change');
 await app.locator('[data-condition="1"]').click();
 if(!await app.locator('.mx-rule').textContent().then(x=>x.includes('Lesson completed')))throw Error('Condition selection failed');
 await app.locator('[data-select-map="bark"]').click();
 await app.locator('[data-action="workspace"]').click();
 if(await app.locator('.mx-title').textContent()!=='NPCDex')throw Error('Workspace switch failed');
 await page.screenshot({path:__dirname+'/npcdex.png',fullPage:true});
 await app.locator('[data-action="content-menu"]').click();
 if(!await app.locator('[data-action="packages"]').isVisible())throw Error('Map tools missing');
 await app.locator('[data-action="close-content"]').click();
 await app.locator('[data-item-settings="0"]').evaluate(b=>b.click());
 if(!await app.locator('.mx-identity').isVisible())throw Error('Tile settings failed');
 await app.locator('[data-action="close-identity"]').click();
 await f.evaluate(()=>{document.querySelectorAll('[data-variant]').forEach(s=>s.hidden=s.dataset.variant!=='Flag State Preview');});
 const alt=f.locator('[data-mode="state"]');
 await alt.locator('[data-state="0"]').selectOption('unset');
 if(await alt.locator('.mx-dialogue').count()!==1)throw Error('Flag preview not filtering');
 await page.screenshot({path:__dirname+'/state-preview.png',fullPage:true});
 const layouts=[];
 for(const width of [1024,736,480,320]){
  await page.setViewportSize({width:width+32,height:2000});await page.waitForTimeout(250);
  for(const variant of ['Condition Inspector','Flag State Preview']){
   await f.evaluate(v=>document.querySelectorAll('[data-variant]').forEach(s=>s.hidden=s.dataset.variant!==v),variant);
   layouts.push(await f.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth})));
  }
 }
 await page.screenshot({path:__dirname+'/narrow.png',fullPage:true});
 console.log(JSON.stringify({errors,layouts}));
 if(errors.length||layouts.some(x=>x.overflow))process.exitCode=1;
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
