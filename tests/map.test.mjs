import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TileMap } from '../src/world/TileMap.ts';
import { MapCamera } from '../src/camera/MapCamera.ts';
import { worldToIso, isoToWorld } from '../src/world/Projection.ts';

test('1024 map includes its four corner tiles, and culling omits no intersecting tile', () => {
  const map = new TileMap();
  assert.equal(map.width * map.height, 1048576);
  for (const [x, y] of [[0, 0], [0, 1023], [1023, 0], [1023, 1023], [511.5, 511.5]]) {
    const p = worldToIso(x, y);
    const view = { left: p.x - 480, right: p.x + 480, top: p.y - 270, bottom: p.y + 270 };
    const actual = map.visibleTiles(view);
    const ids = new Set(actual.map(t => `${t.x},${t.y}`));
    // Independent full-map oracle verifies candidate bounds, including edge overlaps.
    for (let tx = 0; tx < 1024; tx++) for (let ty = 0; ty < 1024; ty++) {
      const px = (tx - ty) * 32, py = (tx + ty) * 16;
      if (px + 32 >= view.left && px - 32 <= view.right && py + 32 >= view.top && py <= view.bottom) assert.ok(ids.has(`${tx},${ty}`));
    }
    assert.ok(actual.every(t => t.x >= 0 && t.x < 1024 && t.y >= 0 && t.y < 1024));
    assert.ok(actual.length < 1500);
  }
});

test('camera stays inside map at large drags, limits zoom, and resets', () => {
  const camera = new MapCamera();
  for (const [dx, dy] of [[1e9, 1e9], [-1e9, -1e9], [1e9, -1e9], [-1e9, 1e9]]) {
    camera.pan(dx, dy);
    const w = isoToWorld(camera.x, camera.y - 16);
    assert.ok(w.x >= 0 && w.x <= 1023 && w.y >= 0 && w.y <= 1023);
  }
  camera.setZoom(0); assert.equal(camera.zoom, 0.5);
  assert.ok(new TileMap().visibleTiles(camera.bounds(960, 540)).length < 5000);
  camera.setZoom(10); assert.equal(camera.zoom, 3);
  camera.center(); assert.deepEqual(isoToWorld(camera.x, camera.y - 16), { x: 511.5, y: 511.5 });
  assert.equal(camera.zoom, 1);
});
