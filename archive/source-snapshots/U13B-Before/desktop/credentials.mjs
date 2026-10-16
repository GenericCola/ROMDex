export function electronProtector(safeStorage){
 return async(value,decrypt=false)=>{
  if(typeof value!=='string'||value.length>65536||!safeStorage.isEncryptionAvailable())throw Error('Windows Credential Protection Is Unavailable.');
  if(decrypt){let envelope;try{envelope=JSON.parse(value);}catch{throw Error('This Connection Requires the Reviewed Legacy Migration.');}
   if(envelope.format!=='ROMDexElectronCredential/1'||typeof envelope.bytes!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(envelope.bytes))throw Error('Unsupported Protected Connection Format.');
   try{return safeStorage.decryptString(Buffer.from(envelope.bytes,'base64'));}catch{throw Error('Windows Could Not Restore This Protected Connection.');}
  }
  return JSON.stringify({format:'ROMDexElectronCredential/1',bytes:safeStorage.encryptString(value).toString('base64')});
 };
}
