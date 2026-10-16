import fs from 'node:fs';
const file='outputs/ROMDex/public/app.mjs';let s=fs.readFileSync(file,'utf8');
function change(a,b){if(!s.includes(a))throw Error('Missing replacement: '+a.slice(0,90));s=s.replace(a,b);}
change("import {completedControl} from './completed-control.mjs';","import {completedControl} from './completed-control.mjs';\nimport {WorkSelection} from './work-selection.mjs';");
change('let commentDrafts=new Map();','let commentDrafts=new Map();\nconst workSelection=new WorkSelection();let selectionQueue=Promise.resolve();');
change("if(focus&&$(focus.id)){", "if(focus&&$(focus.id)){");
// Preserve a focused checkbox when background status refresh replaces rows.
change("const active=document.activeElement,focus=", "const active=document.activeElement,checkboxFocus=active?.dataset?.check,focus=");
change("$(focus.id).setSelectionRange(focus.start,focus.end);}\n}", "$(focus.id).setSelectionRange(focus.start,focus.end);}\n if(checkboxFocus&&!focus){const box=[...$('rows').querySelectorAll('[data-check]')].find(x=>x.dataset.check===checkboxFocus);box?.focus({preventScroll:true});}\n}");
change('${detailId===item.id?', '${detailId===item.id||workSelection.ids.has(item.id)?');
change('data-row="${esc(item.id)}" style=', 'data-row="${esc(item.id)}" aria-selected="${workSelection.ids.has(item.id)}" style=');
const begin=s.indexOf('<div class="task-cell"><button class="status-button row-status');
const end=s.indexOf('<div class="title-wrap">',begin);
if(begin<0||end<0)throw Error('Missing task layout');
s=s.slice(0,begin)+`<div class="task-cell"><div class="row-gutter"><button class="grip" draggable="true" data-drag="\${esc(item.id)}" aria-label="Drag \${esc(item.summary)}" title="Drag to Reorder or Change Parent">⠿</button><input type="checkbox" class="row-check" data-check="\${esc(item.id)}" aria-label="Select \${esc(item.summary)}" \${workSelection.ids.has(item.id)?'checked':''}></div><div class="row-hierarchy"><button class="row-toggle" data-toggle="\${esc(item.id)}" \${kids.length?\`aria-expanded="\${expanded.has(item.id)}"\`:'disabled'} aria-label="\${expanded.has(item.id)?'Collapse':'Expand'} \${esc(item.summary)}">\${kids.length?(expanded.has(item.id)?'▾':'▸'):''}</button><button class="status-button row-status \${kids.length?'inherited':''}" data-state="\${esc(item.id)}" aria-label="Set Status for \${esc(item.summary)}" title="\${kids.length?'Inherited from Children: ':''}\${esc(STATUS[color])} · Click to Set Assigned Status">\${bulb(color)}<span class="sr-only">\${esc(STATUS[color])}</span></button>`+s.slice(end);
change('Linked Issues">♧ ${item.dependencies}</span>`:\'\'}</div></td>', 'Linked Issues">♧ ${item.dependencies}</span>`:\'\'}</div></div></td>');
change('<span class="draft-status" aria-hidden="true">','<span class="row-gutter" aria-hidden="true"></span><div class="row-hierarchy"><span class="draft-indent" aria-hidden="true"></span><span class="draft-status" aria-hidden="true">');
change('<span class="draft-indent" aria-hidden="true"></span><input id="draft-title"','<input id="draft-title"');
change('${esc(draft.text||\'\')}\"></div></td>', '${esc(draft.text||\'\')}\"></div></div></td>');
change('const rows=scopedRows(),html=[];', 'const rows=scopedRows(),html=[];const priorChecked=workSelection.ids.size;workSelection.reconcile(rows.map(x=>x.id));if(priorChecked!==workSelection.ids.size)updateSelectionDetails();');
change('async function choose(id){await flushEditors();retainCommentDraft();', 'async function choose(id){await flushEditors();retainCommentDraft();workSelection.clear();');
change('async function openDetails(id,fromChild=false){await flushEditors();if(!tree.byId.has(id))return;', 'async function openDetails(id,fromChild=false){await flushEditors();if(!tree.byId.has(id))return;workSelection.clear();');
change('function renderDetails(){', `function updateSelectionDetails(){
 retainCommentDraft();detailNavigation.reset();detailId=workSelection.ids.size===1?[...workSelection.ids][0]:null;lastDetail=null;
}
function queueSelection(id,modifiers){
 const task=selectionQueue.then(async()=>{
  await flushEditors();retainCommentDraft();draft=null;renameId=null;renameText=null;
  workSelection.toggle(id,scopedRows().map(x=>x.id),modifiers);updateSelectionDetails();
  if(workSelection.ids.size)paneSplit?.reopen();render();
  [...$('rows').querySelectorAll('[data-check]')].find(x=>x.dataset.check===id)?.focus({preventScroll:true});
 });selectionQueue=task.catch(()=>{});safely(()=>task);
}
document.addEventListener('romdex-clear-work-selection',()=>workSelection.clear());
document.addEventListener('click',event=>{const box=event.target.closest('[data-check]');if(!box)return;event.preventDefault();queueSelection(box.dataset.check,{shiftKey:event.shiftKey,ctrlKey:event.ctrlKey,metaKey:event.metaKey});});
function renderDetails(){
 const multiple=workSelection.ids.size>1;$('detail-placeholder').querySelector('h2').textContent=multiple?'Multiple Items are Selected.':'Select a Task';$('detail-placeholder').querySelector('p').hidden=multiple;
 if(multiple){$('detail-content').hidden=true;$('detail-placeholder').hidden=false;$('detail-id').textContent='Task Details';$('detail-back').disabled=true;return;}`);
change('await flushEditors();if(draft?.text?.trim())', 'await flushEditors();workSelection.clear();if(draft?.text?.trim())');
change('async function beginRename(id){await flushEditors();', 'async function beginRename(id){await flushEditors();workSelection.clear();');
change("if(action==='group')return;", "if(action==='group'){e.preventDefault();toast('Grouping Selected Items Is Coming in the Next Task.');return;}");
change('hasSelection:!!detailId||!!draft||!!renameId||document.querySelectorAll', 'hasSelection:workSelection.ids.size>0||!!detailId||!!draft||!!renameId||document.querySelectorAll');
change("selectedCount:document.querySelectorAll('#rows input[type=\"checkbox\"]:checked').length", 'selectedCount:workSelection.ids.size');
change("const left=row.cells[0].getBoundingClientRect().left+target.displayDepth*step;", "const gutter=parseFloat(getComputedStyle(scroller).getPropertyValue('--row-gutter'))||48;\n const left=row.cells[0].getBoundingClientRect().left+gutter+target.displayDepth*step;");
change("const id=handle.dataset.drag||handle.dataset.select;if(!tree.byId.has(id))return;", "const id=handle.dataset.drag||handle.dataset.select;if(!tree.byId.has(id))return;\n if(handle.dataset.drag&&workSelection.ids.size>1){toast('Moving Multiple Items Is Coming in the Next Task.');return;}");
change('commentDrafts=new Map([...commentDrafts]', 'workSelection.remap(mapping);commentDrafts=new Map([...commentDrafts]');
fs.writeFileSync(file,s);
