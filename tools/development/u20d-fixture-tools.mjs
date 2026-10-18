import path from 'node:path';import {pathToFileURL} from 'node:url';
export async function fixtureTools(context){
 const {api,state,save,root,assert}=context,{seal,sha}=await import(pathToFileURL(path.join(root,'outputs/ROMDex/content/contracts.mjs')));
 const registry=state.issues.registry,issueById=id=>{const issue=Object.values(state.issues).find(i=>i.id===id);assert(issue);return issue;};
 async function object(key,issueId,bytes){const chunks=[];for(let i=0;i<bytes.length;i+=512*1024){const chunk=bytes.subarray(i,i+512*1024),uploaded=await api.upload(key+'-'+i,issueById(issueId),chunk,'object-'+sha(chunk).slice(0,24)+'.bin');chunks.push({issueId,attachmentId:uploaded.id,sha256:uploaded.sha256,bytes:uploaded.bytes});}return {sha256:sha(bytes),bytes:bytes.length,chunks};}
 async function publish(key,{kind,parent=null,artifacts,assets=[],resultDigest=null,baseRevisions=[]}){
  const operationId='fixture:u20d-'+key,pub=seal({schema:'NPCDexPublication/1',workspaceId:'fixture:workspace',operationId,createdAt:'2026-10-17T12:00:00.000Z',actorClaim:'fixture:owner',publicationId:operationId,kind,parentPublications:parent?[parent]:[],artifactDigests:artifacts.map(a=>a.revisionId||a.digest),baseRevisions,resultDigest,groupId:null}),bindings=state.content.bindings;
  const publication=await object(key+'-publication',registry.id,Buffer.from(JSON.stringify(pub))),artifactRefs=[];
  for(let i=0;i<artifacts.length;i++){const a=artifacts[i],issueId=bindings.find(b=>b.recordId===(a.recordId||a.target?.recordId))?.issueId||registry.id;artifactRefs.push({digest:a.revisionId||a.digest,object:await object(key+'-artifact-'+i,issueId,Buffer.from(JSON.stringify(a)))});}
  const assetRefs=[];for(let i=0;i<assets.length;i++){const a=assets[i];assetRefs.push({assetId:a.assetId,mime:a.mime,object:await object(key+'-asset-'+i,registry.id,a.bytes)});}
  const nativeMetadata=[];for(const issue of Object.values(state.issues)){const value=await api.requireFixture(issue.id),parents=value.links.filter(l=>l.direction==='INWARD'&&l.linkType.name==='Subtask').flatMap(l=>l.issues.map(i=>i.id));assert(parents.length<=1);const comments=await api.list('/api/issues/'+issue.id+'/comments?fields=id,text,updated,author(id)');const fingerprint=comments.map(c=>({id:c.id,text:c.text,updated:c.updated??null,authorId:c.author?.id??null})).sort((a,b)=>a.id.localeCompare(b.id));nativeMetadata.push({issueId:issue.id,summary:value.summary,parentIssueId:parents[0]||null,descriptionSha256:sha(value.description||''),commentsSha256:sha(JSON.stringify(fingerprint))});}
  const carrier=seal({schema:'NPCDexCarrier/1',workspaceId:'fixture:workspace',operationId,publication,artifacts:artifactRefs,assets:assetRefs,bindings,nativeMetadata});
  const manifest=await api.upload(key+'-manifest',registry,Buffer.from(JSON.stringify(carrier)),'npcdex-publication.json');await save();return {pub,carrier,manifest};
 }
 return {publish,seal,sha};
}
