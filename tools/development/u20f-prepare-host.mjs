import fs from 'node:fs/promises';
const host=(await fs.readFile('work/u20e-host.mjs','utf8')).replaceAll('U20E','U20F').replaceAll('u20e','u20f').replace('u20f-capture.cjs','u20f-preflight.cjs').replace('Read-only latest local and cloud save capture','Read-only active content and connection inspection');
await fs.writeFile('work/u20f-host.mjs',host);
await fs.writeFile('outputs/Launch-U20F-Verification.cmd',(await fs.readFile('outputs/Launch-U20E-Verification.cmd','utf8')).replaceAll('u20e','u20f'));
