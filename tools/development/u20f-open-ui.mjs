import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';
const log=await fs.open('work/u20f/ui-window.log','a');const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(path.resolve('work/u10/runtime/electron/electron.exe'),[path.resolve('work/u20f-ui.cjs')],{cwd:process.cwd(),env,windowsHide:true,detached:true,stdio:['ignore',log.fd,log.fd]});child.unref();await log.close();
