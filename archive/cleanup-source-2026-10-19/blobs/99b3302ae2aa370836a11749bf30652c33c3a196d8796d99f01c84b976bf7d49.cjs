const fs=require('fs');const file='outputs/npcdex-template.html';let text=fs.readFileSync(file,'utf8');
text=text.replace('for(const patch of correction.patches){\n      const current=readPath(trial,patch.path);',`for(const patch of correction.patches){
      if(patch.path.startsWith('/annotations/')){
        const key=pathParts(patch.path)[1],resolved=correction.resolved?.find(f=>f.key===key),latest=saved.annotations?.[key];
        if(resolved&&(!latest||latest.flag!==resolved.previous.flag||!!latest.critical!==!!resolved.previous.critical||latest.note!==resolved.previous.note))continue;
      }
      const current=readPath(trial,patch.path);`);
fs.writeFileSync(file,text);
