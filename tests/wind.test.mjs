import {test} from 'node:test';
import assert from 'node:assert/strict';
import {windVelocity} from '../src/world/Wind.ts';
test('subtle breeze keeps particle speed within cloud movement range',()=>{
 for(let time=0;time<150000;time+=1000){const v=windVelocity(123,time);const speed=Math.hypot(v.x,v.y);assert.ok(speed>=24&&speed<=36);assert.deepEqual(v,windVelocity(123,time));}
});
