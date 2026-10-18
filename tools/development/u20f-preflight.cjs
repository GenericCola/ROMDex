// Strictly GET-only. Never imports, writes a save, or changes live records.
const {app,safeStorage}=require('electron'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const work=path.resolve(__dirname,'u20f'),profile=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON'),sha=b=>createHash('sha256').update(b).digest('hex');
app.setPath('userData',path.join(work,'private-profile/session'));app.setPath('sessionData',path.join(work,'private-profile/session'));app.disableHardwareAcceleration();
const report={task:'U20F',mode:'Read-only preflight',startedAt:new Date().toISOString(),remoteWrites:0};let token;
app.whenReady().then(async()=>{
 const names=['service/connection.encrypted','cloud/github-connection.encrypted','updates/download-access.encrypted'],before={};for(const name of names)before[name]=sha(await fs.readFile(path.join(profile,name)));
 const config=JSON.parse(await fs.readFile(path.join(profile,'cloud/content-provider.json'),'utf8'));assert.equal(config.state,'active');assert.equal(config.registryIssueId,'3-376');
 const envelope=JSON.parse(await fs.readFile(path.join(profile,names[0]),'utf8'));assert.equal(envelope.format,'ROMDexElectronCredential/1');assert(safeStorage.isEncryptionAvailable());token=safeStorage.decryptString(Buffer.from(envelope.bytes,'base64'));
 const get=async route=>{const url=new URL(route,'https://thegobindsingh.youtrack.cloud');assert.equal(url.origin,'https://thegobindsingh.youtrack.cloud');assert(url.pathname.startsWith('/api/'));const r=await fetch(url,{method:'GET',redirect:'manual',headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(30000)});assert.equal(r.status,200);return r.json();};
 const me=await get('/api/users/me?fields=id,login,guest,banned');assert.equal(me.id,'2-2');assert.equal(me.login,'GenericCola');assert(!me.guest&&!me.banned);
 const project=await get('/api/admin/projects/0-2?fields=id,shortName,name');assert.equal(project.shortName,'NPCD');
 const registry=await get('/api/issues/3-376?fields=id,project(id),reporter(id),visibility(permittedUsers(id),permittedGroups(id))');assert.equal(registry.project.id,'0-2');assert.equal(registry.reporter.id,'2-2');assert.deepEqual(registry.visibility.permittedUsers.map(u=>u.id),['2-2']);assert.equal(registry.visibility.permittedGroups.length,0);
 report.activeProvider={workspace:config.workspace,registryIssueId:config.registryIssueId,bootstrapPublication:config.bootstrapPublication};report.owner=me.login;report.project=project.shortName;
 for(const name of names)assert.equal(sha(await fs.readFile(path.join(profile,name))),before[name]);report.credentialCiphertextUnchanged=true;report.status='passed';
}).catch(error=>{report.status='needs-review';report.error={name:error.name,message:'Read-only provider/connection preflight did not complete.'};}).finally(async()=>{token=null;report.finishedAt=new Date().toISOString();await fs.writeFile(path.join(work,'preflight.json'),JSON.stringify(report,null,2));app.exit(report.status==='passed'?0:1);});
