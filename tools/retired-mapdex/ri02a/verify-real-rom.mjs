import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {RomReader,sha256} from '../../outputs/ROMDex/rom/reader.mjs';
import {inventoryHGSS,validateInventory} from '../../outputs/ROMDex/rom/hgss.mjs';
import {resolveLocator} from '../../outputs/ROMDex/rom/locators.mjs';
import {createIdentityManifest,previewIdentityUpdate} from '../../outputs/ROMDex/rom/identities.mjs';
import {createNativeMappingSession} from '../../outputs/ROMDex/rom/native-mapping.mjs';
import {canonical} from '../../outputs/ROMDex/content/contracts.mjs';
const input=process.argv[2],work=path.resolve(process.env.ROMDEX_PROOF_OUTPUT||'work/ri02a'),capturedFile=path.resolve('work/ri02a/source-inventory.json'),expected='cb743eb01fe18f8599e54911faa28701474b84a6b9d9764a9478bf8a7be1babd';await fs.mkdir(work,{recursive:true});
let requests=0;globalThis.fetch=async()=>{requests++;throw Error('Network forbidden in ROM proof');};
const captured=validateInventory(JSON.parse(await fs.readFile(capturedFile))),rom=await RomReader.open(input),started=Date.now(),checks=[];
try{
 const inventory=await inventoryHGSS(rom);assert.equal(inventory.digest,captured.digest);assert.equal(inventory.source.sha256,expected);assert.equal(inventory.maps.length,540);checks.push('Independent reopen reproduces the entire inventory digest and reads the catalog count from this ROM');
 const selected=inventory.scopeCandidate.headers,maps=inventory.maps.filter(m=>selected.includes(m.headerId));
 assert.equal(maps.length,8);assert.equal(maps.reduce((n,m)=>n+m.events.overworlds.length,0),24);
 let resolved=0;for(const map of inventory.maps){assert.equal(sha256(await resolveLocator(rom,map.locator,expected)),map.sha256);resolved++;}
 checks.push('All 540 physical map-header locators independently resolve their exact pinned source bytes');
 assert.throws(()=>createIdentityManifest(inventory),{code:'AMBIGUOUS_IDENTITY'});
 const manifest=createIdentityManifest(inventory,{headerIds:selected}),manifestFile=path.join(work,'new-bark-identities.json');await fs.writeFile(manifestFile,canonical(manifest)+'\n',{flag:'wx'});
 const again=createIdentityManifest(inventory,{previous:JSON.parse(await fs.readFile(manifestFile))});assert.deepEqual(again,manifest);assert.equal(previewIdentityUpdate(manifest,inventory).state,'same-source');checks.push('New Bark has map-scoped portable identities; repeating the same source preserves every ID, project and digest');
 const native=[],mappingSession=createNativeMappingSession(inventory,manifest);for(const entry of manifest.entries){const mapping=mappingSession.mapping(entry.key,{workspaceId:'rom-workspace:ri02a-proof',operationId:'op:source-'+native.length,createdAt:'2026-10-19T00:00:00.000Z'});assert.equal(sha256(await resolveLocator(rom,mapping.locators[0],expected)),entry.evidenceSHA256);native.push(mapping);resolved++;}
 await fs.writeFile(path.join(work,'new-bark-native-mappings.json'),canonical(native)+'\n',{flag:'wx'});checks.push('Every selected source unit produces an existing NPCDexROMMapping/1 artifact with exact ROM/resource/row evidence; no content/RDX or testing claim is created');
 const bad=structuredClone(maps[0].locator);bad.selectors.mapHeaderId=61;await assert.rejects(()=>resolveLocator(rom,bad,expected),{code:'INTEGRITY'});
 const event=structuredClone(maps[0].events.overworlds[0].locator);event.selectors.eventIndex=1;await assert.rejects(()=>resolveLocator(rom,event,expected),{code:'INTEGRITY'});checks.push('Byte-preserving but mislabeled map/event selectors are rejected against the actual map header and event layout');
 const out=path.join(work,'identities-second-process.json'),reopen=spawnSync(process.execPath,[path.resolve('outputs/ROMDex/rom/cli.mjs'),'identities',capturedFile,out,'--previous='+manifestFile],{encoding:'utf8',windowsHide:true});
 assert.equal(reopen.status,0,reopen.stderr);assert.deepEqual(JSON.parse(await fs.readFile(out)),manifest);checks.push('A separate Node process reopens the portable inventory/identity JSON and preserves exact source identities');
 assert.equal(inventory.spriteTable.ownerOverlay,131);assert.equal(inventory.spriteTable.rows.length,1656);await assert.rejects(()=>rom.resolveAddress(inventory.spriteTable.pointer),{code:'AMBIGUOUS_ADDRESS'});checks.push('Relocated sprite metadata uses verified overlay 131; an ownerless lookup remains ambiguous');
 assert.equal(await rom.hashRange(0,rom.size),expected);assert.equal(requests,0);checks.push('Complete before/after ROM hashes match and the proof makes zero network requests');
 const counts=Object.fromEntries(['overworlds','backgrounds','warps','triggers'].map(k=>[k,inventory.maps.reduce((n,m)=>n+m.events[k].length,0)])),warnings={};for(const w of inventory.warnings)warnings[w.code]=(warnings[w.code]||0)+1;
 const proof={task:'RI02A',status:'passed',inputMode:'ROM alone; no editable project/prepared map content',sourceSHA256:expected,inventoryDigest:inventory.digest,mapHeaders:540,counts,warnings,newBark:{headers:selected,overworlds:24,identityEntries:manifest.entries.length},locatorsIndependentlyResolved:resolved,checks,externalRequests:requests,elapsedMilliseconds:Date.now()-started,sourceUnchanged:true,productionChanged:false,rdxCompiled:false,cloudPublished:false};
 await fs.writeFile(path.join(work,'real-rom-proof.json'),JSON.stringify(proof,null,2));console.log(JSON.stringify(proof));
}finally{await rom.close();}
