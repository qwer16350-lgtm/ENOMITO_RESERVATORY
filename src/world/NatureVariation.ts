// Independent seeded visual choice: changing art variation never changes placement RNG.
export function natureMirror(seed:number,x:number,y:number,kind:number){
 const hash=(Math.imul(Math.round(x*100)+kind*137,73856093)^Math.imul(Math.round(y*100)+kind*71,19349663)^seed)>>>0;
 return (hash&1)===1;
}
