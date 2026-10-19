const fs=require('fs');let s=fs.readFileSync('work/npcdex-template.html','utf8');
const fn=`function displayBlocks(p){const blocks=[];const nameOnly=new Set(['61-5-0-block-14','61-7-0-block-10']);for(const b of p.blocks){blocks.push(b);if(nameOnly.has(b.id)&&b.gender==='male'&&!p.blocks.some(x=>x.id===b.id+'-female'))blocks.push({...b,id:b.id+'-female',gender:'female',text:b.text.replace(/\\bLyra\\b/g,'Ethan')})}return blocks}\n`;
s=s.replace('function pages(p){',fn+'function pages(p){');
s=s.replace('for(const b of p.blocks){if(!visible(b))continue;', 'for(const b of displayBlocks(p)){if(!visible(b))continue;');
fs.writeFileSync('work/npcdex-template.html',s);const data=JSON.parse(fs.readFileSync('outputs/npcdex-data.json','utf8'));fs.writeFileSync('outputs/npcdex.html',s.replace('/*__NPCDEX_DATA__*/',JSON.stringify(data).replace(/</g,'\\u003c')));
