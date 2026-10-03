import { MAP_SIZE } from '../world/TileMap.ts';

export const MINIMAP_SCALE = 196 / (MAP_SIZE * 64);
// Same isometric orientation as the main map; whole terrain fits in the diamond.
export function isoToMinimap(x: number, y: number) {
  return { x: 110 + x * MINIMAP_SCALE, y: 16 + y * MINIMAP_SCALE };
}
