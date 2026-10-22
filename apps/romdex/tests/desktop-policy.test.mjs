import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {assetPath,trustedURL,validateCall,externalURL,contentPolicy,STORES,METHODS} from '../desktop/policy.mjs';
import {METHODS as publicMethods} from '../public/desktop-methods.mjs';
test('desktop origin and asset policy rejects other hosts, encoded paths and filesystem escape',()=>{
 const root=path.resolve('public');assert.equal(assetPath(root,'romdex-app://shell/'),path.join(root,'index.html'));
 for(const url of ['https://shell/','file:///C:/Windows/a','romdex-app://evil/tasks.html','romdex-app://shell/%2e%2e%5csecret','romdex-app://shell/a%00b','romdex-app://user@shell/','romdex-app://shell:99/'])assert.throws(()=>assetPath(root,url));
 assert.equal(trustedURL('romdex-app://shell/tasks.html'),true);
});
test('desktop bridge has a finite domain command set with bounded data and no arbitrary state replacement',()=>{
 for(const method of publicMethods)assert(METHODS.has(method));
 for(const method of ['transaction','eval','request','readFile','writeFile','dispose','applyStatus','__proto__'])assert.throws(()=>validateCall(method,[]));
 assert.throws(()=>validateCall('preferences',[{operations:[]}]));assert.throws(()=>validateCall('preferences',[{remote:[]}]));
 assert.doesNotThrow(()=>validateCall('preferences',[{paneLayout:{collapsed:true}}]));assert.throws(()=>validateCall('edit',['x',{description:'x'.repeat(17*1024*1024)}]));
 assert(!STORES.has('../../connection.encrypted'));
});
test('desktop external links and content policies keep privileges scoped to packaged code',()=>{
 assert(externalURL('https://thegobindsingh.youtrack.cloud/issue/PMON-1'));
 for(const url of ['file:///c:/x','javascript:alert(1)','https://evil.example/','https://thegobindsingh.youtrack.cloud.evil/','https://user@thegobindsingh.youtrack.cloud/'])assert.throws(()=>externalURL(url));
 const shell=contentPolicy('romdex-app://shell/'),npc=contentPolicy('romdex-app://shell/addons/npcdex/index.html');
 assert(shell.includes("script-src 'self'"));assert(!shell.includes('unsafe-eval'));assert(shell.includes("frame-ancestors 'none'"));assert(npc.includes("frame-ancestors 'self'"));assert(npc.includes("connect-src 'self' http: https:"));
});
