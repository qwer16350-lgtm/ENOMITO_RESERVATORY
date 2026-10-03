import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isoToMinimap, minimapToIso, MINIMAP_SCALE } from '../src/ui/MinimapProjection.ts';
import { MapCamera } from '../src/camera/MapCamera.ts';

test('full isometric map fits diamond and center matches map center', () => {
  assert.deepEqual(isoToMinimap(0,0), {x:110,y:16});
  assert.deepEqual(isoToMinimap(32768,16384), {x:208,y:65});
  assert.deepEqual(isoToMinimap(-32768,16384), {x:12,y:65});
  assert.deepEqual(isoToMinimap(0,32768), {x:110,y:114});
  assert.deepEqual(isoToMinimap(0,16384), {x:110,y:65});
});

test('minimap clicks round trip positions, reject outside, and preserve camera zoom', () => {
  for(const [x,y] of [[0,16384],[16000,16000],[-16000,16000],[0,0],[0,32768]]) {
    const p=isoToMinimap(x,y), result=minimapToIso(p.x,p.y);
    assert.ok(result); assert.ok(Math.abs(result.x-x)<1e-8 && Math.abs(result.y-y)<1e-8);
  }
  assert.equal(minimapToIso(12,16),null);
  assert.equal(minimapToIso(210,120),null);
  const camera=new MapCamera(); camera.setZoom(2);
  camera.moveToIso(16000,16000);
  assert.equal(camera.zoom,2); assert.equal(camera.x,16000); assert.equal(camera.y,16000);
  camera.moveToIso(0,0);
  assert.equal(camera.y,16);
});
test('camera box moves with pan and shrinks proportionally with zoom', () => {
  const c=new MapCamera();
  const initial=c.bounds(960,540);
  const width=(initial.right-initial.left)*MINIMAP_SCALE;
  c.pan(640,320);
  const moved=c.bounds(960,540);
  assert.ok(isoToMinimap(moved.left,moved.top).x>isoToMinimap(initial.left,initial.top).x);
  c.setZoom(2);
  const zoomed=c.bounds(960,540);
  assert.equal((zoomed.right-zoomed.left)*MINIMAP_SCALE,width/2);
});
