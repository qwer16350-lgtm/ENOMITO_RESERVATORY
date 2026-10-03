import Phaser from 'phaser';
import { ObservatoryScene } from '../world/ObservatoryScene';

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#111d2b',
    pixelArt: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: 540 },
    scene: [ObservatoryScene],
  });
}
