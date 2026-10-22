import fs from 'node:fs/promises';
import {readRdxFile,packRdx} from '../../outputs/ROMDex/rdx/container.mjs';
import {preparePresentation} from '../../outputs/ROMDex/rom/presentation.mjs';
import {mapDomain} from '../../outputs/ROMDex/rdx/map-import.mjs';
import {projectNPCDex} from '../../outputs/ROMDex/content/projection.mjs';
for(const key of ['new-bark-town','route-29']){const v=preparePresentation(await readRdxFile(new URL(key+'.rdx',import.meta.url)));await fs.writeFile(new URL(key+'.rdx',import.meta.url),await packRdx(v.documentBytes,v.blobs));await fs.writeFile(new URL(key+'.snapshot.json',import.meta.url),JSON.stringify(projectNPCDex(mapDomain(v),{assetBytes:h=>v.blobs.get(h)})));}
console.log('Both isolated real-ROM maps passed the existing naming/front-frame preparation path.');
