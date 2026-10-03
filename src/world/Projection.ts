// World coordinates are continuous tile units; isometric coordinates are pixels.
export function worldToIso(worldX: number, worldY: number) {
  return { x: (worldX - worldY) * 32, y: (worldX + worldY) * 16 };
}

export function isoToWorld(x: number, y: number) {
  return { x: x / 64 + y / 32, y: y / 32 - x / 64 };
}
