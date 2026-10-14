import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NatureWorld } from '../src/world/NatureWorld.ts';
import { WanderBehavior } from '../src/behavior/WanderBehavior.ts';
test('largest trees isolated; smaller species have larger and denser clusters', () => {
 const w=new NatureWorld(), objects=w.query(0,0,1023.999,1023.999);
 for(const big of objects.filter(o=>o.kind===0)) for(const other of w.query(big.x-6,big.y-6,big.x+6,big.y+6)) if(big.id!==other.id) assert.ok(Math.hypot(big.x-other.x,big.y-other.y)>6);
 const counts=[0,0,0,0,0]; objects.forEach(o=>counts[o.kind]++);
 for(let i=1;i<5;i++) assert.ok(counts[i]>counts[i-1]);
 assert.equal(w.blocked(objects[0].x,objects[0].y),true);
 assert.deepEqual(w.query(0,0,95,95),new NatureWorld().query(0,0,95,95));
});
test('collision immediately abandons old direction without penetrating obstacle', () => {
 const c={id:'test',worldX:10,worldY:10,direction:'S'};
 const b=new WanderBehavior(c,()=>0,(x,y)=>x>=10.3 && Math.abs(y-10)<1);
 let reversed=false;
 for(let i=0;i<100;i++){const old=c.worldX;b.update(100);assert.ok(c.worldX<10.3 || Math.abs(c.worldY-10)>=1);if(c.worldX<old) reversed=true;}
 assert.ok(reversed);
});
test('long wandering never enters generated tree trunks', () => {
 const w=new NatureWorld(),c={id:'test',worldX:511.5,worldY:511.5,direction:'S'};
 let seed=42;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const b=new WanderBehavior(c,random,(x,y)=>w.blocked(x,y));
 for(let i=0;i<10000;i++){b.update(100);assert.equal(w.blocked(c.worldX,c.worldY),false);}
});
test('tree contact activates beside collision boundary and clears away from tree', () => {
 const world=new NatureWorld(); const tree=world.query(0,0,1023.999,1023.999).find(t=>t.kind===0);
 assert.equal(world.blocked(tree.x+tree.radius+0.25,tree.y),false);
 assert.equal(world.touchingTree(tree.x+tree.radius+0.25,tree.y),true);
 assert.equal(world.touchingTree(tree.x+tree.radius+0.5,tree.y),false);
 assert.equal(world.touchingTree(511.5,511.5),false);
});

test('world seeds reproduce layout independent of query order; different seeds change it',()=>{
 const a=new NatureWorld(123),b=new NatureWorld(123),c=new NatureWorld(124);
 b.query(700,700,900,900);
 assert.deepEqual(a.query(0,0,200,200),b.query(0,0,200,200));
 assert.notDeepEqual(a.query(0,0,200,200),c.query(0,0,200,200));
 const trees=a.query(0,0,1023.999,1023.999);
 assert.ok(trees.every(o=>o.x>=0&&o.y>=0&&o.x<1024&&o.y<1024));
 assert.ok(new Set(trees.filter(o=>o.kind===0).map(o=>Math.floor((o.x%32)*10))).size>100);
});
test('rocks follow world seed, block movement, and avoid trunks and spawn',()=>{
 const a=new NatureWorld(321),b=new NatureWorld(321),c=new NatureWorld(322);
 const rocks=a.queryRocks(0,0,1023.999,1023.999);
 assert.ok(rocks.length>1000);
 assert.deepEqual(rocks,b.queryRocks(0,0,1023.999,1023.999));
 assert.notDeepEqual(rocks,c.queryRocks(0,0,1023.999,1023.999));
 for(const rock of rocks){
  assert.equal(a.blocked(rock.x,rock.y),true);
  assert.ok(Math.hypot(rock.x-511.5,rock.y-511.5)>rock.radius+3);
  for(const tree of a.query(rock.x-6,rock.y-6,rock.x+6,rock.y+6))assert.ok(Math.hypot(rock.x-tree.x,rock.y-tree.y)>=rock.radius+tree.radius+.4);
 }
});

test('reduced population gathers into forest regions while retaining species counts',()=>{
 const world=new NatureWorld(86780859), trees=world.query(0,0,1023.999,1023.999);
 assert.ok(trees.length>14000&&trees.length<18500);
 const counts=[0,0,0,0,0];trees.forEach(tree=>counts[tree.kind]++);
 for(let kind=1;kind<5;kind++)assert.ok(counts[kind]>counts[kind-1]);
 const occupied=new Set(trees.filter(tree=>tree.kind>0).map(tree=>`${Math.floor(tree.x/64)},${Math.floor(tree.y/64)}`));
 assert.ok(occupied.size<200);
});
