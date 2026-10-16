// Open editors retain their observed metadata base. Opening is gated before input is possible.
export function guardMetadataEditors(document,{desktop,status,message=()=>{}}){
 const waiting=new WeakMap();let serial=Promise.resolve();
 const update=(active,head)=>{const run=serial.then(()=>desktop.call('metadataEditorState',[{active,...(active?{head}:{})}]));serial=run.catch(()=>{});return run;};
 document.addEventListener('beforetoggle',event=>{
  const dialog=event.target;if(dialog.tagName!=='DIALOG'||!status()?.active)return;
  if(event.newState==='open'){
   const identity={},head=status().projectedHead;waiting.set(dialog,identity);dialog.inert=true;
   update(true,head).then(()=>{if(waiting.get(dialog)!==identity)return;dialog.inert=false;if(dialog.open){const focus=dialog.querySelector('[autofocus],input:not([type=hidden]),textarea,select,button');focus?.focus({preventScroll:true});}}).catch(error=>{if(waiting.get(dialog)===identity){dialog.inert=false;if(dialog.open)dialog.close();message(error.message);}});
  }else if(event.newState==='closed'){
   waiting.delete(dialog);dialog.inert=false;queueMicrotask(()=>{if(!document.querySelector('dialog[open]'))update(false).catch(error=>message(error.message));});
  }
 },true);
}
