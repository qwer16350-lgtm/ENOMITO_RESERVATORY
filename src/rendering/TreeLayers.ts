export function splitTreeLayers(source: Uint8ClampedArray) {
  const wood = new Uint8ClampedArray(source.length);
  const leaves = new Uint8ClampedArray(source.length);
  for (let p = 0; p < source.length; p += 4) {
    const foliage = source[p + 1] > source[p] * 1.08 && source[p + 1] > source[p + 2] * 1.1;
    (foliage ? leaves : wood).set(source.subarray(p, p + 4), p);
  }
  return { wood, leaves };
}
