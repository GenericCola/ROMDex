import {SELECTOR_MAX_DEPTH} from './selector-state.mjs';
import {STATUS} from './core.mjs';

// Keep existing cards and reveal containers so refreshes do not reset disclosure animations or focus.
const cardMarkup = new WeakMap();

export function renderSelectorTree({root,tree,selected,expanded,itemName,tier,esc,bulb}) {
  function walk(container,parentId) {
    const children = (tree.children.get(parentId)||[]).filter(item=>tree.depths.get(item.id)<=SELECTOR_MAX_DEPTH);
    const existing = new Map(Array.from(container.children).map(node=>[node.dataset.selectorBranch,node]));
    let cursor = container.firstElementChild;
    for (const item of children) {
      const depth=tree.depths.get(item.id),kids=tree.children.get(item.id)||[],label=itemName(item),color=tree.colors.get(item.id);
      const childLabel=tier(depth+1),childCountLabel=kids.length===1?childLabel:childLabel==='Story'?'Stories':childLabel+'s';
      const expandable=depth<SELECTOR_MAX_DEPTH&&kids.length>0,open=expandable&&expanded.has(item.id),control='selector-children-'+item.id;
      let branch=existing.get(item.id);
      if (!branch) {
        branch=document.createElement('div');branch.className='selector-branch';branch.dataset.selectorBranch=item.id;
        branch.innerHTML='<div class="selector"></div><div class="selector-reveal"><div class="selector-reveal-body"><div class="selector-children"></div></div></div>';
      }
      if (branch!==cursor) container.insertBefore(branch,cursor);
      cursor=branch.nextElementSibling;existing.delete(item.id);
      const card=branch.firstElementChild,reveal=card.nextElementSibling;
      const markup=`<span class="selector-status" role="img" aria-label="${esc(STATUS_LABEL(color))}" title="${kids.length?'Inherited from Children: ':''}${esc(STATUS_LABEL(color))}">${bulb(color)}</span><button class="selector-main" data-select="${esc(item.id)}" aria-current="${selected===item.id?'true':'false'}" title="${esc(label)}"><span class="selector-label"><strong>${esc(label)}</strong><small>${esc(tier(depth))} · ${kids.length} ${esc(childCountLabel)}</small></span></button><button class="selector-cog" data-selector-settings="${esc(item.id)}" title="Tile Settings" aria-label="Settings for ${esc(label)}"><img class="standard-settings-icon" src="standard-settings-icon.svg" width="12" height="12" alt="" aria-hidden="true"></button>${expandable?`<button class="selector-expand" data-selector-expand="${esc(item.id)}" aria-controls="${esc(control)}"><span aria-hidden="true">▸</span></button>`:''}`;
      if (cardMarkup.get(card)!==markup) {card.innerHTML=markup;cardMarkup.set(card,markup);}
      card.className=`selector depth-${depth}${selected===item.id?' selected':''}`;card.dataset.selector=item.id;
      reveal.id=control;reveal.classList.toggle('expanded',open);reveal.inert=!open;
      const arrow=card.querySelector('.selector-expand');
      if (arrow) {arrow.setAttribute('aria-expanded',String(open));arrow.setAttribute('aria-label',`${open?'Collapse':'Expand'} ${label}`);arrow.title=`${open?'Collapse':'Expand'} ${label}`;}
      walk(reveal.firstElementChild.firstElementChild,item.id);
    }
    for (const unused of existing.values()) unused.remove();
  }
  walk(root,null);
}

function STATUS_LABEL(color) {
  return STATUS[color]||'Untouched';
}
