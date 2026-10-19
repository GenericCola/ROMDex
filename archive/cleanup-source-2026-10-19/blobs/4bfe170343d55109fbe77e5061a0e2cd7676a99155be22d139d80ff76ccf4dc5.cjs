const fs=require('fs');let t=fs.readFileSync('outputs/npcdex-template.html','utf8'),ui=fs.readFileSync('outputs/npcdex-planning-ui.js','utf8');t=t.replace(/<label>Link to Existing NPC<select id="setting-identity"><\/select><\/label>/,'').replace(/<label id="shared-scene-field">[\s\S]*?<\/label>/,'');
ui=ui.replace(/\$\('setting-identity'\)\.innerHTML='';if\(characterType\)\{[\s\S]*?\}\.join\(''\)\}/,'');
// Remove the identity-picker population exactly between its setup and the next field.
const begin=ui.indexOf("$('setting-identity').innerHTML='';"),end=ui.indexOf("$('setting-critical').checked",begin);if(begin>=0)ui=ui.slice(0,begin)+ui.slice(end);
ui=ui.replace("$('setting-shared').value=plan?.sharedSceneHandling||'';",'').replace("$('shared-scene-field').classList.toggle('hidden',!characterType||!refs.sharedScenes.length);",'');
ui=ui.replace("const identity=$('setting-identity').value;if(object.identityByGender)object.identityByGender[gender]=identity;else object.identityId=identity;","const identity=characterIdentity(object);");
ui=ui.replace("if(type==='character'&&['UPDATE','REMOVE'].includes(intent)&&refs.sharedScenes.length&&!$('setting-shared').value)throw Error('Choose how shared scenes should be handled.');",'').replace("sharedSceneHandling:$('setting-shared').value,","sharedSceneHandling:'instructions',");
const link=ui.indexOf("$('setting-identity').onchange="),next=ui.indexOf("$('setting-critical').onchange=",link);if(link>=0)ui=ui.slice(0,link)+ui.slice(next);
fs.writeFileSync('outputs/npcdex-template.html',t);fs.writeFileSync('outputs/npcdex-planning-ui.js',ui);
let test=fs.readFileSync('work/test-iteration.cjs','utf8').replace("document.querySelector('#setting-identity:not([hidden])')||document.querySelector('#setting-shared:not([hidden])')","document.querySelector('#setting-identity')||document.querySelector('#setting-shared')");fs.writeFileSync('work/test-iteration.cjs',test);
