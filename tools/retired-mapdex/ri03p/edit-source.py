from pathlib import Path
p=Path('outputs/ROMDex/rdx/document-cloud.mjs');s=p.read_text(encoding='utf-8')
def replace(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b)
replace("const hash=v=>", "import {planDelivery,unpackCloudObject,FILE_BYTES} from './cloud-delivery.mjs';\nconst hash=v=>")
replace("const reconstructed=await joinDocument(commit,async hash=>", "const packCache=new Map(),fileCache=new Map();const loadFile=async p=>{const identity=p.issueId+'/'+p.attachmentId;if(fileCache.has(identity))return fileCache.get(identity);const cached=this.maps.store.db.prepare('SELECT bytes FROM blobs WHERE hash=?').get(p.sha256);let bytes;if(cached){const listing=await this.transport.inventory(p.issueId),file=listing.find(f=>f.id===p.attachmentId);ensure(file&&file.size===p.bytes&&file.author?.id==='2-2'&&(p.updated===undefined||file.updated===p.updated),'INTEGRITY','A Cached Cloud Pack Lost or Changed Its Published Attachment.');bytes=Buffer.from(cached.bytes);ensure(bytes.length===p.bytes&&sha(bytes)===p.sha256,'INTEGRITY','Cached Cloud Pack Bytes Differ.');}else{bytes=await this.transport.readObject(p);await this.maps.store.capacity(bytes.length*2);this.maps.store.db.prepare('INSERT OR IGNORE INTO blobs VALUES(?,?)').run(p.sha256,bytes);this.transport.readProgress=(this.transport.readProgress||0)+1;}fileCache.set(identity,bytes);return bytes;};const reconstructed=await joinDocument(commit,async hash=>")
replace("ensure(r&&r.parts.length>0&&r.parts.length<=100,'INVALID','Cloud Object Reference Is Missing.');", "ensure(r&&(r.pack&&!r.parts||Array.isArray(r.parts)&&!r.pack&&r.parts.length>0&&r.parts.length<=100),'INVALID','Cloud Object Reference Is Missing.');if(r.pack){ensure(commit.format==='RDXCloudCommit/2','INVALID','Packed Objects Require Cloud Commit Version 2.');return unpackCloudObject(r,await loadFile(r.pack.file),packCache);}")
replace("file.size===p.bytes&&file.author?.id==='2-2','INTEGRITY'", "file.size===p.bytes&&file.author?.id==='2-2'&&(p.updated===undefined||file.updated===p.updated),'INTEGRITY'")
replace("retry:false};this.save(key,s);", "retry:false,deliveryVersion:2};this.save(key,s);")
replace("const registryId=await this.transport.registry", "intent.progress={phase:'Creating Content Records',recordsComplete:intent.records.length,recordsTotal:domain.records.length,objectsComplete:0,objectsTotal:parts.objects.size};save();const registryId=await this.transport.registry")
replace("intent.records=[...records.values()];save();", "intent.records=[...records.values()];intent.progress.recordsComplete=records.size;save();")
a="for(const [hash,bytes]of parts.objects){if(objects.has(hash))continue;const owner=parts.owners.get(hash),issueId=records.get(owner)?.issueId||registryId,refs=[];for(let offset=0;offset<Math.max(1,bytes.length);offset+=512*1024){const chunk=bytes.subarray(offset,offset+512*1024);refs.push(await this.transport.object(issueId,chunk,slot('object:'+hash+':'+offset),save,{retry:intent.retry}));}objects.set(hash,{hash,bytes:bytes.length,parts:refs});}"
b="""intent.progress.phase='Delivering Verified Content';intent.progress.objectsComplete=[...parts.objects.keys()].filter(h=>objects.has(h)).length;save();
 const groups=intent.deliveryVersion===2?planDelivery(parts,objects):[...parts.objects].filter(([h])=>!objects.has(h)).map(([hash,bytes])=>({owner:parts.owners.get(hash),objects:[{hash,bytes}],packed:false}));
 for(const group of groups){if(group.packed){const file=await this.transport.object(registryId,group.bytes,slot('pack:'+sha(group.bytes)),save,{retry:intent.retry});let offset=0;for(const o of group.objects){objects.set(o.hash,{hash:o.hash,bytes:o.bytes.length,pack:{format:'RDXCloudPack/1',file,decodedBytes:group.decodedBytes,decodedSha256:group.decodedSha256,offset}});offset+=o.bytes.length;}}else for(const {hash,bytes}of group.objects){const issueId=records.get(group.owner)?.issueId||registryId,refs=[];for(let offset=0;offset<Math.max(1,bytes.length);offset+=FILE_BYTES)refs.push(await this.transport.object(issueId,bytes.subarray(offset,offset+FILE_BYTES),slot('object:'+hash+':'+offset),save,{retry:intent.retry}));objects.set(hash,{hash,bytes:bytes.length,parts:refs});}intent.progress.objectsComplete+=group.objects.length;save();}
 intent.progress.phase='Verifying Cloud Commit';save();"""
