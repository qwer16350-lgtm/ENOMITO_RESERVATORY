import { MAP_SIZE } from '../world/TileMap.ts';

export const MINIMAP_SCALE = 196 / (MAP_SIZE * 64);
// Same isometric orientation as the main map; whole terrain fits in the diamond.
export function isoToMinimap(x: number, y: number) {
  return { x: 110 + x * MINIMAP_SCALE, y: 16 + y * MINIMAP_SCALE };
}

export function minimapToIso(x: number, y: number) {
  if (Math.abs(x - 110) / 98 + Math.abs(y - 65) / 49 > 1 + 1e-9) return null;
  return { x: (x - 110) / MINIMAP_SCALE, y: (y - 16) / MINIMAP_SCALE };
}
