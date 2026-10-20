// Status inspection is not an unsaved editor. Never dismiss connection input.
export function dismissUnchangedConnectionDialog(doc, rememberedConnection) {
 const dialog=doc.getElementById('connection-dialog');
 if(!dialog?.open)return false;
 const token=doc.getElementById('token'),remember=doc.getElementById('remember-connection'),submit=doc.getElementById('connect-submit');
 if(!token||!remember||!submit||token.value||remember.checked!==(rememberedConnection===true)||submit.disabled)return false;
 dialog.close();return true;
}

// A quit error must show the workspace containing the editor that needs attention.
export async function prepareWorkspaceQuit(host) {
 for(const id of ['romdex','npcdex']) {
  const view=host.views.get(id);if(!view)continue;
  try {
   if(id==='romdex')await view.win.romdexWorkspace.prepareQuit?.();
   else if(view.doc.querySelector('dialog[open]'))throw Error('Finish or Cancel the Open NPCDex Dialog Before Quitting.');
  }catch(error){await host.activate(id);throw error;}
 }
}
