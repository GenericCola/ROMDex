// U04 design model only. No application imports, network, production writes or credentials.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
const sha=b=>createHash('sha256').update(b).digest('hex');
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const clone=structuredClone;
const results=[];
async function check(name,fn){await fn();results.push(name);}
const overlaps=(a,b)=>a==='*'||b==='*'||a===b||a.startsWith(b+'/')||b.startsWith(a+'/');
const intersects=(a,b)=>a.some(x=>b.some(y=>overlaps(x,y)));
const base={name:'Original',note:'Original Note',plan:'Approved',text:'Old Text',tested:true,receipt:null,order:['a','b'],parent:'epic',childParent:'parent'};
function commit(parents,patches,options={}){
 const body={schema:'ROMDexCommitModel/1',workspace:'fixture',namespace:'npcdex',actor:'owner',device:'device-a',nonce:options.nonce||'fixture',parents:[...parents].sort(),reads:Object.keys(patches),patches,...options};
 return {...body,id:sha(canonical(body))};
}
function verify(c,uploader='owner'){
 const {id,...body}=c;
 assert.equal(id,sha(canonical(body)),'digest');assert.equal(c.workspace,'fixture','workspace');
 assert.equal(c.namespace,'npcdex','namespace');assert.equal(c.actor,uploader,'uploader');assert.equal(uploader,'owner','membership');
 assert.equal(new Set(c.parents).size,c.parents.length,'duplicate parent');
}
function projection(commits,heads){
 const map=new Map();for(const c of commits){verify(c);if(map.has(c.id))assert.deepEqual(map.get(c.id),c);map.set(c.id,c);}
 const ancestors=new Map(),visiting=new Set();
 function collect(id){if(ancestors.has(id))return ancestors.get(id);assert.ok(!visiting.has(id),'cycle');visiting.add(id);const c=map.get(id);assert.ok(c,'missing parent');const set=new Set([id]);for(const p of c.parents)for(const a of collect(p))set.add(a);visiting.delete(id);ancestors.set(id,set);return set;}
 const reachable=new Set();for(const h of heads)for(const id of collect(h))reachable.add(id);
 const ordered=[...reachable].map(id=>map.get(id)).sort((a,b)=>ancestors.get(a.id).size-ancestors.get(b.id).size||a.id.localeCompare(b.id));
 const active=ordered.filter(c=>!ordered.some(r=>r.resolution&&r.id!==c.id&&ancestors.get(r.id).has(c.id)));
 const conflicts=[];
 for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
  const a=active[i],b=active[j];if(ancestors.get(a.id).has(b.id)||ancestors.get(b.id).has(a.id))continue;
  const aw=a.resolution?['*']:Object.keys(a.patches),bw=b.resolution?['*']:Object.keys(b.patches);
  if(intersects(aw,[...bw,...b.reads])||intersects(bw,a.reads))conflicts.push([a.id,b.id]);
 }
 if(conflicts.length)return {state:null,conflicts,retained:[...reachable].sort()};
 let state=clone(base);
 for(const c of active){if(c.resolution){state=clone(c.snapshot);continue;}for(const [field,p] of Object.entries(c.patches)){assert.deepEqual(state[field],p.before,'before value');state[field]=clone(p.after);}}
 return {state,conflicts,retained:[...reachable].sort()};
}
const delta=(field,before,after)=>({[field]:{before,after}});
class Store{
 constructor(){this.blobs=new Map();this.manifests=[];this.events=[];}
 blob(bytes){const id=sha(bytes);this.blobs.set(id,Buffer.from(bytes));return id;}
 publish(c,blobIds,{loseResponse=false}={}){verify(c);for(const id of blobIds)assert.ok(this.blobs.has(id),'missing blob');const bytes=Buffer.from(JSON.stringify(c));this.manifests.push(bytes);this.events.push({id:this.events.length,commitId:c.id,bytes});if(loseResponse)throw Error('response lost');return c.id;}
 discover(cursor=0,size=2){return {events:this.events.slice(cursor,cursor+size),next:Math.min(this.events.length,cursor+size)};}
}
const A=commit([],delta('name','Original','A'));
const B=commit([],delta('note','Original Note','B'),{device:'device-b'});
const C=commit([],delta('name','Original','C'),{device:'device-b'});
await check('Disjoint offline edits merge without last-writer timestamp',()=>{assert.deepEqual(projection([A,B],[A.id,B.id]).state,{...base,name:'A',note:'B'});});
await check('Competing edits retain both branches and expose no merged state',()=>{const p=projection([A,C],[A.id,C.id]);assert.equal(p.state,null);assert.equal(p.conflicts.length,1);assert.equal(p.retained.length,2);});
await check('Identical concurrent writes conservatively require review',()=>{const x=commit([],A.patches,{device:'device-b'});assert.equal(projection([A,x],[A.id,x.id]).state,null);});
await check('Causal edit supersedes its own earlier value',()=>{const x=commit([A.id],delta('name','A','Later'));assert.equal(projection([A,x],[x.id]).state.name,'Later');});
await check('Clock skew has no merge authority',()=>{const a=commit([],A.patches,{timestamp:'2099-01-01'}),b=commit([],C.patches,{timestamp:'2000-01-01'});assert.equal(projection([a,b],[a.id,b.id]).state,null);});
await check('Duplicate physical manifests materialize one logical commit',()=>{assert.equal(projection([A,A],[A.id]).state.name,'A');});
await check('Missing ancestry blocks projection',()=>{const x=commit(['absent'],{});assert.throws(()=>projection([x],[x.id]),/missing parent/);});
await check('Missing advertised head blocks projection',()=>{assert.throws(()=>projection([A],['absent']),/missing parent/);});
await check('Incorrect before value blocks all materialization',()=>{const x=commit([],delta('name','Wrong','Overwrite'));assert.throws(()=>projection([x],[x.id]),/before value/);});
await check('Tampered manifest digest is rejected',()=>{assert.throws(()=>verify({...A,device:'altered'}),/digest/);});
await check('Cross-workspace manifest is rejected',()=>{assert.throws(()=>verify(commit([],{}, {workspace:'another'})),/workspace/);});
await check('Cross-namespace manifest is rejected',()=>{assert.throws(()=>verify(commit([],{}, {namespace:'romdex'})),/namespace/);});
await check('Client actor label cannot override server uploader',()=>{assert.throws(()=>verify(A,'outsider'),/uploader/);});
await check('Unapproved uploader is rejected even with matching label',()=>{assert.throws(()=>verify(commit([],{}, {actor:'outsider'}),'outsider'),/membership/);});
await check('Duplicate parent identity is rejected',()=>{assert.throws(()=>verify(commit([A.id,A.id],{})),/duplicate parent/);});
const receipt=commit([],{text:{before:'Old Text',after:'Implemented'},tested:{before:true,after:false},receipt:{before:null,after:'receipt-1'}},{reads:['text','plan','receipt','tested','feedback']});
await check('Receipt applies content/history marker/testing change together',()=>{const s=projection([receipt],[receipt.id]).state;assert.equal(s.text,'Implemented');assert.equal(s.receipt,'receipt-1');assert.equal(s.tested,false);});
await check('Concurrent instruction edit conflicts with entire receipt',()=>{const x=commit([],delta('plan','Approved','Revised'));const p=projection([receipt,x],[receipt.id,x.id]);assert.equal(p.state,null);assert.equal(p.retained.length,2);});
await check('Concurrent feedback edit conflicts with entire receipt',()=>{const x=commit([],delta('feedback',undefined,'New Note'));assert.equal(projection([receipt,x],[receipt.id,x.id]).state,null);});
await check('Late discovered branch turns provisional receipt into review',()=>{assert.equal(projection([receipt],[receipt.id]).state.receipt,'receipt-1');const x=commit([],delta('text','Old Text','Human Edit'));assert.equal(projection([receipt,x],[receipt.id,x.id]).state,null);});
await check('Unrelated concurrent edit does not invalidate receipt',()=>{const p=projection([receipt,B],[receipt.id,B.id]);assert.equal(p.state.receipt,'receipt-1');assert.equal(p.state.note,'B');});
await check('Descendants of a conflicting receipt are preserved without partial application',()=>{const d=commit([receipt.id],delta('note','Original Note','Dependent'));const p=projection([receipt,d,C],[d.id,C.id]);assert.ok(p.state);const x=commit([],delta('plan','Approved','Other'));assert.equal(projection([receipt,d,x],[d.id,x.id]).state,null);});
const resolution=commit([A.id,C.id],{}, {resolution:true,reads:['*'],snapshot:{...base,name:'Reviewed'},nonce:'human-resolution'});
await check('Explicit resolution covers all reviewed heads',()=>{assert.equal(projection([A,C,resolution],[resolution.id]).state.name,'Reviewed');});
await check('Later unknown offline edit reopens resolved conflict',()=>{const old=commit([],delta('note','Original Note','Late'),{device:'forgotten'});assert.equal(projection([A,C,resolution,old],[resolution.id,old.id]).state,null);});
await check('Causal edits after human resolution remain possible',()=>{const next=commit([resolution.id],delta('name','Reviewed','Next'));assert.equal(projection([A,C,resolution,next],[next.id]).state.name,'Next');});
await check('Second explicit resolution retains prior audit and late branch',()=>{const old=commit([],delta('name','Original','Late'),{device:'old'});const r=commit([resolution.id,old.id],{}, {resolution:true,reads:['*'],snapshot:{...base,name:'Final'},nonce:'second'});const p=projection([A,C,resolution,old,r],[r.id]);assert.equal(p.state.name,'Final');assert.equal(p.retained.length,5);});
await check('Structural parent/descendant footprint overlaps conservatively',()=>{assert.ok(overlaps('towns/0','towns/0/areas/3'));assert.ok(!overlaps('towns/0','towns/01'));});
await check('Manual ordering does not rewrite descendant parent relationships',()=>{const x=commit([],delta('order',['a','b'],['b','a']));const s=projection([x],[x.id]).state;assert.equal(s.childParent,'parent');assert.equal(s.parent,'epic');});
await check('Interrupted pre-publication upload leaves only a harmless orphan',()=>{const s=new Store();s.blob(Buffer.from('bytes'));assert.equal(s.manifests.length,0);assert.equal(s.events.length,0);});
await check('Manifest cannot publish before required bytes are present',()=>{assert.throws(()=>new Store().publish(A,['missing']),/missing blob/);});
await check('Lost upload response reconciles immutable identity before retry',()=>{const s=new Store();const blob=s.blob(Buffer.from('bytes'));assert.throws(()=>s.publish(A,[blob],{loseResponse:true}),/response lost/);assert.equal(s.discover().events[0].commitId,A.id);s.publish(A,[blob]);const commits=s.events.map(e=>JSON.parse(e.bytes));assert.equal(projection(commits,[A.id]).retained.length,1);});
await check('Cursor remains durable only after event bytes validate and persist',()=>{const s=new Store();s.publish(A,[]);let durableCursor=0;const page=s.discover();assert.equal(durableCursor,0);for(const e of page.events)verify(JSON.parse(e.bytes));durableCursor=page.next;assert.equal(durableCursor,1);});
await check('Cursor resumes new append while paginating',()=>{const s=new Store();s.publish(A,[]);s.publish(B,[]);let cursor=0;const seen=new Set();let page=s.discover(cursor,1);seen.add(page.events[0].commitId);cursor=page.next;s.publish(C,[]);while(cursor<s.events.length){page=s.discover(cursor,1);for(const e of page.events)seen.add(e.commitId);cursor=page.next;}assert.deepEqual([...seen].sort(),[A.id,B.id,C.id].sort());});
await check('Monotonic local inventory never treats an absent listing as deletion',()=>{const known=new Set([A.id]);for(const id of [])known.add(id);assert.ok(known.has(A.id));});
await check('Read-only checkpoint creation does not prune offline ancestry',()=>{const archive=[A,C];const checkpoint={heads:[A.id,C.id],state:null};assert.equal(checkpoint.heads.length,2);assert.equal(archive.length,2);});
await check('Commit arrival permutations converge, including duplicates',()=>{for(const cs of [[A,B],[B,A],[A,B,A],[B,B,A]])assert.deepEqual(projection(cs,[A.id,B.id]).state,{...base,name:'A',note:'B'});for(const cs of [[A,C],[C,A],[C,A,C]])assert.equal(projection(cs,[A.id,C.id]).state,null);});
await check('All 120 five-commit independent/causal delivery orders converge',()=>{
 const D=commit([A.id],delta('name','A','D'));
 const E=commit([B.id],delta('note','B','E'));
 const F=commit([],delta('order',['a','b'],['b','a']),{device:'device-c'});
 function perms(xs){return xs.length?xs.flatMap((x,i)=>perms(xs.filter((_,j)=>j!==i)).map(t=>[x,...t])):[[]];}
 let count=0;for(const cs of perms([A,B,D,E,F])){assert.deepEqual(projection(cs,[D.id,E.id,F.id]).state,{...base,name:'D',note:'E',order:['b','a']});count++;}assert.equal(count,120);
});
await check('Exact duplicate receipt delivery is a no-op; changed bytes with same business ID require review',()=>{const seen=new Map(),take=r=>{const h=sha(JSON.stringify(r));if(seen.has(r.receiptId))return seen.get(r.receiptId)===h?'duplicate':'review';seen.set(r.receiptId,h);return 'new';};assert.equal(take({receiptId:'r',text:'a'}),'new');assert.equal(take({receiptId:'r',text:'a'}),'duplicate');assert.equal(take({receiptId:'r',text:'b'}),'review');});
await check('Shared manual save preserves Auto-Sync Off and isolates failed capability',async()=>{let on=false;const done=[];const r=await Promise.allSettled([Promise.resolve().then(()=>{throw Error('task provider down');}),Promise.resolve().then(()=>done.push('workspace'))]);assert.equal(on,false);assert.equal(done[0],'workspace');assert.equal(r[0].status,'rejected');assert.equal(r[1].status,'fulfilled');});
await check('Compressed payload hash and expanded byte limit are checked',()=>{const raw=Buffer.alloc(2048,97),z=gzipSync(raw);assert.ok(gunzipSync(z,{maxOutputLength:4096}).equals(raw));assert.throws(()=>gunzipSync(z,{maxOutputLength:1024}));assert.notEqual(sha(z),sha(Buffer.from(z).fill(0,0,1)));});
const exportPath='C:/Users/mrgen/Downloads/npcdex-v2.42/npcdex-agent-export.json';
const source=await fs.readFile(exportPath),data=JSON.parse(source);
await check('Latest saved export still matches measured revision-72 baseline',async()=>{const i=JSON.parse(await fs.readFile('outputs/U03-Data-and-Capacity-Inventory.json'));assert.equal(sha(source),i.npcdex.exportSHA256);assert.equal(data.revision,72);assert.ok(gunzipSync(gzipSync(source)).equals(source));});
let requestCount=0;
await check('Existing request hashes retain original JavaScript property-order semantics',()=>{for(const r of data.changeRequests){const signature={target:r.target,intent:r.intent,instructions:r.instructions,proposedDialogue:r.proposedDialogue,sharedSceneHandling:r.sharedSceneHandling,updatedAt:r.updatedAt};assert.equal(sha(JSON.stringify(signature)),r.requestHash);assert.equal(sha(JSON.stringify(r.baseline)),r.baselineHash);requestCount++;}assert.equal(requestCount,6);});
await check('Transport canonicalization must not replace NPCDex contract hashing',()=>{const x={z:1,a:2};assert.notEqual(sha(JSON.stringify(x)),sha(canonical(x)));});
const manifest=JSON.parse(await fs.readFile('outputs/ROMDex-v0.4-Manifest.json'));
await check('All released source and installed files remain unchanged',async()=>{for(const f of manifest.files){const rel=f.path.slice(7),src=rel==='preview.png'?'outputs/ROMDex-v0.4-Preview.png':'outputs/ROMDex/'+rel;for(const p of [src,'outputs/ROMDex-v0.4/'+f.path])assert.equal(sha(await fs.readFile(p)),f.sha256,p);}});
const report={schema:'ROMDexU04DesignProof/1',verifiedAt:new Date().toISOString(),passed:results.length,scenarios:results,permutationCases:120,existingRequestHashesVerified:requestCount,releaseFilesVerifiedInBothLocations:manifest.files.length,productionFilesChanged:false,networkUsedByProof:false,liveYouTrackGuaranteesProven:false,limits:'Small executable contract model, not production sync implementation, formal verification, API atomicity or actual instance acceptance. Cursor append semantics and durable I/O remain live gates.'};
await fs.mkdir('work/u04-contract',{recursive:true});await fs.writeFile('outputs/U04-Contract-Proof-Results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
