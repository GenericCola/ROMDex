import fs from 'node:fs';
const root='C:/Users/mrgen/Documents/Codex/2026-10-13/can/outputs/ROMDex/tests/';
let runtime=fs.readFileSync(root+'runtime-profile.test.mjs','utf8');runtime=runtime.replace("'complexity-field.mjs','public/core.mjs'","'complexity-field.mjs','attachment-storage.mjs','attachment-service.mjs','public/attachment-core.mjs','public/core.mjs'");fs.writeFileSync(root+'runtime-profile.test.mjs',runtime);
let text=fs.readFileSync(root+'integration.test.mjs','utf8');
text=text.replace("const response=x=>", "const attachmentContents=new Map();let loseAttachment=false,denyAttachment=false;\nconst response=x=>");
text=text.replace("body=options.body?JSON.parse(options.body):null;", "body=typeof options.body==='string'?JSON.parse(options.body):options.body||null;");
const needle="if(p==='issues'&&method==='GET')";if(!text.includes(needle))throw Error('Missing route');
text=text.replace(needle,`if(url.pathname.startsWith('/api/files/')){const id=url.pathname.split('/').pop();return new Response(attachmentContents.get(id),{status:attachmentContents.has(id)?200:404});}
 const attachmentRoute=p.match(/^issues\\/(PMON-\\d+)\\/attachments$/);if(attachmentRoute){const issue=issues.get(attachmentRoute[1]);if(!issue)return new Response('{}',{status:404});issue.attachments||=[];if(method==='GET')return response(Number(url.searchParams.get('$skip'))?[]:issue.attachments);if(denyAttachment)return new Response(JSON.stringify({error_description:'Add Attachment Permission Required'}),{status:403});const file=body.get('upload1'),id='attachment-'+(++clock),record={id,name:file.name,size:file.size,mimeType:file.type,url:'/api/files/'+id+'?sign=fixture',created:clock};issue.attachments.push(record);issue.updated=++clock;attachmentContents.set(id,Buffer.from(await file.arrayBuffer()));if(loseAttachment){loseAttachment=false;throw Error('Lost attachment response');}return response([record]);}
 `+needle);
const testAnchor="await t.test('full editor metadata";const at=text.indexOf(testAnchor);if(at<0)throw Error('Missing test');
text=text.slice(0,at)+`await t.test('attachment staging is private, paused uploads wait, native files refresh and original bytes download',async()=>{
  await api('sync-settings',{enabled:false});const fileBytes=Buffer.from([0,255,13,10,0,123]),uploadId='native-upload',form=new FormData();form.append('uploadId',uploadId);form.append('file',new Blob([fileBytes],{type:'image/png'}),'Sprite.png');
  const staged=await realFetch(origin+'/api/uploads',{method:'POST',headers:{Origin:origin},body:form});assert.equal(staged.status,200);const info=(await staged.json()).file;
  const operation={opId:uploadId,uploadId,type:'attachment',issueId:'PMON-2',file:info};const paused=await api('sync',{operations:[operation]});assert.equal(paused.syncDisabled,true);assert.equal(issues.get('PMON-2').attachments?.length||0,0);
  const sent=await api('sync',{manual:true,operations:[operation]});assert.deepEqual(sent.completed,[uploadId]);const item=sent.items.find(x=>x.id==='PMON-2');assert.equal(item.attachments[0].name,'Sprite.png');assert.equal(item.attachments[0].url,undefined);
  const content=await realFetch(origin+'/api/attachment-content?id=PMON-2&attachmentId='+item.attachments[0].id);assert.deepEqual(Buffer.from(await content.arrayBuffer()),fileBytes);assert.match(content.headers.get('content-disposition'),/attachment/);assert.equal(content.headers.get('x-content-type-options'),'nosniff');
  issues.get('PMON-2').attachments[0].removed=true;await api('sync-settings',{enabled:true});assert.equal((await api('snapshot')).items.find(x=>x.id==='PMON-2').attachments.length,0);
 });
 await t.test('lost multipart confirmation reconciles exactly once; permission failures keep the staged file',async()=>{
  const stage=async id=>{const form=new FormData();form.append('uploadId',id);form.append('file',new Blob(['file data'],{type:'text/plain'}),'Instructions.txt');const res=await realFetch(origin+'/api/uploads',{method:'POST',headers:{Origin:origin},body:form});return {opId:id,uploadId:id,type:'attachment',issueId:'PMON-2',file:(await res.json()).file};};
  const op=await stage('uncertain-upload');loseAttachment=true;assert.equal((await api('sync',{operations:[op]})).blocked.uncertain,true);const count=issues.get('PMON-2').attachments.length;const result=await api('sync',{manual:true,operations:[op]});assert.deepEqual(result.completed,[op.opId]);assert.equal(issues.get('PMON-2').attachments.length,count);
  const denied=await stage('denied-upload');denyAttachment=true;assert.match((await api('sync',{operations:[denied]})).blocked.error,/Permission/);assert.ok((await api('uploads?uploadId='+denied.uploadId)).file);denyAttachment=false;assert.deepEqual((await api('sync',{operations:[denied]})).completed,[denied.opId]);
 });
 await t.test('new issue creation precedes its attachment and maps the queued target',async()=>{
  const form=new FormData();form.append('uploadId','new-ticket-file');form.append('file',new Blob(['new ticket file']),'New.txt');const staged=await realFetch(origin+'/api/uploads',{method:'POST',headers:{Origin:origin},body:form}),file=(await staged.json()).file;
  const result=await api('sync',{operations:[{opId:'new-file-ticket',type:'create',issueId:'local-file-ticket',item:{id:'local-file-ticket',summary:'Ticket with file',state:'To do'}},{opId:'new-ticket-file',uploadId:'new-ticket-file',type:'attachment',issueId:'local-file-ticket',file}]});assert.deepEqual(result.completed,['new-file-ticket','new-ticket-file']);assert.equal(result.items.find(x=>x.id===result.mapping['local-file-ticket']).attachments[0].name,'New.txt');
 });
 `+text.slice(at);fs.writeFileSync(root+'integration.test.mjs',text);
