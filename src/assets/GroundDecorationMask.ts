export function extractGroundDecoration(base:Uint8ClampedArray,decorated:Uint8ClampedArray){
 const output=new Uint8ClampedArray(decorated.length);
 for(let p=0;p<decorated.length;p+=4){
  if(!decorated[p+3])continue;
  if(base[p]===decorated[p]&&base[p+1]===decorated[p+1]&&base[p+2]===decorated[p+2]&&base[p+3]===decorated[p+3])continue;
  for(let c=0;c<4;c++)output[p+c]=decorated[p+c]!;
 }
 return output;
}
export function bareDecorationKind(seed:number,x:number,y:number){
 let hash=(Math.imul(x+117,73856093)^Math.imul(y+293,19349663)^seed)>>>0;
 hash=Math.imul(hash^(hash>>>13),1274126177)>>>0;
 const value=hash%100;return value<9?0:value<17?1:-1;
}
