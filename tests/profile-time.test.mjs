import assert from 'node:assert/strict';
import { test } from 'node:test';
import { arrivalAge } from '../src/ui/ProfileTime.ts';
test('arrival age uses elapsed hours and minutes, including over a day', () => {
  assert.equal(arrivalAge(1000,1000),'0시간 0분');
  assert.equal(arrivalAge(1000,1000+3660000),'1시간 1분');
  assert.equal(arrivalAge(1000,1000+90000000),'25시간 0분');
  assert.equal(arrivalAge(1000,0),'0시간 0분');
});
