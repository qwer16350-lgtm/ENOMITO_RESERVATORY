import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GroundPatches,groundPatchWeight} from '../src/world/GroundPatches.ts';
test('seeded ground patches form connected large regions and allow overlapping materials',()=>{
 const a=new GroundPatches(86780859),b=new GroundPatches(86780859),patches=new Map();let mixed=false;
 for(let x=0;x<384;x+=4)for(let y=0;y<384;y+=4){
  const near=a.nearby(x,y);assert.deepEqual(near,b.nearby(x,y));
  for(const p of near)patches.set(`${p.kind}:${p.x}:${p.y}`,p);
  if(near.some(p=>p.kind===0&&groundPatchWeight(p,x,y)>.2)&&near.some(p=>p.kind===1&&groundPatchWeight(p,x,y)>.2))mixed=true;
 }
 assert.ok(mixed);assert.equal(new Set([...patches.values()].map(p=>p.kind)).size,2);
 for(const p of [...patches.values()].slice(0,20)){
  let core=0;
  for(let x=Math.floor(p.x-12);x<p.x+12;x++)for(let y=Math.floor(p.y-12);y<p.y+12;y++)if(groundPatchWeight(p,x+.5,y+.5)>.8)core++;
  assert.ok(core>=10);
 }
});
