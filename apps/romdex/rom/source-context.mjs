import {parseJSON} from '../content/contracts.mjs';
import {areaDisplayName} from '../public/area-presentation.mjs';

// HGSS MapRegion enum, not an inference from a map's name.
export const regionDisplayName=id=>id===0?'Johto':id===1?'Kanto':'Region Needs Review';
const clean=text=>String(text).replace(/\[CTRL:0103:[^\]]*\]/g,'[Player]').replace(/\[(?:CTRL|VAR):[^\]]*\]/g,'…').replace(/[\s\x00-\x1f]+/g,' ').trim();
const excerpt=text=>text.length>105?text.slice(0,102).trimEnd()+'…':text;
function topic(text){if(/(?:eight|8) Badges/i.test(text))return 'Eight-Badge Conversation';if(/missing Pok[eé]mon|investigating|red-haired boy/i.test(text))return 'Missing Pokémon Investigation';if(/you picked|chosen Pok[eé]mon|cute Pok[eé]mon/i.test(text))return 'Chosen Pokémon Conversation';if(/Professor.*(?:waiting|give)|something to give/i.test(text))return 'Professor Visit / Gift';if(/received.*from Professor/i.test(text))return 'Receiving the Professor’s Gift';return null;}
export function extractionFromDocument(value){
 const source=value.document.extensions?.['org.romdex.rom-source'];const asset=id=>value.document.assetInventory.find(a=>a.assetId===id);const entry=asset(source?.sourceAsset);if(!entry)return null;
 const index=parseJSON(value.blobs.get(entry.sha256));if(index.format!=='ROMDexExtractionIndex/1')return null;
 const x={...index.header};for(const [key,refs]of Object.entries(index.sections))x[key]=refs.flatMap(id=>parseJSON(value.blobs.get(asset(id).sha256)).items);return x;
}
export function stagePresentation(x,stage){
 const c=stage.condition;if(!c)return stage;const hooks=x.roots.filter(r=>r.kind==='scene-hook'&&r.predicate?.operator==='equal'&&r.predicate.left===c.variable&&r.predicate.right===c.value),writes=x.mutations.filter(m=>m.kind==='SetVar'&&m.operands[0]===c.variable&&m.operands[1]===c.value);
 const seeds=hooks.length?hooks:writes,flows=new Map(x.flows.map(f=>[f.key,f])),messages=new Map(x.messages.map(m=>[m.key,m.text])),dialogue=[],commands=new Set(),locations=new Set(),sourceFlows=new Set();
 for(const seed of seeds){if(typeof seed.flow!=='string')continue;const root=hooks.length?seed:x.roots.find(r=>r.flow===seed.flow),header=root?.headerId,area=x.areas.find(a=>a.headerId===header);if(area)locations.add(areaDisplayName(area,x.testbed.name,x.areas.indexOf(area)));
  const queue=[seed.flow],seen=new Set();while(queue.length){const key=queue.shift();if(seen.has(key))continue;seen.add(key);sourceFlows.add(key);for(const link of x.flowReferences.filter(l=>l.from===key))queue.push(link.flow);const rows=flows.get(key)?.instructions||[];
   // For transition context, the nearest preceding text is useful, but it is
   // explicitly source context, never proof of linear execution or chronology.
   const sites=!hooks.length&&key===seed.flow?[...rows.filter(r=>r.offset<=seed.offset)].reverse():rows;
   for(const row of sites){if(/Movement|Flag|Object|Give|Take|Warp|Battle/.test(row.name))commands.add(row.name.replace(/([a-z])([A-Z])/g,'$1 $2'));for(const ref of row.messageReferences){const text=messages.get(ref.message);if(text&&['dialogue','sign'].includes(ref.role)){const line=clean(text);if(line&&!dialogue.includes(line))dialogue.push(line);}}}
  }
 }
 const location=[...locations].join(' / ')||x.testbed.name||'Selected Map',context=dialogue[0]? (topic(dialogue[0])?topic(dialogue[0])+' · ':'')+'“'+excerpt(dialogue[0])+'”':commands.size?[...commands].slice(0,3).join(', '):'Scene setup; no linked dialogue';
 return {...stage,name:location+' — '+(hooks.length?'Scene: ':'After scene: ')+context,event:'Source-linked scene context. Story order and full runtime availability require review.',sourceLabel:stage.sourceLabel||stage.name,displayContext:{format:'ROMDexStageContext/1',basis:hooks.length?'Scene activated by this condition':'State written by this scene; not an established story milestone',locations:[...locations],dialogue:dialogue.slice(0,4).map(text=>text.length>800?text.slice(0,797)+'…':text),actions:[...commands].slice(0,16),flows:[...sourceFlows].slice(0,32),requiresReview:true}};
}
