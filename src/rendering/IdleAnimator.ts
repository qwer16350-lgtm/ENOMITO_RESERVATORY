import type { Direction } from '../entities/Character.ts';
export class IdleAnimator {
  private nextBlink=0;
  private nextSmile=0;
  private blinkStart=-Infinity;
  private smileStart=-Infinity;
  private initialized=false;
  private random:()=>number;
  constructor(random:()=>number=Math.random){this.random=random;}
  select(state:string, direction:Direction, time:number){
    if(!this.initialized){this.initialized=true;this.nextBlink=time+3000+this.random()*4000;this.nextSmile=time+12000+this.random()*12000;}
    if(state!=='idle'){this.blinkStart=-Infinity;this.smileStart=-Infinity;return null;}
    if(time>=this.nextSmile){this.smileStart=time;this.blinkStart=-Infinity;this.nextSmile=time+12000+this.random()*12000;}
    const smileAge=time-this.smileStart;
    if(smileAge<2400)return {texture:`mito-idle2-${Math.floor(smileAge/300)}`,kind:'idle_2'};
    const front=direction!=='N'&&direction!=='NE'&&direction!=='NW';
    if(front&&time>=this.nextBlink){this.blinkStart=time;this.nextBlink=time+3000+this.random()*4000;}
    const blinkAge=time-this.blinkStart;
    if(front&&blinkAge<280)return {texture:`mito-blink-${Math.min(3,Math.floor(blinkAge/70))}`,kind:'blink'};
    const frame=Math.floor(time/160)%24;
    return {texture:`mito-breathe-${front?'S':'N'}-${frame}`,kind:'idle'};
  }
}

