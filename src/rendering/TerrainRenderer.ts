import waterUrl from '../../assets/terrain/water/water-surface.png?url&no-inline';
import { WaterWorld } from '../world/WaterWorld';
import { WaterTiles } from './WaterTiles';
import { WORLD_LIGHT } from './WorldLighting';
import Phaser from 'phaser';

import { GRASS_URLS, prepareGrassTextures } from '../assets/TerrainAssets';
import { worldToIso } from '../world/Projection';
import { grassVariant } from '../world/Terrain';

export class TerrainRenderer {
  private waterTiles:WaterTiles;
  private ground: Phaser.GameObjects.Graphics;
  private images: Phaser.GameObjects.Image[] = [];
  static preload(scene: Phaser.Scene) {

    scene.load.image('water-surface',waterUrl);
    GRASS_URLS.forEach((url, i) => scene.load.image(`terrain-grass-${i}`, url));
  }
  constructor(private scene: Phaser.Scene, private water:WaterWorld) {
    prepareGrassTextures(scene);
    this.waterTiles=new WaterTiles(scene,water);
    this.ground = scene.add.graphics().setDepth(-100001);
    GRASS_URLS.forEach((_url, i) => scene.textures.get(`terrain-grass-${i}`).setFilter(Phaser.Textures.FilterMode.NEAREST));
  }
  updateWater(time:number){this.waterTiles.update(time);}
  draw(tiles: Array<{ x: number; y: number }>) {
    this.waterTiles.begin();
    this.ground.clear().fillStyle(0x4a5d32);
    tiles.forEach(({ x, y }, index) => {
      const p = worldToIso(x, y);
      this.ground.fillStyle(this.water.isWater(x+.5,y+.5)?0x2c5354:0x4a5d32);
      this.ground.fillPoints([new Phaser.Math.Vector2(p.x, p.y), new Phaser.Math.Vector2(p.x + 32, p.y + 16), new Phaser.Math.Vector2(p.x, p.y + 32), new Phaser.Math.Vector2(p.x - 32, p.y + 16)], true);
      const image = this.images[index] ?? (this.images[index] = this.scene.add.image(0, 0, 'terrain-grass-0')
        .setTint(WORLD_LIGHT.tint).setOrigin(0.5, 0).setDisplaySize(64, 32).setDepth(-100000));
      image.setTexture(this.waterTiles.texture(x,y,`terrain-grass-${grassVariant(x, y)}`)).setPosition(p.x, p.y).setVisible(true);
    });
    for (let i = tiles.length; i < this.images.length; i++) this.images[i].setVisible(false);
    this.waterTiles.end();
  }
}
