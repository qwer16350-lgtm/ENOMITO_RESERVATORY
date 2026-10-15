import {test} from 'node:test';
import assert from 'node:assert/strict';
import {IdleAnimator} from '../src/rendering/IdleAnimator.ts';
test('standing always breathes front/back; blink occasional and back has no eyes',()=>{
 const a=new IdleAnimator(()=>0);
 assert.match(a.select('idle','S',0).texture,/breathe-S/);
 assert.match(a.select('idle','N',3000).texture,/breathe-N/);
 assert.equal(a.select('idle','S',3000).texture,'mito-blink-0');
 assert.equal(a.select('idle','S',3140).texture,'mito-blink-2');
 assert.match(a.select('idle','S',3280).texture,/breathe-S/);
 assert.equal(a.select('walk','S',3300),null);
});
test('rare idle_2 faces front even after back-facing rest and movement interrupts',()=>{
 const a=new IdleAnimator(()=>0);a.select('idle','N',0);
 assert.equal(a.select('idle','N',12000).texture,'mito-blink-0');
 assert.equal(a.select('idle','N',12600).texture,'mito-idle2-3');
 assert.match(a.select('idle','N',14400).texture,/breathe-N/);
 assert.equal(a.select('run','S',24000),null);
});



test('smile closes open eyes gradually and reopens them before returning to rest',()=>{
 const a=new IdleAnimator(()=>0);a.select('idle','S',0);
 const sample=(age)=>a.select('idle','S',12000+age).texture;
 assert.equal(sample(0),'mito-blink-0');
 assert.equal(sample(120),'mito-blink-2');
 assert.equal(sample(240),'mito-blink-1');
 assert.equal(sample(360),'mito-idle2-0');
 assert.equal(sample(2040),'mito-blink-1');
 assert.equal(sample(2160),'mito-blink-2');
 assert.equal(sample(2280),'mito-blink-0');
});
