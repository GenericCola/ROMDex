import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {loadNPCDexSyncPolicy} from '../cloud/npcdex-sync-policy.mjs';
import {sharedSyncStatus} from '../public/shared-sync-status.mjs';

test('workspace pause survives reload, retains pending count and does not claim cloud success',async t=>{
 const directory=await fs.mkdtemp(path.join(process.env.ROMDEX_TEST_SCRATCH,'npcdex-pause-'));t.after(()=>fs.rm(directory,{recursive:true}));
 const file=path.join(directory,'npcdex-sync-policy.json');
 assert.equal((await loadNPCDexSyncPolicy(directory)).enabled(true),true);
 await fs.writeFile(file,JSON.stringify({format:'ROMDexNPCDexSyncPolicy/1',paused:true}));
 const policy=await loadNPCDexSyncPolicy(directory),original={status:{pending:133,pendingWrites:133,localCheckpoint:true,cloud:true,syncing:true,connection:'connected',review:false,attention:true}};
 assert.equal(policy.enabled(true),false);assert.equal(policy.enabled(false),false);
 const view=policy.view(original);assert.equal(view.status.pending,133);assert.equal(view.status.localCheckpoint,true);assert.equal(original.status.syncing,true);
 const shared=sharedSyncStatus({providers:{npcdex:{label:'NPCDex',...view.status},youtrack:{label:'YouTrack Tasks',cloud:true,connection:'connected',pending:0}},automaticSyncEnabled:true});
 assert.equal(shared.services[0].state,'Cloud Sync Paused');assert.equal(shared.services[1].state,'Up to Date');assert.match(shared.summary,/NPCDex Cloud Sync Is Paused/);assert.equal(shared.attention,false);
 await fs.writeFile(file,'{"format":"unknown","paused":true}');await assert.rejects(loadNPCDexSyncPolicy(directory),/Needs Review/);
});
