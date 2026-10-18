import fs from 'node:fs';const root='outputs/ROMDex/';function edit(file,a,b){const s=fs.readFileSync(root+file,'utf8');if(!s.includes(a))throw Error(file);fs.writeFileSync(root+file,s.replace(a,b));}
edit('content/writer.mjs',"parentRecordId:r.parentRecordId,new:!work.domain.records.some", "parentRecordId:r.parentRecordId,parentName:edit.preview.records.find(p=>p.recordId===r.parentRecordId)?.current.payload.name||null,new:!work.domain.records.some");
edit('content/import-ui.js',"['Action','Kind','Item']", "['Action','Kind','Item','Parent']");
edit('content/import-ui.js',"make('td',item.kind),make('td',item.name)","make('td',item.kind),make('td',item.name),make('td',item.parentName||item.parentRecordId||'Shared Profile')");
edit('content/import-ui.js',"dialog.addEventListener('cancel',e=>", "dialog.addEventListener('close',()=>window.romdexContentPreview.refresh(true));dialog.addEventListener('cancel',e=>");
