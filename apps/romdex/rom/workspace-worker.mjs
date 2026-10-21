import {parentPort,workerData} from 'node:worker_threads';
import fs from 'node:fs/promises';
import {RomReader} from './reader.mjs';
import {inventoryHGSS} from './hgss.mjs';
import {decodeMessage} from './messages.mjs';
import {compileRomMap} from './compile-map.mjs';
import {selectPreparedAreas} from './staging-document.mjs';
import {packRdx} from '../rdx/container.mjs';
const progress=value=>parentPort.postMessage({progress:value});
let rom;
try{
 rom=await RomReader.open(workerData.file);
 if(workerData.mode==='catalog'){
  const inventory=await inventoryHGSS(rom,{progress});
  const names=await rom.member(inventory.archives.messages.fileId,279);
  const labels=new Map();for(const m of inventory.maps)if(!labels.has(m.locationSection))labels.set(m.locationSection,decodeMessage(names,m.locationSection).text);
  parentPort.postMessage({result:{source:inventory.source,profile:inventory.profile,maps:inventory.maps.map(m=>({headerId:m.headerId,name:m.internalName,section:m.locationSection,regionId:m.regionId,label:labels.get(m.locationSection)})),suggested:inventory.scopeCandidate}});
 }else{
  const result=await compileRomMap(rom,{previousIdentities:workerData.previousIdentities||null,headerIds:workerData.scopeHeaders,scope:workerData.scope,allowScopeExtension:workerData.allowScopeExtension===true,progress});
  if(result.summary.sourceSHA256!==workerData.sourceSHA256)throw Error('The Selected ROM Changed. Open and Review It Again.');
  const prepared=selectPreparedAreas(result,workerData.headers),bytes=await packRdx(prepared.documentBytes,prepared.blobs);
  progress({stage:'checkpoint'});await fs.writeFile(workerData.output,bytes,{flag:'wx'});
  parentPort.postMessage({result:{file:workerData.output,summary:result.summary}});
 }
}catch(error){parentPort.postMessage({error:{message:error.message,code:error.code||'EXTRACTION'}});}
finally{await rom?.close();}
