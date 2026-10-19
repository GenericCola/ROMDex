const fs=require('fs');let s=fs.readFileSync('work/npcdex-template.html','utf8');s=s.replace('.message-scroll{max-height:clamp(130px,21vh,240px);', '.message-scroll{height:clamp(80px,12vh,145px);');
s=s.replace('function setGender(value){flushNote();','function setGender(value){data.preferences=data.preferences||{};flushNote();');
s=s.replace("data.preferences.gender=gender;data.savedAt=", "data.preferences=data.preferences||{};data.preferences.gender=gender;data.savedAt=");
fs.writeFileSync('work/npcdex-template.html',s);const data=JSON.parse(fs.readFileSync('outputs/npcdex-data.json','utf8'));fs.writeFileSync('outputs/npcdex.html',s.replace('/*__NPCDEX_DATA__*/',JSON.stringify(data).replace(/</g,'\\u003c')));
