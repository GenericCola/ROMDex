from pathlib import Path
import json,hashlib,time,base64
root=Path.cwd();work=root/'work/ri02c';p=work/'verify-final.cjs'
(work/'job.json').write_text(json.dumps({'id':'ri02c-final-status-recheck-'+str(time.time_ns()),'task':'RI02C','file':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'at':int(time.time()*1000)}))
node='C:/Users/mrgen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
script="Set-Location -LiteralPath '"+root.as_posix()+"'; & '"+node+"' '"+(work/'stop-read-proof.mjs').as_posix()+"' *> '"+(work/'status-stop-launcher.log').as_posix()+"'"
encoded=base64.b64encode(script.encode('utf-16le')).decode()
out=root/'outputs/Documentation/History/RI02C/Finish-RI02C-Status.cmd';out.write_bytes(('@echo off\r\npowershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand '+encoded+'\r\n').encode())
print('Prepared guarded test-only handoff launcher; corrected final check and cleanup are queued.')
