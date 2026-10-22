from pathlib import Path
p=Path('work/ri03c/verify-native.mjs');s=p.read_text(encoding='utf-8-sig').replace("profile=path.join(root,'native-profile');", "profile=await fs.mkdtemp(path.join(root,'native-'));" );p.write_text(s,encoding='utf-8')
