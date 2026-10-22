from pathlib import Path
s=Path('outputs/ROMDex/content/workspace-runtime.js').read_text(encoding='utf-8-sig')
for start,end in [('function conditionTurns','function speakerTurns'),('function activeStages','function pointLabel')]:
 a=s.find(start);b=s.find(end,a+1);print(s[a:b][:8000])
