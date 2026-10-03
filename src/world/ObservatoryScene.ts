import Phaser from 'phaser';
import { worldToIso, isoToWorld } from './Projection';
import { TileMap } from './TileMap';
import { MapCamera } from '../camera/MapCamera';

export class ObservatoryScene extends Phaser.Scene {
  private map = new TileMap();
  private view = new MapCamera();
  private grid!: Phaser.GameObjects.Graphics;
  private lastView = '';
  constructor() { super('observatory'); }

  create() {
    this.grid = this.add.graphics();
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.view.pan(p.prevPosition.x - p.x, p.prevPosition.y - p.y);
    });
    this.input.on('wheel', (_p: Phaser.Input.Pointer, _objects: unknown[], _dx: number, dy: number) => this.view.setZoom(this.view.zoom * Math.exp(-dy * 0.001)));
    const controls = new AbortController();
    document.querySelector('#zoom-in')!.addEventListener('click', () => this.view.setZoom(this.view.zoom * 1.25), { signal: controls.signal });
    document.querySelector('#zoom-out')!.addEventListener('click', () => this.view.setZoom(this.view.zoom / 1.25), { signal: controls.signal });
    document.querySelector('#map-center')!.addEventListener('click', () => this.view.center(), { signal: controls.signal });
    this.events.once('shutdown', () => controls.abort());
    this.game.canvas.dataset.ready = 'true';
    this.update();
  }

  update() {
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
