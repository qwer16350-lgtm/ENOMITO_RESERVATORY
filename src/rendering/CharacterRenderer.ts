import { MITO_ANIMATION } from '../assets/AnimationConfig';
import { softenIdleOutline } from '../assets/IdleOutline';
import { IdleAnimator } from './IdleAnimator';
import { IDLE_ASSETS } from '../assets/IdleAssets';
import { WORLD_LIGHT, createContactShadow } from './WorldLighting';
import bubbleUrl from '../../assets/ui/tree-bubble.svg?url&no-inline';
import axeUrl from '../../assets/ui/tree-axe.svg?url&no-inline';
import Phaser from 'phaser';
import { RUN_ASSETS } from '../assets/RunAssets';
import type { Character } from '../entities/Character';
import { DIRECTIONS } from '../entities/Character';
import { worldToIso } from '../world/Projection';
import { CHARACTER_ASSETS } from '../assets/CharacterAssets';

export class CharacterRenderer {
  static preload(scene: Phaser.Scene) {
    IDLE_ASSETS.forEach(({key,url})=>scene.load.image(key,url));
    scene.load.svg('tree-contact-bubble', bubbleUrl);
    scene.load.svg('tree-contact-axe', axeUrl);
    for (const [direction, frames] of Object.entries(RUN_ASSETS)) frames.forEach((url, frame) => scene.load.image(`mito-run-${direction}-${frame}`, url));
    for (const direction of DIRECTIONS) {
      const url = CHARACTER_ASSETS.urls[direction];
      if (url.split('?')[0].endsWith('.svg')) scene.load.svg('mito-idle-' + direction, url, { width: CHARACTER_ASSETS.width, height: CHARACTER_ASSETS.height });
      else scene.load.image('mito-idle-' + direction, url);
    }
  }

