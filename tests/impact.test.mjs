import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WanderBehavior} from '../src/behavior/WanderBehavior.ts';
test('running obstacle impact recoils safely and walking does not trigger it',()=>{
 const c={id:'test',worldX:10,worldY:10,direction:'S'};
 const blocked=(x,y)=>x>=10.4||x<9.8;
 const behavior=new WanderBehavior(c,()=>0,blocked);
 for(let i=0;i<10&&!c.impact;i++)behavior.update(16,{x:1,y:.5,run:true});
 assert.ok(c.impact);assert.equal(c.impact.serial,1);
 const hitX=c.worldX;
 for(let i=0;i<30;i++)behavior.update(16,{x:1,y:.5,run:true});
 assert.ok(c.worldX<hitX);assert.ok(c.worldX>=9.8);assert.equal(c.impact.serial,1);
 const walk={id:'walk',worldX:10,worldY:10,direction:'S'};
 const walking=new WanderBehavior(walk,()=>0,blocked);
 for(let i=0;i<20;i++)walking.update(16,{x:1,y:.5});
 assert.equal(walk.impact,undefined);assert.ok(walk.worldX<10.4);
});
