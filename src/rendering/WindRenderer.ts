import Phaser from 'phaser';
import {windVelocity} from '../world/Wind';
import type {ViewBounds} from '../world/TileMap';
interface GustParticle {image:Phaser.GameObjects.Image;x:number;y:number;vx:number;vy:number;born:number;life:number;phase:number;leaf:boolean}
export class WindRenderer {
 private particles:GustParticle[]=[];private nextSpawn=0;private state:number;private last=0;
 constructor(private scene:Phaser.Scene,private seed:number){
  this.state=(seed^0x71ad52)>>>0;
  const g=scene.add.graphics();
  g.fillStyle(0xb6bd78).fillRect(1,2,5,2).fillRect(3,1,3,1).fillStyle(0x748b4e).fillRect(0,3,3,1).generateTexture('wind-leaf',8,6);
  g.clear().fillStyle(0xd7dcc0).fillRect(0,0,2,2).generateTexture('wind-mote',2,2);g.destroy();
 }
 private random(){this.state=(Math.imul(this.state,1664525)+1013904223)>>>0;return this.state/4294967296;}
 update(time:number,view:ViewBounds){
  if(document.hidden){this.last=time;return;}
  const dt=Math.min(100,Math.max(0,time-this.last))/1000;this.last=time;
  this.particles.forEach(p=>{
   if(!p.image.visible)return;
   const progress=(time-p.born)/p.life;
   if(progress>=1){p.image.setVisible(false);return;}
   const breeze=windVelocity(this.seed,time);
   const baseHeading=Math.atan2(breeze.y,breeze.x);
   const bend=Math.sin(time/2100+p.phase)*.42+Math.sin(time/5300+p.phase*2)*.28;
   const heading=baseHeading+bend;
   const gust=1+Math.max(0,Math.sin(time/2800+this.seed%17))*.45;
   const speed=Math.hypot(breeze.x,breeze.y)*1.8*gust*(.8+p.phase/(Math.PI*2)*.4);
   const blend=1-Math.exp(-dt*2.5);
   p.vx+=(Math.cos(heading)*speed-p.vx)*blend;
   p.vy+=(Math.sin(heading)*speed-p.vy)*blend;
   p.x+=p.vx*dt;p.y+=p.vy*dt;
   const fade=Math.min(1,progress/.12,(1-progress)/.2);
   p.image.setPosition(p.x,p.y+Math.sin(time/650+p.phase)*(p.leaf?3:1)).setAlpha(fade*(p.leaf?.42:.28)).setRotation(p.leaf?Math.atan2(p.vy,p.vx)+Math.sin(time/550+p.phase)*.5:0);
  });
  if(time<this.nextSpawn)return;this.nextSpawn=time+550+this.random()*650;
  if(this.particles.filter(p=>p.image.visible).length>=22)return;
  const velocity=windVelocity(this.seed,time),leaf=this.random()<.6;
  let p=this.particles.find(p=>!p.image.visible);
  if(!p){p={image:this.scene.add.image(0,0,'wind-leaf').setDepth(50001),x:0,y:0,vx:0,vy:0,born:0,life:0,phase:0,leaf};this.particles.push(p);}
  p.x=Math.abs(velocity.x)>Math.abs(velocity.y)?(velocity.x>0?view.left+this.random()*(view.right-view.left)*.6:view.right-this.random()*(view.right-view.left)*.6):view.left+this.random()*(view.right-view.left);
  p.y=Math.abs(velocity.x)>Math.abs(velocity.y)?view.top+this.random()*(view.bottom-view.top):(velocity.y>0?view.top+this.random()*(view.bottom-view.top)*.6:view.bottom-this.random()*(view.bottom-view.top)*.6);
  p.vx=velocity.x*1.8;p.vy=velocity.y*1.8;p.born=time;p.life=14000+this.random()*6000;p.phase=this.random()*Math.PI*2;p.leaf=leaf;
  p.image.setTexture(leaf?'wind-leaf':'wind-mote').setScale(leaf?1.5+this.random()*.6:1.5).setPosition(p.x,p.y).setAlpha(0).setVisible(true);
  this.scene.game.canvas.dataset.windParticles=String(this.particles.filter(p=>p.image.visible).length);
 }
}
