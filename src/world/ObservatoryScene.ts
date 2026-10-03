import Phaser from 'phaser';
import { worldToIso, isoToWorld } from './Projection';
import { TileMap } from './TileMap';
import { MapCamera } from '../camera/MapCamera';
import { edgeScroll } from '../camera/EdgeScroll';
import { CameraInertia } from '../camera/CameraInertia';
import type { Character } from '../entities/Character';
import { CharacterRenderer } from '../rendering/CharacterRenderer';
import { WanderBehavior } from '../behavior/WanderBehavior';
import { Minimap } from '../ui/Minimap';

export class ObservatoryScene extends Phaser.Scene {
  private map = new TileMap();
  private minimap!: Minimap;
  private characters: { model: Character; behavior: WanderBehavior; visual: ReturnType<typeof CharacterRenderer.create> }[] = [];
  private view = new MapCamera();
  private grid!: Phaser.GameObjects.Graphics;
  private lastView = '';
  private edge = { x: 0, y: 0 };
  private inertia = new CameraInertia();
  private drag: { id: number; x: number; y: number; startX: number; startY: number; time: number; moved: boolean } | null = null;
  constructor() { super('observatory'); }

  preload() { CharacterRenderer.preload(this); }

  create() {
    this.grid = this.add.graphics();
    this.grid.setDepth(-100000);
    // One character uses all eight direction assets; not imported Tamagotchi seed data.
    const character: Character = { id: 'mito-preview', worldX: 511.5, worldY: 511.5, direction: 'S', state: 'idle' };
    this.characters = [{ model: character, behavior: new WanderBehavior(character), visual: CharacterRenderer.create(this, character) }];
    this.game.canvas.dataset.characters = '1';
    this.minimap = new Minimap();
    this.input.on('wheel', (_p: Phaser.Input.Pointer, _objects: unknown[], _dx: number, dy: number) => { this.inertia.stop(); this.view.setZoom(this.view.zoom * Math.exp(-dy * 0.001)); });
    const controls = new AbortController();
    const canvas = this.game.canvas;
    const clearEdge = () => { this.edge = { x: 0, y: 0 }; canvas.style.cursor = 'default'; };
    const stop = () => {
      this.inertia.stop(); clearEdge();
      if (this.drag && canvas.hasPointerCapture(this.drag.id)) canvas.releasePointerCapture(this.drag.id);
      this.drag = null;
    };
    this.minimap.bindNavigation((x, y) => { stop(); this.view.moveToIso(x, y); }, stop, controls.signal);
    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || this.drag) return;
      this.inertia.stop(); clearEdge();
      this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, time: event.timeStamp, moved: false };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    }, { signal: controls.signal });
    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      const drag = this.drag;
      if (drag) {
        if (event.pointerId !== drag.id) return;
        if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 3) return;
        drag.moved = true;
        const dx = (drag.x - event.clientX) * this.scale.width / rect.width;
        const dy = (drag.y - event.clientY) * this.scale.height / rect.height;
        this.view.pan(dx, dy);
        this.inertia.sample(dx, dy, event.timeStamp - drag.time);
        drag.x = event.clientX; drag.y = event.clientY; drag.time = event.timeStamp;
        return;
      }
      if (event.pointerType !== 'mouse') { clearEdge(); return; }
      this.edge = edgeScroll(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
      const { x, y } = this.edge;
      canvas.style.cursor = x < 0 ? (y < 0 ? 'nw-resize' : y > 0 ? 'sw-resize' : 'w-resize') : x > 0 ? (y < 0 ? 'ne-resize' : y > 0 ? 'se-resize' : 'e-resize') : y < 0 ? 'n-resize' : y > 0 ? 's-resize' : 'default';
    }, { signal: controls.signal });
    canvas.addEventListener('pointerup', (event) => {
      const drag = this.drag;
      if (!drag || drag.id !== event.pointerId) return;
      if (!drag.moved || event.timeStamp - drag.time > 100) this.inertia.stop();
      this.drag = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      clearEdge();
    }, { signal: controls.signal });
    canvas.addEventListener('lostpointercapture', () => { if (this.drag) stop(); }, { signal: controls.signal });
    canvas.addEventListener('pointerleave', clearEdge, { signal: controls.signal });
    canvas.addEventListener('pointercancel', stop, { signal: controls.signal });
    window.addEventListener('blur', stop, { signal: controls.signal });
    document.addEventListener('visibilitychange', stop, { signal: controls.signal });
    document.querySelector('#zoom-in')!.addEventListener('click', () => { stop(); this.view.setZoom(this.view.zoom * 1.25); }, { signal: controls.signal });
    document.querySelector('#zoom-out')!.addEventListener('click', () => { stop(); this.view.setZoom(this.view.zoom / 1.25); }, { signal: controls.signal });
    document.querySelector('#map-center')!.addEventListener('click', () => { stop(); this.view.center(); }, { signal: controls.signal });
    this.events.once('shutdown', () => controls.abort());
    this.game.canvas.dataset.ready = 'true';
    this.update();
  }

  update(_time = 0, delta = 0) {
    if (!document.hidden) for (const character of this.characters) {
      character.behavior.update(delta);
      CharacterRenderer.sync(character.model, character.visual, _time);
    }
    this.game.canvas.dataset.characterStates = JSON.stringify(this.characters.map(({ model }) => model));
    if (!document.hidden && !this.drag && this.inertia.active) {
      const movement = this.inertia.step(delta);
      const previous = { x: this.view.x, y: this.view.y };
      this.view.pan(movement.x, movement.y);
      if (Math.abs(this.view.x - previous.x - movement.x / this.view.zoom) > 0.01 || Math.abs(this.view.y - previous.y - movement.y / this.view.zoom) > 0.01) this.inertia.stop();
    } else if (!document.hidden && !this.drag && (this.edge.x !== 0 || this.edge.y !== 0)) {
      const step = 600 * Math.min(delta, 50) / 1000;
      this.view.pan(this.edge.x * step, this.edge.y * step);
    }
    this.game.canvas.dataset.motion = this.drag ? 'drag' : this.inertia.active ? 'inertia' : (this.edge.x || this.edge.y) ? 'edge' : 'idle';
    this.game.canvas.dataset.cameraX = String(this.view.x);
    this.game.canvas.dataset.cameraY = String(this.view.y);
    this.minimap.update(this.view.bounds(this.scale.width, this.scale.height), this.characters[0].model);
    const key = `${this.view.x},${this.view.y},${this.view.zoom}`;
    if (key === this.lastView) return;
    this.lastView = key;
    const camera = this.cameras.main;
    camera.setZoom(this.view.zoom).centerOn(this.view.x, this.view.y);
    const tiles = this.map.visibleTiles(this.view.bounds(camera.width, camera.height));
    const grid = this.grid;
    grid.clear();
    for (const { x, y } of tiles) {
        const iso = worldToIso(x, y);
        const px = iso.x;
        const py = iso.y;
        grid.fillStyle((x + y) % 2 ? 0x25473e : 0x2b5146);
        grid.lineStyle(1, (x % 32 === 0 || y % 32 === 0) ? 0x85b899 : 0x4e7764, 0.7);
        grid.beginPath();
        grid.moveTo(px, py);
        grid.lineTo(px + 32, py + 16);
        grid.lineTo(px, py + 32);
        grid.lineTo(px - 32, py + 16);
        grid.closePath();
        grid.fillPath();
        grid.strokePath();
    }
    const center = isoToWorld(this.view.x, this.view.y - 16);
    document.querySelector('#status')!.textContent = `1024 × 1024타일 · 총 1,048,576칸 · 현재 표시 ${tiles.length.toLocaleString()}칸 · 중심 (${Math.round(center.x)}, ${Math.round(center.y)}) · 확대 ${Math.round(this.view.zoom * 100)}% · 시드 데이터 미주입`;
    this.game.canvas.dataset.visibleTiles = String(tiles.length);
  }
}
