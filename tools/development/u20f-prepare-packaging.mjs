import fs from 'node:fs/promises';
let packageScript=(await fs.readFile('work/u20e-package.mjs','utf8')).replaceAll('u20e','u20f').replaceAll('U20E','U20F').replaceAll('0.5.8','0.5.9').replaceAll('-r4','-r1');
packageScript=packageScript.replace("files.add('U19-Shared-Sync-Guide.md');", "files.add('U19-Shared-Sync-Guide.md');files.add('U20F-Content-Backend-Guide.md');");
await fs.writeFile('work/u20f-package.mjs',packageScript);
let build=(await fs.readFile('work/u20e-build-candidate.mjs','utf8')).replaceAll('u20e','u20f').replaceAll('U20E','U20F').replaceAll('0.5.8','0.5.9').replaceAll('-r4','-r1').replaceAll('U20F-Migration-Candidate','ROMDex-Installer-0.5.9');
await fs.writeFile('work/u20f-build-candidate.mjs',build);
await fs.copyFile('outputs/U20F-Content-Backend-Guide.md','outputs/ROMDex/U20F-Content-Backend-Guide.md');
