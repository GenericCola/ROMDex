// Actual captured data, isolated store; no credentials or network access.
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {ManagedDocuments,documentKey} from '../../outputs/ROMDex/rdx/managed-store.mjs';import {joinNativeMaps} from '../../outputs/ROMDex/rdx/native-adoption.mjs';import {canonical,sha} from '../../outputs/ROMDex/content/contracts.mjs';
const work=path.resolve('work/rd10'),privateRoot=path.join(work,'private-profile'),source=JSON.parse(await fs.readFile(path.join(work,'adoption-preview.json'))),data=path.join(privateRoot,'candidate-acceptance/Data'),report={task:'RD10',stage:'Actual Candidate Store and Reopen Checks',productionWrites:0,remoteWrites:0,credentialsUsed:false};
let store=await ManagedDocuments.open({dataDirectory:data});const evidence=[];
try{
 const files=await fs.readdir(path.join(privateRoot,'candidate-maps'));assert.equal(files.length,3);
 for(const file of files){const input=path.join(privateRoot,'candidate-maps',file),bytes=await fs.readFile(input),state=await store.ingest(input),value=await store.view(state.key);assert.equal(value.document.revision,state.revision);assert.equal(sha(await fs.readFile(state.path)),sha(bytes));const map=source.maps.find(m=>m.documentId===value.document.documentId);assert(map);assert.equal(state.key,documentKey(value.document));assert.equal(sha(bytes),map.sha256);evidence.push({key:state.key,documentId:map.documentId,revision:state.revision,sha256:sha(bytes)});}
 const joined=joinNativeMaps(await Promise.all(evidence.map(e=>store.view(e.key))));assert.equal(sha(canonical(joined)),source.domainSHA256);
 await store.close();store=null;store=await ManagedDocuments.open({dataDirectory:data});
 for(const e of evidence){const status=await store.status(e.key);assert(status.saved);assert.equal(status.revision,e.revision);assert.equal(sha(await fs.readFile(status.path)),e.sha256);}
 const reopened=joinNativeMaps(await Promise.all(evidence.map(e=>store.view(e.key))));assert.equal(sha(canonical(reopened)),source.domainSHA256);
 Object.assign(report,{status:'passed',maps:evidence,exactFileCheckpoints:true,reopenedCatalogSHA256:sha(canonical(reopened)),contentIdentities:reopened.records.length,assets:reopened.assets.length,at:new Date().toISOString()});
}finally{await store?.close();}await fs.writeFile(path.join(work,'candidate-store-proof.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,maps:evidence.length,records:report.contentIdentities,exactFileCheckpoints:true}));
