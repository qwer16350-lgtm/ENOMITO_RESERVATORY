import { isoToWorld, worldToIso } from '../world/Projection.ts';
import { MAP_SIZE } from '../world/TileMap.ts';
export class MapCamera {
  x = 0;
  y = MAP_SIZE * 16;
  zoom = 1;
  pan(dx: number, dy: number) {
    const w = isoToWorld(this.x + dx / this.zoom, this.y + dy / this.zoom - 16);
    const clamp = (v: number) => Math.max(0, Math.min(MAP_SIZE - 1, v));
    const p = worldToIso(clamp(w.x), clamp(w.y));
    this.x = p.x;
    this.y = p.y + 16;
  }
  setZoom(value: number) { this.zoom = Math.max(0.5, Math.min(3, value)); }
  moveToIso(x: number, y: number) {
    this.pan((x - this.x) * this.zoom, (y - this.y) * this.zoom);
  }
  center() { this.x = 0; this.y = MAP_SIZE * 16; this.zoom = 1; }
  bounds(width: number, height: number) {
    return { left: this.x - width / (2 * this.zoom), right: this.x + width / (2 * this.zoom), top: this.y - height / (2 * this.zoom), bottom: this.y + height / (2 * this.zoom) };
  }
}
