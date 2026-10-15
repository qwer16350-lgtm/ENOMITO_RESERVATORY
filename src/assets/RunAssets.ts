import { MITO_ANIMATION } from './AnimationConfig';
import { DIRECTIONS, type Direction } from '../entities/Character';
const files = import.meta.glob('../../assets/mito/pink-star/run_*.png', { eager: true, query: '?url&no-inline', import: 'default' }) as Record<string,string>;
export const RUN_ASSETS = Object.fromEntries(DIRECTIONS.map(direction=>[direction,Array.from({length:MITO_ANIMATION.run.frames},(_,frame)=>files[`../../assets/mito/pink-star/run_${direction}_${frame}.png`])])) as Record<Direction,string[]>;
