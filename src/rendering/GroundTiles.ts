import {prepareGroundDecorations} from '../assets/GroundDecorations';
import {bareDecorationKind} from '../assets/GroundDecorationMask';
import {groundBlendGrid,groundBlendWeight} from '../world/GroundBlend';
import Phaser from 'phaser';
import {GroundPatches,groundPatchWeight} from '../world/GroundPatches';
export class GroundTiles {
 private decorations:Uint8ClampedArray[];
 private seed:number;
 private patterns:Uint8ClampedArray[]=[];
 private patches:GroundPatches;
 private cache=new Map<string,{key:string;last:number}>();
 private tick=0;
 constructor(private scene:Phaser.Scene,seed:number){
  this.seed=seed;this.decorations=prepareGroundDecorations(scene);
  this.patches=new GroundPatches(seed);
  const grassCanvas=document.createElement('canvas');grassCanvas.width=64;grassCanvas.height=32;
  const grassContext=grassCanvas.getContext('2d')!;
  grassContext.drawImage(scene.textures.get('terrain-grass-0').getSourceImage() as HTMLCanvasElement,0,0);
  const grassPixels=grassContext.getImageData(0,0,64,32).data,grassMean=[0,0,0];let grassCount=0;
  for(let p=0;p<grassPixels.length;p+=4)if(grassPixels[p+3]!>128){grassCount++;for(let c=0;c<3;c++)grassMean[c]!+=grassPixels[p+c]!;}
  for(let c=0;c<3;c++)grassMean[c]!/=grassCount;
  for(let i=0;i<2;i++){
   const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
   const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
   ctx.drawImage(scene.textures.get(`ground-source-${i}`).getSourceImage() as HTMLImageElement,0,0,64,64);
   const data=ctx.getImageData(0,0,64,64);
   if(i===0){
    let mean=0;
    for(let p=0;p<data.data.length;p+=4)mean+=data.data[p]!*.3+data.data[p+1]!*.6+data.data[p+2]!*.1;
    mean/=64*64;
    for(let p=0;p<data.data.length;p+=4){
     const light=data.data[p]!*.3+data.data[p+1]!*.6+data.data[p+2]!*.1;
     const variation=1+(light/mean-1)*.25;
     for(let c=0;c<3;c++)data.data[p+c]=Math.min(255,Math.round(grassMean[c]!*variation*1.08));
    }
   }
   if(i===1){
    let mean=0;for(let p=0;p<data.data.length;p+=4)mean+=data.data[p]!*.3+data.data[p+1]!*.6+data.data[p+2]!*.1;mean/=4096;
    for(let p=0;p<data.data.length;p+=4){
     const shade=(data.data[p]!*.3+data.data[p+1]!*.6+data.data[p+2]!*.1)/mean;
     for(let c=0;c<3;c++)data.data[p+c]=Math.min(255,Math.round([105,88,63][c]!*shade));
    }
   }
   // Share a small repeated edge strip so the square texture wraps cleanly.
   for(let y=0;y<64;y++)for(let x=60;x<64;x++)for(let c=0;c<3;c++)data.data[(y*64+x)*4+c]=data.data[(y*64+x-60)*4+c]!;
   for(let y=60;y<64;y++)for(let x=0;x<64;x++)for(let c=0;c<3;c++)data.data[(y*64+x)*4+c]=data.data[((y-60)*64+x)*4+c]!;
   this.patterns.push(data.data);
  }
 }
 begin(){this.tick++;}
 texture(x:number,y:number,grass:string){
  const patches=this.patches.nearby(x+.5,y+.5);if(!patches.length)return grass;
  const grid=groundBlendGrid(patches,x,y);
  if(!grid.some(Boolean))return grass;
  const address=`${x},${y}`,old=this.cache.get(address);if(old){old.last=this.tick;return old.key;}
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=32;
  const ctx=canvas.getContext('2d')!;ctx.drawImage(this.scene.textures.get(grass).getSourceImage() as HTMLCanvasElement,0,0);
  const pixels=ctx.getImageData(0,0,64,32);
  const decorationKind=bareDecorationKind(this.seed,x,y),decoration=decorationKind<0?null:this.decorations[decorationKind];
  for(let row=0;row<32;row++)for(let col=0;col<64;col++){
   const p=(row*64+col)*4;if(!pixels.data[p+3])continue;
   const wx=x+(col+.5-32)/64+(row+.5)/32,wy=y+(row+.5)/32-(col+.5-32)/64;
   const tx=((Math.floor(wx*32)%64)+64)%64,ty=((Math.floor(wy*32)%64)+64)%64;
   for(let kind=0;kind<2;kind++){
    const weight=groundBlendWeight(grid,wx-x,wy-y,kind);
    for(let c=0;c<3;c++)pixels.data[p+c]=Math.round(pixels.data[p+c]!*(1-weight)+this.patterns[kind]![(ty*64+tx)*4+c]!*weight);
   }
   if(decoration&&decoration[p+3]){
    const opacity=decoration[p+3]!/255*groundBlendWeight(grid,wx-x,wy-y,0)*(1-groundBlendWeight(grid,wx-x,wy-y,1));
    for(let c=0;c<3;c++)pixels.data[p+c]=Math.round(pixels.data[p+c]!*(1-opacity)+decoration[p+c]!*opacity);
   }
  }
  ctx.putImageData(pixels,0,0);const key=`ground-patch-${x}-${y}`;
  this.scene.textures.addCanvas(key,canvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);this.cache.set(address,{key,last:this.tick});return key;
 }
 end(){if(this.cache.size>2048)for(const [address,item] of this.cache){if(item.last===this.tick)continue;this.scene.textures.remove(item.key);this.cache.delete(address);if(this.cache.size<=2048)break;}}
}
