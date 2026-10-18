import fs from 'node:fs';const root='outputs/ROMDex/';function edit(file,a,b){const s=fs.readFileSync(root+file,'utf8');if(!s.includes(a))throw Error(file);fs.writeFileSync(root+file,s.replace(a,b));}
edit('content/preview.js',"if(!window.romdexContentAPI)setInterval(()=>refresh(),1500)","if(!window.romdexContentAPI)setInterval(()=>refresh(),10000)");
edit('content/catalog.mjs',"/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/.test(bundle.createdAt)","/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/.test(bundle.createdAt)&&Number.isFinite(Date.parse(bundle.createdAt))&&new Date(bundle.createdAt).toISOString()===bundle.createdAt");
edit('content/cache.mjs',"value.artifacts=[];}return value;", "value.artifacts=[];}if(value.catalogArtifacts)value.artifacts=[];return value;");
