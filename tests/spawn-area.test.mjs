import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnTreeKeepChance} from '../src/world/SpawnArea.ts';
test('tree density stays low near respawn and recovers gradually outside',()=>{
 assert.equal(spawnTreeKeepChance(511.5,511.5),.12);
 assert.equal(spawnTreeKeepChance(529.5,511.5),.12);
 assert.ok(spawnTreeKeepChance(541.5,511.5)>.12&&spawnTreeKeepChance(541.5,511.5)<1);
 assert.equal(spawnTreeKeepChance(559.5,511.5),1);
});
