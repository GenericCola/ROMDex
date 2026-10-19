const fs=require('fs');
const path=require('path');
const out=path.resolve('outputs');fs.mkdirSync(out,{recursive:true});
const guide=fs.readFileSync('C:/Users/mrgen/Downloads/new_bark_town_dialogue_guide.md','utf8').replace(/\r/g,'');
const reference=fs.readFileSync('C:/Users/mrgen/Downloads/new_bark_town_content_map.md','utf8').replace(/\r/g,'');
const index={};for(const line of reference.split('\n')){if(/^\| (NBT|GLB)-/.test(line)){const c=line.split('|').slice(1,-1).map(x=>x.trim());index[c[0]]={type:c[1],area:c[2],speaker:c[3],trigger:c[4],condition:c[5],source:c[6]};}}
const stages=[['A','New game','Before Mom’s welcome'],['B','First steps','After Mom’s welcome'],['C','Elm’s research','Enter the lab; choose a starter'],['D','First Pokémon','Starter received; no Pokégear'],['E','The errand','Pokégear received; Elm’s phone number'],['F','Return home','Return from Mr. Pokémon'],['G','Violet City','Probably after the Gym / related events'],['H','Eight badges','Probably after Dragon’s Den'],['I','Legendary visits','Probably after Bell Tower / Whirl Islands'],['J','Hall of Fame','After beating the Pokémon League']].map(([id,name,event])=>({id,name,event}));
const names={'60':['Town exterior','T20'],'61':['Elm’s lab','T20R0101'],'62':['Woman & child’s house','T20R0102'],'63':['Your house · downstairs','T20R0201'],'64':['Your room · upstairs','T20R0202'],'65':['Small house','T20R0301'],'66':['Street house · downstairs','T20R0401'],'384':['Street house · upstairs','T20R0402']};
const areas=Object.entries(names).map(([id,[name,code]])=>({id,name,code,elements:[]}));areas.push({id:'shared',name:'Shared prompts',code:'Global messages',elements:[]},{id:'unused',name:'Unused / unreachable',code:'Reference only',elements:[]});
function timing(s){const result=[];for(const m of s.matchAll(/stages? ([A-J])(?:\s*(?:to|and)\s*([A-J]))?/gi)){const a=m[1].toUpperCase(),b=m[2]?.toUpperCase();if(b){for(let i=a.charCodeAt(0);i<=b.charCodeAt(0);i++)result.push(String.fromCharCode(i));}else result.push(a);}if(/stage [A-J] onward/i.test(s)){const a=s.match(/stage ([A-J]) onward/i)[1].toUpperCase();for(let i=a.charCodeAt(0);i<=74;i++)result.push(String.fromCharCode(i));}if(/any time|every time|always shows|each always/.test(s)&&!result.length)return ['all'];return [...new Set(result)];}
let area=null,entity=null;
for(const section of guide.split(/(?=^## )/m)){
 const title=section.match(/^## (.+)/)?.[1];if(!title)continue;
 if(title==='Generic messages used here')area=areas.find(a=>a.id==='shared');else if(title==='Unused or unreachable')area=areas.find(a=>a.id==='unused');else {const code=title.match(/T20R\d+/)?.[0];area=title==='The town outside'?areas[0]:areas.find(a=>a.code===code);}
 if(!area)continue;
 const subs=section.split(/(?=^### )/m);if(area.id==='unused'&&subs.length===1)subs.push('### Unused dialogue\n'+section.replace(/^## .*\n/,''));
 for(const sub of subs){const name=sub.match(/^### (.+)/)?.[1];if(!name)continue;const body=sub.replace(/^### .*\n/,'');const events=[...new Set(body.match(/NBT-EVT-[\w-]+/g)||[])];const chunks=body.split(/(?=^\*\*When:\*\*)/m);const pre=chunks[0].startsWith('**When:**')?'':chunks.shift();const points=[];
 for(const chunk of chunks.length?chunks:[body]){if(!chunk.trim())continue;const condition=chunk.match(/^\*\*When:\*\* ([^\n]+)/)?.[1]||'See documented conditions below.';const ids=[...new Set(chunk.match(/(?:NBT-DLG|GLB-PRM)-[\w-]+/g)||[])];let ts=timing(condition);if(!ts.length&&/same period/.test(condition))ts=['H','I'];const blocks=[];let q=[];function flush(){if(q.length){blocks.push({type:'dialogue',text:q.join('\n')});q=[];}}for(const l of chunk.split('\n')){if(l.startsWith('>'))q.push(l.replace(/^> ?/,''));else{flush();if(l.trim()&&!/^\*\*When:/.test(l)&&!/^\[(?:NBT|GLB)-/.test(l))blocks.push({type:'note',text:l});}}flush();points.push({id:area.id+'-'+area.elements.length+'-'+points.length,condition,stages:ts,ids,blocks,uncertain:/probably|not confirmed|could not|unconfirmed/i.test(condition+' '+pre),evidence:ids.map(id=>({id,...index[id]}))});}
 if(!points.length)points.push({id:area.id+'-'+area.elements.length+'-silent',condition:pre,stages:timing(pre),ids:[],blocks:[{type:'note',text:pre}],uncertain:/probably|not confirmed/i.test(pre),evidence:[]});
 area.elements.push({id:area.id+'-'+area.elements.length,name,events,context:pre,points});
 }
}
const data={version:1,towns:[{id:'new-bark-town',name:'New Bark Town',subtitle:'Winds of a New Beginning',areas}],stages,index,sources:['new_bark_town_dialogue_guide.md','new_bark_town_content_map.md']};
fs.writeFileSync(path.join(out,'dialogue-data.json'),JSON.stringify(data,null,2));
let html=fs.readFileSync(path.resolve('work/template.html'),'utf8').replace('/*__DATA__*/',JSON.stringify(data).replace(/</g,'\\u003c'));
fs.writeFileSync(path.join(out,'dialogue-journey.html'),html);
fs.copyFileSync('C:/Users/mrgen/Downloads/new_bark_town_dialogue_guide.md',path.join(out,'new_bark_town_dialogue_guide.md'));fs.copyFileSync('C:/Users/mrgen/Downloads/new_bark_town_content_map.md',path.join(out,'new_bark_town_content_map.md'));
console.log(JSON.stringify({areas:areas.length,elements:areas.reduce((n,a)=>n+a.elements.length,0),points:areas.reduce((n,a)=>n+a.elements.reduce((s,e)=>s+e.points.length,0),0),indexed:Object.keys(index).length}));
