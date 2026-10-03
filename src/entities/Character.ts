export const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export type Direction = typeof DIRECTIONS[number];
export interface Character { id: string; worldX: number; worldY: number; direction: Direction }
