from pathlib import Path
p=Path('outputs/ROMDex/content/workspace-runtime.js');s=p.read_text(encoding='utf-8')
s=s.replace("const p=current(),turn=speakerTurns(p)[pageIndex]","const p=current(),turn=visibleTurns(p)[pageIndex]")
s=s.replace("function editorialTarget(p,entry){const turn=speakerTurns(p)[pageIndex]","function editorialTarget(p,entry){const turn=visibleTurns(p)[pageIndex]")
s=s.replace("$('unresolved-conditions')?.remove();","$('unresolved-conditions')?.remove?.();")
a="$('stages').style.setProperty('--stage-count',activeStages().length);"
b="$('stages').classList.toggle('condition-stages',!!conditionIndex());$('stages').style.setProperty('--stage-count',activeStages().length);"
assert a in s;s=s.replace(a,b,1)
a="entries.map(timelineLightHTML).join('')+'</span>"
b="entries.map(timelineLightHTML).join('')+conditionEffectLights(s.id)+'</span>"
assert a in s;s=s.replace(a,b,1)
a='function timelineLightHTML(record)'
b="function conditionEffectLights(id){const index=conditionIndex();if(!index)return '';const effects=[...new Map(index.effects.filter(e=>e.kind!=='dialogue'&&e.conditionIds.includes(id)).map(e=>[e.target.recordId+':'+e.kind,e])).values()];return effects.map(e=>{const element=town().areas.flatMap(a=>a.elements).find(x=>x.id===e.target.recordId);if(!element)return '';const color=statusFor('element',element.id).color,label=e.kind+' · '+name(element)+' · '+globalThis.romdexConditions.describe(e.requires);return '<span class=\"content-light timeline-light '+color+'\" role=\"img\" aria-label=\"'+esc(label)+'\" title=\"'+esc(label)+'\"></span>'}).join('')}\nfunction timelineLightHTML(record)"
assert a in s;s=s.replace(a,b,1)
a="const label=$('speaker-label');if(label)label.parentElement.title="
b="if(pane&&stage!=='conditional'){const effects=conditionIndex().effects.filter(e=>stage==='unresolved'?globalThis.romdexConditions.hasUnknown(e.requires):e.conditionIds.includes(stage)),ids=[...new Set(effects.map(e=>e.target.recordId))],list=document.createElement('details');list.className='condition-affected';list.open=true;const summary=document.createElement('summary');summary.textContent='Affected Entities / Scenes ('+ids.length+')';list.append(summary);for(const id of ids){const entity=town().areas.flatMap(a=>a.elements).find(e=>e.id===id);if(!entity)continue;const button=document.createElement('button');button.type='button';button.className='suite-button';button.textContent=name(entity);button.onclick=()=>{flushNote();selected={type:'element',id};pointId=null;pageIndex=0;renderDialogue();renderTimeline()};list.append(button);}pane.append(list);}const label=$('speaker-label');if(label)label.parentElement.title="
assert a in s;s=s.replace(a,b,1)
p.write_text(s,encoding='utf-8',newline='\n')
# Both the native suite and isolated reader preview receive these scoped styles.
style='\n/* Map conditions remain readable and horizontally scroll at any count. */\n.condition-stages{grid-template-columns:repeat(var(--stage-count,1),minmax(145px,1fr))!important;overflow-x:auto;overflow-y:hidden}.condition-stages .stage small{white-space:normal;overflow-wrap:anywhere}.condition-affected button{display:block;margin:8px 0;padding:8px 12px;text-align:left}\n'
p=Path('outputs/ROMDex/content/native.css');s=p.read_text(encoding='utf-8');
if '.condition-stages{' not in s:p.write_text(s+style,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/content/preview-server.mjs');s=p.read_text(encoding='utf-8');a="html=html.replace('</head>','<style>.device";b="html=html.replace('</head>','<style>"+style.replace('\n','')+".device";assert a in s;s=s.replace(a,b,1);p.write_text(s,encoding='utf-8',newline='\n')
# Minimal DOM fixtures now exercise class toggles as well as stage captions.
p=Path('outputs/ROMDex/tests/map-timelines.test.mjs');s=p.read_text(encoding='utf-8');s=s.replace("innerHTML:'',textContent:'',style:","innerHTML:'',textContent:'',classList:{toggle(){}},style:");s=s.replace("timelineLightHTML:()=>''","timelineLightHTML:()=>'',conditionEffectLights:()=>''");p.write_text(s,encoding='utf-8',newline='\n')
