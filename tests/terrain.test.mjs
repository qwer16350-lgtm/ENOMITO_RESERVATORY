import assert from 'node:assert/strict';
import { test } from 'node:test';
import { grassVariant } from '../src/world/Terrain.ts';
test('terrain selection is stable and sparse decorations respect proportions', () => {
  const counts = [0, 0, 0, 0, 0];
  for (let x = 0; x < 256; x++) for (let y = 0; y < 256; y++) {
    const value = grassVariant(x, y);
    assert.equal(value, grassVariant(x, y));
    assert.ok(value >= 0 && value < 5);
    counts[value]++;
  }
  [0.68, 0.16, 0.07, 0.03, 0.06].forEach((expected, i) => {
    assert.ok(Math.abs(counts[i] / 65536 - expected) < 0.01);
  });
});
