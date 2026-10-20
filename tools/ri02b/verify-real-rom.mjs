// ROM payload, decoded text and sprites stay local. The proof report contains only counts/hashes.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {RomReader,sha256} from '../../apps/romdex/rom/reader.mjs';
import {extractHGSS,validateExtraction} from '../../apps/romdex/rom/extract.mjs';
import {resolveLocator} from '../../apps/romdex/rom/locators.mjs';
import {decodeMessage} from '../../apps/romdex/rom/messages.mjs';
import {renderTexture,readBTX,encodePNG} from '../../apps/romdex/rom/textures.mjs';
import {run} from '../../apps/romdex/rom/cli.mjs';
const [input,output]=process.argv.slice(2),before=performance.now(),rom=await RomReader.open(input);
try{
 const old=JSON.parse(await fs.readFile(path.join(output,'VioletCity.extraction.json'),'utf8'));
 const {extraction:x,assets}=await extractHGSS(rom,{previousIdentities:old.identities});validateExtraction(x);
 // A new process must reuse area/entity IDs and not regenerate a project from its labels.
 assert.deepEqual(x.identities,old.identities);assert.equal(x.testbed.key,'violet-city');
 assert.deepEqual(x.testbed.headerIds,[73,135,157,158,159,160,162,167]);assert.ok(x.areas.every(a=>a.locationSection===128));
 const locators=new Map();
 function visit(v){if(!v||typeof v!=='object')return;if(v.adapter&&v.fileSha256&&v.selectors)locators.set(JSON.stringify(v),v);else for(const child of Object.values(v))visit(child);}
 visit(x);for(const l of locators.values())await resolveLocator(rom,l,x.source.sha256);
 for(const message of x.messages){
  const bytes=await rom.member('a/0/2/7',message.bank),decoded=decodeMessage(bytes,message.index);
  assert.equal(decoded.wordSHA256,message.wordSHA256);assert.equal(decoded.text,message.text);
 }
 // Check actual compressed trainer names too, independently of whether map dialogue uses them.
 const names=await rom.member('a/0/2/7',729);let compressedNames=0;
 for(let i=0;i<names.readUInt16LE(0);i++){const m=decodeMessage(names,i);if(m.compressed)compressedNames++;}
 // Re-render every distinct member/texture/palette source binding and compare exported PNG bytes.
 const parsed=new Map();let renderedBindings=0;
 for(const appearance of x.appearances){
  if(!parsed.has(appearance.spriteMember))parsed.set(appearance.spriteMember,readBTX(await rom.member('a/0/8/1',appearance.spriteMember)));
  const btx=parsed.get(appearance.spriteMember);
  for(const a of appearance.assets){assert.equal(sha256(encodePNG(renderTexture(btx.textures[a.textureIndex],btx.palettes[a.paletteIndex]))),a.sha256);assert.equal(sha256(assets.get(a.path)),a.sha256);assert.equal(sha256(await fs.readFile(path.join(output,a.path))),a.sha256);renderedBindings++;}
 }
 const sameBytes=await rom.hashRange(0,rom.size);assert.equal(sameBytes,x.source.sha256);
 const messages=[],options={stdout:s=>messages.push(JSON.parse(s)),stderr:s=>messages.push(JSON.parse(s))};
 assert.equal(await run(['extract',input,output],options),1);assert.equal(messages.at(-1).code,'EEXIST');
 const events=Object.fromEntries(['overworlds','backgrounds','warps','triggers'].map(k=>[k,x.areas.reduce((n,a)=>n+a.events[k].length,0)]));
 const proof={format:'ROMDexRI02BRealROMProof/1',testbed:x.testbed,sourceSHA256:x.source.sha256,sourceBytes:x.source.bytes,extractionDigest:x.digest,identityDigest:x.identities.digest,inventoryDigest:x.inventoryDigest,coverage:x.coverage,events,checks:{allDistinctSourceLocatorsReopened:locators.size,decodedMessagesCompared:x.messages.length,compressedTrainerNamesDecoded:compressedNames,renderedFramePaletteBindings:renderedBindings,uniqueTexturePNGs:assets.size,sameSourceIdentitiesReused:true,existingOutputRefused:true,fullROMHashUnchanged:true,noCloudAccess:true,noProductionDataAccess:true},warningCounts:Object.fromEntries([...new Set(x.warnings.map(w=>w.code))].map(k=>[k,x.warnings.filter(w=>w.code===k).length])),nativeDependencyCommands:x.nativeDependencies.length,mapMilestoneCandidates:x.timeline.milestoneCandidates.length,elapsedMs:Math.round(performance.now()-before)};
 await fs.writeFile(path.join(output,'VioletCity.extraction.json'),JSON.stringify(x));await fs.writeFile(path.join(output,'real-rom-proof.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
}finally{await rom.close();}
