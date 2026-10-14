import { MAP_SIZE } from './TileMap.ts';
interface WaterShape { x:number;y:number;x2:number;y2:number;radius:number;radius2?:number;pond:boolean }
export class WaterWorld {
  private shapes:WaterShape[]=[];
  private bins=new Map<string,WaterShape[]>();
  private values=new Float32Array((MAP_SIZE+1)*(MAP_SIZE+1)).fill(NaN);
  readonly seed:number;
  constructor(seed:number,density=.5){
    this.seed=seed>>>0;let state=(this.seed^0x51a7e123)>>>0;
    const coverage=Math.max(0,Math.min(1,density));
    const keep=(index:number)=>Math.floor((index+1)*coverage)>Math.floor(index*coverage);
    const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    const add=(shape:WaterShape)=>{
      this.shapes.push(shape);
      const padding=Math.max(shape.radius,shape.radius2??shape.radius)+3;
      for(let x=Math.max(0,Math.floor((Math.min(shape.x,shape.x2)-padding)/64));x<=Math.min(15,Math.floor((Math.max(shape.x,shape.x2)+padding)/64));x++)
        for(let y=Math.max(0,Math.floor((Math.min(shape.y,shape.y2)-padding)/64));y<=Math.min(15,Math.floor((Math.max(shape.y,shape.y2)+padding)/64));y++){
          const key=`${x},${y}`,list=this.bins.get(key)??[];list.push(shape);this.bins.set(key,list);
        }
    };
    for(let i=0;i<24;i++){
      const x=24+random()*(MAP_SIZE-48),y=24+random()*(MAP_SIZE-48),radius=7+random()*15;
      if(Math.hypot(x-511.5,y-511.5)<radius+10)continue;
      if(keep(i))add({x,y,x2:x,y2:y,radius,pond:true});
      for(let j=0;j<3;j++){const a=random()*Math.PI*2,d=random()*radius*.65;const shape={x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,x2:x,y2:y,radius:radius*(.45+random()*.35),pond:true};if(keep(i))add(shape);}
    }
    const cat=(a:number,b:number,c:number,d:number,t:number)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
    for(let stream=0;stream<4;stream++){
      const horizontal=random()<.5,offset=100+random()*824;
      const points=Array.from({length:10},(_,i)=>({x:horizontal?i*MAP_SIZE/9:offset+(random()-.5)*250,y:horizontal?offset+(random()-.5)*250:i*MAP_SIZE/9}));
      const radius=1.6+random()*2.5,phase=random()*Math.PI*2;
      const streamWidth=(position:number)=>radius*(1+.28*Math.sin(position*.8+phase)+.13*Math.sin(position*2.2+phase*.5));
      const shapes:WaterShape[]=[];
      for(let i=0;i<9;i++){
        const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(9,i+2)];
        let previous=b;
        for(let j=1;j<=12;j++){const t=j/12,next={x:cat(a.x,b.x,c.x,d.x,t),y:cat(a.y,b.y,c.y,d.y,t)};shapes.push({x:previous.x,y:previous.y,x2:next.x,y2:next.y,radius:streamWidth(i+(j-1)/12),radius2:streamWidth(i+t),pond:false});previous=next;}
      }
      if(shapes.some(s=>this.shapeDistance(s,511.5,511.5)<8))continue;
      if(keep(stream))shapes.forEach(add);
    }
    if(coverage>0&&coverage<1){
      const full=new WaterWorld(seed,1);
      const area=(world:WaterWorld)=>{
        let wet=0;for(let x=0;x<MAP_SIZE;x+=4)for(let y=0;y<MAP_SIZE;y+=4)if(world.isWater(x+2,y+2))wet++;
        return wet;
      };
      const target=area(full)*coverage;
      for(let attempt=0;attempt<2;attempt++){
        const current=area(this);if(!current||Math.abs(current-target)/target<.015)break;
        const scale=Math.max(.8,Math.min(1.25,Math.pow(target/current,1/1.5)));
        const shapes=this.shapes;this.shapes=[];this.bins.clear();this.values.fill(NaN);
        shapes.forEach(shape=>add({...shape,radius:shape.radius*scale,radius2:shape.radius2===undefined?undefined:shape.radius2*scale}));
      }
    }
  }
  private shapeDistance(s:WaterShape,x:number,y:number){
    if(s.pond)return Math.hypot(x-s.x,y-s.y)-s.radius;
    const dx=s.x2-s.x,dy=s.y2-s.y,length=dx*dx+dy*dy;
    const t=length?Math.max(0,Math.min(1,((x-s.x)*dx+(y-s.y)*dy)/length)):0;
    return Math.hypot(x-(s.x+dx*t),y-(s.y+dy*t))-(s.radius+((s.radius2??s.radius)-s.radius)*t);
  }
  private sampleGrid(x:number,y:number){
    x=Math.max(0,Math.min(MAP_SIZE,x));y=Math.max(0,Math.min(MAP_SIZE,y));
    const index=y*(MAP_SIZE+1)+x;
    if(!Number.isNaN(this.values[index]))return this.values[index];
    let distance=4,pond=false;
    for(const s of this.bins.get(`${Math.min(15,Math.floor(x/64))},${Math.min(15,Math.floor(y/64))}`)??[]){const value=this.shapeDistance(s,x,y);if(value<distance){distance=value;pond=s.pond;}}
    const phase=this.seed%997;
    distance+=Math.sin(x*.19+phase)*Math.sin(y*.15+phase)*(pond?1.4:.4)+Math.sin(x*.047+y*.034+phase)*(pond?.9:.4)+Math.sin(x*.73+y*.91+phase)*(pond?.3:.12);
    this.values[index]=distance;return distance;
  }
  distance(x:number,y:number){
    const a=Math.floor(x),b=Math.floor(y),fx=x-a,fy=y-b;
    return (this.sampleGrid(a,b)*(1-fx)+this.sampleGrid(a+1,b)*fx)*(1-fy)+(this.sampleGrid(a,b+1)*(1-fx)+this.sampleGrid(a+1,b+1)*fx)*fy;
  }
  isWater(x:number,y:number,margin=0){return this.distance(x,y)<=margin;}
  tileTouchesWater(x:number,y:number){return this.distance(x+.5,y+.5)<1.5||this.distance(x,y)<1||this.distance(x+1,y+1)<1;}
}





