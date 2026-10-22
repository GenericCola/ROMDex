import {DatabaseSync} from 'node:sqlite';
const db=new DatabaseSync(process.argv[2]||'work/ri02c/private-profile/live-proof-data/RDX/documents.sqlite',{readOnly:true});
console.log(JSON.stringify({cachedObjects:db.prepare('SELECT COUNT(*) AS n FROM blobs').get().n}));
for(const row of db.prepare("SELECT key,value FROM map_ui WHERE key LIKE 'cloud:%'").all()){
 const s=JSON.parse(Buffer.from(row.value).toString('utf8')),document=db.prepare('SELECT head FROM documents WHERE key=?').get(row.key.slice(6));console.log(JSON.stringify({published:!!s.publishedRevision,localMatchesPublished:s.publishedRevision===document?.head,intent:!!s.intent,slots:Object.values(s.intent?.slots||{}).length,verified:Object.values(s.intent?.slots||{}).filter(v=>v.verified).length,error:s.error,review:s.review?.kind,reviewCount:s.review?.changes?.length,held:s.held,lastChecked:s.lastChecked,connection:s.connection,stalled:s.stalled}));
}
db.close();
