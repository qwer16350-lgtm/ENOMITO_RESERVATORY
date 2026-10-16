import {WaterSampleCache} from './WaterSampleCache';
import {shoreWaveAlpha} from './ShoreWave';
import {WORLD_LIGHT} from './WorldLighting';
import Phaser from 'phaser';
import {WaterWorld} from '../world/WaterWorld';

export class CanvasWaterSurface {
 private texture:Phaser.Textures.CanvasTexture;
 private image:Phaser.GameObjects.Image;
 private sampleCache=new WaterSampleCache();
 private key='';private frame=-1;
 private data:ImageData;private samples=new Int32Array(0);private shores=new Float32Array(0);
 private sampleCount=0;private shoreCount=0;
 constructor(private scene:Phaser.Scene,private water:WaterWorld,private frames:Uint8ClampedArray[]){
  this.texture=scene.textures.createCanvas('animated-water-surface',8,8)!;
  this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  this.data=this.texture.context.createImageData(8,8);
  this.image=scene.add.image(0,0,'animated-water-surface').setOrigin(0,0).setScale(2).setTint(WORLD_LIGHT.tint).setDepth(-99999.75);
 }
 update(time:number){
  const view=this.scene.cameras.main.worldView;
  const left=Math.floor(view.left/64)*64-64,top=Math.floor(view.top/64)*64-64;
  const width=Math.ceil((view.width+192)/128)*64,height=Math.ceil((view.height+192)/128)*64;
  const key=`${left},${top},${width},${height}`;
  if(key!==this.key){
   this.key=key;
   if(this.texture.width!==width||this.texture.height!==height){this.texture.setSize(width,height);this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);}
   if(this.data.width!==width||this.data.height!==height){
    this.data=this.texture.context.createImageData(width,height);
    this.samples=new Int32Array(width*height*2);this.shores=new Float32Array(width*height*3);
   }else this.data.data.fill(0);
   this.sampleCount=0;this.shoreCount=0;
   const distances=this.sampleCache.build(left,top,width,height,(isoX,isoY)=>{
    const wx=isoX/64+isoY/32,wy=isoY/32-isoX/64;
    return wx<0||wy<0||wx>=1024||wy>=1024?Infinity:this.water.distance(wx,wy);
   });
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const distance=distances[y*width+x];if(!Number.isFinite(distance))continue;
    const isoX=left+x*2+1,isoY=top+y*2+1,wx=isoX/64+isoY/32,wy=isoY/32-isoX/64;

    if(distance>=-.65){
      if(distance<=.1){this.shores[this.shoreCount++]=(y*width+x)*4;this.shores[this.shoreCount++]=distance;this.shores[this.shoreCount++]=wx*.035+wy*.025;}
      continue;
    }
    const tx=((Math.floor(wx*32)%64)+64)%64,ty=((Math.floor(wy*32)%64)+64)%64,p=(y*width+x)*4;
    this.samples[this.sampleCount++]=p;this.samples[this.sampleCount++]=(ty*64+tx)*4;this.data.data[p+3]=255;
   }
   this.image.setTexture(this.texture.key).setScale(2).setPosition(left,top);this.frame=-1;
  }
  const frame=Math.floor(time/180)%24;if(frame===this.frame)return;this.frame=frame;
  const source=this.frames[frame];
  for(let i=0;i<this.sampleCount;i+=2){const p=this.samples[i],s=this.samples[i+1];for(let c=0;c<3;c++)this.data.data[p+c]=source[s+c];}
  for(let i=0;i<this.shoreCount;i+=3){
    const p=this.shores[i],alpha=shoreWaveAlpha(this.shores[i+1],this.shores[i+2],frame*180);
    this.data.data[p]=128;this.data.data[p+1]=161;this.data.data[p+2]=142;this.data.data[p+3]=Math.round(alpha*255);
  }
  if(!this.sampleCount&&!this.shoreCount){this.image.setVisible(false);return;}
  this.image.setVisible(true);
  this.texture.context.putImageData(this.data,0,0);this.texture.refresh();
  this.scene.game.canvas.dataset.surfaceFrame=String(frame);
 }
}
