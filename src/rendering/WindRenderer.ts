import Phaser from 'phaser';
import {windVelocity} from '../world/Wind';
import type {ViewBounds} from '../world/TileMap';
interface GustParticle {image:Phaser.GameObjects.Image;x:number;y:number;vx:number;vy:number;born:number;life:number;phase:number;leaf:boolean}
export class WindRenderer {
 private particles:GustParticle[]=[];private nextSpawn=0;private state:number;private last=0;
 constructor(private scene:Phaser.Scene,private seed:number){
  this.state=(seed^0x71ad52)>>>0;
  const g=scene.add.graphics();
  g.fillStyle(0x82905d).fillRect(1,2,5,2).fillRect(3,1,3,1).fillStyle(0x4b6542).fillRect(0,3,3,1).generateTexture('wind-leaf',8,6);
  g.clear().fillStyle(0xb5c0a1).fillRect(0,0,2,2).generateTexture('wind-mote',2,2);g.destroy();
 }
 private random(){this.state=(Math.imul(this.state,1664525)+1013904223)>>>0;return this.state/4294967296;}
 update(time:number,view:ViewBounds){
  if(document.hidden){this.last=time;return;}
  const dt=Math.min(100,Math.max(0,time-this.last))/1000;this.last=time;
  this.particles.forEach(p=>{
   if(!p.image.visible)return;
   const progress=(time-p.born)/p.life;
   if(progress>=1){p.image.setVisible(false);return;}
   p.x+=p.vx*dt;p.y+=p.vy*dt;
   const fade=Math.min(1,progress/.12,(1-progress)/.2);
   p.image.setPosition(p.x,p.y+Math.sin(time/650+p.phase)*(p.leaf?3:1)).setAlpha(fade*(p.leaf?.3:.16)).setRotation(p.leaf?Math.sin(time/1100+p.phase)*.7:0);
  });
  if(time<this.nextSpawn)return;this.nextSpawn=time+900+this.random()*900;
  if(this.particles.filter(p=>p.image.visible).length>=14)return;
  const velocity=windVelocity(this.seed,time),leaf=this.random()<.6;
  let p=this.particles.find(p=>!p.image.visible);
  if(!p){p={image:this.scene.add.image(0,0,'wind-leaf').setDepth(50001),x:0,y:0,vx:0,vy:0,born:0,life:0,phase:0,leaf};this.particles.push(p);}
  p.x=Math.abs(velocity.x)>Math.abs(velocity.y)?(velocity.x>0?view.left-15:view.right+15):view.left+this.random()*(view.right-view.left);
  p.y=Math.abs(velocity.x)>Math.abs(velocity.y)?view.top+this.random()*(view.bottom-view.top):(velocity.y>0?view.top-15:view.bottom+15);
  p.vx=velocity.x;p.vy=velocity.y;p.born=time;p.life=14000+this.random()*6000;p.phase=this.random()*Math.PI*2;p.leaf=leaf;
  p.image.setTexture(leaf?'wind-leaf':'wind-mote').setScale(leaf?1+this.random()*.5:1).setPosition(p.x,p.y).setAlpha(0).setVisible(true);
  this.scene.game.canvas.dataset.windParticles=String(this.particles.filter(p=>p.image.visible).length);
 }
}

