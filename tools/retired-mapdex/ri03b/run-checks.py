from pathlib import Path
import os,subprocess,json
root=Path.cwd();work=root/'work/ri03b';temp=work/'test-runtime';temp.mkdir(exist_ok=True)
env={**os.environ,'TEMP':str(temp),'TMP':str(temp),'ROMDEX_TEST_TMP':str(temp)}
node='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
files=['rom-workspace','rom-compilation','desktop-policy','desktop-lifecycle','workspace-host-reload','save-coordinator','rdx-map-import','rdx-cloud']
with (work/'focused-checks.log').open('w',encoding='utf-8') as log:
 result=subprocess.run([node,'--test',*[str(root/'outputs/ROMDex/tests'/f'{name}.test.mjs') for name in files]],stdout=log,stderr=subprocess.STDOUT,env=env)
print(json.dumps({'exitCode':result.returncode,'log':str(work/'focused-checks.log')}))
raise SystemExit(result.returncode)
