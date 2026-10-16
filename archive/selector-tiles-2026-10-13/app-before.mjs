import {STATUS,STATES,clone,indexTree,descendants,validateMove,materialize,statusOf,hasMeaningfulNotes,saveNeedsAttention} from './core.mjs';
import {Workspace,request} from './store.mjs';
import {TraySplit} from './split-pane.mjs';
let paneSplit=null;
const $=id=>document.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pencil='<svg class="pencil-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M11 1h2v1h1v1h1v2h-1v1h-1V5h-1V4h-1V3h-1V2h1zM9 3h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1H9v1H8v1H7v1H6v1H2v-4h1V9h1V8h1V7h1V6h1V5h1V4h1zM3 11v2h2v-1H4v-1z"/></svg>';
const priorities=['Show-stopper','Critical','Major','Normal','Minor'];
const ws=new Workspace();let tree,items=[],selected=null,detailId=null,detailTab='notes',expanded=new Set(),selectorExpanded=new Set(),draft=null,renameId=null,imageId=null,deleteIds=[],statusId=null,drag=null,drop=null,toastTimer,notesTimer,titleTimer,lastDetail=null;const editorDirty={},editorBase={};
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
async function safely(fn){try{return await fn();}catch(e){toast(e.message);}}
function show(id){if(!$(id).open)$(id).showModal();}
function bulb(color){return `<span class="bulb ${color}" aria-hidden="true"></span>`;}
function itemName(item){return item?.summary?.replace(/^\[Epic\]\s*/,'')||'Untitled';}
function tier(depth){return ['Epic','Feature suite','Feature'][depth]||'Task';}
function trail(id){const result=[];let current=tree.byId.get(id),seen=new Set();while(current&&!seen.has(current.id)){seen.add(current.id);result.unshift(current);current=tree.byId.get(current.parentId);}return result;}
function hasNotes(item){return hasMeaningfulNotes(item.description);}
function localPending(id){return ws.state.operations.some(x=>x.issueId===id);}
function render(){
 if(!ws.state)return;items=ws.items;
 if(drag)return;
 const active=document.activeElement,focus=active?.id&&['draft-title','rename-input'].includes(active.id)?{id:active.id,value:active.value,start:active.selectionStart,end:active.selectionEnd}:null;
 if(draft&&focus?.id==='draft-title')draft.text=focus.value;
 try{tree=indexTree(items,ws.state.order);}catch(e){toast(e.message);return;}
 if(selected&&!tree.byId.has(selected))selected=null;
 const saveAttention=saveNeedsAttention(ws.state,{connected:ws.connected,automaticSyncEnabled:true,mode:ws.mode,failures:ws.failures,missingStates:ws.connection?.missingStates},editorDirty);
 $('save-light').className='bulb save-light '+(saveAttention?'red':'green');$('save').classList.toggle('dirty',saveAttention);
 $('save').title=ws.message;$('save').setAttribute('aria-label','Save Changes — '+ws.message);$('sync-caption').textContent=ws.message;
 $('offline-banner').hidden=ws.mode==='synced'||(ws.connected&&ws.mode==='syncing');
 $('offline-text').textContent=ws.connected?ws.message:`Imported ${items.length} YouTrack items. Connect to receive live updates and save edits.`;
 $('banner-connect').textContent=ws.connected?'Save Changes':'Connect YouTrack';
 $('all-count').textContent=items.length;$('all-items').classList.toggle('active',!selected);$('nav-count').textContent=(tree.children.get(null)||[]).length+' epics · '+items.length+' items';
 renderSelectors();renderWork();document.querySelectorAll('.selector-main,[data-drag]').forEach(b=>b.draggable=false);renderDetails();paneSplit?.apply();
 if(focus&&$(focus.id)){$(focus.id).value=focus.value;$(focus.id).focus();$(focus.id).setSelectionRange(focus.start,focus.end);}
}
function renderSelectors(){
 const html=[];function walk(parentId){for(const item of tree.children.get(parentId)||[]){const depth=tree.depths.get(item.id);if(depth>2)continue;const kids=tree.children.get(item.id)||[],isOpen=selectorExpanded.has(item.id),color=tree.colors.get(item.id);const image=ws.state.images[item.id];html.push(`<div class="selector depth-${depth} ${selected===item.id?'selected':''}" data-selector="${esc(item.id)}"><button class="selector-main" data-select="${esc(item.id)}" aria-current="${selected===item.id?'true':'false'}">${image?`<img class="selector-image" src="${esc(image)}" alt="">`:`<span class="selector-image selector-placeholder" aria-hidden="true">${esc(itemName(item).split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase())}</span>`}<span class="selector-label"><strong>${esc(itemName(item))}</strong><small>${bulb(color)}<span>${esc(tier(depth))} · ${kids.length} ${depth===0?'suites':depth===1?'features':'tasks'}</span></small></span></button>${depth<2&&kids.length?`<button class="selector-expand" data-selector-expand="${esc(item.id)}" aria-label="${isOpen?'Collapse':'Expand'} ${esc(itemName(item))}" aria-expanded="${isOpen}">${isOpen?'▾':'▸'}</button>`:''}<div class="selector-actions"><button data-image="${esc(item.id)}" title="Set selector image" aria-label="Set image for ${esc(itemName(item))}">▧</button><button data-add-child="${esc(item.id)}" title="Add child" aria-label="Add child to ${esc(itemName(item))}">+</button></div></div>`);if(isOpen&&depth<2)walk(item.id);}}walk(null);$('selectors').innerHTML=html.join('');
}
function scopedRows(){
 const search=$('search').value.toLowerCase().trim(),allowed=selected?new Set(descendants(items,selected)):null,rows=[];
 const matching=new Set();if(search){for(const item of items){if(allowed&&!allowed.has(item.id))continue;if(`${item.summary} ${item.id} ${item.description}`.toLowerCase().includes(search))for(const ancestor of trail(item.id))matching.add(ancestor.id);}}
 function walk(parent){for(const item of tree.children.get(parent)||[]){if(search&&!matching.has(item.id))continue;rows.push(item);if(search||expanded.has(item.id))walk(item.id);}}
 walk(selected);return rows;
}
function rowHTML(item){
 const depth=tree.depths.get(item.id)-(selected?tree.depths.get(selected)+1:0),kids=tree.children.get(item.id)||[],color=tree.colors.get(item.id),pending=localPending(item.id);
 const edit=renameId===item.id;
 return `<tr class="task-row ${kids.length?'has-children':''} ${detailId===item.id?'selected':''}" data-row="${esc(item.id)}" style="--depth:${depth}"><td><div class="task-cell"><button class="grip" draggable="true" data-drag="${esc(item.id)}" aria-label="Drag ${esc(item.summary)}" title="Drag to reorder or change parent">⠿</button><button class="row-toggle" data-toggle="${esc(item.id)}" ${kids.length?`aria-expanded="${expanded.has(item.id)}"`:'disabled'} aria-label="${expanded.has(item.id)?'Collapse':'Expand'} ${esc(item.summary)}">${kids.length?(expanded.has(item.id)?'▾':'▸'):''}</button><div class="title-wrap">${edit?`<input class="draft-input" id="rename-input" value="${esc(item.summary)}" aria-label="Rename task">`:`<button class="row-title" data-open="${esc(item.id)}" title="${esc(item.summary)}">${esc(itemName(item))}</button>`}<span class="row-id">${esc(item.id.startsWith('local-')?'New · pending':item.id)}${pending?'<span class="pending-dot" title="Pending changes"></span>':''}</span></div>${hasNotes(item)?`<button class="note-button" data-open-notes="${esc(item.id)}" aria-label="Notes for ${esc(item.summary)}" title="Has notes / instructions">${pencil}</button>`:''}${item.dependencies?`<span class="dependency-count" title="Linked issues">♧ ${item.dependencies}</span>`:''}</div></td><td><button class="status-button ${kids.length?'inherited':''}" data-state="${esc(item.id)}" title="${kids.length?'Inherited from children: ':''}${esc(STATUS[color])}">${bulb(color)}<span>${esc(STATUS[color])}</span></button></td><td><select class="row-priority" data-priority="${esc(item.id)}" aria-label="Priority for ${esc(item.summary)}">${priorities.map(p=>`<option ${p===item.priority?'selected':''}>${p}</option>`).join('')}</select></td><td><div class="row-actions"><button data-add-child="${esc(item.id)}" title="Add subtask" aria-label="Add child to ${esc(item.summary)}">+</button><button data-rename="${esc(item.id)}" title="Rename" aria-label="Rename ${esc(item.summary)}">✎</button><button data-open="${esc(item.id)}" title="Details" aria-label="Details for ${esc(item.summary)}">↗</button></div></td></tr>`;
}
function draftHTML(){const depth=draft.parentId?tree.depths.get(draft.parentId)+1:0,relative=Math.max(0,depth-(selected?tree.depths.get(selected)+1:0));return `<tr class="draft-row" style="--depth:${relative}"><td><div class="task-cell"><span style="width:35px;flex-shrink:0"></span><input id="draft-title" class="draft-input" aria-label="New item title" placeholder="Name this ${tier(depth).toLowerCase()}…" value="${esc(draft.text||'')}"></div></td><td colspan="3"><span class="draft-hint">Enter to add · Tab to nest</span></td></tr>`;}
function renderWork(){
 const item=tree.byId.get(selected),path=trail(selected);$('breadcrumbs').innerHTML=`<button data-select="">Pokémon</button>${path.map(x=>`<span>/</span><button data-select="${esc(x.id)}">${esc(itemName(x))}</button>`).join('')}`;
 $('work-title').textContent=item?itemName(item):'Everything';
 const scope=selected?descendants(items,selected):items.map(x=>x.id),green=scope.filter(id=>tree.colors.get(id)==='green').length;
 $('work-summary').textContent=`${scope.length} items · ${green} complete${item?' · '+tier(tree.depths.get(item.id)): ' · All epics'}`;
 const rows=scopedRows(),html=[];let inserted=false;
 for(const row of rows){html.push(rowHTML(row));if(draft&&draft.afterId===row.id){html.push(draftHTML());inserted=true;}}
 if(draft&&!inserted)html.push(draftHTML());$('rows').innerHTML=html.join('');$('empty').hidden=rows.length>0||!!draft;$('visible-count').textContent=`${rows.length} visible / ${scope.length} in view`;
 $('rows').querySelectorAll('[data-drag]').forEach(b=>b.draggable=false);
 if(!rows.length&&$('search').value){$('empty').querySelector('h3').textContent='No matching items';$('empty').querySelector('p').textContent='Try a different search or select a broader section.';}else{$('empty').querySelector('h3').textContent='No items here yet';$('empty').querySelector('p').textContent='Add an item to start organizing this section.';}
}
async function choose(id){await flushEditors();selected=id||null;draft=null;renameId=null;detailId=null;lastDetail=null;await ws.preferences({selected});render();}
async function openDetails(id){await flushEditors();detailId=id;lastDetail=null;renderDetails();renderWork();if(ws.connected&&!id.startsWith('local-'))loadComments(id);}
function renderDetails(){
 const item=tree.byId.get(detailId);if(!item){$('detail-content').hidden=true;$('detail-placeholder').hidden=false;$('detail-id').textContent='Task Details';detailId=null;lastDetail=null;return;}
 $('detail-content').hidden=false;$('detail-placeholder').hidden=true;const fresh=lastDetail!==detailId;$('detail-id').textContent=item.id.startsWith('local-')?'New item · pending':item.id;
 $('detail-parent').textContent=trail(item.parentId).map(itemName).join(' / ')||'Top-level epic';
 if(fresh||!editorDirty.summary)$('detail-title').value=item.summary;
 if(fresh||!editorDirty.description)$('notes').value=item.description;
 const color=tree.colors.get(item.id),kids=tree.children.get(item.id)||[];
 $('detail-state').innerHTML=bulb(color)+' '+esc(STATUS[color]);$('detail-state').className='status-button';$('detail-state').title=kids.length?'Inherited from children':'Change status';
 $('detail-priority').innerHTML=priorities.map(p=>`<option ${p===item.priority?'selected':''}>${p}</option>`).join('');
 $('detail-extra').innerHTML=`<span>${esc(tier(tree.depths.get(item.id)))}</span>${item.fields?.Assignee?`<span>Assignee: ${esc(item.fields.Assignee)}</span>`:''}${kids.length?'<span>Status inherited from children</span>':''}`;
 $('youtrack-link').hidden=item.id.startsWith('local-');$('youtrack-link').href=item.url||'https://thegobindsingh.youtrack.cloud/issue/'+item.id;
 $('detail-children').innerHTML=kids.length?`<div class="detail-subhead"><h3>Children · ${kids.length}</h3><button data-add-child="${esc(item.id)}" class="icon-button" aria-label="Add child">+</button></div>${kids.map(c=>`<button class="detail-child" data-open="${esc(c.id)}">${bulb(tree.colors.get(c.id))}<span>${esc(itemName(c))}</span></button>`).join('')}`:`<button data-add-child="${esc(item.id)}" class="text-button">+ Add subtask</button>`;
 renderComments();setDetailTab(detailTab);lastDetail=detailId;
}
function renderComments(){const item=tree.byId.get(detailId);if(!item)return;const pending=ws.state.operations.filter(x=>x.type==='comment'&&x.issueId===detailId).map(x=>({text:x.text,author:'You · pending',created:Date.now(),pending:true}));const comments=[...(item.comments||[]),...pending];$('comment-count').textContent=item.commentCount+pending.length||'';$('comments').innerHTML=comments.length?comments.map(c=>`<article class="comment ${c.pending?'pending':''}"><header>${esc(c.author)} · ${esc(typeof c.created==='number'?new Date(c.created).toLocaleString():c.created)}</header><p>${esc(c.text)}</p></article>`).join(''):'<p class="muted small">No comments yet.</p>';}
async function loadComments(id){try{const data=await request('/api/comments?id='+encodeURIComponent(id));await ws.transaction(s=>{const item=s.remote.find(x=>x.id===id);if(item){item.comments=data.comments;item.commentCount=data.comments.length;}});}catch(e){if(detailId===id)toast('Could not refresh comments: '+e.message);}}
function setDetailTab(tab){detailTab=tab;$('notes-panel').hidden=tab!=='notes';$('comments-panel').hidden=tab!=='comments';document.querySelectorAll('[data-detail-tab]').forEach(b=>b.classList.toggle('active',b.dataset.detailTab===tab));}
async function flushEditors(){clearTimeout(notesTimer);clearTimeout(titleTimer);if(!detailId||!tree)return;const item=tree.byId.get(detailId);if(!item)return;const patch={},base={};if(editorDirty.description){patch.description=$('notes').value;base.description=editorBase.description;}const title=$('detail-title').value.trim();if(editorDirty.summary&&title){patch.summary=title;base.summary=editorBase.summary;}for(const key of Object.keys(patch))editorDirty[key]=false;if(Object.keys(patch).length)try{await ws.edit(item.id,patch,base);}catch(e){for(const key of Object.keys(patch))editorDirty[key]=true;ws.mode='manual';ws.message='Local save failed · '+e.message;ws.emit();throw e;}}
function showStatus(id){const item=tree.byId.get(id);if((tree.children.get(id)||[]).length){toast('This status is inherited from the children. Change a child’s status to update it.');return;}statusId=id;$('status-target').textContent=itemName(item);$('status-options').innerHTML=Object.entries(STATUS).map(([color,label])=>`<button data-status-color="${color}">${bulb(color)} ${label}</button>`).join('');show('status-dialog');}
function showConnection(){const connected=ws.connected;$('connection-message').textContent=connected?`Connected as ${ws.connection?.user||'your YouTrack account'}. ${ws.connection?.missingStates?.length?'Missing status values must be added before syncing.':'Live sync is available.'}`:'';show('connection-dialog');}
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;safely(async()=>{
 if(b.dataset.close){$(b.dataset.close).close();return;}
 if('select'in b.dataset){await choose(b.dataset.select);return;}
 if(b.dataset.selectorExpand){const id=b.dataset.selectorExpand;selectorExpanded.has(id)?selectorExpanded.delete(id):selectorExpanded.add(id);await ws.preferences({selectorExpanded:[...selectorExpanded]});return;}
 if(b.dataset.toggle){const id=b.dataset.toggle;expanded.has(id)?expanded.delete(id):expanded.add(id);await ws.preferences({expanded:[...expanded]});return;}
 if(b.dataset.open){await openDetails(b.dataset.open);return;}
 if(b.dataset.openNotes){detailTab='notes';await openDetails(b.dataset.openNotes);$('notes').focus();return;}
 if(b.dataset.detailTab){setDetailTab(b.dataset.detailTab);return;}
 if(b.dataset.state){showStatus(b.dataset.state);return;}
 if(b.dataset.statusColor){await ws.edit(statusId,{state:STATES[b.dataset.statusColor]});$('status-dialog').close();return;}
});});
$('all-items').onclick=()=>safely(()=>choose(null));$('search').oninput=()=>renderWork();
$('expand-all').onclick=()=>safely(async()=>{for(const item of items)expanded.add(item.id);await ws.preferences({expanded:[...expanded]});});
$('collapse-all').onclick=()=>safely(async()=>{expanded.clear();await ws.preferences({expanded:[]});});
$('detail-close').onclick=()=>safely(async()=>{await flushEditors();paneSplit.collapse();});
$('detail-expand').onclick=()=>paneSplit.toggleExpanded();
$('detail-state').onclick=()=>showStatus(detailId);
$('detail-priority').onchange=e=>safely(()=>ws.edit(detailId,{priority:e.target.value}));
document.addEventListener('change',e=>{if(e.target.dataset.priority)safely(()=>ws.edit(e.target.dataset.priority,{priority:e.target.value}));});
$('notes').oninput=()=>{if(!editorDirty.description)editorBase.description=tree.byId.get(detailId)?.description;editorDirty.description=true;safely(flushEditors);};
$('detail-title').oninput=()=>{if(!editorDirty.summary)editorBase.summary=tree.byId.get(detailId)?.summary;editorDirty.summary=true;safely(flushEditors);};
$('notes').onblur=()=>safely(flushEditors);$('detail-title').onblur=()=>safely(flushEditors);
$('post-comment').onclick=()=>safely(async()=>{const text=$('comment-input').value.trim();if(!text)return;await ws.comment(detailId,text);$('comment-input').value='';});
$('connect-open').onclick=showConnection;$('banner-connect').onclick=()=>ws.connected?ws.sync(true):showConnection();
$('connection-form').onsubmit=async e=>{e.preventDefault();$('connect-submit').disabled=true;$('connection-message').textContent='Checking your connection…';const token=$('token').value,remember=$('remember-connection').checked;$('token').value='';try{await ws.connect(token,remember);$('connection-message').textContent='Connected. Preparing statuses and synchronizing…';await ws.prepare();if(ws.mode==='manual')$('connection-message').textContent=ws.message;else{$('connection-dialog').close();toast('ROMDex is connected to YouTrack.');}}catch(error){$('connection-message').textContent=error.message;}finally{$('connect-submit').disabled=false;}};
$('save').onclick=()=>safely(async()=>{await flushEditors();await ws.sync(true);});$('help-open').onclick=()=>show('help-dialog');
function focusDraft(){requestAnimationFrame(()=>{$('draft-title')?.focus();});}
async function addDraft(parentId,afterId=null){
 await flushEditors();if(draft?.text?.trim()){toast('Finish or cancel the current new row first.');return;}
 const parent=tree.byId.get(parentId);if(parent){for(const x of trail(parentId)){expanded.add(x.id);selectorExpanded.add(x.id);}}
 const visible=selected?new Set(descendants(items,selected)):null;
 if(parentId!==selected&&visible&&!visible.has(parentId)){selected=parentId;await ws.preferences({selected});}
 if(parentId===null&&selected){selected=null;await ws.preferences({selected:null});}
 draft={parentId,afterId:afterId||(tree.children.get(parentId)||[]).at(-1)?.id||parentId,text:''};renameId=null;render();focusDraft();
}
async function commitDraft(){
 if(!draft)return;const current={...draft,text:$('draft-title')?.value||draft.text||''};
 if(!current.text.trim()){draft=null;render();return;}
 draft=null;const depth=current.parentId?tree.depths.get(current.parentId)+1:0;
 const id=await ws.create(current.parentId,current.text,depth===0?'Epic':depth<=2?'Feature':'Task');
 const siblings=(tree.children.get(current.parentId)||[]).map(x=>x.id).filter(x=>x!==id);const at=siblings.indexOf(current.afterId),beforeId=at>=0?siblings[at+1]:null;
 await ws.move(id,current.parentId,beforeId);draft={parentId:current.parentId,afterId:id,text:''};render();focusDraft();
}
function indentDraft(outdent=false){
 if(!draft)return;draft.text=$('draft-title')?.value||draft.text;
 if(outdent){const parent=tree.byId.get(draft.parentId);if(parent){draft.parentId=parent.parentId;draft.afterId=parent.id;}else return;}
 else{const siblings=tree.children.get(draft.parentId)||[],previous=tree.byId.get(draft.afterId);if(!previous||previous.parentId!==draft.parentId||!siblings.some(x=>x.id===previous.id)){toast('There is no preceding sibling to nest under.');return;}draft.parentId=previous.id;draft.afterId=(tree.children.get(previous.id)||[]).at(-1)?.id||previous.id;expanded.add(previous.id);}
 render();focusDraft();
}
async function beginRename(id){await flushEditors();draft=null;renameId=id;renderWork();requestAnimationFrame(()=>{$('rename-input')?.focus();$('rename-input')?.select();});}
async function commitRename(){if(!renameId)return;const id=renameId,value=$('rename-input')?.value.trim(),parentId=tree.byId.get(id)?.parentId;renameId=null;if(value){await ws.edit(id,{summary:value});await addDraft(parentId,id);}else{toast('Existing items require a title. Use Delete item to remove them.');render();}}
$('add-epic').onclick=()=>safely(()=>addDraft(null));$('add-work').onclick=()=>safely(()=>addDraft(selected));
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;safely(async()=>{
 if(b.dataset.addChild){await addDraft(b.dataset.addChild);return;}
 if(b.dataset.rename){await beginRename(b.dataset.rename);return;}
 if(b.dataset.image){imageId=b.dataset.image;$('image-target').textContent=itemName(tree.byId.get(imageId));$('image-file').value='';show('image-dialog');}
});});
document.addEventListener('dblclick',e=>{const title=e.target.closest('[data-open]');if(title&&title.classList.contains('row-title'))safely(()=>beginRename(title.dataset.open));});
document.addEventListener('input',e=>{if(e.target.id==='draft-title'&&draft)draft.text=e.target.value;});
document.addEventListener('keydown',e=>{
 if(e.target.id==='draft-title'){
  if(e.key==='Enter'){e.preventDefault();safely(commitDraft);}
  if(e.key==='Tab'){e.preventDefault();indentDraft(e.shiftKey);}
  if(e.key==='Escape'){e.preventDefault();draft=null;render();$('add-work').focus();}
 }else if(e.target.id==='rename-input'){
  if(e.key==='Enter'){e.preventDefault();safely(commitRename);}
  if(e.key==='Escape'){e.preventDefault();renameId=null;render();}
 }else if(e.target.id==='comment-input'&&e.key==='Enter'&&(e.ctrlKey||e.metaKey)){$('post-comment').click();}
});
function clearDrop(){document.querySelectorAll('.drop-before,.drop-after,.drop-target').forEach(x=>x.classList.remove('drop-before','drop-after','drop-target'));$('drop-message').hidden=true;drop=null;}
function locateDrop(x,y){
 if(!drag)return;const targetElement=document.elementFromPoint(x,y),row=targetElement?.closest('[data-row]'),selector=targetElement?.closest('[data-selector]');clearDrop();if(!row&&!selector)return;
 const target=tree.byId.get(row?.dataset.row||selector?.dataset.selector);if(!target||target.id===drag.id)return;
 let parentId,beforeId=null,after=true;
 if(selector){parentId=target.id;selector.classList.add('drop-target');}
 else{
  const rect=row.getBoundingClientRect();after=y>=rect.top+rect.height/2;
  const delta=Math.round((x-drag.startX)/26);parentId=target.parentId;
  if(delta>0){parentId=target.id;after=true;}
  else if(delta<0){let ancestor=target;for(let n=0;n<-delta&&ancestor.parentId;n++)ancestor=tree.byId.get(ancestor.parentId);parentId=ancestor.parentId;const siblings=tree.children.get(parentId)||[],at=siblings.findIndex(x=>x.id===ancestor.id);beforeId=siblings[at+(after?1:0)]?.id||null;}
  if(delta===0){const siblings=tree.children.get(parentId)||[],at=siblings.findIndex(x=>x.id===target.id);beforeId=siblings[at+(after?1:0)]?.id||null;}
  row.classList.add(after?'drop-after':'drop-before');
 }
 try{validateMove(items,drag.id,parentId);drop={parentId,beforeId};document.body.dataset.dragStatus='target:'+(parentId||'root');$('drop-message').textContent=`Move “${itemName(tree.byId.get(drag.id))}” ${parentId?'under “'+itemName(tree.byId.get(parentId))+'”':'to top level'}${beforeId?' · before “'+itemName(tree.byId.get(beforeId))+'”':''}`;$('drop-message').hidden=false;}catch(error){$('drop-message').textContent=error.message;$('drop-message').hidden=false;}
}
let suppressClickUntil=0;
document.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;const handle=e.target.closest('[data-drag],.selector-main');if(!handle)return;
 const id=handle.dataset.drag||handle.dataset.select;if(!tree.byId.has(id))return;
 drag={id,startX:e.clientX,startY:e.clientY,pointerId:e.pointerId,active:false};handle.setPointerCapture(e.pointerId);
});
document.addEventListener('pointermove',e=>{
 if(!drag||drag.pointerId!==e.pointerId)return;
 if(!drag.active&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<6)return;
 drag.active=true;document.body.classList.add('drag-active');document.body.dataset.dragStatus='started:'+drag.id;e.preventDefault();locateDrop(e.clientX,e.clientY);
 const hit=document.elementFromPoint(e.clientX,e.clientY),scroller=hit?.closest('#selectors,.table-scroll');if(scroller){const r=scroller.getBoundingClientRect();if(e.clientY<r.top+35)scroller.scrollTop-=14;else if(e.clientY>r.bottom-35)scroller.scrollTop+=14;}
},{passive:false});
function finishDrag(cancel=false){
 if(!drag)return;const active=drag.active,pending=active&&!cancel&&drop&&{...drop},id=drag.id;if(active)suppressClickUntil=performance.now()+350;
 document.body.dataset.dragStatus=pending?'dropped:'+(pending.parentId||'root'):'cancelled';clearDrop();drag=null;document.body.classList.remove('drag-active');
 if(pending)safely(async()=>{await flushEditors();if(pending.parentId){expanded.add(pending.parentId);selectorExpanded.add(pending.parentId);}await ws.move(id,pending.parentId,pending.beforeId);toast('Item moved.');});else if(active)render();
}
document.addEventListener('pointerup',()=>finishDrag());document.addEventListener('pointercancel',()=>finishDrag(true));
document.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag)finishDrag(true);});
$('image-file').onchange=()=>safely(async()=>{
 const file=$('image-file').files[0];if(!file)return;if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw new Error('Choose a PNG, JPG, WebP, or GIF image.');if(file.size>8*1024*1024)throw new Error('Choose an image smaller than 8 MB.');
 const bitmap=await createImageBitmap(file),size=Math.min(1,192/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*size));canvas.height=Math.max(1,Math.round(bitmap.height*size));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 await ws.preferences({images:{...ws.state.images,[imageId]:canvas.toDataURL('image/png')}});$('image-dialog').close();toast('Selector image saved.');
});
$('remove-image').onclick=()=>safely(async()=>{const images={...ws.state.images};delete images[imageId];await ws.preferences({images});$('image-dialog').close();});
$('delete-item').onclick=()=>{deleteIds=[detailId,...descendants(items,detailId)];$('delete-list').innerHTML=deleteIds.map(id=>`<li>${esc(id)} · ${esc(itemName(tree.byId.get(id)))}</li>`).join('');show('delete-dialog');};
$('confirm-delete').onclick=()=>safely(async()=>{await flushEditors();await ws.remove(deleteIds);detailId=null;lastDetail=null;renderDetails();$('delete-dialog').close();toast('Deletion queued for YouTrack.');});
function displayValue(value){if(value===null||value===undefined)return '(empty)';if(typeof value==='object')return JSON.stringify(value,null,2);return String(value);}
function showReview(){
 const block=ws.state.blocked;if(!block){toast(ws.message);return;}$('review-message').textContent='';
 const op=ws.state.operations.find(x=>x.opId===block.opId),item=tree.byId.get(op?.issueId)||op?.base;
 let html=`<p><b>${esc(itemName(item))}</b> · ${esc(op?.issueId)}</p>`;
 if(block.error){html+=`<p>${esc(block.error)}</p><p class="small">The pending action was not confirmed. Retry it after fixing the problem, or cancel this pending action.</p><pre class="pending-preview">${esc(displayValue(op?.patch||op?.item||op?.text||op?.ids))}</pre>`;}
 else if(block.uncertain){html+=`<p>${esc(block.message)}</p><p class="small">Check YouTrack before retrying to avoid duplicate items or comments.</p><label>Resolution<select id="uncertain-action"><option value="">Choose…</option>${op?.type==='create'?'<option value="created">The item exists in YouTrack</option>':'<option value="posted">The comment was already posted</option>'}<option value="retry">I checked; it was not created or posted. Retry.</option></select></label>${op?.type==='create'?'<label>YouTrack issue ID<input id="uncertain-id" placeholder="PMON-…"></label>':''}`;}
 else for(const [i,c] of (block.conflicts||[]).entries()){
  html+=`<section class="conflict" data-conflict="${i}"><h3>${esc(c.id||'')} ${esc(c.field.replace(/^__/,'').replace(/__$/,''))}</h3><div class="conflict-columns"><div><b>Your dashboard</b><pre>${esc(displayValue(c.local))}</pre></div><div><b>YouTrack</b><pre>${esc(displayValue(c.remote))}</pre></div></div>${!c.field.startsWith('__')?`<label>Choose a version<select data-resolution="${i}"><option value="">Choose…</option><option value="local">Keep dashboard version</option><option value="remote">Keep YouTrack version</option>${['description','summary'].includes(c.field)?'<option value="merge">Combine / edit manually</option>':''}</select></label><textarea data-merge="${i}" aria-label="Combined ${esc(c.field)}" hidden>${esc(c.local)}</textarea>`:`<p class="small">${c.field==='__delete__'?'This item changed after you selected it for deletion. Commit only if you still want to delete its current version.':c.field==='__children__'?'New children were found. Cancel and review the updated subtree before deleting.':c.field==='__missing__'?'This item was deleted in YouTrack. Copy any notes you need, then cancel the pending edit.':'YouTrack did not confirm the requested values. Review its current version before retrying.'}</p>`}</section>`;
 }
 $('review-content').innerHTML=html;$('commit-conflict').disabled=(block.conflicts||[]).some(c=>['__missing__','__children__','__verify__'].includes(c.field));show('review-dialog');
}
$('review-content').onchange=e=>{if(e.target.dataset.resolution!==undefined){const i=e.target.dataset.resolution;$('review-content').querySelector(`[data-merge="${i}"]`).hidden=e.target.value!=='merge';}};
$('discard-conflict').onclick=()=>safely(async()=>{await ws.resolve({discard:true});$('review-dialog').close();});
$('commit-conflict').onclick=async()=>{
 const block=ws.state.blocked;if(!block)return;$('commit-conflict').disabled=true;
 try{
  if(block.error){await ws.transaction(s=>s.blocked=null);ws.mode='syncing';await ws.sync(true);}
  else if(block.uncertain){const action=$('uncertain-action').value;if(!action)throw new Error('Choose how to resolve the uncertain save.');await request('/api/acknowledge',{opId:block.opId,action,issueId:$('uncertain-id')?.value.trim()});await ws.transaction(s=>s.blocked=null);ws.mode='syncing';await ws.sync(true);}
  else{const choices={};for(const [i,c]of block.conflicts.entries()){if(c.field.startsWith('__'))continue;const mode=$('review-content').querySelector(`[data-resolution="${i}"]`).value;if(!mode)throw new Error('Choose a version for each field.');choices[c.field]={mode,value:$('review-content').querySelector(`[data-merge="${i}"]`).value};}await ws.resolve(choices);}
  if(!ws.state.blocked)$('review-dialog').close();else showReview();
 }catch(e){$('review-message').textContent=e.message;}finally{$('commit-conflict').disabled=false;}
};
ws.addEventListener('change',render);ws.addEventListener('connectneeded',showConnection);ws.addEventListener('reviewneeded',()=>showReview());
ws.addEventListener('mapping',e=>{const mapping=e.detail,id=x=>mapping[x]||x;selected=id(selected);detailId=id(detailId);renameId=id(renameId);if(draft){draft.parentId=id(draft.parentId);draft.afterId=id(draft.afterId);}expanded=new Set([...expanded].map(id));selectorExpanded=new Set([...selectorExpanded].map(id));});
ws.addEventListener('refreshed',()=>{if(detailId&&ws.connected&&!detailId.startsWith('local-'))loadComments(detailId);});
window.addEventListener('beforeunload',e=>{if(ws.state?.operations.length||ws.pendingWrites||editorDirty.description||editorDirty.summary||draft?.text?.trim()){e.preventDefault();e.returnValue='';}});
await ws.init();paneSplit=new TraySplit({host:document.querySelector('.work-trays'),handle:$('pane-divider'),details:$('details'),preference:ws.state.paneLayout,onChange:layout=>safely(()=>ws.preferences({paneLayout:layout}))});selected=ws.state.selected||(ws.items.find(x=>!x.parentId)?.id??null);expanded=new Set(ws.state.expanded);selectorExpanded=new Set(ws.state.selectorExpanded);if(!selectorExpanded.size&&selected)selectorExpanded.add(selected);render();
