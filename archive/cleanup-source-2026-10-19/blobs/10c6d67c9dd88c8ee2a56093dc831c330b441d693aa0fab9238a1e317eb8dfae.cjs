const fs=require('fs'),cp=require('child_process');
const dir='outputs/iterations/npcdex-v2.30';
for(const name of ['npcdex.html','npcdex-template.html','build-npcdex.cjs','npcdex-preview.png','standard-notes-suite-preview.png'])fs.copyFileSync('outputs/'+name,dir+'/'+name);
fs.writeFileSync(dir+'/ITERATION.md','# NPCDex 2.30\n\nShared controls and status styles; aligned verification/status controls; bottom-anchored tile tags. Single-pass package assembly and cached flag lookup per tile. Browser layout, responsiveness, save/reopen and export checks passed.\n');
cp.execFileSync('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',['work/zip-package.py',dir,'outputs/npcdex-v2.30.zip'],{stdio:'inherit'});
console.log('Final 2.30 package synchronized.');
