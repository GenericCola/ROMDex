import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const source=path.resolve('outputs/ROMDex'), mirror=path.resolve('work/u13b/repository/apps/romdex'), candidate=path.resolve('work/phase11e/candidate'), app=path.join(candidate,'resources/app');
const digest=b=>createHash('sha256').update(b).digest('hex');
async function walk(root,rel=''){let result=[];for(const entry of await fs.readdir(path.join(root,rel),{withFileTypes:true})){const p=path.posix.join(rel,entry.name);if(entry.isSymbolicLink())throw Error('Unexpected symlink: '+p);if(entry.isDirectory())result.push(...await walk(root,p));else result.push(p);}return result.sort();}
const selected=[];
for(const dir of ['cloud','content','desktop','examples','public','rdx','rom','shared-ui'])for(const file of await walk(path.join(source,dir)))selected.push(dir+'/'+file);
for(const entry of await fs.readdir(source,{withFileTypes:true}))if(entry.isFile()&&(/\.(?:mjs|cjs|md)$/.test(entry.name)||entry.name==='package.json'))selected.push(entry.name);
const mismatches=[];
for(const file of selected){const original=await fs.readFile(path.join(source,file));for(const [name,root]of [['mirror',mirror],['candidate',app]]){try{const copy=await fs.readFile(path.join(root,file));if(file==='package.json'&&name==='candidate'){const a=JSON.parse(original),b=JSON.parse(copy);for(const k of ['version','description'])delete a[k],delete b[k];if(JSON.stringify(a)!==JSON.stringify(b))mismatches.push({file,target:name});}else if(!original.equals(copy))mismatches.push({file,target:name});}catch(e){mismatches.push({file,target:name,error:e.code});}}}
for(const file of await walk(path.join(source,'tests'))){const a=await fs.readFile(path.join(source,'tests',file)),b=await fs.readFile(path.join(mirror,'tests',file)).catch(()=>null);if(!b||!a.equals(b))mismatches.push({file:'tests/'+file,target:'mirror'});}
const old=JSON.parse(await fs.readFile('work/phase11d/build.json'));const previous=new Map(old.files.map(f=>[f.path.replaceAll('\\','/'),f.sha256]));
const files=[];for(const file of await walk(candidate)){const bytes=await fs.readFile(path.join(candidate,file));files.push({path:file,bytes:bytes.length,sha256:digest(bytes)});}
const forbidden=files.filter(f=>/\.(nds|encrypted|sqlite|pem|key)$/i.test(f.path)||/(^|\/)(Data|Runtime|Local State)(\/|$)/i.test(f.path));
const runtimeChanges=files.filter(f=>!f.path.startsWith('resources/app/')&&previous.get(f.path)!==f.sha256).map(f=>f.path);
const syntax=[];for(const file of files.filter(f=>f.path.startsWith('resources/app/')&&/\.(mjs|cjs|js)$/.test(f.path)&&previous.get(f.path)!==f.sha256)){const r=spawnSync(process.execPath,['--check',path.join(candidate,file.path)],{encoding:'utf8',windowsHide:true});syntax.push({path:file.path,status:r.status===0?'passed':'failed',...(r.status===0?{}:{error:(r.stderr||r.error?.message||'Syntax check failed').slice(0,2000)})});}
// The repository preserves existing CRLF files with '* -text'; check actual
// whitespace without treating their established carriage returns as errors.
const diff=spawnSync('git',['-c','core.whitespace=cr-at-eol','-C','work/u13b/repository','diff','--check'],{encoding:'utf8',windowsHide:true});
const result={at:new Date().toISOString(),status:mismatches.length||forbidden.length||runtimeChanges.length||syntax.some(s=>s.status!=='passed')||diff.status!==0?'needs-review':'passed',sourceFilesCompared:selected.length,mirrorTestsCompared:(await walk(path.join(source,'tests'))).length,candidateFiles:files.length,mismatches,forbidden,runtimeChanges,syntaxChecks:syntax.length,syntaxFailures:syntax.filter(s=>s.status!=='passed'),gitDiffCheck:{passed:diff.status===0,output:(diff.stdout+diff.stderr).trim()},productionChanged:false,installerCreated:false};
await fs.writeFile('work/phase11e/final-audit.json',JSON.stringify(result,null,2)+'\n');
if(result.status==='passed')await fs.writeFile('work/phase11e/build.json',JSON.stringify({candidate,version:'0.5.26-11e.1',files,productionChanged:false,installerCreated:false,immutableRuntimeHardlinks:true},null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(result.status!=='passed')process.exitCode=1;
