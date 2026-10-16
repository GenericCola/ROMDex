import {indexTree,validateMove,reconcile,STATES,FIELDS,same} from './public/core.mjs';
import {AssignedStatuses,AssignedStatusConflict} from './assigned-statuses.mjs';
import {COMPLEXITY_VALUES,PROJECT_FIELDS,complexityConfiguration,ensureComplexity} from './complexity-field.mjs';
import {editorConfiguration,dateText,dateTimestamp,assigneeValue} from './public/item-editor.mjs';
import {customDefinitions,customValue,customKey,customPayload as extraPayload} from './public/custom-editor.mjs';
import {attachmentMetadata,MAX_FILE_BYTES} from './public/attachment-core.mjs';
export const BASE='https://thegobindsingh.youtrack.cloud';
const attachmentFields='id,name,size,mimeType,created,updated,removed,draft,url';
const fields='id,idReadable,summary,description,updated,project(id,shortName),customFields(id,name,$type,value(id,name,login,fullName,minutes,text)),parent(issues(id,idReadable)),links(id,direction,linkType(name,sourceToTarget,targetToSource),issues(id,idReadable)),commentsCount,tags(id,name),attachments(id,name,size,mimeType,created,updated,removed,draft)';
export class YouTrack {
 constructor(token,assignedStatuses=new AssignedStatuses()){this.token=token;this.assignedStatuses=assignedStatuses;this.projectId=null;this.schema=[];this.stateValues=[];this.commentCache=new Map();this.healthy=null;this.ready=false;}
 async request(path,{method='GET',body}={}){
  const multipart=body instanceof FormData;
  let response,text;try{response=await fetch(BASE+'/api/'+path,{method,redirect:'error',headers:{Authorization:'Bearer '+this.token,Accept:'application/json',...(body&&!multipart?{'Content-Type':'application/json'}:{})},body:multipart?body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(multipart?120000:30000)});text=await response.text();}catch(error){this.healthy=false;throw error;}
  this.healthy=response.ok||(response.status>=400&&response.status<500&&![401,403].includes(response.status));
  let data;try{data=text?JSON.parse(text):null;}catch{data=null;}
  if(!response.ok){const error=new Error(data?.error_description||data?.error||('YouTrack request failed ('+response.status+').'));error.status=response.status;throw error;}
  return data;
 }
 async list(path,params={}){
  const out=[];for(let skip=0;skip<100000;){const query=new URLSearchParams({...params,$top:'100',$skip:String(skip)});const page=await this.request(path+'?'+query);if(!Array.isArray(page))throw new Error('Unexpected list response from YouTrack.');out.push(...page);if(page.length===0)break;skip+=page.length;}return out;
 }
 async connect(){
  this.ready=false;
  this.user=await this.request('users/me?fields=id,login,fullName');
  const projects=await this.list('admin/projects',{fields:'id,name,shortName',query:'PMON'});
  const project=projects.find(x=>x.shortName==='PMON');if(!project)throw new Error('This token cannot access the PMON project.');this.projectId=project.id;
  this.schema=await this.list(`admin/projects/${this.projectId}/customFields`,{fields:PROJECT_FIELDS});
  const state=this.schema.find(x=>x.field?.name==='State');if(!state?.bundle?.id)throw new Error('Cannot read the project State configuration.');this.stateBundle=state.bundle.id;
  this.stateValues=await this.list(`admin/customFieldSettings/bundles/state/${this.stateBundle}/values`,{fields:'id,name,isResolved'});
  this.ready=true;return this.connectionInfo();
 }
 connectionInfo(){return {user:this.user?.fullName||this.user?.login,project:'PMON',localAssignedStatus:true,missingStates:Object.values(STATES).filter(x=>!this.stateValues.some(v=>v.name===x)),priorities:this.schema.find(x=>x.field?.name==='Priority')?.bundle?.values?.map(x=>x.name)||[],complexity:complexityConfiguration(this.schema)};}
 async setupComplexity(){await ensureComplexity(this);return this.connectionInfo();}
 async editOptions(){
  this.schema=await this.list(`admin/projects/${this.projectId}/customFields`,{fields:PROJECT_FIELDS.replace('fieldType(id)','fieldType(id,valueType,isMultiValue)').replace('values(id,name)','values(id,name),aggregatedUsers(id,login,name,fullName)')});
  const assignee=this.schema.find(x=>x.field?.name==='Assignee');let users=null,error='';
  if(assignee?.bundle?.id)try{users=await this.list(`admin/customFieldSettings/bundles/user/${encodeURIComponent(assignee.bundle.id)}/aggregatedUsers`,{fields:'id,login,name,fullName'});}catch(e){error='Cannot Read Eligible Assignees · '+e.message;}
  let timeTracking=null,tags=[],tagError='';
  try{timeTracking=await this.request(`admin/projects/${this.projectId}/timeTrackingSettings?fields=enabled,timeSpent(id,field(name))`);}catch{}
  try{tags=await this.list('tags',{fields:'id,name'});}catch(e){tagError=e.message;}
  this.editFieldOptions={...editorConfiguration(this.schema,users,error),custom:customDefinitions(this.schema,timeTracking),tags:{ready:!tagError,options:tags,message:tagError?'Cannot Read Tags · '+tagError:''}};return this.editFieldOptions;
 }
 async ensureStates(){
  // Add values only; never rename/delete existing values or change another project's field attachment.
  for(const name of Object.values(STATES))if(!this.stateValues.some(x=>x.name===name)){
   await this.request(`admin/customFieldSettings/bundles/state/${this.stateBundle}/values?fields=id,name,isResolved`,{method:'POST',body:{name,isResolved:name==='Done'}});
   this.stateValues=await this.list(`admin/customFieldSettings/bundles/state/${this.stateBundle}/values`,{fields:'id,name,isResolved'});
  }
 }
 normalize(raw){
  if(raw.project?.shortName!=='PMON')throw new Error('ROMDex is limited to the PMON project.');
  const custom=Object.fromEntries((raw.customFields||[]).map(f=>[f.name,Array.isArray(f.value)?f.value.map(v=>v.name||v.login):f.value?.name??f.value?.login??f.value??null]));
  const parentLinks=(raw.links||[]).filter(l=>l.linkType?.name==='Subtask'&&l.direction==='INWARD');
  const parents=raw.parent?.issues||parentLinks.flatMap(l=>l.issues||[]);if(parents.length>1)throw new Error(raw.idReadable+' has multiple parents. Resolve this in YouTrack before editing its hierarchy.');
  const parentId=parents[0]?.idReadable||null;
  const assignee=(raw.customFields||[]).find(f=>f.name==='Assignee')?.value,values=Object.fromEntries((raw.customFields||[]).filter(f=>f.id).map(f=>[customKey(f.id),customValue(f)]));
  return {...values,attachments:(raw.attachments||[]).filter(x=>!x.removed&&!x.draft).map(attachmentMetadata),id:raw.idReadable,dbId:raw.id,summary:raw.summary,description:raw.description||'',updated:raw.updated,parentId,state:custom.State||'To do',priority:custom.Priority||'Normal',complexity:custom.Complexity??null,assignee:assigneeValue(assignee),assigneeName:Array.isArray(assignee)?assignee.map(x=>x.fullName||x.name||x.login).join(', '):assignee?.fullName||assignee?.name||assignee?.login||null,dueDate:dateText(custom['Due Date']),tags:(raw.tags||[]).map(x=>x.id).sort(),tagNames:(raw.tags||[]).map(x=>({id:x.id,name:x.name})),type:custom.Type||'Task',fields:custom,commentCount:raw.commentsCount||0,dependencies:(raw.links||[]).filter(l=>l.linkType?.name!=='Subtask').reduce((n,l)=>n+(l.issues||[]).length,0),url:BASE+'/issue/'+raw.idReadable,_links:raw.links||[],_custom:raw.customFields||[]};
 }
 async all(){
  const items=(await this.list('issues',{query:'project: PMON sort by: created asc',fields})).map(x=>this.normalize(x));
  for(const item of items){if(item.attachments.length>=42)item.attachments=(await this.attachments(item.id,false)).map(attachmentMetadata);const cache=this.commentCache.get(item.id);if(item.commentCount===0)item.comments=[];else if(cache?.updated===item.updated&&cache.count===item.commentCount)item.comments=cache.comments;else{item.comments=await this.comments(item.id,false);this.commentCache.set(item.id,{updated:item.updated,count:item.commentCount,comments:item.comments});}}
  return this.assignedStatuses.observeAll(items);
 }
 async get(id){if(!/^PMON-\d+$/.test(id))throw new Error('Invalid PMON issue ID.');try{const item=this.normalize(await this.request(`issues/${id}?fields=${encodeURIComponent(fields)}`));if(item.attachments.length>=42)item.attachments=(await this.attachments(id,false)).map(attachmentMetadata);return await this.assignedStatuses.observe(item);}catch(e){if(e.status===404)return null;throw e;}}
 async comments(id,validate=true){if(validate)await this.require(id);return (await this.list(`issues/${id}/comments`,{fields:'id,text,created,updated,author(login,fullName),deleted'})).filter(x=>!x.deleted).map(x=>({id:x.id,text:x.text||'',created:x.created,author:x.author?.fullName||x.author?.login||'Unknown'}));}
 async require(id){const issue=await this.get(id);if(!issue)throw new Error('Issue '+id+' no longer exists.');return issue;}
 customPayload(patch,raw){
  const customFields=[];
  for(const [key,name]of [['state','State'],['priority','Priority'],['complexity','Complexity'],['assignee','Assignee'],['dueDate','Due Date']])if(key in patch){
   const spec=raw?._custom?.find(x=>x.name===name);let value=patch[key]===null?null:{name:patch[key]},type=spec?.$type||(key==='state'?'StateIssueCustomField':'SingleEnumIssueCustomField');
   if(key==='complexity'){if(patch[key]!==null&&!COMPLEXITY_VALUES.includes(patch[key]))throw new Error('Choose LOW, MID, HIGH, INSANE or Not Set for Complexity.');if(!complexityConfiguration(this.schema).ready)throw new Error('Set Up the Complexity Field in Connection First.');}
   if(key==='assignee'){
    const config=this.editFieldOptions?.assignee;if(!config?.ready)throw new Error(config?.message||'Assignee Options Are Not Available.');
    if(patch[key]===null){if(!config.canBeEmpty)throw new Error('This Project Requires an Assignee.');}else if(!config.options.some(x=>x.id===patch[key]))throw new Error('Choose an Eligible Project Assignee.');
    value=patch[key]===null?null:{id:patch[key]};type='SingleUserIssueCustomField';
   }
   if(key==='dueDate'){
    const config=this.editFieldOptions?.dueDate;if(!config?.ready)throw new Error(config?.message||'Due Date Is Not Available.');if(patch[key]===null&&!config.canBeEmpty)throw new Error('This Project Requires a Due Date.');
    value=dateTimestamp(patch[key]);type='DateIssueCustomField';
   }
   customFields.push({name,$type:type,value});
  }
  for(const [key,value]of Object.entries(patch))if(key.startsWith('custom:'))customFields.push(extraPayload(this.editFieldOptions?.custom?.find(x=>x.key===key),value));return customFields;
 }
 async validateEdit(patch,raw){
  if(Object.keys(patch).some(key=>['assignee','dueDate','tags'].includes(key)||key.startsWith('custom:')))await this.editOptions();
  this.customPayload(patch,raw);
  if('tags'in patch){const config=this.editFieldOptions?.tags;if(!config?.ready)throw Error(config?.message||'Tag Options Are Not Available.');if(!Array.isArray(patch.tags)||patch.tags.some(id=>typeof id!=='string'||!config.options.some(x=>x.id===id)&&!raw?.tags?.includes(id)))throw Error('Choose an Available Tag.');}
 }
 async setTags(id,desired,onApplied=async()=>{}){
  const current=await this.require(id),wanted=new Set(desired),present=new Set(current.tags);
  for(const tag of present)if(!wanted.has(tag)){await this.request(`issues/${id}/tags/${encodeURIComponent(tag)}`,{method:'DELETE'});await onApplied(tag,false);}
  for(const tag of wanted)if(!present.has(tag)){await this.request(`issues/${id}/tags?fields=id,name`,{method:'POST',body:{id:tag}});await onApplied(tag,true);}
 }
 async update(id,patch,prepared=false){const current=await this.require(id);if(!prepared)await this.validateEdit(patch,current);const body={};for(const key of ['summary','description'])if(key in patch)body[key]=patch[key];const customFields=this.customPayload(patch,current);if(customFields.length)body.customFields=customFields;if(Object.keys(body).length)await this.request(`issues/${id}`,{method:'POST',body});}
 async setParent(id,parentId,onDetached=async()=>{}){
  const all=await this.all();validateMove(all,id,parentId);let current=all.find(x=>x.id===id);
  if(current.parentId===parentId)return;
  const old=current._links.find(l=>l.linkType.name==='Subtask'&&l.direction==='INWARD');
  // Persisted operation journal makes a partially completed remove/add recoverable.
  if(old){for(const p of old.issues||[])await this.request(`issues/${id}/links/${encodeURIComponent(old.id)}/issues/${encodeURIComponent(p.id)}`,{method:'DELETE'});const detached=await this.require(id);if(detached.parentId!==null)throw new Error('YouTrack did not confirm removal from the former parent.');await onDetached();}
  if(parentId){const target=await this.require(parentId);current=await this.require(id);const link=current._links.find(l=>l.linkType.name==='Subtask'&&l.direction==='INWARD');if(!link)throw new Error('YouTrack did not expose its Subtask link type.');await this.request(`issues/${id}/links/${encodeURIComponent(link.id)}/issues`,{method:'POST',body:{id:target.dbId}});}
  const verify=await this.require(id);if(verify.parentId!==parentId)throw new Error('YouTrack did not confirm the new parent.');
 }
 async create(item){await this.validateEdit(item,null);const initial={...item,state:item.assignedState??item.state};const body={project:{id:this.projectId},summary:item.summary,description:item.description||'',customFields:[...this.customPayload(initial),...(!this.customPayload(initial).some(x=>x.name==='Type')?[{name:'Type',$type:'SingleEnumIssueCustomField',value:{name:item.type||'Task'}}]:[])]};return this.assignedStatuses.observe(this.normalize(await this.request('issues?fields='+encodeURIComponent(fields),{method:'POST',body})));}
 async addComment(id,text){await this.require(id);return this.request(`issues/${id}/comments?fields=id,text,created`,{method:'POST',body:{text}});}
 async attachments(id,validate=true){if(!/^PMON-\d+$/.test(id))throw Error('Invalid PMON Issue ID.');if(validate)await this.require(id);return (await this.list(`issues/${id}/attachments`,{fields:attachmentFields})).filter(x=>!x.removed&&!x.draft);}
 async uploadAttachment(id,file,bytes){await this.require(id);const form=new FormData();form.append('upload1',new Blob([bytes],{type:file.mimeType}),file.name);return this.request(`issues/${id}/attachments?fields=${encodeURIComponent(attachmentFields)}`,{method:'POST',body:form});}
 async attachmentBytes(id,attachmentId){
  const item=(await this.attachments(id)).find(x=>x.id===attachmentId);if(!item)throw Object.assign(Error('This Attachment Was Removed or Is Not Accessible.'),{status:404});
  const url=new URL(item.url,BASE);if(url.origin!==BASE||url.username||url.password||!/^\/(youtrack\/)?api\/files\//.test(url.pathname))throw Error('YouTrack Returned an Unsupported Attachment Address.');
  const response=await fetch(url,{redirect:'error',headers:url.searchParams.has('sign')?{'Cache-Control':'no-cache'}:{Authorization:'Bearer '+this.token},signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw Object.assign(Error('Cannot Download This Attachment ('+response.status+').'),{status:response.status});
  if(Number(response.headers.get('content-length'))>MAX_FILE_BYTES)throw Object.assign(Error('This File Exceeds ROMDex’s 50 MB Viewing Limit. Open It in YouTrack.'),{status:413});
  const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>MAX_FILE_BYTES)throw Object.assign(Error('This File Exceeds ROMDex’s 50 MB Viewing Limit. Open It in YouTrack.'),{status:413});chunks.push(chunk);}return {metadata:attachmentMetadata(item),bytes:Buffer.concat(chunks)};
 }
 async delete(id){await this.request(`issues/${id}`,{method:'DELETE'});}
 async writeEffectiveState(id,state,expectedAssigned,baseAssigned=expectedAssigned){
  const current=await this.require(id);
  if(expectedAssigned!==undefined&&!same(current.assignedState,expectedAssigned))throw new AssignedStatusConflict(baseAssigned,expectedAssigned,current);
  if(current.state===state)return current;
  await this.assignedStatuses.prepareWrite(id,state);
  await this.request(`issues/${id}`,{method:'POST',body:{customFields:this.customPayload({state},current)}});
  const after=await this.require(id);
  if(after.state!==state)throw new Error('YouTrack did not confirm the effective status.');
  await this.assignedStatuses.confirmWrite(id,state);return after;
 }
 async setAssignedState(id,value,expected){
  const all=await this.all(),current=all.find(x=>x.id===id);if(!current)throw new Error('The item no longer exists.');
  if(!same(current.assignedState,expected)&&!same(current.assignedState,value))throw new AssignedStatusConflict(expected,value,current);
  await this.assignedStatuses.assign(id,value);
  const tree=indexTree(all.map(x=>x.id===id?{...x,assignedState:value}:x));
  await this.writeEffectiveState(id,STATES[tree.colors.get(id)],value,current.assignedState);
 }
 async derivedStatuses(){
  const all=await this.all(),tree=indexTree(all),changes=[];
  for(const item of [...all].sort((a,b)=>tree.depths.get(b.id)-tree.depths.get(a.id))){const parent=(tree.children.get(item.id)||[]).length>0,state=parent?STATES[tree.colors.get(item.id)]:item.assignedState;if(item.state!==state){try{await this.writeEffectiveState(item.id,state,parent?undefined:item.assignedState);changes.push(item.id);}catch(error){if(!(error instanceof AssignedStatusConflict))throw error;}}}
  return changes;
 }
}
export function compareEdit(operation,remote){return reconcile(operation.base,operation.patch,remote);}
