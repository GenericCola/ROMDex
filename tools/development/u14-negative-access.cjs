const {app,safeStorage}=require('electron'),fs=require('node:fs/promises'),path=require('node:path');
const work=path.resolve(__dirname,'u14'),root=path.join(process.env.USERPROFILE,'AppData/Local/ROMDexDesktop');
app.setPath('userData',path.join(work,'private-profile/session'));app.setPath('sessionData',path.join(work,'private-profile/session'));app.disableHardwareAcceleration();
const report={task:'U14',startedAt:new Date().toISOString(),credential:'Existing Protected Read-Only Update Access',credentialValueLogged:false,requests:[],actualSavesUploaded:false};let token;
app.whenReady().then(async()=>{
 const source=path.join(root,'Data/thegobindsingh-PMON/updates/download-access.encrypted'),before=await fs.readFile(source);let envelope=JSON.parse(before);if(typeof envelope==='string')envelope=JSON.parse(envelope);
 if(envelope.format!=='ROMDexElectronCredential/1'||!safeStorage.isEncryptionAvailable())throw Error('Protected Update Access Is Unavailable.');token=safeStorage.decryptString(Buffer.from(envelope.bytes,'base64'));
 async function request(route,{method='GET',body}={}){const response=await fetch('https://api.github.com'+route,{method,redirect:'error',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});const result={method,route,status:response.status};report.requests.push(result);return response;}
 const valid=await request('/repos/GenericCola/ROMDex');if(valid.status!==200||(await valid.json()).id!==1421521049)throw Error('The Update Credential Could Not Be Positively Validated.');
 const denied=await request('/repos/GenericCola/ROMDex-Data');if(denied.status!==404)throw Error('Update Access Is Not Isolated from the Data Repository. Review Token Repository Selection.');
 const write=await request('/repos/GenericCola/ROMDex-Data/git/blobs',{method:'POST',body:{encoding:'utf-8',content:'U14 Unauthorized Synthetic Write Must Be Denied'}});if(![403,404].includes(write.status))throw Error('Unexpected Save Repository Write Access Needs Review.');
 report.savedCredentialBytesUnchanged=before.equals(await fs.readFile(source));if(!report.savedCredentialBytesUnchanged)throw Error('Saved Update Access Changed During the Check.');
 report.validAuthenticatedCredential=true;report.dataReadDenied=true;report.dataWriteDenied=true;report.status='passed';
}).catch(error=>{report.status='needs-review';report.reason=error.message;}).finally(async()=>{token=null;report.finishedAt=new Date().toISOString();await fs.writeFile(path.join(work,'negative-access.json'),JSON.stringify(report,null,2));app.exit(report.status==='passed'?0:1);});
