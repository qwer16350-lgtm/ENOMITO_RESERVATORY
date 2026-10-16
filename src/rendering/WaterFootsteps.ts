import Phaser from 'phaser';
import type {Character} from '../entities/Character';
import type {WaterWorld} from '../world/WaterWorld';
import {worldToIso} from '../world/Projection';
interface Splash {x:number;y:number;born:number;seed:number}
export class WaterFootsteps {
 private rings:Splash[]=[];
 private previous=new Map<string,{x:number;y:number;last:number}>();
 private surface:Phaser.GameObjects.Graphics;
 private spray:Phaser.GameObjects.Graphics;
 constructor(scene:Phaser.Scene,private water:WaterWorld){
  this.surface=scene.add.graphics().setDepth(-99996);
  this.spray=scene.add.graphics();
 }
 update(time:number,characters:Character[]){
  if(document.hidden)return;
  this.surface.clear();this.spray.clear();
  for(const c of characters){
   const p=worldToIso(c.worldX,c.worldY),wet=this.water.isWater(c.worldX,c.worldY,-.05);
   const prev=this.previous.get(c.id),moved=prev&&Math.hypot(c.worldX-prev.x,c.worldY-prev.y)>.0001;
   if(wet&&moved&&time-prev.last>=(c.state==='run'?120:220)){
    if(this.rings.length>=12)this.rings.shift();
    this.rings.push({x:p.x,y:p.y+12,born:time,seed:Math.floor(time)%17});prev.last=time;
   }
   this.previous.set(c.id,{x:c.worldX,y:c.worldY,last:prev?.last??-Infinity});
   this.spray.setDepth(p.y+18);
  }
  this.rings=this.rings.filter(r=>time-r.born<850);
  for(const r of this.rings){
   const t=(time-r.born)/850,size=8+t*35;
   this.surface.lineStyle(1.5,0xc0ded1,.5*(1-t)).strokeEllipse(r.x,r.y,size,size*.42);
   if(t>.2)this.surface.lineStyle(1,0x82bcb5,.25*(1-t)).strokeEllipse(r.x,r.y,size*.65,size*.27);
   const jump=(time-r.born)/420;
   if(jump>=1)continue;
   for(let i=0;i<9;i++){
    const angle=(i/9)*Math.PI*2+r.seed,spread=12+jump*18;
    const x=r.x+Math.cos(angle)*spread,y=r.y+Math.sin(angle)*spread*.35-Math.sin(jump*Math.PI)*(9+i%3*3);
    this.spray.fillStyle(i%2?0xc8e6dc:0x8fc5c4,.75*(1-jump)).fillRect(Math.round(x),Math.round(y),i%3===0?3:2,2);
   }
  }
 }
}
