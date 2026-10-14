// Stable tile selection keeps terrain unchanged when panning or reloading.
export function grassVariant(x: number, y: number): number {
  let hash = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  const value = (hash >>> 0) % 100;
  return value < 68 ? 0 : value < 84 ? 1 : value < 91 ? 2 : value < 94 ? 3 : 4;
}
