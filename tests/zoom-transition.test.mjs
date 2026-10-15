import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MapCamera} from '../src/camera/MapCamera.ts';
test('character zoom eases out, lands exactly and direct zoom cancels transition',()=>{
 const camera=new MapCamera();camera.animateTo(camera.x,camera.y,3);
 const steps=[];let previous=1;
 for(let i=0;i<4;i++){camera.updateTransition(120);steps.push(camera.zoom-previous);previous=camera.zoom;}
 assert.equal(camera.zoom,3);
 assert.ok(steps.every((step,i)=>step>0&&(i===0||step<steps[i-1])));
 camera.animateTo(camera.x,camera.y,1);camera.updateTransition(120);
 assert.ok(camera.zoom>1&&camera.zoom<3);
 camera.setZoom(2);camera.updateTransition(480);assert.equal(camera.zoom,2);
});
