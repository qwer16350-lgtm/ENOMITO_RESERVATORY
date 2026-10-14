import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leafWindFrame, LEAF_FRAME_COUNT } from '../src/rendering/LeafWind.ts';
test('leaf motion keeps roots and thick wood fixed while foliage changes',()=>{
 const w=30,h=40,source=new Uint8ClampedArray(w*h*4);
 for(let y=22;y<40;y++)for(let x=12;x<18;x++)source.set([98,72,49,255],(y*w+x)*4);
 for(let y=4;y<16;y++)for(let x=5;x<25;x++)source.set([53+(x%2)*12,75+(x%2)*13,44,255],(y*w+x)*4);
 const frames=Array.from({length:LEAF_FRAME_COUNT},(_,i)=>leafWindFrame(source,w,h,i));
 for(const frame of frames)for(let y=22;y<40;y++)for(let x=12;x<18;x++)assert.deepEqual([...frame.slice((y*(w+4)+x+2)*4,(y*(w+4)+x+2)*4+4)],[98,72,49,255]);
 assert.notDeepEqual(frames[0],frames[6]);
});

test('all frames preserve canopy coverage across former vertical slice boundaries',()=>{
 const w=48,h=32,source=new Uint8ClampedArray(w*h*4);
 for(let y=2;y<24;y++)for(let x=3;x<45;x++)source.set([53+x%3,75,44,255],(y*w+x)*4);
 for(let frame=0;frame<LEAF_FRAME_COUNT;frame++){
  const output=leafWindFrame(source,w,h,frame);
  for(let y=2;y<24;y++)for(let x=3;x<45;x++)assert.equal(output[(y*(w+4)+x+2)*4+3],255);
 }
});

