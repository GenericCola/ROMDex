import {canonical,seal,sha} from '../content/contracts.mjs';
import {mapDomain,retainDocument} from '../rdx/map-import.mjs';
import {documentRevision,validateDocument} from '../rdx/document.mjs';
import {areaDisplayName} from '../public/area-presentation.mjs';
import {extractionFromDocument,stagePresentation,regionDisplayName} from './source-context.mjs';

// Presentation rules only: never change source text, locators, event IDs or identity.
const VERSION='ROMDexSourcePresentation/1';
const roles={gsrivel:'Rival',gswoman1:'Woman',gswoman3:'Woman',gsboy2:'Boy',gsmiddleman1:'Man',gsbigman:'Man',gsmama:'Mother',doctor:'Researcher',policeman:'Police Officer',assistantm:'Lab Assistant',storophy:'Silver Trophy',gtorophy:'Gold Trophy',btorophy:'Bronze Trophy'};
const plain=text=>String(text).replace(/\[[^\]]*\]/g,'…').replace(/[\r\n\s]+/g,' ').trim();
function dialogues(r){return (r.current.payload.pointOrder||[]).flatMap(id=>{const p=r.current.payload.points[id];return p.blockOrder.map(b=>p.blocks[b]).filter(b=>b.kind==='dialogue'&&!b.archived);});}
function cue(r){const text=plain(dialogues(r)[0]?.text||'');return text?text.length>62?text.slice(0,59).trimEnd()+'…':text:null;}
export function entityPresentation(r,profile){
 const source=r.legacyData?.romExtraction,frames=profile?.legacyData?.romExtraction?.frameBindings||[],prefix=frames[0]?.textureName?.replace(/\.\d+$/,'').toLowerCase(),sample=dialogues(r).slice(0,3).map(b=>plain(b.text));
 if(r.kind==='appearance'){
  // Explicit labels at the start of the attached dialogue are stronger than a
  // sprite role. Shared graphics alone never establish a named character.
  const labels=[...new Set(sample.map(t=>t.match(/^([\p{L}][\p{L}\p{N} .’'\-]{0,39}):(?:\s|$)/u)?.[1]).filter(Boolean).map(n=>n===n.toUpperCase()?n.toLowerCase().replace(/\b\p{L}/gu,c=>c.toUpperCase()):n))];
  if(labels.length)return {name:['Lyra','Ethan'].includes(labels[0])&&labels.includes('Lyra')&&labels.includes('Ethan')?'Lyra / Ethan':labels[0],basis:'Explicit source-dialogue speaker label'};
  if(sample.some(t=>/\bI am Cameron the Photographer\b/i.test(t)))return {name:'Cameron — Photographer',basis:'Self-introduction in attached source dialogue'};
  const role=roles[prefix]||'Unidentified Character',text=cue(r);
  return {name:role+(text&&!['Rival','Mother','Police Officer','Lab Assistant'].includes(role)?' — “'+text+'”':''),basis:roles[prefix]?'Source sprite role; identity unverified':'No verified name; source dialogue cue where available'};
 }
 if(r.kind==='scene')return {name:'Scene Events & Script References',basis:'Scene/load hooks and unbound script references; not asserted spoken dialogue'};
 if(r.kind==='interactive'&&source?.eventKind){const type=source.event?.type,role=source.eventKind==='triggers'?'Step-triggered Event':type===1?'Sign':type===2?'Hidden Item':'Interaction',text=cue(r);return {name:role+(text?' — “'+text+'”':''),basis:'Source event type and attached dialogue cue'};}
 return null;
}
function suffix(frame){return Number(frame.textureName?.match(/\.(\d+)$/)?.[1]);}
function family(frames){const names=[...new Set(frames.map(suffix))].sort((a,b)=>a-b);if(names.length===16&&names.every((n,i)=>n===i+1))return 'ordinary';if(names.join(',')==='1,10,11,12,13,14,15,16'&&frames.every(f=>/^tsure_poke\./i.test(f.textureName)))return 'follower';return null;}
export function frontFrame(frames){const kind=family(frames);if(!kind)return null;return frames.find(f=>suffix(f)===(kind==='ordinary'?5:11)&&f.paletteBinding==='sole-palette')||null;}
export function frameLabel(frame,frames){const n=suffix(frame),kind=family(frames),facing=kind==='ordinary'?(n<=4?'Back':n<=8?'Front':n<=12?'Side':'Other Side'):kind==='follower'?(n===1||n===10?'Back':n<=12?'Front':n<=14?'Side':'Other Side'):null;return (facing?facing+' · ':'')+(frame.textureName||'Source frame '+(frame.textureIndex??'?'))+' · '+(frame.paletteName||'Source palette')+(frame.paletteBinding==='runtime-candidate'?' (palette needs review)':'');}

export function preparePresentation(value){
 const records=mapDomain(value).records,map=records.find(r=>r.kind==='map'),byId=new Map(records.map(r=>[r.recordId,r])),proposals=new Map();
 const raw=r=>/^\S+ · (?:Object \d+|Background \d+|Trigger \d+|Scene Hooks and Unbound Scripts)$/.test(r.current.payload.name);
 for(const r of records){if(r.kind==='subzone'&&r.legacyData?.romExtraction){const header=r.legacyData.romExtraction.headerId;const name=areaDisplayName({headerId:header,internalName:r.current.payload.name},map.current.payload.name,map.current.payload.subzoneIds.indexOf(r.recordId));if(!name.endsWith('Name Needs Review')&&name!==r.current.payload.name)proposals.set(r.recordId,{name,basis:'Reviewed HGSS area-code reference; original code retained'});}
  else if(raw(r)&&r.kind!=='profile'){const p=entityPresentation(r,byId.get(r.current.payload.profileId));if(p)proposals.set(r.recordId,p);}
 }
 // Repeated placements remain distinct; don't merge characters because they share a sprite.
 const duplicates=new Map();for(const [id,p]of proposals){const r=byId.get(id),key=r.parentRecordId+'|'+p.name;if(!duplicates.has(key))duplicates.set(key,[]);duplicates.get(key).push(id);}for(const ids of duplicates.values())if(ids.length>1)ids.forEach((id,i)=>proposals.get(id).name+=' · Placement '+(i+1));
 for(const r of records.filter(r=>r.kind==='appearance')){const profile=byId.get(r.current.payload.profileId),p=proposals.get(r.recordId);if(p&&profile&&raw(profile))proposals.set(profile.recordId,p);}
 const changes=[];let extraction;for(const r of records){const p=proposals.get(r.recordId),next=structuredClone(r),frames=r.legacyData?.romExtraction?.frameBindings||[],front=frontFrame(frames);let changed=false;
  if(r.kind==='region'&&/^ROM Region [01]$/.test(r.current.payload.name)){next.current.payload.name=regionDisplayName(Number(r.current.payload.name.at(-1)));next.legacyData.romPresentation={...next.legacyData.romPresentation,format:VERSION,originalName:r.current.payload.name,namingBasis:'HGSS MapRegion enum'};changed=true;}
  if(r.kind==='shared'&&r.current.payload.sharedType==='progression'&&r.current.payload.definitions.stages.some(s=>/^Scene variable 0x/.test(s.name))){extraction??=extractionFromDocument(value);if(extraction){next.current.payload.definitions.stages=next.current.payload.definitions.stages.map(s=>/^Scene variable 0x/.test(s.name)?stagePresentation(extraction,s):s);next.legacyData.romPresentation={...next.legacyData.romPresentation,format:VERSION,stageLabelsCorrected:true,namingBasis:'Source-linked scene dialogue and actions; chronology remains unverified'};changed=true;}}
  if(p){next.current.payload.name=p.name;next.legacyData.romPresentation={format:VERSION,originalName:r.current.payload.name,namingBasis:p.basis};changed=true;}
  if(r.kind==='profile'&&front&&r.current.payload.baseImageId==='content:asset-'+frames[0]?.sha256&&!r.legacyData?.romPresentation?.thumbnailCorrected){next.current.payload.baseImageId='content:asset-'+front.sha256;next.legacyData.romPresentation={...next.legacyData.romPresentation,format:VERSION,thumbnailCorrected:true,thumbnailBasis:'Front-standing texture in the reviewed HGSS frame layout'};changed=true;}
  if(changed){next.parents=[r.revisionId];next.actorClaim='romdex:source-presentation';next.operationId='content:presentation-'+sha(canonical({parent:r.revisionId,current:next.current,legacy:next.legacyData.romPresentation})).slice(0,40);changes.push(seal(next));}
 }
 if(!changes.length)return value;
 const document=structuredClone(value.document),blobs=new Map(value.blobs);retainDocument(document,blobs,value);document.content.records.push(...changes);const heads=new Map(changes.map(r=>[r.recordId,r.revisionId]));document.content.recordHeads=document.content.recordHeads.map(h=>({recordId:h.recordId,revisionId:heads.get(h.recordId)||h.revisionId}));document.parents=[value.document.revision];document.revision=documentRevision(document);const documentBytes=Buffer.from(canonical(document));validateDocument(documentBytes,{blobs});return {...value,document,documentBytes,blobs};
}
