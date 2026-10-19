// Package receipts participate in the same durable transaction as native sync.
// This prevents a lost reply/restart from losing task remaps or upload identities.
export function applyMapPackageSync(state,result){
 const id=value=>result.mapping?.[value]||value;
 for(const entry of Object.values(state.mapPackages||{})){
  entry.issueId=id(entry.issueId);if(entry.parentId)entry.parentId=id(entry.parentId);
  for(const file of entry.uploads||[]){
   if(!result.completed.includes(file.opId))continue;
   const receipt=result.attachmentResults?.[file.opId];
   if(receipt?.id){file.receipt=structuredClone(receipt);file.completed=true;}
   else file.error='The Completed Upload Has No Verified Delivery Receipt. Review Before Continuing.';
  }
  if(result.completed.includes(entry.createOpId))entry.created=true;
 }
}
