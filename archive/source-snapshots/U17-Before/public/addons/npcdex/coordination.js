// Classic first-party adapter: reads the existing NPCDex model without copying its UI logic.
(()=>{
 let base=null,lastEpoch=-1,lastCheckpoint=null,checkpointError=null,recovery=null,checkpointTask=null,manualTask=null;
 const announce=()=>window.dispatchEvent(new Event('npcdex-status'));
 const access=(mode,key,value)=>nativeDesktop?nativeDesktop.storage(mode==='readonly'?'load':'save','npcdex-'+key,value??null):new Promise((resolve,reject)=>{if(!db){reject(Error('NPCDex Browser Storage Is Unavailable.'));return;}const tx=db.transaction('snapshots',mode),store=tx.objectStore('snapshots');let result;if(mode==='readonly'){const req=store.get(key);req.onsuccess=()=>result=req.result;}else value===undefined?store.delete(key):store.put(value,key);tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('NPCDex Checkpoint Was Interrupted.'));});
 const identity=()=>({revision:data.revision||0,savedAt:data.savedAt||null});
 const ready=startupReady.then(async()=>{base=identity();try{const held=await access('readonly','recovery-draft');if(held){recovery=held;if(held.format!==1||!held.dirty||held.base?.revision!==base.revision||held.base?.savedAt!==base.savedAt){checkpointError='A Recovery Copy Needs Review in Data.';}else{validate(held.snapshot);data=structuredClone(held.snapshot);dirty=true;editEpoch++;gender=['male','female'].includes(data.preferences?.gender)?data.preferences.gender:'male';render();updateSaveIndicator();lastEpoch=editEpoch;lastCheckpoint=held.at;recovery=null;}}}catch(error){checkpointError=error.message;}announce();});
 function checkpoint(){if(checkpointTask)return checkpointTask;checkpointTask=(async()=>{await ready;if(recovery)throw Error(checkpointError);flushNote();if(!dirty||lastEpoch===editEpoch&&!checkpointError)return;const epoch=editEpoch,record={format:1,base:structuredClone(base),snapshot:structuredClone(data),dirty:true,at:Date.now()};try{await access('readwrite','recovery-draft',record);lastEpoch=epoch;lastCheckpoint=record.at;checkpointError=null;}catch(error){checkpointError=error.message;throw error;}finally{announce();}})().finally(()=>checkpointTask=null);return checkpointTask;}
 function manualSave(){if(manualTask)return manualTask;if(recovery)return Promise.reject(Error(checkpointError));if(!dirty&&!checkpointError)return Promise.resolve({ok:true,message:'NPCDex Local Export Is Current.'});
  // Call the original handler before awaiting so folder permissions keep user activation.
  const operation=$('save').onclick();manualTask=(async()=>{await operation;await checkpointTask?.catch(()=>{});if($('data-status').className==='success'){base=identity();if(!dirty){await access('readwrite','recovery-draft');lastEpoch=editEpoch;lastCheckpoint=Date.now();checkpointError=null;}}
   if(dirty){lastEpoch=-1;await checkpoint();return {ok:false,message:!exportDirectory?'Choose an NPCDex Save Folder in Data.':$('data-status').className==='success'?'NPCDex Export Saved; Newer Local Changes Need Another Save.':$('data-status').textContent||'NPCDex Still Has Unsaved Changes.'};}return {ok:true,message:'NPCDex Local Export Saved.'};
  })().catch(error=>{checkpointError=error.message;throw error;}).finally(()=>{manualTask=null;announce();});return manualTask;
 }
 const section=document.createElement('section');section.id='local-recovery';section.hidden=true;section.innerHTML='<h3>Local Recovery Copy</h3><p>A local recovery copy and the current workspace are both retained. Download the copy to inspect it. Use Import NPCDex JSON to restore it if desired, then confirm which workspace to continue using.</p><button id="download-local-recovery" type="button">Download Recovery Copy</button><button id="accept-current-workspace" type="button">Use Current Workspace</button>';$('data-dialog').querySelector('.dialog-scroll').append(section);
 ready.then(()=>section.hidden=!recovery);
 $('download-local-recovery').onclick=()=>{if(recovery?.snapshot)downloadJSON(recovery.snapshot);};
 $('accept-current-workspace').onclick=async()=>{if(!recovery||!confirm('Continue With the Current Workspace? The Recovery Copy Will Be Preserved in Browser Storage.'))return;try{await access('readwrite','held-recovery',recovery);await access('readwrite','recovery-draft');recovery=null;checkpointError=null;section.hidden=true;lastEpoch=-1;await checkpoint();announce();}catch(error){checkpointError=error.message;announce();}};
 window.romdexWorkspace={kind:'npcdex',ready,checkpoint,manualSave,get dirty(){return dirty;},get revision(){return data.revision;},status(){return {label:'NPCDex',cloud:false,automaticRemote:false,localCheckpoint:true,dirty,attention:dirty||!!checkpointError,recoveryReview:!!recovery,lastCheckpoint,error:checkpointError,message:checkpointError||(dirty?'Local Changes Need Manual Export.':'Local Export Is Current.')};}};
})();

