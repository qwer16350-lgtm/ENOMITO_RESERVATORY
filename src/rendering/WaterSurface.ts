import {shoreWaveAlpha} from './ShoreWave';
import {WORLD_LIGHT} from './WorldLighting';
import Phaser from 'phaser';
import {WaterWorld} from '../world/WaterWorld';
import {isoToWorld} from '../world/Projection';
export class WaterSurface {
 private texture:Phaser.Textures.CanvasTexture;
 private image:Phaser.GameObjects.Image;
 private key='';private frame=-1;
 private data:ImageData;private samples:number[]=[];private shores:number[]=[];
 constructor(private scene:Phaser.Scene,private water:WaterWorld,private frames:Uint8ClampedArray[]){
  this.texture=scene.textures.createCanvas('animated-water-surface',8,8)!;
  this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  this.data=this.texture.context.createImageData(8,8);
  this.image=scene.add.image(0,0,'animated-water-surface').setOrigin(0,0).setScale(2).setTint(WORLD_LIGHT.tint).setDepth(-99999.75);
 }
 update(time:number){
  const view=this.scene.cameras.main.worldView;
  const left=Math.floor(view.left/16)*16-16,top=Math.floor(view.top/16)*16-16;
  const width=Math.ceil((view.width+48)/2),height=Math.ceil((view.height+48)/2);
  const key=`${left},${top},${width},${height}`;
  if(key!==this.key){
   this.key=key;this.texture.setSize(width,height);this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
   this.data=this.texture.context.createImageData(width,height);this.samples=[];this.shores=[];
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const world=isoToWorld(left+x*2+1,top+y*2+1);
    if(world.x<0||world.y<0||world.x>=1024||world.y>=1024)continue;
    const distance=this.water.distance(world.x,world.y);
    if(distance>=-.65){
      if(distance<=.1)this.shores.push((y*width+x)*4,distance,world.x*.035+world.y*.025);
      continue;
    }
    const tx=((Math.floor(world.x*32)%64)+64)%64,ty=((Math.floor(world.y*32)%64)+64)%64,p=(y*width+x)*4;
    this.samples.push(p,(ty*64+tx)*4);this.data.data[p+3]=255;
   }
   this.image.setTexture(this.texture.key).setScale(2).setPosition(left,top);this.frame=-1;
  }
  const frame=Math.floor(time/180)%24;if(frame===this.frame)return;this.frame=frame;
  const source=this.frames[frame];
  for(let i=0;i<this.samples.length;i+=2){const p=this.samples[i],s=this.samples[i+1];for(let c=0;c<3;c++)this.data.data[p+c]=source[s+c];}
  for(let i=0;i<this.shores.length;i+=3){
    const p=this.shores[i],alpha=shoreWaveAlpha(this.shores[i+1],this.shores[i+2],frame*180);
    this.data.data[p]=128;this.data.data[p+1]=161;this.data.data[p+2]=142;this.data.data[p+3]=Math.round(alpha*255);
  }
  this.texture.context.putImageData(this.data,0,0);this.texture.refresh();
  this.scene.game.canvas.dataset.surfaceFrame=String(frame);
 }
}


