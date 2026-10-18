import fs from 'node:fs/promises';import {spawn} from 'node:child_process';import path from 'node:path';
async function run(file,electron=false){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const exe=electron?path.resolve('work/u10/runtime/electron/electron.exe'):process.execPath,log=await fs.open('work/u20i/final-verification.log','a');try{const child=spawn(exe,[path.resolve(file)],{cwd:process.cwd(),env,windowsHide:true,stdio:['ignore',log.fd,log.fd]});const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});if(code!==0)throw Error(file+' failed: '+code);}finally{await log.close();}}
await run('work/u20i-audit-candidate.mjs');
await run('work/u20i-packaged-backend.cjs',true);
let ui=await fs.readFile('work/u20i-ui.cjs','utf8');ui=ui.replace("const load=f=>import(pathToFileURL(path.join(root,'outputs/ROMDex',f)))","const candidate=JSON.parse(await fs.readFile(path.join(work,'candidate-manifest.json')));const load=f=>import(pathToFileURL(path.join(candidate.applicationDirectory,'resources/app',f)))");ui=ui.replace('height:820','height:620');await fs.writeFile('work/u20i-ui.cjs',ui);
await run('work/u20i-show-ui.mjs');
