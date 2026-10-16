import {boundedBytes,MAX_RELEASE_BYTES} from './release-core.mjs';
const CDN=new Set(['release-assets.githubusercontent.com','objects.githubusercontent.com']);
export class GitHubReleases {
 constructor({owner,repository,repositoryId,credential,fetch=globalThis.fetch}){
  if(!/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(owner||'')||!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(repository||'')||!/^[1-9]\d*$/.test(String(repositoryId||'')))throw Error('The Private Release Repository Is Not Configured.');
  Object.assign(this,{owner,repository,repositoryId:String(repositoryId),credential,fetch});this.prefix='/repos/'+encodeURIComponent(owner)+'/'+encodeURIComponent(repository);this.configured=true;
 }
 async request(route,{binary=false,signal,timeout=30000}={}){
  if(route==='/')route='';
  if(!/^(?:\/releases\/(?:latest|assets\/[1-9]\d*))?$/.test(route))throw Error('Unsupported Private Release Request.');
  let url=new URL('https://api.github.com'+this.prefix+route),token=await this.credential();if(typeof token!=='string'||token.length<10||token.length>4096||/[\r\n]/.test(token))throw Error('Set Up Private Update Download Access First.');
  const boundedSignal=signal?AbortSignal.any([signal,AbortSignal.timeout(timeout)]):AbortSignal.timeout(timeout);
  for(let redirects=0;redirects<4;redirects++){
   const api=url.hostname==='api.github.com';if(url.protocol!=='https:'||url.port||url.username||url.password||(!api&&!CDN.has(url.hostname))||(api&&url.pathname!==this.prefix+route))throw Error('The Private Download Redirect Is Not Approved.');
   const headers={Accept:binary?'application/octet-stream':'application/vnd.github+json','User-Agent':'ROMDex-Private-Updater'};if(api){headers.Authorization='Bearer '+token;headers['X-GitHub-Api-Version']='2022-11-28';}
   let response;try{response=await this.fetch(url.href,{headers,redirect:'manual',signal:boundedSignal});}catch{throw Error(boundedSignal.aborted?'Update Request Canceled or Timed Out.':'Private Release Connection Failed.');}
   if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');await response.body?.cancel?.().catch(()=>{});if(!location)throw Error('The Private Download Redirect Is Missing.');url=new URL(location,url);continue;}
   if(!response.ok){await response.body?.cancel?.().catch(()=>{});throw Error([401,403,404].includes(response.status)?'Private Update Access Is Unavailable. Check Repository Access and the Saved Download Token.':'Private Release Request Failed ('+response.status+').');}
   return response;
  }
  throw Error('Too Many Private Download Redirects.');
 }
 async checkAccess(){const repo=JSON.parse((await boundedBytes(await this.request('/'),262144)).toString('utf8'));if(repo.private!==true||String(repo.id)!==this.repositoryId||repo.full_name?.toLowerCase()!==(this.owner+'/'+this.repository).toLowerCase())throw Error('The Release Repository Does Not Match Its Approved Private Identity.');return true;}
 async readIndex(){await this.checkAccess();const latest=JSON.parse((await boundedBytes(await this.request('/releases/latest'),262144)).toString('utf8'));if(latest.draft||latest.prerelease||!Array.isArray(latest.assets))throw Error('No Stable Private Release Is Available.');const assets=latest.assets.filter(x=>x.name==='romdex-release-stable.json');if(assets.length!==1||!Number.isSafeInteger(assets[0].id)||assets[0].size>MAX_RELEASE_BYTES)throw Error('The Signed Private Release Index Is Missing or Invalid.');return (await boundedBytes(await this.request('/releases/assets/'+assets[0].id,{binary:true}))).toString('utf8');}
 async openArtifact(artifact,{signal}={}){await this.checkAccess();const route='/releases/assets/'+artifact.id;if(!/^[1-9]\d*$/.test(artifact.id))throw Error('The Private Release Asset ID Is Invalid.');const metadata=JSON.parse((await boundedBytes(await this.request(route,{signal}),262144)).toString('utf8'));if(metadata.name!==artifact.name||metadata.size!==artifact.size||String(metadata.id)!==artifact.id)throw Error('The Private Asset Does Not Match the Signed Installer.');return this.request(route,{binary:true,signal,timeout:15*60000});}
}
