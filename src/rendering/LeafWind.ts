export const LEAF_FRAME_COUNT = 72;
export function leafWindFrame(source: Uint8ClampedArray, width: number, height: number, frame: number) {
  const result = new Uint8ClampedArray((width + 4) * height * 4);
  const leaf = (x: number, y: number) => {
    if (x < 0 || x >= width) return false;
    const p = (y * width + x) * 4;
    return source[p+3] > 0 && source[p+1] > source[p] && source[p+1] > source[p+2];
  };
  for (let y=0; y<height; y++) for (let x=-2; x<width+2; x++) {
    const q=(y*(width+4)+x+2)*4;
    const p=(y*width+x)*4;
    const inside=x>=0 && x<width;
    // Original opaque wood stays fixed. Continuous phase avoids vertical cut boundaries.
    if (inside && source[p+3] && !leaf(x,y)) { result.set(source.subarray(p,p+4),q); continue; }
    const phase=frame/LEAF_FRAME_COUNT*Math.PI*2+y/height*2+x/width*1.8;
    const position=x-Math.sin(phase)*0.3;
    const a=Math.floor(position), b=a+1, weight=position-a;
    const hasA=leaf(a,y), hasB=leaf(b,y);
    if (inside && leaf(x,y)) {
      // Overlap coverage: never expose a new transparent slit inside the original canopy.
      const pa=hasA ? (y*width+a)*4 : p;
      const pb=hasB ? (y*width+b)*4 : p;
      for(let c=0;c<3;c++) result[q+c]=Math.round(source[pa+c]*(1-weight)+source[pb+c]*weight);
      result[q+3]=source[p+3];
    } else {
      const nearest=Math.round(position);
      if(leaf(nearest,y)) result.set(source.subarray((y*width+nearest)*4,(y*width+nearest)*4+4),q);
    }
  }
  return result;
}



