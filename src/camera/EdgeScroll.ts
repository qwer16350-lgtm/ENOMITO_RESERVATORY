// CSS pixels keep the activation band consistent when the canvas is scaled.
export function edgeScroll(x: number, y: number, width: number, height: number) {
  if (x < 0 || y < 0 || x > width || y > height) return { x: 0, y: 0 };
  const band = Math.min(40, width / 4, height / 4);
  const axis = (p: number, size: number) => p < band ? -(1 - p / band) : p > size - band ? 1 - (size - p) / band : 0;
  const dx = axis(x, width), dy = axis(y, height);
  const length = Math.max(1, Math.hypot(dx, dy));
  return { x: dx / length, y: dy / length };
}
