const {app,safeStorage}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),work=path.join(root,'work/u14'),installed=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop');
const profile=path.join(installed,'Data/thegobindsingh-PMON'),session=path.join(work,'private-profile/session');
app.setPath('userData',session);app.setPath('sessionData',session);app.disableHardwareAcceleration();
const base='https://thegobindsingh.youtrack.cloud';
const result={task:'U14',startedAt:new Date().toISOString(),mode:'Read Only',base,requests:[],remoteWrites:0,credentialsLogged:false};
let token;
async function get(route,{anonymous=false}={}) {
 const url=new URL(route,base);if(url.origin!==base||!/^\/(?:api|hub\/api\/rest)\//.test(url.pathname))throw Error('Unapproved Inspection Route.');
 try {
  const response=await fetch(url,{method:'GET',redirect:'manual',headers:{Accept:'application/json',...(!anonymous?{Authorization:'Bearer '+token}:{})},signal:AbortSignal.timeout(20000)});
  const text=await response.text();let data=null;try{data=JSON.parse(text);}catch{}
  const item={route,anonymous,status:response.status,json:!!data};
  if(response.ok)item.data=data;
  else item.reason=data?.error_description||data?.error||'Not Available';
  result.requests.push(item);return item;
 } catch {const item={route,anonymous,status:null,reason:'Network Request Did Not Complete'};result.requests.push(item);return item;}
}
app.whenReady().then(async()=>{
 result.stage='Check Windows Protection';
 if(!safeStorage.isEncryptionAvailable())throw Error('Normal Windows Credential Protection Is Required.');
 result.stage='Read Saved Connection Envelope';
 const credentialFile=path.join(profile,'service/connection.encrypted'),bytes=await fs.readFile(credentialFile),envelope=JSON.parse(bytes);
 if(envelope.format!=='ROMDexElectronCredential/1')throw Error('Unsupported Saved Connection Format.');
 result.stage='Restore Saved Connection in Memory';
 token=safeStorage.decryptString(Buffer.from(envelope.bytes,'base64'));
 if(typeof token!=='string'||token.length<10)throw Error('The Saved YouTrack Credential Was Not Recognized.');
 result.stage='Read YouTrack Account and Capabilities';
 const me=await get('/api/users/me?fields=id,login,ringId,guest,banned');
 if(me.status!==200||me.data?.login!=='GenericCola')throw Error('The Saved Connection Does Not Match the Approved Owner.');
 const requests=[
  '/api/admin/projects?fields=id,name,shortName,leader(id,login),team(id,name,usersCount)&$top=100',
  '/api/admin/globalSettings/systemSettings?fields=baseUrl,maxUploadFileSize,isApplicationReadOnly',
  '/api/admin/globalSettings/license?fields=id,error',
  '/api/users?fields=id,login,guest,banned&$top=100',
  '/api/groups?fields=id,name,ringId,usersCount,allUsersGroup&$top=100',
  '/api/assignedRoles?fields=id,holder(id,login,name),role(id,name,permissions(id,name)),scope(id)&$top=100&query='+encodeURIComponent('holder:'+me.data.id),
  '/api/issues/PMON-1?fields=id,idReadable,project(id,shortName),visibility(permittedUsers(id,login),permittedGroups(id,name))',
  '/api/issues/PMON-1/activitiesPage?categories=AttachmentsCategory&fields=afterCursor,beforeCursor,hasAfter,hasBefore,activities(id,timestamp,author(id,login),added(id,name),removed(id,name))&$top=1'
 ];
 for(const route of requests)await get(route);
 await get('/api/users/me?fields=id,login,guest',{anonymous:true});
 await get('/api/issues/PMON-1?fields=id,idReadable',{anonymous:true});
 if(me.data.ringId) {
  await get('/hub/api/rest/users/'+encodeURIComponent(me.data.ringId)+'/projectroles?fields=projectroles(id,role(id,key,name,permissions(id,key,name)),project(id,key,name)),total&$top=100');
  await get('/hub/api/rest/users/'+encodeURIComponent(me.data.ringId)+'?fields=id,login,permissions,transitiveProjectRoles(id,role(id,key,name,permissions(id,key,name)),project(id,key,name))');
 }
 result.savedCredentialBytesUnchanged=bytes.equals(await fs.readFile(credentialFile));
 if(!result.savedCredentialBytesUnchanged)throw Error('Saved Credential Changed During Inspection.');
 result.status='inspected';
}).catch(error=>{result.status='needs-review';result.message='Windows Inspection Could Not Complete; Original Saves and Credentials Were Not Modified.';result.errorType=error.name;app.exitCode=1;}).finally(async()=>{
 token=null;result.finishedAt=new Date().toISOString();
 await fs.writeFile(path.join(work,'readonly-inspection.json'),JSON.stringify(result,null,2));
 app.exit(result.status==='inspected'?0:1);
});
