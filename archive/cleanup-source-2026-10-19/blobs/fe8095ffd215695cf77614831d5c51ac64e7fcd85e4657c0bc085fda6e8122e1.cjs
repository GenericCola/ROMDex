const fs=require('fs');let s=fs.readFileSync('work/test-v2.cjs','utf8');
s=s.replace("const page=await context.newPage();", "const page=await context.newPage();await page.addInitScript(()=>{const original=URL.createObjectURL;URL.createObjectURL=function(blob){window.__exportBlob=blob;return original.call(URL,blob)}});");
s=s.replace("await download.saveAs(path.resolve('work/test-agent-export.json'));", "const exportText=await page.evaluate(()=>window.__exportBlob.text());fs.writeFileSync('work/test-agent-export.json',exportText);console.log('Browser export Blob captured; download event emitted.');");
s=s.replace("const newPoints=flatten(d),oldPoints=flatten(old);", "assert.deepEqual(d.sourceBaseline,old);const newPoints=flatten(d),oldPoints=flatten(old);");
fs.writeFileSync('work/test-v2.cjs',s);
