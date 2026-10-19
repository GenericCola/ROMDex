// Navigation uses host-owned package identities, never renderer-provided paths,
// URLs, task IDs or publication instructions.
export function mountPackageNavigation({host,desktop,tell}){
 let busy=false;
 const npc=()=>host.views.get('npcdex');
 const call=(route,input)=>{const view=npc();if(!desktop||!view)throw Error('Package Navigation Requires the Desktop Workspaces.');return desktop.call('npcdexContent',['/api/packages/'+route,input,view.win.romdexDocumentContext||null]);};
 async function open({id,kind='package',targetKey=null}){
  if(busy)throw Error('A Package Link Is Already Opening.');busy=true;
  try{if(!['task','map','package'].includes(kind)||typeof id!=='string')throw Error('Invalid Package Link.');
   const link=await call('navigation',{id,targetKey}),task=host.views.get('romdex');let view=npc();
   if(kind==='task'){if(!task)throw Error('The Task Workspace Is Still Loading.');await task.win.romdexWorkspace.openTask(link.issueId);await host.activate('romdex');return;}
   const other=[...view.doc.querySelectorAll('dialog[open]')].some(d=>!d.classList.contains('map-package-dialog'));if(other)throw Error('Finish or Cancel the Open NPCDex Editor Before Following This Link.');
   if(kind==='package'){await host.activate('npcdex');await view.win.romdexMapPackages.openDelivery({id});return;}
   await view.win.romdexMapPackages.closeForNavigation();await view.win.romdexContentImports.checkpointView();
   if((view.win.romdexDocumentContext||null)!==link.context){await desktop.call('npcdexContent',['/api/rdx/open',{key:link.key},view.win.romdexDocumentContext||null]);const loaded=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{view.frame.removeEventListener('load',ready);reject(Error('The Map Did Not Finish Opening.'));},45000);async function ready(){try{await view.frame.contentWindow.romdexWorkspace.ready;clearTimeout(timer);resolve();}catch(e){clearTimeout(timer);reject(e);}}view.frame.addEventListener('load',ready,{once:true});});view.win.location.reload();await loaded;view=npc();}
   await host.activate('npcdex');await view.win.romdexMapPackages.openTarget(link);return link;
  }catch(e){tell?.(e.message);throw e;}finally{busy=false;}
 }
 return {open};
}
