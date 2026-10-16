import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';
const build=JSON.parse(await fs.readFile('work/u16/build-release-0.5.4.json','utf8')),exe=path.join(build.applicationDirectory,'ROMDex.exe');
// Only disposable processes from this exact unpacked candidate can be stopped.
const literal="'"+exe.replaceAll("'","''")+"'",script=`Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -eq ${literal} } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`;
await new Promise((resolve,reject)=>{const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,stdio:'ignore'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Could Not Close the Disposable Candidate Processes.')));});
await import('./u16-crash-check.mjs');if(process.exitCode)throw Error('Crash Recovery Verification Needs Review.');
await import('./u16-ui-verify.mjs');
