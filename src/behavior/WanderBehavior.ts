import { DIRECTIONS, type Character, type Direction } from '../entities/Character.ts';
import { worldToIso } from '../world/Projection.ts';
import { MAP_SIZE } from '../world/TileMap.ts';

export function movementDirection(dx: number, dy: number, previous: Direction): Direction {
  if (Math.hypot(dx, dy) < 1e-8) return previous;
  const screen = worldToIso(dx, dy);
  const angle = Math.atan2(screen.y, screen.x);
  return DIRECTIONS[(Math.round(angle / (Math.PI / 4)) + 2 + 8) % 8];
}

export function restingDirection(direction: Direction, previous: 'N' | 'S' = 'S'): 'N' | 'S' {
  if (direction === 'N' || direction === 'NE' || direction === 'NW') return 'N';
  if (direction === 'S' || direction === 'SE' || direction === 'SW') return 'S';
  return previous;
}

export class WanderBehavior {
  private remaining: number;
  private target: { x: number; y: number } | null = null;
  readonly speed = 1.2; // World tile units per second.
  private character: Character;
  private random: () => number;
  private restingFacing: 'N' | 'S';

  constructor(character: Character, random: () => number = Math.random) {
    this.character = character; this.random = random;
    this.restingFacing = restingDirection(character.direction);
    character.state = 'idle';
    character.direction = this.restingFacing;
    this.remaining = 0.5 + random() * 3;
  }

  update(deltaMs: number) {
    const dt = Math.min(100, Math.max(0, deltaMs)) / 1000;
    const c = this.character;
    if (!this.target) {
      this.remaining -= dt;
      if (this.remaining > 0) return;
      const angle = this.random() * Math.PI * 2;
      const distance = 2 + this.random() * 8;
      const clamp = (v: number) => Math.max(0, Math.min(MAP_SIZE - 1, v));
      this.target = { x: clamp(c.worldX + Math.cos(angle) * distance), y: clamp(c.worldY + Math.sin(angle) * distance) };
      c.state = 'walk';
    }
    const dx = this.target.x - c.worldX, dy = this.target.y - c.worldY;
    const distance = Math.hypot(dx, dy);
    c.direction = movementDirection(dx, dy, c.direction);
    this.restingFacing = restingDirection(c.direction, this.restingFacing);
    if (distance <= this.speed * dt) {
      c.worldX = this.target.x; c.worldY = this.target.y;
      this.target = null; c.state = 'idle';
      c.direction = this.restingFacing;
      this.remaining = 1 + this.random() * 4;
    } else {
      c.worldX += dx / distance * this.speed * dt;
      c.worldY += dy / distance * this.speed * dt;
    }
  }
}
