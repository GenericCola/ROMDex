export function isReadinessComment(op){return op.type==='comment'&&/^rdx-ready-[a-f0-9]{64}$/.test(op.opId)&&op.text.startsWith('[ROMDex Ready for Testing '+op.opId.slice(10)+']');}
export async function deliverReadinessComment(op,record,{comments,post,save}){
 if(!isReadinessComment(op))return null;
 const match=async()=>{const rows=(await comments()).filter(c=>c.text===op.text);if(rows.length>1)return {uncertain:true,message:'Duplicate Readiness Notices Need Review.'};if(rows.length===1){await save({status:'done',result:{}});return {};}return null;};
 const existing=await match();if(existing)return existing;
 if(record?.status==='running')return {uncertain:true,message:'The Readiness Notice May Already Have Been Posted. Review It Before Retrying.'};
 await save({status:'running'});await post(op.text);
 return await match()||{uncertain:true,message:'The Readiness Notice Awaits Exact Comment Readback. Review Before Retrying.'};
}
