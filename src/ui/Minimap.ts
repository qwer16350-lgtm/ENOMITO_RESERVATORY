import type { NatureWorld } from '../world/NatureWorld';
import type { Character } from '../entities/Character';
import type { ViewBounds } from '../world/TileMap';
import { CHARACTER_ASSETS } from '../assets/CharacterAssets';
import { worldToIso } from '../world/Projection';
import { isoToMinimap, minimapToIso, MINIMAP_SCALE } from './MinimapProjection';

export class Minimap {
  private box: SVGRectElement;
  private dot: SVGCircleElement;
  private character: Character | null = null;

  constructor(nature: NatureWorld) {
    this.box = document.querySelector<SVGRectElement>('#minimap-camera')!;
    this.dot = document.querySelector<SVGCircleElement>('#minimap-character')!;
    const waterCanvas=document.createElement('canvas');waterCanvas.width=880;waterCanvas.height=520;
    const waterContext=waterCanvas.getContext('2d')!;waterContext.scale(4,4);waterContext.fillStyle='#417c7c';
    for(let x=0;x<1024;x+=4)for(let y=0;y<1024;y+=4){
      if(!nature.water.isWater(x+2,y+2,.8))continue;
      const iso=worldToIso(x,y),point=isoToMinimap(iso.x,iso.y),dx=128*MINIMAP_SCALE,dy=64*MINIMAP_SCALE;
      waterContext.beginPath();waterContext.moveTo(point.x,point.y);waterContext.lineTo(point.x+dx,point.y+dy);waterContext.lineTo(point.x,point.y+dy*2);waterContext.lineTo(point.x-dx,point.y+dy);waterContext.closePath();waterContext.fill();
    }
    document.querySelector('#minimap-water')?.remove();
    const waterLayer=document.createElementNS('http://www.w3.org/2000/svg','image');waterLayer.id='minimap-water';
    waterLayer.setAttribute('width','220');waterLayer.setAttribute('height','130');waterLayer.setAttribute('href',waterCanvas.toDataURL());waterLayer.setAttribute('pointer-events','none');this.dot.before(waterLayer);
    let treeCount = 0;
    const points: string[] = [];
    nature.visitAll(tree => {
      treeCount++;
      const foot = worldToIso(tree.x, tree.y);
      const point = isoToMinimap(foot.x, foot.y + 16);
      // One vector circle per object: zoom never enlarges a blurry raster dot.
      points.push(`M${(point.x - 0.06).toFixed(4)} ${point.y.toFixed(4)}a.06 .06 0 1 0 .12 0a.06 .06 0 1 0 -.12 0Z`);
    });
    const layer = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    document.querySelector('#minimap-trees')?.remove();
    layer.id = 'minimap-trees';
    layer.dataset.treeCount = String(treeCount);
    layer.setAttribute('d', points.join(''));
    layer.setAttribute('fill', '#80b85a');
    layer.setAttribute('pointer-events', 'none');
    this.dot.before(layer);
    const rocks: string[] = [];
    nature.visitRocks(rock => {
      const foot = worldToIso(rock.x, rock.y), point = isoToMinimap(foot.x, foot.y + 16);
      rocks.push(`M${(point.x-.08).toFixed(4)} ${point.y.toFixed(4)}a.08 .08 0 1 0 .16 0a.08 .08 0 1 0 -.16 0Z`);
    });
    document.querySelector('#minimap-rocks')?.remove();
    const rockLayer = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rockLayer.id = 'minimap-rocks'; rockLayer.dataset.rockCount = String(rocks.length);
    rockLayer.setAttribute('d', rocks.join('')); rockLayer.setAttribute('fill', '#c6c6b5'); rockLayer.setAttribute('pointer-events','none');
    this.dot.before(rockLayer);
  }

