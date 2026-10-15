import { MITO_ANIMATION } from '../assets/AnimationConfig.ts';
const {breathe,blink,smile}=MITO_ANIMATION;
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
    if(!this.initialized){this.initialized=true;this.nextBlink=time+blink.intervalMs+this.random()*blink.intervalJitterMs;this.nextSmile=time+smile.intervalMs+this.random()*smile.intervalJitterMs;}
    if(state!=='idle'){this.blinkStart=-Infinity;this.smileStart=-Infinity;return null;}
    if(time>=this.nextSmile){this.smileStart=time;this.blinkStart=-Infinity;this.nextSmile=time+smile.intervalMs+this.random()*smile.intervalJitterMs;}
    const smileAge=time-this.smileStart;
    if(smileAge<smile.durationMs){
      if(smileAge<smile.transitionMs)return {texture:`mito-blink-${smile.close[Math.floor(smileAge/smile.transitionFrameMs)]}`,kind:'smile_transition'};
      if(smileAge>=smile.durationMs-smile.transitionMs)return {texture:`mito-blink-${smile.open[Math.min(smile.open.length-1,Math.floor((smileAge-(smile.durationMs-smile.transitionMs))/smile.transitionFrameMs))]}`,kind:'smile_transition'};
      return {texture:`mito-idle2-${Math.min(smile.frames-1,Math.floor((smileAge-smile.transitionMs)/((smile.durationMs-2*smile.transitionMs)/smile.frames)))}`,kind:'idle_2'};
    }
    const front=direction!=='N'&&direction!=='NE'&&direction!=='NW';
    if(front&&time>=this.nextBlink){this.blinkStart=time;this.nextBlink=time+blink.intervalMs+this.random()*blink.intervalJitterMs;}
    const blinkAge=time-this.blinkStart;
    if(front&&blinkAge<blink.frames*blink.frameMs)return {texture:`mito-blink-${Math.min(blink.frames-1,Math.floor(blinkAge/blink.frameMs))}`,kind:'blink'};
    const frame=Math.floor(time/breathe.frameMs)%breathe.frames;
    return {texture:`mito-breathe-${front?'S':'N'}-${frame}`,kind:'idle'};
  }
}
