// Read only the business API of the explicitly synthetic local preview.
import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const info=JSON.parse(await fs.readFile('work/u20f/ui-window.json','utf8'));assert.equal(info.synthetic,true);assert.equal(info.credentialUsed,false);const url=new URL(info.origin);assert.equal(url.hostname,'127.0.0.1');
const response=await fetch(new URL('/api/editor',url),{method:'GET',signal:AbortSignal.timeout(5000)});assert.equal(response.status,200);const state=await response.json();assert.equal(state.draft?.draft?.mode,'plan');assert.equal(state.draft.draft.fields.instructions,'U20F draft preserved ');assert.equal(state.operations.length,0);
await fs.writeFile('work/u20f/ui-draft-check.json',JSON.stringify({task:'U20F',status:'passed',synthetic:true,source:'Read-only editor business API',trailingSpacePreserved:true,noContentOperationCreated:true,at:new Date().toISOString()},null,2));
