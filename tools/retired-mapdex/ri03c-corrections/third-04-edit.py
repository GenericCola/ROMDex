from pathlib import Path
import re,json
s=Path('outputs/ROMDex/public/addons/npcdex/index.html').read_text(encoding='utf-8-sig');css=re.search(r'<style[^>]*>(.*?)</style>',s,re.S)[1];css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
def extract(css):
 out=[];i=0
 while i<len(css):
  start=css.find('{',i)
  if start<0:break
  pre=css[i:start].strip();j=start+1;depth=1
  while j<len(css) and depth:
   if css[j]=='{':depth+=1
   elif css[j]=='}':depth-=1
   j+=1
  body=css[start+1:j-1]
  if pre.startswith('@media'):
   inner=extract(body)
   if inner:out.append(pre+'{'+inner+'}')
  elif pre.startswith('@keyframes'):
   if 'content-' in pre:out.append(pre+'{'+body+'}')
  elif any(x in pre for x in ['.timeline','.stage','.marks','.dot','.content-light']):out.append(pre+'{'+body+'}')
  i=j
 return '\n'.join(out)
buttonRules=[]
for pre,body in re.findall(r'([^{}]+)\{([^{}]*)\}',css):
 if pre.strip() in ['button','button[aria-pressed=true]']:
  buttonRules.append((pre.strip(),body))
print(buttonRules)
extra='''
/* Scope the original button defaults to the shared timeline, including MAPDex. */
.timeline button{font:inherit;font-size:12px;cursor:pointer;border:1px solid var(--line);border-radius:5px;color:var(--ink)}
.timeline button[aria-pressed=true]{background:var(--yellow);color:#293023;border-color:#987d37}
.timeline .stage{padding:3px 5px;font-size:12px;background:#49151d;border-color:#8d3f47}
.timeline .stage[aria-pressed=true]{background:var(--yellow);color:#293023;border-color:#987d37}
.timeline .timeline-top button{padding:3px 7px;font-size:10px;background:#691b29;border-color:#994351;line-height:normal}
.timeline .timeline-top button[aria-pressed=true]{background:var(--yellow);color:#293023}
/* Preserve the separately approved human-testing status. */
.timeline-light.amber::after{background:#f6cd61;animation:content-amber-blink 1.2s steps(1,end) infinite!important}
@keyframes content-amber-blink{0%{background:#f6cd61}50%,100%{background:#8d4d17}}
@media(prefers-reduced-motion:reduce){.timeline-light.amber::after{animation:none!important}}
'''
Path('outputs/ROMDex/public/shared-ui/web-timeline.css').write_text('/* Original web NPCDex timeline rules, preserving media queries and rule order. */\n'+extract(css)+'\n'+extra,encoding='utf-8',newline='\n')
# Shared footer is loaded last, after the old experimental condition layout.
p=Path('outputs/ROMDex/public/rom-import.html');s=p.read_text(encoding='utf-8-sig').replace('</head>','<link rel="stylesheet" href="shared-ui/web-timeline.css"></head>');p.write_text(s,encoding='utf-8',newline='\n')
for file in ['content/desktop-assets.mjs','content/preview-server.mjs']:
 p=Path('outputs/ROMDex')/file;s=p.read_text(encoding='utf-8-sig').replace('href="../../shared-ui/npcdex-tiles.css">','href="../../shared-ui/npcdex-tiles.css"><link rel="stylesheet" href="../../shared-ui/web-timeline.css">');p.write_text(s,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/content/native.css');s=p.read_text(encoding='utf-8-sig');s=re.sub(r'\.timeline-stages\{grid-template-columns:repeat\(var\(--stage-count,1\),minmax\(80px,1fr\)\);overflow-x:auto;overflow-y:hidden\}','',s);s=re.sub(r'\.condition-stages\{[^}]*\}\.condition-stages \.stage small\{[^}]*\}','',s);p.write_text(s,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/content/workspace-runtime.js');s=p.read_text(encoding='utf-8-sig');s=s.replace("stage=globalThis.romdexTimelines.chooseStage(globalThis.romdexTimelines.snapshotStages(data,data.towns[0]),null)","stage=null")
