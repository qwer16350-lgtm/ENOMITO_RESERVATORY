import Phaser from 'phaser';
import {allocateShrubMaskKey} from './ShrubMaskKey';
import {SHRUB_URLS} from '../assets/ShrubAssets';
import {SHRUB_SIZES,SHRUB_HEIGHTS} from '../world/Shrubs';
import type {NatureWorld} from '../world/NatureWorld';
import {StaticNatureRenderer} from './StaticNatureRenderer';

const assets={prefix:'shrub',urls:SHRUB_URLS,sizes:SHRUB_SIZES,heights:SHRUB_HEIGHTS,shadowOffset:200,trim:1};
export class ShrubRenderer extends StaticNatureRenderer {
 static preload(scene:Phaser.Scene){StaticNatureRenderer.preload(scene,assets);}
 private motion=new Map<Phaser.GameObjects.Image,{rotation:number;lastTouch:number;direction:number;source:string;scale:number;maskKey:string;signature:string;mask?:Phaser.Textures.CanvasTexture}>();
 private lastMask=0;
 updateInteraction(time:number,delta:number,characters:Phaser.GameObjects.Image[]){
  const refresh=time-this.lastMask>=33;if(refresh)this.lastMask=time;
  for(const image of this.images){
   if(!image.visible)continue;
   let state=this.motion.get(image);
   const sourceKey=image.texture.key.startsWith('shrub-pixel-')?image.texture.key:state?.source;
   if(!sourceKey)continue;
   if(!state){state={rotation:0,lastTouch:-Infinity,direction:1,source:sourceKey,scale:image.scaleX,maskKey:allocateShrubMaskKey(),signature:''};this.motion.set(image,state);}
   // Pool entries may change species and scale after a camera move.
   if(image.texture.key.startsWith('shrub-pixel-')){state.source=sourceKey;state.scale=image.scaleX;}
   const nearby=characters.find(c=>Math.abs(c.x-image.x)<image.displayWidth*.55&&Math.abs(c.y-image.y)<24);
   if(nearby){state.lastTouch=time;state.direction=nearby.x<image.x?1:-1;}
   const age=time-state.lastTouch;
   const target=nearby?state.direction*.12:age<700?Math.sin(age/95)*.06*Math.exp(-age/230):0;
   state.rotation+=(target-state.rotation)*(1-Math.exp(-Math.min(delta,100)/75));
   image.setRotation(state.rotation);
   if(!refresh)continue;
   const source=this.scene.textures.get(state.source).getSourceImage() as HTMLCanvasElement;
   const hidden=characters.filter(c=>image.depth>c.depth&&Phaser.Geom.Intersects.RectangleToRectangle(image.getBounds(),c.getBounds()));
   if(!hidden.length){state.signature='';image.setTexture(state.source);continue;}
   const signature=[state.source,image.flipX,Math.round(image.rotation*100),...hidden.flatMap(c=>[Math.round((c.x-image.x)/state.scale),Math.round((c.y-image.y)/state.scale),Math.round(c.displayWidth/state.scale),Math.round(c.displayHeight/state.scale)])].join(',');
   if(state.mask&&state.signature===signature){image.setTexture(state.mask.key);continue;}
   if(!state.mask){
    const texture=this.scene.textures.createCanvas(state.maskKey,source.width,source.height);
    if(!texture){image.setTexture(state.source);continue;}
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST);state.mask=texture;
   }
   state.signature=signature;
   const mask=state.mask,canvas=mask.getSourceImage() as HTMLCanvasElement;
   if(canvas.width!==source.width||canvas.height!==source.height){mask.setSize(source.width,source.height);}
   const ctx=mask.context;ctx.clearRect(0,0,source.width,source.height);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.drawImage(source,0,0);
   ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=.5;
   for(const c of hidden){
    const bounds=c.getBounds(),dx=bounds.centerX-image.x,dy=bounds.centerY-image.y;
    const cosine=Math.cos(-image.rotation),sine=Math.sin(-image.rotation);
    let x=(dx*cosine-dy*sine)/state.scale+source.width/2;
    const y=(dx*sine+dy*cosine)/state.scale+source.height;
    if(image.flipX)x=source.width-x;
    ctx.beginPath();ctx.ellipse(x,y,bounds.width/state.scale*.5,bounds.height/state.scale*.5,0,0,Math.PI*2);ctx.fill();
   }
   ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';mask.refresh();image.setTexture(mask.key);
  }
 }
 constructor(scene:Phaser.Scene,world:NatureWorld){
  super(scene,assets,(...bounds)=>world.shrubs.query(...bounds));
  scene.events.once('shutdown',()=>{
   for(const state of this.motion.values())if(state.mask)scene.textures.remove(state.maskKey);
   this.motion.clear();
  });
 }
}
