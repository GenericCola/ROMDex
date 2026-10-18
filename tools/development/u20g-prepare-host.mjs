import fs from 'node:fs/promises';
await fs.writeFile('work/u20g-host.mjs',(await fs.readFile('work/u20f-host.mjs','utf8')).replaceAll('U20F','U20G').replaceAll('u20f','u20g').replace(" const processed=new Set()"," await phase('Opening isolated contextual form review');await run(path.resolve('work/u20g-open-ui.mjs'));\n const processed=new Set()"));
await fs.writeFile('work/u20g-preflight.cjs',(await fs.readFile('work/u20f-preflight.cjs','utf8')).replaceAll('U20F','U20G').replaceAll('u20f','u20g'));
await fs.writeFile('work/u20g-dispatch.mjs',(await fs.readFile('work/u20f-dispatch.mjs','utf8')).replaceAll('U20F','U20G').replaceAll('u20f','u20g'));
await fs.writeFile('outputs/Launch-U20G-Verification.cmd',(await fs.readFile('outputs/Launch-U20F-Verification.cmd','utf8')).replaceAll('u20f','u20g'));
