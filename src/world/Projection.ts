// World coordinates are continuous tile units; isometric coordinates are pixels.
export function worldToIso(worldX: number, worldY: number) {
  return { x: (worldX - worldY) * 32, y: (worldX + worldY) * 16 };
}
