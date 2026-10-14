import Phaser from 'phaser';
// Shared daylight palette: light arrives from upper-left; shadows fall lower-right.
export const WORLD_LIGHT = { tint: 0xf3f1e8, shadow: 0x142b28, castAlpha: 0.36, contactAlpha: 0.39 };
export function createContactShadow(scene: Phaser.Scene) {
  if (scene.textures.exists('ground-contact-shadow')) return;
  const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 32;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#142b28';
  for (const [rx, ry, alpha] of [[30, 12, 0.18], [23, 9, 0.27], [15, 6, 0.45]]) {
    context.globalAlpha = alpha; context.beginPath(); context.ellipse(32, 16, rx, ry, 0, 0, Math.PI * 2); context.fill();
  }
  scene.textures.addCanvas('ground-contact-shadow', canvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
}
export function createTreeShadow(scene: Phaser.Scene, source: HTMLCanvasElement, kind: number, frame?: number, mirror=false) {
  const key = `tree-ground-shadow-${kind}${frame === undefined ? "" : "-" + frame}${mirror?"-mirror":""}`;
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(source.width + source.height * 0.45 + 4);
  canvas.height = Math.ceil(source.height * 0.24 + 4);
  const context = canvas.getContext('2d')!;
  context.imageSmoothingEnabled = false;
  context.setTransform(1, 0, -0.45, -0.24, source.height * 0.45 + 2, source.height * 0.24 + 2);
  if(mirror){context.translate(source.width,0);context.scale(-1,1);}
  context.drawImage(source, 0, 0);
  context.resetTransform(); context.globalCompositeOperation = 'source-in';
  context.fillStyle = '#142b28'; context.fillRect(0, 0, canvas.width, canvas.height);
  scene.textures.addCanvas(key, canvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
}



