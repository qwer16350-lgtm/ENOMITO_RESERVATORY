import type { Character } from '../entities/Character';
import type { ViewBounds } from '../world/TileMap';
import { CHARACTER_ASSETS } from '../rendering/CharacterAssets';
import { worldToIso } from '../world/Projection';
import { isoToMinimap, minimapToIso, MINIMAP_SCALE } from './MinimapProjection';

export class Minimap {
  private box: SVGRectElement;
  private dot: SVGCircleElement;
  private character: Character | null = null;

  constructor() {
    this.box = document.querySelector<SVGRectElement>('#minimap-camera')!;
    this.dot = document.querySelector<SVGCircleElement>('#minimap-character')!;
  }

  bindNavigation(move: (x: number, y: number) => void, stop: () => void, signal: AbortSignal) {
    const panel = document.querySelector<HTMLElement>('#minimap')!;
    const svg = panel.querySelector<SVGSVGElement>('svg')!;
    const toggle = panel.querySelector<HTMLButtonElement>('#minimap-toggle')!;
    const content = panel.querySelector<HTMLElement>('#minimap-content')!;
    const toggleMinimap = () => {
      content.hidden = !content.hidden;
      panel.classList.toggle('minimized', content.hidden);
      toggle.setAttribute('aria-expanded', String(!content.hidden));
      toggle.setAttribute('aria-label', content.hidden ? '미니맵 펼치기' : '미니맵 최소화');
      toggle.textContent = content.hidden ? '+' : '−';
      stop();
    };
    toggle.addEventListener('click', toggleMinimap, { signal });
    window.addEventListener('keydown', event => {
      const target = event.target;
      if (event.code !== 'KeyM' || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return;
      event.preventDefault();
      toggleMinimap();
    }, { signal });
    panel.querySelector('#minimap-focus-character')!.addEventListener('click', () => {
      if (!this.character) return;
      const position = worldToIso(this.character.worldX, this.character.worldY);
      const centerY = position.y + 16 + CHARACTER_ASSETS.height * (0.5 - CHARACTER_ASSETS.originY);
      move(position.x, centerY);
    }, { signal });
    panel.addEventListener('pointerenter', stop, { signal });
    panel.addEventListener('pointerdown', stop, { signal });
    svg.addEventListener('click', (event) => {
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const destination = minimapToIso(point.x, point.y);
      if (destination) move(destination.x, destination.y);
    }, { signal });
  }

  update(view: ViewBounds, character: Character) {
    this.character = character;
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
