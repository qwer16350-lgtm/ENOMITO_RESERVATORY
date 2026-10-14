import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitTreeLayers } from '../src/rendering/TreeLayers.ts';
test('wood and leaves are disjoint and reconstruct the complete source', () => {
 const source=new Uint8ClampedArray([49,39,30,255,38,59,40,255,143,141,119,255,0,0,0,0]);
 const {wood,leaves}=splitTreeLayers(source);
 assert.equal(wood[3],255); assert.equal(leaves[3],0);
 assert.equal(wood[7],0); assert.equal(leaves[7],255);
 assert.equal(wood[11],255);
 for(let i=0;i<source.length;i++) assert.equal(wood[i]+leaves[i],source[i]);
});
