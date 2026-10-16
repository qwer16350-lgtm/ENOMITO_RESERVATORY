import Phaser from 'phaser';
const caches=new WeakMap<Phaser.Textures.TextureManager,string[]>();
export function wetCharacterTexture(scene:Phaser.Scene,key:string){
 const wetKey=`water-feet-${key}`;
 if(scene.textures.exists(wetKey))return wetKey;
 const source=scene.textures.get(key).getSourceImage() as HTMLCanvasElement|HTMLImageElement;
 const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
 const ctx=canvas.getContext('2d')!;ctx.drawImage(source,0,0);
 const data=ctx.getImageData(0,0,canvas.width,canvas.height),w=canvas.width,h=canvas.height;
 let bottom=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data.data[(y*w+x)*4+3]!>128)bottom=Math.max(bottom,y+1);
 const band=h/64*11,start=bottom-band;
 for(let y=Math.max(0,Math.floor(start));y<bottom;y++)for(let x=0;x<w;x++){
  const p=(y*w+x)*4,t=Math.min(1,(y-start)/band);
  data.data[p]=Math.round(data.data[p]!*(1-t*.22)+69*t*.22);
  data.data[p+1]=Math.round(data.data[p+1]!*(1-t*.22)+127*t*.22);
  data.data[p+2]=Math.round(data.data[p+2]!*(1-t*.22)+129*t*.22);
  data.data[p+3]=Math.round(data.data[p+3]!*(1-t*.65));
 }
 ctx.putImageData(data,0,0);scene.textures.addCanvas(wetKey,canvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
 const cache=caches.get(scene.textures)??[];cache.push(wetKey);caches.set(scene.textures,cache);
 if(cache.length>128)scene.textures.remove(cache.shift()!);
 return wetKey;
}
