from pathlib import Path
p=Path('outputs/ROMDex/tests/rom-workspace.test.mjs');s=p.read_text();s=s.replace("const dir=await fs.mkdtemp(path.join(os.tmpdir(),'romdex-ri03b-'))", "const tempRoot=path.resolve(process.env.ROMDEX_TEST_TMP||os.tmpdir());await fs.mkdir(tempRoot,{recursive:true});const dir=await fs.mkdtemp(path.join(tempRoot,'romdex-ri03b-'))")
s=s.replace('assert.equal(path.dirname(dir),path.resolve(os.tmpdir()));','assert.equal(path.dirname(path.resolve(dir)),tempRoot);')
start=s.index("test('worker cancellation");end=s.index("\ntest('",start)
s=s[:start]+"test('worker cancellation is bounded and retains the previous preparation',async t=>{const {importer}=await prepared(t),head=importer.state.prepared.key;let worker;importer.workerFactory=()=>{worker=new EventEmitter();worker.terminate=async()=>worker.emit('exit',1);return worker;};await importer.start({mode:'catalog',file:'fixture.nds'});await importer.cancel();assert.equal(importer.state.job.state,'cancelled');assert.equal(importer.state.prepared.key,head);assert.equal(importer.job,null);});"+s[end:]
p.write_text(s)
