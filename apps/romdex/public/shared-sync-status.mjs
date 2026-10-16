// Shared presentation only: each provider retains its own queue and retry policy.
export function sharedSyncStatus({providers={},automaticSyncEnabled=true,saving=false,storageError=null,serviceError=null}={}){
 const services=Object.entries(providers).map(([id,value])=>{
  const pending=Number(value.pending||0),dirty=!!value.dirty,review=!!(value.review||value.recoveryReview),localError=value.localError||null;
  const connection=serviceError&&value.cloud?'unavailable':value.connection||(value.cloud?'checking':'local');
  const attention=review||!!localError||!!value.attention||((pending>0||dirty)&&(connection==='unavailable'||!automaticSyncEnabled&&!saving&&!value.syncing));
  const state=review?'Review Required':localError?'Local Recovery Required':connection==='unavailable'?'Unavailable':connection==='local'?'Local Only':connection==='checking'?'Checking':value.syncing?'Syncing':!automaticSyncEnabled?'Paused':pending||dirty?'Queued':'Up to Date';
  return {id,...value,pending,connection,attention,state,message:serviceError&&value.cloud?serviceError:value.message||state};
 });
 const unavailable=services.some(s=>s.connection==='unavailable'),checking=services.some(s=>s.connection==='checking');
 const connection=!automaticSyncEnabled?{color:'dark-blue',label:'Auto-Sync Data Is Off'}:unavailable?{color:'red',label:'A Sync Connection Needs Attention'}:checking?{color:'dark-blue',label:'Checking Sync Connections'}:{color:'blue',label:'All Configured Sync Connections Are Healthy'};
 return {services,attention:!!storageError||services.some(s=>s.attention),connection,summary:connection.label+' · '+services.map(s=>s.label+': '+s.state).join(' · ')};
}
export function renderSyncDetails(panel,status){
 for(const service of status.services){const row=panel.querySelector('[data-provider="'+service.id+'"]');if(!row)continue;row.hidden=false;const parts=[service.label+' · '+service.state,service.pending+' Pending',service.lastSync?'Last Successful Remote Check: '+new Date(service.lastSync).toLocaleString():'No Successful Remote Sync Recorded',service.message];if(service.connection==='local')parts.splice(2,1,'Stored on This Computer');row.textContent=parts.filter(Boolean).join(' · ');}
}