  bindNavigation(move: (x: number, y: number) => void, stop: () => void, signal: AbortSignal) {
    const panel = document.querySelector<HTMLElement>('#minimap')!;
    const svg = panel.querySelector<SVGSVGElement>('svg')!;
    let zoom = 1, viewX = 0, viewY = 0;
    svg.addEventListener('wheel', event => {
      event.preventDefault(); event.stopPropagation(); stop();
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const nextZoom = Math.max(1, Math.min(16, zoom * Math.exp(-event.deltaY * 0.002)));
      const width = 220 / nextZoom, height = 130 / nextZoom;
      viewX = Math.max(0, Math.min(220 - width, point.x - (point.x - viewX) * zoom / nextZoom));
      viewY = Math.max(0, Math.min(130 - height, point.y - (point.y - viewY) * zoom / nextZoom));
      zoom = nextZoom;
      svg.setAttribute('viewBox', `${viewX} ${viewY} ${width} ${height}`);
    }, { signal, passive: false });
    svg.setAttribute('title', '나무 한 그루당 초록 점 하나 · 휠로 미니맵 확대/축소');
    const toggle = panel.querySelector<HTMLButtonElement>('#minimap-toggle')!;
    const content = panel.querySelector<HTMLElement>('#minimap-content')!;
    let mode=0;
    const applyMode=()=>{
      content.hidden=mode===0;
      panel.classList.toggle('minimized',mode===0);
      panel.classList.toggle('maximized',mode===2);
      panel.dataset.mode=['collapsed','compact','expanded'][mode];
      this.dot.setAttribute('r',mode===2?'0.65':'1.8');
      this.box.setAttribute('stroke-width',mode===2?'0.3':'1.2');
      const trees=panel.querySelector('#minimap-trees');
      const rocks=panel.querySelector('#minimap-rocks');
      for(const layer of [trees,rocks]){
        layer?.setAttribute('stroke',layer.getAttribute('fill')!);
        layer?.setAttribute('stroke-width',mode===2?'0.16':'0');
        layer?.setAttribute('stroke-linejoin','round');
      }
      toggle.setAttribute('aria-expanded',String(mode!==0));
      toggle.setAttribute('aria-label',['미니맵 펼치기','전체 지도 확대','지도 접기'][mode]!);
      toggle.textContent=['+','□','−'][mode]!;
      zoom=1;viewX=0;viewY=0;svg.setAttribute('viewBox','0 0 220 130');
    };
    const toggleMinimap = () => {mode=(mode+1)%3;applyMode();stop();};
    applyMode();
    toggle.addEventListener('click', toggleMinimap, { signal });
    window.addEventListener('keydown', event => {
      const target = event.target;
      if (event.code !== 'KeyM' || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select'))) return;
      event.preventDefault();
      toggleMinimap();
    }, { signal });
    panel.querySelector('#minimap-focus-character')!.addEventListener('click', () => {
      if (!this.character) return;
      const position = worldToIso(this.character.worldX, this.character.worldY);
      const centerY = position.y + 16 + CHARACTER_ASSETS.height * (0.5 - CHARACTER_ASSETS.originY);
      move(position.x, centerY);
    }, { signal });
    panel.addEventListener('pointerenter', stop, { signal });
    panel.addEventListener('pointerdown', stop, { signal });
    svg.addEventListener('click', (event) => {
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const destination = minimapToIso(point.x, point.y);
      if (destination) move(destination.x, destination.y);
    }, { signal });
  }

  update(view: ViewBounds, character: Character) {
    this.character = character;
    const topLeft = isoToMinimap(view.left, view.top);
    this.box.setAttribute('x', String(topLeft.x));
    this.box.setAttribute('y', String(topLeft.y));
    this.box.setAttribute('width', String((view.right - view.left) * MINIMAP_SCALE));
    this.box.setAttribute('height', String((view.bottom - view.top) * MINIMAP_SCALE));
    const foot = worldToIso(character.worldX, character.worldY);
    const marker = isoToMinimap(foot.x, foot.y + 16);
    this.dot.setAttribute('cx', String(marker.x));
    this.dot.setAttribute('cy', String(marker.y));
  }
}
