import N from '../../assets/mito/placeholder/idle_N.svg?url';
import NE from '../../assets/mito/placeholder/idle_NE.svg?url';
import E from '../../assets/mito/placeholder/idle_E.svg?url';
import SE from '../../assets/mito/placeholder/idle_SE.svg?url';
import S from '../../assets/mito/placeholder/idle_S.svg?url';
import SW from '../../assets/mito/placeholder/idle_SW.svg?url';
import W from '../../assets/mito/placeholder/idle_W.svg?url';
import NW from '../../assets/mito/placeholder/idle_NW.svg?url';
import type { Direction } from '../entities/Character';
// Change these URLs and frame/pivot settings when replacing the placeholder art.
export const CHARACTER_ASSETS = {
  urls: { N, NE, E, SE, S, SW, W, NW } satisfies Record<Direction, string>,
  width: 64, height: 64, originX: 0.5, originY: 56 / 64,
};
