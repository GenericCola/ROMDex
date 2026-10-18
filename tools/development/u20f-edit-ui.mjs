import fs from 'node:fs/promises';
async function replace(file,from,to){const text=await fs.readFile(file,'utf8');if(!text.includes(from)||text.indexOf(from)!==text.lastIndexOf(from))throw Error('Expected one target '+file+' '+from.slice(0,50));await fs.writeFile(file,text.replace(from,to));}
const base='outputs/ROMDex/content/';
await replace(base+'editor-ui.js',"selectedId=preset?.recordId||legacyRecord?.recordId||selected?.id",`requestedLegacy=preset?.legacy,requestedRecord=requestedLegacy&&context.records.find(r=>requestedLegacy.type==='character'?r.kind==='profile'&&r.legacyData?.sourceCharacters?.some(x=>x.townId===townId&&x.character.id===requestedLegacy.id):r.legacyData?.legacyTownId===townId&&(requestedLegacy.type==='town'?r.legacyData?.sourceTown&&requestedLegacy.id===townId:requestedLegacy.type==='location'?r.legacyData?.legacyLocationId===requestedLegacy.id:r.legacyData?.legacyElementId===requestedLegacy.id)),selectedId=preset?.recordId||requestedRecord?.recordId||legacyRecord?.recordId||selected?.id`);
await replace(base+'editor-ui.js',"r.current.payload.points[values.pointId].blocks[values.blockId].text", "(r.current.payload.points?r.current.payload:r.current.payload.definitions).points[values.pointId].blocks[values.blockId].text");
await replace(base+'editor-ui.js',"window.romdexContentEditor={openRecovery", "window.romdexContentEditor={open:(type,preset)=>open(type,false,preset),openRecovery");
await replace(base+'editor-ui.js',"for(const review of context.review||[])form.append(make('p',review.message+(review.issueId?' · '+review.issueId:'')));",`for(const review of context.review||[])form.append(make('p',review.message+(review.issueId?' · '+review.issueId:'')));
  const native=(context.review||[]).filter(r=>r.kind==='native-metadata-changed');
  if(native.length&&native.length===context.review.length&&!context.operations.length){
   form.append(make('p','Review All Native Changes Together. Adopting a Title Corrects Documentation Only. Comments and Description Changes Remain Ticket Context, Not ROM Content. Parent Moves and Technical Records Require a Validated Update or Restoration in YouTrack.'));
   const decisions=[];
   for(const review of native){
    const record=context.records.find(r=>r.recordId===review.recordId),section=make('section');form.append(section);const outer=form;form=section;
    section.append(make('h3',record?.current.payload.name||review.issueId),make('pre',JSON.stringify({before:review.before,observed:review.observed},null,2)));
    const choice=field('native-choice:'+review.issueId,'Recorded Content Name','','select');choice.append(option('keep','Keep the Current Content Name'));if(review.before.summary!==review.observed.summary)choice.append(option('adopt','Adopt the Reviewed YouTrack Title'));
    const reason=field('native-reason:'+review.issueId,'Review Reason'),evidence=field('native-evidence:'+review.issueId,'Source Evidence','','textarea'),shared=field('native-shared:'+review.issueId,'I Have Reviewed the Shared Character Scope');shared.type='checkbox';shared.className='editor-checkbox';shared.closest('label').hidden=record?.kind!=='profile';
    decisions.push({review,choice,reason,evidence,shared});form=outer;
   }
   button('Save Reviewed Native Changes',async()=>{try{await api('/api/recover',{action:'native',expectedHead:context.head,reviews:decisions.map(d=>({issueId:d.review.issueId,observed:d.review.observed,adoptTitle:d.choice.value==='adopt',reason:d.reason.value,evidence:d.evidence.value,sharedAcknowledged:d.shared.checked}))});dialog.close();await window.romdexContentPreview.refresh(true);}catch(e){message(e.message);}});
  }`);
await replace(base+'preview.js',"if(event.target.closest(mutable)){event.preventDefault();event.stopImmediatePropagation();}",`const settings=event.target.closest('[data-settings-type]');if(settings&&window.romdexContentEditor){event.preventDefault();event.stopImmediatePropagation();window.romdexContentEditor.open('definition',{legacy:{type:settings.dataset.settingsType,id:settings.dataset.settingsId}});return;}if(event.target.closest(mutable)){event.preventDefault();event.stopImmediatePropagation();}`);
await replace(base+'preview.js',"el.disabled=true;el.title='Use the Content Editing Controls Below';el.setAttribute('aria-disabled','true');",`const settings=el.matches('[data-settings-type]');el.disabled=!settings;el.title=settings?'Edit Recorded Content; Proposed ROM Changes Use Plan Changes':'Use the Content Editing Controls Below';el.setAttribute('aria-disabled',String(!settings));`);
// Hide obsolete mutation forms rather than displaying disabled duplicates.
await fs.appendFile(base+'native.css', '\n.conversation>.entry-tools,.conversation>.prompt-status-row,.conversation>.prompt-change-editor,.conversation>.entry-note{display:none}\n');
// Persist the owner's reasons alongside the observed before/after fingerprints.
await replace(base+'native-review.mjs',"evidence:input.evidence+'\\nNative Metadata", "evidence:input.reason+'\\n'+input.evidence+'\\nNative Metadata");
