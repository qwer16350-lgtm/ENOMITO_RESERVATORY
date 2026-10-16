import {test} from 'node:test';
import assert from 'node:assert/strict';
import {extractGroundDecoration,bareDecorationKind} from '../src/assets/GroundDecorationMask.ts';
test('decoration extraction removes common grass pixels and preserves ornament RGBA',()=>{
 const base=new Uint8ClampedArray([50,80,40,255,50,80,40,255,0,0,0,0]);
 const decorated=new Uint8ClampedArray([50,80,40,255,240,210,160,255,0,0,0,0]);
 assert.deepEqual([...extractGroundDecoration(base,decorated)],[0,0,0,0,240,210,160,255,0,0,0,0]);
});
test('bare decorations are sparse and repeat for the same seed and tile',()=>{
 const counts=[0,0];for(let x=0;x<100;x++)for(let y=0;y<100;y++){
  const kind=bareDecorationKind(321,x,y);assert.equal(kind,bareDecorationKind(321,x,y));if(kind>=0)counts[kind]++;
 }
 assert.ok(counts[0]>700&&counts[0]<1100);assert.ok(counts[1]>600&&counts[1]<1000);
});
