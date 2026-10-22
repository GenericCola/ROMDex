import fs from 'node:fs/promises';
import path from 'node:path';
import {RomReader} from '../../outputs/ROMDex/rom/reader.mjs';
import {extractHGSS,validateExtraction} from '../../outputs/ROMDex/rom/extract.mjs';
const input=process.argv[2],output=process.argv[3],rom=await RomReader.open(input);
try{
 const {extraction,assets}=await extractHGSS(rom);validateExtraction(extraction);
 await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,'VioletCity.extraction.json'),JSON.stringify(extraction));
 for(const [name,bytes]of assets){const file=path.join(output,name);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,bytes);}
 console.log(JSON.stringify({digest:extraction.digest,coverage:extraction.coverage,nativeDependencies:extraction.nativeDependencies.length,warnings:extraction.warnings.slice(0,15)}));
}finally{await rom.close();}
