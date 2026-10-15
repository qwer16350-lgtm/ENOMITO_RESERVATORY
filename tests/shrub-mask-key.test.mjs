import {test} from 'node:test';
import assert from 'node:assert/strict';
import {allocateShrubMaskKey} from '../src/rendering/ShrubMaskKey.ts';
test('delayed overlaps in an unchanged pool cannot reuse a texture name',()=>{
 const slots=Array.from({length:100},()=>({key:allocateShrubMaskKey()}));
 const textures=new Set();
 // All slots already exist before different shrubs become occluders on later frames.
 for(const i of [90,2,45,99,0,8]){assert.ok(!textures.has(slots[i].key));textures.add(slots[i].key);}
 assert.equal(new Set(slots.map(s=>s.key)).size,100);
 const nextScene=allocateShrubMaskKey();assert.ok(!slots.some(s=>s.key===nextScene));
});