// The desktop service owns local durability and all network work; browser exports stay optional.
(()=>{
 if(!nativeDesktop)return;const workspace=window.romdexWorkspace,legacyStatus=workspace.status.bind(workspace),legacyExport=$('save').onclick;
 let cloud=false,head=null,state=null,task=null,refresh=null,error=null;
 const announce=()=>window.dispatchEvent(new Event('npcdex-status'));
 const originalReady=workspace.ready;
 workspace.ready=originalReady.then(async()=>{
  const view=await nativeDesktop.call('npcdexView',[]);if(view.error){error=view.error;announce();return;}if(!view.active)return;
  cloud=true;state=view.status;head=window.romdexNPCReadHead||view.head;
  if(!dirty){validate(view.snapshot);data=structuredClone(view.snapshot);head=view.head;reviewCache=null;render();updateSaveIndicator();}
  const legacyWrite=writeDB;writeDB=async snapshot=>{if(!cloud)return legacyWrite(snapshot);const saved=await nativeDesktop.call('npcdexCheckpoint',[snapshot,head]);head=saved.head;state=saved.status;return true;};
  const checkpoint=()=>{if(task)return task;task=(async()=>{
   if(legacyStatus().recoveryReview)throw Error('Review the Preserved Recovery Copy in Data First.');
   flushNote();flushPromptChange();if(!dirty&&!error)return;
   const epoch=editEpoch,snapshot=structuredClone(data);snapshot.revision=(data.revision||0)+1;snapshot.savedAt=new Date().toISOString();
   try{const saved=await nativeDesktop.call('npcdexCheckpoint',[snapshot,head]);head=saved.head;state=saved.status;error=null;
    if(editEpoch===epoch){validate(saved.snapshot);data=structuredClone(saved.snapshot);dirty=false;}else{data.revision=Math.max(data.revision||0,snapshot.revision);data.savedAt=snapshot.savedAt;}
    await nativeDesktop.storage('save','npcdex-recovery-draft',null);updateSaveIndicator();$('save-status').textContent=dirty?'Newer Edits Await Local Checkpoint':'Saved Locally · '+state.message;
   }catch(e){error=e.message;throw e;}finally{announce();}
  })().finally(()=>task=null);return task;};
  workspace.checkpoint=checkpoint;
  workspace.manualSave=async()=>{await checkpoint();state=await nativeDesktop.call('npcdexSync',[]);announce();return {ok:!state.pending&&!state.review&&!state.attention,message:state.message};};
  $('save').onclick=()=>workspace.manualSave();
  const exportButton=document.createElement('button');exportButton.type='button';exportButton.textContent='Export Package Copy';exportButton.onclick=()=>legacyExport();$('data-dialog').querySelector('.dialog-scroll').append(exportButton);
  const acceptIncoming=()=>{if(refresh)return refresh;const epoch=editEpoch;refresh=(async()=>{const latest=await nativeDesktop.call('npcdexView',[]);state=latest.status;if(dirty||task||editEpoch!==epoch)return;validate(latest.snapshot);data=structuredClone(latest.snapshot);head=latest.head;reviewCache=null;render();updateSaveIndicator();})().catch(e=>error=e.message).finally(()=>{refresh=null;announce();});return refresh;};
  nativeDesktop.onEvent(event=>{if(event.type!=='npcdex-cloud')return;state=event.detail.status;if(event.detail.head!==head&&!dirty&&!task)acceptIncoming();announce();});
  announce();
 });
 const originalStatus=workspace.status.bind(workspace);workspace.status=()=>cloud?{...state,label:'NPCDex',localCheckpoint:true,dirty,attention:!!error||!!state?.attention||!!legacyStatus().recoveryReview,error,message:error||state?.message||'NPCDex Cloud Is Starting.'}:error?{...originalStatus(),attention:true,error,message:error}:originalStatus();
})();
