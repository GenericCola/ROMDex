import test from 'node:test';
import assert from 'node:assert/strict';
import {DetailNavigation} from '../public/detail-navigation.mjs';

test('Back follows visited children one level at a time and stops at the starting item',()=>{
 const nav=new DetailNavigation(),items=new Map(['parent','child','grandchild'].map(id=>[id,{id}]));
 nav.open(null,'parent');nav.open('parent','child',true);nav.open('child','grandchild',true);
 assert.equal(nav.back(items),'child');assert.equal(nav.back(items),'parent');assert.equal(nav.back(items),null);
});
test('opening a Work item starts a fresh boundary even when it was visited previously',()=>{
 const nav=new DetailNavigation(),items=new Map([['parent',{}],['child',{}]]);
 nav.open('parent','child',true);nav.open('child','parent');assert.equal(nav.destination(items),null);
});
test('native moves preserve the viewed trail and deleted destinations are skipped',()=>{
 const nav=new DetailNavigation(),items=new Map([['parent',{parentId:'moved'}],['grandchild',{}]]);
 nav.open('parent','child',true);nav.open('child','grandchild',true);
 assert.equal(nav.destination(items),'parent');assert.equal(nav.back(items),'parent');assert.equal(nav.back(items),null);
});
test('a created item can be revisited after YouTrack assigns its permanent ID',()=>{
 const nav=new DetailNavigation();nav.open('local-parent','child',true);nav.remap({'local-parent':'PMON-500'});
 assert.equal(nav.back(new Map([['PMON-500',{}]])),'PMON-500');
});
test('same-item child openings and deleted entire trails cannot create a Back loop',()=>{
 const nav=new DetailNavigation();nav.open('parent','parent',true);assert.equal(nav.history.length,0);
 nav.open('parent','child',true);assert.equal(nav.back(new Map()),null);assert.equal(nav.history.length,0);
});
