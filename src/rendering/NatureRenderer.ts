import { groundFootprint, projectShadowPoint, type GroundFootprint } from './ShadowAnchor';
import { WOOD_ANIMATION } from './WoodAnimationAssets';
import { splitTreeLayers } from './TreeLayers';
import { WORLD_LIGHT, createContactShadow, createTreeShadow } from './WorldLighting';
import Phaser from 'phaser';
import { leafWindFrame, LEAF_FRAME_COUNT } from './LeafWind';
import a from '../../assets/objects/nature/trees/tree-0.png?url&no-inline';
import b from '../../assets/objects/nature/trees/tree-1.png?url&no-inline';
import c from '../../assets/objects/nature/trees/tree-2.png?url&no-inline';
import d from '../../assets/objects/nature/trees/tree-3.png?url&no-inline';
import e from '../../assets/objects/nature/trees/tree-4.png?url&no-inline';
import { NatureWorld, TREE_SIZES, TREE_HEIGHTS } from '../world/NatureWorld';
import { isoToWorld, worldToIso } from '../world/Projection';
import type { ViewBounds } from '../world/TileMap';
export class NatureRenderer {
  private flips:boolean[]=[];
  private woodKeys: string[] = [];
  private trunks: Phaser.GameObjects.Image[] = [];
  private footprints: GroundFootprint[] = [];
  private shadows: Phaser.GameObjects.Image[] = [];
  private contacts: Phaser.GameObjects.Image[] = [];
  private images: Phaser.GameObjects.Image[] = [];
  private occlusionTextures: Phaser.Textures.CanvasTexture[] = [];
  private occlusionKeys: string[] = [];
  private baseKeys: string[] = [];
  private sway: { phase: number; speed: number; kind: number }[] = [];
  private swayTick = -1;
  private occlusionTick = -1;
  static preload(scene: Phaser.Scene) { [a,b,c,d,e].forEach((url,i) => scene.load.image(`tree-${i}`,url)); WOOD_ANIMATION.forEach(({kind,frame,url}) => scene.load.image(`tree-wood-${kind}-frame-${frame}`,url)); }
  constructor(private scene: Phaser.Scene, private world: NatureWorld) {
    createContactShadow(scene);
    WOOD_ANIMATION.forEach(({kind,frame}) => scene.textures.get(`tree-wood-${kind}-frame-${frame}`).setFilter(Phaser.Textures.FilterMode.NEAREST));
    // Preserve the detailed silhouette on a coarser pixel grid matching the world art.
    for (let i = 0; i < 5; i++) {
      const texture = scene.textures.get(`tree-${i}`);
      const source = texture.getSourceImage() as HTMLImageElement;
      const canvas = document.createElement('canvas');
      canvas.width = source.width; canvas.height = source.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(source, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let left = canvas.width, top = canvas.height, right = 0, bottom = 0;
      for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 64) continue;
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
      const key = `tree-pixel-${i}`;
      if (scene.textures.exists(key)) continue;
      const width = Math.max(1, right-left+1), height = Math.max(1, bottom-top+1);
      const scale = Math.min(TREE_SIZES[i] / width, TREE_HEIGHTS[i] / height) / 2;
      const sprite = document.createElement('canvas');
      sprite.width = Math.max(1, Math.round(width * scale));
      sprite.height = Math.max(1, Math.round(height * scale));
      const output = sprite.getContext('2d', { willReadFrequently: true })!;
      output.imageSmoothingEnabled = false;
      output.drawImage(source, left, top, width, height, 0, 0, sprite.width, sprite.height);
      const data = output.getImageData(0, 0, sprite.width, sprite.height);
      for (let p = 0; p < data.data.length; p += 4) {
        data.data[p + 3] = data.data[p + 3] < 128 ? 0 : 255;
        // Remove baked sunlit highlights; retain only subdued occlusion for readability.
        const r = data.data[p], g = data.data[p + 1], b = data.data[p + 2];
        const foliage = g >= r * 0.9 && g > b * 1.1;
        const color = foliage ? (Math.max(r, g, b) < 55 ? [38, 59, 40] : Math.max(r, g, b) < 110 ? [53, 75, 44] : [65, 88, 48])
          : i === 3 && Math.abs(r-g) < 25 && r > 100 ? (r < 145 ? [105, 104, 88] : r < 190 ? [125, 124, 106] : [143, 141, 119])
          : r < 65 ? [49, 39, 30] : r < 105 ? [72, 51, 35] : r < 145 ? [94, 67, 44] : [114, 82, 54];
        data.data[p] = color[0]; data.data[p + 1] = color[1]; data.data[p + 2] = color[2];
      }
      output.putImageData(data, 0, 0);

      scene.textures.addCanvas(key, sprite)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
      const wood = document.createElement('canvas');
      wood.width = sprite.width + 4; wood.height = sprite.height;
      const woodContext = wood.getContext('2d')!;
      const woodPixels = woodContext.createImageData(wood.width, wood.height);
      const split = splitTreeLayers(data.data);
      for (let y = 0; y < sprite.height; y++) for (let x = 0; x < sprite.width; x++) {
        const p = (y * sprite.width + x) * 4;
        woodPixels.data.set(split.wood.subarray(p, p + 4), (y * wood.width + x + 2) * 4);
      }
      woodContext.putImageData(woodPixels, 0, 0);
      scene.textures.addCanvas(`tree-wood-${i}`, wood)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
      for (let frame=0; frame<LEAF_FRAME_COUNT; frame++) {
        const wind = document.createElement('canvas');
        wind.width = sprite.width+4; wind.height = sprite.height;
        const context = wind.getContext('2d')!;
        const pixels = context.createImageData(wind.width, wind.height);
        pixels.data.set(leafWindFrame(data.data, sprite.width, sprite.height, frame));
        context.putImageData(pixels,0,0);

        // Shadow uses the composite; the visible wave frame contains foliage only.
        pixels.data.set(splitTreeLayers(pixels.data).leaves);
        context.putImageData(pixels, 0, 0);
        scene.textures.addCanvas(`tree-leaves-${i}-${frame}`,wind)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
        const composite = document.createElement('canvas'); composite.width = wind.width; composite.height = wind.height;
        const shadowContext = composite.getContext('2d')!;
        shadowContext.drawImage(scene.textures.get(`tree-wood-${i}-frame-${frame}`).getSourceImage() as HTMLImageElement, 0, 0, wind.width, wind.height);
        shadowContext.drawImage(wind, 0, 0);
        if (frame === 0) this.footprints[i] = groundFootprint(shadowContext.getImageData(0,0,composite.width,composite.height).data,composite.width,composite.height);
        createTreeShadow(scene, composite, i, frame);
        createTreeShadow(scene, composite, i, frame, true);
      }
    }
  }
  updateSway(time: number) {
    if (document.hidden) return;
    const tick = Math.floor(time / 33); // Cache leaf frames at up to 30 Hz.
    const advanceLeaves = tick !== this.swayTick;
    this.swayTick = tick;
    const view = this.scene.cameras.main.worldView;
    for (let i = 0; i < this.images.length; i++) {
      const image = this.images[i], motion = this.sway[i];
      if (!image.visible || !motion || !Phaser.Geom.Rectangle.Overlaps(view, image.getBounds())) continue;
      // Continuous, very slow whole-tree sway around the fixed root pivot.
      const angle = Math.sin(time / 1000 * (0.42 + motion.kind * 0.025) + motion.phase) * 0.0054;
      image.setRotation(angle);
      this.trunks[i]?.setRotation(0);
      // The projected silhouette pivots at the same root, with ground compression accounted for.
      this.shadows[i]?.setRotation(-angle / 0.24);
      if (!advanceLeaves) continue;
      const frame = Math.floor((time / 1000 * motion.speed * 1.5 + motion.phase) / (Math.PI*2) * LEAF_FRAME_COUNT) % LEAF_FRAME_COUNT;
      const woodKey = `tree-wood-${motion.kind}-frame-${frame}`;
      if (this.woodKeys[i] !== woodKey) {
        this.woodKeys[i] = woodKey; this.trunks[i]?.setTexture(woodKey);
        this.occlusionKeys[i * 2 + 1] = '';
      }
      const key = `tree-leaves-${motion.kind}-${frame}`;
      if (this.baseKeys[i] !== key) {
        this.baseKeys[i] = key;
        this.occlusionKeys[i * 2] = '';
        image.setTexture(key);
        const shadow = this.shadows[i];
        shadow?.setTexture(`tree-ground-shadow-${motion.kind}-${frame}${this.flips[i]?"-mirror":""}`);
      }
    }
    this.scene.game.canvas.dataset.treeSway = this.baseKeys.find(key => key?.startsWith("tree-leaves-")) ?? "fixed";
  }
  updateOcclusion(characters: Phaser.GameObjects.Image[], time: number) {
    const tick = Math.floor(time / 33);
    if (tick === this.occlusionTick) return;
    this.occlusionTick = tick;
    let count = 0;
    const layers = this.images.flatMap((tree, index) => [
      { tree, i: index * 2, baseKey: this.baseKeys[index] },
      { tree: this.trunks[index], i: index * 2 + 1, baseKey: this.woodKeys[index] },
    ]);
    layers.forEach(({ tree, i, baseKey }) => {
      if (!tree?.visible) return;
      const bounds = tree.getBounds();
      const overlaps = characters.filter(character => character.visible && character.depth < tree.depth
        && Phaser.Geom.Rectangle.Overlaps(bounds, character.getBounds()));
      if (!overlaps.length) {
        if (tree.texture.key !== baseKey) tree.setTexture(baseKey);
        this.occlusionKeys[i] = ''; return;
      }
      count++;
      const key = `${baseKey}:${Math.round(tree.rotation*2000)}:${tree.flipX}|` + overlaps.map(c => `${Math.round((c.x-tree.x)/tree.scaleX)},${Math.round((c.y-tree.y)/tree.scaleY)},${c.texture.key},${Math.round(c.rotation*20)}`).join('|');
      if (key === this.occlusionKeys[i]) return;
      this.occlusionKeys[i] = key;
      const original = this.scene.textures.get(baseKey).getSourceImage() as HTMLCanvasElement;
      const texture = this.occlusionTextures[i] ?? (this.occlusionTextures[i] = this.scene.textures.createCanvas(`tree-overlap-${i}`, original.width, original.height)!);
      const filter = Phaser.Textures.FilterMode.NEAREST;
      if (texture.source[0].scaleMode !== filter) texture.setFilter(filter);
      if (texture.width !== original.width || texture.height !== original.height) texture.setSize(original.width, original.height);
      const ctx = texture.context;
      ctx.clearRect(0, 0, original.width, original.height);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.drawImage(original, 0, 0);
      // Erase half the tree alpha only beneath the character's opaque silhouette.
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 0.5;
      ctx.imageSmoothingEnabled = false;
      for (const character of overlaps) {
        const source = character.texture.getSourceImage() as HTMLImageElement;
        const cosine = Math.cos(tree.rotation), sine = Math.sin(tree.rotation);
        ctx.save();
        // Map the character into the swaying tree's local pixel coordinates.
        ctx.setTransform(cosine/tree.scaleX, -sine/tree.scaleY, sine/tree.scaleX, cosine/tree.scaleY,
          original.width * tree.originX - (cosine*tree.x+sine*tree.y)/tree.scaleX,
          original.height * tree.originY + (sine*tree.x-cosine*tree.y)/tree.scaleY);
        if(tree.flipX){
          const matrix=ctx.getTransform();
          ctx.setTransform(-matrix.a,matrix.b,-matrix.c,matrix.d,original.width-matrix.e,matrix.f);
        }
        ctx.translate(character.x, character.y); ctx.rotate(character.rotation);
        ctx.scale(character.scaleX, character.scaleY);
        ctx.drawImage(source, -source.width*character.originX, -source.height*character.originY);
        ctx.restore();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      texture.refresh();
      tree.setTexture(texture.key);
    });
    this.scene.game.canvas.dataset.occludedTrees = String(count);
  }
  draw(view: ViewBounds) {
    const corners = [isoToWorld(view.left-230,view.top-40),isoToWorld(view.right+230,view.top-40),isoToWorld(view.left-230,view.bottom+340),isoToWorld(view.right+230,view.bottom+340)];
    const trees = this.world.query(Math.min(...corners.map(p=>p.x)),Math.min(...corners.map(p=>p.y)),Math.max(...corners.map(p=>p.x)),Math.max(...corners.map(p=>p.y)));
    trees.forEach((tree,i) => {
      const p = worldToIso(tree.x,tree.y);
      this.flips[i]=tree.mirror;
      const image = this.images[i] ?? (this.images[i] = this.scene.add.image(0,0,'tree-0').setOrigin(0.5,1));
      const trunk = this.trunks[i] ?? (this.trunks[i] = this.scene.add.image(0, 0, `tree-wood-${tree.kind}`).setOrigin(0.5, 1));
      this.woodKeys[i] = `tree-wood-${tree.kind}-frame-0`;
      trunk.setTexture(this.woodKeys[i]);
      const hash = (Math.imul(Math.round(tree.x * 100), 73856093) ^ Math.imul(Math.round(tree.y * 100), 19349663)) >>> 0;
      this.sway[i] = { phase: hash % 628 / 100, speed: 0.55 + tree.kind * 0.1 + (hash % 17) / 100, kind: tree.kind };
      this.baseKeys[i] = `tree-leaves-${tree.kind}-0`;
      this.occlusionKeys[i * 2] = ''; this.occlusionKeys[i * 2 + 1] = '';
      image.setTexture(this.baseKeys[i]);
      const scale = Math.min(TREE_SIZES[tree.kind] / image.width, TREE_HEIGHTS[tree.kind] / image.height);
      trunk.setFlipX(tree.mirror).setTint(WORLD_LIGHT.tint).setRotation(0).setScale(scale / 4).setPosition(p.x,p.y+16).setDepth(p.y+15.99).setVisible(true);

      const shadow = this.shadows[i] ?? (this.shadows[i] = this.scene.add.image(0, 0, `tree-ground-shadow-${tree.kind}-0`).setDepth(-99999));
      const footprint = this.footprints[tree.kind];
      const footX=tree.mirror?footprint.width-footprint.x:footprint.x;
      const anchorX = p.x + (footX - footprint.width / 2) * scale;
      const anchorY = p.y + 16 + (footprint.y - footprint.height) * scale;
      const projected = projectShadowPoint(footX, footprint.y, footprint.height);
      shadow.setTexture(`tree-ground-shadow-${tree.kind}-0${tree.mirror?"-mirror":""}`)
        .setOrigin(projected.x / shadow.width, projected.y / shadow.height)
        .setRotation(0).setScale(scale).setPosition(anchorX, anchorY).setAlpha(WORLD_LIGHT.castAlpha).setVisible(true);
      const contact = this.contacts[i] ?? (this.contacts[i] = this.scene.add.image(0, 0, 'ground-contact-shadow').setDepth(-99998));
      contact.setPosition(anchorX, anchorY).setDisplaySize(TREE_SIZES[tree.kind] * 0.35, TREE_SIZES[tree.kind] * 0.14).setVisible(true);
      image.setFlipX(tree.mirror).setTint(WORLD_LIGHT.tint).setRotation(0).setScale(scale).setPosition(p.x,p.y+16).setDepth(p.y+16).setVisible(true);
    });
    for(let i=trees.length;i<this.images.length;i++) { this.images[i].setVisible(false); this.trunks[i]?.setVisible(false); this.shadows[i]?.setVisible(false); this.contacts[i]?.setVisible(false); }
  }
}



































