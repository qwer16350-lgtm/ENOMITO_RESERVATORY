import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WaterWorld} from '../src/world/WaterWorld.ts';
import {WaterDecorations} from '../src/world/WaterDecorations.ts';
test('aquatic/shore decorations are deterministic and belong to their depth bands',()=>{
 const water=new WaterWorld(86780859),a=new WaterDecorations(water),b=new WaterDecorations(new WaterWorld(86780859));
 const objects=a.query(0,0,1023,1023);
 assert.deepEqual(objects,b.query(0,0,1023,1023));
 const kinds=new Set(objects.map(o=>o.kind));assert.equal(kinds.size,6);
 for(const object of objects){const distance=water.distance(object.x,object.y);if(object.kind<3)assert.ok(distance<-.7);else if(object.kind===3)assert.ok(distance>-.9&&distance<-.1);else assert.ok(distance>.15&&distance<1.6);}
});

