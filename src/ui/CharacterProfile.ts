import type { Character } from '../entities/Character';
import type { ViewBounds } from '../world/TileMap';
import { worldToIso } from '../world/Projection';
import { CHARACTER_ASSETS } from '../rendering/CharacterAssets';
import { arrivalAge } from './ProfileTime';

export class CharacterProfileTooltip {
  private panel = document.querySelector<HTMLElement>('#character-profile')!;
  private pointer: { x: number; y: number } | null = null;

  constructor(privateCanvas: HTMLCanvasElement, signal: AbortSignal) {
    privateCanvas.addEventListener('pointermove', event => {
      this.pointer = event.pointerType === 'mouse' && event.buttons === 0 ? { x: event.clientX, y: event.clientY } : null;
    }, { signal });
    const hide = () => { this.pointer = null; this.panel.hidden = true; };
    privateCanvas.addEventListener('pointerleave', hide, { signal });
    privateCanvas.addEventListener('pointerdown', hide, { signal });
    window.addEventListener('blur', hide, { signal });
    document.addEventListener('visibilitychange', hide, { signal });
  }

  update(character: Character, view: ViewBounds, canvas: HTMLCanvasElement, dragging: boolean) {
    const profile = character.profile;
    if (!profile || !this.pointer || dragging || document.hidden) { this.panel.hidden = true; return; }
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / (view.right - view.left), sy = rect.height / (view.bottom - view.top);
    const iso = worldToIso(character.worldX, character.worldY);
    const footX = rect.left + (iso.x - view.left) * sx;
    const footY = rect.top + (iso.y + 16 - view.top) * sy;
    const width = CHARACTER_ASSETS.width * sx, height = CHARACTER_ASSETS.height * sy;
    const left = footX - width * CHARACTER_ASSETS.originX;
    const top = footY - height * CHARACTER_ASSETS.originY;
    if (this.pointer.x < left || this.pointer.x > left + width || this.pointer.y < top || this.pointer.y > top + height) { this.panel.hidden = true; return; }
    this.panel.querySelector('[data-field="name"]')!.textContent = profile.name;
    this.panel.querySelector('[data-field="age"]')!.textContent = arrivalAge(profile.arrivedAt);
    this.panel.querySelector('[data-field="type"]')!.textContent = profile.type;
    this.panel.querySelector('[data-field="generation"]')!.textContent = `${profile.generation}세대`;
    this.panel.hidden = false;
    const wrapper = document.querySelector('#game-wrapper')!.getBoundingClientRect();
    const anchorX = footX - wrapper.left;
    const anchorY = top - wrapper.top + 8 * sy;
    const panelWidth = this.panel.offsetWidth, panelHeight = this.panel.offsetHeight;
    const x = Math.max(8, Math.min(wrapper.width - panelWidth - 8, anchorX - panelWidth / 2));
    const above = anchorY - panelHeight - 15 >= 8;
    const y = above ? anchorY - panelHeight - 15 : footY - wrapper.top + 15;
    this.panel.classList.toggle('below', !above);
    this.panel.style.left = `${x}px`;
    this.panel.style.top = `${y}px`;
    this.panel.style.setProperty('--tail-x', `${Math.max(18, Math.min(panelWidth - 18, anchorX - x))}px`);
  }
}
