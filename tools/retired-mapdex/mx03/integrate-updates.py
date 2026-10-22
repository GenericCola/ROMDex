from pathlib import Path
p=Path('outputs/ROMDex/rom/map-update.mjs');s=p.read_text(encoding='utf-8')
imports="import {upgradeMapConditions} from './condition-upgrade.mjs';\nimport {rebindConditionSources,finishUpdatedConditions,updateFeatureBinding} from './update-conditions.mjs';\n"
assert 'rebindConditionSources' not in s;s=imports+s
a="export function previewMapUpdate(incoming,local,{romProjectId,catalogGroupId=null,matches={},passages={},missing={},conflicts:decisions={},implemented=[]}={}){"
assert a in s;s=s.replace(a,a+'\n incoming=upgradeMapConditions(incoming);',1)
a="result=rewrite(r,ids);if(r.kind==='appearance')"
b="result=rebindConditionSources(rewrite(r,ids),next.mappings,mappings);if(r.kind==='appearance')"
assert a in s;s=s.replace(a,b,1)
a="if(source.recordId===om.current.payload.timelineRef){const stages="
b="if(source.recordId===om.current.payload.timelineRef&&!p.definitions.conditionIndex){const stages="
assert a in s;s=s.replace(a,b,1)
a="const final=[...heads.values()].map(r=>"
b="for(const [id,r]of heads)heads.set(id,clone(r));finishUpdatedConditions(heads,oldBy.get(om.current.payload.timelineRef));\n const final=[...heads.values()].map(r=>"
assert a in s;s=s.replace(a,b,1)
a="doc.capabilities.required=[...new Set("
b="updateFeatureBinding(doc,incoming.document,ids);\n doc.capabilities.required=[...new Set("
assert a in s;s=s.replace(a,b,1)
p.write_text(s,encoding='utf-8',newline='\n')
