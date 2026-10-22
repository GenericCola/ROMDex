export function publicationProgress(sync={}){
 const s=sync.publication;if(!s)return {hidden:true};if(s.local)return {hidden:false,complete:false,active:!!s.syncing,text:s.message||'Saving Map to NPCDex Locally…',max:1,value:0,indeterminate:!!s.syncing};const p=s.progress,hasCounts=p&&[p.recordsTotal,p.objectsTotal,p.recordsComplete,p.objectsComplete].every(Number.isFinite),total=hasCounts?p.recordsTotal+p.objectsTotal+1:1,done=hasCounts?Math.min(total-1,p.recordsComplete+p.objectsComplete):0;
 const complete=!s.pending&&!s.attention&&!s.review&&s.connection==='connected';
 const text=complete?'Cloud Copy Verified.':sync.paused?'Saved Locally · NPCDex Cloud Sync Is Paused.':s.review||s.attention&&s.error?s.message:s.syncing?s.message:!sync.automatic?'Saved Locally · Waiting for Manual Sync or Auto-Sync.':s.message||'Cloud Publication Is Queued.';
 const active=!complete&&!sync.paused&&!!s.syncing;
 return {hidden:false,complete,active,text,max:total,value:complete?total:done,indeterminate:active&&!hasCounts,detail:active?((hasCounts?p.recordsComplete+' / '+p.recordsTotal+' records · '+p.objectsComplete+' / '+p.objectsTotal+' objects verified.':'')+(s.lastAdvancement?' Last advancement: '+new Date(s.lastAdvancement).toLocaleTimeString()+'.':'')):''};
}
