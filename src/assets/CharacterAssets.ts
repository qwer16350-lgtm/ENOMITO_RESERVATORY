import type { Direction } from '../entities/Character';
const files = import.meta.glob('../../assets/mito/pink-star/idle_*.png', { eager: true, query: '?url&no-inline', import: 'default' }) as Record<string,string>;
const urls = Object.fromEntries(Object.entries(files).map(([path,url])=>[path.match(/idle_(\w+)\.png$/)![1],url])) as Record<Direction,string>;
export const CHARACTER_ASSETS = { urls, width:64, height:64, originX:0.5, originY:56/64 };
