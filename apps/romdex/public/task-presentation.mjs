import {materialize,indexTree} from './core.mjs';

// Desktop snapshots have new object identities even when only connection status
// changed. Cache by the complete task inputs, never by the snapshot reference.
export class TaskPresentation {
  read(state) {
    const signature=JSON.stringify([state.remote,state.operations,state.order||{}]);
    if(signature===this.signature)return this.value;
    const items=materialize(state.remote,state.operations),tree=indexTree(items,state.order);
    this.signature=signature;this.value={items,tree};return this.value;
  }
}

const markup=new WeakMap();
// Reuse unchanged rows so expanding one branch does not replace every visible
// select, input and task node. Removed rows are not retained in a separate cache.
export function renderTaskRows(root,parts) {
  const existing=new Map([...root.children].map(row=>[row.dataset.renderKey,row]));
  const wanted=new Set(parts.map(p=>p.key));
  for(const [key,row]of existing)if(!wanted.has(key))row.remove();
  let cursor=root.firstElementChild;
  for(const part of parts){
    let row=existing.get(part.key);
    if(!row||markup.get(row)!==part.html){
      const body=document.createElement('tbody');body.innerHTML=part.html;
      const next=body.firstElementChild;
      if(!next||next.tagName!=='TR'||body.children.length!==1)throw Error('Invalid Task Row.');
      next.dataset.renderKey=part.key;markup.set(next,part.html);
      if(row){if(cursor===row)cursor=next;row.replaceWith(next);}row=next;
    }
    if(row!==cursor)root.insertBefore(row,cursor);
    cursor=row.nextElementSibling;
  }
}
