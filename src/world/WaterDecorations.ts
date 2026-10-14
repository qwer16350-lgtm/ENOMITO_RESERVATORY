import {natureMirror} from './NatureVariation.ts';
import {WaterWorld} from './WaterWorld.ts';
export interface WaterDecoration {x:number;y:number;kind:number;phase:number;mirror:boolean}
export class WaterDecorations {
 private chunks=new Map<string,WaterDecoration[]>();
 private water:WaterWorld;
 constructor(water:WaterWorld){this.water=water;}
 private chunk(cx:number,cy:number){
  const key=`${cx},${cy}`,old=this.chunks.get(key);if(old)return old;
  let state=(this.water.seed^Math.imul(cx+31,73856093)^Math.imul(cy+77,19349663))>>>0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const items:WaterDecoration[]=[];
  for(let i=0;i<220;i++){
   const x=cx*32+random()*32,y=cy*32+random()*32;if(x>=1024||y>=1024)continue;
   const distance=this.water.distance(x,y);
   let kind=-1;
   if(distance<-.7&&random()<.33)kind=Math.floor(random()*3);
   else if(distance<-.1&&distance>-.9&&random()<.65)kind=3;
   else if(distance>.15&&distance<1.6&&random()<.6)kind=random()<.4?4:5;
   if(kind<0||items.some(o=>Math.hypot(o.x-x,o.y-y)<(kind<3?1.2:.7)))continue;
   items.push({x,y,kind,phase:random()*Math.PI*2,mirror:natureMirror(this.water.seed,x,y,kind+10)});
   if(kind===4)for(let pebble=0;pebble<2;pebble++){
    const angle=random()*Math.PI*2,spread=.35+random()*.5;
    const px=x+Math.cos(angle)*spread,py=y+Math.sin(angle)*spread,d=this.water.distance(px,py);
    if(px>=0&&py>=0&&px<1024&&py<1024&&d>.15&&d<1.6)items.push({x:px,y:py,kind:4,phase:0,mirror:natureMirror(this.water.seed,px,py,14)});
   }
  }
  this.chunks.set(key,items);return items;
 }
 query(left:number,top:number,right:number,bottom:number){
  const result:WaterDecoration[]=[];
  for(let x=Math.max(0,Math.floor(left/32));x<=Math.min(31,Math.floor(right/32));x++)for(let y=Math.max(0,Math.floor(top/32));y<=Math.min(31,Math.floor(bottom/32));y++)for(const item of this.chunk(x,y))if(item.x>=left&&item.x<=right&&item.y>=top&&item.y<=bottom)result.push(item);
  return result;
 }
}




