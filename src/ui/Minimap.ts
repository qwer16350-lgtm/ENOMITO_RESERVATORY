import type { Character } from '../entities/Character';
import type { ViewBounds } from '../world/TileMap';
import { worldToIso } from '../world/Projection';
import { isoToMinimap, MINIMAP_SCALE } from './MinimapProjection';

export class Minimap {
  private box: SVGRectElement;
  private dot: SVGCircleElement;

  constructor() {
    this.box = document.querySelector<SVGRectElement>('#minimap-camera')!;
    this.dot = document.querySelector<SVGCircleElement>('#minimap-character')!;
  }

  update(view: ViewBounds, character: Character) {
    const topLeft = isoToMinimap(view.left, view.top);
    this.box.setAttribute('x', String(topLeft.x));
    this.box.setAttribute('y', String(topLeft.y));
    this.box.setAttribute('width', String((view.right - view.left) * MINIMAP_SCALE));
    this.box.setAttribute('height', String((view.bottom - view.top) * MINIMAP_SCALE));
    const foot = worldToIso(character.worldX, character.worldY);
    const marker = isoToMinimap(foot.x, foot.y + 16);
    this.dot.setAttribute('cx', String(marker.x));
    this.dot.setAttribute('cy', String(marker.y));
  }
}
