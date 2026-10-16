import {test} from 'node:test';
import assert from 'node:assert/strict';
import {immersionTarget,smoothImmersion} from '../src/rendering/Immersion.ts';
test('shore depth ramps continuously and entering/leaving cannot switch instantly',()=>{
 assert.equal(immersionTarget(1),0);assert.equal(immersionTarget(-2),1);
 assert.ok(immersionTarget(0)>0&&immersionTarget(0)<1);
 const a=smoothImmersion(0,1,16);assert.ok(a>0&&a<.2);
 const b=smoothImmersion(1,0,16);assert.ok(b<1&&b>.8);
 assert.ok(Math.abs(smoothImmersion(smoothImmersion(0,1,16),1,16)-smoothImmersion(0,1,32))<1e-10);
});
