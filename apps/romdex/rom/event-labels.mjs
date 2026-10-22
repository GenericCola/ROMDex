import '../content/condition-core.js';

// Labels are adapter presentation, not a simulated save or a story-order claim.
// On an unassessed build, require the event's write and identifying dialogue in
// the extracted flow. Numeric IDs alone never establish its narrative meaning.
export function sourceEventLabel(extraction,condition){
 const audited=globalThis.romdexConditions.eventInfo({sourceRomSha256:extraction.source.sha256},condition);
 if(audited)return {label:audited.name,locators:[]};
 const e=condition.expression,messages=new Map(extraction.messages.map(m=>[m.key,m.text]));
 const rules=[
  {op:'flag',id:'0x006A',write:'SetFlag',label:'After Receiving Your Starter',tests:[/received[\s\S]*from Professor Elm/i,/walking[\s\S]*Pokémon/i]},
  {op:'flag',id:'0x009C',write:'SetFlag',label:'After Receiving the Pokégear',tests:[/received[\s\S]*Pokégear/i]},
  {op:'flag',id:'0x00F2',write:'SetFlag',label:'After Receiving the S.S. Ticket',tests:[/S\.S\. Ticket/i]},
  {op:'flag',id:'0x00A7',write:'SetFlag',label:'After Discussing Your Adventure with Mom',tests:[/support you on your[\s\S]*adventure/i,/save some of it for you/i]},
  ...['0x01A4','0x01A5'].map(id=>({op:'flag',id,write:'SetFlag',label:'After the Catching Tutorial',tests:[/catch wild Pokémon/i,/Good luck/i]})),
  {op:'variable',id:'0x4106',write:'SetVar',value:1,label:e.compare==='eq'&&e.value===0?'Before Talking to Mom':e.compare==='eq'&&e.value===1?'After Talking to Mom':null,tests:[/finally awake/i,/Professor Elm/i]}
 ];
 for(const rule of rules){
  if(!rule.label||e.op!==rule.op||(e.flagId||e.variableId)!==rule.id)continue;
  for(const mutation of extraction.mutations.filter(m=>m.kind===rule.write&&m.operands[0]===Number(rule.id)&&(rule.value===undefined||m.operands[1]===rule.value))){
   const flow=extraction.flows.find(f=>f.key===mutation.flow),text=(flow?.instructions||[]).flatMap(r=>(r.messageReferences||[]).filter(ref=>['dialogue','sign'].includes(ref.role)).map(ref=>messages.get(ref.message)||'')).join('\n');
   if(rule.tests.every(test=>test.test(text)))return {label:rule.label,locators:[mutation.locator,...(flow.instructions||[]).filter(r=>r.messageReferences?.length).map(r=>r.locator)].filter(Boolean)};
  }
 }
 return null;
}
