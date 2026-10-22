import {viewHeads} from './view-contract.mjs';
import {croppedLocationImage} from './location-previews.mjs';
import {requireThat,sha,canonical} from './contracts.mjs';
const cache=new Map();let cachedBytes=0;
// Read only the selected, hash-verified image, rather than loading every map asset for the sidebar.
export function sidebarThumbnail(document,map,readBlob){
 const view=viewHeads(document.content.views||[]).find(v=>v.recordId===map.recordId),field=view?.payload.fields?.image,manual=field?.format==='NPCDexViewImage/1'?field:field?.dataUrl?.format==='NPCDexViewImage/1'?field.dataUrl:null,preview=view?.payload.locationPreviews,candidate=preview?.candidates.find(c=>c.id===preview.selectedCandidateId),assetId=manual?.assetId||map.current.payload.imageAssetId||candidate?.image.assetId;if(!assetId)return null;
 const a=document.assetInventory.find(a=>a.assetId===assetId);requireThat(a?.mime?.startsWith('image/'),'Sidebar Image Asset Is Missing.');const crop=!manual&&candidate?.image.assetId===assetId?candidate.crop:null,key=a.sha256+canonical(crop);if(cache.has(key))return cache.get(key);const bytes=readBlob(a.sha256);requireThat(bytes&&bytes.length===a.bytes&&sha(bytes)===a.sha256,'Sidebar Image Failed Verification.');const rendered=crop?croppedLocationImage(bytes,crop):bytes,result='data:'+a.mime+';base64,'+rendered.toString('base64');if(result.length<=1024*1024){while(cache.size&&(cache.size>=32||cachedBytes+result.length>8*1024*1024)){const oldest=cache.keys().next().value;cachedBytes-=cache.get(oldest).length;cache.delete(oldest);}cache.set(key,result);cachedBytes+=result.length;}return result;
}
