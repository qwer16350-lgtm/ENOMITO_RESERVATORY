import assert from 'node:assert/strict';
import { test } from 'node:test';
import { edgeScroll } from '../src/camera/EdgeScroll.ts';

test('center and outside stop; four edges move in screen direction', () => {
  for (const [x,y] of [[480,270],[-1,200],[961,200],[200,-1],[200,541]]) assert.deepEqual(edgeScroll(x,y,960,540), {x:0,y:0});
  assert.deepEqual(edgeScroll(0,270,960,540), {x:-1,y:0});
  assert.deepEqual(edgeScroll(960,270,960,540), {x:1,y:0});
  assert.deepEqual(edgeScroll(480,0,960,540), {x:0,y:-1});
  assert.deepEqual(edgeScroll(480,540,960,540), {x:0,y:1});
});
test('speed increases toward boundary; diagonal speed stays capped', () => {
  assert.equal(edgeScroll(20,270,960,540).x, -0.5);
  assert.ok(Math.abs(edgeScroll(5,270,960,540).x) > 0.5);
  const diagonal = edgeScroll(0,0,960,540);
  assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.y)-1) < 1e-10);
  assert.equal(edgeScroll(20,135,480,270).x, -0.5);
});
