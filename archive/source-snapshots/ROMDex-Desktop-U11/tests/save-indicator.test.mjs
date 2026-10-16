import test from 'node:test';
import assert from 'node:assert/strict';
import {saveNeedsAttention} from '../public/core.mjs';

const queued = {operations:[{type:'edit',issueId:'PMON-1',patch:{summary:'Revised'}}]};
const healthy = {connected:true,automaticSyncEnabled:true,mode:'syncing',failures:0};

test('queued edits do not turn the lamp red during healthy automatic synchronization', () => {
  assert.equal(saveNeedsAttention(queued, healthy), false);
  assert.equal(saveNeedsAttention(queued, {...healthy,mode:'synced'}), false);
});

test('disabled synchronization needs manual saving only if data is queued', () => {
  const disabled = {...healthy,automaticSyncEnabled:false};
  assert.equal(saveNeedsAttention(queued, disabled), true);
  assert.equal(saveNeedsAttention({operations:[]}, disabled), false);
});

test('lost connection and failed retries flag unsaved data', () => {
  assert.equal(saveNeedsAttention(queued, {...healthy,connected:false}), true);
  assert.equal(saveNeedsAttention(queued, {...healthy,failures:1}), true);
  assert.equal(saveNeedsAttention(queued, {...healthy,mode:'manual'}), true);
});

test('connection loss alone does not label a clean workspace as unsaved', () => {
  assert.equal(saveNeedsAttention({operations:[]}, {connected:false,mode:'manual',failures:2}), false);
});

test('conflicts, uncertain operations and unavailable project states require attention', () => {
  assert.equal(saveNeedsAttention({...queued,blocked:{conflicts:[{field:'summary'}]}}, healthy), true);
  assert.equal(saveNeedsAttention({...queued,blocked:{uncertain:true}}, healthy), true);
  assert.equal(saveNeedsAttention(queued, {...healthy,missingStates:['Standby']}), true);
});

test('editor changes stay green when sync is healthy and red when sending is blocked', () => {
  assert.equal(saveNeedsAttention({operations:[]}, healthy, {description:true}), false);
  assert.equal(saveNeedsAttention({operations:[]}, {...healthy,connected:false}, {description:true}), true);
  assert.equal(saveNeedsAttention({operations:[]}, healthy, {summary:false,description:false}), false);
});
