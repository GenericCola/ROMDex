import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {once} from 'node:events';

test('a restarted service with sync disabled restores credentials without contacting YouTrack',async()=>{
 const scratch=process.env.ROMDEX_TEST_SCRATCH||os.tmpdir(),dir=await fs.mkdtemp(path.join(scratch,'romdex-paused-'));
 await fs.writeFile(path.join(dir,'sync-settings.json'),JSON.stringify({enabled:false}));
 process.env.ROMDEX_DATA_DIR=dir;process.env.ROMDEX_PORT='4398';process.env.YOUTRACK_TOKEN='fixture-token';
 const realFetch=globalThis.fetch;let requests=0;globalThis.fetch=async()=>{requests++;throw new Error('External requests are forbidden in this test');};
 let server;
 try{
  ({server}=await import('../server.mjs'));if(!server.listening)await once(server,'listening');assert.equal(requests,0);
  const status=await (await realFetch('http://127.0.0.1:4398/api/status')).json();assert.equal(status.automaticSyncEnabled,false);assert.equal(status.connected,true);assert.equal(status.connection.unverified,true);assert.equal(status.youtrackAvailable,false);
  const snapshot=await (await realFetch('http://127.0.0.1:4398/api/snapshot')).json();assert.equal(snapshot.syncDisabled,true);assert.equal(requests,0);
 }finally{globalThis.fetch=realFetch;if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}}
});
