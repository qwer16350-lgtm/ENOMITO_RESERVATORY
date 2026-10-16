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
  private wanderingRun = false;
  private remaining: number;
  private target: { x: number; y: number } | null = null;
  readonly speed = 2.4; // World tile units per second.
  private character: Character;
  private random: () => number;
  private blocked: (x: number, y: number) => boolean;
  private restingFacing: 'N' | 'S';

  constructor(character: Character, random: () => number = Math.random, blocked: (x: number, y: number) => boolean = () => false) {
    this.character = character; this.random = random; this.blocked = blocked;
    this.restingFacing = restingDirection(character.direction);
    character.state = 'idle';
    character.direction = this.restingFacing;
    this.remaining = 0.5 + random() * 3;
  }

  private manual = false;
  private impactCooldown=0;
  private impactSerial=0;
  private collideRunning(dx:number,dy:number){
    if(this.impactCooldown>0)return false;
    const length=Math.hypot(dx,dy);if(!length)return false;
    this.character.impact={serial:++this.impactSerial,ageMs:0,dx:-dx/length,dy:-dy/length};
    this.character.state='idle';this.target=null;this.remaining=.6;this.impactCooldown=800;
    return true;
  }
  update(deltaMs: number, input?: { x: number; y: number; run?: boolean }) {
    const elapsed=Math.min(100,Math.max(0,deltaMs));
    this.impactCooldown=Math.max(0,this.impactCooldown-elapsed);
    const impact=this.character.impact;
    if(impact&&impact.ageMs<450){
      const step=5*(Math.exp(-impact.ageMs/100)-Math.exp(-(impact.ageMs+elapsed)/100))*.1;
      const count=Math.max(1,Math.ceil(step/.03));
      for(let i=0;i<count;i++){
        const x=this.character.worldX+impact.dx*step/count,y=this.character.worldY+impact.dy*step/count;
        if(x<0||y<0||x>MAP_SIZE-1||y>MAP_SIZE-1||this.blocked(x,y))break;
        this.character.worldX=x;this.character.worldY=y;
      }
      impact.ageMs+=elapsed;return;
    }
    if (input) {
      this.manual = true; this.target = null;
      const c = this.character;
      // Arrow directions are screen directions, inverse of the isometric projection.
      const dx = input.x + input.y * 2, dy = input.y * 2 - input.x;
      const length = Math.hypot(dx, dy);
      if (!length) { c.state = 'idle'; c.direction = this.restingFacing; return; }
      const step = this.speed * (input.run ? 3 : 1) * Math.min(100, Math.max(0, deltaMs)) / 1000;
      const count = Math.max(1, Math.ceil(step / 0.05));
      let moved = false;
      for (let i = 0; i < count; i++) {
        const x = c.worldX + dx / length * step / count;
        const y = c.worldY + dy / length * step / count;
        if (x < 0 || y < 0 || x > MAP_SIZE - 1 || y > MAP_SIZE - 1 || this.blocked(x, y)) {
          if(input.run&&this.blocked(x,y)&&this.collideRunning(dx,dy))return;
          break;
        }
        c.worldX = x; c.worldY = y; moved = true;
      }
      c.direction = movementDirection(dx, dy, c.direction);
      this.restingFacing = restingDirection(c.direction, this.restingFacing);
      c.state = moved ? (input.run ? 'run' : 'walk') : 'idle';
      if (!moved) c.direction = this.restingFacing;
      return;
    }
    if (this.manual) {
      this.manual = false; this.target = null;
      this.character.state = 'idle'; this.character.direction = this.restingFacing;
      this.remaining = 1 + this.random() * 4;
      return;
    }
    const dt = Math.min(100, Math.max(0, deltaMs)) / 1000;
    const c = this.character;
    if (!this.target) {
      this.remaining -= dt;
      if (this.remaining > 0) return;
      const angle = this.random() * Math.PI * 2;
      const distance = 2 + this.random() * 8;
      const clamp = (v: number) => Math.max(0, Math.min(MAP_SIZE - 1, v));
      this.target = { x: clamp(c.worldX + Math.cos(angle) * distance), y: clamp(c.worldY + Math.sin(angle) * distance) };
      this.wanderingRun = this.random() > .5;
      c.state = this.wanderingRun ? 'run' : 'walk';
    }
    const velocity = this.speed * (this.wanderingRun ? 3 : 1);
    const dx = this.target.x - c.worldX, dy = this.target.y - c.worldY;
    const distance = Math.hypot(dx, dy);
    const step = Math.min(distance, velocity * dt);
    const nextX = c.worldX + (distance ? dx / distance * step : 0);
    const nextY = c.worldY + (distance ? dy / distance * step : 0);
    const steps = Math.max(1, Math.ceil(step / 0.05));
    let collision = false;
    for (let i = 1; i <= steps; i++) {
      if (this.blocked(c.worldX + (nextX - c.worldX) * i / steps, c.worldY + (nextY - c.worldY) * i / steps)) { collision = true; break; }
    }
    if (collision) {
      if(this.wanderingRun&&this.collideRunning(dx,dy))return;
      this.target = null;
      const away = Math.atan2(-dy, -dx);
      for (let i = 0; i < 16; i++) {
        const angle = away + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * Math.PI / 8;
        const ux = Math.cos(angle), uy = Math.sin(angle);
        if ([0.05, 0.15, 0.35, 0.65].some(d => this.blocked(c.worldX + ux * d, c.worldY + uy * d))) continue;
        this.target = { x: c.worldX + ux * 0.65, y: c.worldY + uy * 0.65 };
        c.direction = movementDirection(ux, uy, c.direction);
        this.restingFacing = restingDirection(c.direction, this.restingFacing);
        c.state = this.wanderingRun ? 'run' : 'walk';
        c.worldX += ux * Math.min(step, 0.05); c.worldY += uy * Math.min(step, 0.05);
        return;
      }
      c.state = 'idle'; this.remaining = 0; return;
    }
    c.direction = movementDirection(dx, dy, c.direction);
    this.restingFacing = restingDirection(c.direction, this.restingFacing);
    if (distance <= velocity * dt) {
      c.worldX = this.target.x; c.worldY = this.target.y;
      this.target = null; c.state = 'idle';
      c.direction = this.restingFacing;
      this.remaining = 1 + this.random() * 4;
    } else {
      c.worldX += dx / distance * velocity * dt;
      c.worldY += dy / distance * velocity * dt;
    }
  }
}
