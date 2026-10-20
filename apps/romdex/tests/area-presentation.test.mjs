import test from 'node:test';import assert from 'node:assert/strict';
import {areaDisplayName,mapRdxFilename} from '../public/area-presentation.mjs';
test('New Bark Town exposes readable exterior and building/floor labels, not separate file names',()=>{
 const areas=[[60,'T20'],[61,'T20R0101'],[62,'T20R0102'],[63,'T20R0201'],[64,'T20R0202'],[65,'T20R0301'],[66,'T20R0401'],[384,'T20R0402']];
 assert.deepEqual(areas.map(([headerId,name],i)=>areaDisplayName({headerId,name},'New Bark Town',i)),['New Bark Town — Outdoors',"Elm's Lab — 1F","Elm's Lab — 2F",'Player’s House — 1F','Player’s House — 2F','Southwest House','Neighbor’s House — 1F','Neighbor’s House — 2F']);
 assert.equal(mapRdxFilename('New Bark Town'),'New Bark Town.rdx');
});
test('reference names require matching source code and ID; changed or unknown areas need review',()=>{
 assert.equal(areaDisplayName({headerId:999,name:'T20R0101'},'New Bark Town',2),'Sub-area 3 — Name Needs Review');
 assert.equal(areaDisplayName({headerId:61,name:'CUSTOM_ROOM'},'New Bark Town',0),'Sub-area 1 — Name Needs Review');
});
test('labels work beyond New Bark Town',()=>{
 assert.equal(areaDisplayName({headerId:68,name:'T21FS0101'},'Cherrygrove City'),'Poké Mart');
 assert.equal(areaDisplayName({headerId:69,name:'T21PC0101'},'Cherrygrove City'),'Pokémon Center — 1F');
});
test('suggested map filename remains a safe single Windows filename',()=>{
 assert.equal(mapRdxFilename('A/B: Test?'),'A B Test.rdx');assert.equal(mapRdxFilename('CON'),'Map-CON.rdx');assert.equal(mapRdxFilename(' .. '),'Map.rdx');assert(!mapRdxFilename('../Town').includes('/'));
});
