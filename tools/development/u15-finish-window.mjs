import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const root=process.cwd(),work=path.resolve('work/u15'),report={task:'U15',at:new Date().toISOString()};
try{
 const result=JSON.parse(await fs.readFile(path.join(work,'import-result.json'),'utf8')),host=JSON.parse(await fs.readFile(path.join(work,'host-state.json'),'utf8'));assert.equal(result.status,'verified');assert.equal(result.exactSourceAndHydratedBytes,true);assert.equal(result.credentialsPreserved,true);assert(Number.isSafeInteger(host.pid));
 const script=String.raw`
$ErrorActionPreference='Stop'
$taskRoot=$env:ROMDEX_U15_ROOT
$taskWork=Join-Path $taskRoot 'work/u15'
$taskHost=Get-Content -LiteralPath (Join-Path $taskWork 'host-state.json') -Raw | ConvertFrom-Json
$taskProfile=Join-Path $env:USERPROFILE 'AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON'
$taskOwner=Get-Content -LiteralPath (Join-Path $taskProfile 'desktop-owner.json') -Raw | ConvertFrom-Json
$taskProcess=Get-CimInstance Win32_Process -Filter ('ProcessId = '+$taskOwner.pid)
$taskExpected=(Join-Path $taskRoot 'work/u15-import.cjs').Replace('\','/')
if($taskProcess){
 if($taskProcess.Name -ne 'electron.exe' -or $taskProcess.ParentProcessId -ne $taskHost.pid -or -not $taskProcess.CommandLine.Replace('\','/').Contains($taskExpected)){throw 'The Import Process Identity Needs Review.'}
 Stop-Process -Id $taskProcess.ProcessId -Force
 Wait-Process -Id $taskProcess.ProcessId -Timeout 15 -ErrorAction SilentlyContinue
}
$taskCurrent=Get-Content -LiteralPath (Join-Path $taskProfile 'desktop-owner.json') -Raw | ConvertFrom-Json
if($taskCurrent.pid -eq $taskOwner.pid -and $taskCurrent.token -eq $taskOwner.token -and -not (Get-Process -Id $taskOwner.pid -ErrorAction SilentlyContinue)){Remove-Item -LiteralPath (Join-Path $taskProfile 'desktop-owner.json')}
`;
 await new Promise((resolve,reject)=>{const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{cwd:root,windowsHide:true,env:{...process.env,ROMDEX_U15_ROOT:root},stdio:'ignore'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('The Verified Import Window Needs Manual Review.')));});report.status='released-verified-import-only';
}catch(error){report.status='needs-review';report.message=error.message;process.exitCode=1;}finally{await fs.writeFile(path.join(work,'window-cleanup.json'),JSON.stringify(report,null,2));}
