import Phaser from 'phaser';
import {makeCloudShadows,cloudShadowPosition,type CloudShadow} from '../world/CloudShadows';
import type {ViewBounds} from '../world/TileMap';
export class CloudShadowRenderer {
 private clouds:CloudShadow[];
 private pool:Phaser.GameObjects.Image[]=[];
 private visible:CloudShadow[]=[];
 private lastKey='';
 constructor(private scene:Phaser.Scene,seed:number){
  this.clouds=makeCloudShadows(seed);
  for(let shape=0;shape<10;shape++){
   const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
   const context=canvas.getContext('2d')!;
   let state=shape*9137+91;
   const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
   const lobes=4+shape%5;
   for(let i=0;i<lobes;i++){
    const x=65+random()*126,y=50+random()*28,radius=24+random()*22;
    const gradient=context.createRadialGradient(x,y,0,x,y,radius);
    gradient.addColorStop(0,'rgba(18,35,39,0.8)');gradient.addColorStop(.5,'rgba(18,35,39,0.65)');gradient.addColorStop(1,'rgba(18,35,39,0)');
    context.fillStyle=gradient;context.fillRect(x-radius,y-radius,radius*2,radius*2);
   }
   const pixels=context.getImageData(0,0,256,128);let left=256,top=128,right=0,bottom=0;
   for(let y=0;y<128;y++)for(let x=0;x<256;x++){
    const p=(y*256+x)*4;
    pixels.data[p+3]=Math.min(255,Math.round(pixels.data[p+3]/.55));
    if(pixels.data[p+3]>=16){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   }
   context.putImageData(pixels,0,0);
   const cropped=document.createElement('canvas');cropped.width=right-left+1;cropped.height=bottom-top+1;
   cropped.getContext('2d')!.drawImage(canvas,left,top,cropped.width,cropped.height,0,0,cropped.width,cropped.height);
   scene.textures.addCanvas(`cloud-shadow-${shape}`,cropped)!.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
 }
 update(time:number,view:ViewBounds){
  if(document.hidden)return;
  const seconds=time/1000,key=`${Math.floor(time/250)},${Math.floor(view.left/64)},${Math.floor(view.top/64)},${Math.round(view.right-view.left)}`;
  if(key!==this.lastKey){
   this.lastKey=key;
   this.visible=this.clouds.filter(cloud=>{const p=cloudShadowPosition(cloud,seconds),radius=320*cloud.scale*.65;return p.x+radius>view.left&&p.x-radius<view.right&&p.y+radius>view.top&&p.y-radius<view.bottom;});
   this.visible.forEach((cloud,i)=>{
    const image=this.pool[i]??(this.pool[i]=this.scene.add.image(0,0,`cloud-shadow-${cloud.shape}`).setDepth(50000));
    image.setTexture(`cloud-shadow-${cloud.shape}`).setDisplaySize(320*cloud.scale,320*cloud.scale*image.height/image.width).setRotation(cloud.angle).setAlpha(cloud.alpha).setVisible(true);
   });
   for(let i=this.visible.length;i<this.pool.length;i++)this.pool[i].setVisible(false);
  }
  this.visible.forEach((cloud,i)=>{const p=cloudShadowPosition(cloud,seconds);this.pool[i].setPosition(p.x,p.y);});
  this.scene.game.canvas.dataset.cloudShadows=String(this.visible.length);
 }
}




