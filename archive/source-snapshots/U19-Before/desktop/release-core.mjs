import {createHash,createPublicKey,verify,constants} from 'node:crypto';
export const MAX_RELEASE_BYTES=65536,MAX_INSTALLER_BYTES=2*1024*1024*1024-1,DAY=86400000;
const exact=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.hasOwn(value,key));
export function compareVersions(a,b){
 const parse=value=>{if(typeof value!=='string'||!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value))throw Error('A Stable Release Version Is Required.');const parts=value.split('.').map(Number);if(parts.some(x=>!Number.isSafeInteger(x)||x>65535))throw Error('Release Version Is Out of Range.');return parts;};
 const aa=parse(a),bb=parse(b);for(let i=0;i<3;i++)if(aa[i]!==bb[i])return aa[i]>bb[i]?1:-1;return 0;
}
export function releaseKey(publicKey){
 let key;try{key=createPublicKey(publicKey);}catch{throw Error('The Release Trust Key Is Invalid.');}
 if(key.asymmetricKeyType!=='rsa'||key.asymmetricKeyDetails.modulusLength<3072)throw Error('A 3072-Bit or Stronger RSA Release Key Is Required.');
 return {key,id:createHash('sha256').update(key.export({format:'der',type:'spki'})).digest('hex')};
}
export function validateRelease(envelope,config,{currentVersion,highestVersion=currentVersion,now=Date.now(),manual=false,allowCurrent=false}={}){
 if(!config?.publicKey||!config.keyId)throw Error('Trusted Release Delivery Is Not Configured.');
 if(typeof envelope==='string'){if(Buffer.byteLength(envelope)>MAX_RELEASE_BYTES)throw Error('Release Metadata Is Too Large.');try{envelope=JSON.parse(envelope);}catch{throw Error('Release Metadata Is Invalid.');}}
 if(!exact(envelope,['format','keyId','payload','signature'])||envelope.format!=='ROMDexRelease/1'||typeof envelope.payload!=='string'||Buffer.byteLength(envelope.payload)>MAX_RELEASE_BYTES||typeof envelope.signature!=='string'||envelope.signature.length>2048||!/^[A-Za-z0-9+/]+={0,2}$/.test(envelope.signature))throw Error('Release Metadata Is Invalid.');
 const trusted=releaseKey(config.publicKey);
 if(config.keyId!==trusted.id||envelope.keyId!==trusted.id||!verify('sha256',Buffer.from(envelope.payload),{key:trusted.key,padding:constants.RSA_PKCS1_PADDING},Buffer.from(envelope.signature,'base64')))throw Error('The Release Signature Could Not Be Verified.');
 let release;try{release=JSON.parse(envelope.payload);}catch{throw Error('Signed Release Data Is Invalid.');}
 if(!exact(release,['application','channel','platform','arch','version','minimumVersion','desktopSchema','npcdexSchema','publishedAt','expiresAt','notes','artifact'])||release.application!=='ROMDex'||release.channel!=='stable'||release.platform!=='win32'||release.arch!=='x64'||release.desktopSchema!==1||release.npcdexSchema!==2)throw Error('This Release Is Not Compatible with ROMDex and Its Saves.');
 if(!Number.isSafeInteger(release.publishedAt)||!Number.isSafeInteger(release.expiresAt)||release.publishedAt>now+300000||release.expiresAt<=now||release.expiresAt<=release.publishedAt||release.expiresAt-release.publishedAt>366*DAY)throw Error('Release Metadata Has Expired or Its Date Is Invalid.');
 if(compareVersions(release.version,currentVersion)<0||(!allowCurrent&&compareVersions(release.version,currentVersion)===0))throw Error('This Release Is Already Installed or Older.');
 if(compareVersions(release.version,highestVersion)<0)throw Error('A Newer Release Was Already Verified.');
 if(compareVersions(currentVersion,release.minimumVersion)<0||compareVersions(release.minimumVersion,release.version)>=0)throw Error('Install the Required Intermediate ROMDex Version First.');
 if(typeof release.notes!=='string'||release.notes.length>8000)throw Error('Release Notes Are Invalid.');
 const a=release.artifact;
 if(!exact(a,['provider','id','name','size','sha256'])||!['github','youtrack','manual'].includes(a.provider)||typeof a.id!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(a.id)||a.name!==`ROMDex-${release.version}-x64.msi`||!Number.isSafeInteger(a.size)||a.size<1||a.size>MAX_INSTALLER_BYTES||typeof a.sha256!=='string'||!/^[a-f0-9]{64}$/.test(a.sha256))throw Error('The Signed Installer Identity Is Invalid.');
 if(!manual&&a.provider!==config.provider?.kind)throw Error('The Installer Does Not Match the Approved Private Provider.');
 return Object.freeze({...release,artifact:Object.freeze({...a}),envelope:JSON.stringify(envelope)});
}
export async function boundedBytes(response,limit=MAX_RELEASE_BYTES){
 if(!response.ok)throw Error('Private Release Request Failed ('+response.status+').');
 if(Number(response.headers?.get('content-length'))>limit)throw Error('Release Metadata Is Too Large.');
 let length=0;const chunks=[];try{for await(const chunk of response.body){length+=chunk.length;if(length>limit)throw Error('Release Metadata Is Too Large.');chunks.push(Buffer.from(chunk));}}catch(error){await response.body?.cancel?.().catch(()=>{});throw error;}return Buffer.concat(chunks);
}
