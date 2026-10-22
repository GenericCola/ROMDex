from pathlib import Path
import re
s=Path('outputs/ROMDex/public/addons/npcdex/index.html').read_text(encoding='utf-8-sig')
styles=re.findall(r'<style[^>]*>(.*?)</style>',s,re.S)
for i,css in enumerate(styles):
 for m in re.finditer(r'([^{}]+)\{([^{}]*)\}',css):
  selector=m[1].strip()
  if any(x in selector for x in ['.timeline','.stage','.marks','.content-light']):print(str(i)+' '+selector+'{'+m[2][:900]+'}')
s=Path('outputs/ROMDex/content/workspace-runtime.js').read_text(encoding='utf-8-sig')
for line in s.splitlines():
 if line.startswith(('function points(', 'function atStage(', 'function conditionIndex(', 'function activeStages(', 'function conditionalPoint(', 'function selectedElements(', 'function visibleTurns(', 'function speakerTurns(')):print(line[:1700])
