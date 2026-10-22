import fs from 'node:fs/promises';
import {RomReader} from '../../outputs/ROMDex/rom/reader.mjs';
import {extractConditions,validateConditionExtraction} from '../../outputs/ROMDex/rom/condition-extraction.mjs';
import {extractionDigest,validateExtraction} from '../../outputs/ROMDex/rom/extract.mjs';
import assert from 'node:assert/strict';
const root=new URL('./',import.meta.url),proof=JSON.parse(await fs.readFile(new URL('proof.json',root),'utf8'));
const rom=await RomReader.open('C:/Users/mrgen/OneDrive/Apps/melonDS/melonDS-1.1-windows-x86_64/TEST/0.6.3_noduplicates.nds');
try{
 const pin=(await rom.fingerprint()).sha256;
 for(const [i,key]of ['new-bark-town','route-29'].entries()){
  const x=JSON.parse(await fs.readFile(new URL(key+'.extraction.json',root),'utf8'));validateExtraction(x);assert.equal(x.source.sha256,pin);
  x.conditionAnalysis=extractConditions(x,{check:()=>rom.check()});validateConditionExtraction(x.conditionAnalysis,x);x.digest=extractionDigest(x);validateExtraction(x);
  const a=x.conditionAnalysis,summary=proof.checks[i];
  Object.assign(summary,{extractionDigest:x.digest,conditionDigest:a.digest,conditions:a.conditions.length,effects:a.effects.length,dialogueEffects:a.effects.filter(e=>e.kind==='dialogue').length,completeRoots:a.coverage.filter(c=>c.status==='complete').length,partialRoots:a.coverage.filter(c=>c.status!=='complete').length,knownConditions:a.conditions.filter(c=>c.expression.op!=='unknown').length,unresolvedConditions:a.conditions.filter(c=>c.expression.op==='unknown').length,labels:a.conditions.map(c=>c.label),warnings:[...new Set(a.warnings.map(w=>w.reason))]});
  await fs.writeFile(new URL(key+'.extraction.json',root),JSON.stringify(x));await fs.writeFile(new URL(key+'.conditions.json',root),JSON.stringify(a));console.log(JSON.stringify({...summary,labels:undefined,warnings:undefined}));
 }
 assert.notDeepEqual(proof.checks[0].labels,proof.checks[1].labels);proof.finalCodeReplayed=true;proof.finalCodeSourceFingerprintVerified=pin;proof.notes='Final tracer rechecked on the exact source-pinned graphs from the preceding direct ROM extraction; unchanged sprite decoding was not repeated.';
 await rom.assertUnchanged();await fs.writeFile(new URL('proof.json',root),JSON.stringify(proof,null,2));
}finally{await rom.close();}
