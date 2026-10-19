// Snapshot the live cache through SQLite's backup API. Remote requests are GETs;
// all ContentReader state writes go to a protected, separate cache copy.
const {app,safeStorage}=require('electron'),fs=require('original-fs').promises,path=require('node:path'),assert=require('node:assert/strict'),{DatabaseSync,backup}=require('node:sqlite'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../..'),work=path.join(root,'work/rd10'),privateRoot=path.join(work,'private-profile'),live=path.join(process.env.LOCALAPPDATA,'ROMDexDesktop/Data/thegobindsingh-PMON'),copy=path.join(privateRoot,'capture/ROMDexDesktop/Data/thegobindsingh-PMON');
app.setPath('userData',path.join(privateRoot,'session'));app.disableHardwareAcceleration();
const report={task:'RD10',stage:'Read-Only Authoritative Capture',startedAt:new Date().toISOString(),remoteWrites:0,liveDataWrites:0};let provider;
app.whenReady().then(async()=>{
 const load=file=>import(pathToFileURL(path.join(root,'outputs/ROMDex',file))),{sha,canonical}=await load('content/contracts.mjs');
 await fs.mkdir(path.join(copy,'cloud/content'),{recursive:true});
 const db=new DatabaseSync(path.join(live,'cloud/content/content.sqlite'),{readOnly:true});try{await backup(db,path.join(copy,'cloud/content/content.sqlite'));}finally{db.close();}
 for(const file of ['cloud/content-provider.json','cloud/content/content-isolation.json'])await fs.copyFile(path.join(live,file),path.join(copy,file));
 const decode=text=>{let e=JSON.parse(text);while(typeof e==='string')e=JSON.parse(e);assert.equal(e.format,'ROMDexElectronCredential/1');return safeStorage.decryptString(Buffer.from(e.bytes,'base64'));};
 // The original encrypted token is read on demand, never copied into output.
 const credential=await fs.readFile(path.join(live,'service/connection.encrypted'),'utf8');
 const {openContentProvider}=await load('content/desktop-provider.mjs');provider=await openContentProvider({profile:path.join(copy,'service'),protect:async()=>decode(credential),enabled:()=>false,changed(){}});
 provider.reader.transport.credential=async()=>decode(credential);
 provider.reader.transport.fetch=async(...args)=>{try{return await fetch(...args);}catch(e){report.networkError={name:e.name,code:e.cause?.code||e.code||null,message:e.cause?.message||e.message};throw e;}};
 const before=provider.editor.working(),beforeView=provider.view(),remote=await provider.reader.cycle(true,{audit:false}),after=provider.editor.working(),domain=after.domain;
 assert.equal(remote.status.connection,'connected',remote.status.message);assert.equal(provider.editor.transport.writes,0);
 const publication=provider.cache.get('publication:'+remote.head),pending=provider.editor.operations().filter(o=>!['committed','cancelled'].includes(o.state));
 await fs.writeFile(path.join(privateRoot,'domain.json'),JSON.stringify(domain));await fs.writeFile(path.join(privateRoot,'bindings.json'),JSON.stringify(publication.carrier.bindings));
 await fs.writeFile(path.join(privateRoot,'source.json'),JSON.stringify({head:after.head,remoteHead:remote.head,draft:provider.cache.get('editor-draft'),pending,review:remote.review,authorization:provider.cache.get('handoff')}));
 await fs.mkdir(path.join(privateRoot,'assets'),{recursive:true});for(const a of domain.assets){const b=provider.cache.object(a.sha256);assert(b&&sha(b)===a.sha256);await fs.writeFile(path.join(privateRoot,'assets',a.sha256),b);}
 Object.assign(report,{status:'captured',head:after.head,remoteHead:remote.head,localHeadBefore:before.head,localHeadChanged:before.head!==after.head,localSnapshotSHA256:sha(canonical(beforeView.snapshot)),snapshotSHA256:sha(canonical(provider.view().snapshot)),domainSHA256:sha(canonical(domain)),records:domain.records.length,recordRevisions:domain.revisions.length,views:domain.views?.length||0,plans:domain.plans.length,reviews:domain.reviews.length,assets:domain.assets.length,assetBytes:domain.assets.reduce((n,a)=>n+a.bytes,0),bindings:publication.carrier.bindings.length,maps:domain.records.filter(r=>r.kind==='map').map(r=>({recordId:r.recordId,name:r.current.payload.name,issueId:publication.carrier.bindings.find(b=>b.recordId===r.recordId)?.issueId})),sharedCollections:domain.records.filter(r=>r.kind==='shared').map(r=>({recordId:r.recordId,name:r.current.payload.name,type:r.current.payload.sharedType})),pending:pending.map(o=>({id:o.id,state:o.state,description:o.description})),review:remote.review,requests:provider.reader.transport.requests,readBytes:provider.reader.transport.responseBytes});
}).catch(e=>{report.status='needs-review';report.error=e.message;}).finally(async()=>{await provider?.stop();provider?.cache.close();report.finishedAt=new Date().toISOString();await fs.writeFile(path.join(work,'capture-report.json'),JSON.stringify(report,null,2));app.exit(report.status==='captured'?0:1);});
