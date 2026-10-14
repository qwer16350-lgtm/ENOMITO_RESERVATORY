import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeCloudShadows,cloudShadowPosition} from '../src/world/CloudShadows.ts';
test('ten shared cloud forms drift in seeded random directions with bounded slow speed',()=>{
 const clouds=makeCloudShadows(123);
 assert.deepEqual(clouds,makeCloudShadows(123));
 assert.notDeepEqual(clouds,makeCloudShadows(124));
 assert.equal(new Set(clouds.map(c=>c.shape)).size,10);
 for(const cloud of clouds){
  const a=cloudShadowPosition(cloud,0),b=cloudShadowPosition(cloud,.01);
  const speed=Math.hypot(b.x-a.x,b.y-a.y)/.01;
  if(Math.abs(b.x-a.x)<10)assert.ok(speed>=23.99&&speed<=40.01);
  assert.ok(cloud.scale>=1&&cloud.scale<=2.3);
  assert.ok(cloud.alpha===.32);
 }
});



