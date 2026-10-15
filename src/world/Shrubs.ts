import type {WaterWorld} from './WaterWorld.ts';
import {natureMirror} from './NatureVariation.ts';
export interface ShrubObject {id:string;kind:number;x:number;y:number;radius:number;scale:number;mirror:boolean}
export const SHRUB_SIZES=[88,100,72,84,92];
export const SHRUB_HEIGHTS=[62,58,78,64,70];
export class ShrubWorld {
 private chunks=new Map<string,ShrubObject[]>();
 constructor(seed:number,water:WaterWorld,obstacle:(x:number,y:number,r:number)=>boolean){
  let state=(seed^0x375ab19)>>>0,id=0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const place=(x:number,y:number,kind:number)=>{
   const scale=.75+random()*.25,radius=.38*scale;
   if(x<1||y<1||x>1022||y>1022||Math.hypot(x-511.5,y-511.5)<9||water.isWater(x,y,.65)||obstacle(x,y,radius))return;
   if(this.query(x-1,y-1,x+1,y+1).some(o=>Math.hypot(o.x-x,o.y-y)<o.radius+radius+.12))return;
   const o={id:`shrub:${seed}:${id++}`,kind,x,y,radius,scale,mirror:natureMirror(seed,x,y,kind+20)};
   const key=`${Math.floor(x/32)},${Math.floor(y/32)}`,chunk=this.chunks.get(key)??[];chunk.push(o);this.chunks.set(key,chunk);
  };
  for(let i=0;i<650;i++)place(random()*1024,random()*1024,Math.floor(random()*5));
  for(let i=0;i<220;i++){
   const x=random()*1024,y=random()*1024,kind=Math.floor(random()*5),r=3+random()*5,stretch=.45+random()*.5,angle=random()*Math.PI*2;
   const count=35+Math.floor(random()*65);
   for(let j=0;j<count;j++){
    const a=random()*Math.PI*2,d=Math.sqrt(random())*r,u=Math.cos(a)*d,v=Math.sin(a)*d*stretch;
    place(x+u*Math.cos(angle)-v*Math.sin(angle),y+u*Math.sin(angle)+v*Math.cos(angle),random()<.8?kind:Math.floor(random()*5));
   }
  }
 }
 query(left:number,top:number,right:number,bottom:number){
  const result:ShrubObject[]=[];
  for(let x=Math.max(0,Math.floor(left/32));x<=Math.min(31,Math.floor(right/32));x++)for(let y=Math.max(0,Math.floor(top/32));y<=Math.min(31,Math.floor(bottom/32));y++)
   for(const o of this.chunks.get(`${x},${y}`)??[])if(o.x>=left&&o.x<=right&&o.y>=top&&o.y<=bottom)result.push(o);
  return result;
 }
}
