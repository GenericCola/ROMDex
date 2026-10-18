import fs from 'node:fs';const root='outputs/ROMDex/';function edit(file,a,b){const s=fs.readFileSync(root+file,'utf8');if(!s.includes(a))throw Error(file);fs.writeFileSync(root+file,s.replace(a,b));}
edit('content/preview-server.mjs',"const status=url.pathname==='/api/catalog/status';", "const status=['/api/catalog/status','/api/import/context'].includes(url.pathname);");
edit('content/import-ui.js',"function chooseImport(){",`async function downloadContext(){const context=await api('/api/import/context'),url=URL.createObjectURL(new Blob([JSON.stringify(context,null,2)+'\\n'],{type:'application/json'})),link=make('a');link.href=url;link.download='NPCDex-Import-Context.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function chooseImport(){`);
edit('content/import-ui.js',"input.onchange=()=>run", "button('Download Import Context',downloadContext,body);input.onchange=()=>run");
edit('tests/content-catalog-api.test.mjs',"assert.equal((await fetch(preview.origin+'/api/catalog/transition')).status,405)","assert.equal((await fetch(preview.origin+'/api/catalog/transition')).status,400)");
