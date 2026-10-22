from pathlib import Path
for f in ['outputs/ROMDex/public/addons/npcdex/index.html','outputs/ROMDex/content/workspace-runtime.js']:
 s=Path(f).read_text(encoding='utf-8-sig')
 for t in ['First Steps','STAGES=','STAGES =','stageNames','New Game','FIRST STEPS']:
  i=s.find(t)
  if i>=0:print(f,t,s[max(0,i-100):i+500])
