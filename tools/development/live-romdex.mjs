import fs from 'node:fs/promises';
const origin='http://127.0.0.1:4322';
async function api(path,body){const response=await fetch(origin+'/api/'+path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{Origin:origin,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(180000)});const result=await response.json();if(!response.ok)throw new Error(result.error);return result;}
const mode=process.argv[2];
if(mode==='cleanup-qa'){
 const all=(await api('snapshot')).items,expected=['PMON-289','PMON-290','PMON-291','PMON-292'];
 const targets=all.filter(x=>expected.includes(x.id));
 if(targets.length!==4||targets.some(x=>!x.summary.startsWith('ROMDex QA')))throw new Error('The disposable QA items do not match. Review before cleanup.');
 const extra=all.filter(x=>expected.includes(x.parentId)&&!expected.includes(x.id));if(extra.length)throw new Error('Unexpected children were added to the QA hierarchy.');
 const result=await api('sync',{operations:[{opId:crypto.randomUUID(),type:'delete',issueId:'PMON-289',ids:expected,bases:Object.fromEntries(targets.map(x=>[x.id,x]))}]});
 console.log(JSON.stringify({completed:result.completed,blocked:result.blocked,error:result.error,remainingQa:result.items?.filter(x=>expected.includes(x.id)).length,count:result.items?.length}));
}
if(mode==='create'){
 const localId='local-live-verification',opId=crypto.randomUUID();
 const result=await api('sync',{operations:[{opId,type:'create',issueId:localId,item:{summary:'ROMDex verification — temporary',description:'Temporary task created by ROMDex to verify bidirectional synchronization. It will be removed after verification. No project work belongs here.',parentId:null,state:'To do',priority:'Minor',type:'Task'}}]});
 if(result.blocked||result.error)throw new Error(JSON.stringify(result.blocked||result.error));
 const id=result.mapping[localId];await fs.writeFile(new URL('live-verification.json',import.meta.url),JSON.stringify({id,opId}));console.log(JSON.stringify({id,created:true}));
}
if(mode==='read'){
 const {id}=JSON.parse(await fs.readFile(new URL('live-verification.json',import.meta.url),'utf8'));const result=await api('snapshot');const item=result.items.find(x=>x.id===id);console.log(JSON.stringify(item));
}
if(mode==='push'){
 const {id}=JSON.parse(await fs.readFile(new URL('live-verification.json',import.meta.url),'utf8'));const current=(await api('snapshot')).items.find(x=>x.id===id);const result=await api('sync',{operations:[{opId:crypto.randomUUID(),type:'edit',issueId:id,base:current,patch:{summary:'ROMDex verification — dashboard push confirmed',description:current.description+'\n\nDashboard edit reached YouTrack.',state:'Standby',priority:'Major'}}]});console.log(JSON.stringify({completed:result.completed,blocked:result.blocked,error:result.error,item:result.items?.find(x=>x.id===id)}));
}
if(mode==='delete'){
 const {id}=JSON.parse(await fs.readFile(new URL('live-verification.json',import.meta.url),'utf8'));const current=(await api('snapshot')).items.find(x=>x.id===id);if(!current)throw new Error('Verification task was already deleted.');if(!current.description.startsWith('Temporary task created by ROMDex'))throw new Error('This is not the disposable verification task.');const result=await api('sync',{operations:[{opId:crypto.randomUUID(),type:'delete',issueId:id,ids:[id],bases:{[id]:current}}]});console.log(JSON.stringify({completed:result.completed,blocked:result.blocked,error:result.error,deleted:!result.items?.some(x=>x.id===id)}));
}
