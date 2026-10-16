import {groundPatchWeight,type GroundPatch} from './GroundPatches.ts';
export function groundBlendGrid(patches:GroundPatch[],x:number,y:number){
 const grid=new Float32Array(18);
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)for(const p of patches){
  const index=((dy+1)*3+dx+1)*2+p.kind;
  grid[index]=Math.max(grid[index]!,groundPatchWeight(p,x+dx+.5,y+dy+.5));
 }
 return grid;
}
export function groundBlendWeight(grid:Float32Array,x:number,y:number,kind:number){
 const ix=x<.5?0:1,iy=y<.5?0:1,tx=x<.5?x+.5:x-.5,ty=y<.5?y+.5:y-.5;
 const at=(dx:number,dy:number)=>grid[((iy+dy)*3+ix+dx)*2+kind]!;
 return (at(0,0)*(1-tx)+at(1,0)*tx)*(1-ty)+(at(0,1)*(1-tx)+at(1,1)*tx)*ty;
}
