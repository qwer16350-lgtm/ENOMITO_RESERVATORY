import {test} from 'node:test';
import assert from 'node:assert/strict';
import {natureMirror} from '../src/world/NatureVariation.ts';
import {NatureWorld} from '../src/world/NatureWorld.ts';
test('natural object mirroring is stable, varied, and stored on generated objects',()=>{
 const world=new NatureWorld(123),trees=world.query(0,0,1023.999,1023.999),rocks=world.queryRocks(0,0,1023.999,1023.999);
 for(const [objects,offset] of [[trees,0],[rocks,5]]){
  const mirrored=objects.filter(o=>o.mirror).length;
  assert.ok(mirrored/objects.length>.4&&mirrored/objects.length<.6);
  objects.forEach(o=>assert.equal(o.mirror,natureMirror(123,o.x,o.y,o.kind+offset)));
 }
});
