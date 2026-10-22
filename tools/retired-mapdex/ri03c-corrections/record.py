from pathlib import Path
import shutil,json
root=Path.cwd();items=[
'Close the Tray 3 scrolling gap between the heading and location name.',
'Fill tile image panes and exclude transparent/empty preview margins without changing original image bytes.',
'Audit timeline relevance, duplicates and grouping; provide useful event/scene labels instead of raw IDs.',
'Place Tray 3 hover/focus cog in its padded top-right corner; use a menu and reviewed pop-up editor behavior.',
'Make location crop percentages visibly preview and persist the requested crop.',
'Render contained locations/entities as suite tiles rather than a button list.',
'Associate supported step/scene dialogue with the related characters, retaining exact source roots and uncertainty.',
'Provide a clear Back action from entity dialogue to the containing entity list.',
'Match NPCDex navigation/layout: left map/expandable zones, Tray 2 entities, Tray 3 dialogue; only prepared maps expand/show images.',
'Keep same-speaker multipart dialogue scrollable; Next/Previous only change speakers in multi-speaker scenes.',
'Add Update ROM next to Open ROM; reuse explicit project/build association and whole-map preservation/review.',
'Add drag-and-drop map ordering and collapsible local folders in both workspaces, outside YouTrack/content data.',
'Correct padding/spacing in every map cog popup.',
'Provide ergonomic multi-placement character linking, inspection and updates in both MAPDex and NPCDex.'
]
record={'task':'RI03C corrective review','status':'active','ownerAccepted':False,'productionChanged':False,'order':'Complete findings 1 through 14 sequentially; one final packaged review after relevant checks.','items':[{'number':i+1,'request':s,'state':'active' if i==0 else 'pending'} for i,s in enumerate(items)]}
(root/'work/ri03c-corrections/checklist.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
p=root/'outputs/NPCDex-ROMDex-Action-Checklist.md';s=p.read_text(encoding='utf-8-sig');s+='\n\n### RI03C owner review — corrective pass (October 21)\n\nThe owner found 14 issues in the isolated candidate. RI03C is not accepted. Address these in the supplied order, preserve current data/identities, and stop before U28. The latest owner layout/menu direction supersedes MX01 inline/stacked choices where they conflict.\n\n'+'\n'.join('- [ ] **RI03C-C%02d:** %s'%(i+1,v) for i,v in enumerate(items))+'\n';p.write_text(s,encoding='utf-8');shutil.copy2(p,root/'work/u13b/repository/docs/project'/p.name)
