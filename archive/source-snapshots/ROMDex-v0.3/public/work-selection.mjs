// Session-only selection. Ranges never include invisible or out-of-scope items.
export class WorkSelection {
 constructor(){this.ids=new Set();this.anchor=null;}
 clear(){this.ids.clear();this.anchor=null;}
 reconcile(visibleIds){const visible=new Set(visibleIds);for(const id of this.ids)if(!visible.has(id))this.ids.delete(id);if(!visible.has(this.anchor))this.anchor=null;}
 toggle(id,visibleIds,{shiftKey=false,ctrlKey=false,metaKey=false}={}){
  this.reconcile(visibleIds);const end=visibleIds.indexOf(id);if(end<0)return;
  const start=visibleIds.indexOf(this.anchor);
  if(shiftKey&&start>=0){if(!ctrlKey&&!metaKey)this.ids.clear();for(const key of visibleIds.slice(Math.min(start,end),Math.max(start,end)+1))this.ids.add(key);}
  else{this.ids.has(id)?this.ids.delete(id):this.ids.add(id);this.anchor=id;}
 }
 remap(mapping){this.ids=new Set([...this.ids].map(id=>mapping[id]||id));this.anchor=mapping[this.anchor]||this.anchor;}
}
