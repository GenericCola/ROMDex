let markWorkspaceReady;window.romdexWorkspace={kind:"romdex",get engine(){return ws;},resize:()=>paneSplit?.apply(),flush:()=>flushEditors(),editorStatus:()=>({...editorDirty}),ready:new Promise(resolve=>markWorkspaceReady=resolve)};
import {mountHeader} from './shared-ui/header.mjs';
import {AttachmentsView,paperclip} from './attachment-view.mjs';
import {attachmentCount} from './attachment-core.mjs';
import {STATUS,STATES,clone,indexTree,descendants,validateMove,materialize,statusOf,hasMeaningfulNotes,saveNeedsAttention} from './core.mjs';
import {Workspace,request} from './store.mjs';
import {rowDropTarget} from './drop-target.mjs';
import {FileDropTarget} from './file-drop.mjs';
import {TraySplit} from './split-pane.mjs';
import {DetailNavigation} from './detail-navigation.mjs';
import {workRows} from './work-view.mjs';
import {refreshEditor} from './editor-view.mjs';
import {renderSelectorTree} from './selector-view.mjs';
import {normalizeSelectorExpansion,toggleSelectorExpansion,selectorPath,SELECTOR_TIERS,SELECTOR_MAX_DEPTH} from './selector-state.mjs';
import {connectionIndicator} from './sync-control.mjs';
import {PRIORITIES,COMPLEXITIES,fieldPresentation} from './field-tags.mjs';
import {tabAction,escapeAction,renameNestingTarget} from './workspace-keyboard.mjs';
import {completedControl} from './completed-control.mjs';
import {ItemEditor} from './item-editor-view.mjs';
import {editorValues} from './item-editor.mjs';
import {WorkSelection} from './work-selection.mjs';
import {siblingSelection,bulkMovePlan} from './bulk-hierarchy.mjs';
let paneSplit=null,reviewSignature=null,complexitySetupBusy=false,workRowsMarkup=null,groupDraft=null,groupCommitting=false;
const $=id=>document.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sharedHeader=mountHeader(document.querySelector('.device-header'),{onConnection:()=>showConnection(),onError:error=>toast(error.message),onAbout:()=>safely(async()=>{show('about-dialog');$('about-version').textContent='Checking Version…';try{const status=await request('/api/status');$('about-version').textContent='Version '+status.version;}catch{$('about-version').textContent='Version Unavailable';}})});
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
const ws=window.parent!==window&&window.parent.romdexApplication?.native||new Workspace();let tree,items=[],selected=null,detailId=null,detailTab='notes',expanded=new Set(),selectorExpanded=new Set(),draft=null,renameId=null,imageId=null,imageDraft=null,imageChanged=false,deleteIds=[],statusId=null,drag=null,drop=null,toastTimer,notesTimer,titleTimer,lastDetail=null;const editorDirty={},editorBase={};
const detailNavigation=new DetailNavigation();
const attachmentView=new AttachmentsView({ws,esc});
const itemEditor=new ItemEditor({ws,esc,onSaved:count=>{toast(count?'Item Changes Queued for YouTrack.':'No Changes to Save.');focusWorkspace();}});
let renameText=null;
let escapeBusy=false,workOpenTimer=null;
let commentDrafts=new Map();
const workSelection=new WorkSelection();let selectionQueue=Promise.resolve();
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
async function safely(fn){try{return await fn();}catch(e){toast(e.message);}}
function show(id){if(!$(id).open)$(id).showModal();}
function bulb(color){return `<span class="bulb ${color}" aria-hidden="true"></span>`;}
function itemName(item){return item?.summary?.replace(/^\[Epic\]\s*/,'')||'Untitled';}
function countLabel(count,label){return count+' '+label+(count===1?'':'s');}
function tier(depth){return SELECTOR_TIERS[depth]||'Task';}
function trail(id){const result=[];let current=tree.byId.get(id),seen=new Set();while(current&&!seen.has(current.id)){seen.add(current.id);result.unshift(current);current=tree.byId.get(current.parentId);}return result;}
function hasNotes(item){return hasMeaningfulNotes(item.description);}
function localPending(id){return ws.state.operations.some(x=>x.issueId===id);}
function render(){
 if(!ws.state)return;items=ws.items;
 if(drag)return;
 const active=document.activeElement,checkboxFocus=active?.dataset?.check,focus=active?.id&&['draft-title','rename-input','group-title'].includes(active.id)?{id:active.id,value:active.value,start:active.selectionStart,end:active.selectionEnd}:null;
 if(draft&&focus?.id==='draft-title')draft.text=focus.value;if(groupDraft&&focus?.id==='group-title')groupDraft.text=focus.value;
 try{tree=indexTree(items,ws.state.order);}catch(e){toast(e.message);return;}
 if(selected&&!tree.byId.has(selected))selected=null;
 selectorExpanded=normalizeSelectorExpansion(tree,selectorExpanded,selected);
 const saveAttention=saveNeedsAttention(ws.state,{connected:ws.connected,automaticSyncEnabled:ws.automaticSyncEnabled||ws.manualSyncActive,mode:ws.mode,failures:ws.failures,missingStates:ws.connection?.missingStates},editorDirty);
 $('save-light').className='bulb save-light '+(saveAttention?'red':'green');$('save').classList.toggle('dirty',saveAttention);
 $('save').title=ws.message;$('save').setAttribute('aria-label','Save Changes — '+ws.message);
 const link=connectionIndicator(ws);$('connection-light').className='bulb '+link.color;$('connection-label').textContent=link.label;$('connection-status').title=link.label;$('connect-open').setAttribute('aria-label','Connection Details · '+link.label);
 $('auto-sync').setAttribute('aria-checked',String(ws.automaticSyncEnabled));$('auto-sync-value').textContent=ws.automaticSyncEnabled?'On':'Off';$('auto-sync').disabled=ws.settingBusy||!ws.syncControl;
 $('auto-sync').title=!ws.syncControl?'Restart ROMDex to Enable Auto-Sync Data Controls':ws.settingBusy?'Finishing the Current Request and Updating Auto-Sync Data':ws.automaticSyncEnabled?'Turn Off Auto-Sync Data in All ROMDex Windows':'Turn On Auto-Sync Data in All ROMDex Windows';
 $('setup-complexity').hidden=ws.connection?.complexity?.ready===true;$('setup-complexity').disabled=complexitySetupBusy||!ws.connected||!ws.connection?.complexity;
 $('offline-banner').hidden=ws.connected&&!ws.state.blocked;
 $('offline-text').textContent=ws.connected?ws.message:`Imported ${items.length} YouTrack items. Connect to receive live updates and save edits.`;
 $('banner-connect').textContent=ws.connected?'Save Changes':'Connect YouTrack';
 $('all-count').textContent=items.length;$('all-items').classList.toggle('active',!selected);
 const activeGroups=Object.values(ws.state.bulkGroups||{}).filter(g=>['pending','blocked'].includes(g.status));$('bulk-progress').hidden=!activeGroups.length;$('bulk-progress').textContent=activeGroups.map(g=>`${g.kind==='group'?'Grouping':'Moving'} Items · ${g.completed.length} of ${g.opIds.length} Saved${g.status==='blocked'?' · Review Required':''}`).join(' · ');
 renderSelectors();renderWork();document.querySelectorAll('.selector-main,[data-drag]').forEach(b=>b.draggable=false);renderDetails();paneSplit?.apply();
 if(focus&&$(focus.id)){$(focus.id).value=focus.value;$(focus.id).focus();$(focus.id).setSelectionRange(focus.start,focus.end);}
 if(checkboxFocus&&!focus){const box=[...$('rows').querySelectorAll('[data-check]')].find(x=>x.dataset.check===checkboxFocus);box?.focus({preventScroll:true});}
}
function renderSelectors(){
 renderSelectorTree({root:$('selectors'),tree,selected,expanded:selectorExpanded,itemName,tier,esc,bulb});
}
function scopedRows(){
 return workRows({tree,selected,search:$('search').value,expanded,hideCompleted:ws.state.hideCompleted===true,keepIds:[renameId,draft?.parentId,draft?.afterId]});
}
function rowHTML(item){
 const depth=tree.depths.get(item.id)-(selected?tree.depths.get(selected)+1:0),kids=tree.children.get(item.id)||[],color=tree.colors.get(item.id),pending=localPending(item.id);
 const edit=renameId===item.id;
 return `<tr class="task-row ${kids.length?'has-children':''} " data-row="${esc(item.id)}" aria-selected="${workSelection.ids.has(item.id)}" style="--depth:${depth}"><td><div class="task-cell"><div class="row-gutter"><button class="grip" draggable="true" data-drag="${esc(item.id)}" aria-label="Drag ${esc(item.summary)}" title="Drag to Reorder or Change Parent">⠿</button><input type="checkbox" class="row-check" data-check="${esc(item.id)}" aria-label="Select ${esc(item.summary)}" ${workSelection.ids.has(item.id)?'checked':''}></div><div class="row-hierarchy"><button class="row-toggle" data-toggle="${esc(item.id)}" ${kids.length?`aria-expanded="${expanded.has(item.id)}"`:'disabled'} aria-label="${expanded.has(item.id)?'Collapse':'Expand'} ${esc(item.summary)}">${kids.length?(expanded.has(item.id)?'▾':'▸'):''}</button><button class="status-button row-status ${kids.length?'inherited':''}" data-state="${esc(item.id)}" aria-label="Set Status for ${esc(item.summary)}" title="${kids.length?'Inherited from Children: ':''}${esc(STATUS[color])} · Click to Set Assigned Status">${bulb(color)}<span class="sr-only">${esc(STATUS[color])}</span></button><div class="title-wrap">${edit?`<input class="draft-input" id="rename-input" value="${esc(renameText??item.summary)}" aria-label="Rename Task">`:`<button class="row-title" data-open="${esc(item.id)}" title="${esc(item.summary)}">${esc(itemName(item))}</button>`}${hasNotes(item)?`<button class="note-button" data-open-notes="${esc(item.id)}" aria-label="Notes for ${esc(item.summary)}" title="Has Notes / Instructions">${paper}</button>`:''}${attachmentCount(item)?`<button class="note-button attachment-button" data-attachments="${esc(item.id)}" aria-label="Attachments for ${esc(item.summary)}" title="${attachmentCount(item)} Attachment${attachmentCount(item)===1?'':'s'}">${paperclip}</button>`:''}<span class="row-id">${esc(item.id.startsWith('local-')?'New · Pending':item.id)}${pending?'<span class="pending-dot" title="Pending Changes"></span>':''}</span></div>${item.dependencies?`<span class="dependency-count" title="Linked Issues">♧ ${item.dependencies}</span>`:''}</div></div></td><td>${fieldControl(item,'priority')}</td><td>${fieldControl(item,'complexity')}</td><td><div class="row-actions"><button data-add-child="${esc(item.id)}" title="Add Subtask" aria-label="Add Child to ${esc(item.summary)}">+</button><button data-edit="${esc(item.id)}" title="Edit Item" aria-label="Edit ${esc(item.summary)}">✎</button><button data-delete="${esc(item.id)}" title="Delete Item" aria-label="Delete ${esc(item.summary)}"><svg class="trash-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" d="M5 1h6v2h3v2H2V3h3V1zM6 2v1h4V2H6zM3 6h10l-1 9H4L3 6zm3 1v6h1V7H6zm3 0v6h1V7H9z"/></svg></button></div></td></tr>`;
}
function draftHTML(){const depth=draft.parentId?tree.depths.get(draft.parentId)+1:0,relative=Math.max(0,depth-(selected?tree.depths.get(selected)+1:0));return `<tr class="draft-row" style="--depth:${relative}"><td><div class="task-cell"><span class="row-gutter" aria-hidden="true"></span><div class="row-hierarchy"><span class="draft-indent" aria-hidden="true"></span><span class="draft-status" aria-hidden="true">${bulb('grey')}</span><input id="draft-title" class="draft-input" aria-label="New ${tier(depth)} Title" placeholder="${tier(depth)} Title…" value="${esc(draft.text||'')}"></div></div></td><td colspan="3"><span class="draft-hint">Enter to Add · Tab to Nest</span></td></tr>`;}
function renderWork(){
 const hiddenCompleted=ws.state.hideCompleted===true,filter=completedControl(hiddenCompleted);$('completed-label').textContent=filter.label;$('completed-light').className='bulb '+filter.color;$('toggle-completed').setAttribute('aria-pressed',String(filter.pressed));$('toggle-completed').title=filter.title;
 const item=tree.byId.get(selected),path=trail(selected);$('breadcrumbs').innerHTML=`<button data-select="">Pokémon</button>${path.map(x=>`<span>/</span><button data-select="${esc(x.id)}">${esc(itemName(x))}</button>`).join('')}`;
 $('work-title').textContent=item?itemName(item):'All Tasks';
 const scope=selected?descendants(items,selected):items.map(x=>x.id),green=scope.filter(id=>tree.colors.get(id)==='green').length;
 $('work-summary').textContent=`${countLabel(scope.length,'Item')} · ${green} Complete${item?' · '+tier(tree.depths.get(item.id)): ' · All Epics'}`;
 const rows=scopedRows(),html=[];const priorChecked=workSelection.ids.size;workSelection.reconcile(rows.map(x=>x.id));if(priorChecked!==workSelection.ids.size){updateSelectionDetails();renderDetails();}let inserted=false;
 for(const row of rows){if(groupDraft&&groupDraft.beforeId===row.id)html.push(groupDraftHTML());html.push(rowHTML(row));if(draft&&draft.afterId===row.id){html.push(draftHTML());inserted=true;}}
 if(groupDraft&&!rows.some(x=>x.id===groupDraft.beforeId))html.push(groupDraftHTML());if(draft&&!inserted)html.push(draftHTML());const markup=html.join('');if(markup!==workRowsMarkup){$('rows').innerHTML=markup;workRowsMarkup=markup;}$('empty').hidden=rows.length>0||!!draft;$('visible-count').textContent=`${rows.length} Visible / ${scope.length} in View`;
 $('rows').querySelectorAll('[data-row]').forEach(row=>row.classList.toggle('selected',detailId===row.dataset.row||workSelection.ids.has(row.dataset.row)));
 $('rows').querySelectorAll('[data-drag]').forEach(b=>b.draggable=false);
 if(!rows.length&&$('search').value){$('empty').querySelector('h3').textContent='No Matching Items';$('empty').querySelector('p').textContent=hiddenCompleted?'Completed items are hidden. Show Completed or try a different search.':'Try a different search or select a broader section.';}else if(!rows.length&&hiddenCompleted&&green){$('empty').querySelector('h3').textContent='Completed Items Hidden';$('empty').querySelector('p').textContent='Click Show Completed to see them, or add a new item.';}else{$('empty').querySelector('h3').textContent='No Items Here Yet';$('empty').querySelector('p').textContent='Add an item to start organizing this section.';}
}
async function choose(id){clearTimeout(workOpenTimer);await selectionQueue;await flushEditors();retainCommentDraft();workSelection.clear();groupDraft=null;selected=id||null;draft=null;renameId=null;detailId=null;lastDetail=null;detailNavigation.reset();await ws.preferences({selected});render();}
async function openDetails(id,fromChild=false,reopen=true){await selectionQueue;await flushEditors();if(!tree.byId.has(id))return;workSelection.clear();groupDraft=null;detailNavigation.open(detailId,id,fromChild);if(reopen)paneSplit?.reopen();displayDetails(id);}
function retainCommentDraft(){if(detailId){const text=$('comment-input').value;if(text)commentDrafts.set(detailId,text);else commentDrafts.delete(detailId);}}
function displayDetails(id){retainCommentDraft();detailId=id;lastDetail=null;renderDetails();renderWork();if(ws.connected&&!id.startsWith('local-'))loadComments(id);}
async function backDetails(){await flushEditors();const id=detailNavigation.back(tree.byId);if(id)displayDetails(id);else renderDetails();}
function updateSelectionDetails(){
 retainCommentDraft();detailNavigation.reset();detailId=workSelection.ids.size===1?[...workSelection.ids][0]:null;lastDetail=null;
}
function queueSelection(id,modifiers){clearTimeout(workOpenTimer);
 const task=selectionQueue.then(async()=>{
  if(groupDraft){toast('Finish or Cancel the New Parent First.');return;}
  if(draft?.text?.trim()){toast('Finish or Cancel the Current New Row First.');renderWork();return;}
  if(renameId){const value=($('rename-input')?.value??renameText??'').trim();if(value)await ws.edit(renameId,{summary:value});}
  await flushEditors();retainCommentDraft();draft=null;renameId=null;renameText=null;
  workSelection.toggle(id,scopedRows().map(x=>x.id),modifiers);updateSelectionDetails();
  render();
  [...$('rows').querySelectorAll('[data-check]')].find(x=>x.dataset.check===id)?.focus({preventScroll:true});
 });selectionQueue=task.catch(()=>{});safely(()=>task);
}
document.addEventListener('romdex-clear-work-selection',()=>{workSelection.clear();groupDraft=null;});
document.addEventListener('click',event=>{const box=event.target.closest('[data-check]');if(!box)return;event.preventDefault();queueSelection(box.dataset.check,{shiftKey:event.shiftKey,ctrlKey:event.ctrlKey,metaKey:event.metaKey});});
function assigneeLabel(item){const value=editorValues(item).assignee;if(!value)return 'Unassigned';const option=ws.state.editOptions?.assignee?.options.find(x=>x.id===value);return option?.name||(item.assignee===undefined||item._custom?.find(x=>x.name==='Assignee')?.value?.id===value?item.assigneeName||item.fields?.Assignee:'Unlisted Assignee')||'Unlisted Assignee';}
function renderDetails(){
 const multiple=workSelection.ids.size>1;$('detail-placeholder').querySelector('h2').textContent=multiple?'Multiple Items are Selected.':'Select a Task';$('detail-placeholder').querySelector('p').hidden=multiple;
 if(multiple){$('detail-content').hidden=true;$('detail-placeholder').hidden=false;$('detail-id').textContent='Task Details';$('detail-back').disabled=true;return;}
 const previous=tree.byId.get(detailNavigation.destination(tree.byId));$('detail-back').disabled=!previous;$('detail-back').title=previous?'Back to '+itemName(previous):'Starting Item';$('detail-back').setAttribute('aria-label',previous?'Back to '+itemName(previous):'Back');
 const item=tree.byId.get(detailId);if(!item){$('detail-content').hidden=true;$('detail-placeholder').hidden=false;$('detail-id').textContent='Task Details';detailId=null;lastDetail=null;return;}
 $('detail-content').hidden=false;$('detail-placeholder').hidden=true;const fresh=lastDetail!==detailId;$('detail-id').textContent=item.id.startsWith('local-')?'New Item · Pending':item.id;
 if(fresh)$('comment-input').value=commentDrafts.get(detailId)||'';
 $('detail-parent').textContent=trail(item.parentId).map(itemName).join(' / ')||'Top-Level Epic';
 refreshEditor($('detail-title'),item.summary,{fresh,dirty:editorDirty.summary,activeElement:document.activeElement});
 refreshEditor($('notes'),item.description,{fresh,dirty:editorDirty.description,activeElement:document.activeElement});
 const color=tree.colors.get(item.id),kids=tree.children.get(item.id)||[];
 $('detail-state').innerHTML=bulb(color)+' '+esc(STATUS[color]);$('detail-state').className='status-button';$('detail-state').title=kids.length?'Inherited from Children · Click to Set Assigned Status':'Change Status';
 $('detail-priority').innerHTML=fieldControl(item,'priority');$('detail-complexity').innerHTML=fieldControl(item,'complexity');
 $('detail-extra').innerHTML=`<span>${esc(tier(tree.depths.get(item.id)))}</span><span>Assignee: ${esc(assigneeLabel(item))}</span><span>Due Date: ${esc(editorValues(item).dueDate||'Not Set')}</span>${kids.length?'<span>Status Inherited from Children</span>':''}`;
 $('youtrack-link').hidden=item.id.startsWith('local-');$('youtrack-link').href=item.url||'https://thegobindsingh.youtrack.cloud/issue/'+item.id;
 $('detail-attachments').innerHTML=`<div class="attachment-heading"><h3>Attachments (${attachmentCount(item)})</h3><button data-attachments="${esc(item.id)}">Attach Files</button></div><ul class="attachment-list">${attachmentView.list(item)}</ul>`;
 $('detail-children').innerHTML=kids.length?`<div class="detail-subhead"><h3>Children · ${kids.length}</h3><button data-add-child="${esc(item.id)}" class="icon-button" aria-label="Add Child">+</button></div>${kids.map(c=>`<button class="detail-child" data-open="${esc(c.id)}">${bulb(tree.colors.get(c.id))}<span>${esc(itemName(c))}</span></button>`).join('')}`:`<button data-add-child="${esc(item.id)}" class="text-button">+ Add Subtask</button>`;
 renderComments();setDetailTab(detailTab);lastDetail=detailId;
}
function renderComments(){const item=tree.byId.get(detailId);if(!item)return;const pending=ws.state.operations.filter(x=>x.type==='comment'&&x.issueId===detailId).map(x=>({text:x.text,author:'You · Pending',created:Date.now(),pending:true}));const comments=[...(item.comments||[]),...pending];$('comment-count').textContent=item.commentCount+pending.length||'';$('comments').innerHTML=comments.length?comments.map(c=>`<article class="comment ${c.pending?'pending':''}"><header>${esc(c.author)} · ${esc(typeof c.created==='number'?new Date(c.created).toLocaleString():c.created)}</header><p>${esc(c.text)}</p></article>`).join(''):'<p class="muted small">No comments yet.</p>';}
async function loadComments(id){try{await ws.loadComments(id);}catch(e){if(detailId===id)toast('Could not refresh comments: '+e.message);}}
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
 if(b.dataset.selectorExpand){selectorExpanded=toggleSelectorExpansion(tree,selectorExpanded,b.dataset.selectorExpand);await ws.preferences({selectorExpanded:[...selectorExpanded]});return;}
 if(b.dataset.toggle){const id=b.dataset.toggle;expanded.has(id)?expanded.delete(id):expanded.add(id);await ws.preferences({expanded:[...expanded]});return;}
 if(b.dataset.open){const fromWork=!!b.closest('#rows');if(fromWork){clearTimeout(workOpenTimer);if(event.detail>1)return;const id=b.dataset.open,scope=selected;workOpenTimer=setTimeout(()=>safely(async()=>{if(selected===scope&&!renameId&&!groupDraft&&!document.querySelector('dialog[open]')){await openDetails(id);focusWorkspace();}}),220);}else await openDetails(b.dataset.open,!!b.closest('#detail-children'));return;}
 if(b.dataset.openNotes){detailTab='notes';await openDetails(b.dataset.openNotes,false,false);$('notes').focus();return;}
 if(b.dataset.attachments){await attachmentView.open(b.dataset.attachments);return;}
 if(b.dataset.viewFile||b.dataset.downloadFile){await attachmentView.view(b.dataset.fileItem,b.dataset.viewFile||b.dataset.downloadFile,b.dataset.pendingFile==='true',!!b.dataset.downloadFile);return;}
 if(b.dataset.reviewUpload){const data=await ws.reviewAttachment(b.dataset.reviewUpload);if(data.completed){await ws.retryBlocked();$('review-dialog').close();return;}$('uncertain-id').innerHTML='<option value="">'+(data.attachments.length?'Choose a Matching Attachment…':'No Matching Files Found')+'</option>'+data.attachments.map(file=>'<option value="'+esc(file.id)+'">'+esc(file.name)+' · '+esc(file.id)+'</option>').join('');return;}
 if(b.dataset.cancelUpload){await attachmentView.cancel(b.dataset.cancelUpload);return;}
 if(b.dataset.deleteFile){await attachmentView.remove(b.dataset.fileItem,b.dataset.deleteFile);return;}
 if(b.dataset.cancelAttachmentDelete){await ws.cancelAttachmentDeletion(b.dataset.cancelAttachmentDelete);return;}
 if(b.dataset.detailTab){setDetailTab(b.dataset.detailTab);return;}
 if(b.dataset.state){showStatus(b.dataset.state);return;}
 if(b.dataset.statusColor){const item=tree.byId.get(statusId);await ws.edit(statusId,{assignedState:STATES[b.dataset.statusColor]},{assignedState:item.assignedState??item.state});$('status-dialog').close();return;}
});});
$('edit-attachments').onclick=()=>safely(()=>attachmentView.open(itemEditor.session?.id));
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
$('setup-complexity').onclick=()=>safely(async()=>{if(complexitySetupBusy)return;complexitySetupBusy=true;$('setup-complexity').disabled=true;try{await ws.setupComplexity();$('connection-message').textContent='Complexity is ready: LOW, MID, HIGH and INSANE.';}catch(error){$('connection-message').textContent=error.message;throw error;}finally{complexitySetupBusy=false;render();}});
$('connect-open').onclick=showConnection;$('banner-connect').onclick=()=>ws.connected?ws.sync(true):showConnection();
$('connection-form').onsubmit=async e=>{e.preventDefault();$('connect-submit').disabled=true;$('connection-message').textContent='Checking your connection…';const token=$('token').value,remember=$('remember-connection').checked;$('token').value='';try{await ws.connect(token,remember);$('connection-message').textContent='Connected. Preparing statuses and synchronizing…';await ws.prepare();if(ws.mode==='manual')$('connection-message').textContent=ws.message;else{$('connection-dialog').close();toast('ROMDex is connected to YouTrack.');}}catch(error){$('connection-message').textContent=error.message;}finally{$('connect-submit').disabled=false;}};
$('save').onclick=()=>safely(async()=>{await flushEditors();await ws.sync(true);});
$('auto-sync').onclick=()=>safely(async()=>{await flushEditors();await ws.setAutomaticSync(!ws.automaticSyncEnabled);toast(ws.automaticSyncEnabled?'Auto-Sync Data Is On.':'Auto-Sync Data Is Off. Save Changes Runs a One-Time Sync.');});
function focusDraft(){requestAnimationFrame(()=>{$('draft-title')?.focus();});}
async function addDraft(parentId,afterId=null){
 await selectionQueue;await flushEditors();if(draft?.text?.trim()){toast('Finish or cancel the current new row first.');return;}workSelection.clear();
 const parent=tree.byId.get(parentId);if(parent){for(const x of trail(parentId))expanded.add(x.id);selectorExpanded=selectorPath(tree,parentId);}
 const visible=selected?new Set(descendants(items,selected)):null;
 if(parentId!==selected&&visible&&!visible.has(parentId)){selected=parentId;await ws.preferences({selected});}
 if(parentId===null&&selected){selected=null;await ws.preferences({selected:null});}
 draft={parentId,afterId:afterId||(tree.children.get(parentId)||[]).at(-1)?.id||parentId,text:''};renameId=null;render();focusDraft();
}
async function commitDraft(){
 if(!draft)return;const current={...draft,text:$('draft-title')?.value||draft.text||''};
 if(!current.text.trim()){draft=null;render();return;}
 draft=null;const depth=current.parentId?tree.depths.get(current.parentId)+1:0;
 const id=await ws.create(current.parentId,current.text,depth===0?'Epic':depth<=SELECTOR_MAX_DEPTH?'Feature':'Task');
 const siblings=(tree.children.get(current.parentId)||[]).map(x=>x.id).filter(x=>x!==id);const at=siblings.indexOf(current.afterId),beforeId=at>=0?siblings[at+1]:null;
 await ws.move(id,current.parentId,beforeId);draft={parentId:current.parentId,afterId:id,text:''};render();focusDraft();
}
function indentDraft(outdent=false){
 if(!draft)return;draft.text=$('draft-title')?.value||draft.text;
 if(outdent){const parent=tree.byId.get(draft.parentId);if(parent){draft.parentId=parent.parentId;draft.afterId=parent.id;}else return;}
 else{const siblings=tree.children.get(draft.parentId)||[],previous=tree.byId.get(draft.afterId);if(!previous||previous.parentId!==draft.parentId||!siblings.some(x=>x.id===previous.id)){toast('There is no preceding sibling to nest under.');return;}draft.parentId=previous.id;draft.afterId=(tree.children.get(previous.id)||[]).at(-1)?.id||previous.id;expanded.add(previous.id);}
 render();focusDraft();
}
async function openItemEditor(id){
 await selectionQueue;await flushEditors();if(groupDraft||draft?.text?.trim()){toast('Finish or Cancel the Current New Row First.');return;}
 if(renameId){const value=($('rename-input')?.value??renameText??'').trim();if(value)await ws.edit(renameId,{summary:value});renameId=null;renameText=null;}
 draft=null;workSelection.clear();render();const item=tree.byId.get(id);if(!item)return;
 await itemEditor.open(item,{displayStatus:STATUS[tree.colors.get(id)],parent:(tree.children.get(id)||[]).length>0});
}
async function beginRename(id){await selectionQueue;await flushEditors();workSelection.clear();draft=null;renameId=id;renameText=tree.byId.get(id)?.summary??'';renderWork();renderDetails();requestAnimationFrame(()=>{$('rename-input')?.focus();$('rename-input')?.select();});}
async function commitRename(){if(!renameId)return;const id=renameId,value=$('rename-input')?.value.trim(),parentId=tree.byId.get(id)?.parentId;renameId=null;if(value){await ws.edit(id,{summary:value});await addDraft(parentId,id);}else{toast('Existing items require a title. Use Delete Item to remove them.');render();}}
async function indentRename(outdent=false){
 const input=$('rename-input');if(!renameId||!input)return;
 const id=renameId,text=input.value,start=input.selectionStart,end=input.selectionEnd;
 const target=renameNestingTarget(tree,id,outdent),title=text.trim();
 if(!title)throw Error('Enter a title before changing its level.');
 renameText=text;
 if(target.expandId)expanded.add(target.expandId);
 if(title!==tree.byId.get(id)?.summary)await ws.edit(id,{summary:title});
 await ws.move(id,target.parentId,target.beforeId);
 await ws.preferences({expanded:[...expanded]});
 const editor=$('rename-input');if(editor){editor.value=text;editor.focus();editor.setSelectionRange(start,end);}else{renameId=null;renameText=null;focusWorkspace();toast('Item moved outside the current view. Its title was saved.');}
}
function focusWorkspace(){document.querySelector('.work-trays').focus({preventScroll:true});}
async function handleEscape(action){clearTimeout(workOpenTimer);
 if(escapeBusy)return;escapeBusy=true;
 try{
  await selectionQueue;
  if(detailId&&editorDirty.summary&&!$('detail-title').value.trim()){
   $('detail-title').value=tree.byId.get(detailId)?.summary||'';editorDirty.summary=false;delete editorBase.summary;
  }
  await flushEditors();
  if(action==='clear'){
   retainCommentDraft();draft=null;renameId=null;renameText=null;detailId=null;lastDetail=null;detailNavigation.reset();
   window.getSelection()?.removeAllRanges();document.dispatchEvent(new Event('romdex-clear-work-selection'));render();
  }else paneSplit.toggleCollapsedDefault();
  focusWorkspace();
 }finally{escapeBusy=false;}
}
document.addEventListener('pointerdown',e=>{
 if(e.target.closest('.work-trays')&&!e.target.closest('button,a,input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="separator"]'))focusWorkspace();
});
document.addEventListener('click',e=>{
 if(e.target.closest('button,a,input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;

});
$('add-epic').onclick=()=>safely(()=>addDraft(null));$('add-work').onclick=()=>safely(()=>addDraft(selected));
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;safely(async()=>{
 if(b.dataset.delete){await showDeletion(b.dataset.delete);return;}
 if(b.dataset.addChild){await addDraft(b.dataset.addChild);return;}
 if(b.dataset.edit){await openItemEditor(b.dataset.edit);return;}
 if(b.dataset.selectorSettings||b.dataset.image){openTileSettings(b.dataset.selectorSettings||b.dataset.image);return;}
});});
document.addEventListener('dblclick',e=>{const title=e.target.closest('[data-open]');if(title&&title.classList.contains('row-title')){clearTimeout(workOpenTimer);safely(()=>beginRename(title.dataset.open));}});
document.addEventListener('input',e=>{if(e.target.id==='draft-title'&&draft)draft.text=e.target.value;if(e.target.id==='rename-input')renameText=e.target.value;if(e.target.id==='group-title'&&groupDraft)groupDraft.text=e.target.value;});
document.addEventListener('keydown',e=>{
 if(e.key==='F2'&&e.target.matches('.row-title')&&!document.querySelector('dialog[open]')&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!e.isComposing){e.preventDefault();clearTimeout(workOpenTimer);safely(()=>beginRename(e.target.dataset.open));return;}
 const escape=escapeAction({key:e.key,ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,isComposing:e.isComposing,modal:!!document.querySelector('dialog[open]'),busy:groupCommitting||escapeBusy||!!drag||!!paneSplit?.active,hasSelection:!!groupDraft||workSelection.ids.size>0||!!detailId||!!draft||!!renameId||document.querySelectorAll('#rows input[type="checkbox"]:checked').length>0||window.getSelection()?.isCollapsed===false,fieldFocused:!!e.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')});
 if(escape&&!e.defaultPrevented&&!e.repeat){e.preventDefault();safely(()=>handleEscape(escape));return;}
 const inlineName=['draft-title','rename-input'].includes(e.target.id);
 const navigation=(e.target.matches('[data-check]')&&workSelection.ids.size>1)||e.target.matches('.work-trays,.row-title')||!!e.target.closest('.task-row')&&!e.target.closest('button,a,input,textarea,select,[contenteditable]:not([contenteditable="false"])');
 const action=tabAction({key:e.key,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,isComposing:e.isComposing,inlineName,navigation,modal:!!document.querySelector('dialog[open]'),busy:groupCommitting||!!drag||!!paneSplit?.active,selectedCount:workSelection.ids.size});
 if(action==='cycle'){e.preventDefault();safely(async()=>{await flushEditors();paneSplit.cycle();focusWorkspace();});return;}
 if(action==='group'){e.preventDefault();safely(beginGroup);return;}
 if(action==='indent'||action==='outdent'){e.preventDefault();if(e.target.id==='draft-title')indentDraft(action==='outdent');else safely(()=>indentRename(action==='outdent'));return;}
 if(e.target.id==='group-title'){if(e.key==='Enter'){e.preventDefault();safely(commitGroup);}return;}
 if(e.target.id==='draft-title'){
  if(e.key==='Enter'){e.preventDefault();safely(commitDraft);}
 }else if(e.target.id==='rename-input'){
  if(e.key==='Enter'){e.preventDefault();safely(commitRename);}
 }else if(e.target.id==='comment-input'&&e.key==='Enter'&&(e.ctrlKey||e.metaKey)){$('post-comment').click();}
});
function groupDraftHTML(){const depth=groupDraft.parentId?tree.depths.get(groupDraft.parentId)+1:0,relative=Math.max(0,depth-(selected?tree.depths.get(selected)+1:0));return `<tr class="draft-row" style="--depth:${relative}"><td><div class="task-cell"><span class="row-gutter"></span><div class="row-hierarchy"><span class="draft-indent"></span><span class="draft-status">${bulb('grey')}</span><input id="group-title" class="draft-input" aria-label="New Parent Title" placeholder="Parent Title…" value="${esc(groupDraft.text)}"></div></div></td><td colspan="3" class="draft-hint">Enter to Group · Esc to Cancel</td></tr>`;}
async function beginGroup(){
 await selectionQueue;await flushEditors();if(groupDraft||draft||renameId){toast('Finish or Cancel the Current Editor First.');return;}
 const choice=siblingSelection(items,ws.state.order,[...workSelection.ids]);groupDraft={ids:choice.members.map(x=>x.id),parentId:choice.parentId,beforeId:choice.members[0].id,text:''};renderWork();$('group-title')?.focus();
}
async function commitGroup(){
 if(!groupDraft||groupCommitting)return;groupCommitting=true;
 try{const current=groupDraft,title=$('group-title')?.value||current.text;
 if(!title.trim()){groupDraft=null;renderWork();focusWorkspace();return;}
 const choice=siblingSelection(ws.items,ws.state.order,current.ids);if(choice.parentId!==current.parentId)throw Error('The Selected Items Changed Parents. Cancel and Select Them Again.');
 const depth=choice.parentId?tree.depths.get(choice.parentId)+1:0;
 const result=await ws.groupItems(current.ids,title,depth===0?'Epic':depth<=SELECTOR_MAX_DEPTH?'Feature':'Task');
 groupDraft=null;workSelection.clear();updateSelectionDetails();expanded.add(result.createdParentId);render();focusWorkspace();toast('New Parent and Selected Items Queued for YouTrack.');
 }finally{groupCommitting=false;}
}
function clearDrop(){document.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));$('drop-guide').hidden=true;$('drop-message').hidden=true;drop=null;}
function showDropGuide(target){
 const row=[...$('rows').querySelectorAll('[data-row]')].find(row=>row.dataset.row===target.anchorId);if(!row)return;
 const scroller=document.querySelector('.table-scroll'),table=scroller.querySelector('table'),guide=$('drop-guide');
 const bounds=scroller.getBoundingClientRect(),rowBounds=row.getBoundingClientRect(),tableBounds=table.getBoundingClientRect();
 const step=parseFloat(getComputedStyle(scroller).getPropertyValue('--hierarchy-step'))||21;
 const gutter=parseFloat(getComputedStyle(scroller).getPropertyValue('--row-gutter'))||48;
 const left=row.cells[0].getBoundingClientRect().left+gutter+target.displayDepth*step;
 guide.style.left=(left-bounds.left+scroller.scrollLeft-scroller.clientLeft)+'px';
 guide.style.top=((target.after?rowBounds.bottom:rowBounds.top)-bounds.top+scroller.scrollTop-scroller.clientTop)+'px';
 guide.style.width=Math.max(0,tableBounds.right-left)+'px';guide.dataset.depth=target.displayDepth;guide.hidden=false;
}
function locateDrop(x,y){
 if(!drag)return;const targetElement=document.elementFromPoint(x,y),row=targetElement?.closest('[data-row]'),selector=targetElement?.closest('[data-selector]');clearDrop();if(!row&&!selector)return;
 const target=tree.byId.get(row?.dataset.row||selector?.dataset.selector);if(!target||target.id===drag.id||drag.bulkIds?.includes(target.id))return;
 try{
  if(selector){validateMove(items,drag.id,target.id);drop={parentId:target.id,beforeId:null};selector.classList.add('drop-target');}
  else{const rect=row.getBoundingClientRect();drop=rowDropTarget({items,tree,dragId:drag.id,targetId:target.id,delta:Math.round((x-drag.startX)/26),after:y>=rect.top+rect.height/2,selected,visibleIds:[...$('rows').querySelectorAll('[data-row]')].map(row=>row.dataset.row)});if(!drop)return;showDropGuide(drop);}
  if(drag.bulkIds){const plan=bulkMovePlan(items,ws.state.order,drag.bulkIds,drop.parentId,drop.beforeId);drop.beforeId=plan.beforeId;}
  document.body.dataset.dragStatus='target:'+(drop.parentId||'root');$('drop-message').textContent=`Move ${drag.bulkIds?drag.bulkIds.length+' Selected Items':'“'+itemName(tree.byId.get(drag.id))+'”'} ${drop.parentId?'under “'+itemName(tree.byId.get(drop.parentId))+'”':'to top level'}${drop.beforeId?' · before “'+itemName(tree.byId.get(drop.beforeId))+'”':''} · Level ${(drop.parentId?tree.depths.get(drop.parentId)+1:0)+1} (${tier(drop.parentId?tree.depths.get(drop.parentId)+1:0)})`;$('drop-message').hidden=false;
 }catch(error){clearDrop();$('drop-message').textContent=error.message;$('drop-message').hidden=false;}
}
let suppressClickUntil=0;
document.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;const handle=e.target.closest('[data-drag],.selector-main');if(!handle)return;
 const id=handle.dataset.drag||handle.dataset.select;if(!tree.byId.has(id))return;
 if(groupDraft){toast('Finish or Cancel the New Parent First.');return;}
 let bulkIds=null;if(handle.dataset.drag&&workSelection.ids.size>1){if(!workSelection.ids.has(id)){toast('Drag a Checked Item to Move the Selection.');return;}try{bulkIds=siblingSelection(items,ws.state.order,[...workSelection.ids]).members.map(x=>x.id);}catch(error){toast(error.message);return;}}
 drag={bulkIds,id,startX:e.clientX,startY:e.clientY,pointerId:e.pointerId,active:false};handle.setPointerCapture(e.pointerId);
});
document.addEventListener('pointermove',e=>{
 if(!drag||drag.pointerId!==e.pointerId)return;
 if(!drag.active&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<6)return;
 drag.active=true;document.body.classList.add('drag-active');document.body.dataset.dragStatus='started:'+drag.id;e.preventDefault();locateDrop(e.clientX,e.clientY);
 const hit=document.elementFromPoint(e.clientX,e.clientY),scroller=hit?.closest('#selectors,.table-scroll');if(scroller){const r=scroller.getBoundingClientRect();if(e.clientY<r.top+35)scroller.scrollTop-=14;else if(e.clientY>r.bottom-35)scroller.scrollTop+=14;locateDrop(e.clientX,e.clientY);}
},{passive:false});
function finishDrag(cancel=false){
 if(!drag)return;const active=drag.active,pending=active&&!cancel&&drop&&{...drop},id=drag.id,bulkIds=drag.bulkIds;if(active)suppressClickUntil=performance.now()+350;
 document.body.dataset.dragStatus=pending?'dropped:'+(pending.parentId||'root'):'cancelled';clearDrop();drag=null;document.body.classList.remove('drag-active');
 if(pending)safely(async()=>{await flushEditors();if(pending.parentId){expanded.add(pending.parentId);selectorExpanded=selectorPath(tree,pending.parentId);}if(bulkIds){await ws.moveMany(bulkIds,pending.parentId,pending.beforeId);workSelection.clear();updateSelectionDetails();render();toast('Selected Items Moved.');}else{await ws.move(id,pending.parentId,pending.beforeId);toast('Item moved.');}});else if(active)render();
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
const fieldLabels={summary:'Title',description:'Notes & Instructions',state:'Status',priority:'Priority',complexity:'Complexity',parentId:'Parent',assignedState:'Assigned Status',assignee:'Assignee',dueDate:'Due Date',tags:'Tags',__attachment__:'Changed Attachment',__missing__:'Deleted Item',__children__:'New Children',__delete__:'Deletion',__verify__:'Unconfirmed Changes'};
function editFieldLabel(key){return fieldLabels[key]||ws.state.editOptions?.custom?.find(x=>x.key===key)?.name||key;}
function editConflictValue(field,value){const options=field==='assignee'?ws.state.editOptions?.assignee?.options:field==='tags'?ws.state.editOptions?.tags?.options:ws.state.editOptions?.custom?.find(x=>x.key===field)?.options;const readable=id=>options?.find(x=>x.id===id)?.name||id;return options?.length?(Array.isArray(value)?value.map(readable).join(', '):value==null?'Not Set':readable(value)):displayValue(value);}
function displayValue(value){if(value===null||value===undefined)return '(empty)';if(typeof value==='object')return JSON.stringify(value,null,2);return String(value);}
function showReview(){
 const block=ws.state.blocked;if(!block){toast(ws.message);return;}
 const signature=JSON.stringify(block);if($('review-dialog').open&&signature===reviewSignature)return;reviewSignature=signature;$('review-message').textContent='';
 $('discard-conflict').textContent=block.conflicts?.some(c=>c.field==='assignedState')?'Keep Saved Values / Cancel Pending Action':'Keep YouTrack / Cancel Pending Action';
 const op=ws.state.operations.find(x=>x.opId===block.opId),group=ws.state.bulkGroups?.[op?.group?.id],item=tree.byId.get(op?.issueId)||op?.base;
 let html=`<p><b>${esc(itemName(item))}</b> · ${esc(op?.issueId)}</p>`;
 if(group){$('discard-conflict').textContent='Cancel Remaining Group Changes';html+=`<p>${group.completed.length} of ${group.opIds.length} Items Saved. Cancelling Removes Only Pending Group Changes; Confirmed YouTrack Changes Stay in Place.</p><ul>${group.entries.map(x=>'<li>'+esc(x.label)+' · '+esc(x.issueId)+' · '+(group.completed.includes(x.opId)?'Saved':'Pending')+'</li>').join('')}</ul>`;}
 if(block.confirmedFields?.length||block.tagProgress?.length)html+=`<p>Already Saved: ${esc((block.confirmedFields||[]).map(editFieldLabel).join(', ')||'Tag Changes')}${block.tagProgress?.length?' · '+block.tagProgress.length+' Tag Updates Confirmed':''}. Retry Resumes the Pending Changes.</p>`;
 if(block.error){html+=`<p>${esc(block.error)}</p><p class="small">The pending action was not confirmed. Retry it after fixing the problem, or cancel this pending action.</p><pre class="pending-preview">${esc(displayValue(op?.patch||op?.item||op?.text||op?.ids))}</pre>`;}
 else if(block.uncertain&&op?.type==='attachment'){html+=`<p>${esc(block.message)}</p><p class="small">The file remains queued locally. Matching files are verified by contents, not just by name. Cancelling leaves existing YouTrack files in place.</p><button data-review-upload="${esc(op.opId)}">Refresh Matching Files</button><label>Matching Attachment<select id="uncertain-id"><option value="">Refresh the Matching File List…</option>${(block.attachments||[]).map(file=>'<option value="'+esc(file.id)+'">'+esc(file.name)+' · '+esc(file.id)+'</option>').join('')}</select></label><label>Resolution<select id="uncertain-action"><option value="">Choose…</option><option value="attached">Use the Matching Existing Attachment</option><option value="retry">Not Uploaded — Retry After Review</option></select></label>`;}
 else if(block.uncertain){html+=`<p>${esc(block.message)}</p><p class="small">Check YouTrack before retrying to avoid duplicate items or comments.</p><label>Resolution<select id="uncertain-action"><option value="">Choose…</option>${op?.type==='create'?'<option value="created">Item Already Exists in YouTrack</option>':'<option value="posted">Comment Already Posted</option>'}<option value="retry">Not Created or Posted — Retry</option></select></label>${op?.type==='create'?'<label>YouTrack Issue ID<input id="uncertain-id" placeholder="PMON-…"></label>':''}`;}
 else for(const [i,c] of (block.conflicts||[]).entries()){
  html+=`<section class="conflict" data-conflict="${i}"><h3>${esc(c.id||'')} ${esc(editFieldLabel(c.field))}</h3><div class="conflict-columns"><div><b>Your Dashboard</b><pre>${esc(editConflictValue(c.field,c.local))}</pre></div><div><b>${c.field==='assignedState'?'Saved in ROMDex':'YouTrack'}</b><pre>${esc(editConflictValue(c.field,c.remote))}</pre></div></div>${!c.field.startsWith('__')?`<label>Choose a Version<select data-resolution="${i}"><option value="">Choose…</option><option value="local">Keep Dashboard Version</option><option value="remote">${c.field==='assignedState'?'Keep Saved Status':'Keep YouTrack Version'}</option>${['description','summary'].includes(c.field)?'<option value="merge">Combine / Edit Manually</option>':''}</select></label><textarea data-merge="${i}" aria-label="Combined ${esc(editFieldLabel(c.field))}" hidden>${esc(c.local)}</textarea>`:`<p class="small">${c.field==='__attachment__'?'This attachment changed after confirmation. Cancel the pending deletion, review the current file, and select Delete again if appropriate.':c.field==='__delete__'?'This item changed after you selected it for deletion. Commit only if you still want to delete its current version.':c.field==='__children__'?'New children were found. Cancel and review the updated subtree before deleting.':c.field==='__missing__'?'This item was deleted in YouTrack. Copy any notes you need, then cancel the pending edit.':'YouTrack did not confirm the requested values. Review its current version before retrying.'}</p>`}</section>`;
 }
 $('review-content').innerHTML=html;$('commit-conflict').disabled=(block.conflicts||[]).some(c=>['__missing__','__children__','__verify__','__group__','__attachment__'].includes(c.field));show('review-dialog');
}
$('review-content').onchange=e=>{if(e.target.dataset.resolution!==undefined){const i=e.target.dataset.resolution;$('review-content').querySelector(`[data-merge="${i}"]`).hidden=e.target.value!=='merge';}};
$('discard-conflict').onclick=()=>safely(async()=>{await ws.resolve({discard:true});$('review-dialog').close();});
$('commit-conflict').onclick=async()=>{
 const block=ws.state.blocked;if(!block)return;$('commit-conflict').disabled=true;
 try{
  if(block.error){await ws.retryBlocked();}
  else if(block.uncertain){const action=$('uncertain-action').value;if(!action)throw new Error('Choose how to resolve the uncertain save.');await ws.acknowledge(block.opId,action,$('uncertain-id')?.value.trim());}
  else{const choices={};for(const [i,c]of block.conflicts.entries()){if(c.field.startsWith('__'))continue;const mode=$('review-content').querySelector(`[data-resolution="${i}"]`).value;if(!mode)throw new Error('Choose a version for each field.');choices[c.field]={mode,value:$('review-content').querySelector(`[data-merge="${i}"]`).value};}await ws.resolve(choices);}
  if(!ws.state.blocked)$('review-dialog').close();else showReview();
 }catch(e){$('review-message').textContent=e.message;}finally{$('commit-conflict').disabled=false;}
};
ws.addEventListener('change',render);ws.addEventListener('connectneeded',showConnection);ws.addEventListener('reviewneeded',()=>showReview());
ws.addEventListener('mapping',e=>{const mapping=e.detail,id=x=>mapping[x]||x;itemEditor.remap(mapping);attachmentView.remap(mapping);workSelection.remap(mapping);if(groupDraft){groupDraft.ids=groupDraft.ids.map(id);groupDraft.parentId=id(groupDraft.parentId);groupDraft.beforeId=id(groupDraft.beforeId);}commentDrafts=new Map([...commentDrafts].map(([key,value])=>[id(key),value]));selected=id(selected);detailId=id(detailId);renameId=id(renameId);detailNavigation.remap(mapping);if(draft){draft.parentId=id(draft.parentId);draft.afterId=id(draft.afterId);}expanded=new Set([...expanded].map(id));selectorExpanded=new Set([...selectorExpanded].map(id));});
ws.addEventListener('refreshed',()=>{if(detailId&&ws.connected&&!detailId.startsWith('local-'))loadComments(detailId);});
let fileDrops=null;
window.addEventListener('beforeunload',e=>{if(fileDrops?.busy||attachmentView.busy||itemEditor.hasUnsavedChanges()||ws.state?.operations.length||ws.pendingWrites||editorDirty.description||editorDirty.summary||draft?.text?.trim()||groupDraft?.text?.trim()){e.preventDefault();e.returnValue='';}});
await ws.init();paneSplit=new TraySplit({host:document.querySelector('.work-trays'),handle:$('pane-divider'),details:$('details'),preference:ws.state.paneLayout,onChange:layout=>safely(()=>ws.preferences({paneLayout:layout}))});selected=null;expanded=new Set(ws.state.expanded);selectorExpanded=new Set(ws.state.selectorExpanded);render();

if(ws.dropAttachments)fileDrops=new FileDropTarget({doc:document,attach:(id,files)=>ws.dropAttachments(id,files),item:id=>tree?.byId.get(id),notify:toast,internalDrag:()=>!!drag,suppressClick:()=>suppressClickUntil=performance.now()+350});
markWorkspaceReady();
