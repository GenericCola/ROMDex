from pathlib import Path
p=Path('outputs/ROMDex/public/mapdex-layout.mjs');s=p.read_text(encoding='utf-8-sig')
s=s.replace(" // Only map-wide labels/order belong in setup. Identity controls move beside\n // the selected item's actual source dialogue, preserving their existing IDs."," // Map-wide controls stay in setup. Selected-item tools use a compact popup dialog.")
a=s.index(" const titleBar=node(");b=s.index(" const strip=node(",a)
s=s[:a]+''' // Retain hidden selector IDs for saved positions, without retaining a third tray.
 const auxiliary=node('div');auxiliary.id='mapdex-auxiliary';auxiliary.hidden=true;auxiliary.append($('prepared-preview'),$('empty-preview'));document.body.append(auxiliary);
 cleanup.prepend($('item-detail'));const warnings=$('warning-list').closest('details');warnings.open=false;warnings.classList.add('mapdex-source-warnings');warnings.querySelector('summary').textContent='Map Review Warnings';setup.append(warnings);
 const reviewDialog=node('dialog',undefined,'mapdex-review-dialog');reviewDialog.id='mapdex-review-dialog';reviewDialog.setAttribute('aria-label','Map handoff or update review');const reviewBody=node('div',undefined,'mapdex-review-body'),reviewFooter=node('footer'),reviewClose=node('button','Close Review','suite-button');reviewClose.type='button';reviewFooter.append(reviewClose);reviewBody.append($('map-update-review'),$('handoff-review'),$('handoff-success'));reviewDialog.append(reviewBody,reviewFooter);document.body.append(reviewDialog);preview.remove();
 const settings=node('button');settings.hidden=true;settings.setAttribute('aria-expanded','false');let menuAnchor=null;
 function closeReview(){if(reviewDialog.open)reviewDialog.close();}
 function leaveReview(){if(!$('handoff-review').hidden)$('cancel-handoff').click();else if(!$('handoff-success').hidden)$('keep-preparing').click();else if(!$('map-update-review').hidden)$('back-map-update').click();closeReview();}reviewClose.onclick=leaveReview;reviewDialog.addEventListener('cancel',e=>{e.preventDefault();leaveReview();});
''' +s[b:]
s=s.replace("let toolReturn=null;", "let toolReturn=null;")
s=s.replace("(toolReturn?.isConnected?toolReturn:settings).focus({preventScroll:true});", "(toolReturn?.isConnected?toolReturn:document.querySelector('[data-entity-settings=\"'+CSS.escape(selectedId||'')+'\"]'))?.focus({preventScroll:true});")
s=s.replace("function openTools(){", "function openTools(anchor){menuAnchor=anchor||document.querySelector('[data-entity-settings=\"'+CSS.escape(selectedId||'')+'\"]')||document.querySelector('[data-map-settings]');")
s=s.replace("const rect=settings.getBoundingClientRect();", "const rect=menuAnchor.getBoundingClientRect();")
s=s.replace("settings.onclick=openTools;", "")
s=s.replace("onSettings:async id=>{await select(id);openIdentity();}", "onSettings:async id=>{await select(id);openTools();}")
s=s.replace("function renderItems(){const rows=", "function renderItems(){title.textContent=current?.prepared?.ready?current.prepared.name+' / '+(current.prepared.records.find(r=>r.id===area.value)?.name||'All Locations'):current?.source?'Select a Map / Zone':'Open a ROM';const rows=")
a=s.index('  detail(record){');b=s.index('  refresh()',a)
s=s[:a]+'''  detail(record){const changed=lastDetailId!==record.recordId;selectedId=lastDetailId=record.recordId;if(changed){cleanup.open=false;if(identityDialog.open)identityDialog.close();if(itemMenu.matches(':popover-open'))itemMenu.hidePopover();}linkAction.hidden=record.kind!=='appearance';identityHeading.textContent=(record.current.payload.overrides?.displayName||record.current.payload.name)+' — Identity & Image';renderItems();},
''' +s[b:]
s=s.replace('  identity:openIdentity,','  identity:openTools,\n  review(){if(!reviewDialog.open)reviewDialog.showModal();},\n  closeReview,')
s=s.replace("settings.focus();return true;", "menuAnchor?.focus();return true;")
p.write_text(s,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/public/rom-import.mjs');s=p.read_text(encoding='utf-8-sig')
a=s.index("const r=detail.record,root=$('item-detail');");b=s.index(" const evidence=el('details')",a)
s=s[:a]+'''const r=detail.record,root=$('item-detail');root.replaceChildren();if(detail.image){const img=el('img');img.dataset.sourceSprite='';img.src=detail.image;img.alt='Selected source thumbnail';root.append(img);}else if(r.kind!=='subzone'){const empty=el('p','Choose an available source frame below.','muted');empty.dataset.noSprite='';root.append(empty);}
''' +s[b:]
a=s.index('function applyMode()');b=s.index('function previewHandoff',a)
s=s[:a]+"function applyMode(){mode='default';$('rom-import').classList.remove('expanded','collapsed');}\n"+s[b:]
s=s.replace("mode='default';applyMode();}","mode='default';applyMode();layout.review();}")
s=s.replace("handoff=null;$('handoff-review').hidden=$('handoff-success').hidden=true;render();", "handoff=null;$('handoff-review').hidden=$('handoff-success').hidden=true;layout.closeReview();render();")
s=s.replace("$('handoff-success').hidden=false;state=await call('status');", "$('handoff-success').hidden=false;layout.review();state=await call('status');")
s=s.replace("else if(usesWorkspaceTab(event)&&!groupReview&&!handoff){event.preventDefault();cycleMode();}", "")
s=s.replace("const updates=mapUpdateReview({call,run,flush,refresh,message,getState:()=>state});", "const updates=mapUpdateReview({call,run,flush,refresh,message,getState:()=>state,openReview:()=>layout.review(),closeReview:()=>layout.closeReview()});")
p.write_text(s,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/public/map-update-review.mjs');s=p.read_text(encoding='utf-8-sig');s=s.replace('getState})','getState,openReview=()=>{},closeReview=()=>{}})');s=s.replace('function draw(){if(!preview)return;panel.hidden=false;', 'function draw(){if(!preview)return;panel.hidden=false;openReview();');s=s.replace('panel.hidden=true;message(', 'panel.hidden=true;closeReview();message(').replace('panel.hidden=true;await refresh();','panel.hidden=true;closeReview();await refresh();');p.write_text(s,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/public/rom-import.css');s=p.read_text(encoding='utf-8-sig');s+='''
/* MAPDex has a map selector and one full-height content tray. No dialogue tray. */
.import-layout,.import-layout.expanded,.import-layout.collapsed{grid-template-rows:minmax(0,1fr) 104px}
.import-selector{grid-row:1/3}.mapdex-entities{grid-column:2;grid-row:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
#mapdex-entity-list{flex:1;min-height:0;overflow:auto}.mapdex-condition-strip{grid-column:2;grid-row:2}
.mapdex-review-dialog{width:min(1100px,calc(100vw - 32px));max-height:90dvh;box-sizing:border-box;overflow:hidden;padding:20px;background:var(--screen);color:var(--ink);border:5px solid #79383e;border-radius:12px}
.mapdex-review-dialog[open]{display:flex;flex-direction:column;gap:12px}.mapdex-review-body{min-height:0;overflow:auto;padding:4px 12px 12px 4px}.mapdex-review-dialog footer{flex:none;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:flex-end;gap:10px}
#mapdex-identity-dialog #item-detail>[data-source-sprite]{display:block;width:80px;height:80px;object-fit:contain;margin:0 auto 12px;image-rendering:pixelated}
#mapdex-auxiliary[hidden]{display:none!important}
''';p.write_text(s,encoding='utf-8',newline='\n')
