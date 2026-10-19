// Read-only facts from the durable package ledger. Task status and portable
// workflow/testing claims are never evidence that an agent result was accepted.
export function packageSummary(entry,blocked=null){
 const files=entry.uploads||[],held=blocked&&(blocked.opId===entry.createOpId||files.some(f=>f.opId===blocked.opId)),error=entry.error||files.find(f=>f.error)?.error||(held?(blocked.message||blocked.error||'Resolve the Native Queue Review Before Continuing.'):null);
 return {id:entry.id,key:entry.key,mapName:entry.mapName,packageId:entry.packageId,version:entry.version,issueId:entry.issueId,contextOnly:entry.contextOnly===true,status:entry.status,delivery:error?'needs-review':entry.status==='attached'?'attached':'staged',error,
  fileProgress:{queued:files.length,uploaded:files.filter(f=>f.completed).length,verified:files.filter(f=>f.verified).length},implementation:'not-reported',testing:'not-verified'};
}
export function packageProgress(entry,prepared,blocked=null){
 const summary=packageSummary(entry,blocked),groups=prepared.groups.map(g=>({id:g.groupId,contextOnly:g.writeRecordIds.length===0,planDigests:g.planDigests,readRecordIds:g.readSet.map(r=>r.recordId),writeRecordIds:g.writeRecordIds,delivery:summary.delivery,implementation:g.writeRecordIds.length?'not-reported':'context-only',testing:g.writeRecordIds.length?'not-verified':'not-applicable'}));
 return {...summary,baseDocument:{documentId:prepared.document.documentId,revision:prepared.document.revision},mapRecordId:prepared.document.scope.mapRecordId,
  items:prepared.rows.filter(r=>r.selected).map(r=>({...r,digest:r.key.slice(r.key.indexOf(':')+1),groupId:groups.find(g=>g.planDigests.includes(r.key.slice(5)))?.id||null,delivery:summary.delivery,implementation:r.kind==='change'?'not-reported':'context-only',testing:r.kind==='change'?'not-verified':'not-applicable'})),groups};
}
