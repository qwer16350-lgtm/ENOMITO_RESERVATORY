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
 assert.equal(a.select('idle','N',12000).texture,'mito-idle2-0');
 assert.equal(a.select('idle','N',12600).texture,'mito-idle2-2');
 assert.match(a.select('idle','N',14400).texture,/breathe-N/);
 assert.equal(a.select('run','S',24000),null);
});

