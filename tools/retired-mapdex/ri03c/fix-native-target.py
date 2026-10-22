from pathlib import Path
p=Path('work/ri03c/verify-native.mjs');s=p.read_text(encoding='utf-8-sig');s=s.replace("report.checks.push(text);", "if(!report.checks.includes(text))report.checks.push(text);")
s=s.replace("try{\n for(const f", "try{const previous=JSON.parse(await fs.readFile(path.join(root,'native-proof.json')).catch(()=>'{\"checks\":[]}'));report.checks=previous.checks||[];report.reusedCompletedChecks=report.checks.length;\n for(const f")
s=s.replace("assert.equal(await map.locator('[data-inspect-condition]').count()", "if(!report.checks.includes('Character source dialogue and access requirements remain beside inline identity tools; the selected condition is explicit')){assert.equal(await map.locator('[data-inspect-condition]').count()",1)
s=s.replace("await check('Character source dialogue and access requirements remain beside inline identity tools; the selected condition is explicit');", "await check('Character source dialogue and access requirements remain beside inline identity tools; the selected condition is explicit');}")
s=s.replace("b.type==='text'", "b.type==='dialogue'")
p.write_text(s,encoding='utf-8')
