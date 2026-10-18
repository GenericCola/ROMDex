import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(path.resolve('work/u10/runtime/electron/electron.exe'),[path.resolve('work/u20h-ui.cjs')],{cwd:process.cwd(),env,windowsHide:false,detached:true,stdio:'ignore'});child.unref();
await fs.writeFile('work/u20h/ui-launch.json',JSON.stringify({at:new Date().toISOString(),launcherPid:process.pid,uiPid:child.pid}));process.exit(0);
