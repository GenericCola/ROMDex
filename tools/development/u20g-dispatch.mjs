import fs from 'node:fs/promises';import path from 'node:path';import {createHash,randomUUID} from 'node:crypto';
const script=path.resolve(process.argv[2]);if(path.dirname(script)!==path.resolve('work')||!/^u20g-[a-z0-9-]+\.(mjs|cjs)$/.test(path.basename(script)))throw Error('Unreviewed task path');
const job={id:randomUUID(),task:'U20G',at:Date.now(),script,reviewedSha256:createHash('sha256').update(await fs.readFile(script)).digest('hex')};await fs.writeFile('work/u20g/next-job.json',JSON.stringify(job));console.log(JSON.stringify({id:job.id,script:path.basename(script)}));
