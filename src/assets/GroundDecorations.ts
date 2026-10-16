import Phaser from 'phaser';
import {extractGroundDecoration} from './GroundDecorationMask';
export function prepareGroundDecorations(scene:Phaser.Scene){
 const pixels=(key:string)=>{
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=32;
  const ctx=canvas.getContext('2d')!;ctx.drawImage(scene.textures.get(key).getSourceImage() as HTMLCanvasElement,0,0);
  return ctx.getImageData(0,0,64,32).data;
 };
 const base=pixels('terrain-grass-0');
 return [2,3].map((variant,i)=>{
  const rgba=extractGroundDecoration(base,pixels(`terrain-grass-${variant}`));
  const key=`ground-decoration-${i}`;
  if(!scene.textures.exists(key)){
   const canvas=document.createElement('canvas');canvas.width=64;canvas.height=32;
   canvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(rgba),64,32),0,0);
   scene.textures.addCanvas(key,canvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  return rgba;
 });
}
