export function windVelocity(seed:number,time:number){
 const phase=(seed%997)/997*Math.PI*2;
 const heading=phase+Math.sin(time/70000)*.35;
 const speed=30+Math.sin(time/11000+phase)*6;
 return {x:Math.cos(heading)*speed,y:Math.sin(heading)*speed};
}
