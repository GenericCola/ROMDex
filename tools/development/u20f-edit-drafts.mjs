import fs from 'node:fs/promises';
const file='outputs/ROMDex/content/editor-ui.js';let text=await fs.readFile(file,'utf8');
for(const [from,to]of [
 ['draftActive=false,draftFailure=null','draftActive=false,draftTouched=false,draftFailure=null'],
 ["if(!draftActive||mode==='recovery')return;","if(!draftActive||!draftTouched||mode==='recovery')return;"],
 ['const schedule=()=>{clearTimeout(draftTimer);','const schedule=()=>{draftTouched=true;clearTimeout(draftTimer);'],
 ["context=await api('/api/editor');draftVersion=", "context=await api('/api/editor');if(type!=='recovery'&&context.draft?.draft){if(context.draft.draft.mode===type)restore=true;else{return open('recovery');}}draftVersion="],
 ['mode=type;draftActive=false;draftFailure=null;','mode=type;draftActive=false;draftTouched=false;draftFailure=null;'],
 ["if(restore&&context.draft?.draft?.mode===type){picker.value=", "if(restore&&context.draft?.draft?.mode===type){draftTouched=true;picker.value="]
]){if(!text.includes(from))throw Error('Missing draft patch '+from);text=text.replace(from,to);}
await fs.writeFile(file,text);
await fs.appendFile('outputs/ROMDex/content/native.css','\n.content-editor-dialog label[hidden]{display:none}\n');
