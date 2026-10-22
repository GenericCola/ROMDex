from pathlib import Path
import json,hashlib,time
w=Path('work/mapdex-0516');s=(w/'run-install.cjs').read_text();head=s[:s.index('app.whenReady().then(')];tail=s[s.index(" await json(path.join(work,'installation-phase.json'),{phase:'Installing verified"):]
body="""app.whenReady().then(async()=>{const report=await read(path.join(work,'installation-result.json'));try{
 assert.equal(report.status,'needs-review');assert(report.error.includes('Windows Installer exited 1603'));assert.equal(report.backup.status,'verified');assert.equal(report.restoration.status,'verified');assert(report.savedConnectionsVerified);delete report.error;report.status='resuming-after-path-correction';
 const gate=await read(path.join(work,'install-authorization.json'));assert(gate.userConfirmedQuit&&Date.now()-gate.at<3600000);await stopped();assert.equal((await read(path.join(application,'.installInfo.json'))).installVersion,'0.5.15');
 const build=await read(path.join(work,'build.json'));assert.equal(sha(await fs.readFile(build.installer.path)),build.installer.sha256);assert.equal(sha(await fs.readFile(path.join(backup,'Data.zip'))),report.backup.sha256);
 const python='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
 const baseline=await command(python,['-X','utf8',path.join(root,'work/npcdex-reset-20261020/verify-current.py'),path.join(backup,'Data.zip'),data]);assert.equal(baseline.code,0,baseline.error);
"""
tail=tail.replace("'APPLICATIONROOTDIRECTORY='+application","'APPLICATIONROOTDIRECTORY='+path.win32.normalize(application)").replace("path.join(work,'installation.log')","path.join(work,'installation-native-path.log')")
p=w/'run-resume-install.cjs';p.write_text(head+body+tail);(w/'job.json').write_text(json.dumps({'id':'install-resume-native-windows-path','file':str(p.resolve()),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'at':int(time.time()*1000)}))
print('Continuation reuses and re-verifies the completed backup; MSI receives native Windows separators.')
