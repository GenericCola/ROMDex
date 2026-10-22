import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {RomReader} from '../../outputs/ROMDex/rom/reader.mjs';
import {inventoryHGSS} from '../../outputs/ROMDex/rom/hgss.mjs';
import {readRdxFile} from '../../outputs/ROMDex/rdx/container.mjs';
import {compileMapExtraction} from '../../outputs/ROMDex/rom/compile-map.mjs';
import {mapDomain} from '../../outputs/ROMDex/rdx/map-import.mjs';
import {projectNPCDex} from '../../outputs/ROMDex/content/projection.mjs';
const root=new URL('./',import.meta.url);await fs.mkdir(root,{recursive:true});
const rom=await RomReader.open('C:/Users/mrgen/OneDrive/Apps/melonDS/melonDS-1.1-windows-x86_64/TEST/0.6.3_noduplicates.nds');
try{
 const inventory=await inventoryHGSS(rom),assets=new Map();
 for(const file of ['../mapdex-general/NewBarkTown.rdx','../mapdex-general/Route29.rdx']){
  const v=await readRdxFile(new URL(file,root));for(const a of v.document.assetInventory.filter(a=>a.purpose==='image'))assets.set('assets/'+a.sha256+'.png',v.blobs.get(a.sha256));
 }
 const summary=[];
 for(const key of ['new-bark-town','route-29']){
  const x=JSON.parse(await fs.readFile(new URL('../mx02/'+key+'.extraction.json',root),'utf8'));assert.equal(x.source.sha256,inventory.source.sha256);
  const v=await compileMapExtraction(x,assets,inventory);await fs.writeFile(new URL(key+'.rdx',root),v.bytes);
  const snapshot=projectNPCDex(mapDomain(v),{assetBytes:hash=>v.blobs.get(hash)});await fs.writeFile(new URL(key+'.snapshot.json',root),JSON.stringify(snapshot));
  summary.push({...v.summary,knownConditions:snapshot.timelines[snapshot.towns[0].timelineRef].stages.length});console.log(JSON.stringify(summary.at(-1)));
 }
 assert.notDeepEqual(summary[0].knownConditions,summary[1].knownConditions);await rom.assertUnchanged();await fs.writeFile(new URL('compilation-proof.json',root),JSON.stringify(summary,null,2));
}finally{await rom.close();}
