import {same} from '../content/contracts.mjs';
import {ensure} from './limits.mjs';
const fail=(ok,message)=>ensure(ok,'REVIEW_REQUIRED',message);
const escape=s=>s.replaceAll('~','~0').replaceAll('/','~1');
export function currentDifferences(recordId,before,after){
 const changes=[];let nodes=0;
 const visit=(a,b,path)=>{fail(++nodes<=10000&&changes.length<41,'Returned Differences Exceed the Review Bound. Split the Package.');if(a.exists===b.exists&&(!a.exists||same(a.value,b.value)))return;
  if(a.exists&&b.exists&&a.value&&b.value&&typeof a.value==='object'&&typeof b.value==='object'&&!Array.isArray(a.value)&&!Array.isArray(b.value)){
   for(const key of [...new Set([...Object.keys(a.value),...Object.keys(b.value)])].sort())visit(Object.hasOwn(a.value,key)?{exists:true,value:a.value[key]}:{exists:false},Object.hasOwn(b.value,key)?{exists:true,value:b.value[key]}:{exists:false},path+'/'+escape(key));
  }else changes.push({recordId,path,before:a,after:b});
 };
 visit({exists:true,value:before},{exists:true,value:after},'');
 fail(changes.length<=40,'Returned Differences Exceed the Review Bound. Split the Package.');return changes;
}
export function prosePermits(plan,change){
 if(plan.changes.length||plan.target.recordId!==change.recordId)return false;
 if(change.path==='/lifecycle')return plan.intent==='REMOVE'&&change.after.exists&&change.after.value==='archived';
 if(!change.path.startsWith('/payload/'))return false;
 const target=plan.target;
 if(!target.pointId)return true;
 const prefix='/payload/points/'+escape(target.pointId)+'/';
 if(!change.path.startsWith(prefix))return false;
 if(!target.blockIds.length)return true;
 return target.blockIds.some(id=>change.path.startsWith(prefix+'blocks/'+escape(id)+'/'));
}
