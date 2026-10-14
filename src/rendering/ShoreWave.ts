// One gentle shoreward pulse shares the surface's 4.32-second loop.
export function shoreWaveAlpha(distance:number,phase:number,time:number){
 const progress=((time/4320+phase/(Math.PI*2))%1+1)%1;
 const envelope=Math.sin(progress*Math.PI);
 const front=-.65+progress*.72;
 const crest=Math.exp(-Math.pow((distance-front)/.085,2))*.28*envelope;
 const wash=distance<front&&distance>front-.18?.05*envelope:0;
 return distance<-.85||distance>.1?0:Math.min(.3,crest+wash);
}
