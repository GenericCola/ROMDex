const fs=require('fs');let html=fs.readFileSync('outputs/npcdex-template.html','utf8');
const a=html.indexOf('function renderTimeline(){'),b=html.indexOf('\nfunction ',a+10);if(a<0||b<0)throw Error('Timeline boundary missing');
const replacement=`function timelinePromptRecords(pp){return pp.flatMap(p=>speakerTurns(p).map((turn,index)=>({p,turn,index,key:promptAnnotationKey(p,turn),status:statusFor('prompt',promptAnnotationKey(p,turn))}))) }
function timelineLightHTML(record){const color=record.status.color,label=record.turn.speakerLabel+' · '+pointLabel(record.p)+' · '+(color==='green'?'Final and Reviewed':color==='red'?'Remove or Critical Attention':color==='grey'?'Status Not Set':'In Progress');return '<span class="content-light timeline-light '+color+'" data-prompt-key="'+esc(record.key)+'" role="img" aria-label="'+esc(label)+'" title="'+esc(label)+'"></span>'}
function renderTimeline(){
 $('stages').style.setProperty('--stage-count',data.stages.length);const pp=points(),records=timelinePromptRecords(pp);
 $('stages').innerHTML=data.stages.map(s=>{const entries=records.filter(r=>r.p.stages.includes(s.id)||r.p.stages.includes('all'));return '<button class="stage" data-stage="'+s.id+'" aria-pressed="'+(stage===s.id)+'" aria-label="Stage '+stageLabel(s.id)+': '+esc(titleCase(s.name))+'; '+entries.length+' speaker prompts"><b>'+stageLabel(s.id)+'</b><small>'+esc(titleCase(s.name))+'</small><span class="marks">'+entries.map(timelineLightHTML).join('')+'</span></button>'}).join('');
 $('stages').querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{flushNote();stage=b.dataset.stage;pointId=null;pageIndex=0;renderDialogue();renderTimeline()});
 const additional=records.filter(r=>!r.p.stages.length),colors=additional.map(r=>r.status.color),color=colors.includes('red')?'red':colors.length&&colors.every(c=>c==='green')?'green':!colors.length||colors.every(c=>c==='grey')?'grey':'yellow';
 const label='Additional Conditions · '+(color==='green'?'All Prompts Final and Reviewed':color==='red'?'Remove or Critical Attention':color==='grey'?'Status Not Set':'In Progress')+' · '+additional.filter(r=>r.status.color==='green').length+'/'+additional.length+' prompts resolved';
 $('conditional').innerHTML='Other Conditions ('+pp.filter(p=>!p.stages.length).length+') <span class="content-light timeline-light '+color+'" role="img" aria-label="'+esc(label)+'" title="'+esc(label)+'"></span>';
 $('conditional').setAttribute('aria-pressed',String(stage==='conditional'));$('conditional').disabled=!additional.length;
 $('stage-caption').textContent=stage==='conditional'?'Party, choices & unknown story timing':formatStages(data.stages.find(s=>s.id===stage)?.event||'')+' · '+stageLabel('G')+'–'+stageLabel('I')+' timing probable';
}
`;
html=html.slice(0,a)+replacement+html.slice(b);
// Use the existing indicator primitive and animation timing with a smaller lens/glow.
const lightStart=html.indexOf('.content-light{width:7px'),lightEnd=html.indexOf('.prompt-status-row{',lightStart);let light=html.slice(lightStart,lightEnd);light=light.replaceAll('7px','var(--indicator-size,7px)').replaceAll('0 0 5px 2px','0 0 var(--indicator-glow-blur,5px) var(--indicator-glow-spread,2px)');html=html.slice(0,lightStart)+light+html.slice(lightEnd);
html=html.replace('</style>',`.timeline-light{--indicator-size:4px;--indicator-glow-blur:2px;--indicator-glow-spread:.5px;position:relative;top:auto;left:auto;flex:0 0 4px;vertical-align:middle}
.timeline-light::before{box-shadow:inset 0 0 0 .5px #0006}
.timeline-light::after{inset:.5px}
.marks{flex-wrap:wrap;gap:2px;overflow:visible}
#conditional{display:inline-flex;align-items:center;gap:6px}
</style>`);
fs.writeFileSync('outputs/npcdex-template.html',html);
const planning='outputs/npcdex-planning-ui.js';let js=fs.readFileSync(planning,'utf8');const start=js.indexOf('function refreshTileIndicators(){'),end=js.indexOf('\n',start);const line=js.slice(start,end);js=js.slice(0,start)+line.replace(/ }\s*}$/,' } renderTimeline();}')+js.slice(end);fs.writeFileSync(planning,js);
for(const name of ['npcdex-data.json','npcdex-agent-export.json']){const d=JSON.parse(fs.readFileSync('outputs/'+name));d.buildVersion='2.35';d.interfaceBuild='2.35';fs.writeFileSync('outputs/'+name,JSON.stringify(d,null,2));}
fs.writeFileSync('outputs/npcdex-update-notes.md','# NPCDex 2.35 · Timeline prompt status lights\n\nExisting 4px timeline dots now use the shared indicator primitive, status logic and animations, in dialogue/speaker order. Green requires FINAL and Verified/Inaccessible with no unresolved feedback; yellow fades, red blinks, grey is off. Other Conditions has a matching 4px aggregate light scoped to its available prompts. Updates refresh immediately after flags, notes, verification or status changes. Content and source data are unchanged.\n\n'+fs.readFileSync('outputs/npcdex-update-notes.md','utf8'));
