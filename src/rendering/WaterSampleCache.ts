interface SampleWindow {left:number;top:number;width:number;height:number;values:Float32Array}
export class WaterSampleCache {
 private spare:Float32Array|null=null;
 private previous:SampleWindow|null=null;
 build(left:number,top:number,width:number,height:number,sample:(x:number,y:number)=>number){
  const old=this.previous,values=this.spare?.length===width*height?this.spare:new Float32Array(width*height);
  const dx=old?(left-old.left)/2:0,dy=old?(top-old.top)/2:0;
  const aligned=Number.isInteger(dx)&&Number.isInteger(dy);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const ox=x+dx,oy=y+dy;
   values[y*width+x]=old&&aligned&&ox>=0&&oy>=0&&ox<old.width&&oy<old.height?old.values[oy*old.width+ox]!:sample(left+x*2+1,top+y*2+1);
  }
  this.spare=old?.values??null;
  this.previous={left,top,width,height,values};return values;
 }
}
