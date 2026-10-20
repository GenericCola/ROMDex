// Files launched by Windows share the ordinary, user-approved local import UI.
export function mountNativeRdx({desktop,host,tell,timers=globalThis}){
 const dialog=document.createElement('dialog');dialog.className='rdx-plan-dialog';dialog.setAttribute('aria-label','Open RDX File');document.body.append(dialog);
 let running=false,timer=null,paused=false,lifecycleBusy=false;
 const blocked=()=>document.body.inert||[document,...[...host.views.values()].map(v=>v.doc)].some(d=>d.querySelector('dialog[open]')||d.activeElement?.matches('input,textarea,select,[contenteditable="true"]'));
 async function open(entry){
  if(running||lifecycleBusy)return;running=true;
  try{
   dialog.close();const selection=await desktop.rdxOpen('inspect',entry.id);if(lifecycleBusy)return;
   // Checkpoint before changing the active view; an unresolved editor remains
   // in place. Nothing in this route binds, publishes or approves an import.
   const view=host.views.get(selection.workspace);if(!view)throw Error('The Workspace Is Still Loading.');
   if(selection.workspace==='romdex')await view.win.romdexWorkspace.flush();else await view.win.romdexContentImports.checkpointView();
   if(lifecycleBusy)return;await host.activate(selection.workspace);if(lifecycleBusy)return;
   const stage=()=>desktop.rdxOpen('stage',{...selection,context:view.win.romdexDocumentContext||null});
   const ui=selection.workspace==='romdex'?view.win.romdexPlanImports:view.win.romdexContentImports;
   await ui.openNativeFile(stage);await desktop.rdxOpen('dismiss',entry.id);
  }catch(error){if(!lifecycleBusy){tell(error.message);await notice(error.message);}}finally{running=false;schedule();}
 }
 async function notice(error){
  if(lifecycleBusy)return;const entries=await desktop.rdxOpen('list');if(lifecycleBusy||!entries.length)return;
  dialog.replaceChildren();const heading=document.createElement('h2');heading.textContent='Open RDX File';const body=document.createElement('div'),footer=document.createElement('footer');body.className='rdx-plan-body';dialog.append(heading,body,footer);
  const p=document.createElement('p');p.textContent=error||'Open a Local Import Preview. Your Current Work and Original File Are Preserved.';body.append(p);
  for(const entry of entries){const row=document.createElement('p'),review=document.createElement('button'),dismiss=document.createElement('button');review.textContent='Review · '+entry.name;review.onclick=()=>open(entry);dismiss.textContent='Dismiss';dismiss.onclick=async()=>{await desktop.rdxOpen('dismiss',entry.id);dialog.close();schedule();};row.append(review,dismiss);body.append(row);}
  const later=document.createElement('button');later.textContent='Later';later.onclick=()=>{paused=true;dialog.close();};footer.append(later);if(!dialog.open)dialog.showModal();
 }
 const report=error=>{if(!lifecycleBusy)tell(error.message);};
 async function pump(){if(paused||lifecycleBusy)return;if(running||blocked())return schedule();const entries=await desktop.rdxOpen('list');if(lifecycleBusy||!entries.length)return;await open(entries[0]);}
 function schedule(){timers.clearTimeout(timer);timer=null;if(lifecycleBusy)return;timer=timers.setTimeout(()=>{if(lifecycleBusy)return;desktop.rdxOpen('list').then(entries=>{if(!lifecycleBusy&&entries.length&&!dialog.open)pump().catch(report);}).catch(report);},1500);}
 dialog.addEventListener('cancel',()=>{paused=true;});
 const unsubscribe=desktop.onEvent(e=>{if(e.type==='lifecycle'){lifecycleBusy=e.busy===true;schedule();}else if(e.type==='rdx-open'){paused=false;schedule();}});
 window.addEventListener('focus',schedule);schedule();
 return {dialog,show:()=>notice(),dispose:()=>{timers.clearTimeout(timer);unsubscribe();}};
}
