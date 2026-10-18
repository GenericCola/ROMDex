import fs from 'node:fs/promises';import assert from 'node:assert/strict';const file='outputs/ROMDex/content/editor-ui.js';let s=await fs.readFile(file,'utf8');const r=(a,b)=>{assert(s.includes(a),a.slice(0,90));s=s.replace(a,b);};
r('if(activeTarget&&available.some','if(activeTarget&&!preset?.legacy&&available.some');
r("button('Plan Changes',()=>open('plan',false,{target}),bar);button('CHANGE',()=>open('plan',false,{target,intent:'UPDATE'}),bar);", "const change=button('CHANGE',()=>open('plan',false,{target,intent:'UPDATE'}),bar);change.title='Plan Changes';change.setAttribute('aria-label','Plan Changes');");
r("button('Edit Whole Dialogue Entry',()=>open('review',false,{target:{...target,blockId:''}}),bar);", "button('Whole Entry Notes',()=>open('review',false,{target:{...target,blockId:''}}),bar);");
r("advanced.append(make('summary','More Actions'));button('Correct Documentation'", "advanced.append(make('summary','More Actions'));if(target.blockId)button('Plan Whole Dialogue Entry',()=>open('plan',false,{target:{...target,blockId:''}}),advanced);button('Correct Documentation'");
await fs.writeFile(file,s);
