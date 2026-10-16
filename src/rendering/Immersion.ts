export function immersionTarget(distance:number){
 const t=Math.max(0,Math.min(1,(.25-distance)/1.1));return t*t*(3-2*t);
}
export function smoothImmersion(current:number,target:number,delta:number){
 const value=current+(target-current)*(1-Math.exp(-Math.max(0,delta)/140));
 return Math.abs(value-target)<.001?target:value;
}
