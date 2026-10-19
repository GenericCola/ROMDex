// Retain whole documents: switching never serializes, commits or rebuilds editors.
export class WorkspaceHost {
 constructor({frames,onChange=()=>{},onReady=()=>{}}){this.frames=frames;this.onChange=onChange;this.onReady=onReady;this.current=null;this.loading=new Map();this.views=new Map();this.switching=false;}
 async load(id){
  if(this.views.has(id))return this.views.get(id);
  if(this.loading.has(id))return this.loading.get(id);
  const frame=this.frames[id];if(!frame)throw Error('Unknown Workspace.');
  const pending=new Promise((resolve,reject)=>{
   // Importing/opening an RDX reloads the same iframe. Keep observing its load
   // events so save/quit providers never retain a detached document's handlers.
   let timer,settled=false;const cleanup=(remove=false)=>{clearTimeout(timer);if(remove)frame.removeEventListener('load',loaded);};
   const loaded=async()=>{try{const win=frame.contentWindow,doc=frame.contentDocument;if(!win.romdexWorkspace)throw Error('Workspace Did Not Load. Retry Switching.');await win.romdexWorkspace.ready;const view={frame,win,doc,state:null,focus:null};
    const remember=event=>{const element=event.target;if(element&&element!==doc.body&&element!==doc.documentElement)view.focus=this.focusState(element);};
    doc.addEventListener('focusin',remember);doc.addEventListener('focusout',remember);doc.addEventListener('selectionchange',()=>{const e=doc.activeElement;if(e&&e!==doc.body)view.focus=this.focusState(e);});
    if(doc!==frame.contentDocument)return;
    this.views.set(id,view);cleanup();this.onReady(id,view);if(settled)this.resize();settled=true;resolve(view);
   }catch(error){cleanup(!settled);if(!settled)reject(error);}};
   frame.addEventListener('load',loaded);timer=setTimeout(()=>{cleanup(true);reject(Error('Workspace Loading Timed Out. Retry Switching.'));},45000);frame.src=frame.dataset.src;
  });this.loading.set(id,pending);try{return await pending;}finally{this.loading.delete(id);}
 }
 focusState(element){let start=null,end=null,direction=null;try{start=element.selectionStart;end=element.selectionEnd;direction=element.selectionDirection;}catch{}return {element,id:element.id,start,end,direction};}
 capture(view){const active=view.doc.activeElement;if(active&&active!==view.doc.body)view.focus=this.focusState(active);const scroll=[...view.doc.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth).map(element=>({element,top:element.scrollTop,left:element.scrollLeft}));view.state={scroll,focus:view.focus};}
 restore(view){const state=view.state;if(!state)return;const focus=state.focus,element=focus&&(focus.element.isConnected?focus.element:focus.id?view.doc.getElementById(focus.id):null);if(element){element.focus({preventScroll:true});try{if(focus.start!==null)element.setSelectionRange(focus.start,focus.end,focus.direction);}catch{}}for(const s of state.scroll)if(s.element.isConnected){s.element.scrollTop=s.top;s.element.scrollLeft=s.left;}}
 async activate(id){if(this.switching)throw Error('A Workspace Is Already Opening.');if(id===this.current)return;this.switching=true;try{const next=await this.load(id);if(this.current)this.capture(this.views.get(this.current));for(const [key,frame]of Object.entries(this.frames)){frame.hidden=key!==id;frame.inert=key!==id;}this.current=id;this.resize();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));this.restore(next);this.onChange(id,next);}finally{this.switching=false;}}
 resize(){for(const view of this.views.values()){view.doc.documentElement.style.setProperty('--app-height',innerHeight+'px');view.win.romdexWorkspace.resize?.();}}
}
