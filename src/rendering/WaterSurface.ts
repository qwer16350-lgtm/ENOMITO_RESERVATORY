import Phaser from 'phaser';
import type {WaterWorld} from '../world/WaterWorld';
import {CanvasWaterSurface} from './CanvasWaterSurface';
import {GpuWaterSurface} from './GpuWaterSurface';
export class WaterSurface {
 private surface:CanvasWaterSurface|GpuWaterSurface;
 constructor(scene:Phaser.Scene,water:WaterWorld,frames:Uint8ClampedArray[]){
  this.surface=scene.game.renderer.type===Phaser.WEBGL?new GpuWaterSurface(scene,water,frames):new CanvasWaterSurface(scene,water,frames);
  scene.game.canvas.dataset.waterBackend=scene.game.renderer.type===Phaser.WEBGL?'gpu-tiled':'canvas';
 }
 update(time:number){this.surface.update(time);}
}
