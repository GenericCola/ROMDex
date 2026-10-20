// The internal empty snapshot keeps legacy selectors safe; it is never a map.
(()=>{
 function render(document,snapshot){
  const empty=snapshot.contentPreview?.emptyWorkspace===true;
  document.body.classList.toggle('npcdex-empty-workspace',empty);
  const timeline=document.querySelector('.timeline');if(timeline)timeline.hidden=empty;
  if(!empty)return false;
  const set=(id,text)=>{const node=document.getElementById(id);if(node)node.textContent=text;};
  set('scope-title','NPCDex');set('tile-count','No Maps Imported');set('dialogue-title','Your Map Workflow');
  document.getElementById('maps').innerHTML='<p class="muted npcdex-empty-selector">No maps imported yet.</p>';
  document.getElementById('groups').innerHTML='<section class="npcdex-empty-panel"><h3>Start with a Map</h3><p>Import a portable RDX map, or open MAPDex to extract and prepare a map from your ROM.</p><div class="npcdex-empty-actions"><button type="button" data-npcdex-import>Import RDX Map</button><button type="button" data-npcdex-mapdex>Open MAPDex</button></div></section>';
  document.getElementById('dialogue').innerHTML='<p class="muted">Prepare a map in MAPDex, then send it to NPCDex. Browse and edit it here, and publish its reviewed data tree to YouTrack.</p>';
  return true;
 }
 globalThis.romdexEmptyNPCDex={render};
})();
