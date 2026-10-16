import {STATUS,STATES,clone,indexTree,descendants,validateMove,materialize,statusOf,hasMeaningfulNotes,saveNeedsAttention} from './core.mjs';
import {Workspace,request} from './store.mjs';
import {rowDropTarget} from './drop-target.mjs';
import {TraySplit} from './split-pane.mjs';
import {DetailNavigation} from './detail-navigation.mjs';
import {workRows} from './work-view.mjs';
import {refreshEditor} from './editor-view.mjs';
import {renderSelectorTree} from './selector-view.mjs';
import {connectionIndicator} from './sync-control.mjs';
import {PRIORITIES,COMPLEXITIES,fieldPresentation} from './field-tags.mjs';
let paneSplit=null,reviewSignature=null,complexitySetupBusy=false,workRowsMarkup=null;
const $=id=>document.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pencil='<svg class="pencil-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M11 1h2v1h1v1h1v2h-1v1h-1V5h-1V4h-1V3h-1V2h1zM9 3h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1H9v1H8v1H7v1H6v1H2v-4h1V9h1V8h1V7h1V6h1V5h1V4h1zM3 11v2h2v-1H4v-1z"/></svg>';
const paper='<svg class="paper-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M3 1h7v1h1v1h1v1h1v11H3V1zm1 1v12h8V6H9V2H4zm6 1v2h2v-1h-1V3h-1zM5 7h5v1H5V7zm0 3h5v1H5v-1zm0 2h4v1H5v-1z"/></svg>';
function fieldControl(item,field){
 const value=item[field]??null,presentation=fieldPresentation(field,value),choices=field==='priority'?PRIORITIES:COMPLEXITIES,label=field==='priority'?'Priority':'Complexity';
 const ready=field==='priority'||ws.connection?.complexity?.ready===true;
 const title=!ready?(ws.connection?.complexity?.message||'Restart ROMDex and Set Up Complexity in Connection'):presentation.nativeOnly?'URGENT · YouTrack: Show-stopper. Selecting URGENT Writes Critical.':presentation.unsupported?'Native Value Has No ROMDex Mapping. It Is Preserved Until Changed.':'Change '+label;
 const current=presentation.nativeOnly||presentation.unsupported?'<option value="'+esc(value)+'" selected>'+esc(presentation.label)+(presentation.nativeOnly?' · Show-stopper (Current)':' · Current')+'</option>':'';
 const options=(field==='complexity'?'<option value="" '+(value===null?'selected':'')+'>Not Set</option>':'')+current+choices.map(x=>'<option value="'+esc(x.value)+'" '+(x.value===value?'selected':'')+'>'+esc(x.label)+'</option>').join('');
 return '<span class="field-control"><span class="field-tag '+presentation.color+'" aria-hidden="true">'+esc(presentation.label)+'</span><select class="field-select" data-field="'+field+'" data-issue="'+esc(item.id)+'" aria-label="'+label+' for '+esc(item.summary)+'" title="'+esc(title)+'" '+(!ready?'disabled':'')+'>'+options+'</select></span>';
}
const ws=new Workspace();let tree,items=[],selected=null,detailId=null,detailTab='notes',expanded=new Set(),selectorExpanded=new Set(),draft=null,renameId=null,imageId=null,imageDraft=null,imageChanged=false,deleteIds=[],statusId=null,drag=null,drop=null,toastTimer,notesTimer,titleTimer,lastDetail=null;const editorDirty={},editorBase={};
const detailNavigation=new DetailNavigation();
let renameText=null;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
async function safely(fn){try{return await fn();}catch(e){toast(e.message);}}
function show(id){if(!$(id).open)$(id).showModal();}
function bulb(color){return `<span class="bulb ${color}" aria-hidden="true"></span>`;}
function itemName(item){return item?.summary?.replace(/^\[Epic\]\s*/,'')||'Untitled';}
function countLabel(count,label){return count+' '+label+(count===1?'':'s');}
function tier(depth){return ['Epic','Story','Verse'][depth]||'Task';}
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
 const saveAttention=saveNeedsAttention(ws.state,{connected:ws.connected,automaticSyncEnabled:ws.automaticSyncEnabled||ws.manualSyncActive,mode:ws.mode,failures:ws.failures,missingStates:ws.connection?.missingStates},editorDirty);
 $('save-light').className='bulb save-light '+(saveAttention?'red':'green');$('save').classList.toggle('dirty',saveAttention);
 $('save').title=ws.message;$('save').setAttribute('aria-label','Save Changes — '+ws.message);
 const link=connectionIndicator(ws);$('connection-light').className='bulb '+link.color;$('connection-label').textContent=link.label;$('connection-status').title=link.label;
 $('auto-sync').setAttribute('aria-checked',String(ws.automaticSyncEnabled));$('auto-sync-value').textContent=ws.automaticSyncEnabled?'On':'Off';$('auto-sync').disabled=ws.settingBusy||!ws.syncControl;
 $('auto-sync').title=!ws.syncControl?'Restart ROMDex to Enable Auto-Sync Data Controls':ws.settingBusy?'Finishing the Current Request and Updating Auto-Sync Data':ws.automaticSyncEnabled?'Turn Off Auto-Sync Data in All ROMDex Windows':'Turn On Auto-Sync Data in All ROMDex Windows';
 $('setup-complexity').hidden=ws.connection?.complexity?.ready===true;$('setup-complexity').disabled=complexitySetupBusy||!ws.connected||!ws.connection?.complexity;
 $('offline-banner').hidden=ws.connected&&!ws.state.blocked;
 $('offline-text').textContent=ws.connected?ws.message:`Imported ${items.length} YouTrack items. Connect to receive live updates and save edits.`;
 $('banner-connect').textContent=ws.connected?'Save Changes':'Connect YouTrack';
 $('all-count').textContent=items.length;$('all-items').classList.toggle('active',!selected);
 renderSelectors();renderWork();document.querySelectorAll('.selector-main,[data-drag]').forEach(b=>b.draggable=false);renderDetails();paneSplit?.apply();
 if(focus&&$(focus.id)){$(focus.id).value=focus.value;$(focus.id).focus();$(focus.id).setSelectionRange(focus.start,focus.end);}
}
function renderSelectors(){
 renderSelectorTree({root:$('selectors'),tree,images:ws.state.images,selected,expanded:selectorExpanded,itemName,tier,esc,bulb});
}
function scopedRows(){
 return workRows({tree,selected,search:$('search').value,expanded,hideCompleted:ws.state.hideCompleted===true,keepIds:[renameId,draft?.parentId,draft?.afterId]});
}
function rowHTML(item){
 const depth=tree.depths.get(item.id)-(selected?tree.depths.get(selected)+1:0),kids=tree.children.get(item.id)||[],color=tree.colors.get(item.id),pending=localPending(item.id);
 const edit=renameId===item.id;
 return `<tr class="task-row ${kids.length?'has-children':''} ${detailId===item.id?'selected':''}" data-row="${esc(item.id)}" style="--depth:${depth}"><td><div class="task-cell"><button class="status-button row-status ${kids.length?'inherited':''}" data-state="${esc(item.id)}" aria-label="Set Status for ${esc(item.summary)}" title="${kids.length?'Inherited from Children: ':''}${esc(STATUS[color])} · Click to Set Assigned Status">${bulb(color)}<span class="sr-only">${esc(STATUS[color])}</span></button><button class="grip" draggable="true" data-drag="${esc(item.id)}" aria-label="Drag ${esc(item.summary)}" title="Drag to Reorder or Change Parent">⠿</button><button class="row-toggle" data-toggle="${esc(item.id)}" ${kids.length?`aria-expanded="${expanded.has(item.id)}"`:'disabled'} aria-label="${expanded.has(item.id)?'Collapse':'Expand'} ${esc(item.summary)}">${kids.length?(expanded.has(item.id)?'▾':'▸'):''}</button><div class="title-wrap">${edit?`<input class="draft-input" id="rename-input" value="${esc(renameText??item.summary)}" aria-label="Rename Task">`:`<button class="row-title" data-open="${esc(item.id)}" title="${esc(item.summary)}">${esc(itemName(item))}</button>`}${hasNotes(item)?`<button class="note-button" data-open-notes="${esc(item.id)}" aria-label="Notes for ${esc(item.summary)}" title="Has Notes / Instructions">${paper}</button>`:''}<span class="row-id">${esc(item.id.startsWith('local-')?'New · Pending':item.id)}${pending?'<span class="pending-dot" title="Pending Changes"></span>':''}</span></div>${item.dependencies?`<span class="dependency-count" title="Linked Issues">♧ ${item.dependencies}</span>`:''}</div></td><td>${fieldControl(item,'priority')}</td><td>${fieldControl(item,'complexity')}</td><td><div class="row-actions"><button data-add-child="${esc(item.id)}" title="Add Subtask" aria-label="Add Child to ${esc(item.summary)}">+</button><button data-rename="${esc(item.id)}" title="Rename" aria-label="Rename ${esc(item.summary)}">✎</button><button data-delete="${esc(item.id)}" title="Delete Item" aria-label="Delete ${esc(item.summary)}"><svg class="trash-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M5 1h6v2h3v2H2V3h3V1zM6 2v1h4V2H6zM3 6h10l-1 9H4L3 6zm3 1v6h1V7H6zm3 0v6h1V7H9z"/></svg></button></div></td></tr>`;
}
function draftHTML(){const depth=draft.parentId?tree.depths.get(draft.parentId)+1:0,relative=Math.max(0,depth-(selected?tree.depths.get(selected)+1:0));return `<tr class="draft-row" style="--depth:${relative}"><td><div class="task-cell"><span class="draft-status" aria-hidden="true">${bulb('grey')}</span><span class="draft-indent" aria-hidden="true"></span><input id="draft-title" class="draft-input" aria-label="New ${tier(depth)} Title" placeholder="${tier(depth)} Title…" value="${esc(draft.text||'')}"></div></td><td colspan="3"><span class="draft-hint">Enter to Add · Tab to Nest</span></td></tr>`;}
function renderWork(){
 const hiddenCompleted=ws.state.hideCompleted===true;$('toggle-completed').textContent=hiddenCompleted?'Show Completed':'Hide Completed';$('toggle-completed').setAttribute('aria-pressed',String(hiddenCompleted));
 const item=tree.byId.get(selected),path=trail(selected);$('breadcrumbs').innerHTML=`<button data-select="">Pokémon</button>${path.map(x=>`<span>/</span><button data-select="${esc(x.id)}">${esc(itemName(x))}</button>`).join('')}`;
 $('work-title').textContent=item?itemName(item):'All Tasks';
 const scope=selected?descendants(items,selected):items.map(x=>x.id),green=scope.filter(id=>tree.colors.get(id)==='green').length;
 $('work-summary').textContent=`${countLabel(scope.length,'Item')} · ${green} Complete${item?' · '+tier(tree.depths.get(item.id)): ' · All Epics'}`;
 const rows=scopedRows(),html=[];let inserted=false;
 for(const row of rows){html.push(rowHTML(row));if(draft&&draft.afterId===row.id){html.push(draftHTML());inserted=true;}}
 if(draft&&!inserted)html.push(draftHTML());const markup=html.join('');if(markup!==workRowsMarkup){$('rows').innerHTML=markup;workRowsMarkup=markup;}$('empty').hidden=rows.length>0||!!draft;$('visible-count').textContent=`${rows.length} Visible / ${scope.length} in View`;
 $('rows').querySelectorAll('[data-drag]').forEach(b=>b.draggable=false);
 if(!rows.length&&$('search').value){$('empty').querySelector('h3').textContent='No Matching Items';$('empty').querySelector('p').textContent=hiddenCompleted?'Completed items are hidden. Show Completed or try a different search.':'Try a different search or select a broader section.';}else if(!rows.length&&hiddenCompleted&&green){$('empty').querySelector('h3').textContent='Completed Items Hidden';$('empty').querySelector('p').textContent='Click Show Completed to see them, or add a new item.';}else{$('empty').querySelector('h3').textContent='No Items Here Yet';$('empty').querySelector('p').textContent='Add an item to start organizing this section.';}
}
async function choose(id){await flushEditors();selected=id||null;draft=null;renameId=null;detailId=null;lastDetail=null;detailNavigation.reset();await ws.preferences({selected});render();}
async function openDetails(id,fromChild=false){await flushEditors();if(!tree.byId.has(id))return;detailNavigation.open(detailId,id,fromChild);displayDetails(id);}
function displayDetails(id){detailId=id;lastDetail=null;renderDetails();renderWork();if(ws.connected&&!id.startsWith('local-'))loadComments(id);}
async function backDetails(){await flushEditors();const id=detailNavigation.back(tree.byId);if(id)displayDetails(id);else renderDetails();}
function renderDetails(){
 const previous=tree.byId.get(detailNavigation.destination(tree.byId));$('detail-back').disabled=!previous;$('detail-back').title=previous?'Back to '+itemName(previous):'Starting Item';$('detail-back').setAttribute('aria-label',previous?'Back to '+itemName(previous):'Back');
 const item=tree.byId.get(detailId);if(!item){$('detail-content').hidden=true;$('detail-placeholder').hidden=false;$('detail-id').textContent='Task Details';detailId=null;lastDetail=null;return;}
 $('detail-content').hidden=false;$('detail-placeholder').hidden=true;const fresh=lastDetail!==detailId;$('detail-id').textContent=item.id.startsWith('local-')?'New Item · Pending':item.id;
 $('detail-parent').textContent=trail(item.parentId).map(itemName).join(' / ')||'Top-Level Epic';
 refreshEditor($('detail-title'),item.summary,{fresh,dirty:editorDirty.summary,activeElement:document.activeElement});
 refreshEditor($('notes'),item.description,{fresh,dirty:editorDirty.description,activeElement:document.activeElement});
 const color=tree.colors.get(item.id),kids=tree.children.get(item.id)||[];
 $('detail-state').innerHTML=bulb(color)+' '+esc(STATUS[color]);$('detail-state').className='status-button';$('detail-state').title=kids.length?'Inherited from Children · Click to Set Assigned Status':'Change Status';
 $('detail-priority').innerHTML=fieldControl(item,'priority');$('detail-complexity').innerHTML=fieldControl(item,'complexity');
 $('detail-extra').innerHTML=`<span>${esc(tier(tree.depths.get(item.id)))}</span>${item.fields?.Assignee?`<span>Assignee: ${esc(item.fields.Assignee)}</span>`:''}${kids.length?'<span>Status Inherited from Children</span>':''}`;
 $('youtrack-link').hidden=item.id.startsWith('local-');$('youtrack-link').href=item.url||'https://thegobindsingh.youtrack.cloud/issue/'+item.id;
 $('detail-children').innerHTML=kids.length?`<div class="detail-subhead"><h3>Children · ${kids.length}</h3><button data-add-child="${esc(item.id)}" class="icon-button" aria-label="Add Child">+</button></div>${kids.map(c=>`<button class="detail-child" data-open="${esc(c.id)}">${bulb(tree.colors.get(c.id))}<span>${esc(itemName(c))}</span></button>`).join('')}`:`<button data-add-child="${esc(item.id)}" class="text-button">+ Add Subtask</button>`;
 renderComments();setDetailTab(detailTab);lastDetail=detailId;
}
function renderComments(){const item=tree.byId.get(detailId);if(!item)return;const pending=ws.state.operations.filter(x=>x.type==='comment'&&x.issueId===detailId).map(x=>({text:x.text,author:'You · Pending',created:Date.now(),pending:true}));const comments=[...(item.comments||[]),...pending];$('comment-count').textContent=item.commentCount+pending.length||'';$('comments').innerHTML=comments.length?comments.map(c=>`<article class="comment ${c.pending?'pending':''}"><header>${esc(c.author)} · ${esc(typeof c.created==='number'?new Date(c.created).toLocaleString():c.created)}</header><p>${esc(c.text)}</p></article>`).join(''):'<p class="muted small">No comments yet.</p>';}
async function loadComments(id){try{const data=await ws.comments(id);if(!data)return;await ws.transaction(s=>{const item=s.remote.find(x=>x.id===id);if(item){item.comments=data.comments;item.commentCount=data.comments.length;}});}catch(e){if(detailId===id)toast('Could not refresh comments: '+e.message);}}
function setDetailTab(tab){detailTab=tab;$('notes-panel').hidden=tab!=='notes';$('comments-panel').hidden=tab!=='comments';document.querySelectorAll('[data-detail-tab]').forEach(b=>b.classList.toggle('active',b.dataset.detailTab===tab));}
async function flushEditors(){clearTimeout(notesTimer);clearTimeout(titleTimer);if(!detailId||!tree)return;const item=tree.byId.get(detailId);if(!item)return;const patch={},base={};if(editorDirty.description){patch.description=$('notes').value;base.description=editorBase.description;}const title=$('detail-title').value.trim();if(editorDirty.summary&&title){patch.summary=title;base.summary=editorBase.summary;}for(const key of Object.keys(patch))editorDirty[key]=false;if(Object.keys(patch).length)try{await ws.edit(item.id,patch,base);}catch(e){for(const key of Object.keys(patch))editorDirty[key]=true;ws.mode='manual';ws.message='Local Save Failed · '+e.message;ws.emit();throw e;}}
function showStatus(id){
 const item=tree.byId.get(id);if(!item)return;
 if(ws.connected&&!ws.connection?.localAssignedStatus){toast('Restart ROMDex to Enable Assigned Status Editing.');return;}
 statusId=id;const kids=tree.children.get(id)||[],own=item.assignedState??item.state;
 $('status-target').textContent=itemName(item)+(kids.length?' · Displayed status is inherited from children. Assigned: '+own+'. This value appears when the item has no children.':'');
 $('status-options').innerHTML=Object.entries(STATUS).map(([color,label])=>`<button data-status-color="${color}" aria-pressed="${statusOf(own)===color}">${bulb(color)} ${label}</button>`).join('');show('status-dialog');
}
function showConnection(){const connected=ws.connected;$('remember-connection').checked=ws.rememberedConnection===true;$('connection-message').textContent=connected?`Connected as ${ws.connection?.user||'your YouTrack account'}. ${ws.connection?.missingStates?.length?'Missing status values must be added before syncing.':'Live sync is available.'}`:'';show('connection-dialog');}
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;safely(async()=>{
 if(b.dataset.close){$(b.dataset.close).close();return;}
 if('select'in b.dataset){await choose(b.dataset.select);return;}
 if(b.dataset.selectorExpand){const id=b.dataset.selectorExpand;selectorExpanded.has(id)?selectorExpanded.delete(id):selectorExpanded.add(id);await ws.preferences({selectorExpanded:[...selectorExpanded]});return;}
 if(b.dataset.toggle){const id=b.dataset.toggle;expanded.has(id)?expanded.delete(id):expanded.add(id);await ws.preferences({expanded:[...expanded]});return;}
 if(b.dataset.open){await openDetails(b.dataset.open,!!b.closest('#detail-children'));return;}
 if(b.dataset.openNotes){detailTab='notes';await openDetails(b.dataset.openNotes);$('notes').focus();return;}
 if(b.dataset.detailTab){setDetailTab(b.dataset.detailTab);return;}
 if(b.dataset.state){showStatus(b.dataset.state);return;}
 if(b.dataset.statusColor){const item=tree.byId.get(statusId);await ws.edit(statusId,{assignedState:STATES[b.dataset.statusColor]},{assignedState:item.assignedState??item.state});$('status-dialog').close();return;}
});});
$('all-items').onclick=()=>safely(()=>choose(null));$('search').oninput=()=>renderWork();
$('expand-all').onclick=()=>safely(async()=>{for(const item of items)expanded.add(item.id);await ws.preferences({expanded:[...expanded]});});
$('collapse-all').onclick=()=>safely(async()=>{expanded.clear();await ws.preferences({expanded:[]});});
$('toggle-completed').onclick=()=>safely(async()=>{await flushEditors();await ws.preferences({hideCompleted:ws.state.hideCompleted!==true});});
$('detail-minimize').onclick=()=>safely(async()=>{await flushEditors();paneSplit.collapse();});
$('detail-expand').onclick=()=>safely(async()=>{await flushEditors();paneSplit.toggleExpanded();});
$('detail-back').onclick=()=>safely(backDetails);
$('detail-state').onclick=()=>showStatus(detailId);
document.addEventListener('change',e=>{const field=e.target.dataset.field;if(['priority','complexity'].includes(field))safely(()=>ws.edit(e.target.dataset.issue,{[field]:field==='complexity'?(e.target.value||null):e.target.value}));});
$('notes').oninput=()=>{if(!editorDirty.description)editorBase.description=tree.byId.get(detailId)?.description;editorDirty.description=true;safely(flushEditors);};
$('detail-title').oninput=()=>{if(!editorDirty.summary)editorBase.summary=tree.byId.get(detailId)?.summary;editorDirty.summary=true;safely(flushEditors);};
$('notes').onblur=()=>safely(flushEditors);$('detail-title').onblur=()=>safely(flushEditors);
$('post-comment').onclick=()=>safely(async()=>{const text=$('comment-input').value.trim();if(!text)return;await ws.comment(detailId,text);$('comment-input').value='';});
$('setup-complexity').onclick=()=>safely(async()=>{if(complexitySetupBusy)return;complexitySetupBusy=true;$('setup-complexity').disabled=true;try{const result=await request('/api/complexity-setup',{});ws.applyStatus(result);ws.emit();$('connection-message').textContent='Complexity is ready: LOW, MID, HIGH and INSANE.';}catch(error){$('connection-message').textContent=error.message;throw error;}finally{complexitySetupBusy=false;render();}});
$('connect-open').onclick=showConnection;$('banner-connect').onclick=()=>ws.connected?ws.sync(true):showConnection();
$('connection-form').onsubmit=async e=>{e.preventDefault();$('connect-submit').disabled=true;$('connection-message').textContent='Checking your connection…';const token=$('token').value,remember=$('remember-connection').checked;$('token').value='';try{await ws.connect(token,remember);$('connection-message').textContent='Connected. Preparing statuses and synchronizing…';await ws.prepare();if(ws.mode==='manual')$('connection-message').textContent=ws.message;else{$('connection-dialog').close();toast('ROMDex is connected to YouTrack.');}}catch(error){$('connection-message').textContent=error.message;}finally{$('connect-submit').disabled=false;}};
$('save').onclick=()=>safely(async()=>{await flushEditors();await ws.sync(true);});
$('auto-sync').onclick=()=>safely(async()=>{await flushEditors();await ws.setAutomaticSync(!ws.automaticSyncEnabled);toast(ws.automaticSyncEnabled?'Auto-Sync Data Is On.':'Auto-Sync Data Is Off. Save Changes Runs a One-Time Sync.');});
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
async function beginRename(id){await flushEditors();draft=null;renameId=id;renameText=tree.byId.get(id)?.summary??'';renderWork();requestAnimationFrame(()=>{$('rename-input')?.focus();$('rename-input')?.select();});}
async function commitRename(){if(!renameId)return;const id=renameId,value=$('rename-input')?.value.trim(),parentId=tree.byId.get(id)?.parentId;renameId=null;if(value){await ws.edit(id,{summary:value});await addDraft(parentId,id);}else{toast('Existing items require a title. Use Delete Item to remove them.');render();}}
$('add-epic').onclick=()=>safely(()=>addDraft(null));$('add-work').onclick=()=>safely(()=>addDraft(selected));
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;safely(async()=>{
 if(b.dataset.delete){await showDeletion(b.dataset.delete);return;}
 if(b.dataset.addChild){await addDraft(b.dataset.addChild);return;}
 if(b.dataset.rename){await beginRename(b.dataset.rename);return;}
 if(b.dataset.selectorSettings||b.dataset.image){openTileSettings(b.dataset.selectorSettings||b.dataset.image);return;}
});});
document.addEventListener('dblclick',e=>{const title=e.target.closest('[data-open]');if(title&&title.classList.contains('row-title'))safely(()=>beginRename(title.dataset.open));});
document.addEventListener('input',e=>{if(e.target.id==='draft-title'&&draft)draft.text=e.target.value;if(e.target.id==='rename-input')renameText=e.target.value;});
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
function clearDrop(){document.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));$('drop-guide').hidden=true;$('drop-message').hidden=true;drop=null;}
function showDropGuide(target){
 const row=[...$('rows').querySelectorAll('[data-row]')].find(row=>row.dataset.row===target.anchorId);if(!row)return;
 const scroller=document.querySelector('.table-scroll'),table=scroller.querySelector('table'),guide=$('drop-guide');
 const bounds=scroller.getBoundingClientRect(),rowBounds=row.getBoundingClientRect(),tableBounds=table.getBoundingClientRect();
 const step=parseFloat(getComputedStyle(scroller).getPropertyValue('--hierarchy-step'))||21;
 const left=row.cells[0].getBoundingClientRect().left+target.displayDepth*step;
 guide.style.left=(left-bounds.left+scroller.scrollLeft-scroller.clientLeft)+'px';
 guide.style.top=((target.after?rowBounds.bottom:rowBounds.top)-bounds.top+scroller.scrollTop-scroller.clientTop)+'px';
 guide.style.width=Math.max(0,tableBounds.right-left)+'px';guide.dataset.depth=target.displayDepth;guide.hidden=false;
}
function locateDrop(x,y){
 if(!drag)return;const targetElement=document.elementFromPoint(x,y),row=targetElement?.closest('[data-row]'),selector=targetElement?.closest('[data-selector]');clearDrop();if(!row&&!selector)return;
 const target=tree.byId.get(row?.dataset.row||selector?.dataset.selector);if(!target||target.id===drag.id)return;
 try{
  if(selector){validateMove(items,drag.id,target.id);drop={parentId:target.id,beforeId:null};selector.classList.add('drop-target');}
  else{const rect=row.getBoundingClientRect();drop=rowDropTarget({items,tree,dragId:drag.id,targetId:target.id,delta:Math.round((x-drag.startX)/26),after:y>=rect.top+rect.height/2,selected,visibleIds:[...$('rows').querySelectorAll('[data-row]')].map(row=>row.dataset.row)});if(!drop)return;showDropGuide(drop);}
  document.body.dataset.dragStatus='target:'+(drop.parentId||'root');$('drop-message').textContent=`Move “${itemName(tree.byId.get(drag.id))}” ${drop.parentId?'under “'+itemName(tree.byId.get(drop.parentId))+'”':'to top level'}${drop.beforeId?' · before “'+itemName(tree.byId.get(drop.beforeId))+'”':''}`;$('drop-message').hidden=false;
 }catch(error){$('drop-message').textContent=error.message;$('drop-message').hidden=false;}
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
 const hit=document.elementFromPoint(e.clientX,e.clientY),scroller=hit?.closest('#selectors,.table-scroll');if(scroller){const r=scroller.getBoundingClientRect();if(e.clientY<r.top+35)scroller.scrollTop-=14;else if(e.clientY>r.bottom-35)scroller.scrollTop+=14;locateDrop(e.clientX,e.clientY);}
},{passive:false});
function finishDrag(cancel=false){
 if(!drag)return;const active=drag.active,pending=active&&!cancel&&drop&&{...drop},id=drag.id;if(active)suppressClickUntil=performance.now()+350;
 document.body.dataset.dragStatus=pending?'dropped:'+(pending.parentId||'root'):'cancelled';clearDrop();drag=null;document.body.classList.remove('drag-active');
 if(pending)safely(async()=>{await flushEditors();if(pending.parentId){expanded.add(pending.parentId);selectorExpanded.add(pending.parentId);}await ws.move(id,pending.parentId,pending.beforeId);toast('Item moved.');});else if(active)render();
}
document.addEventListener('pointerup',()=>finishDrag());document.addEventListener('pointercancel',()=>finishDrag(true));
document.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag)finishDrag(true);});
function previewTileImage(){const preview=$('image-preview');preview.hidden=!imageDraft;if(imageDraft)preview.src=imageDraft;else preview.removeAttribute('src');}
function openTileSettings(id){const item=tree.byId.get(id);if(!item)return;imageId=id;imageDraft=ws.state.images[id]||null;imageChanged=false;$('image-target').textContent=`${tier(tree.depths.get(id))} · ${id}`;$('tile-name').value=itemName(item);$('image-file').value='';previewTileImage();show('image-dialog');}
$('image-file').onchange=()=>safely(async()=>{
 const file=$('image-file').files[0];if(!file)return;if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw new Error('Choose a PNG, JPG, WebP, or GIF image.');if(file.size>8*1024*1024)throw new Error('Choose an image smaller than 8 MB.');
 $('apply-tile-settings').disabled=true;
 try{const bitmap=await createImageBitmap(file),size=Math.min(1,192/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*size));canvas.height=Math.max(1,Math.round(bitmap.height*size));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();imageDraft=canvas.toDataURL('image/png');imageChanged=true;previewTileImage();}
 finally{$('apply-tile-settings').disabled=false;}
});
$('remove-image').onclick=()=>{imageDraft=null;imageChanged=true;$('image-file').value='';previewTileImage();};
$('tile-settings-form').onsubmit=event=>{event.preventDefault();safely(async()=>{
 const id=imageId,item=tree.byId.get(id),label=$('tile-name').value.trim();if(!item||!label)return;
 const prefix=item.summary.match(/^\[Epic\]\s*/)?.[0]||'',name=prefix+label;
 $('apply-tile-settings').disabled=true;
 try{if(name!==item.summary)await ws.edit(id,{summary:name});if(imageChanged){const images={...ws.state.images};if(imageDraft)images[id]=imageDraft;else delete images[id];await ws.preferences({images});}$('image-dialog').close();toast('Tile settings saved.');}
 finally{$('apply-tile-settings').disabled=false;}
 });};
