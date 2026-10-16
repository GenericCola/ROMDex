import fs from 'node:fs';const file='outputs/ROMDex/public/app.mjs';let s=fs.readFileSync(file,'utf8');
const needle="${detailId===item.id||workSelection.ids.has(item.id)?'selected':''}";if(!s.includes(needle))throw Error('Missing Row Selection Markup');s=s.replace(needle,'');
s=s.replace(" rows.querySelectorAll('[data-row]')", " $('rows').querySelectorAll('[data-row]')");fs.writeFileSync(file,s);
