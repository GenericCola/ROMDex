// Consistent online SQLite backup; source connection is read-only, originals untouched.
import fs from 'node:fs';import path from 'node:path';import {DatabaseSync,backup} from 'node:sqlite';import {sha} from '../outputs/ROMDex/content/contracts.mjs';
const captureName=process.argv[2]||'capture';if(!/^capture(?:-[0-9]+)?$/.test(captureName))throw Error('Invalid capture destination');
const profile=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON'),dir=path.resolve('work/u20e/private-profile',captureName);fs.mkdirSync(dir,{recursive:true});
const source=new DatabaseSync(path.join(profile,'cloud/runtime/npcdex.sqlite'),{readOnly:true});
try{await backup(source,path.join(dir,'npcdex.sqlite'));}finally{source.close();}
const files=['service/npcdex-current.json','service/npcdex-recovery-draft.json','service/sync-settings.json','cloud/npcdex-import.json'];const manifest=[];
for(const file of files){const bytes=fs.readFileSync(path.join(profile,file)),name=path.basename(file);fs.writeFileSync(path.join(dir,name),bytes);manifest.push({name,bytes:bytes.length,sha256:sha(bytes)});}
const db=new DatabaseSync(path.join(dir,'npcdex.sqlite'),{readOnly:true});try{const doc=Buffer.from(db.prepare("SELECT bytes FROM documents WHERE key='current'").get().bytes),state=JSON.parse(db.prepare("SELECT value FROM meta WHERE key='state'").get().value);fs.writeFileSync(path.join(dir,'journal-current.json'),doc);fs.writeFileSync(path.join(dir,'capture.json'),JSON.stringify({format:'ROMDexU20ECapture/1',at:new Date().toISOString(),files:manifest,document:{sha256:sha(doc),bytes:doc.length,revision:JSON.parse(doc).revision},state,queue:db.prepare('SELECT id,phase,attempts FROM outbox').all()},null,2));}finally{db.close();}
