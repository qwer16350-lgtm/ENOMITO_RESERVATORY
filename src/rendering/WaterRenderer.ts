import Phaser from 'phaser';
import lily from '../../assets/terrain/aquatic/lily-pads.png?url&no-inline';
import lotus from '../../assets/terrain/aquatic/lotus.png?url&no-inline';
import duckweed from '../../assets/terrain/aquatic/duckweed.png?url&no-inline';
import cattails from '../../assets/terrain/aquatic/cattails.png?url&no-inline';
import pebbles from '../../assets/terrain/shore/pebbles.png?url&no-inline';
import sedge from '../../assets/terrain/shore/sedge.png?url&no-inline';
import {WaterWorld} from '../world/WaterWorld';
import {WaterDecorations,type WaterDecoration} from '../world/WaterDecorations';
import {isoToWorld,worldToIso} from '../world/Projection';
import type {ViewBounds} from '../world/TileMap';
import {WORLD_LIGHT} from './WorldLighting';
const urls=[lily,lotus,duckweed,cattails,pebbles,sedge];
export class WaterRenderer {
 private decorationWorld:WaterDecorations;
 private decorations:Phaser.GameObjects.Image[]=[];
 private objects:WaterDecoration[]=[];
 private ripples:Phaser.GameObjects.Image[]=[];
 private ripplePoints:{x:number;y:number;phase:number}[]=[];
 private tick=-1;
 private drawKey='';
 static preload(scene:Phaser.Scene){urls.forEach((url,i)=>scene.load.image(`water-decoration-${i}`,url));}
 constructor(private scene:Phaser.Scene,private water:WaterWorld){
  this.decorationWorld=new WaterDecorations(water);
  urls.forEach((_,i)=>scene.textures.get(`water-decoration-${i}`).setFilter(Phaser.Textures.FilterMode.NEAREST));
  const graphics=scene.add.graphics();
  for(let frame=0;frame<4;frame++){
   graphics.clear().fillStyle(0x8ab3a7).fillRect(2+frame,2,12-frame*2,1).fillRect(4-frame,5,7+frame*2,1);
   graphics.generateTexture(`water-ripple-${frame}`,20,8);scene.textures.get(`water-ripple-${frame}`).setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  graphics.destroy();
 }
 draw(view:ViewBounds){
  const buffered={left:Math.floor(view.left/64)*64-64,top:Math.floor(view.top/64)*64-64,right:Math.ceil(view.right/64)*64+64,bottom:Math.ceil(view.bottom/64)*64+64};
  const key=`${buffered.left},${buffered.top},${buffered.right},${buffered.bottom}`;
  if(key===this.drawKey)return;this.drawKey=key;view=buffered;
  const corners=[isoToWorld(view.left-80,view.top-30),isoToWorld(view.right+80,view.top-30),isoToWorld(view.left-80,view.bottom+80),isoToWorld(view.right+80,view.bottom+80)];
  const left=Math.max(0,Math.min(...corners.map(p=>p.x))),right=Math.min(1023,Math.max(...corners.map(p=>p.x))),top=Math.max(0,Math.min(...corners.map(p=>p.y))),bottom=Math.min(1023,Math.max(...corners.map(p=>p.y)));
  this.objects=this.decorationWorld.query(left,top,right,bottom);
  this.objects.forEach((item,i)=>{
   const p=worldToIso(item.x,item.y),image=this.decorations[i]??(this.decorations[i]=this.scene.add.image(0,0,`water-decoration-${item.kind}`));
   image.setTexture(`water-decoration-${item.kind}`).setFlipX(item.mirror).setOrigin(.5,item.kind<3?.5:1).setScale(item.kind<4?1.4:2).setTint(WORLD_LIGHT.tint).setPosition(p.x,p.y+16).setDepth(item.kind<3?-99998:p.y+16).setVisible(true);
  });
  for(let i=this.objects.length;i<this.decorations.length;i++)this.decorations[i].setVisible(false);
  this.ripplePoints=[];
  for(let x=Math.floor(left/3)*3;x<=right;x+=3)for(let y=Math.floor(top/3)*3;y<=bottom;y+=3){
   const hash=(Math.imul(x+7,73856093)^Math.imul(y+11,19349663)^this.water.seed)>>>0;
   const wx=x+(hash%100)/100,wy=y+((hash>>>8)%100)/100;
   if(hash%3||this.water.distance(wx,wy)>-1)continue;
   const p=worldToIso(wx,wy);if(p.x<view.left-20||p.x>view.right+20||p.y<view.top-20||p.y>view.bottom+20)continue;
   const i=this.ripplePoints.length;this.ripplePoints.push({x:p.x,y:p.y+16,phase:hash%628/100});
   const image=this.ripples[i]??(this.ripples[i]=this.scene.add.image(p.x,p.y+16,'water-ripple-0').setDepth(-99999.5));image.setVisible(true);
  }
  for(let i=this.ripplePoints.length;i<this.ripples.length;i++)this.ripples[i].setVisible(false);
  this.scene.game.canvas.dataset.waterPlants=String(this.objects.filter(o=>o.kind<4).length);
  this.scene.game.canvas.dataset.waterRipples=String(this.ripplePoints.length);
 }
 update(time:number){
  const tick=Math.floor(time/50);if(tick===this.tick||document.hidden)return;this.tick=tick;this.scene.game.canvas.dataset.waterAnimationTick=String(tick);
  this.ripplePoints.forEach((p,i)=>{const phase=time/1000*.85+p.phase;this.ripples[i].setPosition(p.x+Math.sin(phase)*2,p.y+Math.cos(phase)*.5).setAlpha(.1+(1+Math.sin(phase))*.12).setTexture(`water-ripple-${Math.floor(time/350+p.phase)%4}`);});
  this.objects.forEach((p,i)=>{if(p.kind>2)return;const iso=worldToIso(p.x,p.y);this.decorations[i].setPosition(iso.x,iso.y+16+Math.sin(time/1200+p.phase)*.6);});
 }
}



