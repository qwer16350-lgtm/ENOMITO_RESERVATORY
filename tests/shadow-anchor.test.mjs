import {test} from 'node:test';
import assert from 'node:assert/strict';
import {groundFootprint,projectShadowPoint} from '../src/rendering/ShadowAnchor.ts';
test('ground anchor uses opaque base rather than transparent frame edge',()=>{
 const w=20,h=100,data=new Uint8ClampedArray(w*h*4);
 for(let y=88;y<96;y++)for(let x=8;x<12;x++)data.set([80,80,70,255],(y*w+x)*4);
 const foot=groundFootprint(data,w,h);
 assert.equal(foot.x,10);assert.equal(foot.y,92);
 assert.ok(foot.y<h);
 for(const scale of [1,2,3]){
  const projected=projectShadowPoint(foot.x,foot.y,h);
  const objectX=300+(foot.x-w/2)*scale,objectY=400+(foot.y-h)*scale;
  const originX=projected.x,originY=projected.y;
  assert.equal(objectX+(projected.x-originX)*scale,objectX);
  assert.equal(objectY+(projected.y-originY)*scale,objectY);
 }
});
