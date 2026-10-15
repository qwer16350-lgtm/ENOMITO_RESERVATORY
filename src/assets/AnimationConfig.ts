// Runtime animation contract; keep exported frame counts in sync with asset generation.
export const MITO_ANIMATION = {
 breathe: { frames: 48, frameMs: 80 },
 blink: { frames: 4, frameMs: 70, intervalMs: 3000, intervalJitterMs: 4000 },
 smile: { frames: 24, durationMs: 2400, transitionMs: 360, transitionFrameMs: 120,
   intervalMs: 12000, intervalJitterMs: 12000, close: [0,2,1], open: [1,2,0] },
 run: { frames: 4, frameMs: 75 },
} as const;
