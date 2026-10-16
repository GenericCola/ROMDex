import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {isFileDrag,droppedFiles} from '../public/file-drop.mjs';
import {validateTicket,validateNativeSelection,chosenFiles} from '../desktop/native-attachments.mjs';
import {MAX_FILE_BYTES} from '../public/attachment-core.mjs';
const transfer=(files,items=files.map(()=>({kind:'file'})))=>({types:['Files'],files,items});
test('external file recognition rejects text, folders, mixed drops and empty batches',()=>{
 const file=new File(['sprite'],'sprite.png');assert(isFileDrag(transfer([file])));assert(!isFileDrag({types:['text/uri-list']}));assert.equal(droppedFiles(transfer([file]))[0],file);
 assert.throws(()=>droppedFiles(transfer([])));assert.throws(()=>droppedFiles(transfer([file],[{kind:'file',webkitGetAsEntry:()=>({isDirectory:true})}])));assert.throws(()=>droppedFiles(transfer([file],[{kind:'file'},{kind:'string'}])));
});
test('file drops enforce the existing count, filename and byte limits before calling native attachment code',()=>{
 const file={name:'sprite.png',size:1};assert.equal(droppedFiles(transfer(Array(10).fill(file))).length,10);assert.throws(()=>droppedFiles(transfer(Array(11).fill(file))));assert.throws(()=>droppedFiles(transfer([{name:'../sprite.png',size:1}])));assert.throws(()=>droppedFiles(transfer([{name:'large.bin',size:MAX_FILE_BYTES+1}])));
});
test('native dropped metadata accepts only an actual path, valid ticket and matching file name',()=>{
 const entry={path:path.resolve('sprite.png'),name:'sprite.png',size:1,lastModified:1};assert.doesNotThrow(()=>validateNativeSelection([entry],{dropped:true}));assert.throws(()=>validateNativeSelection([entry.path],{dropped:true}));assert.throws(()=>validateNativeSelection([{...entry,path:'file:///C:/sprite.png'}],{dropped:true}));assert.throws(()=>validateNativeSelection([{...entry,name:'different.png'}],{dropped:true}));assert.throws(()=>validateNativeSelection([{...entry,lastModified:NaN}],{dropped:true}));assert.throws(()=>validateTicket('PMON-1/../../data'));assert.equal(validateTicket('local-123-abc'),'local-123-abc');
});
test('native file preflight preserves original bytes, detects changed files and rejects directory/oversized batches',async()=>{
 const dir=await fs.mkdtemp(path.join(process.env.ROMDEX_TEST_SCRATCH||os.tmpdir(),'romdex-drop-')),file=path.join(dir,'sprite.png');await fs.writeFile(file,Buffer.from([0,1,2,255]));const stat=await fs.stat(file),entry={path:file,name:'sprite.png',size:stat.size,lastModified:Math.floor(stat.mtimeMs)};
 const result=await chosenFiles([entry],{dropped:true});assert.equal(result[0].type,'image/png');assert.deepEqual(Buffer.from(await result[0].arrayBuffer()),Buffer.from([0,1,2,255]));
 await assert.rejects(()=>chosenFiles([{...entry,size:99}],{dropped:true}),/Changed/);await assert.rejects(()=>chosenFiles([{...entry,lastModified:stat.mtimeMs-5000}],{dropped:true}),/Changed/);
 await assert.rejects(()=>chosenFiles([file,dir]),/Regular Files/);const large=path.join(dir,'large.bin'),handle=await fs.open(large,'w');await handle.truncate(MAX_FILE_BYTES+1);await handle.close();await assert.rejects(()=>chosenFiles([file,large]),/Smaller/);await fs.unlink(large);await assert.rejects(()=>chosenFiles([large]),/No Longer Available/);
});
test('sandbox preload resolves disk-backed File capabilities without exposing native paths or accepting path strings',async()=>{
 let bridge;const sent=[],backed=new Map(),file={name:'sprite.png',size:3,lastModified:10};backed.set(file,path.resolve('sprite.png'));
 const electron={contextBridge:{exposeInMainWorld(_name,value){bridge=value;}},ipcRenderer:{invoke:async(...args)=>{sent.push(args);return [{uploadId:'chosen'}];},on(){},removeListener(){}},webUtils:{getPathForFile:value=>{if(typeof value==='string')throw Error('Expected File');return backed.get(value)||'';}}};
 vm.runInNewContext(await fs.readFile(new URL('../desktop/preload.cjs',import.meta.url),'utf8'),{require:()=>electron,process:{isMainFrame:true},Object,Array,Promise,Error});
 const result=await bridge.dropAttachments('PMON-1',[file]);assert.equal(result[0].uploadId,'chosen');assert.equal(sent[0][0],'romdex:drop-files');assert.equal(sent[0][2][0].path,path.resolve('sprite.png'));assert.throws(()=>bridge.dropAttachments('PMON-1',[{name:'fake.png',size:1}]),/Directly/);assert.throws(()=>bridge.dropAttachments('PMON-1',[path.resolve('sprite.png')]),/Expected File/);assert.equal(sent.length,1);await assert.rejects(()=>bridge.dropAttachments('PMON-1',Array(11).fill(file)),/1–10/);
 let subframeBridge=false;vm.runInNewContext(await fs.readFile(new URL('../desktop/preload.cjs',import.meta.url),'utf8'),{require:()=>({...electron,contextBridge:{exposeInMainWorld(){subframeBridge=true;}}}),process:{isMainFrame:false}});assert.equal(subframeBridge,false);
});
