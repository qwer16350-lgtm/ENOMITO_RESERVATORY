const files = import.meta.glob('../../assets/objects/nature/trees/wood-animation/tree-*-wood-*.png', { eager: true, query: '?url&no-inline', import: 'default' }) as Record<string, string>;
export const WOOD_ANIMATION = Object.entries(files).flatMap(([path, url]) => {
  const match = path.match(/tree-(\d)-wood-(\d+)\.png$/);
  return match ? [{ kind: Number(match[1]), frame: Number(match[2]), url }] : [];
});
