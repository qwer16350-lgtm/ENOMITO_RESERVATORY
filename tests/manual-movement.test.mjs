import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WanderBehavior } from '../src/behavior/WanderBehavior.ts';
test('manual arrows follow screen direction and release resumes idle', () => {
 const c={id:'test',worldX:100,worldY:100,direction:'S',state:'idle'};
 const b=new WanderBehavior(c,()=>0.5);
 b.update(100,{x:1,y:0});
 assert.equal(c.direction,'E'); assert.ok(c.worldX>100 && c.worldY<100);
 assert.ok(Math.abs(Math.hypot(c.worldX-100,c.worldY-100)-0.24)<1e-8);
 b.update(16); assert.equal(c.state,'idle');
});
test('manual movement cannot penetrate obstacles or map boundary', () => {
 const c={id:'test',worldX:100,worldY:100,direction:'S',state:'idle'};
 const b=new WanderBehavior(c,()=>0.5,(x)=>x>100.04);
 for(let i=0;i<100;i++) b.update(100,{x:1,y:0});
 assert.ok(c.worldX<=100.04);
 c.worldX=0;c.worldY=0;
 b.update(100,{x:0,y:-1}); assert.equal(c.worldX,0);assert.equal(c.worldY,0);
});
test('running is exactly three times walking and preserves swept collision', () => {
 const make=()=>({id:'test',worldX:100,worldY:100,direction:'S',state:'idle'});
 const walk=make(),run=make();
 new WanderBehavior(walk,()=>0.5).update(100,{x:1,y:1});
 const behavior=new WanderBehavior(run,()=>0.5);
 behavior.update(100,{x:1,y:1,run:true});
 assert.equal(run.state,'run');
 const distance=c=>Math.hypot(c.worldX-100,c.worldY-100);
 assert.ok(Math.abs(distance(run)/distance(walk)-3)<1e-8);
 const blocked=make();
 new WanderBehavior(blocked,()=>0.5,x=>x>100.1).update(100,{x:1,y:0,run:true});
 assert.ok(blocked.worldX<=100.1);
});

