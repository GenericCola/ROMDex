const fs=require('fs'),cp=require('child_process');
const [version,description]=process.argv.slice(2);if(!version||!description)throw Error('Version and description required');
const dir='outputs/iterations/npcdex-v'+version;fs.mkdirSync(dir,{recursive:true});
const names=fs.readdirSync('outputs').filter(n=>/^(npcdex\.(html)|npcdex-(data|agent-export)\.json|npcdex-(template\.html|change-engine\.js|planning-ui\.js|prompt-migration\.js|inline-status\.js|standard-notes-suite\.js)|build-npcdex\.cjs|update-npcdex\.cjs|.*\.md|.*-preview\.png)$/.test(n));
for(const name of names)fs.copyFileSync('outputs/'+name,dir+'/'+name);
fs.writeFileSync(dir+'/ITERATION.md',`# NPCDex ${version}\n\n${description}\n\nStandalone cumulative package.\n`);
cp.execFileSync('C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',['work/zip-package.py',dir,'outputs/npcdex-v'+version+'.zip'],{stdio:'inherit'});console.log('Packaged '+version);
