const fs=require('fs');let s=fs.readFileSync('work/template.html','utf8');
s=s.replace('<div id="areas" class="areas"></div>','<label class="mobile-area" for="mobile-area">Sub-area<select id="mobile-area"></select></label><div id="areas" class="areas"></div>');
s=s.replace('aside{padding:24px','.mobile-area{display:none}aside{padding:24px');
s=s.replace('.timeline{position:sticky;left:0;padding:12px}', '.timeline{position:fixed;left:0;padding:12px}.areas{display:none}.mobile-area{display:block;color:var(--muted);font-size:12px}.mobile-area select{display:block;width:100%;margin-top:6px}main{padding-bottom:240px}');
s=s.replace('function render(){const t=town();',`function render(){const t=town();$('mobile-area').innerHTML='<option value="">Town overview</option>'+t.areas.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.name)+'</option>').join('');$('mobile-area').value=areaId||'';$('mobile-area').onchange=()=>{if($('mobile-area').value)selectArea($('mobile-area').value);else{areaId=null;render()}};`);
fs.writeFileSync('work/template.html',s);
