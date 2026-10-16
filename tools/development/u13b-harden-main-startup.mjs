import fs from 'node:fs/promises';
const file='outputs/ROMDex/desktop/main.cjs';let text=await fs.readFile(file,'utf8');
text=text.replace("if(command==='updates'){await updater?.open();return;}","if(command==='updates'){if(updater)await updater.open();else await dialog.showMessageBox(win,{type:'info',title:'Application Updates Unavailable',message:updateState?.message||'Update Controls Are Still Starting.',detail:'Your Workspaces and Data Synchronization Continue Normally.'});return;}");
text=text.replace(' updater=await setupUpdater(', ' try{updater=await setupUpdater(');
const end="rebuildTray();}});\n if(verify&&process.env.ROMDEX_QA_REPORT)";
if(!text.includes(end))throw Error('Updater Integration Hook Changed');
text=text.replace(end,"rebuildTray();}});}catch(error){updateState={phase:'error',message:error.message};rebuildTray();}\n if(verify&&process.env.ROMDEX_QA_REPORT)");
await fs.writeFile(file,text);