async function showDeletion(id){await flushEditors();if(!tree.byId.has(id))return;deleteIds=[id,...descendants(items,id)];$('delete-list').innerHTML=deleteIds.map(key=>'<li>'+esc(key)+' · '+esc(itemName(tree.byId.get(key)))+'</li>').join('');show('delete-dialog');}
$('delete-item').onclick=()=>safely(()=>showDeletion(detailId));
$('confirm-delete').onclick=()=>safely(async()=>{await flushEditors();await ws.remove(deleteIds);if(deleteIds.includes(detailId)){detailId=null;lastDetail=null;}renderDetails();$('delete-dialog').close();toast('Deletion queued for YouTrack.');});
const fieldLabels={summary:'Title',description:'Notes & Instructions',state:'Status',priority:'Priority',complexity:'Complexity',parentId:'Parent',assignedState:'Assigned Status',__missing__:'Deleted Item',__children__:'New Children',__delete__:'Deletion',__verify__:'Unconfirmed Changes'};
function displayValue(value){if(value===null||value===undefined)return '(empty)';if(typeof value==='object')return JSON.stringify(value,null,2);return String(value);}
function showReview(){
 const block=ws.state.blocked;if(!block){toast(ws.message);return;}
 const signature=JSON.stringify(block);if($('review-dialog').open&&signature===reviewSignature)return;reviewSignature=signature;$('review-message').textContent='';
 $('discard-conflict').textContent=block.conflicts?.some(c=>c.field==='assignedState')?'Keep Saved Values / Cancel Pending Action':'Keep YouTrack / Cancel Pending Action';
 const op=ws.state.operations.find(x=>x.opId===block.opId),item=tree.byId.get(op?.issueId)||op?.base;
 let html=`<p><b>${esc(itemName(item))}</b> · ${esc(op?.issueId)}</p>`;
 if(block.error){html+=`<p>${esc(block.error)}</p><p class="small">The pending action was not confirmed. Retry it after fixing the problem, or cancel this pending action.</p><pre class="pending-preview">${esc(displayValue(op?.patch||op?.item||op?.text||op?.ids))}</pre>`;}
 else if(block.uncertain){html+=`<p>${esc(block.message)}</p><p class="small">Check YouTrack before retrying to avoid duplicate items or comments.</p><label>Resolution<select id="uncertain-action"><option value="">Choose…</option>${op?.type==='create'?'<option value="created">Item Already Exists in YouTrack</option>':'<option value="posted">Comment Already Posted</option>'}<option value="retry">Not Created or Posted — Retry</option></select></label>${op?.type==='create'?'<label>YouTrack Issue ID<input id="uncertain-id" placeholder="PMON-…"></label>':''}`;}
 else for(const [i,c] of (block.conflicts||[]).entries()){
  html+=`<section class="conflict" data-conflict="${i}"><h3>${esc(c.id||'')} ${esc(fieldLabels[c.field]||c.field)}</h3><div class="conflict-columns"><div><b>Your Dashboard</b><pre>${esc(displayValue(c.local))}</pre></div><div><b>${c.field==='assignedState'?'Saved in ROMDex':'YouTrack'}</b><pre>${esc(displayValue(c.remote))}</pre></div></div>${!c.field.startsWith('__')?`<label>Choose a Version<select data-resolution="${i}"><option value="">Choose…</option><option value="local">Keep Dashboard Version</option><option value="remote">${c.field==='assignedState'?'Keep Saved Status':'Keep YouTrack Version'}</option>${['description','summary'].includes(c.field)?'<option value="merge">Combine / Edit Manually</option>':''}</select></label><textarea data-merge="${i}" aria-label="Combined ${esc(fieldLabels[c.field]||c.field)}" hidden>${esc(c.local)}</textarea>`:`<p class="small">${c.field==='__delete__'?'This item changed after you selected it for deletion. Commit only if you still want to delete its current version.':c.field==='__children__'?'New children were found. Cancel and review the updated subtree before deleting.':c.field==='__missing__'?'This item was deleted in YouTrack. Copy any notes you need, then cancel the pending edit.':'YouTrack did not confirm the requested values. Review its current version before retrying.'}</p>`}</section>`;
 }
 $('review-content').innerHTML=html;$('commit-conflict').disabled=(block.conflicts||[]).some(c=>['__missing__','__children__','__verify__'].includes(c.field));show('review-dialog');
}
$('review-content').onchange=e=>{if(e.target.dataset.resolution!==undefined){const i=e.target.dataset.resolution;$('review-content').querySelector(`[data-merge="${i}"]`).hidden=e.target.value!=='merge';}};
$('discard-conflict').onclick=()=>safely(async()=>{await ws.resolve({discard:true});$('review-dialog').close();});
$('commit-conflict').onclick=async()=>{
 const block=ws.state.blocked;if(!block)return;$('commit-conflict').disabled=true;
 try{
  if(block.error){await ws.transaction(s=>s.blocked=null);ws.mode='syncing';await ws.sync(true);}
  else if(block.uncertain){const action=$('uncertain-action').value;if(!action)throw new Error('Choose how to resolve the uncertain save.');await request('/api/acknowledge',{opId:block.opId,action,issueId:$('uncertain-id')?.value.trim(),manual:true});await ws.transaction(s=>s.blocked=null);ws.mode='syncing';await ws.sync(true);}
  else{const choices={};for(const [i,c]of block.conflicts.entries()){if(c.field.startsWith('__'))continue;const mode=$('review-content').querySelector(`[data-resolution="${i}"]`).value;if(!mode)throw new Error('Choose a version for each field.');choices[c.field]={mode,value:$('review-content').querySelector(`[data-merge="${i}"]`).value};}await ws.resolve(choices);}
  if(!ws.state.blocked)$('review-dialog').close();else showReview();
 }catch(e){$('review-message').textContent=e.message;}finally{$('commit-conflict').disabled=false;}
};
ws.addEventListener('change',render);ws.addEventListener('connectneeded',showConnection);ws.addEventListener('reviewneeded',()=>showReview());
ws.addEventListener('mapping',e=>{const mapping=e.detail,id=x=>mapping[x]||x;selected=id(selected);detailId=id(detailId);renameId=id(renameId);detailNavigation.remap(mapping);if(draft){draft.parentId=id(draft.parentId);draft.afterId=id(draft.afterId);}expanded=new Set([...expanded].map(id));selectorExpanded=new Set([...selectorExpanded].map(id));});
ws.addEventListener('refreshed',()=>{if(detailId&&ws.connected&&!detailId.startsWith('local-'))loadComments(detailId);});
window.addEventListener('beforeunload',e=>{if(ws.state?.operations.length||ws.pendingWrites||editorDirty.description||editorDirty.summary||draft?.text?.trim()){e.preventDefault();e.returnValue='';}});
await ws.init();paneSplit=new TraySplit({host:document.querySelector('.work-trays'),handle:$('pane-divider'),details:$('details'),preference:ws.state.paneLayout,onChange:layout=>safely(()=>ws.preferences({paneLayout:layout}))});selected=ws.state.selected||(ws.items.find(x=>!x.parentId)?.id??null);expanded=new Set(ws.state.expanded);selectorExpanded=new Set(ws.state.selectorExpanded);if(!selectorExpanded.size&&selected)selectorExpanded.add(selected);render();
