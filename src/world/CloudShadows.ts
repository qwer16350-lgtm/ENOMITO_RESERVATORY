import {isoToWorld,worldToIso} from './Projection.ts';
export interface CloudShadow {shape:number;x:number;y:number;vx:number;vy:number;scale:number;angle:number;alpha:number}
export function makeCloudShadows(seed:number,count=768){
 let state=(seed^0x7c0a91)>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 return Array.from({length:count},(_,i)=>{
  const heading=random()*Math.PI*2,speed=24+random()*16,velocity=isoToWorld(Math.cos(heading)*speed,Math.sin(heading)*speed);
  return {shape:i%10,x:random()*1024,y:random()*1024,vx:velocity.x,vy:velocity.y,scale:1+random()*1.3,angle:random()*Math.PI*2,alpha:.32};
 });
}
export function cloudShadowPosition(cloud:CloudShadow,seconds:number){
 const wrap=(v:number)=>((v%1024)+1024)%1024;
 return worldToIso(wrap(cloud.x+cloud.vx*seconds),wrap(cloud.y+cloud.vy*seconds));
}



