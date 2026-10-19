import {same} from './contracts.mjs';

// Re-checking a saved form must not create a new publication of the same values.
// Build/validate the edit first: stale parents and changed scope still fail.
export function unchangedPlanningEdit(domain,command,edit){
 const identity=command.type==='plan'?'planId':command.type==='review'?'reviewId':null;
 if(!identity||!command[identity]||edit.artifacts.length!==1)return false;
 const next=edit.artifacts[0];if(next.parents.length!==1)return false;
 const prior=domain[command.type==='plan'?'plans':'reviews'].find(a=>a.digest===next.parents[0]);if(!prior)return false;
 const ignore=new Set(['operationId','createdAt','actorClaim','digest','parents','version']);
 const values=a=>Object.fromEntries(Object.entries(a).filter(([key])=>!ignore.has(key)));
 return same(values(prior),values(next));
}

// A recorded sending slot always requires readback/review, even on timeout.
export function publicationFailureState(op,error,signal){
 if(Object.values(op.slots).some(s=>s.state==='sending'))return 'uncertain';
 return signal?.aborted||['TimeoutError','AbortError'].includes(error.name)||['CONTENT_CHECKPOINT','CONTENT_CONNECTION','CONTENT_READ_CHECKPOINT'].includes(error.code)?'queued':'blocked';
}

// Older builds misclassified DOMException TimeoutError (23) as a hard failure.
// No slots means publication stopped before recording any remote write intent.
// Preserve the immutable operation, its descendants and the original evidence.
export function recoverPrewriteTimeouts(editor){
 let recovered=0;
 for(const op of editor.operations()){
  if(op.state!=='blocked'||op.errorCode!==23||op.error!=='The operation was aborted due to timeout'||!op.slots||Object.keys(op.slots).length)continue;
  editor.save({...op,state:'queued',error:null,errorCode:null,recovery:{kind:'legacy-prewrite-timeout',at:new Date(editor.now()).toISOString(),publication:op.publication.digest,prior:{state:op.state,error:op.error,errorCode:op.errorCode}}});
  recovered++;
 }
 return recovered;
}
