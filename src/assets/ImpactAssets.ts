import Phaser from 'phaser';
export function prepareImpactAsset(scene:Phaser.Scene){
 if(scene.textures.exists('mito-impact'))return;
 const source=scene.textures.get('mito-blink-1').getSourceImage() as HTMLImageElement|HTMLCanvasElement;
 const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
 const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.drawImage(source,0,0);
 const scale=canvas.width/64;
 // Clear the previous closed-eye strokes using adjacent cheek/body colors.
 const data=ctx.getImageData(0,0,canvas.width,canvas.height);
 for(const [left,right,sampleX] of [[19,30,31],[34,45,32]]){
  for(let y=Math.floor(32*scale);y<40*scale;y++)for(let x=Math.floor(left*scale);x<right*scale;x++){
   const p=(y*canvas.width+x)*4,q=(y*canvas.width+Math.floor(sampleX*scale))*4;
   for(let c=0;c<3;c++)data.data[p+c]=data.data[q+c]!;
  }
 }
 ctx.putImageData(data,0,0);ctx.scale(scale,scale);ctx.fillStyle='#b94078';
 // Three pixel rays meet at each inner corner: > and < with a middle ray.
 for(let i=0;i<=3;i++){
  ctx.fillRect(27-i,36-i,2,1);ctx.fillRect(27-i,36,2,1);ctx.fillRect(27-i,36+i,2,1);
  ctx.fillRect(36+i,36-i,2,1);ctx.fillRect(36+i,36,2,1);ctx.fillRect(36+i,36+i,2,1);
 }
 ctx.fillRect(29,43,2,1);ctx.fillRect(31,42,2,1);ctx.fillRect(33,43,2,1);
 scene.textures.addCanvas('mito-impact',canvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
}
