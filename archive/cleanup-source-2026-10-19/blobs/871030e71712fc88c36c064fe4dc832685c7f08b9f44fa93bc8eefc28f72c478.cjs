const fs=require('fs');
const data=JSON.parse(fs.readFileSync('outputs/dialogue-data.json','utf8'));
data.sourceBaseline=structuredClone(data);
data.provenance={sourceSchemaVersion:1,sourceFiles:['new_bark_town_dialogue_guide.md','new_bark_town_content_map.md'],reconciliation:'Canonical event, element, point, dialogue and technical source IDs are preserved. Annotations and character links are additive.'};
data.version=2;data.app='NPCDex';data.annotations={};data.preferences={gender:'male'};
const t=data.towns[0];
t.locations=[
 {id:'exterior',name:'Outdoors',areaIds:['60']}, {id:'lab',name:'Elm’s lab',areaIds:['61']},
 {id:'family-house',name:'Woman & child’s house',areaIds:['62']},
 {id:'player-house',name:'Player’s house',areaIds:['63','64']},
 {id:'small-house',name:'Small house',areaIds:['65']},
 {id:'street-house',name:'Street house',areaIds:['66','384']},
 {id:'shared',name:'Shared prompts',areaIds:['shared']}, {id:'unused',name:'Unused / unreachable',areaIds:['unused']}
];
const actors=[
 ['elm','Professor Elm',['61-0','61-1','61-11'],['60-4','61-5','61-7']],
 ['aide','Elm’s aide',['61-3','61-6','61-12'],[]],
 ['friend','Your friend',['60-7','60-8','384-0'],['60-0','60-2','60-9','61-5','61-7']],
 ['marill','Marill',['384-1'],['60-0','60-2','60-9']],
 ['officer','Officer',[],['61-5']],
 ['mom','Mom',['60-6','63-0','63-1','63-2'],[]],
 ['rival','Person by the lab (probably rival)',['60-1'],[]],
 ['west-person','West-side resident',['60-3'],['60-4']],
 ['south-person','South-side resident',['60-5'],[]],
 ['cameron','Cameron',['60-10','shared-2'],[]],
 ['woman','Woman (probably Elm’s wife)',['62-0'],[]],
 ['child','Child',['62-1'],[]],
 ['small-resident','Small-house resident',['65-0'],[]],
 ['street-resident','Street-house resident',['66-0'],[]]
];
t.characters=actors.map(([id,name,elementIds,sceneIds])=>({id:'actor-'+id,name,elementIds,sceneIds,gender:'both',...(id==='friend'?{nameByGender:{male:'Lyra',female:'Ethan'}}:{})}));
const multi=new Set(actors.flatMap(a=>a[3]));
for(const a of t.areas){a.floor=a.id==='63'||a.id==='66'?'Floor 1 · Downstairs':a.id==='64'||a.id==='384'?'Floor 2 · Upstairs':a.name;for(const e of a.elements){e.kind=multi.has(e.id)?'scene':'element';e.gender='both';for(const p of e.points){
 // Correct explicit span boundaries; mentions of absence are not availability stages.
 if(e.id==='60-1')p.stages=[...'ABCDE'];
 if(e.id==='60-3'&&p.id.endsWith('-2'))p.stages=[...'EFGHIJ'];
 if(e.id==='61-8')p.stages=['all'];
 const result=[];
 for(let i=0;i<p.blocks.length;i++){
  const b=p.blocks[i];b.id=p.id+'-block-'+i;b.gender='both';
  if(b.type==='dialogue'){
   if(/\bLyra\b/.test(b.text))b.gender='male';else if(/\bEthan\b/.test(b.text))b.gender='female';
   // The guide sometimes prints a shared-name-only pair just once.
   const hasOpposite=p.blocks.some(x=>x.type==='dialogue'&&/\bEthan\b/.test(x.text));
   if(b.gender==='male'&&!hasOpposite){result.push(b,{...b,id:b.id+'-female',gender:'female',text:b.text.replace(/\bLyra\b/g,'Ethan')});continue;}
  }else if(/^\((boy|girl) player/.test(b.text))b.gender=b.text.startsWith('(boy')?'male':'female';
  result.push(b);
 }
 p.blocks=result;
}}
}
data.annotationFormat={keys:'town:id, location:id, area:id, character:id, element:id, point:id, entry:block-id:page-number',fields:['flag','note','testStatus','context'],testStatuses:['unreviewed','verified','inaccessible']};
fs.writeFileSync('outputs/npcdex-data.json',JSON.stringify(data,null,2));
const html=fs.readFileSync('work/npcdex-template.html','utf8').replace('/*__NPCDEX_DATA__*/',JSON.stringify(data).replace(/</g,'\\u003c'));
fs.writeFileSync('outputs/npcdex.html',html);
console.log('Built NPCDex v2: '+t.characters.length+' characters, '+t.locations.length+' location groups.');
