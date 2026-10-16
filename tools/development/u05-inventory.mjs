import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const npc=await fs.readFile('C:/Users/mrgen/Downloads/npcdex-v2.42/npcdex-template.html','utf8');
const css=await fs.readFile('outputs/ROMDex/public/styles.css','utf8');
for(const [name,text] of [['NPCDex',npc.match(/<style>([\s\S]*?)<\/style>/)[1]],['ROMDex',css]]){
 console.log(name);
 for(const m of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)){const selector=m[1].trim();if(selector.length<180&&/^(?:\*|:root|html|body|button|\.device(?:\s|\{|$)|\.header\b|\.brand|\.lens|\.lamps?|\.save\b|\.bulb|\.connection-status|\.auto-sync|\.toggle-value|\.device-header|\.screen-top|\.cog)/.test(selector))console.log(selector+' {'+m[2]+'}');}
}
console.log('NPCDex header and tray markup');
for(const m of npc.matchAll(/<(?:header|aside|section)[\s\S]{0,1400}/g)){if(m.index<22000)console.log(m[0].slice(0,1400));}
const favicon=npc.match(/<link rel="icon"[^>]*>/)?.[0];console.log('favicon',favicon);
const settings=await fs.readFile('outputs/Tool-Suite-UI/standard-settings-icon.svg');const copy=await fs.readFile('outputs/ROMDex/public/standard-settings-icon.svg');console.log('settings artwork identical',settings.equals(copy));
const hash=b=>createHash('sha256').update(b).digest('hex');
await fs.mkdir('work/u05-layout',{recursive:true});
await fs.writeFile('work/u05-layout/source-hashes.json',JSON.stringify({npcTemplate:hash(npc),romStyles:hash(css),settings:hash(settings),faviconMarkup:favicon},null,2));
