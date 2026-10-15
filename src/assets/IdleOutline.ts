import Phaser from 'phaser';
// Correct only saturated pink near the silhouette, keeping facial details intact.
export function softenIdleOutline(scene:Phaser.Scene,key:string){
 const original=scene.textures.get(key);
 if(original.getSourceImage() instanceof HTMLCanvasElement)return;
 const source=original.getSourceImage() as HTMLImageElement;
 const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
 const ctx=canvas.getContext('2d')!;ctx.drawImage(source,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),w=canvas.width,h=canvas.height;
 const distance=new Float32Array(w*h).fill(w+h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x;if(pixels.data[i*4+3]!<32)distance[i]=0;
  else distance[i]=Math.min(distance[i]!,x?distance[i-1]!+1:1,y?distance[i-w]!+1:1);
 }
 for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){
  const i=y*w+x;distance[i]=Math.min(distance[i]!,x<w-1?distance[i+1]!+1:1,y<h-1?distance[i+w]!+1:1);
  const p=i*4,r=pixels.data[p]!,g=pixels.data[p+1]!,b=pixels.data[p+2]!;
  if(distance[i]!<=w/64*5&&r>180&&r-g>55&&b>g+30){
   pixels.data[p+1]=Math.round(g+(r-g)*.36);
   pixels.data[p+2]=Math.round(b+(r-b)*.34);
  }
 }
 ctx.putImageData(pixels,0,0);scene.textures.remove(key);
 scene.textures.addCanvas(key,canvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
}
