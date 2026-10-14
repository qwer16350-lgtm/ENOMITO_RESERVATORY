import {natureMirror} from './NatureVariation.ts';
import { spawnTreeKeepChance } from './SpawnArea.ts';
import { WaterWorld } from './WaterWorld.ts';
import { ROCK_RADII, type RockObject } from './Rocks.ts';
import { MAP_SIZE } from './TileMap.ts';
export interface NatureObject { id: string; kind: number; x: number; y: number; radius: number; mirror:boolean }
export const TREE_SIZES = [212,185,159,132,106];
export const TREE_HEIGHTS = [317,273,229,185,141];
const RADII=[1.7,1.3,1,.76,.56];
export class NatureWorld {
  private rockChunks=new Map<string,RockObject[]>();
  private chunks=new Map<string,NatureObject[]>();
  readonly seed: number;
  readonly water: WaterWorld;
  constructor(seed=1) {
    this.seed=seed>>>0;
    this.water=new WaterWorld(this.seed);
    let state=this.seed;
    const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    const bigCells=new Map<string,NatureObject[]>();
    const nearbyBig=(x:number,y:number)=>{
      const found:NatureObject[]=[];
      for(let cx=Math.floor((x-6)/16);cx<=Math.floor((x+6)/16);cx++)for(let cy=Math.floor((y-6)/16);cy<=Math.floor((y+6)/16);cy++)found.push(...(bigCells.get(`${cx},${cy}`)??[]));
      return found.some(o=>Math.hypot(o.x-x,o.y-y)<=6);
    };
    let id=0;
    const add=(kind:number,x:number,y:number)=>{
      if(x<0||y<0||x>=MAP_SIZE||y>=MAP_SIZE||Math.hypot(x-511.5,y-511.5)<3||nearbyBig(x,y)||this.water.isWater(x,y,1.5))return;
      const densityHash=(Math.imul(Math.round(x*100)+31,73856093)^Math.imul(Math.round(y*100)+77,19349663)^this.seed)>>>0;
      if((densityHash&65535)/65536>spawnTreeKeepChance(x,y))return;
      const object={id:`${this.seed}:${id++}`,kind,x,y,radius:RADII[kind],mirror:natureMirror(this.seed,x,y,kind)};
      const key=`${Math.floor(x/32)},${Math.floor(y/32)}`;
      const chunk=this.chunks.get(key)??[];chunk.push(object);this.chunks.set(key,chunk);
      if(kind===0){const key=`${Math.floor(x/16)},${Math.floor(y/16)}`;const list=bigCells.get(key)??[];list.push(object);bigCells.set(key,list);}
    };
    for(let i=0;i<340;i++)add(0,random()*MAP_SIZE,random()*MAP_SIZE);
    const clusters=[0,200,240,280,320];
    const minimum=[0,3,6,10,20], extra=[0,4,7,11,21];
    // Shared woodland regions collect species-specific clusters into irregular forests.
    const forests=Array.from({length:36},()=>({
      x:80+random()*(MAP_SIZE-160),y:80+random()*(MAP_SIZE-160),
      radius:35+random()*40,stretch:.55+random()*.65,rotation:random()*Math.PI*2,
    }));
    for(let kind=1;kind<5;kind++)for(let cluster=0;cluster<clusters[kind];cluster++){
      const forest=forests[Math.floor(random()*forests.length)];
      const regionAngle=random()*Math.PI*2,regionDistance=Math.sqrt(random())*forest.radius;
      const regionX=Math.cos(regionAngle)*regionDistance,regionY=Math.sin(regionAngle)*regionDistance*forest.stretch;
      const inForest=random()<.9;
      const cx=inForest?forest.x+regionX*Math.cos(forest.rotation)-regionY*Math.sin(forest.rotation):random()*MAP_SIZE;
      const cy=inForest?forest.y+regionX*Math.sin(forest.rotation)+regionY*Math.cos(forest.rotation):random()*MAP_SIZE;
      const count=minimum[kind]+Math.floor(random()*extra[kind]);
      const radius=(3+random()*5)*(1+kind*.12),rotation=random()*Math.PI*2,stretch=.45+random()*.8;
      for(let n=0;n<count;n++){
        const angle=random()*Math.PI*2,distance=Math.sqrt(random())*radius;
        const x=Math.cos(angle)*distance,y=Math.sin(angle)*distance*stretch;
        add(kind,cx+x*Math.cos(rotation)-y*Math.sin(rotation),cy+x*Math.sin(rotation)+y*Math.cos(rotation));
      }
    }
    // Separate seed stream keeps existing tree positions unchanged when adding rocks.
    let rockState=(this.seed^0x9e3779b9)>>>0;
    const rockRandom=()=>{rockState=(Math.imul(rockState,1664525)+1013904223)>>>0;return rockState/4294967296;};
    const placeRock=(x:number,y:number)=>{
      const kind=Math.floor(rockRandom()*3),radius=ROCK_RADII[kind];
      if(x<0||y<0||x>=MAP_SIZE||y>=MAP_SIZE||Math.hypot(x-511.5,y-511.5)<radius+3||nearbyBig(x,y)||this.water.isWater(x,y,radius+.5))return;
      if(this.query(x-6,y-6,x+6,y+6).some(o=>Math.hypot(o.x-x,o.y-y)<o.radius+radius+.4))return;
      if(this.queryRocks(x-6,y-6,x+6,y+6).some(o=>Math.hypot(o.x-x,o.y-y)<o.radius+radius+.5))return;
      const object={id:`rock:${this.seed}:${id++}`,kind,x,y,radius,mirror:natureMirror(this.seed,x,y,kind+5)};
      const key=`${Math.floor(x/32)},${Math.floor(y/32)}`;const list=this.rockChunks.get(key)??[];list.push(object);this.rockChunks.set(key,list);
    };
    for(let i=0;i<2200;i++)placeRock(rockRandom()*MAP_SIZE,rockRandom()*MAP_SIZE);
    for(let cluster=0;cluster<150;cluster++){
      const x=rockRandom()*MAP_SIZE,y=rockRandom()*MAP_SIZE;
      for(let i=0;i<5;i++){const angle=rockRandom()*Math.PI*2,distance=rockRandom()*12;placeRock(x+Math.cos(angle)*distance,y+Math.sin(angle)*distance);}
    }
  }
  queryRocks(left:number,top:number,right:number,bottom:number){
    const result:RockObject[]=[];
    for(let x=Math.max(0,Math.floor(left/32));x<=Math.min(31,Math.floor(right/32));x++)for(let y=Math.max(0,Math.floor(top/32));y<=Math.min(31,Math.floor(bottom/32));y++)
      for(const o of this.rockChunks.get(`${x},${y}`)??[])if(o.x>=left&&o.x<=right&&o.y>=top&&o.y<=bottom)result.push(o);
    return result;
  }
  visitRocks(visitor:(object:RockObject)=>void){for(const chunk of this.rockChunks.values())for(const object of chunk)visitor(object);}
  query(left:number,top:number,right:number,bottom:number){
    const result:NatureObject[]=[];
    for(let x=Math.max(0,Math.floor(left/32));x<=Math.min(31,Math.floor(right/32));x++)for(let y=Math.max(0,Math.floor(top/32));y<=Math.min(31,Math.floor(bottom/32));y++)
      for(const o of this.chunks.get(`${x},${y}`)??[])if(o.x>=left&&o.x<=right&&o.y>=top&&o.y<=bottom)result.push(o);
    return result;
  }
  visitAll(visitor:(object:NatureObject)=>void){for(const chunk of this.chunks.values())for(const object of chunk)visitor(object);}
  touchingTree(x:number,y:number){return this.query(x-3,y-3,x+3,y+3).some(o=>Math.hypot(o.x-x,o.y-y)<=o.radius+.32);}
  blocked(x:number,y:number){if(x<0||y<0||x>MAP_SIZE-1||y>MAP_SIZE-1)return true;if(this.water.isWater(x,y,.22))return true;return this.query(x-3,y-3,x+3,y+3).some(o=>Math.hypot(o.x-x,o.y-y)<o.radius+.22)||this.queryRocks(x-3,y-3,x+3,y+3).some(o=>Math.hypot(o.x-x,o.y-y)<o.radius+.22);}
}






