import {ORGANIZATION_CAPABILITY} from './organization-contract.mjs';
import {requireCapabilities} from './document.mjs';
import {ensure} from './limits.mjs';
import {CONDITION_CAPABILITY,PREVIEW_CAPABILITY} from './features.mjs';
export function installCloudFeatureChecks(Cloud){
 const value=Cloud.prototype.value;
 Cloud.prototype.value=async function(commit){
  requireCapabilities(commit.requiredCapabilities||[]);
  const result=await value.call(this,commit),required=result.document.capabilities.required;
  if(required.includes(CONDITION_CAPABILITY)||required.includes(PREVIEW_CAPABILITY)||required.includes(ORGANIZATION_CAPABILITY))ensure(required.every(c=>commit.requiredCapabilities?.includes(c)),'INTEGRITY','Cloud Publication Does Not Declare Its Required Map Features.');
  return result;
 };
}
export function installTransportFeatureChecks(Transport){
 const commits=Transport.prototype.commits;
 Transport.prototype.commits=async function(...args){const result=await commits.apply(this,args);for(const c of result)requireCapabilities(c.requiredCapabilities||[]);return result;};
}
