export function spawnTreeKeepChance(x:number,y:number){
 const distance=Math.hypot(x-511.5,y-511.5);
 const t=Math.max(0,Math.min(1,(distance-18)/30));
 return .12+.88*t*t*(3-2*t);
}
