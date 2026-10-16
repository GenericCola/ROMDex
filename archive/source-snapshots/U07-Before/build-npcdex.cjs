const fs=require('fs'),path=require('path'),vm=require('vm');
const root=__dirname,read=name=>fs.readFileSync(path.join(root,name),'utf8');
// Assemble in one pass, avoiding repeated copies of the embedded image/data payload.
const modules={CHANGE_ENGINE:'npcdex-change-engine.js',PLANNING_UI:'npcdex-planning-ui.js',PROMPT_MIGRATION:'npcdex-prompt-migration.js',INLINE_STATUS:'npcdex-inline-status.js',STANDARD_SUITE:'npcdex-standard-notes-suite.js'};
const parts=Object.fromEntries(Object.entries(modules).map(([key,file])=>[key,read(file)]));
parts.NPCDEX_DATA=JSON.stringify(JSON.parse(read('npcdex-data.json'))).replace(/</g,'\\u003c');
const seen=new Set();
const html=read('npcdex-template.html').replace(/\/\*__(\w+)__\*\//g,(_,key)=>{if(!(key in parts)||seen.has(key))throw Error('Invalid or duplicate build placeholder: '+key);seen.add(key);return parts[key]});
for(const key of Object.keys(parts))if(!seen.has(key))throw Error('Missing build placeholder: '+key);
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.writeFileSync(path.join(root,'npcdex.html'),html);console.log('Built and syntax-checked npcdex.html');
