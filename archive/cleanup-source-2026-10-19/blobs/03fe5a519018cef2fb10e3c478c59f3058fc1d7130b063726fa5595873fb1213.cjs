const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const d=JSON.parse(fs.readFileSync('outputs/dialogue-data.json'));
const guide=fs.readFileSync('C:/Users/mrgen/Downloads/new_bark_town_dialogue_guide.md','utf8').replace(/\r/g,'');
const originalIds=[...new Set(guide.match(/(?:NBT-DLG|GLB-PRM)-[\w-]+/g))];
const points=d.towns.flatMap(t=>t.areas.flatMap(a=>a.elements.flatMap(e=>e.points)));
const seen=new Set(points.flatMap(p=>p.ids));assert(originalIds.every(id=>seen.has(id)),`Missing IDs: ${originalIds.filter(id=>!seen.has(id))}`);
const quotes=guide.split('\n').filter(l=>l.startsWith('>')).map(l=>l.replace(/^> ?/,'')).filter(Boolean);
const rendered=points.flatMap(p=>p.blocks.filter(b=>b.type==='dialogue').map(b=>b.text)).join('\n');assert(quotes.every(q=>rendered.includes(q)),'Missing quoted lines');
(async()=>{const browser=await chromium.launch({headless:true,channel:"chrome"});const page=await browser.newPage({viewport:{width:1440,height:1050}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file:///'+path.resolve('outputs/dialogue-journey.html').replace(/\\/g,'/'));await page.getByRole('button',{name:'Elm’s lab T20R0101',exact:false}).first().click();await page.getByRole('button',{name:'Professor Elm, when you talk to him',exact:false}).click();await page.getByRole('button',{name:'Stage D:',exact:false}).click();assert((await page.locator('#detail').innerText()).includes('Mr. Pokémon goes'));await page.getByRole('button',{name:'Stage J:',exact:false}).click();assert((await page.locator('#detail').innerText()).includes('Fast Ship'));await page.locator('#conditions').click();assert((await page.locator('#detail').innerText()).includes('late badge'));await page.screenshot({path:'work/desktop.png',fullPage:true});
for(const a of d.towns[0].areas){await page.locator(`[data-area="${a.id}"]`).click();for(const e of a.elements){await page.locator(`[data-element="${e.id}"]`).click();for(const s of d.stages){await page.locator(`[data-stage="${s.id}"]`).click();assert(await page.locator('#detail').count());}if(await page.locator('#conditions').isEnabled())await page.locator('#conditions').click();}}
await page.setViewportSize({width:390,height:844});await page.locator('[data-area="63"]').click();await page.locator('[data-stage="D"]').click();await page.screenshot({path:'work/mobile.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow');
await page.locator('#import').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{}')});assert((await page.locator('#status').innerText()).includes('Import failed'));
await page.locator('#import').setInputFiles(path.resolve('outputs/dialogue-data.json'));await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Imported')); assert((await page.locator('#status').innerText()).includes('Imported')); 
assert.equal(errors.length,0,errors.join('\n'));await browser.close();console.log(JSON.stringify({sourceIds:originalIds.length,quotedLines:quotes.length,points:points.length,allElementsAndStages:true,mobileOverflow:false,imports:'pass',browserErrors:errors}));})().catch(e=>{console.error(e);process.exit(1)});



