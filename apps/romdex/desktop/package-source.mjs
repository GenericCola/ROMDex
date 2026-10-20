import fs from 'node:fs/promises';
import path from 'node:path';
// Source-only payload; neither installed Data nor a developer's test directories
// are packaging inputs. ROM readers/workers and their pinned tables ship together.
export const APPLICATION_SOURCE_DIRECTORIES=Object.freeze(['cloud','content','desktop','examples','public','rdx','rom','shared-ui']);
export async function copyApplicationSource(source,destination){
 source=path.resolve(source);destination=path.resolve(destination);
 if(destination===source||destination.startsWith(source+path.sep))throw Error('Package Outside the Source Application Folder.');
 await fs.mkdir(destination,{recursive:false});
 const filter=async file=>{const rel=path.relative(source,file);if(/(^|[\\/])(Data|Runtime|session|queued-files|private-profile|node_modules)([\\/]|$)|\.(nds|encrypted|sqlite|pem|key)$/i.test(rel))return false;const stat=await fs.lstat(file);if(stat.isSymbolicLink())throw Error('Application Source Cannot Contain Symbolic Links.');return true;};
 for(const dir of APPLICATION_SOURCE_DIRECTORIES)await fs.cp(path.join(source,dir),path.join(destination,dir),{recursive:true,filter});
 for(const item of await fs.readdir(source,{withFileTypes:true}))if(item.isFile()&&(/\.(mjs|cjs|md)$/.test(item.name)||item.name==='package.json'))await fs.copyFile(path.join(source,item.name),path.join(destination,item.name));
 return {destination,directories:[...APPLICATION_SOURCE_DIRECTORIES]};
}
