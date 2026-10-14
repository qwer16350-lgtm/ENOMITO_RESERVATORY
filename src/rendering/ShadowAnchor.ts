export interface GroundFootprint { x:number; y:number; width:number; height:number }
export function groundFootprint(data:Uint8ClampedArray,width:number,height:number):GroundFootprint {
  let weight=0,xTotal=0,yTotal=0;
  for(let y=Math.floor(height*.88);y<height;y++)for(let x=0;x<width;x++){
    const alpha=data[(y*width+x)*4+3];
    if(alpha<128)continue;
    weight+=alpha;xTotal+=(x+.5)*alpha;yTotal+=(y+.5)*alpha;
  }
  return {x:weight?xTotal/weight:width/2,y:weight?yTotal/weight:height,width,height};
}
export function projectShadowPoint(x:number,y:number,height:number){return {x:x+.45*(height-y)+2,y:.24*(height-y)+2};}
