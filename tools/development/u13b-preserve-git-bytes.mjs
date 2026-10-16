import fs from 'node:fs/promises';
const file='work/u13b-stage-repository.mjs';let text=await fs.readFile(file,'utf8');text=text.replace('* text=auto\\n*.png binary','* -text\\n*.png binary');await fs.writeFile(file,text);
await fs.writeFile('work/u13b/repository/.gitattributes','* -text\n*.png binary\n*.ico binary\n*.jpg binary\n*.gif binary\n*.woff binary\n*.woff2 binary\n');
