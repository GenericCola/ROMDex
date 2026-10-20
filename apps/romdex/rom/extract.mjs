import {canonical} from '../content/contracts.mjs';
import {requireRom,sha256} from './reader.mjs';
import {PROFILES} from './profiles.mjs';
import {inventoryHGSS,validateInventory} from './hgss.mjs';
import {createIdentityManifest} from './identities.mjs';
import {makeLocator} from './locators.mjs';
import {decodeMessage} from './messages.mjs';
import {scriptEntries,decodeScriptGraph,decodeLevelScripts,resolveScriptNumber,spriteReference} from './scripts.mjs';
import {readBTX,renderTexture,encodePNG} from './textures.mjs';
import {analyzeScriptState} from './script-state.mjs';

export async function extractHGSS(rom,{inventory=null,previousIdentities=null,headerIds=null,scope=null,progress=()=>{}}={}){
 inventory=inventory||await inventoryHGSS(rom,{progress});validateInventory(inventory);
 requireRom(inventory.source.sha256===(await rom.fingerprint()).sha256,'SOURCE_CHANGED','Extraction inventory belongs to another ROM.');
 const profile=PROFILES.find(p=>p.id===inventory.profile&&p.sha256===inventory.source.sha256);
 requireRom(profile,'UNSUPPORTED_BUILD','Extraction needs a reviewed source profile.');
 const selectedHeaders=headerIds||profile.candidateGroup.headers,maps=inventory.maps.filter(m=>selectedHeaders.includes(m.headerId));
 requireRom(maps.length>0&&maps.length===new Set(selectedHeaders).size,'INVALID_REFERENCE','The Selected Map Areas Differ from the ROM Catalog.');
 const identities=createIdentityManifest(inventory,{headerIds:selectedHeaders,previous:previousIdentities});
 const idByKey=new Map(identities.entries.map(e=>[e.key,e.id])),warnings=[],assets=new Map(),messageCache=new Map(),scriptCache=new Map(),graphs=new Map(),messages=new Map(),messageBanks=new Map();
 const sourcePin=inventory.source.sha256,member=(kind,id)=>rom.member(inventory.archives[kind].fileId,id);
 const locator=(kind,archive,id,offset,bytes,selectors={})=>makeLocator(rom,{kind,fileId:inventory.archives[archive].fileId,memberId:id,offset,bytes,selectors});
 const namespaceBytes=await rom.read(rom.header.arm9.offset+profile.scriptNamespaces.arm9Offset,profile.scriptNamespaces.count*6),namespaces=[];
 for(let i=0;i<profile.scriptNamespaces.count;i++){const at=i*6,row={minimum:namespaceBytes.readUInt16LE(at),scriptBank:namespaceBytes.readUInt16LE(at+2),messageBank:namespaceBytes.readUInt16LE(at+4)};requireRom(row.scriptBank<inventory.archives.scripts.members&&row.messageBank<inventory.archives.messages.members&&(i===0||row.minimum<namespaces[i-1].minimum),'INVALID_REFERENCE','Invalid shared-script namespace table.');namespaces.push(row);}
 const namespaceLocator=await makeLocator(rom,{kind:'source-document',sourceType:'arm9',offset:profile.scriptNamespaces.arm9Offset,bytes:namespaceBytes.length,selectors:{table:'script-namespaces'}});
 const semanticOwner=await rom.systemInfo('overlay',profile.textSemantics.overlay),menuLoad=await rom.read(semanticOwner.offset+profile.textSemantics.menuLoadOffset,8),standardTable=await rom.read(semanticOwner.offset+profile.textSemantics.standardBankOffset,8);
 requireRom(menuLoad.equals(Buffer.from([1,32,27,33,191,34,4,35])),'UNSUPPORTED','The native standard-menu message-bank load differs.');
 const textSemantics={menuMessageBank:menuLoad[4],standardMessageBanks:Array.from({length:4},(_,i)=>standardTable.readUInt16LE(i*2)),locators:[await makeLocator(rom,{kind:'source-document',sourceType:'overlay',overlayId:profile.textSemantics.overlay,offset:profile.textSemantics.menuLoadOffset,bytes:8,selectors:{role:'menu-message-bank-load'}}),await makeLocator(rom,{kind:'source-document',sourceType:'overlay',overlayId:profile.textSemantics.overlay,offset:profile.textSemantics.standardBankOffset,bytes:8,selectors:{table:'standard-message-banks'}})]};
 const readMessages=async bank=>{requireRom(Number.isInteger(bank)&&bank>=0&&bank<inventory.archives.messages.members,'INVALID_REFERENCE','Unknown message bank.');if(!messageCache.has(bank))messageCache.set(bank,await member('messages',bank));return messageCache.get(bank);};
 async function getMessage(bank,index){
  const key=bank+'/'+index;if(messages.has(key))return key;const bytes=await readMessages(bank),value=decodeMessage(bytes,index);
  value.locator=await locator('message','messages',bank,value.offset,value.bytes,{messageBank:bank,messageIndex:index});
  messages.set(key,{key,bank,...value});if(value.unknownCodes.length)warnings.push({code:'UNKNOWN_CHARACTERS',key,codes:value.unknownCodes});return key;
 }
 async function scriptBank(id){if(!scriptCache.has(id)){const bytes=await member('scripts',id);scriptCache.set(id,{bytes,table:scriptEntries(bytes)});}return scriptCache.get(id);}
 const queue=[],roots=[];
 function enqueue(context,origin){const key=[context.scriptBank,context.messageBank,context.entry].join('/');queue.push({...context,key});return {flow:key,...origin};}
 for(const map of maps){
  const context={scriptBank:map.scriptBank,messageBank:map.messageBank},bank=await scriptBank(map.scriptBank);
  // Include unbound local entry points, but do not claim that they are runtime reachable.
  for(let entry=0;entry<bank.table.entries.length;entry++)roots.push(enqueue({...context,entry},{kind:'local-entry',headerId:map.headerId,unbound:true}));
  for(const kind of ['overworlds','backgrounds','triggers'])for(const event of map.events[kind])roots.push(enqueue(resolveScriptNumber(event.scriptNumber,context,namespaces),{kind:'event',sourceId:idByKey.get('area/'+map.headerId+'/'+kind+'/'+event.index),headerId:map.headerId,eventKind:kind,eventIndex:event.index,scriptNumber:event.scriptNumber,...(kind==='triggers'?{predicate:{left:event.variable,right:event.expectedValue,operator:'equal'}}:{})}));
 }
 const areas=[];
 for(const map of maps){
  const levelBytes=await member('scripts',map.levelScriptBank),hooks=decodeLevelScripts(levelBytes);
  for(const hook of hooks){
   hook.locator=await locator('script','scripts',map.levelScriptBank,hook.offset,hook.bytes,{mapHeaderId:map.headerId,hookType:hook.type});
   for(const condition of hook.conditions||[]){
    condition.locator=await locator('script','scripts',map.levelScriptBank,condition.offset,condition.bytes,{mapHeaderId:map.headerId});
    roots.push(enqueue(resolveScriptNumber(condition.scriptNumber,{scriptBank:map.scriptBank,messageBank:map.messageBank},namespaces),{kind:'scene-hook',headerId:map.headerId,predicate:{left:condition.left,right:condition.right,operator:'equal'},locator:condition.locator}));
   }
   if(hook.scriptNumber!==undefined)roots.push(enqueue(resolveScriptNumber(hook.scriptNumber,{scriptBank:map.scriptBank,messageBank:map.messageBank},namespaces),{kind:'load-hook',headerId:map.headerId,hookType:hook.type,locator:hook.locator}));
  }
  const locationKey=await getMessage(279,map.locationSection);
  areas.push({sourceId:idByKey.get('area/'+map.headerId),headerId:map.headerId,internalName:map.internalName,locationSection:map.locationSection,locationMessage:locationKey,locator:map.locator,eventLocator:map.eventLocator,hooks,events:structuredClone(map.events)});
  const b=await readMessages(map.messageBank);messageBanks.set(map.messageBank,{bank:map.messageBank,count:b.readUInt16LE(0),sha256:sha256(b),scope:map.messageBank===3?'shared-bank':'local-bank'});
  // Preserve unused local text separately; a generic shared bank is never imported as map dialogue wholesale.
  if(map.messageBank!==3)for(let i=0;i<b.readUInt16LE(0);i++)await getMessage(map.messageBank,i);
 }
 const flowReferences=[],predicates=[],mutations=[],movements=[],nativeDependencies=new Map();
 while(queue.length){
  rom.check();const context=queue.pop();if(graphs.has(context.key))continue;
  requireRom(graphs.size<2048,'LIMIT','Shared script dependency budget exceeded.');
  const bank=await scriptBank(context.scriptBank),entry=bank.table.entries[context.entry];
  requireRom(entry!==undefined,'INVALID_REFERENCE','Script number selects a missing entry.',context);
  const graph=decodeScriptGraph(bank.bytes,[entry]),state=analyzeScriptState(graph,context.messageBank,textSemantics);graphs.set(context.key,{key:context.key,scriptBank:context.scriptBank,messageBank:context.messageBank,entry:context.entry,entryOffset:entry,...graph});
  for(const u of graph.unresolved)warnings.push({code:'SCRIPT_DECODE_INCOMPLETE',flow:context.key,...u});
  for(const row of graph.instructions){
   row.locator=await locator('script','scripts',context.scriptBank,row.offset,row.bytes,{scriptBank:context.scriptBank,scriptEntry:context.entry,opcode:row.opcode});
   const n=row.name,p=row.params;
   if(n==='GoToIf'||n==='CallIf')row.branchPredicate={condition:['less','equal','greater','less-or-equal','greater-or-equal','not-equal'][p[0]],comparison:state.at(row.offset).comparison,semantics:'Condition compares the VM result code: less=0, equal=1, greater=2. CheckFlag produces 0 or 1; equal means flag set.'};
   if(n==='CallStd'||n==='RunScript')flowReferences.push({from:context.key,offset:row.offset,kind:n,...enqueue(resolveScriptNumber(p[0],context,namespaces),{scriptNumber:p[0]}),locator:row.locator});
   if(n==='RestartCurrentScript')warnings.push({code:'SCRIPT_RESTART_CONTEXT',flow:context.key,offset:row.offset,reason:'Return to the invoking context is retained; not flattened as a new local script.'});
   row.messageReferences=[];
   if(['NPCMsg','NonNPCMsg','TrainerTips','DirectionSignpost'].includes(n))row.messageReferences.push({message:await getMessage(context.messageBank,p[0]),gender:'both',role:n.includes('Signpost')||n==='TrainerTips'?'sign':'dialogue'});
   if(n==='GenderMsgBox')for(const [i,gender]of ['male','female'].entries())row.messageReferences.push({message:await getMessage(context.messageBank,p[i]),gender,role:'dialogue'});
   if(n==='MsgBoxExtern'||n==='NonNPCMsgExtern'){
    const operands=p.map(v=>state.operand(row.offset,v));
    if(operands.every(v=>v.kind==='constant'))row.messageReferences.push({message:await getMessage(operands[0].value,operands[1].value),gender:'both',role:'dialogue'});
    else row.messageReferences.push({dynamic:true,bankOperand:p[0],indexOperand:p[1],reason:'Variable operands require caller/runtime state; source assignments and call edges are preserved.'});
   }
   if(['NPCMsgVar','NonNPCMsgVar','MenuItemAdd'].includes(n)){
    const index=state.operand(row.offset,p[0]),bank=n==='MenuItemAdd'?state.at(row.offset).menuBank:{kind:'constant',value:context.messageBank};
    if(index.kind==='constant'&&bank.kind==='constant')row.messageReferences.push({message:await getMessage(bank.value,index.value),gender:'both',role:n==='MenuItemAdd'?'menu-option':'dialogue'});
    else row.messageReferences.push({dynamic:true,kind:n,operands:p,reason:'Caller/runtime state is needed; no dialogue is guessed.'});
   }
   if(n==='TrainerMessage')row.messageReferences.push({dynamic:true,kind:n,operands:p,reason:'Trainer-specific messages are linked separately from the ROM trainer-message table.'});
   if(['CompareVarToValue','CompareVarToVar','CheckFlag','CheckFlagVar','CheckTrainerFlag','CheckBadge','GetPlayerGender','GetWeekday'].includes(n))predicates.push({flow:context.key,offset:row.offset,kind:n,operands:p,locator:row.locator});
   if(['SetFlag','ClearFlag','SetFlagVar','ClearFlagVar','SetTrainerFlag','ClearTrainerFlag','SetVar','CopyVar','AddVar','SubVar','GiveBadge','HidePerson','ShowPerson','SetObjectMovementType','SetObjectFacing','MovePerson'].includes(n))mutations.push({flow:context.key,offset:row.offset,kind:n,operands:p,locator:row.locator});
   if(n==='ApplyMovement'){
    let at=row.target,count=0,terminated=false;const steps=[];
    while(at>=0&&at+4<=bank.bytes.length&&count++<2048){const action=bank.bytes.readUInt16LE(at),duration=bank.bytes.readUInt16LE(at+2);steps.push({action,duration});at+=4;if(action===254){terminated=true;break;}}
    if(terminated)movements.push({flow:context.key,offset:row.offset,objectOperand:p[0],steps,locator:await locator('script','scripts',context.scriptBank,row.target,at-row.target,{scriptBank:context.scriptBank,role:'movement'})});
    else warnings.push({code:'UNRESOLVED_MOVEMENT',flow:context.key,offset:row.offset,target:row.target});
   }
   if(/^ScrCmd_\d+$/.test(n)||['ScriptOverlayCmd','TrainerBattle','PrimoPasswordCheck1','PrimoPasswordCheck2','VioletGymInit','VioletGymElevator','MysteryGift'].includes(n)){
    if(!nativeDependencies.has(n))nativeDependencies.set(n,{command:n,opcode:row.opcode,uses:0,semantics:'native behavior retained, not simulated or counted as understood'});
    nativeDependencies.get(n).uses++;
   }
  }
  progress({stage:'script-dependencies',completed:graphs.size});
 }
 // Trainer message associations are read from the ROM table, not stock dialogue or a prepared export.
 const trainerIds=new Set(roots.filter(r=>r.kind==='event'&&r.scriptNumber>=3000&&r.scriptNumber<7000).map(r=>r.scriptNumber-(r.scriptNumber>=5000?5000:3000)+1));
 for(const graph of graphs.values())for(const row of graph.instructions)if(row.name==='TrainerBattle'&&row.params[0]>0&&row.params[0]<0x4000)trainerIds.add(row.params[0]);
 const trainerDialogues=[],trainerTableFile=rom.fileInfo('a/0/5/7'),trainerOffsetsFile=rom.fileInfo('a/1/3/1'),trainerTable=await rom.member(trainerTableFile.fileId,0),trainerOffsets=await rom.member(trainerOffsetsFile.fileId,0);
 requireRom(trainerTable.length%4===0&&trainerOffsets.length%2===0,'INVALID','Invalid trainer message table sizes.');
 for(const trainerId of [...trainerIds].sort((a,b)=>a-b)){
  requireRom(trainerId*2+2<=trainerOffsets.length,'INVALID_REFERENCE','Trainer is absent from message-offset table.');
  const start=trainerOffsets.readUInt16LE(trainerId*2);requireRom(start<=trainerTable.length&&start%4===0,'BOUNDS','Invalid trainer message offset.');
  const entries=[];
  for(let at=start;at<trainerTable.length;at+=4){
   const id=trainerTable.readUInt16LE(at),type=trainerTable.readUInt16LE(at+2);if(id!==trainerId)break;
   entries.push({type,message:await getMessage(728,at/4),locator:await makeLocator(rom,{kind:'message',fileId:trainerTableFile.fileId,memberId:0,offset:at,bytes:4,selectors:{trainerId,messageType:type}})});
  }
  trainerDialogues.push({trainerId,entries,sourceIds:roots.filter(r=>r.kind==='event'&&r.scriptNumber>=3000&&r.scriptNumber<7000&&r.scriptNumber-(r.scriptNumber>=5000?5000:3000)+1===trainerId).map(r=>r.sourceId),battleSites:[...graphs.values()].flatMap(g=>g.instructions.filter(r=>r.name==='TrainerBattle'&&r.params[0]===trainerId).map(r=>({flow:g.key,offset:r.offset,locator:r.locator}))),offsetLocator:await makeLocator(rom,{kind:'source-document',fileId:trainerOffsetsFile.fileId,memberId:0,offset:trainerId*2,bytes:2,selectors:{trainerId}}),scope:'Trainer-associated candidates, not all necessarily used by this interaction'});
 }
 // ROM texture frames, including transparent pixels and exact palette indices.
 const spriteRows=new Map(inventory.spriteTable.rows.map(r=>[r.tableId,r])),appearances=[];
 for(const area of areas)for(const event of area.events.overworlds){
  const sourceId=idByKey.get('area/'+area.headerId+'/overworlds/'+event.index),reference=spriteReference(event.spriteTableId),appearance={sourceId,headerId:area.headerId,localId:event.localId,reference,orientation:event.orientation,visibility:{kind:'event-flag-clear',flag:event.visibilityFlag,zeroMeansUnconditional:true,locator:event.locator},assets:[]};
  appearances.push(appearance);
  if(reference.kind==='variable'){warnings.push({code:'DYNAMIC_SPRITE',sourceId,variable:reference.variable,reason:'Must derive the selected sprite from initialization/script state.'});continue;}
  const entry=spriteRows.get(reference.tableId);requireRom(entry,'INVALID_REFERENCE','Static sprite is absent from the reviewed table.',reference);
  appearance.spriteMember=entry.spriteMember;appearance.tableProperties=entry.properties;
  const raw=await member('sprites',entry.spriteMember),btx=readBTX(raw);appearance.locator=await locator('asset','sprites',entry.spriteMember,0,raw.length,{spriteTableId:reference.tableId});
  if(btx.palettes.length>1)warnings.push({code:'PALETTE_BINDING_REQUIRES_RUNTIME',sourceId,member:entry.spriteMember,palettes:btx.palettes.map(p=>p.name),reason:'All palette variants retained. No single runtime palette is guessed from its name.'});
  for(let i=0;i<btx.textures.length;i++){
   const texture=btx.textures[i];if(texture.unresolved){warnings.push({code:'UNSUPPORTED_TEXTURE',sourceId,...texture});continue;}
   for(let paletteIndex=0;paletteIndex<btx.palettes.length;paletteIndex++){
   const palette=btx.palettes[paletteIndex],png=encodePNG(renderTexture(texture,palette)),hash=sha256(png),name='assets/'+hash+'.png';
   if(!assets.has(name))assets.set(name,png);
   appearance.assets.push({path:name,sha256:hash,width:texture.width,height:texture.height,role:'source-texture-frame',textureIndex:i,textureName:texture.name,paletteIndex,paletteName:palette.name,paletteBinding:btx.palettes.length===1?'sole-palette':'runtime-candidate',pixelLocator:await locator('asset','sprites',entry.spriteMember,texture.offset,texture.bytes,{textureIndex:i}),paletteLocator:await locator('asset','sprites',entry.spriteMember,palette.offset,palette.bytes,{paletteIndex})});
   }
  }
 }
 const selectedFlows=new Set(roots.filter(r=>r.kind!=='local-entry').map(r=>r.flow)),dependencies=new Map();
 for(const link of flowReferences){if(!dependencies.has(link.from))dependencies.set(link.from,[]);dependencies.get(link.from).push(link.flow);}
 const frontier=[...selectedFlows];while(frontier.length){for(const key of dependencies.get(frontier.pop())||[])if(!selectedFlows.has(key)){selectedFlows.add(key);frontier.push(key);}}
 const localBanks=new Set(maps.map(m=>m.scriptBank)),persistentConditions=predicates.filter(p=>localBanks.has(Number(p.flow.split('/')[0]))&&(p.kind==='CheckFlag'||p.kind==='CheckBadge'||p.kind==='CompareVarToValue'&&p.operands[0]>=0x4040&&p.operands[0]<0x8000));
 const milestoneCandidates=persistentConditions.map(p=>({key:'predicate/'+p.flow+'/'+p.offset,kind:p.kind,operands:p.operands,flow:p.flow,locator:p.locator,ordering:'not established',label:null}));
 for(const root of roots.filter(r=>r.kind==='scene-hook'))milestoneCandidates.push({key:'scene/'+root.headerId+'/'+root.flow,kind:'scene-variable',predicate:root.predicate,headerId:root.headerId,flow:root.flow,locator:root.locator,ordering:'not established',label:null});
 for(const appearance of appearances)if(appearance.visibility.flag)milestoneCandidates.push({key:'visibility/'+appearance.sourceId,kind:'visibility-flag',sourceId:appearance.sourceId,flag:appearance.visibility.flag,locator:appearance.visibility.locator,ordering:'not established',label:null});
 const value={format:'ROMDexMapExtraction/1',adapter:inventory.adapter,profile:profile.id,source:inventory.source,inventoryDigest:inventory.digest,testbed:{key:scope?.key||profile.candidateGroup.key,name:scope?.name||'Violet City',regionName:scope?.regionName||'Johto',regionKey:scope?.regionKey||'johto',locationSection:maps[0].locationSection,headerIds:areas.map(a=>a.headerId),excludes:'Areas outside the selected map / zone group'},identities,namespaces:{rows:namespaces,locator:namespaceLocator},areas,roots,flows:[...graphs.values()].map(g=>({...g,boundToEventOrHook:selectedFlows.has(g.key)})),flowReferences,messages:[...messages.values()],messageBanks:[...messageBanks.values()],appearances,trainerDialogues,movements,predicates,mutations,timeline:{scope:'this-map-only',milestoneCandidates,stageLabels:'Roman numerals assigned after ordering is established in RI02T',warning:'Predicates can be independent or reversible. Do not impose a chronological order from numeric IDs or source order.'},nativeDependencies:[...nativeDependencies.values()],warnings,coverage:{readOnly:true,aiRequired:false,sourcePinned:true,branchRepresentation:'control-flow graph; possible branches, not proof of runtime reachability',localEntryCount:roots.filter(r=>r.kind==='local-entry').length,flowCount:graphs.size,messageCount:messages.size,appearanceCount:appearances.length,renderedAppearanceCount:appearances.filter(a=>a.assets.length).length,uniqueTexturePNGs:assets.size,unresolvedInstructionRanges:warnings.filter(w=>w.code==='SCRIPT_DECODE_INCOMPLETE').length,dynamicMessageSites:[...graphs.values()].reduce((n,g)=>n+g.instructions.filter(i=>i.messageReferences.some(r=>r.dynamic)).length,0),runtimeEmulated:false,rdxCompiled:false,cloudPublished:false}};
 value.textSemantics=textSemantics;value.digest=extractionDigest(value);await rom.assertUnchanged();return {extraction:value,assets};
}
export function extractionDigest(value){const copy={...value};delete copy.digest;return sha256(Buffer.from(canonical(copy)));}
export function validateExtraction(value){
 requireRom(value?.format==='ROMDexMapExtraction/1'&&value.digest===extractionDigest(value),'INTEGRITY','Extraction output changed or uses an unsupported format.');
 requireRom(value.identities?.sourceSHA256===value.source?.sha256&&value.testbed?.headerIds?.length===value.areas?.length,'INTEGRITY','Extraction source/area identities differ.');
 const keys=new Set(value.messages.map(m=>m.key));
 for(const flow of value.flows)for(const row of flow.instructions)for(const reference of row.messageReferences||[])if(reference.message)requireRom(keys.has(reference.message),'INVALID_REFERENCE','Script points to an omitted decoded message.');
 return value;
}
