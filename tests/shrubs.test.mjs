import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NatureWorld} from '../src/world/NatureWorld.ts';
test('five seeded shrub species form thickets, avoid water and spawn, and permit movement',()=>{
 const world=new NatureWorld(321),all=world.shrubs.query(0,0,1024,1024);
 assert.ok(all.length>1500);assert.equal(new Set(all.map(o=>o.kind)).size,5);
 assert.deepEqual(all,new NatureWorld(321).shrubs.query(0,0,1024,1024));
 let neighbors=0;
 for(const o of all){
  assert.ok(Math.hypot(o.x-511.5,o.y-511.5)>=9);
  assert.equal(world.water.isWater(o.x,o.y,.65),false);
  assert.equal(world.blocked(o.x,o.y),false);
  if(world.shrubs.query(o.x-3,o.y-3,o.x+3,o.y+3).length>3)neighbors++;
 }
 assert.ok(neighbors/all.length>.7);
});
