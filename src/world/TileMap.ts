import { isoToWorld, worldToIso } from './Projection.ts';
export const MAP_SIZE = 1024;
export interface ViewBounds { left: number; right: number; top: number; bottom: number }
export class TileMap {
  readonly width = MAP_SIZE;
  readonly height = MAP_SIZE;
  // Uniform placeholder terrain needs no million-element array.
  visibleTiles(view: ViewBounds): Array<{ x: number; y: number }> {
    const corners = [isoToWorld(view.left - 32, view.top - 32), isoToWorld(view.right + 32, view.top - 32), isoToWorld(view.left - 32, view.bottom + 32), isoToWorld(view.right + 32, view.bottom + 32)];
    const minX = Math.max(0, Math.floor(Math.min(...corners.map(p => p.x))));
    const maxX = Math.min(this.width - 1, Math.ceil(Math.max(...corners.map(p => p.x))));
    const minY = Math.max(0, Math.floor(Math.min(...corners.map(p => p.y))));
    const maxY = Math.min(this.height - 1, Math.ceil(Math.max(...corners.map(p => p.y))));
    const tiles = [];
    for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) {
      const p = worldToIso(x, y);
      if (p.x + 32 >= view.left && p.x - 32 <= view.right && p.y + 32 >= view.top && p.y <= view.bottom) tiles.push({ x, y });
    }
    return tiles;
  }
}
