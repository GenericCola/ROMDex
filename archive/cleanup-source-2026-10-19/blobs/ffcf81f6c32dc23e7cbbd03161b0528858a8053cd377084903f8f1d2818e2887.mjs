import {diffDocument,applyPatches,documentHash} from './npcdex-change.mjs';
import {validateDomain} from './npcdex-domain.mjs';
import {ancestors,isAncestor,commonBase,topological,recordBase} from './npcdex-graph.mjs';
import {sha256} from './github-store.mjs';
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),check=(ok,message)=>{if(!ok)throw Error(message);};
const metadata=new Set(['preferences','revision','savedAt']),ordinary=new Set(['towns','stages','annotations']);
export const pointer=path=>'/'+path.map(x=>String(x).replaceAll('~','~0').replaceAll('/','~1')).join('/');
function stateAt(document,path){let current=document;for(const key of path){if(!current||typeof current!=='object'||!Object.hasOwn(current,key))return {exists:false};current=current[key];}return {exists:true,value:current};}
function overlaps(a,b){return a.slice(0,Math.min(a.length,b.length)).every((part,i)=>part===b[i]);}
function identityPaths(document){const result=new Map();function walk(value,path=[]){if(!value||typeof value!=='object')return;if(!Array.isArray(value)&&typeof value.id==='string'){const key=value.id;if(!result.has(key))result.set(key,[]);result.get(key).push(path);}for(const [key,child]of Object.entries(value))if(child&&typeof child==='object')walk(child,[...path,Array.isArray(value)?Number(key):key]);}walk(document.towns,['towns']);return result;}
// Read/write footprints come from validated before/after documents, never a client declaration.
export function deriveOperation(before,after,record){
 const patches=diffDocument(before,after).filter(p=>!metadata.has(p.path[0])),writes=[],reads=[],normal=[],receipts=new Set();let historyAppend=[];
 const oldHistory=before.history||[],newHistory=after.history||[];
 const appendOnly=Array.isArray(newHistory)&&newHistory.length>=oldHistory.length&&oldHistory.every((h,i)=>equal(h,newHistory[i]));
 if(appendOnly){historyAppend=newHistory.slice(oldHistory.length);for(const h of historyAppend){writes.push(['history','@id',h.id]);if(h.receiptId)receipts.add(h.receiptId);}}
 const identities=identityPaths(before);
 for(const patch of patches){
  if(patch.path[0]==='history'&&appendOnly)continue;
  const path=patch.path;normal.push({patch,before:stateAt(before,path)});
  writes.push(path[0]==='annotations'&&path.length>1?path.slice(0,2):path);
  if(!ordinary.has(path[0])&&path[0]!=='history'||!path.length||path.includes('id')||record.kind==='resolution'||record.kind==='recovery')reads.push([]);
  let cursor=before;
  for(let i=0;i<path.length;i++){if(Array.isArray(cursor))reads.push([...path.slice(0,i),'@layout']);if(cursor&&!Array.isArray(cursor)&&typeof cursor==='object'&&Object.hasOwn(cursor,'id'))reads.push([...path.slice(0,i),'id']);cursor=cursor&&typeof cursor==='object'?cursor[path[i]]:undefined;}
  if(path[0]==='annotations'&&path.length>1){const annotation=after.annotations?.[path[1]]||before.annotations?.[path[1]],context=annotation?.context||{},target=context.target||{};for(const id of [context.pointId,target.pointId,target.id])if(typeof id==='string')for(const found of identities.get(id)||[])reads.push(found);}
 }
 if(record.kind==='resolution'||record.kind==='recovery')reads.push([]);
 for(const receipt of [...before.implementationReceipts||[],...after.implementationReceipts||[]])if(!equal((before.implementationReceipts||[]).find(x=>x.receiptId===receipt.receiptId),(after.implementationReceipts||[]).find(x=>x.receiptId===receipt.receiptId)))receipts.add(receipt.receiptId);
 if(receipts.size)reads.push([]); // A receipt, its validation reads and its effects stay indivisible.
 return {id:record.id,writes,reads,normal,historyAppend,receipts:[...receipts],revision:after.revision,createdAt:record.createdAt};
}
export async function planMerge({heads,records,genesis,document}){
 heads=[...heads].sort();check(heads.length>1&&heads.length<=64,'NPCDex Review Requires Between Two and 64 Versions.');const base=commonBase(heads,records,genesis),baseAncestors=ancestors(base,records,genesis),all=new Set();for(const head of heads)for(const id of ancestors(head,records,genesis))if(!baseAncestors.has(id))all.add(id);
 const order=topological(all,records,genesis).filter(id=>all.has(id)),operations=[],conflicts=[];check(order.length<=256,'Too Many Concurrent NPCDex Operations for Automatic Merging.');let size=0;
 for(const id of order){const entry=records.get(id);if(entry.record.kind==='merge')continue;const before=await document(recordBase(entry.record)),after=await document(id);validateDomain(before);validateDomain(after);const operation=deriveOperation(before,after,{...entry.record,id});size+=JSON.stringify(operation.normal).length;check(size<32*1024*1024,'Concurrent NPCDex Changes Need Manual Review.');operations.push(operation);}
 for(let i=0;i<operations.length;i++)for(let j=i+1;j<operations.length;j++){const a=operations[i],b=operations[j];if(isAncestor(a.id,b.id,records,genesis)||isAncestor(b.id,a.id,records,genesis))continue;for(const write of a.writes)for(const other of [...b.writes,...b.reads])if(overlaps(write,other)){conflicts.push({left:a.id,right:b.id,path:pointer(write),reason:'Concurrent Writes or Validation Reads Overlap'});break;}for(const write of b.writes)for(const read of a.reads)if(overlaps(write,read)){conflicts.push({left:a.id,right:b.id,path:pointer(write),reason:'A Concurrent Validation Read Changed'});break;}}
 const receiptIds=[...new Set(operations.flatMap(x=>x.receipts))].sort();
 if(conflicts.length)return {base,heads,conflicts:conflicts.slice(0,100),receiptIds};
 let result=structuredClone(await document(base));
 for(const operation of operations){for(const {patch,before}of operation.normal){check(equal(stateAt(result,patch.path),before),'A NPCDex Merge Before-Value Changed.');result=applyPatches(result,[patch]);}if(operation.historyAppend.length){result.history??=[];const ids=new Set(result.history.map(h=>h.id));for(const h of operation.historyAppend){check(!ids.has(h.id),'Concurrent History Entries Reuse an Identity.');ids.add(h.id);result.history.push(structuredClone(h));}}}
 result.revision=Math.max(result.revision,...operations.map(x=>x.revision))+1;result.savedAt=operations.map(x=>x.createdAt).sort().at(-1)||result.savedAt;validateDomain(result);return {base,heads,conflicts:[],receiptIds,result};
}
export function mergeIdentity(heads,result){const seed=sha256(Buffer.from(JSON.stringify({heads:[...heads].sort(),after:documentHash(result)}))),id=seed.slice(0,8)+'-'+seed.slice(8,12)+'-4'+seed.slice(13,16)+'-8'+seed.slice(17,20)+'-'+seed.slice(20,32);return {device:'00000000-0000-4000-8000-000000000000',operation:id};}
function imageRefs(value,path,side){const found=[];function walk(v,p){if(found.length>=2)return;if(typeof v==='string'&&/^data:image\/(png|jpeg|webp|gif);base64,/.test(v)){found.push({side,path:p});return;}if(v&&typeof v==='object')for(const [k,child]of Object.entries(v)){walk(child,[...p,Array.isArray(v)?Number(k):k]);if(found.length>=2)break;}}walk(value,path);return found;}
export function previewChanges(before,after){const patches=diffDocument(before,after).filter(p=>!metadata.has(p.path[0]));const summarize=value=>JSON.stringify(value,(key,item)=>key==='dataUrl'?'[Embedded Image: '+String(item).length+' Characters, '+sha256(Buffer.from(String(item))).slice(0,12)+']':item)?.slice(0,1400)||'(Not Present)';function label(path){if(path[0]==='annotations')return (after.annotations?.[path[1]]?.context?.label||before.annotations?.[path[1]]?.context?.label||'Flag, Note or Tester Status')+' · '+(path.at(-1)==='note'?'Note':path.at(-1)==='flag'?'Flag':'Change');let name='';for(let i=1;i<=path.length;i++){const value=stateAt(after,path.slice(0,i)).value;if(value?.name)name=value.name;}return name||String(path[0]||'Whole Workspace').replace(/([a-z])([A-Z])/g,'$1 $2');}return {count:patches.length,changes:patches.slice(0,30).map(p=>({path:pointer(p.path),label:label(p.path),images:[...imageRefs(stateAt(before,p.path).value,p.path,'before'),...imageRefs(stateAt(after,p.path).value,p.path,'after')],before:summarize(stateAt(before,p.path).value),after:summarize(p.op==='delete'?undefined:p.op==='splice'?stateAt(after,p.path).value:p.value)}))};}
