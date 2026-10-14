import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shoreWaveAlpha} from '../src/rendering/ShoreWave.ts';
test('shoreward wave advances gently and loops without appearing on dry land',()=>{
 assert.equal(shoreWaveAlpha(1,0,1500),0);
 assert.equal(shoreWaveAlpha(-2,0,1500),0);
 assert.ok(shoreWaveAlpha(-.29,0,2160)>.2);
 assert.ok(shoreWaveAlpha(-.29,0,2160)>shoreWaveAlpha(-.29,0,100));
 assert.ok(Math.abs(shoreWaveAlpha(-.29,0,2160)-shoreWaveAlpha(-.29,0,6480))<1e-8);
});
