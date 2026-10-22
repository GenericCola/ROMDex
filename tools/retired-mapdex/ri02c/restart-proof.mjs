import fs from 'node:fs/promises';import path from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const work=path.resolve('work/ri02c'),stateFile=path.join(work,'host-state.json'),target=path.join(work,'verify-live.cjs'),expectedExe=path.resolve('work/u10/runtime/electron/electron.exe'),literal=s=>"'"+s.replaceAll("'","''")+"'",report={task:'RI02C',productionProcessesTouched:false};
function ps(script){const result=spawnSync('powershell.exe',['-NoProfile','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{encoding:'utf8',windowsHide:true});if(result.status!==0)throw Error((result.stderr||result.stdout||'Windows process access unavailable').trim());return result.stdout.trim();}
try{
 const host=JSON.parse(await fs.readFile(stateFile));assert.equal(host.task,'RI02C');assert(Number.isSafeInteger(host.pid));const job=JSON.parse(await fs.readFile(path.join(work,'job.json')));assert.equal(path.resolve(job.file),target);assert.equal(job.task,'RI02C');
 const predicate="$_.ParentProcessId -eq "+host.pid+" -and $_.ExecutablePath -eq "+literal(expectedExe)+" -and $_.CommandLine.Contains("+literal(target)+") -and $_.CommandLine -notmatch '--type='";
 const find="$ErrorActionPreference='Stop';$rows=@(Get-CimInstance Win32_Process -Filter \"Name='electron.exe'\" | Where-Object {"+predicate+"});";
 const raw=ps(find+"$rows | Select-Object ProcessId,ParentProcessId | ConvertTo-Json -Compress");const candidate=raw?JSON.parse(raw):null;
 if(candidate){assert(!Array.isArray(candidate),'Exactly one owned main test process is required');assert.equal(candidate.ParentProcessId,host.pid);const deadline=Date.now()+240000;let checkpoint;
  while(Date.now()<deadline){const current=JSON.parse(await fs.readFile(path.join(work,'live-checkpoint.json')));if(Date.now()-Date.parse(current.at)<1500&&!current.held){checkpoint=current;break;}await new Promise(r=>setTimeout(r,250));}
  assert(checkpoint,'No fresh durable checkpoint; nothing stopped');assert.equal(checkpoint.records.length,134);
  // Immediately after a saved checkpoint the next cycle starts with read-only
  // registry/native checks. Stop only this disposable proof at that boundary.
  ps(find+"if($rows.Count -ne 1 -or $rows[0].ProcessId -ne "+candidate.ProcessId+"){throw 'Owned test identity changed'};Stop-Process -Id $rows[0].ProcessId -Force");report.stoppedOwnedTestPid=candidate.ProcessId;report.checkpoint={at:checkpoint.at,cycle:checkpoint.cycle,verifiedSlots:checkpoint.verifiedSlots};
 }
 const deadline=Date.now()+15000;while(Date.now()<deadline){const host=JSON.parse(await fs.readFile(stateFile));if(host.phase.startsWith('Waiting after '))break;await new Promise(r=>setTimeout(r,250));}
 assert((JSON.parse(await fs.readFile(stateFile))).phase.startsWith('Waiting after '));const bytes=await fs.readFile(target);await fs.writeFile(path.join(work,'job.json'),JSON.stringify({id:'ri02c-live-optimized-'+Date.now(),task:'RI02C',file:target,sha256:createHash('sha256').update(bytes).digest('hex'),at:Date.now()}));report.status='resumed-isolated-proof';
}catch(e){report.status='needs-normal-windows-launch';report.error=e.message;process.exitCode=1;}finally{await fs.writeFile(path.join(work,'restart-proof.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