  static create(scene: Phaser.Scene, character: Character) {
    const p = worldToIso(character.worldX, character.worldY);
    const footY = p.y + 16;
    for (const direction of DIRECTIONS) {
      scene.textures.get('mito-idle-' + direction).setFilter(Phaser.Textures.FilterMode.NEAREST);
      for (let frame=0;frame<MITO_ANIMATION.run.frames;frame++) scene.textures.get(`mito-run-${direction}-${frame}`).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    IDLE_ASSETS.forEach(({key})=>{softenIdleOutline(scene,key);scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);});
    createContactShadow(scene);
    const groundShadow = scene.add.image(p.x, footY - 1, 'ground-contact-shadow').setDisplaySize(36, 13).setDepth(-99997);
    const sprite = scene.add.image(p.x, footY, 'mito-idle-' + character.direction)
      .setOrigin(CHARACTER_ASSETS.originX, CHARACTER_ASSETS.originY)
      .setDisplaySize(CHARACTER_ASSETS.width, CHARACTER_ASSETS.height)
      .setDepth(footY).setTint(WORLD_LIGHT.tint);
    const label = scene.add.text(p.x, footY + 12, character.profile?.name ?? character.id, {
      fontFamily: 'Galmuri11', fontSize: '12px', color: '#fff0b3', backgroundColor: '#152e28',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5, 0).setDepth(100000);
    const dust = Array.from({ length: 16 }, () => ({ image: scene.add.ellipse(0, 0, 11, 7, 0xe1d5b5).setVisible(false), born: -1000, x: 0, y: 0, driftX: 0, driftY: 0 }));
    const bubble = scene.add.image(0, 0, 'tree-contact-bubble').setOrigin(0.5, 0.5).setScale(0.8).setDepth(100001).setVisible(false);
    const axe = scene.add.image(0, 0, 'tree-contact-axe').setOrigin(0.5, 0.85).setDepth(100002).setVisible(false);
    bubble.texture.setFilter(Phaser.Textures.FilterMode.NEAREST); axe.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    return { idleAnimator:new IdleAnimator(), sprite, label, dust, bubble, axe, groundShadow, popup: { target: false, start: 0, from: 0, scale: 0 }, previous: { x: p.x, y: footY }, lastDust: 0, nextDust: 0 };
  }

  static sync(character: Character, visual: ReturnType<typeof CharacterRenderer.create>, time = 0) {
    const p = worldToIso(character.worldX, character.worldY);
    const footY = p.y + 16;
    visual.groundShadow.setPosition(p.x, footY - 1);
    const touching = (character.treeContactUntil ?? 0) > time;
    const headY = footY - CHARACTER_ASSETS.height * CHARACTER_ASSETS.originY - 4;
    const popup = visual.popup;
    if (touching !== popup.target) {
      popup.from = popup.scale; popup.start = time; popup.target = touching;
    }
    const progress = Math.min(1, Math.max(0, (time - popup.start) / (popup.target ? 160 : 130)));
    const eased = popup.target ? 1 - Math.pow(1 - progress, 3) : progress * progress;
    popup.scale = popup.from + ((popup.target ? 1 : 0) - popup.from) * eased;
    const centerY = headY - 16 + Math.sin(time / 1000 * Math.PI) * 1.5;
    const visible = popup.scale > 0.001;
    visual.bubble.setPosition(p.x, centerY).setScale(0.8 * popup.scale).setVisible(visible);
    const phase = Math.floor(time / 110) % 4;
    visual.axe.setPosition(p.x, centerY + [0, -1, -2, -1][phase] * popup.scale)
      .setRotation([-0.35, -0.1, 0.35, -0.1][phase]).setScale(popup.scale).setVisible(visible);
    const running = character.state === 'run';
    const direction = character.direction;
    const idle = visual.idleAnimator.select(character.state ?? 'idle', direction, time);
    // Keep the footprint on the ground; only its spread/strength follows body motion.
    let shadowWidth = 36, shadowHeight = 13, shadowAlpha = 1;
    if (idle?.kind === 'idle') {
      const breath = (1 - Math.cos((Math.floor(time / MITO_ANIMATION.breathe.frameMs) % MITO_ANIMATION.breathe.frames) / MITO_ANIMATION.breathe.frames * Math.PI * 2)) / 2;
      shadowWidth += breath * 2; shadowHeight += breath;
      shadowAlpha = 1 - breath * 0.06;
    } else if (idle?.kind === 'idle_2') {
      const frame = Number(idle.texture.split('-').pop());
      const lift = (1 - Math.cos(frame / MITO_ANIMATION.smile.frames * Math.PI * 2)) / 2;
      shadowWidth += lift * 2; shadowHeight += lift;
      shadowAlpha = 1 - lift * 0.08;
    } else if (running) {
      const lift = [0, 0.5, 1, 0.5][Math.floor(time / MITO_ANIMATION.run.frameMs) % MITO_ANIMATION.run.frames];
      shadowWidth -= lift * 5; shadowHeight -= lift * 2;
      shadowAlpha = 1 - lift * 0.22;
    } else if (character.state === 'walk') {
      const lift = (1 - Math.cos(time / 90 * 2)) / 2;
      shadowWidth -= lift; shadowAlpha = 1 - lift * 0.04;
    }
    visual.groundShadow.setDisplaySize(shadowWidth, shadowHeight).setAlpha(shadowAlpha);
    const texture = idle?.texture ?? (running ? `mito-run-${direction}-${Math.floor(time / MITO_ANIMATION.run.frameMs) % MITO_ANIMATION.run.frames}` : 'mito-idle-' + direction);
    visual.sprite.setPosition(p.x, footY).setDepth(footY).setTexture(texture).setDisplaySize(CHARACTER_ASSETS.width, CHARACTER_ASSETS.height);
    const dx = p.x - visual.previous.x, dy = footY - visual.previous.y;
    const distance = Math.hypot(dx, dy);
    if (running && distance > 0.001 && time - visual.lastDust >= 40) {
      const particle = visual.dust[visual.nextDust++ % visual.dust.length];
      particle.born = time;
      const side = visual.nextDust % 2 ? 1 : -1;
      particle.x = p.x - dx / distance * 25 - dy / distance * side * 5;
      particle.y = footY - dy / distance * 25 + dx / distance * side * 5;
      particle.driftX = -dx / distance * 5;
      particle.driftY = -dy / distance * 5 - 3;
      particle.image.setPosition(particle.x, particle.y).setDepth(particle.y + 1).setVisible(true);
      visual.lastDust = time;
    }
    for (const particle of visual.dust) {
      const age = (time - particle.born) / 260;
      if (age >= 1) particle.image.setVisible(false);
      else particle.image.setPosition(particle.x + particle.driftX * age, particle.y + particle.driftY * age).setAlpha(0.48 * (1 - age)).setScale(0.7 + age * 0.6);
    }
    visual.previous.x = p.x; visual.previous.y = footY;
    // Temporary walking motion using the same eight replaceable images.
    visual.sprite.setRotation(character.state === 'walk' ? Math.sin(time / 90) * 0.035 : 0);
    visual.label.setPosition(p.x, footY + 12).setText(character.profile?.name ?? character.id);
  }
}
