import Phaser from 'phaser';
import type {WaterWorld} from '../world/WaterWorld';
import {WaterSampleCache} from './WaterSampleCache';
import {WORLD_LIGHT} from './WorldLighting';
import {projectedWaterFrame} from './WaterProjectionTexture';
export class GpuWaterSurface {
 private cache=new WaterSampleCache();private key='';private frame=-1;
 private deep:Phaser.GameObjects.TileSprite;private shore:Phaser.GameObjects.TileSprite;
 private masks:Phaser.Textures.CanvasTexture[];
 private filters:Phaser.Filters.Mask[];
 private maskRebuilds=0;
 constructor(private scene:Phaser.Scene,private water:WaterWorld,frames:Uint8ClampedArray[]){
  frames.forEach((source,frame)=>{
   const canvas=document.createElement('canvas');canvas.width=64;canvas.height=32;
   canvas.getContext('2d')!.putImageData(new ImageData(projectedWaterFrame(source),64,32),0,0);
   scene.textures.addCanvas(`water-gpu-${frame}`,canvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
   const edge=document.createElement('canvas');edge.width=64;edge.height=32;
   const ctx=edge.getContext('2d')!,pixels=ctx.createImageData(64,32),phase=frame/24*Math.PI*2;
   for(let y=0;y<32;y++)for(let x=0;x<64;x++){
    const p=(y*64+x)*4,wave=Math.max(0,Math.sin(x/64*Math.PI*2+y/32*Math.PI*4-phase));
    pixels.data[p]=139;pixels.data[p+1]=177;pixels.data[p+2]=158;pixels.data[p+3]=Math.round(wave**5*100);
   }
   ctx.putImageData(pixels,0,0);scene.textures.addCanvas(`water-edge-gpu-${frame}`,edge)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
  });
  this.masks=[0,1].map(i=>scene.textures.createCanvas(`water-gpu-mask-${i}`,8,8)!);
  this.deep=scene.add.tileSprite(0,0,8,8,'water-gpu-0').setOrigin(0).setScale(2).setTint(WORLD_LIGHT.tint).setDepth(-99999.75);
  this.shore=scene.add.tileSprite(0,0,8,8,'water-edge-gpu-0').setOrigin(0).setScale(2).setTint(WORLD_LIGHT.tint).setDepth(-99999.7);
  this.filters=[this.deep,this.shore].map((image,i)=>{image.enableFilters();return image.filters!.internal.addMask(this.masks[i]!.key);});
 }
 update(time:number){
  if(document.hidden)return;
  const started=performance.now(),view=this.scene.cameras.main.worldView;
  const left=Math.floor(view.left/64)*64-64,top=Math.floor(view.top/64)*64-64;
  const width=Math.ceil((view.width+192)/128)*64,height=Math.ceil((view.height+192)/128)*64;
  const key=`${left},${top},${width},${height}`;
  if(key!==this.key){
   this.key=key;
   const distances=this.cache.build(left,top,width,height,(x,y)=>{
    const wx=x/64+y/32,wy=y/32-x/64;
    return wx<0||wy<0||wx>=1024||wy>=1024?Infinity:this.water.distance(wx,wy);
   });
   const layers=this.masks.map(mask=>{
    if(mask.width!==width||mask.height!==height)mask.setSize(width,height);
    mask.setFilter(Phaser.Textures.FilterMode.NEAREST);return mask.context.createImageData(width,height);
   });let wet=0,shore=0;
   for(let i=0;i<distances.length;i++){
    const d=distances[i]!,p=i*4;
    if(d<-.65){layers[0]!.data[p+3]=255;wet++;}
    else if(d<=.12){layers[1]!.data[p+3]=Math.round(Math.max(0,1-Math.abs(d+.28)/.5)*255);shore++;}
    for(const layer of layers){layer.data[p]=255;layer.data[p+1]=255;layer.data[p+2]=255;}
   }
   [this.deep,this.shore].forEach((image,i)=>{
    const mask=this.masks[i]!;mask.context.putImageData(layers[i]!,0,0);mask.refresh();this.filters[i]!.setTexture(mask.key);
    image.setSize(width,height).setPosition(left,top).setTilePosition(left/2,top/2).setVisible(i===0?wet>0:shore>0);
   });
   this.scene.game.canvas.dataset.waterMaskRebuilds=String(++this.maskRebuilds);
  }
  const frame=Math.floor(time/180)%24;
  if(frame!==this.frame){this.frame=frame;this.deep.setTexture(`water-gpu-${frame}`);this.shore.setTexture(`water-edge-gpu-${frame}`);}
  this.scene.game.canvas.dataset.waterSurfaceCpuMs=(performance.now()-started).toFixed(2);
 }
}
