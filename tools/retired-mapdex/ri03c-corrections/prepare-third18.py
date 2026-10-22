from pathlib import Path
import shutil
r=Path('work/ri03c-corrections');shutil.copyfile('work/ri03c/build.json',r/'build17.json');shutil.copyfile(r/'third-native-proof.json',r/'third-native17-proof.json');shutil.copyfile(r/'third-native-npcdex.png',r/'third-native17-npcdex.png')
p=r/'build-candidate17.mjs';s=p.read_text(encoding='utf-8-sig').replace("previous=path.resolve('work/ri03c/candidate16')", "previous=path.resolve('work/ri03c/candidate17')").replace("candidate=path.resolve('work/ri03c/candidate17')", "candidate=path.resolve('work/ri03c/candidate18')").replace('0.5.26-11f.17','0.5.26-11f.18');(r/'build-candidate18.mjs').write_text(s,encoding='utf-8',newline='\n')
