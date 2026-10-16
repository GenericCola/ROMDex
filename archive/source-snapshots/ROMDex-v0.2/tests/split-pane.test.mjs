import test from 'node:test';
import assert from 'node:assert/strict';
import {splitLayout} from '../public/split-pane.mjs';

test('the NPCDex default leaves the former dialogue and timeline space for details', () => {
  const layout = splitLayout(792, {ratio:null,collapsed:false}, 362);
  assert.equal(layout.work, 362);
  assert.equal(layout.details, 420);
});

test('collapse removes details space without changing the remembered open size', () => {
  const preference = {ratio:.46,collapsed:true};
  const layout = splitLayout(792, preference, 362);
  assert.equal(layout.details, 0);
  assert.equal(layout.work, 782);
  assert.deepEqual(preference, {ratio:.46,collapsed:true});
  const reopened = splitLayout(792, {...preference,collapsed:false}, 362);
  assert.ok(reopened.details > 0);
  assert.equal(reopened.work, 782 * .46);
});

test('resizing the viewport retains proportional intent and keeps both trays reachable', () => {
  const preference = {ratio:.55,collapsed:false};
  for (const height of [0, 10, 40, 120, 420, 620, 792, 1200]) {
    const layout = splitLayout(height, preference, 362);
    assert.ok(layout.work >= 0 && layout.details >= 0);
    assert.equal(layout.work + layout.details, Math.max(0,height - 10));
    assert.ok(layout.work >= layout.minimum && layout.work <= layout.maximum);
  }
});

test('damaged saved ratios fall back or clamp without producing invalid geometry', () => {
  for (const ratio of [NaN, Infinity, -Infinity, -5, 5, undefined, null]) {
    const layout = splitLayout(792, {ratio,collapsed:false}, 362);
    assert.ok(Number.isFinite(layout.work) && Number.isFinite(layout.details));
    assert.ok(layout.work >= 240);
    assert.ok(layout.details >= 96);
  }
});
