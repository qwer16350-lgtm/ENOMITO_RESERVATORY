import Phaser from 'phaser';
import {ROCK_URLS} from '../assets/RockAssets';
import {ROCK_SIZES,ROCK_HEIGHTS} from '../world/Rocks';
import type {NatureWorld} from '../world/NatureWorld';
import {StaticNatureRenderer} from './StaticNatureRenderer';
const assets={prefix:'rock',urls:ROCK_URLS,sizes:ROCK_SIZES,heights:ROCK_HEIGHTS,shadowOffset:100,trim:.88};
export class RockRenderer extends StaticNatureRenderer {
 static preload(scene:Phaser.Scene){StaticNatureRenderer.preload(scene,assets);}
 constructor(scene:Phaser.Scene,world:NatureWorld){super(scene,assets,(...bounds)=>world.queryRocks(...bounds));}
}
