import Phaser from 'phaser';
import type { Character } from '../entities/Character';
import { DIRECTIONS } from '../entities/Character';
import { worldToIso } from '../world/Projection';
import { CHARACTER_ASSETS } from './CharacterAssets';

export class CharacterRenderer {
  static preload(scene: Phaser.Scene) {
    for (const direction of DIRECTIONS) {
      const url = CHARACTER_ASSETS.urls[direction];
      if (url.split('?')[0].endsWith('.svg')) scene.load.svg('mito-idle-' + direction, url, { width: CHARACTER_ASSETS.width, height: CHARACTER_ASSETS.height });
      else scene.load.image('mito-idle-' + direction, url);
    }
  }

  static create(scene: Phaser.Scene, character: Character) {
    const p = worldToIso(character.worldX, character.worldY);
    const footY = p.y + 16;
    const sprite = scene.add.image(p.x, footY, 'mito-idle-' + character.direction)
      .setOrigin(CHARACTER_ASSETS.originX, CHARACTER_ASSETS.originY)
      .setDisplaySize(CHARACTER_ASSETS.width, CHARACTER_ASSETS.height)
      .setDepth(footY);
    const label = scene.add.text(p.x, footY + 12, character.direction, {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#fff0b3', backgroundColor: '#152e28',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5, 0).setDepth(100000);
    return { sprite, label };
  }

  static sync(character: Character, visual: ReturnType<typeof CharacterRenderer.create>, time = 0) {
    const p = worldToIso(character.worldX, character.worldY);
    const footY = p.y + 16;
    visual.sprite.setPosition(p.x, footY).setDepth(footY).setTexture('mito-idle-' + character.direction);
    // Temporary walking motion using the same eight replaceable images.
    visual.sprite.setRotation(character.state === 'walk' ? Math.sin(time / 90) * 0.035 : 0);
    visual.label.setPosition(p.x, footY + 12).setText(`${character.direction} · ${character.state === 'walk' ? '이동' : '휴식'}`);
  }
}
