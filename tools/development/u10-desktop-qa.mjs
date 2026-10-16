import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {_electron:electron}=require('playwright');
const profile=path.resolve('work/u10/qa-profile'),service=path.join(profile,'service');await fs.mkdir(service,{recursive:true});
const seed=JSON.parse(await fs.readFile('outputs/ROMDex/public/seed.json','utf8'));
await fs.writeFile(path.join(service,'fixture.json'),JSON.stringify(seed));await fs.writeFile(path.join(service,'sync-settings.json'),JSON.stringify({enabled:false}));
const app=await electron.launch({executablePath:path.resolve('work/u10/runtime/electron/electron.exe'),args:['--user-data-dir='+path.join(profile,'session'),'--enable-logging=stderr',path.resolve('outputs/ROMDex')],env:{...process.env,ROMDEX_QA:'1',ROMDEX_DESKTOP_PROFILE:profile,ROMDEX_DESKTOP_FIXTURE:'1',ROMDEX_QA_REPORT:path.resolve('work/u10/startup.json')},timeout:30000});
const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 await page.waitForFunction(()=>window.romdexShell?.host.views.size===2&&window.romdexShell.native.state,{timeout:45000});
 console.log(JSON.stringify({loaded:await page.evaluate(()=>({url:location.href,bridge:!!window.romdexDesktop,node:typeof require,items:window.romdexShell.native.items.length,views:[...window.romdexShell.host.views.keys()],mode:window.romdexShell.native.mode})),startup:JSON.parse(await fs.readFile('work/u10/startup.json','utf8')),errors}));
 await page.screenshot({path:'outputs/U10-Desktop-Preview.png'});
}catch(error){console.log(JSON.stringify({error:error.message,errors,body:(await page.locator('body').innerText()).slice(0,1200)}));throw error;}
finally{await app.close();}
