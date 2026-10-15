export interface GroundFootprint { x:number; y:number; width:number; height:number }
export function groundFootprint(data:Uint8ClampedArray,width:number,height:number):GroundFootprint {
  let weight=0,xTotal=0,yTotal=0;
  let bottom=height;
  search: for(let y=height-1;y>=0;y--)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]!>=128){bottom=y+1;break search;}
  for(let y=Math.max(0,bottom-Math.max(1,Math.ceil(height*.12)));y<bottom;y++)for(let x=0;x<width;x++){
    const alpha=data[(y*width+x)*4+3];
    if(alpha<128)continue;
    weight+=alpha;xTotal+=(x+.5)*alpha;yTotal+=(y+.5)*alpha;
  }
  return {x:weight?xTotal/weight:width/2,y:weight?yTotal/weight:height,width,height};
}
export function projectShadowPoint(x:number,y:number,height:number){return {x:x+.45*(height-y)+2,y:.24*(height-y)+2};}

export function groundAnchor(foot:GroundFootprint,x:number,y:number,scale:number,mirror:boolean){
 const localX=mirror?foot.width-foot.x:foot.x;
 return {x:x+(localX-foot.width/2)*scale,y:y+(foot.y-foot.height)*scale,localX};
}
