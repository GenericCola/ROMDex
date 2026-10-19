const fs=require('fs');let e=fs.readFileSync('outputs/npcdex-change-engine.js','utf8');
e=e.replace('function statusFor(type,id,t=townId){',"function indicatorScope(type,t=townId){return t===townId&&['character','element','point','prompt'].includes(type)?scopedAreaIds():null}\nfunction scopedReviewUnits(type,id,t=townId){const scope=indicatorScope(type,t),units=unitsFor(type,id,t);return scope?units.filter(u=>u.areaIds.length?u.areaIds.some(id=>scope.includes(id)):scope.includes(u.sourceAreaId)):units}\nfunction statusFor(type,id,t=townId){");
e=e.replace('units=unitsFor(type,id,t),keys=', 'units=scopedReviewUnits(type,id,t),keys=');
e=e.replace('const units=unitsFor(type,id,t),values=', 'const units=scopedReviewUnits(type,id,t),values=');
e=e.replace("shared:e.kind==='scene'","shared:raw.sharedScene??(e.kind==='scene'&&(!Array.isArray(raw.participantIds)||raw.participantIds.length>1))");
fs.writeFileSync('outputs/npcdex-change-engine.js',e);fs.writeFileSync('work/npcdex-change-engine.js',e);
