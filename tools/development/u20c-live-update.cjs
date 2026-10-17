const fs=require('node:fs/promises'),path=require('node:path'),{pathToFileURL}=require('node:url');
require('./u20c-live-support.cjs').start(async context=>{
 const {state,save,root,report,assert}=context;assert(state.content.readProcesses?.baseline);const {fixtureTools}=await import(pathToFileURL(path.join(root,'work/u20c-fixture-tools.mjs'))),{publish,seal}=await fixtureTools(context);
 const correction=JSON.parse(await fs.readFile(path.join(root,'outputs/U20A-Contracts/examples/documentation-correction.json'),'utf8')),pkg=JSON.parse(await fs.readFile(path.join(root,'outputs/U20A-Contracts/examples/map-package.json'),'utf8'));
 const before=pkg.recordSnapshots.find(r=>r.recordId==='fixture:scene'),after=structuredClone(before);after.operationId='fixture:u20c-scene-documentation';after.parents=[before.revisionId];after.current.payload.name='Greeting Scene (Documented)';const sealed=seal(after);
 correction.operationId='fixture:u20c-correction';correction.correctionId='fixture:u20c-correction';correction.recordUpdates.push({before:{recordId:before.recordId,revisionId:before.revisionId},after:sealed});if(!correction.readSet.some(r=>r.recordId===before.recordId))correction.readSet.push({recordId:before.recordId,revisionId:before.revisionId});
 const document=seal(correction);state.content.update=await publish('correction',{kind:'correction',parent:state.content.seed.pub.digest,artifacts:[document,...document.recordUpdates.map(u=>u.after)],resultDigest:document.digest,baseRevisions:document.readSet});
 state.content.update.expected={guideText:document.recordUpdates[0].after.current.payload.points['fixture:point-guide'].blocks['fixture:block-guide'].text,sceneName:sealed.current.payload.name};state.stage='correction-published';await save();
 report.checks.push({label:'Two-record synthetic documentation correction published, manifest last',records:2,publication:state.content.update.pub.digest,actualROMModified:false,agentDispatched:false});
});
