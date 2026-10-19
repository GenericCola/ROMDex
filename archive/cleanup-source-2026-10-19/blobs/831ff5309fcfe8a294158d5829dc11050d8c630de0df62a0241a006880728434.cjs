const fs=require('fs'),path=require('path'),vm=require('vm');
const root=__dirname,read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('npcdex-template.html').replace('/*__CHANGE_ENGINE__*/',read('npcdex-change-engine.js')).replace('/*__PLANNING_UI__*/',read('npcdex-planning-ui.js')).replace('/*__NPCDEX_DATA__*/',JSON.stringify(JSON.parse(read('npcdex-data.json'))).replace(/</g,'\\u003c'));
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
fs.writeFileSync(path.join(root,'npcdex.html'),html);console.log('Built and syntax-checked npcdex.html');
