import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {parseJSON,canonical} from '../content/contracts.mjs';
import {RomReader,requireRom} from './reader.mjs';
import {identifyRom,inventoryHGSS} from './hgss.mjs';
import {createIdentityManifest,previewIdentityUpdate} from './identities.mjs';
import {extractHGSS,validateExtraction} from './extract.mjs';
import {compileRomMap} from './compile-map.mjs';

export async function writeExtraction(output,{extraction,assets}){
 validateExtraction(extraction);await fs.mkdir(output);
 try{
  await fs.mkdir(path.join(output,'assets'));
  for(const [name,bytes]of assets){requireRom(/^assets\/[a-f0-9]{64}\.png$/.test(name),'INVALID','Invalid extraction asset path.');await fs.writeFile(path.join(output,name),bytes,{flag:'wx'});}
  await fs.writeFile(path.join(output,'VioletCity.extraction.json'),canonical(extraction)+'\n',{flag:'wx'});
 }catch(error){error.message+=' Extraction directory is incomplete; retained for inspection. Choose a new output directory when retrying.';throw error;}
}

async function readJSON(file){const stat=await fs.stat(file);requireRom(stat.isFile()&&stat.size<=16*1024*1024,'LIMIT','Source inventory JSON exceeds its bound.');return parseJSON(await fs.readFile(file));}
export async function run(args,{stdout=console.log,stderr=console.error}={}){
 let rom;
 try{
  const [command,input,output,extra]=args;let value;
  if(command==='compile'){
   requireRom(args.length===3||args.length===4&&extra.startsWith('--previous-identities=')&&extra.length>22,'USAGE','Usage: node rom/cli.mjs compile INPUT.nds NEW_OUTPUT_DIRECTORY [--previous-identities=MANIFEST.json]');
   await fs.access(output).then(()=>{throw Object.assign(Error('Compilation output already exists.'),{code:'EEXIST'});},error=>{if(error.code!=='ENOENT')throw error;});
   rom=await RomReader.open(input);const result=await compileRomMap(rom,{previousIdentities:extra?await readJSON(extra.slice(22)):null});
   await fs.mkdir(output);await fs.writeFile(path.join(output,'VioletCityMap.rdx'),result.bytes,{flag:'wx'});await fs.writeFile(path.join(output,'identities.json'),canonical(result.identities)+'\n',{flag:'wx'});await fs.writeFile(path.join(output,'compilation.json'),canonical(result.summary)+'\n',{flag:'wx'});stdout(JSON.stringify({status:'saved',command,...result.summary}));return 0;
  }else if(command==='extract'){
   requireRom(args.length===3||args.length===4&&extra.startsWith('--previous-identities=')&&extra.length>22,'USAGE','Usage: node rom/cli.mjs extract INPUT.nds NEW_OUTPUT_DIRECTORY [--previous-identities=MANIFEST.json]');
   await fs.access(output).then(()=>{throw Object.assign(Error('Extraction output already exists.'),{code:'EEXIST'});},error=>{if(error.code!=='ENOENT')throw error;});
   rom=await RomReader.open(input);const result=await extractHGSS(rom,{previousIdentities:extra?await readJSON(extra.slice(22)):null});await writeExtraction(output,result);stdout(JSON.stringify({status:'saved',format:result.extraction.format,command,coverage:result.extraction.coverage}));return 0;
  }else if(command==='inspect'||command==='inventory'){
   requireRom(args.length===3,'USAGE','Usage: node rom/cli.mjs inspect|inventory INPUT.nds OUTPUT.json');rom=await RomReader.open(input);value=command==='inspect'?await identifyRom(rom):await inventoryHGSS(rom);await rom.assertUnchanged();
  }else if(command==='identities'){
   const flags=args.slice(3),allowed=flags.every(f=>/^--headers=[0-9]+(?:,[0-9]+)*$/.test(f)||f.startsWith('--previous=')&&f.length>11);requireRom(args.length>=3&&args.length<=5&&allowed&&new Set(flags.map(f=>f.split('=')[0])).size===flags.length,'USAGE','Usage: node rom/cli.mjs identities INVENTORY.json OUTPUT.json [--headers=60,61,...] [--previous=MANIFEST.json]');
   const headers=flags.find(f=>f.startsWith('--headers=')),previous=flags.find(f=>f.startsWith('--previous='));
   value=createIdentityManifest(await readJSON(input),{previous:previous?await readJSON(previous.slice(11)):null,headerIds:headers?headers.slice(10).split(',').map(Number):null});
  }else if(command==='identity-preview'){
   requireRom(args.length===4,'USAGE','Usage: node rom/cli.mjs identity-preview INVENTORY.json OUTPUT.json PREVIOUS.json');value=previewIdentityUpdate(await readJSON(extra),await readJSON(input));
  }else throw Object.assign(Error('Commands: inspect, inventory, extract, compile, identities, identity-preview. Outputs must be new files/directories.'),{code:'USAGE'});
  await fs.writeFile(output,canonical(value)+'\n',{flag:'wx'});stdout(JSON.stringify({status:'saved',format:value.format||null,support:value.support||null,command}));return 0;
 }catch(error){stderr(JSON.stringify({status:'error',code:error.code||'IO',message:error.message}));return 1;}
 finally{await rom?.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)process.exitCode=await run(process.argv.slice(2));
