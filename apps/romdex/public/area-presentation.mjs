import {HGSS_AREA_NAMES} from './hgss-area-names.mjs';
const names=new Map(HGSS_AREA_NAMES.map(row=>[row[1],row]));
function words(value){return value.split('_').map(word=>({ELMS:"Elm's",POKECENTER:'Pokémon Center',POKEMART:'Poké Mart',POKEMON:'Pokémon',NPC:'NPC',SS:'S.S.'}[word]||(/^(?:B?\d+F|[IVX]+)$/.test(word)?word:word[0]+word.slice(1).toLowerCase()))).join(' ');}
export function areaDisplayName(area,mapName,ordinal=0){
 const code=area.internalName??area.name,entry=names.get(code);
 // An edited/replaced catalog entry must not inherit a name merely by numeric ID.
 if(!entry||entry[0]!==area.headerId)return 'Sub-area '+(ordinal+1)+' — Name Needs Review';
 const root=code.match(/^([TRW]\d+)(?:[^\d]|$)/)?.[1],rootName=names.get(root)?.[2];
 if(code===root)return (mapName||words(entry[2]))+' — Outdoors';
 let label=rootName&&entry[2].startsWith(rootName+'_')?entry[2].slice(rootName.length+1):entry[2];
 if(root==='T20')label=label.replace(/^RIVAL_HOUSE/,'NEIGHBOR_HOUSE');
 label=label.replace(/^PLAYER_HOUSE/,'PLAYER\u2019S_HOUSE').replace(/^NEIGHBOR_HOUSE/,'NEIGHBOR\u2019S_HOUSE');
 const floor=label.match(/_(B?\d+F)$/);if(floor)label=label.slice(0,-floor[0].length);
 return words(label)+(floor?' — '+floor[1]:'');
}
export function mapRdxFilename(name){
 let stem=String(name||'Map').replace(/[\x00-\x1f<>:"/\\|?*]/g,' ').replace(/\s+/g,' ').trim().replace(/[. ]+$/g,'').slice(0,150).replace(/[. ]+$/g,'');
 if(!stem)stem='Map';if(/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(stem))stem='Map-'+stem;
 return stem+'.rdx';
}

// Group only a catalog-confirmed HGSS interior code. Numeric IDs alone are not evidence.
export function areaBuilding(area,mapName){
 const code=area.internalName??area.name,entry=names.get(code);if(!entry||entry[0]!==area.headerId)return null;
 const match=code.match(/^([TRW]\d+R\d{2})\d{2}$/);if(!match)return null;
 const label=areaDisplayName(area,mapName),floor=label.match(/ — (B?\d+F)$/);
 return {key:match[1],name:floor?label.slice(0,-floor[0].length):label,floor:floor?.[1]||null};
}
