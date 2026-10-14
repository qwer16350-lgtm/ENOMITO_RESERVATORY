import { WaterSurface } from './WaterSurface';
import Phaser from 'phaser';
import { WaterWorld } from '../world/WaterWorld';
export class WaterTiles {
 private cache=new Map<string,{key:string,last:number}>();
 private frames:Uint8ClampedArray[]=[];
 private surface:WaterSurface;
 private pixels:Uint8ClampedArray;
 private tick=0;
 constructor(private scene:Phaser.Scene,private water:WaterWorld){
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
  const context=canvas.getContext('2d')!;context.drawImage(scene.textures.get('water-surface').getSourceImage() as HTMLImageElement,0,0,64,64);
  this.pixels=context.getImageData(0,0,64,64).data;
  for(let frame=0;frame<24;frame++){
   const pixels=new Uint8ClampedArray(this.pixels.length),phase=frame/24*Math.PI*2;
   for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const sx=(Math.round(x+Math.sin(y/64*Math.PI*4+phase)*1.7)+64)%64;
    const sy=(Math.round(y+Math.sin(x/64*Math.PI*2-phase)*1.1)+64)%64;
    const source=(sy*64+sx)*4,p=(y*64+x)*4;
    const light=1+Math.sin((x+y)/64*Math.PI*4+phase)*.09;
    for(let c=0;c<3;c++)pixels[p+c]=Math.round(this.pixels[source+c]*light);
    pixels[p+3]=255;
   }
   this.frames.push(pixels);
  }
  this.surface=new WaterSurface(scene,water,this.frames);
 }
 begin(){this.tick++;}
 texture(x:number,y:number,grassKey:string){
  if(!this.water.tileTouchesWater(x,y))return grassKey;
  const address=`${x},${y}`,cached=this.cache.get(address);
  if(cached){cached.last=this.tick;return cached.key;}
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=32;
  const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(this.scene.textures.get(grassKey).getSourceImage() as HTMLImageElement,0,0,64,32);
  const data=ctx.getImageData(0,0,64,32);
  for(let row=0;row<32;row++)for(let col=0;col<64;col++){
   const p=(row*64+col)*4;if(!data.data[p+3])continue;
   const isoX=col+.5-32,isoY=row+.5;
   const wx=x+isoX/64+isoY/32,wy=y+isoY/32-isoX/64;
   const qx=Math.floor(wx*32),qy=Math.floor(wy*32);
   const hash=(Math.imul(qx,73856093)^Math.imul(qy,19349663))>>>0;
   const distance=this.water.distance(wx,wy)+(hash%7-3)*.009;
   const patch=(1+Math.sin(wx*1.4+Math.sin(wy*1.7)))*.5;
   const bankWidth=.15+patch*.65;
   if(distance>bankWidth)continue;
   let color:number[];
   if(distance>0){
    if(patch<.3&&hash%5)continue;
    if(distance>bankWidth*.6&&hash%3)continue;
    color=hash%3?[61,67,43]:[77,77,51];
   }else if(distance>-(.12+patch*.36)){
    color=hash%3?[52,84,73]:[64,91,75];
   }else{
    const tx=((qx%64)+64)%64,ty=((qy%64)+64)%64,source=(ty*64+tx)*4;
    color=[this.frames[0][source],this.frames[0][source+1],this.frames[0][source+2]];
   }
   const stoneHash=(Math.imul(Math.floor(qx/4),19349663)^Math.imul(Math.floor(qy/4),73856093))>>>0;
   const dx=((qx%4)+4)%4-1.5,dy=((qy%4)+4)%4-1.5;
   if(distance>-.35&&stoneHash%3===0&&patch>.45&&dx*dx+dy*dy<2.5)color=dx<0?[98,103,83]:[71,79,66];   data.data[p]=color[0];data.data[p+1]=color[1];data.data[p+2]=color[2];
  }
  ctx.putImageData(data,0,0);
  const key=`water-tile-${x}-${y}`;
  this.scene.textures.addCanvas(key,canvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
  this.cache.set(address,{key,last:this.tick});return key;
 }
 update(time:number){this.surface.update(time);}
 end(){
  if(this.cache.size<=2048)return;
  for(const [address,tile] of this.cache){if(tile.last!==this.tick){this.scene.textures.remove(tile.key);this.cache.delete(address);if(this.cache.size<=2048)break;}}
 }
}





