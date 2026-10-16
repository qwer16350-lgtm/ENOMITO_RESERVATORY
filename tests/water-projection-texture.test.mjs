import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectedWaterFrame} from '../src/rendering/WaterProjectionTexture.ts';
test('GPU repeated texture keeps original world projection and period',()=>{
 const source=new Uint8ClampedArray(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const p=(y*64+x)*4;source[p]=x;source[p+1]=y;source[p+2]=77;source[p+3]=255;}
 const result=projectedWaterFrame(source);
 for(let y=0;y<32;y++)for(let x=0;x<64;x++){
  const ix=x*2+1,iy=y*2+1,wx=ix/64+iy/32,wy=iy/32-ix/64;
  const tx=((Math.floor(wx*32)%64)+64)%64,ty=((Math.floor(wy*32)%64)+64)%64,p=(y*64+x)*4;
  assert.equal(result[p],tx);assert.equal(result[p+1],ty);
 }
});
