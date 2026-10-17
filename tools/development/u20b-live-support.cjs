// U20B fixture-only transport. No existing issue may be mutated through this helper.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{createHash,randomUUID}=require('node:crypto');
const BASE='https://thegobindsingh.youtrack.cloud';
const sha=b=>createHash('sha256').update(b).digest('hex');
const issueFields='id,idReadable,summary,description,project(id,shortName),reporter(id,login),commentsCount,visibility(permittedUsers(id,login),permittedGroups(id,name)),links(id,direction,linkType(name,sourceToTarget,targetToSource),issues(id,idReadable))';
const attachmentFields='id,name,size,mimeType,created,updated,removed,draft,author(id,login),url';
async function saveJSON(file,value){const temp=file+'.stage';const handle=await fs.open(temp,'w');try{await handle.writeFile(JSON.stringify(value,null,2)+'\n');await handle.sync();}finally{await handle.close();}await fs.rename(temp,file);}
async function readBounded(response,limit){let total=0;const parts=[];if(!response.body)return Buffer.alloc(0);for await(const chunk of response.body){total+=chunk.byteLength;if(total>limit)throw Error('Response exceeds the reviewed limit');parts.push(Buffer.from(chunk));}return Buffer.concat(parts);}
class FixtureAPI{
 constructor({token,state,save,fetchImpl=fetch}){this.token=token;this.state=state;this.save=save;this.fetch=fetchImpl;this.requests=[];}
 async request(method,route,body,{anonymous=false,maxBytes=4*1024*1024}={}){
  const url=new URL(route,BASE);assert.equal(url.origin,BASE);assert(url.pathname.startsWith('/api/'),'Unexpected API route');
  if(method!=='GET'){
   if(method==='POST'&&url.pathname==='/api/issues'){assert(body&&this.state.projectIds.includes(body.project?.id),'Unapproved creation project');assert(body.description.includes(this.state.marker),'Missing fixture marker');assert(body.summary.startsWith('[ROMDex U20B QA]'),'Missing fixture summary');assert.deepEqual(body.visibility,{$type:'LimitedVisibility',permittedUsers:[{id:'2-2'}],permittedGroups:[]});}
   else{const match=url.pathname.match(/^\/api\/issues\/([^/]+)(.*)$/);assert(match,'Mutation route refused');assert(Object.values(this.state.issues).some(i=>i.id===match[1]),'Existing/nonfixture issue mutation refused');assert(method==='POST'&&/^\/(attachments|links\/[-\w]+\/issues)$/.test(match[2])||method==='DELETE'&&match[2]==='','Unreviewed issue mutation refused');if(match[2].startsWith('/links/'))assert(Object.values(this.state.issues).some(i=>i.id===body?.id),'Link to an existing/nonfixture issue refused');}
  }
  const form=body instanceof FormData;const response=await this.fetch(url,{method,redirect:'manual',headers:{Accept:'application/json',...(!anonymous?{Authorization:'Bearer '+this.token}:{}),...(body&&!form?{'Content-Type':'application/json'}:{})},body:body?form?body:JSON.stringify(body):undefined,signal:AbortSignal.timeout(form?90000:25000)});
  const bytes=await readBounded(response,maxBytes);let data;try{data=JSON.parse(bytes.toString('utf8'));}catch{}
  this.requests.push({method,path:url.pathname,status:response.status,anonymous});
  if(!response.ok){const error=new Error('Reviewed YouTrack request returned '+response.status);error.status=response.status;error.apiReason=String(data?.error_description||data?.error||'').replace(/perm:[A-Za-z0-9._=-]+/g,'[redacted]').slice(0,250);throw error;}return data;
 }
 async list(route,{pageSize=2,maxPages=100}={}){const all=[];for(let page=0;page<maxPages;page++){const part=await this.request('GET',route+(route.includes('?')?'&':'?')+'$top='+pageSize+'&$skip='+page*pageSize);assert(Array.isArray(part),'Expected paginated array');assert(part.length<=pageSize,'Server did not respect requested page size');all.push(...part);if(part.length<pageSize){assert.equal(new Set(all.map(x=>x.id)).size,all.length,'Unstable pagination needs another full sweep');return all;}}throw Error('Incomplete bounded enumeration');}
 async requireFixture(id){assert(Object.values(this.state.issues).some(i=>i.id===id),'Unpinned issue');const issue=await this.request('GET','/api/issues/'+encodeURIComponent(id)+'?fields='+encodeURIComponent(issueFields));assert.equal(issue.reporter?.id,'2-2');assert(this.state.projectIds.includes(issue.project?.id));assert(issue.description?.includes(this.state.marker));assert(issue.summary?.startsWith('[ROMDex U20B QA]'));return issue;}
 async create(key,project){
  if(this.state.issues[key]){await this.requireFixture(this.state.issues[key].id);return this.state.issues[key];}
  assert(this.state.projectIds.includes(project.id));const op=this.state.marker+'/'+key;
  const found=await this.list('/api/issues?query='+encodeURIComponent('project: '+project.shortName+' "'+op+'"')+'&fields='+encodeURIComponent(issueFields),{pageSize:20});
  const exact=found.filter(i=>i.project?.id===project.id&&i.reporter?.id==='2-2'&&i.description?.includes(op));assert(exact.length<=1,'Duplicate fixture creation needs review');
  if(exact.length===1){this.state.issues[key]={id:exact[0].id,idReadable:exact[0].idReadable,projectId:project.id};await this.save();await this.requireFixture(exact[0].id);return this.state.issues[key];}
  if(this.state.creationIntents[key])throw Error('Uncertain issue creation remains unresolved; no blind retry');
  this.state.creationIntents[key]={operation:op,projectId:project.id,at:new Date().toISOString()};await this.save();
  const issue=await this.request('POST','/api/issues?fields='+encodeURIComponent(issueFields),{project:{id:project.id},summary:'[ROMDex U20B QA] '+key,description:this.state.marker+'\nOperation: '+op+'\nSynthetic storage verification only. Not real NPCDex data or an agent work request.',visibility:{$type:'LimitedVisibility',permittedUsers:[{id:'2-2'}],permittedGroups:[]}});
  this.state.issues[key]={id:issue.id,idReadable:issue.idReadable,projectId:project.id};await this.save();await this.requireFixture(issue.id);return this.state.issues[key];
 }
 async attachments(id){await this.requireFixture(id);return (await this.list('/api/issues/'+id+'/attachments?fields='+encodeURIComponent(attachmentFields))).filter(a=>!a.removed&&!a.draft);}
 async download(id,attachmentId,{anonymous=false}={}){
  const metadata=(await this.attachments(id)).find(a=>a.id===attachmentId);assert(metadata,'Missing pinned attachment');assert.equal(metadata.author?.id,'2-2','Actual attachment author differs');assert(metadata.size<=1024*1024,'Unexpected fixture attachment size');
  const url=new URL(metadata.url,BASE);assert.equal(url.origin,BASE,'Attachment redirect/foreign URL refused');assert(url.pathname.startsWith('/api/files/'),'Unexpected file route');
  const response=await this.fetch(url,{method:'GET',redirect:'manual',headers:anonymous?{}:{Authorization:'Bearer '+this.token},signal:AbortSignal.timeout(25000)});this.requests.push({method:'GET',path:'/api/files/[signed-url-omitted]',status:response.status,anonymous});
  const bytes=await readBounded(response,1024*1024);if(!response.ok){const error=new Error('Attachment read returned '+response.status);error.status=response.status;throw error;}assert.equal(bytes.length,metadata.size);return {metadata,bytes};
 }
 async upload(key,issue,bytes,name,{discardResponse=false,allowPhysicalDuplicate=false}={}){
  await this.requireFixture(issue.id);assert(Buffer.isBuffer(bytes)&&bytes.length<=512*1024,'Fixture upload exceeds reviewed size');const expected=sha(bytes),op=this.state.marker+'/upload/'+key;
  if(this.state.uploads[key]&&!allowPhysicalDuplicate){const saved=this.state.uploads[key];assert.equal(saved.sha256,expected);const read=await this.download(issue.id,saved.id);assert.equal(sha(read.bytes),expected);return saved;}
  if(this.state.uploadIntents[key]&&!allowPhysicalDuplicate){const prior=this.state.uploadIntents[key];assert.equal(prior.issueId,issue.id);assert.equal(prior.sha256,expected);assert.equal(prior.name,name);return (await this.rediscover(key,bytes))[0];}
  this.state.uploadIntents[key]={operation:op,issueId:issue.id,name,sha256:expected,bytes:bytes.length};await this.save();
  const form=new FormData();form.append('upload1',new Blob([bytes],{type:name.endsWith('.json')?'application/json':'application/octet-stream'}),name);
  const response=await this.request('POST','/api/issues/'+issue.id+'/attachments?fields='+encodeURIComponent(attachmentFields),form);
  assert(Array.isArray(response)&&response.length===1,'Unexpected multipart result');const a=response[0];assert.equal(a.author?.id,'2-2');assert.equal(a.size,bytes.length);
  if(discardResponse){this.state.discardedResponses=(this.state.discardedResponses||0)+1;await this.save();return null;}
  const saved={id:a.id,issueId:issue.id,name:a.name,sha256:expected,bytes:bytes.length};this.state.uploads[key]=saved;await this.save();const read=await this.download(issue.id,a.id);assert.equal(sha(read.bytes),expected);return saved;
 }
 async rediscover(key,expectedBytes){const intent=this.state.uploadIntents[key];assert(intent);const candidates=(await this.attachments(intent.issueId)).filter(a=>a.name===intent.name&&a.size===intent.bytes);const matches=[];for(const candidate of candidates){const read=await this.download(intent.issueId,candidate.id);if(sha(read.bytes)===intent.sha256&&read.bytes.equals(expectedBytes))matches.push({id:candidate.id,issueId:intent.issueId,name:candidate.name,sha256:intent.sha256,bytes:intent.bytes});}assert(matches.length>=1,'Accepted upload not rediscovered; no blind retry');this.state.uploads[key]=matches[0];await this.save();return matches;}
}
async function start(run){
 const {app,safeStorage}=require('electron');const root=path.resolve(__dirname,'..'),work=path.join(root,'work/u20b'),session=path.join(work,'private-profile/session'),profile=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON');app.setPath('userData',session);app.setPath('sessionData',session);app.disableHardwareAcceleration();
 const report={task:'U20B',startedAt:new Date().toISOString(),checks:[],credentialsLogged:false};let api;const before={};
 app.whenReady().then(async()=>{
  assert(safeStorage.isEncryptionAvailable(),'Windows protection required');for(const name of ['service/connection.encrypted','cloud/github-connection.encrypted','updates/download-access.encrypted'])before[name]=sha(await fs.readFile(path.join(profile,name)));
  const preflight=JSON.parse(await fs.readFile(path.join(work,'content-preflight.json'),'utf8'));assert.equal(preflight.status,'inspected');assert.equal(preflight.project?.shortName,'NPCD');assert.equal(preflight.owner?.id,'2-2');
  let state;try{state=JSON.parse(await fs.readFile(path.join(work,'live-state.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;const runId=randomUUID();state={task:'U20B',runId,marker:'ROMDexU20BFixture/'+runId,workspace:'fixture:workspace',project:preflight.project,pmon:preflight.pmon,projectIds:[preflight.project.id,preflight.pmon.id],issues:{},creationIntents:{},uploads:{},uploadIntents:{},checks:[],createdAt:new Date().toISOString()};}
  assert.equal(state.project.id,preflight.project.id);let saving=Promise.resolve();const save=()=>{const snapshot=JSON.parse(JSON.stringify(state));saving=saving.then(()=>saveJSON(path.join(work,'live-state.json'),snapshot));return saving;};await save();const envelope=JSON.parse(await fs.readFile(path.join(profile,'service/connection.encrypted'),'utf8'));assert.equal(envelope.format,'ROMDexElectronCredential/1');const token=safeStorage.decryptString(Buffer.from(envelope.bytes,'base64'));api=new FixtureAPI({token,state,save});const me=await api.request('GET','/api/users/me?fields=id,login');assert.equal(me.id,'2-2');assert.equal(me.login,'GenericCola');
  report.runId=state.runId;report.project={id:state.project.id,key:'NPCD',name:state.project.name,leader:state.project.leader?.login};await run({api,state,save,work,root,report,assert,sha,saveJSON});
  for(const [name,hash]of Object.entries(before))assert.equal(sha(await fs.readFile(path.join(profile,name))),hash,'Remembered credential changed');report.allThreeCredentialFilesUnchanged=true;report.status='passed';
 }).catch(e=>{report.status='needs-review';report.error={name:e.name,message:e.message,status:e.status,apiReason:e.apiReason};}).finally(async()=>{if(api){report.requests=api.requests;api.token=null;}report.finishedAt=new Date().toISOString();const reportName=path.basename(process.argv[1]).replace(/^u20b-/,'').replace(/\.cjs$/,'.json');await saveJSON(path.join(work,reportName),report);app.exit(report.status==='passed'?0:1);});
}
module.exports={FixtureAPI,start,sha,saveJSON,readBounded,issueFields,attachmentFields};
