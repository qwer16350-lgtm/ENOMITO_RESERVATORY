import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GroundPatches} from '../src/world/GroundPatches.ts';
import {groundBlendGrid,groundBlendWeight} from '../src/world/GroundBlend.ts';
test('tile-based feathering agrees on shared edges and preserves solid interiors',()=>{
 const world=new GroundPatches(321);
 for(let x=20;x<50;x++)for(let y=20;y<50;y++){
  const a=groundBlendGrid(world.nearby(x+.5,y+.5),x,y),b=groundBlendGrid(world.nearby(x+1.5,y+.5),x+1,y);
  for(let kind=0;kind<2;kind++)for(const t of [0,.3,.7,1])assert.ok(Math.abs(groundBlendWeight(a,1,t,kind)-groundBlendWeight(b,0,t,kind))<1e-6);
 }
 assert.equal(groundBlendWeight(new Float32Array(18).fill(1),.2,.8,0),1);
});
