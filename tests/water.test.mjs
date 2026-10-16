import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WaterWorld} from '../src/world/WaterWorld.ts';
import {NatureWorld} from '../src/world/NatureWorld.ts';
test('water uses deterministic world seed, covers ponds/streams, and keeps spawn dry',()=>{
 const a=new WaterWorld(86780859),b=new WaterWorld(86780859),c=new WaterWorld(12345);
 let wet=0,different=0;
 for(let x=0;x<1024;x+=8)for(let y=0;y<1024;y+=8){const d=a.distance(x,y);assert.equal(d,b.distance(x,y));if(d<0)wet++;if(a.isWater(x,y)!==c.isWater(x,y))different++;}
 assert.ok(wet>100);assert.ok(different>100);assert.equal(a.isWater(511.5,511.5,1),false);
});
test('shared world-coordinate boundary is continuous and objects stay out of water',()=>{
 const world=new NatureWorld(86780859);
 for(let x=0;x<1024;x+=32)for(let y=0;y<1024;y+=32)assert.ok(Math.abs(world.water.distance(x-.00001,y)-world.water.distance(x+.00001,y))<.001);
 world.visitAll(o=>assert.equal(world.water.isWater(o.x,o.y,1.5),false));
 world.visitRocks(o=>assert.equal(world.water.isWater(o.x,o.y,o.radius+.5),false));
 let found=false;for(let x=0;x<1024&&!found;x+=8)for(let y=0;y<1024;y+=8)if(world.water.isWater(x,y)){assert.equal(world.blocked(x,y),false);found=true;break;}assert.ok(found);
});
test('half-density water targets half the covered area rather than just feature count',()=>{
 for(const seed of [86780859,12345,42]){
  const full=new WaterWorld(seed,1),half=new WaterWorld(seed,.5);let before=0,after=0;
  for(let x=0;x<1024;x+=4)for(let y=0;y<1024;y+=4){if(full.isWater(x+2,y+2))before++;if(half.isWater(x+2,y+2))after++;}
  assert.ok(after/before>.47&&after/before<.53);
 }
});
