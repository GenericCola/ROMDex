const {createRequire}=require('node:module');
const {pathToFileURL}=require('node:url');
const {chromium}=createRequire('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/probe.cjs')('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1056,height:1150}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(pathToFileURL(__dirname+'/preview.html').href);
 const frame=page.frames().find(item=>item!==page.mainFrame());
 await frame.locator('.md-name').first().waitFor();
 await page.screenshot({path:__dirname+'/stacked.png',fullPage:true});
 await frame.locator('.layout-stacked [data-person="lyra"]').click();
 if(await frame.locator('.layout-stacked .md-name').inputValue()!=='Lyra')throw Error('Entity selection failed');
 await frame.locator('.layout-stacked .md-link').click();
 await frame.locator('.layout-stacked .md-link-form input').check();
 await frame.locator('.layout-stacked .md-confirm-link').click();
 await frame.locator('.layout-stacked [data-view="setup"]').click();
 if(!await frame.locator('.layout-stacked .md-setup').isVisible())throw Error('Setup not visible');
 await frame.locator('.layout-stacked [data-view="content"]').click();
 await frame.locator('.layout-stacked .md-map-row').first().hover();
 await frame.locator('.layout-stacked .md-cog').first().click();
 await page.keyboard.press('Escape');
 if(await frame.locator('.layout-stacked .md-context').first().isVisible())throw Error('Escape failed');
 await frame.evaluate(()=>{document.querySelector('.layout-stacked').hidden=true;document.querySelector('.layout-side').hidden=false;});
 await page.screenshot({path:__dirname+'/side.png',fullPage:true});
 const results=[];
 for(const width of [1024,736,480,320]){
   await page.setViewportSize({width:width+32,height:1800});
   await page.waitForTimeout(250);
   for(const variant of ['layout-stacked','layout-side']){
     await frame.evaluate(name=>{document.querySelectorAll('.md-variant').forEach(node=>node.hidden=!node.classList.contains(name));},variant);
     results.push(await frame.evaluate(name=>{const app=document.querySelector('.'+name);const size=app.getBoundingClientRect();return {variant:name,width:innerWidth,scroll:document.documentElement.scrollWidth,appWidth:size.width,overflow:document.documentElement.scrollWidth>innerWidth};},variant));
   }
 }
 await page.screenshot({path:__dirname+'/narrow.png',fullPage:true});
 console.log(JSON.stringify({errors,results}));
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
