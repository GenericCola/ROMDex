import fs from 'node:fs/promises';import path from 'node:path';
const root=path.resolve('work/u13a'),archive=path.join(root,'validation-uninstall-path');
await fs.mkdir(archive);
const names=['packages','make-0.5.0','make-0.5.1','build-0.5.0.json','build-0.5.1.json','build-0.5.0.log','build-0.5.1.log','installed-test','windows-verification.json','windows-phase.json','qa-startup.json'];
for(const name of await fs.readdir(root))if(/^(uninstall|install)-.*\.log(?:\.console)?$/.test(name))names.push(name);
for(const name of names){const source=path.resolve(root,name),target=path.resolve(archive,name);if(!source.startsWith(root+path.sep)||!target.startsWith(archive+path.sep))throw Error('Unsafe Archive Path');try{await fs.rename(source,target);}catch(error){if(error.code!=='ENOENT')throw error;}}
console.log('Archived failed fixture lifecycle and builds; no user profile moved.');
