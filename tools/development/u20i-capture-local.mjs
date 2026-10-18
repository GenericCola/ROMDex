// Consistent read-only SQLite capture; no credential access, remote request or live write.
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import{DatabaseSync}from'node:sqlite';import{createHash}from'node:crypto';import{secureDirectory}from'../outputs/ROMDex/desktop/migration.mjs';
const work=path.resolve('work/u20i'),dir=path.join(work,'private-data'),profile=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON'),sha=b=>createHash('sha256').update(b).digest('hex');await secureDirectory(dir);const db=new DatabaseSync(path.join(profile,'cloud/content/content.sqlite'),{readOnly:true});let report;
try{
 db.exec('PRAGMA busy_timeout=5000; BEGIN;');
 const object=hash=>{const row=db.prepare('SELECT bytes FROM objects WHERE hash=?').get(hash);assert(row);const bytes=Buffer.from(row.bytes);assert.equal(sha(bytes),hash);return bytes;};
 const state=key=>{const row=db.prepare('SELECT bytes,hash FROM state WHERE key=?').get(key);if(!row)return null;const bytes=Buffer.from(row.bytes);assert.equal(sha(bytes),row.hash);return JSON.parse(bytes);};
 const unpack=refs=>{assert.equal(refs.format,'ROMDexContentDomainRefs/1');return Object.fromEntries(Object.entries(refs.collections).map(([key,hashes])=>[key,hashes.map(hash=>JSON.parse(object(hash)))]));};
 const accepted=state('accepted'),domain=unpack(state('domain:'+accepted.head)),journal=state('edit-journal')||[];let working=domain,workingHead=accepted.head;
 for(const op of journal){if(['committed','cancelled','blocked'].includes(op.state))continue;if(op.publication.parentPublications.length===1&&op.publication.parentPublications[0]===workingHead){workingHead=op.publication.digest;working=op.preview.format==='ROMDexContentDomainRefs/1'?unpack(op.preview):op.preview;}}
 for(const [name,value]of Object.entries({'domain':domain,'working-domain':working,'accepted':accepted,'editor-draft':state('editor-draft'),'edit-journal':journal}))await fs.writeFile(path.join(dir,name+'.json'),JSON.stringify(value));
 await fs.mkdir(path.join(dir,'assets'),{recursive:true});for(const asset of [...domain.assets,...working.assets])await fs.writeFile(path.join(dir,'assets',asset.sha256),object(asset.sha256));
 const sync=JSON.parse(await fs.readFile(path.join(profile,'service/sync-settings.json'),'utf8'));
 report={task:'U20I',status:'captured',at:new Date().toISOString(),readOnly:true,remoteWrites:0,credentialAccess:false,head:accepted.head,workingHead,revision:accepted.snapshot.revision,records:domain.records.length,assets:working.assets.length,pending:journal.filter(x=>!['committed','cancelled'].includes(x.state)).length,review:(state('review')||[]).length,automaticSyncEnabled:sync.enabled};
}finally{db.close();}
await fs.writeFile(path.join(work,'local-capture.json'),JSON.stringify(report,null,2));
