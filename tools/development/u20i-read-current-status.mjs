import fs from 'node:fs/promises';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
const profile=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON');
const db=new DatabaseSync(path.join(profile,'cloud/content/content.sqlite'),{readOnly:true});
try {
 db.exec('PRAGMA busy_timeout=5000; BEGIN;');
 const get=key=>{const row=db.prepare('SELECT bytes FROM state WHERE key=?').get(key);return row?JSON.parse(Buffer.from(row.bytes)):null;};
 const ops=(get('edit-journal')||[]).filter(o=>!['committed','cancelled'].includes(o.state));
 const report={at:new Date().toISOString(),remoteWrites:0,reviewCount:(get('review')||[]).length,acceptedHead:get('accepted')?.head,operations:ops.map(o=>({id:o.id,state:o.state,error:o.error,errorCode:o.errorCode||null,recovery:o.recovery||null,slots:Object.entries(o.slots).map(([key,s])=>({key,state:s.state,kind:s.kind,bytes:s.bytes||null}))}))};
 db.exec('COMMIT;');
 await fs.writeFile('work/u20i-bound/current-sync-status.json',JSON.stringify(report,null,2));
} finally {db.close();}
