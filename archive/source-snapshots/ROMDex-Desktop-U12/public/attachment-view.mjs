import {attachmentCount,fileSize,isRaster,MAX_FILE_BYTES,MAX_FILES} from './attachment-core.mjs';
const $=id=>document.getElementById(id);
export const paperclip='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 11l5-5a2 2 0 0 0-3-3L3 8a3.5 3.5 0 0 0 5 5l5-5M5 9l4-4" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export class AttachmentsView {
 constructor({ws,esc}){
  this.ws=ws;this.esc=esc;this.id=null;this.busy=false;this.objectUrl=null;this.previewTarget=null;this.viewGeneration=0;
  $('attachment-input').onchange=()=>this.attach();
  if(ws.chooseAttachments)$('attachment-input').addEventListener('click',async event=>{event.preventDefault();if(this.busy||!this.item())return;this.busy=true;this.render();try{await ws.chooseAttachments(this.id);$('attachment-error').textContent='Files Kept Locally; Upload Follows the Auto-Sync Setting.';}catch(error){$('attachment-error').textContent=error.message;}finally{this.busy=false;this.render();}});
  $('attachments-dialog').addEventListener('cancel',e=>{if(this.busy)e.preventDefault();});
  $('file-preview-dialog').addEventListener('close',()=>{this.viewGeneration++;this.previewTarget=null;if(this.objectUrl)URL.revokeObjectURL(this.objectUrl);this.objectUrl=null;$('file-preview-image').removeAttribute('src');$('preview-download').onclick=null;});
  $('file-preview-image').onload=()=>{$('file-preview-image').style.width=Math.min(640,$('file-preview-image').naturalWidth*4)+'px';};
  $('file-preview-image').onerror=()=>{$('file-preview-message').textContent='Cannot Preview This File. It May Have Been Removed or the Connection Is Unavailable.';};
  ws.addEventListener('change',()=>{this.render();if(this.previewTarget&&!this.previewTarget.pending&&!this.item(this.previewTarget.itemId)?.attachments?.some(x=>x.id===this.previewTarget.fileId))$('file-preview-dialog').close();});
 }
 item(id=this.id){return this.ws.items.find(x=>x.id===id);}
 list(item){
  if(!item)return '';const esc=this.esc,files=[...(item.attachments||[]),...(item.pendingAttachments||[]).map(x=>({...x,pending:true}))];
  return files.length?files.map(file=>{
   const deletion=(item.pendingAttachmentDeletes||[]).find(x=>x.id===file.id),deleting=deletion&&this.ws.inflight.has(deletion.opId);
   const status=deletion?this.ws.state.blocked?.opId===deletion.opId?'Deletion Needs Review':deleting?'Deleting…':'Queued for Deletion':file.pending?this.ws.inflight.has(file.opId)?'Uploading…':item.id.startsWith('local-')?'Queued · Waiting for Ticket Creation':this.ws.state.blocked?.opId===file.opId?'Review Required':'Queued · Not Yet Uploaded':'On YouTrack';
   return `<li><div class="attachment-label"><strong title="${esc(file.name)}">${esc(file.name)}</strong><small>${fileSize(file.size)} · ${status}</small></div><div class="attachment-actions">${isRaster(file.mimeType)?`<button data-view-file="${esc(file.id)}" data-file-item="${esc(item.id)}" data-pending-file="${file.pending?'true':'false'}">View</button>`:''}<button data-download-file="${esc(file.id)}" data-file-item="${esc(item.id)}" data-pending-file="${file.pending?'true':'false'}">Download</button>${file.pending?`<button data-cancel-upload="${esc(file.opId)}" ${this.ws.inflight.has(file.opId)?'disabled':''}>Cancel Upload</button>`:deletion?`<button data-cancel-attachment-delete="${esc(deletion.opId)}" ${deleting?'disabled':''}>Cancel Deletion</button>`:`<button class="danger" data-delete-file="${esc(file.id)}" data-file-item="${esc(item.id)}">Delete</button>`}</div></li>`;
  }).join(''):'<li class="muted small">No Attachments</li>';
 }
 async open(id){
  const item=this.item(id);if(!item)throw Error('This Item No Longer Exists.');this.id=id;$('attachment-error').textContent='';$('attachments-dialog').showModal();this.render();
  if(!id.startsWith('local-')&&this.ws.connected)try{await this.ws.loadAttachments(id);}catch(e){if(this.id===id)$('attachment-error').textContent='Cannot Refresh Attachments · '+e.message;}
 }
 render(){if(!$('attachments-dialog').open||!this.ws.state)return;const item=this.item();$('attachment-target').textContent=item?item.summary+' · '+(this.id.startsWith('local-')?'New Item':this.id):'Item No Longer Exists';$('attachment-list').innerHTML=this.list(item);$('attachment-input').disabled=this.busy||!item;$('attachment-limit').textContent='Up to '+MAX_FILES+' Files at Once · '+fileSize(MAX_FILE_BYTES)+' per File. YouTrack May Apply a Lower Limit. Files Are Queued Separately from Item Field Edits.';$('attachments-dialog').querySelectorAll('[data-close]').forEach(x=>x.disabled=this.busy);}
 async attach(){
  const files=[...$('attachment-input').files],id=this.id;if(!files.length||this.busy)return;this.busy=true;$('attachment-error').textContent='Keeping Files Locally…';this.render();
  try{await this.ws.attach(id,files);$('attachment-error').textContent=this.ws.automaticSyncEnabled?'Files Queued for Upload.':'Files Kept Locally. Save Changes Will Upload Once While Auto-Sync Is Off.';}catch(error){$('attachment-error').textContent=error.message;}finally{this.busy=false;$('attachment-input').value='';this.render();}
 }
 async cancel(opId){
  if(this.ws.inflight.has(opId))throw Error('Wait for This Upload to Finish.');
  if(this.ws.state.blocked?.opId===opId&&this.ws.state.blocked.uncertain)throw Error('Review This Uncertain Upload with Save Changes Before Cancelling It.');
  await this.ws.cancelAttachment(opId);
 }
 async remove(itemId,fileId){
  const item=this.item(itemId),file=item?.attachments?.find(x=>x.id===fileId);if(!file)throw Error('This Attachment Is No Longer Available.');
  if(!confirm('Delete “'+file.name+'” from '+itemId+'?\n\nThis removes the attachment from YouTrack. The ticket and other files are kept.'))return;
  await this.ws.deleteAttachment(itemId,fileId,file);
 }
 async view(itemId,fileId,pending,download=false){
  const generation=++this.viewGeneration;
  const item=this.item(itemId),file=(pending?item?.pendingAttachments:item?.attachments)?.find(x=>x.id===fileId);if(!file)throw Error('This Attachment Is No Longer Available.');
  const content='/api/attachment-content?'+(pending?'uploadId='+encodeURIComponent(fileId):'id='+encodeURIComponent(itemId)+'&attachmentId='+encodeURIComponent(fileId));
  if(!download&&!isRaster(file.mimeType))throw Error('Download This File to View It.');
  let blob=pending?await this.ws.files.get(fileId):null;
  if(!blob){const response=await fetch(content,{signal:AbortSignal.timeout(120000)});if(!response.ok){const error=await response.json().catch(()=>({}));throw Error(error.error||'Cannot Download This Attachment.');}blob=await response.blob();}
  if(!pending&&!this.item(itemId)?.attachments?.some(x=>x.id===fileId))throw Error('This Attachment Is No Longer Available.');
  blob=new Blob([blob],{type:file.mimeType});
  if(download){this.downloadBlob(blob,file.name);return;}
  if(generation!==this.viewGeneration)return;
  this.previewTarget={itemId,fileId,pending};if(this.objectUrl)URL.revokeObjectURL(this.objectUrl);this.objectUrl=URL.createObjectURL(blob);$('file-preview-title').textContent=file.name;$('file-preview-message').textContent=fileSize(file.size)+' · Original File · Pixel Art Preview';$('file-preview-image').src=this.objectUrl;$('preview-download').onclick=()=>this.downloadBlob(blob,file.name);$('file-preview-dialog').showModal();
 }
 downloadBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 remap(mapping){if(this.id)this.id=mapping[this.id]||this.id;this.render();}
}
