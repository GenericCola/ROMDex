// Presentation only: source text and associations are never inferred or rewritten.
export function dialoguePrompts(payload,stage='all'){
 const ordered=(payload.pointOrder||[]).map((id,i)=>{const p=payload.points[id],blocks=p.blockOrder.map(id=>p.blocks[id]),excerpt=(blocks.find(b=>b.text?.trim())?.text||'Source text').replace(/\s+/g,' ').trim();return {id,condition:p.condition,stages:p.stageIds,blocks,label:'Prompt '+(i+1)+' · '+(excerpt.length>92?excerpt.slice(0,89)+'…':excerpt)};});
 return {total:ordered.length,visible:ordered.filter(p=>stage==='all'||(stage==='other'?p.stages.length===0:p.stages.includes(stage)))};
}
export function usesWorkspaceTab(event){return event.key==='Tab'&&!event.shiftKey&&!event.isComposing&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.target.closest('input,select,textarea,button,summary,a,[role=menu],[role=dialog],[contenteditable]');}
