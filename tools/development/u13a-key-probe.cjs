const {app,safeStorage}=require('electron'),fs=require('node:fs'),path=require('node:path');
const root=process.env.ROMDEX_KEY_TEST_ROOT,mode=process.env.ROMDEX_KEY_TEST_MODE;
if(!root||!['create','unmigrated','migrated'].includes(mode))throw Error('Isolated Key Test Configuration Required');
const sourceProfile=path.join(root,'old-profile'),sourceSession=path.join(root,'old-session'),destinationProfile=path.join(root,'new-profile'),destinationSession=path.join(root,'new-session');
app.setPath('userData',mode==='create'?sourceSession:destinationSession);app.setPath('sessionData',mode==='create'?sourceSession:destinationSession);
let migration;if(mode==='migrated')migration=require('../outputs/ROMDex/desktop/session-migration.cjs').prepareSessionKey({sourceProfile,sourceSession,destinationProfile,destinationSession});
app.whenReady().then(()=>{
 if(!safeStorage.isEncryptionAvailable())throw Error('Windows Protection Unavailable');
 const credential=path.join(sourceProfile,'service/connection.encrypted'),testValue='ROMDex Synthetic Cross-Profile Credential';
 if(mode==='create'){fs.mkdirSync(path.dirname(credential),{recursive:true});fs.writeFileSync(credential,JSON.stringify({format:'ROMDexElectronCredential/1',bytes:safeStorage.encryptString(testValue).toString('base64')}));}
 let restored=false;if(mode!=='create'){const value=JSON.parse(fs.readFileSync(credential,'utf8'));try{restored=safeStorage.decryptString(Buffer.from(value.bytes,'base64'))===testValue;}catch{}}
 const passed=mode==='create'||restored===(mode==='migrated');fs.writeFileSync(path.join(root,mode+'.json'),JSON.stringify({mode,passed,restored,migration}));if(passed)app.quit();else app.exit(1);
}).catch(error=>{fs.writeFileSync(path.join(root,mode+'.json'),JSON.stringify({mode,passed:false,error:error.message}));app.exit(1);});