replace(a,b)
replace("format:'RDXCloudCommit/1',key,instance", "format:intent.deliveryVersion===2?'RDXCloudCommit/2':'RDXCloudCommit/1',key,instance")
replace("registryIssueId:s.registry?.id||null", "registryIssueId:s.registry?.id||null,progress:s.intent?.progress||null,transfer:s.transfer||null")
replace("s.intent?'RDX Changes Are Queued.'", "s.intent?(this.active&&s.intent.progress?s.intent.progress.phase+' · '+s.intent.progress.recordsComplete+'/'+s.intent.progress.recordsTotal+' Records · '+s.intent.progress.objectsComplete+'/'+s.intent.progress.objectsTotal+' Objects Verified.':'RDX Changes Are Queued.')")
replace("const before=progress(s);try{", "const before=progress(s),started=Date.now();try{")
replace("this.save(key,s);}}).finally", "s.transfer={milliseconds:Date.now()-started,requests:this.transport.requests||0,writes:this.transport.writes||0,downloadedBytes:this.transport.bytes||0,uploadedBytes:this.transport.uploadedBytes||0,complete:!s.intent&&!s.error&&!s.review&&s.publishedRevision===this.maps.store.row(key).head};this.save(key,s);}}).finally")
p.write_bytes(s.encode('utf-8'))
p=Path('outputs/ROMDex/rdx/youtrack-store.mjs');s=p.read_text(encoding='utf-8')
replace("this.bytes=0;this.readProgress", "this.bytes=0;this.uploadedBytes=0;this.datasets=new Map();this.readProgress")
replace(" async record(key,record,parentId", " async datasetRecords(key){if(!this.datasets.has(key)){const rows=await this.list('/api/issues?query='+encodeURIComponent('project: NPCD \\\"'+key+'\\\"')+'&fields='+fields);this.datasets.set(key,rows);}return this.datasets.get(key);}\n async record(key,record,parentId")
replace("const rows=await this.list('/api/issues?query='+encodeURIComponent('project: NPCD \\\"'+key+'\\\"')+'&fields='+fields),found", "const rows=await this.datasetRecords(key),found") if "const rows=await this.list('/api/issues?query='+encodeURIComponent('project: NPCD \\\"'+key+'\\\"')+'&fields='+fields),found" in s else replace("const rows=await this.list('/api/issues?query='+encodeURIComponent('project: NPCD \"'+key+'\"')+'&fields='+fields),found", "const rows=await this.datasetRecords(key),found")
replace("ensure(v.format==='RDXCloudCommit/1'&&v.key", "ensure(['RDXCloudCommit/1','RDXCloudCommit/2'].includes(v.format)&&v.key")
replace("slot.sending=true;save();const form=new FormData();", "slot.sending=true;save();this.uploadedBytes+=bytes.length;const form=new FormData();")
replace("ensure(file&&file.size===ref.bytes,'INTEGRITY'", "ensure(file&&file.size===ref.bytes&&(ref.updated===undefined||file.updated===ref.updated),'INTEGRITY'")
# Add observed metadata to new refs; old commit refs remain supported.
replace("bytes:bytes.length};", "bytes:bytes.length,...(f.updated!==undefined?{updated:f.updated}:{})};")
p.write_bytes(s.encode('utf-8'))
print('Patched cloud delivery and transport')
