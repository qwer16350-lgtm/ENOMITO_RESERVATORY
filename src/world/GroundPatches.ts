export interface GroundPatch {kind:0|1;x:number;y:number;radius:number;stretch:number;phase:number;points:{x:number;y:number}[]}
export function groundPatchWeight(p:GroundPatch,x:number,y:number){
 let edge=Infinity;
 const warpX=x+Math.sin(y*.35+p.phase)*1.2,warpY=y+Math.sin(x*.29-p.phase)*1.2;
 for(let i=1;i<p.points.length;i++){
  const a=p.points[i-1]!,b=p.points[i]!,dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
  const t=Math.max(0,Math.min(1,((warpX-a.x)*dx+(warpY-a.y)*dy)/length));
  const radius=p.radius*(.8+.3*Math.sin(p.phase+i+t*2));
  edge=Math.min(edge,Math.hypot(warpX-a.x-dx*t,warpY-a.y-dy*t)-radius);
 }
 edge-=Math.sin(x*1.7+p.phase)*Math.sin(y*1.3+p.phase)*.45;
 return edge<=0?1:0;
}
export class GroundPatches {
 private cells=new Map<string,GroundPatch[]>();
 readonly seed:number;
 constructor(seed:number){this.seed=seed;}
 nearby(x:number,y:number){
  const result:GroundPatch[]=[];
  for(let cx=Math.floor(x/48)-1;cx<=Math.floor(x/48)+1;cx++)for(let cy=Math.floor(y/48)-1;cy<=Math.floor(y/48)+1;cy++){
   const key=`${cx},${cy}`;let patches=this.cells.get(key);
   if(!patches){
    let state=(this.seed^Math.imul(cx+19,73856093)^Math.imul(cy+53,19349663)^0x764ba2)>>>0;
    const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    patches=[];
    for(const kind of [0,1] as const){
     const keep=random()<.5,px=cx*48+random()*48,py=cy*48+random()*48,radius=3.5+random()*3,stretch=.65+random()*.5,phase=random()*6.28;
     const points=[{x:px,y:py}];let angle=random()*Math.PI*2;
     const count=3+Math.floor(random()*3);
     for(let i=0;i<count;i++){
      angle+=(random()-.5)*1.8;const step=4+random()*4,last=points[points.length-1]!;
      points.push({x:last.x+Math.cos(angle)*step,y:last.y+Math.sin(angle)*step});
     }
     if(keep)patches.push({kind,x:px,y:py,radius,stretch,phase,points});
    }
    this.cells.set(key,patches);
   }
   result.push(...patches.filter(p=>p.points.some(point=>Math.hypot(x-point.x,y-point.y)<p.radius*1.1+7)));
  }
  return result;
 }
}
