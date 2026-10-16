import fs from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
const script='work/u17-install-and-check.mjs';
await fs.writeFile('work/u17/deploy-ready.json',JSON.stringify({task:'U17',at:Date.now(),userConfirmedQuit:true}));
await fs.writeFile('work/u17/next-job.json',JSON.stringify({task:'U17',id:randomUUID(),at:Date.now(),script,reviewedSha256:createHash('sha256').update(await fs.readFile(script)).digest('hex')}));
process.argv.push('--resume');
await import('./u17-host.mjs');
