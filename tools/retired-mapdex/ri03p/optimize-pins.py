from pathlib import Path
p=Path('outputs/ROMDex/rdx/document-cloud.mjs');s=p.read_text(encoding='utf-8')
s=s.replace('async nativePins(records){const out=[];',"async nativePins(records,dataset=null){if(dataset&&this.transport.nativeMany)return this.transport.nativeMany(records,dataset);const out=[];")
s=s.replace('await this.nativePins(s.native)','await this.nativePins(s.native,sha(this.maps.store.load(key,this.maps.store.row(key).head).document.datasetId))')
s=s.replace('await this.nativePins([...records.values()])','await this.nativePins([...records.values()],sha(value.document.datasetId))')
s=s.replace('await this.nativePins(native)','await this.nativePins(native,sha(value.document.datasetId))')
p.write_bytes(s.encode('utf-8'))
p=Path('outputs/ROMDex/rdx/youtrack-store.mjs');s=p.read_text(encoding='utf-8')
old="async native(issueId){this.issueCache.delete(issueId);const r=await this.issue(issueId),parents="
new="async nativeMany(records,dataset){ensure(/^[a-f0-9]{64}$/.test(dataset),'INVALID','Invalid Native Dataset.');const rows=await this.list('/api/issues?query='+encodeURIComponent('project: NPCD \\\"'+dataset+'\\\"')+'&fields='+fields),byId=new Map(rows.map(r=>[r.id,r]));const out=[];for(const record of records){const row=byId.get(record.issueId);out.push(row?await this.nativeValue(this.validate(row)):await this.native(record.issueId));}return out;}\n async native(issueId){this.issueCache.delete(issueId);return this.nativeValue(await this.issue(issueId));}\n async nativeValue(r){const issueId=r.id,parents="
assert old in s;s=s.replace(old,new);p.write_bytes(s.encode('utf-8'))
print('Added fresh batched native metadata snapshots')
