from pathlib import Path
p=Path('outputs/ROMDex/content/workspace-runtime.js');s=p.read_text(encoding='utf-8')
a="stage=globalThis.romdexTimelines.chooseStage(activeStages(),timelinePositions.get(id));"
b="stage=conditionIndex()?'conditional':globalThis.romdexTimelines.chooseStage(activeStages(),timelinePositions.get(id));"
assert a in s;s=s.replace(a,b,1)
a="if(available.length&&available.every(p=>!p.stages.length))"
b="if(conditionIndex()){if(stage!=='conditional'&&!available.some(eligible))stage='conditional';}else if(available.length&&available.every(p=>!p.stages.length))"
assert a in s;s=s.replace(a,b,1)
a="stage=globalThis.romdexTimelines.chooseStage(activeStages(),stage);$('male')"
b="stage=conditionIndex()&&(stage==='unresolved'||stage==='conditional')?stage:globalThis.romdexTimelines.chooseStage(activeStages(),stage);$('male')"
assert a in s;s=s.replace(a,b,1)
# Preserve a complete source block as one prompt; blank-separated passages stay
# together under existing whole-prompt annotation controls.
a="return pages(p).map(entry=>{const speaker=resolveSpeaker(p,entry,null),effects="
b="const groups=new Map();for(const entry of pages(p)){const key=entry.blockId||entry.key;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry);}return [...groups.values()].map(entries=>{const entry=entries[0],speaker=resolveSpeaker(p,entry,null),effects="
assert a in s;s=s.replace(a,b,1)
a="entries:[{...entry,speakerLabel:speaker.label,system:speaker.system}],conditionIds:"
b="entries:entries.map(entry=>({...entry,speakerLabel:speaker.label,system:speaker.system})),conditionIds:"
assert a in s;s=s.replace(a,b,1)
p.write_text(s,encoding='utf-8',newline='\n')
