import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CameraInertia } from '../src/camera/CameraInertia.ts';

test('released camera moves in drag direction, slows and comes to rest', () => {
  const motion = new CameraInertia();
  motion.sample(-16, 8, 16);
  const initial = Math.hypot(motion.vx, motion.vy);
  const movement = motion.step(16);
  assert.ok(movement.x < 0 && movement.y > 0);
  assert.ok(Math.hypot(motion.vx, motion.vy) < initial);
  for (let i = 0; i < 120; i++) motion.step(16);
  assert.equal(motion.active, false);
});
test('click stop produces exactly zero further movement', () => {
  const motion = new CameraInertia();
  motion.sample(20, 5, 16); motion.step(16); motion.stop();
  assert.equal(motion.active, false);
  assert.deepEqual(motion.step(16), { x: 0, y: 0 });
});
test('inertia is frame-rate independent and capped', () => {
  const a = new CameraInertia(), b = new CameraInertia();
  a.sample(1000, 1000, 1); b.sample(1000, 1000, 1);
  assert.ok(Math.hypot(a.vx,a.vy) <= 1800.00001);
  let ax = 0, bx = 0;
  for (let i = 0; i < 60; i++) ax += a.step(1000/60).x;
  for (let i = 0; i < 120; i++) bx += b.step(1000/120).x;
  assert.ok(Math.abs(ax - bx) < 1e-8);
});
