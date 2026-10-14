import { NatureWorld } from './NatureWorld.ts';
export class WorldMaker {
  static create(seed?:number) {
    const worldSeed=seed===undefined ? crypto.getRandomValues(new Uint32Array(1))[0] : seed>>>0;
    return {seed:worldSeed,nature:new NatureWorld(worldSeed)};
  }
}
