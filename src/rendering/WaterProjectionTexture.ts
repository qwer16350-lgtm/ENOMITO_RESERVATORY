export function projectedWaterFrame(source:Uint8ClampedArray){
 const output=new Uint8ClampedArray(64*32*4);
 for(let y=0;y<32;y++)for(let x=0;x<64;x++){
  const tx=(x+2*y+1)%64,ty=((2*y-x)%64+64)%64,s=(ty*64+tx)*4,p=(y*64+x)*4;
  output[p]=source[s]!;output[p+1]=source[s+1]!;output[p+2]=source[s+2]!;output[p+3]=255;
 }
 return output;
}
