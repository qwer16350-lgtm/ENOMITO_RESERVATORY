import assert from 'node:assert/strict';
import { test } from 'node:test';
import { WanderBehavior, movementDirection, restingDirection } from '../src/behavior/WanderBehavior.ts';
import { isoToWorld } from '../src/world/Projection.ts';

test('world movement projects to all eight matching screen directions', () => {
  const directions = ['N','NE','E','SE','S','SW','W','NW'];
  const vectors = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
  vectors.forEach(([x,y],i) => { const w = isoToWorld(x,y); assert.equal(movementDirection(w.x,w.y,'S'), directions[i]); });
  assert.equal(movementDirection(0,0,'NW'),'NW');
});
test('wandering alternates idle and walk, reaches destination without overshoot', () => {
  const c = {id:'test',worldX:500,worldY:500,direction:'S'};
  const behavior = new WanderBehavior(c, () => 0);
  assert.equal(c.state,'idle');
  for(let i=0;i<7;i++) behavior.update(100);
  assert.equal(c.state,'walk'); assert.ok(c.worldX > 500); assert.equal(c.direction,'SE');
  for(let i=0;i<16;i++) behavior.update(100);
  assert.equal(c.worldX,502); assert.equal(c.state,'idle');
  assert.equal(c.direction,'S');
});

test('rest uses front/back and lateral movement remembers its previous side', () => {
  for(const d of ['N','NE','NW']) assert.equal(restingDirection(d,'S'),'N');
  for(const d of ['S','SE','SW']) assert.equal(restingDirection(d,'N'),'S');
  for(const d of ['E','W']) {
    assert.equal(restingDirection(d,'N'),'N');
    assert.equal(restingDirection(d,'S'),'S');
  }
  const c={id:'back',worldX:500,worldY:500,direction:'NE'};
  const values=[0,0.625,0,0];
  const b=new WanderBehavior(c,()=>values.shift()??0);
  assert.equal(c.direction,'N');
  for(let i=0;i<23;i++) b.update(100);
  assert.equal(c.state,'idle'); assert.equal(c.direction,'N');
});
test('long wandering stays within all four map edges', () => {
  let seed=42;
  const random=()=>{ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  for(const [x,y] of [[0,0],[1023,0],[0,1023],[1023,1023]]) {
    const c={id:'edge',worldX:x,worldY:y,direction:'S'};
    const b=new WanderBehavior(c,random);
    for(let i=0;i<20000;i++){b.update(100);assert.ok(c.worldX>=0&&c.worldX<=1023&&c.worldY>=0&&c.worldY<=1023);}
  }
});
