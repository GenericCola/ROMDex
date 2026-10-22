import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {RomReader} from '../../outputs/ROMDex/rom/reader.mjs';
import {inventoryHGSS} from '../../outputs/ROMDex/rom/hgss.mjs';
import {extractHGSS} from '../../outputs/ROMDex/rom/extract.mjs';
const file='C:/Users/mrgen/OneDrive/Apps/melonDS/melonDS-1.1-windows-x86_64/TEST/0.6.3_noduplicates.nds';
const rom=await RomReader.open(file),out=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1'));
try{
 const inventory=await inventoryHGSS(rom);console.log('Read-only inventory ready.');await fs.mkdir(out,{recursive:true});
 const summaries=[];
 for(const [key,name,headers]of [['new-bark-town','New Bark Town',[60,61,62,63,64,65,66,384]],['route-29','Route 29',inventory.maps.filter(m=>/^R29(?:$|R)/.test(m.internalName)).map(m=>m.headerId)]]){
  assert(headers.length);console.log('Extracting '+name);const {extraction}=await extractHGSS(rom,{inventory,headerIds:headers,scope:{key,name,regionName:'Johto',regionKey:'johto'},progress:p=>{if(p.stage==='map-conditions'&&(p.completed%10===0||p.completed===p.total))console.log(JSON.stringify(p));}}),a=extraction.conditionAnalysis;
  assert(a.conditions.length>0);assert(a.effects.some(e=>e.kind==='dialogue'));assert(a.conditions.every(c=>a.effects.some(e=>e.conditionIds.includes(c.id))));
  const summary={map:name,headers,romSha256:extraction.source.sha256,extractionDigest:extraction.digest,conditionDigest:a.digest,conditions:a.conditions.length,effects:a.effects.length,dialogueEffects:a.effects.filter(e=>e.kind==='dialogue').length,roots:a.coverage.length,completeRoots:a.coverage.filter(c=>c.status==='complete').length,partialRoots:a.coverage.filter(c=>c.status!=='complete').length,excludedUnboundRoots:a.excludedUnboundRoots,states:a.states,labels:a.conditions.map(c=>c.label),warnings:[...new Set(a.warnings.map(w=>w.reason))]};
  summary.knownConditions=a.conditions.filter(c=>c.expression.op!=='unknown').length;summary.unresolvedConditions=a.conditions.filter(c=>c.expression.op==='unknown').length;
  await fs.writeFile(path.join(out,key+'.extraction.json'),JSON.stringify(extraction));await fs.writeFile(path.join(out,key+'.conditions.json'),JSON.stringify(a));summaries.push(summary);console.log(JSON.stringify({...summary,labels:undefined,warnings:undefined}));
 }
 assert.notDeepEqual(summaries[0].labels,summaries[1].labels);await rom.assertUnchanged();
 await fs.writeFile(path.join(out,'proof.json'),JSON.stringify({passed:true,romReadOnly:true,runtimeEmulated:false,productionChanged:false,checks:summaries},null,2));
}finally{await rom.close();}
