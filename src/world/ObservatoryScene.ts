import {loadingProgress,finishLoading,failLoading} from '../ui/LoadingScreen';
import {ShrubRenderer} from '../rendering/ShrubRenderer';
import {WindRenderer} from '../rendering/WindRenderer';
import {CloudShadowRenderer} from '../rendering/CloudShadowRenderer';
import { WaterRenderer } from '../rendering/WaterRenderer';
import { RockRenderer } from '../rendering/RockRenderer';
import Phaser from 'phaser';
import { worldToIso, isoToWorld } from './Projection';
import { WorldMaker } from './WorldMaker';
import { NatureRenderer } from '../rendering/NatureRenderer';
import { TileMap } from './TileMap';
import { MapCamera } from '../camera/MapCamera';
import { edgeScroll } from '../camera/EdgeScroll';
import { CameraInertia } from '../camera/CameraInertia';
import type { Character } from '../entities/Character';
import { CHARACTER_ASSETS } from '../assets/CharacterAssets';
import { TerrainRenderer } from '../rendering/TerrainRenderer';
import { CharacterRenderer } from '../rendering/CharacterRenderer';
import { WanderBehavior } from '../behavior/WanderBehavior';
import { Minimap } from '../ui/Minimap';
import { CharacterProfileTooltip } from '../ui/CharacterProfile';

export class ObservatoryScene extends Phaser.Scene {
  private map = new TileMap();
  private world = WorldMaker.create((() => {
    const seed = new URLSearchParams(location.search).get('seed');
    return seed !== null && /^\d+$/.test(seed) ? Number(seed) : undefined;
  })());
  private nature = this.world.nature;
  private shrubRenderer!:ShrubRenderer;
  private rockRenderer!: RockRenderer;
  private natureRenderer!: NatureRenderer;
  private minimap!: Minimap;
  private profileTooltip!: CharacterProfileTooltip;
  private characters: { model: Character; behavior: WanderBehavior; visual: ReturnType<typeof CharacterRenderer.create> }[] = [];
  private followCharacter = false;
  private view = new MapCamera();
  private windRenderer!:WindRenderer;
  private cloudShadows!:CloudShadowRenderer;
  private waterRenderer!: WaterRenderer;
  private terrain!: TerrainRenderer;
  private frameSamples = { elapsed: 0, count: 0, slow: 0 };
  private lastView = '';
  private sprintHeld = false;
  private movementKeys = new Set<string>();
  private edge = { x: 0, y: 0 };
  private inertia = new CameraInertia();
  private drag: { id: number; x: number; y: number; startX: number; startY: number; time: number; moved: boolean } | null = null;
  constructor() { super('observatory'); }

  preload() {
    loadingProgress(5,'관측 이미지를 불러오는 중');
    this.load.on('progress',(value:number)=>loadingProgress(5+value*80,'관측 이미지를 불러오는 중'));
    this.load.on('loaderror',()=>failLoading());
    CharacterRenderer.preload(this); TerrainRenderer.preload(this); NatureRenderer.preload(this); RockRenderer.preload(this); ShrubRenderer.preload(this); WaterRenderer.preload(this); }

