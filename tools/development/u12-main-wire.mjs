import fs from 'node:fs/promises';const file='outputs/ROMDex/desktop/main.cjs';let value=await fs.readFile(file,'utf8');
value=value.replace('session,Tray,Menu,powerMonitor}', 'session,Tray,Menu,powerMonitor,safeStorage}');
const begin=value.indexOf("const qa=process.env.ROMDEX_QA==='1';"),end=value.indexOf('\nlet win,service',begin);value=value.slice(0,begin)+`const qa=process.env.ROMDEX_QA==='1',verify=qa||process.env.ROMDEX_VERIFY==='1';
const virtualized=/[\\\\/]Packages[\\\\/]sandbox\\.[^\\\\/]+[\\\\/]AC(?:[\\\\/]|$)/i.test(process.env.LOCALAPPDATA||'');
const accountData=virtualized?path.join(process.env.USERPROFILE,'AppData','Local'):(process.env.LOCALAPPDATA||app.getPath('appData'));
const base=qa&&process.env.ROMDEX_DESKTOP_PROFILE?path.resolve(process.env.ROMDEX_DESKTOP_PROFILE):path.join(accountData,'ROMDexDesktopData','thegobindsingh-PMON');
const sessionBase=qa?path.join(base,'session'):path.join(accountData,'ROMDexDesktopData','sessions','thegobindsingh-PMON');
app.setPath('userData',sessionBase);app.setPath('sessionData',sessionBase);`+value.slice(end);
value=value.replace(" await fs.mkdir(base,{recursive:true});",` const {electronProtector}=await import('./credentials.mjs');const credentialProtector=electronProtector(safeStorage);
 if(!qa){const {ensureDesktopProfile}=await import('./first-run.mjs');await ensureDesktopProfile({app,dialog,safeStorage,destination:base,accountData});}
 await fs.mkdir(base,{recursive:true});`);
const beginMarker=value.indexOf(' // U10 uses a separate preview profile.'),endMarker=value.indexOf('\n service=new ServiceHost',beginMarker);value=value.slice(0,beginMarker)+` // QA remains isolated; normal launches require the reviewed stable profile.
 if(qa){const marker=path.join(base,'desktop-preview.json');try{const m=JSON.parse(await fs.readFile(marker,'utf8'));if(m.version!==1||m.application!=='ROMDexDesktopPreview')throw Error('Unknown Desktop Profile.');}catch(error){if(error.code!=='ENOENT')throw error;await fs.writeFile(marker,JSON.stringify({version:1,application:'ROMDexDesktopPreview',migrationPending:true}));}}`+value.slice(endMarker);
value=value.replace('onOwner:pid=>lease.utility(pid),onEvent:', 'onOwner:pid=>lease.utility(pid),onCredential:credentialProtector,onEvent:');
value=value.replaceAll("title:'ROMDex — Desktop Preview · Migration Pending'","title:qa?'ROMDex — Verification Preview':'ROMDex'");
value=value.replace("win.setTitle('ROMDex — Desktop Preview · Migration Pending')","win.setTitle(qa?'ROMDex — Verification Preview':'ROMDex')");
value=value.replace(" ipcMain.handle('romdex:tray-state'", " ipcMain.handle('romdex:profile-info',event=>{caller(event);return {migrated:!qa,version:app.getVersion()};});\n ipcMain.handle('romdex:tray-state'");
value=value.replace("detail:'NPCDex Add-On · Desktop Preview\\nYouTrack Tasks: Two-Way Sync\\nNPCDex: Local Saves and Recovery; Cloud Sync Is Planned\\nCurrent Live Web Saves Will Be Migrated in U12.'", "detail:'NPCDex Add-On\\nYouTrack Tasks: Two-Way Sync\\nNPCDex: Local Saves and Recovery; Cloud Sync Is Planned\\n'+(qa?'Isolated Verification Profile':'Saves Are Stored Outside the App Folder')");
value=value.replaceAll('if(qa&&process.env.ROMDEX_QA_REPORT)', 'if(verify&&process.env.ROMDEX_QA_REPORT)');
value=value.replace('trayTemplate:()=>trayTemplate(',"verifyConnection:()=>rpc('verify-connection'),trayTemplate:()=>trayTemplate(");
await fs.writeFile(file,value);
