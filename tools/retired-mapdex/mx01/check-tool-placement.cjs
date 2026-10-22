const {createRequire}=require('node:module');
const {pathToFileURL}=require('node:url');
const {chromium}=createRequire('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/probe.cjs')('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1056,height:1700}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(__dirname+'/preview.html').href);
 const f=page.frames().find(f=>f!==page.mainFrame());
 const app=f.locator('.mx-app');
 await app.locator('.mx-identity input').waitFor();
 if(!await app.locator('.mx-identity').isVisible())throw Error('Inline settings not visible');
 await page.screenshot({path:__dirname+'/tool-placement-mapdex.png',fullPage:true});
 await app.locator('[data-action="close-identity"]').click();
 await app.locator('[data-action="identity"]').click();
 if(!await app.locator('.mx-lines').isVisible())throw Error('Dialogue hidden by tools');
 await app.locator('[data-action="workspace"]').click();
 if(await app.locator('.mx-title').textContent()!=='NPCDex')throw Error('Workspace switch failed');
 await app.locator('[data-action="content-menu"]').click();
 await page.screenshot({path:__dirname+'/tool-placement-npcdex.png',fullPage:true});
 await app.locator('[data-action="close-content"]').click();
 const sizes=[];
 for(const width of [736,320]){
  await page.setViewportSize({width:width+32,height:2500});await page.waitForTimeout(250);
  sizes.push(await f.evaluate(()=>{
   const input=document.querySelector('.mx-identity input').getBoundingClientRect();
   const text=document.querySelector('.mx-lines').getBoundingClientRect();
   return{width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,dialogueBelowEditor:text.top>=input.bottom};
  }));
 }
 await page.screenshot({path:__dirname+'/tool-placement-narrow.png',fullPage:true});
 console.log(JSON.stringify({errors,sizes}));
 if(errors.length||sizes.some(x=>x.overflow||!x.dialogueBelowEditor))process.exitCode=1;
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
