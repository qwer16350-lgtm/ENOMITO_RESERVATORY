import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NatureWorld} from '../src/world/NatureWorld.ts';
import {GroundPatches,groundPatchWeight} from '../src/world/GroundPatches.ts';
test('large rocks favor dirt while keeping smaller rocks varied',()=>{
 const world=new NatureWorld(321),ground=new GroundPatches(321),rocks=world.queryRocks(0,0,1024,1024);
 const dirt=r=>ground.nearby(r.x,r.y).some(p=>p.kind===1&&groundPatchWeight(p,r.x,r.y)>.5);
 const large=rocks.filter(r=>r.kind<2),small=rocks.filter(r=>r.kind>=3);
 const largeRatio=large.filter(dirt).length/large.length,smallRatio=small.filter(dirt).length/small.length;
 assert.ok(largeRatio>.65);assert.ok(largeRatio>smallRatio+.35);
});
