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
   // A turbulent density field produces wispy edges and uneven cloud thickness.
   const grids=[4,8,16,32].map(size=>({size,values:Array.from({length:(size+1)*(size+1)},()=>random())}));
   const noise=(x:number,y:number)=>grids.reduce((sum,g,i)=>{
    const gx=x/256*g.size,gy=y/128*g.size,ix=Math.floor(gx),iy=Math.floor(gy);
    const smooth=(t:number)=>t*t*(3-2*t),tx=smooth(gx-ix),ty=smooth(gy-iy);
    const at=(dx:number,dy:number)=>g.values[(iy+dy)*(g.size+1)+ix+dx]!;
    return sum+((at(0,0)*(1-tx)+at(1,0)*tx)*(1-ty)+(at(0,1)*(1-tx)+at(1,1)*tx)*ty)*[.55,.27,.13,.05][i]!;
   },0);
   const masses=Array.from({length:4+shape%3},()=>({x:65+random()*125,y:40+random()*48,rx:24+random()*35,ry:16+random()*25}));
   const pixels=context.createImageData(256,128);let left=256,top=128,right=0,bottom=0,maxAlpha=0;
   for(let y=0;y<128;y++)for(let x=0;x<256;x++){
    const n=noise(x,y),wx=x+(noise((x+57)%256,(y+31)%128)-.5)*26,wy=y+(n-.5)*20;
    let density=0;
    for(const m of masses){const d=((wx-m.x)/m.rx)**2+((wy-m.y)/m.ry)**2;density+=Math.exp(-d*1.8);}
    const value=Math.max(0,Math.min(1,(density*(.55+n*.9)-.16)*1.3));
    const alpha=Math.round(value*255),p=(y*256+x)*4;
    pixels.data[p]=18;pixels.data[p+1]=35;pixels.data[p+2]=39;pixels.data[p+3]=alpha;
    maxAlpha=Math.max(maxAlpha,alpha);
    if(alpha>=8){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   }
   for(let p=3;p<pixels.data.length;p+=4)pixels.data[p]=Math.round(pixels.data[p]!/maxAlpha*255);
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
