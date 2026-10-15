import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WaterSampleCache} from '../src/rendering/WaterSampleCache.ts';
test('moving water viewport samples only new border without altering world values',()=>{
 const cache=new WaterSampleCache();let calls=0;
 const sample=(x,y)=>{calls++;return x+y*100;};
 cache.build(0,0,100,60,sample);assert.equal(calls,6000);calls=0;
 const moved=cache.build(64,0,100,60,sample);assert.equal(calls,32*60);
 for(let y=0;y<60;y++)for(let x=0;x<100;x++)assert.equal(moved[y*100+x],65+x*2+(1+y*2)*100);
 calls=0;cache.build(64,0,100,60,sample);assert.equal(calls,0);
 const resized=cache.build(-64,-64,140,100,sample);
 for(let y=0;y<100;y++)for(let x=0;x<140;x++)assert.equal(resized[y*140+x],-63+x*2+(-63+y*2)*100);
});
