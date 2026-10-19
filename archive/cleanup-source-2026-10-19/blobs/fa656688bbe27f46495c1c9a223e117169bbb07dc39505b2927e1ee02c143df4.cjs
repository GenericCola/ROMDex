const fs=require('fs');let s=fs.readFileSync('work/npcdex-template.html','utf8');
s=s.replace("(['unused'].includes(a?.id)?'unverified':!parts.length?'indeterminate':'documented')", "(a?.id==='unused'?'unverified':e?.id==='shared-3'||!parts.length?'indeterminate':'documented')");
s=s.replace("&&explicit?.description)label+=' — '+status", "&&explicit)label+=' — '+status");
fs.writeFileSync('work/npcdex-template.html',s);
const data=JSON.parse(fs.readFileSync('outputs/npcdex-data.json','utf8'));fs.writeFileSync('outputs/npcdex.html',s.replace('/*__NPCDEX_DATA__*/',JSON.stringify(data).replace(/</g,'\\u003c')));
