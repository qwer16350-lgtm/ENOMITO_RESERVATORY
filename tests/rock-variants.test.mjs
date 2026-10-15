import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NatureWorld} from '../src/world/NatureWorld.ts';
import {ROCK_SIZES,ROCK_HEIGHTS,ROCK_RADII} from '../src/world/Rocks.ts';
test('five rock forms use downward-only seeded scale and matching collision radii',()=>{
 const world=new NatureWorld(321),rocks=world.queryRocks(0,0,1024,1024);
 assert.equal(new Set(rocks.map(r=>r.kind)).size,5);
 assert.ok(ROCK_SIZES.slice(1).every(s=>s<ROCK_SIZES[0]));
 assert.ok(ROCK_HEIGHTS.slice(1).every(s=>s<ROCK_HEIGHTS[0]));
 for(const r of rocks){assert.ok(r.scale>=.72&&r.scale<=1);assert.equal(r.radius,ROCK_RADII[r.kind]*r.scale);}
});