s=s.replace("t=>stage==='conditional'?true:stage==='unresolved'?t.unresolved:stage==='other-conditions'?", "t=>stage==='all'?true:stage==='unresolved'?t.unresolved:['conditional','other-conditions'].includes(stage)?")
s=s.replace("if(!element)continue;const owner=", "if(!element||!elementInScope(element)||!visible(element))continue;const owner=")
a=s.index('function renderTimeline(){');b=s.index('\nfunction render(){',a)
s=s[:a]+'''function renderTimeline(){
 const stages=activeStages(),index=conditionIndex(),pp=points(),records=timelinePromptRecords(pp);$('stages').classList.remove('condition-stages');$('stages').style.setProperty('--stage-count',Math.max(1,stages.length));
 const matches=(r,id)=>index?globalThis.romdexConditions.includesSelection(index,r.turn.conditionIds,id):r.p.stages.includes(id)||r.p.stages.includes('all');
 $('stages').innerHTML=stages.map(s=>{const entries=records.filter(r=>matches(r,s.id)),marks=index&&!selected?conditionItemMarks(s.id):entries.map(timelineLightHTML).join(''),count=index&&!selected?(marks.match(/data-affected-item=/g)||[]).length:entries.length;return '<button class="stage" data-stage="'+s.id+'" title="'+esc(s.name+' · '+s.event)+'" aria-pressed="'+(stage===s.id)+'" aria-label="Stage '+stageLabel(s.id)+': '+esc(titleCase(s.name))+'; '+count+(index&&!selected?' affected items':' speaker prompts')+'"><b>'+stageLabel(s.id)+'</b><small>'+esc(titleCase(s.name))+'</small><span class="marks">'+marks+'</span></button>';}).join('');
 $('stages').querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{flushNote();stage=b.dataset.stage;pointId=null;pageIndex=0;renderDialogue();renderTimeline()});
 const other=r=>index?r.turn.unresolved||!r.turn.conditionIds?.length||globalThis.romdexConditions.unclassified(index,r.turn.conditionIds):conditionalPoint(r.p),additional=records.filter(other),colors=additional.map(r=>r.status.color),color=!colors.length?'green':colors.includes('red')?'red':colors.every(c=>c==='green')?'green':colors.every(c=>c==='grey')?'grey':'yellow',count=new Set(additional.map(r=>r.p.id)).size;
 const label='Additional Conditions · '+(color==='green'?'All Prompts Final and Reviewed':color==='red'?'Remove or Critical Attention':color==='grey'?'Status Not Set':'In Progress')+' · '+additional.filter(r=>r.status.color==='green').length+'/'+additional.length+' prompts resolved';
 $('conditional').innerHTML='Other Conditions ('+count+') <span class="content-light timeline-light '+color+'" role="img" aria-label="'+esc(label)+'" title="'+esc(label)+'"></span>';$('conditional').setAttribute('aria-pressed',String(['conditional','other-conditions','unresolved'].includes(stage)));$('conditional').disabled=!additional.length;$('unresolved-conditions')?.remove();
 $('stage-caption').textContent=['conditional','other-conditions','unresolved'].includes(stage)?'Party, choices & unknown story timing':stage==='all'?'All dialogue for this item':formatStages(stages.find(s=>s.id===stage)?.event||'')+(stages.find(s=>s.id===stage)?.uncertain?' · Timing Uncertain':'');
}

''' +s[b:]
old="stage=conditionIndex()&&(['unresolved','other-conditions','conditional'].includes(stage))?stage:globalThis.romdexTimelines.chooseStage(activeStages(),stage);"
new="stage=conditionIndex()?(['unresolved','other-conditions','conditional','all'].includes(stage)||activeStages().some(s=>s.id===stage)?stage:activeStages()[0]?.id||'conditional'):globalThis.romdexTimelines.chooseStage(activeStages(),stage);"
assert old in s;s=s.replace(old,new)
s=s.replace("stage='conditional';pointId=null;pageIndex=0;reviewEntryKey=null;scopeOverride=null;renderDialogue();renderTimeline();", "stage='all';pointId=null;pageIndex=0;reviewEntryKey=null;scopeOverride=null;renderDialogue();renderTimeline();")
p.write_text(s,encoding='utf-8',newline='\n')
p=Path('work/ri03c-corrections/third-review.json');d=json.loads(p.read_text(encoding='utf-8'));d['items'][2].update(status='implemented',proof='third-03-proof.json');p.write_text(json.dumps(d,indent=2),encoding='utf-8',newline='\n')
