import {createHash} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';

export const CHUNK_BYTES=512*1024, DESCRIPTOR_BYTES=256*1024;
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const gitBlob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const gitSHA=x=>typeof x==='string'&&/^[a-f0-9]{40}$/.test(x);
const requireThat=(test,message)=>{if(!test)throw Error(message);};

// Immutable namespace records share verified objects and one guarded Git carrier.
export class GitHubSaveStore {
 constructor({connection,credential,fetch=globalThis.fetch,request=null,progress=()=>{},signal=null,writeInterval=0,verificationBranch=null}){
  const b=connection?.bootstrap,p=b?.provider;
  requireThat(connection?.format==='ROMDexGitHubCloudConnection/1'&&p?.owner==='GenericCola'&&p.repository==='ROMDex-Data'&&p.repositoryId==='1421625633'&&p.ownerId==='32021766'&&p.branch==='main'&&b.owner?.githubUserId==='32021766'&&b.workspaceId==='1e267c45-75ae-48a9-b173-5ca3132bb121','The Approved Cloud Identity Is Missing.');
  requireThat(connection.bootstrapPath===`workspaces/${b.workspaceId}/bootstrap.json`&&connection.bootstrapSha256==='e47be8ff64715f5473289f1d1e336c4d7b512644660667e1b1ff1dd639bb25c4','The Cloud Bootstrap Pin Changed.');
  requireThat(verificationBranch===null||/^verification\/u(?:16|17|18|19)-[a-f0-9-]{36}$/.test(verificationBranch),'Invalid Verification Branch.');
  Object.assign(this,{connection,credential,fetch,requestOverride:request,progress,signal,writeInterval});this.branch=verificationBranch||'main';this.workspace=b.workspaceId;this.root=`workspaces/${this.workspace}`;this.prefix='/repos/GenericCola/ROMDex-Data';this.requests=0;this.writes=0;this.nextWrite=0;
 }
 async request(route,options={}){
  this.requests++;if(options.method&&options.method!=='GET')this.writes++;
  if(this.requestOverride)return this.requestOverride(route,options);
  if(options.method&&options.method!=='GET'&&this.writeInterval){const wait=Math.max(0,this.nextWrite-Date.now());this.nextWrite=Math.max(this.nextWrite,Date.now())+this.writeInterval;if(wait)await delay(wait,undefined,{signal:this.signal||undefined});}
  requireThat(route==='/user'||route===this.prefix||route.startsWith(this.prefix+'/'),'Unsupported Cloud Route.');
  let token=await this.credential();requireThat(typeof token==='string'&&token.length>=10&&token.length<=4096&&!/[\r\n]/.test(token),'Saved Cloud Access Is Unavailable.');
  let response;try{const timeout=AbortSignal.timeout(45000);response=await this.fetch('https://api.github.com'+route,{method:options.method||'GET',redirect:'error',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','User-Agent':'ROMDex-Cloud-Import','X-GitHub-Api-Version':'2022-11-28',...(options.body?{'Content-Type':'application/json'}:{})},body:options.body?JSON.stringify(options.body):undefined,signal:this.signal?AbortSignal.any([timeout,this.signal]):timeout});}catch{throw Error('Cloud Request Interrupted. Local Work Is Retained for Review and Retry.');}finally{token=null;}
  const limit=options.limit||2*1024*1024;let length=0;const chunks=[];
  if(Number(response.headers.get('content-length'))>limit){await response.body?.cancel();throw Error('Cloud Response Exceeds the Verified Limit.');}
  for await(const chunk of response.body){length+=chunk.length;if(length>limit){await response.body?.cancel().catch(()=>{});throw Error('Cloud Response Exceeds the Verified Limit.');}chunks.push(Buffer.from(chunk));}
  let data=null;try{data=length?JSON.parse(Buffer.concat(chunks).toString('utf8')):null;}catch{throw Error('Cloud Response Is Invalid.');}
  return {status:response.status,data,next:!!response.headers.get('link')?.includes('rel="next"'),retryAfter:response.headers.get('retry-after'),rateReset:response.headers.get('x-ratelimit-reset')};
 }
 async call(route,options){const r=await this.request(this.prefix+route,options);if(![200,201,204].includes(r.status))throw Object.assign(Error(`Cloud Access Needs Review (HTTP ${r.status}).`),{status:r.status,retryAfter:r.retryAfter,rateReset:r.rateReset});return r.data;}
 async descendant(base,head){if(base===head)return;const d=await this.call('/compare/'+base+'...'+head);requireThat(['ahead','identical'].includes(d?.status)&&d.base_commit?.sha===base&&d.merge_base_commit?.sha===base,'Cloud History Changed. Restore Requires Review.');}
 async head(){const d=await this.call('/git/ref/heads/'+this.branch);requireThat(gitSHA(d?.object?.sha)&&d.object.type==='commit','Invalid Cloud Branch Head.');if(this.lastHead)await this.descendant(this.lastHead,d.object.sha);this.lastHead=d.object.sha;return d.object.sha;}
 async inventory(commit){
  requireThat(gitSHA(commit),'Invalid Cloud Commit.');const meta=await this.call('/git/commits/'+commit);requireThat(gitSHA(meta?.tree?.sha),'Invalid Cloud Tree.');
  const tree=await this.call('/git/trees/'+meta.tree.sha+'?recursive=1',{limit:8*1024*1024});
  requireThat(tree?.truncated===false&&Array.isArray(tree.tree)&&tree.tree.length<=20000,'Cloud Discovery Is Incomplete. Import Requires Review.');
  const entries=new Map();for(const e of tree.tree){if(e.type==='tree')continue;requireThat(e.type==='blob'&&e.mode==='100644'&&gitSHA(e.sha)&&typeof e.path==='string'&&!entries.has(e.path),'Unexpected Cloud Tree Entry.');entries.set(e.path,e.sha);}
  return {commit,tree:meta.tree.sha,entries};
 }
 async readBlob(id,limit=CHUNK_BYTES){
  requireThat(gitSHA(id),'Invalid Cloud Blob.');const d=await this.call('/git/blobs/'+id,{limit:Math.ceil(limit*1.6)+4096});
  requireThat(d?.encoding==='base64'&&Number.isSafeInteger(d.size)&&d.size>=0&&d.size<=limit&&typeof d.content==='string','Invalid Cloud Blob Size.');
  const encoded=d.content.replace(/[\r\n]/g,'');requireThat(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded),'Invalid Cloud Blob Encoding.');
  const bytes=Buffer.from(encoded,'base64');requireThat(bytes.length===d.size&&gitBlob(bytes)===id,'Cloud Blob Integrity Check Failed.');return bytes;
 }
 async verifyAccess(){
  const me=await this.request('/user'),repo=await this.request(this.prefix),collaborators=await this.request(this.prefix+'/collaborators?per_page=100');
  requireThat(me.status===200&&String(me.data?.id)==='32021766'&&repo.status===200&&String(repo.data?.id)==='1421625633'&&repo.data?.private===true&&String(repo.data?.owner?.id)==='32021766','Private Cloud Account or Repository Changed.');
  requireThat(collaborators.status===200&&!collaborators.next&&Array.isArray(collaborators.data)&&collaborators.data.length<100&&collaborators.data.every(x=>String(x.id)==='32021766'),'Cloud Collaborators Require an Authorization Review.');
  const head=await this.head(),anchor='d923d7546fb2ab968c89f4bc9e86c133a7bdc95f';
  await this.descendant(anchor,head);
  const inventory=await this.inventory(head),id=inventory.entries.get(this.connection.bootstrapPath);requireThat(id,'Cloud Bootstrap Is Missing.');const bytes=await this.readBlob(id,DESCRIPTOR_BYTES);
  requireThat(sha256(bytes)===this.connection.bootstrapSha256&&JSON.stringify(JSON.parse(bytes))===JSON.stringify(this.connection.bootstrap),'Cloud Bootstrap Identity Changed.');return inventory;
 }
 async verifyFiles(files,inventory){
  for(const [file,bytes]of files){requireThat(inventory.entries.get(file)===gitBlob(bytes),'Published Import Is Missing or Changed.');const downloaded=await this.readBlob(inventory.entries.get(file),Math.max(bytes.length,1));requireThat(downloaded.equals(bytes),'Published Import Bytes Differ.');this.progress('Verifying Cloud Copy');}
 }
 assertGenesis(inventory,files){
  const path=this.root+'/npcdex/genesis.json',expected=files.get(path);requireThat(expected,'The Initial Import Has No Genesis Record.');
  const present=inventory.entries.get(path);requireThat(!present||present===gitBlob(expected),'NPCDex Cloud Data Already Exists. Review Before Importing a Different Save.');
  for(const name of inventory.entries.keys())if(name.startsWith(this.root+'/npcdex/'))requireThat(files.has(name),'The NPCDex Namespace Contains Other Data. Review Before Importing.');
 }
 async publishInitial(files){
  return this.append(files,inventory=>this.assertGenesis(inventory,files));
 }
 async publishChanges(files,genesis){
  return this.append(files,inventory=>{requireThat(inventory.entries.get(this.root+'/npcdex/genesis.json')===gitBlob(Buffer.from(JSON.stringify({format:'ROMDexNPCDexGenesis/1',workspace:this.workspace,record:genesis}))),'The NPCDex Genesis Changed.');},{inlineRecords:true});
 }
 async publishMetadata(files,genesis){
  const file=this.root+'/romdex-metadata/genesis.json',expected=gitBlob(Buffer.from(JSON.stringify({format:'ROMDexMetadataRoot/1',workspace:this.workspace,record:genesis})));
  requireThat(files.get(file)&&gitBlob(files.get(file))===expected&&files.get(this.root+'/romdex-metadata/records/'+genesis+'.json')&&sha256(files.get(this.root+'/romdex-metadata/records/'+genesis+'.json'))===genesis,'The Metadata Publication Has No Verified Genesis Closure.');
  return this.append(files,inventory=>{const present=inventory.entries.get(file);requireThat(!present||present===expected,'The ROMDex Metadata Genesis Changed.');if(!present)requireThat(![...inventory.entries.keys()].some(name=>name.startsWith(this.root+'/romdex-metadata/')),'Unbound Metadata Records Need Recovery.');},{inlineRecords:true,namespace:'romdex-metadata'});
 }
 async append(files,validateInventory,{inlineRecords=false,namespace='npcdex'}={}){
  await this.verifyAccess();
  for(let attempt=0;attempt<4;attempt++){
   const inventory=await this.inventory(await this.head());validateInventory(inventory);const additions=[];
   for(const [file,bytes]of files){
    const relative=file.slice(this.root.length);requireThat(['npcdex','romdex-metadata'].includes(namespace)&&file.startsWith(this.root+'/')&&new RegExp('^(?:/objects/[a-f0-9]{2}/[a-f0-9]{64}|/'+namespace+'/records/[a-f0-9]{64}\\.json|/'+namespace+'/genesis\\.json)$').test(relative)&&Buffer.isBuffer(bytes)&&bytes.length<=CHUNK_BYTES,'Invalid Import Publication Entry.');if(relative.startsWith('/objects/')||relative.includes('/records/'))requireThat(file.split('/').at(-1).replace(/\.json$/,'')===sha256(bytes),'A Publication Entry Does Not Match Its Content Address.');const expected=gitBlob(bytes),present=inventory.entries.get(file);requireThat(!present||present===expected,'An Immutable Cloud Path Changed.');if(present)continue;
    if(inlineRecords&&file.includes('/'+namespace+'/records/'))additions.push({path:file,mode:'100644',type:'blob',content:bytes.toString('utf8')});
    else{const blob=await this.call('/git/blobs',{method:'POST',body:{encoding:'base64',content:bytes.toString('base64')}});requireThat(blob.sha===expected,'Uploaded Cloud Blob Differs.');additions.push({path:file,mode:'100644',type:'blob',sha:blob.sha});}this.progress('Uploading Verified Data');
   }
   if(!additions.length){await this.verifyFiles(files,inventory);return {commit:inventory.commit,duplicate:true,attempts:attempt+1};}
   const tree=await this.call('/git/trees',{method:'POST',body:{base_tree:inventory.tree,tree:additions}});requireThat(gitSHA(tree?.sha),'Invalid New Cloud Tree.');
   const commit=await this.call('/git/commits',{method:'POST',body:{message:namespace==='romdex-metadata'?'Append ROMDex Metadata Changes':inlineRecords?'Append NPCDex Cloud Changes':'Initialize Approved NPCDex Cloud Import',tree:tree.sha,parents:[inventory.commit]}});requireThat(gitSHA(commit?.sha),'Invalid New Cloud Commit.');
   const result=await this.request(this.prefix+'/git/refs/heads/'+this.branch,{method:'PATCH',body:{sha:commit.sha,force:false}});
   if(result.status===200){requireThat(result.data?.object?.sha===commit.sha,'Cloud Publication Outcome Needs Review.');const published=await this.inventory(commit.sha);await this.verifyFiles(files,published);return {commit:commit.sha,duplicate:false,attempts:attempt+1};}
   if([409,422].includes(result.status)&&await this.head()!==inventory.commit)continue;
   throw Error('Cloud Publication Failed. Review Before Retrying.');
  }
  throw Error('Cloud Updates Are Competing. The Import Remains Pending; No Force-Push Was Used.');
 }
}
