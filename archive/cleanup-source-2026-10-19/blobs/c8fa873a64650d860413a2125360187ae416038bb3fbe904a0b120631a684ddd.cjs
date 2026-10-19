const fs=require('fs');
let template=fs.readFileSync('work/npcdex-template.html','utf8');
template=template.replace("'liveMappings','characterNames']","'liveMappings','characterNames','romReversalResolutions']");
fs.writeFileSync('work/npcdex-template.html',template);
let engine=fs.readFileSync('work/npcdex-change-engine.js','utf8');
engine=engine.replace("for(const feedback of entry.resolvedFeedback||[]){const current=data.annotations[feedback.key];if(!current||current.flag!==feedback.flag||current.note!==feedback.note)","for(const feedback of entry.resolvedFeedback||[]){const permitted=new Set(unitsFor(plan.target.type,plan.target.id,plan.target.townId).flatMap(u=>annotationKeys(u)));permitted.add(plan.target.type+':'+plan.target.id);const current=data.annotations[feedback.key];if(!permitted.has(feedback.key))throw Error('Cannot reconcile feedback outside this target: '+feedback.key);if(!current||current.flag!==feedback.flag||current.note!==feedback.note||!!current.critical!==!!feedback.critical)");
engine=engine.replace("for(const f of entry.resolvedFeedback||[])Object.assign(data.annotations[f.key],{flag:false,critical:false,note:'',testStatus:'unreviewed'});","for(const f of entry.resolvedFeedback||[]){const current=data.annotations[f.key];if(!current||current.flag!==f.flag||current.note!==f.note||!!current.critical!==!!f.critical)throw Error('Feedback changed during reconciliation.');Object.assign(current,{flag:false,critical:false,note:'',testStatus:'unreviewed'})}");
fs.writeFileSync('work/npcdex-change-engine.js',engine);