  create() {
    loadingProgress(88,'지형과 자연물을 준비하는 중');
    document.querySelector('#world-seed')!.textContent = '월드 시드 ' + this.world.seed;
    this.game.canvas.dataset.worldSeed = String(this.world.seed);
    this.terrain = new TerrainRenderer(this, this.nature.water);
    this.natureRenderer = new NatureRenderer(this, this.nature);
    this.rockRenderer = new RockRenderer(this, this.nature);
    this.shrubRenderer = new ShrubRenderer(this,this.nature);
    this.waterRenderer = new WaterRenderer(this, this.nature.water);
    this.cloudShadows = new CloudShadowRenderer(this, this.world.seed);
    this.windRenderer = new WindRenderer(this, this.world.seed);
    // One character uses all eight direction assets; not imported Tamagotchi seed data.
    const character: Character = { id: 'mito-preview', worldX: 511.5, worldY: 511.5, direction: 'S', state: 'idle', profile: { name: '미토', arrivedAt: Date.now(), type: '기본형', generation: 1 } };
    this.characters = [{ model: character, behavior: new WanderBehavior(character, Math.random, (x, y) => this.nature.blocked(x, y)), visual: CharacterRenderer.create(this, character) }];
    this.game.canvas.dataset.characters = '1';
    this.minimap = new Minimap(this.nature);
    this.input.on('wheel', (_p: Phaser.Input.Pointer, _objects: unknown[], _dx: number, dy: number) => { this.inertia.stop(); this.view.setZoom(this.view.zoom * Math.exp(-dy * 0.001)); });
    const controls = new AbortController();
    const canvas = this.game.canvas;
    const arrowKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
    const clearMovement = () => { this.movementKeys.clear(); this.sprintHeld = false; };
    window.addEventListener('keydown', event => {
      this.sprintHeld = event.shiftKey;
      const target = event.target;
      if (event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight') { this.sprintHeld = true; this.movementKeys.add(event.code === 'ShiftRight' || event.location === 2 ? 'ShiftRight' : 'ShiftLeft'); return; }
      if (!arrowKeys.has(event.code) || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return;
      event.preventDefault(); this.movementKeys.add(event.code);
    }, { signal: controls.signal });
    window.addEventListener('keyup', event => {
      this.sprintHeld = event.shiftKey;
      if (!event.shiftKey) { this.movementKeys.delete('ShiftLeft'); this.movementKeys.delete('ShiftRight'); }
      if (this.movementKeys.delete(event.code)) event.preventDefault();
    }, { signal: controls.signal });
    window.addEventListener('blur', clearMovement, { signal: controls.signal });
    document.addEventListener('visibilitychange', clearMovement, { signal: controls.signal });
    this.profileTooltip = new CharacterProfileTooltip(canvas, controls.signal);
    const clearEdge = () => { this.edge = { x: 0, y: 0 }; canvas.style.cursor = 'default'; };
    const stop = () => {
      this.view.stopTransition();
      this.inertia.stop(); clearEdge();
      if (this.drag && canvas.hasPointerCapture(this.drag.id)) canvas.releasePointerCapture(this.drag.id);
      this.drag = null;
    };
    const toggleFollow = () => {
      stop(); this.followCharacter = !this.followCharacter;
    };
    window.addEventListener('keydown', event => {
      if (event.code !== 'KeyC' || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return;
      event.preventDefault(); toggleFollow();
    }, { signal: controls.signal });
    this.minimap.bindNavigation((x, y) => { stop(); this.view.moveToIso(x, y); }, stop, controls.signal);
    canvas.addEventListener('pointerdown', (event) => {
      if (this.followCharacter || event.button !== 0 || this.drag) return;
      this.view.stopTransition(); this.inertia.stop(); clearEdge();
      this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, time: event.timeStamp, moved: false };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    }, { signal: controls.signal });
    canvas.addEventListener('pointermove', (event) => {
      if (this.followCharacter) { clearEdge(); return; }
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
    canvas.addEventListener('dblclick', event => {
      if (event.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      const bounds = this.view.bounds(this.scale.width, this.scale.height);
      const x = bounds.left + (event.clientX - rect.left) / rect.width * (bounds.right - bounds.left);
      const y = bounds.top + (event.clientY - rect.top) / rect.height * (bounds.bottom - bounds.top);
      const target = this.characters.find(({ visual }) => visual.sprite.getBounds().contains(x, y));
      if (!target) return;
      stop();
      const position = worldToIso(target.model.worldX, target.model.worldY);
      this.view.animateTo(position.x, position.y + 16 + CHARACTER_ASSETS.height * (0.5 - CHARACTER_ASSETS.originY), this.view.zoom >= 2.99 ? 1 : 3);
    }, { signal: controls.signal });
    canvas.addEventListener('lostpointercapture', () => { if (this.drag) stop(); }, { signal: controls.signal });
    canvas.addEventListener('pointerleave', clearEdge, { signal: controls.signal });
    canvas.addEventListener('pointercancel', stop, { signal: controls.signal });
    window.addEventListener('blur', stop, { signal: controls.signal });
    document.addEventListener('visibilitychange', stop, { signal: controls.signal });
    document.querySelector('#world-reset')!.addEventListener('click', () => {
      const url = new URL(location.href); url.searchParams.delete('seed'); location.assign(url.href);
    }, { signal: controls.signal });
    this.events.once('shutdown', () => controls.abort());
    this.game.canvas.dataset.ready = 'true';
    this.update();
    loadingProgress(98,'미토의 관측 신호를 확인하는 중');
    this.game.events.once('postrender',()=>finishLoading());
  }

  update(_time = 0, delta = 0) {
    if (!document.hidden && delta > 0) {
      this.frameSamples.elapsed += delta; this.frameSamples.count++;
      if (delta > 33) this.frameSamples.slow++;
      if (this.frameSamples.elapsed >= 1000) {
        this.game.canvas.dataset.fps = String(Math.round(this.frameSamples.count * 1000 / this.frameSamples.elapsed));
        this.game.canvas.dataset.slowFrames = String(this.frameSamples.slow);
        this.frameSamples = { elapsed: 0, count: 0, slow: 0 };
      }
    }
    if (!document.hidden) for (const character of this.characters) {
            const keys = this.movementKeys;
      character.behavior.update(delta, [...keys].some(key => key.startsWith('Arrow')) ? {
        run: this.sprintHeld || keys.has('ShiftLeft') || keys.has('ShiftRight'),
        x: Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft')),
        y: Number(keys.has('ArrowDown')) - Number(keys.has('ArrowUp')),
      } : undefined);
      if (this.nature.touchingTree(character.model.worldX, character.model.worldY)) character.model.treeContactUntil = _time + 500;
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
    if (this.followCharacter && this.characters.length) {
      this.inertia.stop(); this.edge = { x: 0, y: 0 };
      const character = this.characters[0].model;
      const position = worldToIso(character.worldX, character.worldY);
      this.view.moveToIso(position.x, position.y + 16 + CHARACTER_ASSETS.height * (0.5 - CHARACTER_ASSETS.originY));
    }
    if (!document.hidden) this.view.updateTransition(delta);
    this.game.canvas.dataset.cameraFollow = String(this.followCharacter);
    this.game.canvas.dataset.motion = this.drag ? 'drag' : this.inertia.active ? 'inertia' : (this.edge.x || this.edge.y) ? 'edge' : 'idle';
    this.game.canvas.dataset.cameraX = String(this.view.x);
    this.game.canvas.dataset.cameraY = String(this.view.y);
    this.minimap.update(this.view.bounds(this.scale.width, this.scale.height), this.characters[0].model);
    this.profileTooltip.update(this.characters[0].model, this.view.bounds(this.scale.width, this.scale.height), this.game.canvas, !!this.drag);
    this.terrain.updateWater(_time);
    this.cloudShadows.update(_time,this.view.bounds(this.scale.width,this.scale.height));
    this.windRenderer.update(_time,this.view.bounds(this.scale.width,this.scale.height));
    const key = `${this.view.x},${this.view.y},${this.view.zoom}`;
    if (key === this.lastView) {
      this.shrubRenderer.updateInteraction(_time,delta,this.characters.map(c=>c.visual.sprite));

      this.waterRenderer.update(_time);
      this.natureRenderer.updateSway(_time);
      this.natureRenderer.updateOcclusion(this.characters.map(c => c.visual.sprite), _time);
      return;
    }
    this.lastView = key;
    const camera = this.cameras.main;
    camera.setZoom(this.view.zoom).centerOn(this.view.x, this.view.y);
    const tiles = this.map.visibleTiles(this.view.bounds(camera.width, camera.height));
    this.terrain.draw(tiles);
    this.natureRenderer.draw(this.view.bounds(camera.width, camera.height));
    this.rockRenderer.draw(this.view.bounds(camera.width, camera.height));
    this.shrubRenderer.draw(this.view.bounds(camera.width,camera.height));
    this.shrubRenderer.updateInteraction(_time,delta,this.characters.map(c=>c.visual.sprite));
    this.waterRenderer.draw(this.view.bounds(camera.width, camera.height));
    this.waterRenderer.update(_time);
    this.natureRenderer.updateSway(_time);
    this.natureRenderer.updateOcclusion(this.characters.map(c => c.visual.sprite), _time);
    const center = isoToWorld(this.view.x, this.view.y - 16);
    document.querySelector('#status')!.textContent = `(${Math.round(center.x)}, ${Math.round(center.y)})`;
    this.game.canvas.dataset.visibleTiles = String(tiles.length);
  }
}
