const fs=require('fs');
const [jsonFile,htmlFile]=process.argv.slice(2);
if(!jsonFile||!htmlFile){console.error('Usage: node update-npcdex.cjs npcdex-data.json npcdex.html');process.exit(1)}
const data=JSON.parse(fs.readFileSync(jsonFile,'utf8'));
if(data.version!==2||!Array.isArray(data.towns)||!Array.isArray(data.stages)||!data.annotations)throw Error('Expected NPCDex v2 content. Validate the full schema using browser Import first.');
const html=fs.readFileSync(htmlFile,'utf8'),start=html.indexOf('const ORIGINAL='),end=html.indexOf(';\nlet data=structuredClone(ORIGINAL)',start);
if(start<0||end<0)throw Error('Cannot find embedded NPCDex data boundaries.');
fs.writeFileSync(htmlFile,html.slice(0,start)+'const ORIGINAL='+JSON.stringify(data).replace(/</g,'\\u003c')+html.slice(end),'utf8');
console.log('Updated embedded NPCDex dataset.');
