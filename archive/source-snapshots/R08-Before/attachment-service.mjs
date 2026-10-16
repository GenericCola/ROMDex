import {attachmentMetadata,validateUpload} from './public/attachment-core.mjs';
import {fileHash} from './attachment-storage.mjs';
export class AttachmentService {
 constructor({storage,client,journal,persist}){Object.assign(this,{storage,client,journal,persist});}
 async candidates(issueId,record,file,matchName=true){
  const all=await this.client().attachments(issueId),fresh=all.filter(x=>!record.before.includes(x.id)&&(!matchName||x.name===file.name)&&x.size===file.size),matches=[];
  for(const item of fresh){const bytes=await this.client().attachmentBytes(issueId,item.id);if(fileHash(bytes.bytes)===file.hash)matches.push(attachmentMetadata(item));}return matches;
 }
 async complete(op,item){this.journal[op.opId]={status:'done',result:{attachment:attachmentMetadata(item)}};await this.persist();await this.storage.release(op.uploadId).catch(()=>{});return this.journal[op.opId].result;}
 async process(op){
  validateUpload(op);const record=this.journal[op.opId];if(record?.status==='done')return record.result;
  const yt=this.client();await yt.require(op.issueId);const {metadata,bytes}=await this.storage.read(op.uploadId,op.file);
  if(record?.status==='running'){
   const matches=await this.candidates(op.issueId,record,metadata);if(matches.length===1)return this.complete(op,matches[0]);
   return {uncertain:true,message:matches.length?'Several Identical New Attachments Were Found. Review Which File Belongs to This Upload.':'The Upload May Have Reached YouTrack. Review Its Attachments Before Retrying.',attachments:matches,file:metadata};
  }
  this.journal[op.opId]={status:'running',kind:'attachment',issueId:op.issueId,uploadId:op.uploadId,file:metadata,before:(await yt.attachments(op.issueId)).map(x=>x.id)};await this.persist();
  try{const uploaded=await yt.uploadAttachment(op.issueId,metadata,bytes);if(uploaded.length!==1||uploaded[0].name!==metadata.name||uploaded[0].size!==metadata.size)throw Error('YouTrack Did Not Confirm the Expected Attachment.');return await this.complete(op,uploaded[0]);}
  catch(error){if(error.status>=400&&error.status<500){delete this.journal[op.opId];await this.persist();throw error;}return {uncertain:true,message:'Upload Confirmation Was Interrupted. Check YouTrack Before Retrying.',file:metadata};}
 }
 async acknowledge(opId,action,attachmentId){
  const record=this.journal[opId];if(record?.kind!=='attachment'||record.status!=='running')throw Error('No Uncertain Upload to Resolve.');
  const matches=await this.candidates(record.issueId,record,record.file,false);
  if(action==='retry'){if(matches.length)throw Error('Matching File Contents Were Found. Select the Existing Attachment Instead of Uploading Again.');delete this.journal[opId];await this.persist();return;}
  if(action!=='attached')throw Error('Choose an Attachment Resolution.');
  const all=await this.client().attachments(record.issueId),item=all.find(x=>x.id===attachmentId);if(!item||item.size!==record.file.size)throw Error('The Selected Attachment Does Not Match the Queued File.');
  if(fileHash((await this.client().attachmentBytes(record.issueId,item.id)).bytes)!==record.file.hash)throw Error('The Selected Attachment Has Different Contents.');
  await this.complete({opId,uploadId:record.uploadId},item);
 }
 async review(opId){const record=this.journal[opId];if(record?.status==='done'&&record.result?.attachment)return {completed:true,attachments:[record.result.attachment]};if(record?.kind!=='attachment')throw Error('No Uncertain Upload to Review.');return {attachments:await this.candidates(record.issueId,record,record.file,false)};}
}
