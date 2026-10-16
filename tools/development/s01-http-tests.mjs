import fs from 'node:fs/promises';
const file='outputs/ROMDex/tests/integration.test.mjs';let s=await fs.readFile(file,'utf8');
const test=`  await t.test('attachment deletion honors paused/manual sync and cancellation survives stale replay',async()=>{
   const issue=issues.get('PMON-2'),one={id:'s01-delete',name:'Sprite.png',size:5,mimeType:'image/png',created:1,updated:2},keep={...one,id:'s01-keep'};issue.attachments||=[];issue.attachments.push(one,keep);
   const op={opId:'s01-http-delete',type:'attachment-delete',issueId:'PMON-2',attachmentId:one.id,base:attachmentMetadata(one)};
   await api('sync-settings',{enabled:false});
   try{
    let result=await api('sync',{operations:[op]});assert.equal(result.syncDisabled,true);assert.ok(issue.attachments.some(x=>x.id===one.id));
    result=await api('sync',{operations:[op],manual:true});assert.deepEqual(result.completed,[op.opId]);assert.deepEqual(result.deletedAttachments,[{issueId:'PMON-2',id:one.id}]);assert.ok(!issue.attachments.some(x=>x.id===one.id));assert.ok(issue.attachments.some(x=>x.id===keep.id));assert.ok(issues.has('PMON-2'));assert.equal(result.automaticSyncEnabled,false);
    const cancel={...op,opId:'s01-http-cancel',attachmentId:keep.id,base:attachmentMetadata(keep)};
    await api('attachment-deletes/cancel',cancel);result=await api('sync',{operations:[cancel],manual:true});assert.deepEqual(result.completed,[cancel.opId]);assert.deepEqual(result.deletedAttachments,[]);assert.ok(issue.attachments.some(x=>x.id===keep.id));
    result=await api('sync',{operations:[{...cancel,attachmentId:one.id,base:attachmentMetadata(one)}],manual:true});assert.match(result.blocked.error,/Different Attachment/);assert.ok(issue.attachments.some(x=>x.id===keep.id));
   }finally{await api('sync-settings',{enabled:true});}
  });
`;
if(!s.includes("t.test('attachment deletion honors paused/manual"))s=s.replace("  await t.test('deleting a natively modified task requires renewed review'",test+"  await t.test('deleting a natively modified task requires renewed review'");
if(!s.includes("t.test('attachment deletion honors paused/manual"))throw Error('Test insertion anchor missing');
await fs.writeFile(file,s);
const store='outputs/ROMDex/public/store.mjs';s=await fs.readFile(store,'utf8');s=s.replace("await this.request('/api/attachment-deletes/cancel',op);await this.transaction(s=>s.attachmentDeleteCleanup=s.attachmentDeleteCleanup.filter(x=>x.opId!==op.opId));","const result=await this.request('/api/attachment-deletes/cancel',op);await this.transaction(s=>{s.attachmentDeleteCleanup=s.attachmentDeleteCleanup.filter(x=>x.opId!==op.opId);if(result.deletedAttachment){const item=s.remote.find(x=>x.id===result.deletedAttachment.issueId);if(item)item.attachments=(item.attachments||[]).filter(x=>x.id!==result.deletedAttachment.id);}});");await fs.writeFile(store,s);
