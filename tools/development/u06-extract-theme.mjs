import fs from 'node:fs/promises';
// Move complete rules, retaining nested media context and their original order.
const file='outputs/ROMDex/public/styles.css',source=await fs.readFile(file,'utf8');
function split(text){let app='',shared='',at=0;while(at<text.length){const start=at;let quote=null,comment=false,open=-1;for(;at<text.length;at++){const c=text[at],n=text[at+1];if(comment){if(c==='*'&&n==='/'){comment=false;at++;}continue;}if(quote){if(c==='\\')at++;else if(c===quote)quote=null;continue;}if(c==='/'&&n==='*'){comment=true;at++;continue;}if(c==='"'||c==="'"){quote=c;continue;}if(c==='{'){open=at;break;}}
 if(open<0){app+=text.slice(start);break;}
 const header=text.slice(start,open),selector=header.replace(/\/\*[\s\S]*?\*\//g,'').trim();let depth=1;quote=null;comment=false;at=open+1;
 for(;at<text.length&&depth;at++){const c=text[at],n=text[at+1];if(comment){if(c==='*'&&n==='/'){comment=false;at++;}continue;}if(quote){if(c==='\\')at++;else if(c===quote)quote=null;continue;}if(c==='/'&&n==='*'){comment=true;at++;continue;}if(c==='"'||c==="'"){quote=c;continue;}if(c==='{')depth++;else if(c==='}')depth--;}
 if(depth)throw Error('Unbalanced CSS');const body=text.slice(open+1,at-1),whole=text.slice(start,at);
 if(selector.startsWith('@media')){const parts=split(body);if(parts.app.trim())app+=header+'{'+parts.app+'}';if(parts.shared.trim())shared+=header+'{'+parts.shared+'}';}
 else if(selector.startsWith('@keyframes indicator-')||selector.split(',').every(s=>/^(?::root$|\.device-header\b|\.header-actions\b|\.brand\b|\.brand-title\b|\.lens\b|\.lamps\b|\.save-controls\b|\.connection-status\b|\.auto-sync-toggle\b|\.bulb\b)/.test(s.trim())))shared+=whole;
 else app+=whole;
 }return {app,shared};}
const {app,shared}=split(source);await fs.mkdir('outputs/ROMDex/public/shared-ui',{recursive:true});await fs.writeFile(file,app);await fs.writeFile('outputs/ROMDex/public/shared-ui/theme.css','/* Shared ROMDex/NPCDex theme: extracted reference chrome and indicator rules. */\n'+shared+'\n');
await fs.writeFile('work/u06/extraction.json',JSON.stringify({originalBytes:Buffer.byteLength(source),appBytes:Buffer.byteLength(app),sharedBytes:Buffer.byteLength(shared),preservesMediaContexts:true},null,2));console.log('Extracted shared chrome, palette and dynamic indicator rules.');
