from pathlib import Path
p=Path('work/ri03c/verify-native.mjs');s=p.read_text(encoding='utf-8-sig')
s=s.replace("name=>data.towns[0]?.name===name", "name=>{try{return data.towns[0]?.name===name;}catch{return false;}}")
s=s.replace("await npc.evaluate(()=>{const t=data.towns.find", "if(!report.checks.includes('NPCDex uses the same map-specific condition index, location imagery and access inspector after handoff')){await npc.evaluate(()=>{const t=data.towns.find",1)
s=s.replace("await check('NPCDex uses the same map-specific condition index, location imagery and access inspector after handoff');", "await check('NPCDex uses the same map-specific condition index, location imagery and access inspector after handoff');}")
p.write_text(s,encoding='utf-8')
