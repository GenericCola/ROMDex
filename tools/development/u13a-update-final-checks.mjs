import fs from 'node:fs/promises';
const current='work/u13a-current-check.mjs';let text=await fs.readFile(current,'utf8');text=text.replaceAll('0.5.1','0.5.2');await fs.writeFile(current,text);
const audit='work/u13a-artifact-audit.mjs';text=await fs.readFile(audit,'utf8');text=text.replaceAll('0.5.1','0.5.2').replace('testsPassed:283','testsPassed:287').replace('syntaxChecks:87','syntaxChecks:89');await fs.writeFile(audit,text);
await fs.copyFile('outputs/U13A-Application-Manifest.json','outputs/ROMDex-Installer-0.5.1/Application-Manifest.json');
