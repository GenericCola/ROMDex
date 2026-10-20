import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {parseJSON,canonical} from '../content/contracts.mjs';
import {RomReader,requireRom} from './reader.mjs';
import {identifyRom,inventoryHGSS} from './hgss.mjs';
import {createIdentityManifest,previewIdentityUpdate} from './identities.mjs';

async function readJSON(file){const stat=await fs.stat(file);requireRom(stat.isFile()&&stat.size<=16*1024*1024,'LIMIT','Source inventory JSON exceeds its bound.');return parseJSON(await fs.readFile(file));}
export async function run(args,{stdout=console.log,stderr=console.error}={}){
 let rom;
 try{
  const [command,input,output,extra]=args;let value;
  if(command==='inspect'||command==='inventory'){
   requireRom(args.length===3,'USAGE','Usage: node rom/cli.mjs inspect|inventory INPUT.nds OUTPUT.json');rom=await RomReader.open(input);value=command==='inspect'?await identifyRom(rom):await inventoryHGSS(rom);await rom.assertUnchanged();
  }else if(command==='identities'){
   const flags=args.slice(3),allowed=flags.every(f=>/^--headers=[0-9]+(?:,[0-9]+)*$/.test(f)||f.startsWith('--previous=')&&f.length>11);requireRom(args.length>=3&&args.length<=5&&allowed&&new Set(flags.map(f=>f.split('=')[0])).size===flags.length,'USAGE','Usage: node rom/cli.mjs identities INVENTORY.json OUTPUT.json [--headers=60,61,...] [--previous=MANIFEST.json]');
   const headers=flags.find(f=>f.startsWith('--headers=')),previous=flags.find(f=>f.startsWith('--previous='));
   value=createIdentityManifest(await readJSON(input),{previous:previous?await readJSON(previous.slice(11)):null,headerIds:headers?headers.slice(10).split(',').map(Number):null});
  }else if(command==='identity-preview'){
   requireRom(args.length===4,'USAGE','Usage: node rom/cli.mjs identity-preview INVENTORY.json OUTPUT.json PREVIOUS.json');value=previewIdentityUpdate(await readJSON(extra),await readJSON(input));
  }else throw Object.assign(Error('Commands: inspect, inventory, identities, identity-preview. Outputs must be new files.'),{code:'USAGE'});
  await fs.writeFile(output,canonical(value)+'\n',{flag:'wx'});stdout(JSON.stringify({status:'saved',format:value.format||null,support:value.support||null,command}));return 0;
 }catch(error){stderr(JSON.stringify({status:'error',code:error.code||'IO',message:error.message}));return 1;}
 finally{await rom?.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)process.exitCode=await run(process.argv.slice(2));
