const fs=require('node:fs'),path=require('node:path'),{randomUUID,createHash}=require('node:crypto');
// Run before Electron initializes OSCrypt. Windows-protected credentials also
// depend on the encrypted key in the original userData/Local State file.
function prepareSessionKey({sourceProfile,sourceSession,destinationProfile,destinationSession}){
 if(fs.existsSync(destinationProfile))return {status:'existing-profile'};
 const credential=path.join(sourceProfile,'service/connection.encrypted');
 if(!fs.existsSync(credential))return {status:'no-credential'};
 const envelope=JSON.parse(fs.readFileSync(credential,'utf8'));
 if(envelope.format!=='ROMDexElectronCredential/1')throw Error('The Existing Connection Needs Reviewed Credential Recovery.');
 const original=path.join(sourceSession,'Local State'),target=path.join(destinationSession,'Local State');
 const bytes=fs.readFileSync(original),state=JSON.parse(bytes);
 if(!state.os_crypt?.encrypted_key||typeof state.os_crypt.encrypted_key!=='string')throw Error('The Original Windows Credential Key Is Missing. Original Saves Are Preserved.');
 if(fs.existsSync(target)){
  const current=JSON.parse(fs.readFileSync(target,'utf8'));
  if(current.os_crypt?.encrypted_key===state.os_crypt.encrypted_key)return {status:'key-present'};
 }
 fs.mkdirSync(destinationSession,{recursive:true});
 const id=randomUUID(),stage=path.join(destinationSession,'.session-key-'+id+'.tmp');
 const handle=fs.openSync(stage,'wx');try{fs.writeFileSync(handle,bytes);fs.fsyncSync(handle);}finally{fs.closeSync(handle);}
 if(fs.existsSync(target))fs.copyFileSync(target,path.join(destinationSession,'Local State.before-migration-'+id),fs.constants.COPYFILE_EXCL);
 fs.renameSync(stage,target);
 const digest=createHash('sha256').update(bytes).digest('hex');
 fs.writeFileSync(path.join(destinationSession,'romdex-session-migration.json'),JSON.stringify({format:'ROMDexSessionKeyMigration/1',source:original,sha256:digest,at:new Date().toISOString()},null,2));
 return {status:'copied',sha256:digest};
}
module.exports={prepareSessionKey};
