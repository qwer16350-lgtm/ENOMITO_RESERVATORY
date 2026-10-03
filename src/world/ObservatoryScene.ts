import Phaser from 'phaser';
import { worldToIso } from './Projection';

export class ObservatoryScene extends Phaser.Scene {
  constructor() { super('observatory'); }

  create() {
    const grid = this.add.graphics();
    for (let x = 0; x < 9; x++) {
      for (let y = 0; y < 9; y++) {
        const iso = worldToIso(x, y);
        const px = 480 + iso.x;
        const py = 110 + iso.y;
        grid.fillStyle((x + y) % 2 ? 0x25473e : 0x2b5146);
        grid.lineStyle(1, 0x4e7764, 0.7);
        grid.beginPath();
        grid.moveTo(px, py);
        grid.lineTo(px + 32, py + 16);
        grid.lineTo(px, py + 32);
        grid.lineTo(px - 32, py + 16);
        grid.closePath();
        grid.fillPath();
        grid.strokePath();
      }
    }
    this.add.text(480, 455, 'OBSERVATORY · DEVELOPMENT PREVIEW', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#b8d9c8',
    }).setOrigin(0.5);
    const canvas = this.game.canvas;
    canvas.dataset.ready = 'true';
    document.querySelector('#status')!.textContent = 'Phaser 실행 정상 · 시드 데이터 미주입';
  }
}
