import {sha,same} from '../content/contracts.mjs';
import {mapDomain} from './map-import.mjs';
import {validateUpdateMetadata} from '../rom/update-contract.mjs';
import {ensure} from './limits.mjs';


function organizationAuthority(maps,key,value){
 const proof=maps.get('organization-authority:'+key),extension=value.document.extensions?.['org.romdex.npcdex.organization'];if(!proof||extension?.reviewToken!==proof.token||!maps.store.knownPrior(maps.store.row(key),proof.revision))return false;
 const current=new Map(mapDomain(value).records.map(r=>[r.recordId,r]));return proof.parents.every(p=>current.get(p.recordId)?.parentRecordId===p.parentRecordId);
}

export function installReviewedParentMoves(Cloud){Object.assign(Cloud.prototype,{
 planParentMoves(key,s,records,domain,native){if(s.intent.parentMoves)return;const moves=[];for(const r of domain.records){const issueId=records.get(r.recordId).issueId,pin=native.find(p=>p.issueId===issueId),parent=r.parentRecordId?records.get(r.parentRecordId)?.issueId:null;ensure(pin&&(!r.parentRecordId||parent),'INTEGRITY','A Native Parent Binding Is Missing.');if(pin.parentIssueId!==parent)moves.push({recordId:r.recordId,issueId,before:pin,parentIssueId:parent,parentRecordId:r.parentRecordId,slot:{},done:false});}if(moves.length){const v=this.maps.store.load(key,s.intent.revision);ensure(validateUpdateMetadata(v.document,v.blobs)||organizationAuthority(this.maps,key,v),'REVIEW_REQUIRED','Native Parent Changes Require a Reviewed ROM Update.');ensure(typeof this.transport.reparent==='function','UNSUPPORTED','The Backend Cannot Apply Reviewed Parent Moves.');}s.intent.parentMoves=moves;this.save(key,s);},
 async resumeParentMoves(key,s){const pending=s.intent?.parentMoves?.filter(m=>!m.done)||[];if(!pending.length)return;const v=this.maps.store.load(key,s.intent.revision),x=validateUpdateMetadata(v.document,v.blobs)||organizationAuthority(this.maps,key,v),domain=mapDomain(v),records=new Map(s.intent.records.map(r=>[r.recordId,r.issueId]));ensure(x&&typeof this.transport.reparent==='function','INTEGRITY','Missing Reviewed Parent-Move Authority.');for(const move of pending){const record=domain.records.find(r=>r.recordId===move.recordId);ensure(record&&records.get(record.recordId)===move.issueId&&record.parentRecordId===move.parentRecordId&&(record.parentRecordId?records.get(record.parentRecordId):null)===move.parentIssueId,'INTEGRITY','A Frozen Parent Move Changed.');const pin=await this.transport.reparent(sha(v.document.datasetId),move.recordId,move.issueId,move.parentRecordId,move.parentIssueId,move.before,move.slot,()=>this.save(key,s));move.done=true;move.after=pin;if(s.native)s.native=s.native.map(p=>p.issueId===pin.issueId?pin:p);this.save(key,s);}}
});}
