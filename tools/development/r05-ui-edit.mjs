import fs from 'node:fs';const file='outputs/ROMDex/public/app.mjs';let s=fs.readFileSync(file,'utf8');
function change(a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,80));s=s.replace(a,b);}
change("import {WorkSelection} from './work-selection.mjs';", "import {WorkSelection} from './work-selection.mjs';\nimport {siblingSelection,bulkMovePlan} from './bulk-hierarchy.mjs';");
change('workRowsMarkup=null;', 'workRowsMarkup=null,groupDraft=null;');
change("const edit=renameId===item.id;", "const edit=renameId===item.id;");
change('if(draft&&draft.afterId===row.id)', "if(groupDraft&&groupDraft.beforeId===row.id)html.push(groupDraftHTML());if(draft&&draft.afterId===row.id)");
change("if(draft&&!inserted)html.push(draftHTML());", "if(groupDraft&&!rows.some(x=>x.id===groupDraft.beforeId))html.push(groupDraftHTML());if(draft&&!inserted)html.push(draftHTML());");
change("const active=document.activeElement,checkboxFocus=", "const active=document.activeElement,checkboxFocus=");
change("['draft-title','rename-input'].includes(active.id)", "['draft-title','rename-input','group-title'].includes(active.id)");
change("if(draft&&focus?.id==='draft-title')draft.text=focus.value;", "if(draft&&focus?.id==='draft-title')draft.text=focus.value;if(groupDraft&&focus?.id==='group-title')groupDraft.text=focus.value;");
change('workSelection.clear();selected=id||null;', 'workSelection.clear();groupDraft=null;selected=id||null;');
change('workSelection.clear();detailNavigation.open', 'workSelection.clear();groupDraft=null;detailNavigation.open');
change('if(draft?.text?.trim()){toast', "if(groupDraft){toast('Finish or Cancel the New Parent First.');return;}\n  if(draft?.text?.trim()){toast");
change("document.addEventListener('romdex-clear-work-selection',()=>workSelection.clear());", "document.addEventListener('romdex-clear-work-selection',()=>{workSelection.clear();groupDraft=null;});");
change('hasSelection:workSelection.ids.size>0||', 'hasSelection:!!groupDraft||workSelection.ids.size>0||');
change("const inlineName=['draft-title','rename-input'].includes(e.target.id);", "const inlineName=['draft-title','rename-input'].includes(e.target.id);");
change("const navigation=e.target.matches('.work-trays,.row-title')", "const navigation=(e.target.matches('[data-check]')&&workSelection.ids.size>1)||e.target.matches('.work-trays,.row-title')");
change("// R04/R05 will handle selected-item grouping; never turn its TAB into a pane cycle.\n if(action==='group'){e.preventDefault();toast('Grouping Selected Items Is Coming in the Next Task.');return;}", "if(action==='group'){e.preventDefault();safely(beginGroup);return;}");
change("if(e.target.id==='draft-title'){\n  if(e.key==='Enter')", "if(e.target.id==='group-title'){if(e.key==='Enter'){e.preventDefault();safely(commitGroup);}return;}\n if(e.target.id==='draft-title'){\n  if(e.key==='Enter')");
change("if(e.target.id==='rename-input')renameText=e.target.value;", "if(e.target.id==='rename-input')renameText=e.target.value;if(e.target.id==='group-title'&&groupDraft)groupDraft.text=e.target.value;");
change("if(handle.dataset.drag&&workSelection.ids.size>1){toast('Moving Multiple Items Is Coming in the Next Task.');return;}\n drag={id", "if(groupDraft){toast('Finish or Cancel the New Parent First.');return;}\n let bulkIds=null;if(handle.dataset.drag&&workSelection.ids.size>1){if(!workSelection.ids.has(id)){toast('Drag a Checked Item to Move the Selection.');return;}try{bulkIds=siblingSelection(items,ws.state.order,[...workSelection.ids]).members.map(x=>x.id);}catch(error){toast(error.message);return;}}\n drag={bulkIds,id");
change("if(!target||target.id===drag.id)return;", "if(!target||target.id===drag.id||drag.bulkIds?.includes(target.id))return;");
change("document.body.dataset.dragStatus='target:'", "if(drag.bulkIds){const plan=bulkMovePlan(items,ws.state.order,drag.bulkIds,drop.parentId,drop.beforeId);drop.beforeId=plan.beforeId;}\n  document.body.dataset.dragStatus='target:'");
change("$('drop-message').textContent=`Move “${itemName(tree.byId.get(drag.id))}”", "$('drop-message').textContent=`Move ${drag.bulkIds?drag.bulkIds.length+' Selected Items':'“'+itemName(tree.byId.get(drag.id))+'”'}");
change("${drop.beforeId?' · before “'+itemName(tree.byId.get(drop.beforeId))+'”':''}`", "${drop.beforeId?' · before “'+itemName(tree.byId.get(drop.beforeId))+'”':''} · Level ${(drop.parentId?tree.depths.get(drop.parentId)+1:0)+1} (${tier(drop.parentId?tree.depths.get(drop.parentId)+1:0)})`");
change('id=drag.id;if(active)', 'id=drag.id,bulkIds=drag.bulkIds;if(active)');
change("await ws.move(id,pending.parentId,pending.beforeId);toast('Item moved.');", "if(bulkIds){await ws.moveMany(bulkIds,pending.parentId,pending.beforeId);workSelection.clear();updateSelectionDetails();render();toast('Selected Items Moved.');}else{await ws.move(id,pending.parentId,pending.beforeId);toast('Item moved.');}");
change('workSelection.remap(mapping);', "workSelection.remap(mapping);if(groupDraft){groupDraft.ids=groupDraft.ids.map(id);groupDraft.parentId=id(groupDraft.parentId);groupDraft.beforeId=id(groupDraft.beforeId);}");
change("||draft?.text?.trim()){e.preventDefault();", "||draft?.text?.trim()||groupDraft?.text?.trim()){e.preventDefault();");
change('function clearDrop(){', `function groupDraftHTML(){const depth=groupDraft.parentId?tree.depths.get(groupDraft.parentId)+1:0,relative=Math.max(0,depth-(selected?tree.depths.get(selected)+1:0));return \`<tr class="draft-row" style="--depth:\${relative}"><td><div class="task-cell"><span class="row-gutter"></span><div class="row-hierarchy"><span class="draft-indent"></span><span class="draft-status">\${bulb('grey')}</span><input id="group-title" class="draft-input" aria-label="New Parent Title" placeholder="Parent Title…" value="\${esc(groupDraft.text)}"></div></div></td><td colspan="3" class="draft-hint">Enter to Group · Esc to Cancel</td></tr>\`;}
async function beginGroup(){
 await selectionQueue;await flushEditors();if(groupDraft||draft||renameId){toast('Finish or Cancel the Current Editor First.');return;}
 const choice=siblingSelection(items,ws.state.order,[...workSelection.ids]);groupDraft={ids:choice.members.map(x=>x.id),parentId:choice.parentId,beforeId:choice.members[0].id,text:''};renderWork();$('group-title')?.focus();
}
async function commitGroup(){
 if(!groupDraft)return;const current=groupDraft,title=$('group-title')?.value||current.text;
 if(!title.trim()){groupDraft=null;renderWork();focusWorkspace();return;}
 const choice=siblingSelection(ws.items,ws.state.order,current.ids);if(choice.parentId!==current.parentId)throw Error('The Selected Items Changed Parents. Cancel and Select Them Again.');
 const depth=choice.parentId?tree.depths.get(choice.parentId)+1:0;
 const result=await ws.groupItems(current.ids,title,depth===0?'Epic':depth<=SELECTOR_MAX_DEPTH?'Feature':'Task');
 groupDraft=null;workSelection.clear();updateSelectionDetails();expanded.add(result.createdParentId);render();focusWorkspace();toast('New Parent and Selected Items Queued for YouTrack.');
}
function clearDrop(){`);
// Progress remains visible only for active/review groups.
change('renderSelectors();renderWork();', `const activeGroups=Object.values(ws.state.bulkGroups||{}).filter(g=>['pending','blocked'].includes(g.status));$('bulk-progress').hidden=!activeGroups.length;$('bulk-progress').textContent=activeGroups.map(g=>\`\${g.kind==='group'?'Grouping':'Moving'} Items · \${g.completed.length} of \${g.opIds.length} Saved\${g.status==='blocked'?' · Review Required':''}\`).join(' · ');
 renderSelectors();renderWork();`);
change("const op=ws.state.operations.find(x=>x.opId===block.opId),item=", "const op=ws.state.operations.find(x=>x.opId===block.opId),group=ws.state.bulkGroups?.[op?.group?.id],item=");
change('if(block.error){html+=', `if(group){$('discard-conflict').textContent='Cancel Remaining Group Changes';html+=\`<p>\${group.completed.length} of \${group.opIds.length} Items Saved. Cancelling Removes Only Pending Group Changes; Confirmed YouTrack Changes Stay in Place.</p><ul>\${group.entries.map(x=>'<li>'+esc(x.label)+' · '+esc(x.issueId)+' · '+(group.completed.includes(x.opId)?'Saved':'Pending')+'</li>').join('')}</ul>\`;}
 if(block.error){html+=`);
change("['__missing__','__children__','__verify__'].includes", "['__missing__','__children__','__verify__','__group__'].includes");
fs.writeFileSync(file,s);
const html='outputs/ROMDex/public/index.html';let h=fs.readFileSync(html,'utf8');h=h.replace('<div class="work-body">','<div id="bulk-progress" class="notice bulk-progress" role="status" hidden></div><div class="work-body">');fs.writeFileSync(html,h);
