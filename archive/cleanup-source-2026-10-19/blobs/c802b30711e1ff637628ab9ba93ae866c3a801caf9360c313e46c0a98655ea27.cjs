const fs=require('fs');let t=fs.readFileSync('outputs/npcdex-template.html','utf8');
t=t.replace('if(!loc&&!data.preferences?.sortBySubArea)','if((!loc||loc.areaIds.length>1&&!roomAreaId)&&!data.preferences?.sortBySubArea)');
t=t.replace("scopeOverride=null;render()}else if(type==='location')","scopeOverride=null;render();$('groups').scrollTop=0}else if(type==='location')");
t=t.replace("reviewEntryKey=null;scopeOverride=null;render()}else if(type==='area')","reviewEntryKey=null;scopeOverride=null;render();$('groups').scrollTop=0}else if(type==='area')");
t=t.replace("reviewEntryKey=null;scopeOverride=null;render()}else{selected=","reviewEntryKey=null;scopeOverride=null;render();$('groups').scrollTop=0}else{selected=");
fs.writeFileSync('outputs/npcdex-template.html',t);fs.writeFileSync('work/npcdex-template.html',t);
