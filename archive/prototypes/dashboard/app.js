// Sample data only. Real YouTrack reads and writes belong in a separate adapter.
const tasks = [
  {id:'DEMO-1',title:'Map the daycare player journey',project:'Pokémon Daycare',list:'Game design',status:'In progress',priority:'High'},
  {id:'DEMO-2',title:'Review NPC dialogue',project:'Pokémon Daycare',list:'World & dialogue',status:'To do',priority:'Normal'},
  {id:'DEMO-3',title:'Outline breeding mechanics',project:'Pokémon Daycare',list:'Game design',status:'Done',priority:'Normal'},
  {id:'DEMO-4',title:'Choose workspace organization',project:'Dashboard',list:'First version',status:'In progress',priority:'High'},
  {id:'DEMO-5',title:'Map workspace views to YouTrack',project:'Dashboard',list:'First version',status:'To do',priority:'High'},
  {id:'DEMO-6',title:'Bring over the NPCDex theme',project:'Dashboard',list:'First version',status:'Done',priority:'Normal'}
];
let project='All projects', view='list';
const $=id=>document.getElementById(id);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
  const search=$('search').value.toLowerCase();
  const selected=tasks.filter(t=>project==='All projects'||t.project===project);
  const filtered=selected.filter(t=>`${t.title} ${t.id} ${t.project} ${t.list}`.toLowerCase().includes(search));
  $('project-title').textContent=project;
  $('total').textContent=selected.length;
  $('progress').textContent=selected.filter(t=>t.status==='In progress').length;
  $('done').textContent=selected.filter(t=>t.status==='Done').length;
  const card=t=>`<article class="task"><div><small>${escapeHTML(t.id)} · ${escapeHTML(t.project)} / ${escapeHTML(t.list)}</small><strong>${escapeHTML(t.title)}</strong></div><span class="status ${t.status==='Done'?'done':t.status==='In progress'?'progress':''}">${escapeHTML(t.status)}</span><span class="priority">${escapeHTML(t.priority)} priority</span></article>`;
  $('tasks').innerHTML=!filtered.length?'<p class="empty">No tasks match your search.</p>':view==='list'?filtered.map(card).join(''):`<div class="board">${['To do','In progress','Done'].map(status=>`<section class="column"><h3>${status} · ${filtered.filter(t=>t.status===status).length}</h3>${filtered.filter(t=>t.status===status).map(card).join('')}</section>`).join('')}</div>`;
}
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{project=button.dataset.project;document.querySelectorAll('[data-project]').forEach(b=>b.classList.toggle('active',b===button));render();}));
['list','board'].forEach(mode=>$(mode+'-view').addEventListener('click',()=>{view=mode;['list','board'].forEach(v=>{$(v+'-view').classList.toggle('active',v===view);$(v+'-view').setAttribute('aria-pressed',String(v===view));});render();}));
$('search').addEventListener('input',render);
$('scope-open').addEventListener('click',()=>$('scope').showModal());
$('scope-close').addEventListener('click',()=>$('scope').close());
render();
